const express   = require('express');
const cors      = require('cors');
const bcrypt    = require('bcryptjs');
const jwt       = require('jsonwebtoken');
const multer    = require('multer');
const path      = require('path');
const fs        = require('fs');
const { Pool }  = require('pg');

const app  = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'shengyu_jwt_secret_change_me';

// ── 数据库 ──────────────────────────────────────────────────────
const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 5432,
  database: process.env.DB_NAME     || 'appdb',
  user:     process.env.DB_USER     || 'appuser',
  password: process.env.DB_PASSWORD || 'apppassword',
});
pool.connect((err,client,release) => {
  if (err) console.error('❌ DB error:', err.message);
  else { console.log('✅ DB connected'); release(); }
});

// ── 图片上传目录 ─────────────────────────────────────────────────
const UPLOAD_DIR = '/app/uploads';
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename:    (req, file, cb) => {
    const ext  = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, name);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (/^image\//.test(file.mimetype)) cb(null, true);
    else cb(new Error('只允许上传图片'));
  },
});

app.use(cors());
app.use(express.json());

// ── 静态文件：上传的图片 ─────────────────────────────────────────
app.use('/uploads', express.static(UPLOAD_DIR));

// ── JWT 鉴权中间件 ───────────────────────────────────────────────
function auth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : '';
  if (!token) return res.status(401).json({ error: '未登录' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'token 已过期，请重新登录' });
  }
}

// 仅管理员
function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ error: '权限不足' });
  next();
}

// ════════════════════════════════════════════════════════════════
// 公开接口
// ════════════════════════════════════════════════════════════════

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// 已发布文章列表
app.get('/api/posts', async (req, res) => {
  const { category } = req.query;
  let q = `SELECT p.id, p.title, p.excerpt, p.cover_url, p.category, p.tag,
                  p.featured, p.read_time, p.created_at, u.display_name AS author
           FROM posts p LEFT JOIN users u ON p.author_id = u.id
           WHERE p.status = 'published'`;
  const params = [];
  if (category && category !== '全部') { params.push(category); q += ` AND p.category=$${params.length}`; }
  q += ' ORDER BY p.featured DESC, p.created_at DESC';
  try { res.json((await pool.query(q, params)).rows); }
  catch { res.status(500).json({ error: '服务器错误' }); }
});

// 单篇已发布文章
app.get('/api/posts/:id', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT p.*, u.display_name AS author FROM posts p
       LEFT JOIN users u ON p.author_id=u.id
       WHERE p.id=$1 AND p.status='published'`, [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: '文章不存在' });
    res.json(r.rows[0]);
  } catch { res.status(500).json({ error: '服务器错误' }); }
});

// 分类列表
app.get('/api/categories', async (req, res) => {
  try {
    const r = await pool.query('SELECT name, slug FROM categories ORDER BY id');
    res.json(r.rows);
  } catch { res.status(500).json({ error: '服务器错误' }); }
});

// ════════════════════════════════════════════════════════════════
// 认证接口
// ════════════════════════════════════════════════════════════════

// 登录
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: '请填写用户名和密码' });
  try {
    const r = await pool.query('SELECT * FROM users WHERE username=$1', [username]);
    if (!r.rows.length) return res.status(401).json({ error: '用户名或密码错误' });
    const user = r.rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: '用户名或密码错误' });
    const token = jwt.sign(
      { id: user.id, username: user.username, display_name: user.display_name, role: user.role },
      JWT_SECRET, { expiresIn: '7d' }
    );
    res.json({ token, user: { id:user.id, username:user.username, display_name:user.display_name, role:user.role } });
  } catch { res.status(500).json({ error: '服务器错误' }); }
});

// 修改自己的密码
app.post('/api/auth/change-password', auth, async (req, res) => {
  const { old_password, new_password } = req.body;
  if (!old_password || !new_password) return res.status(400).json({ error: '请填写完整' });
  if (new_password.length < 6) return res.status(400).json({ error: '新密码至少 6 位' });
  try {
    const r = await pool.query('SELECT password_hash FROM users WHERE id=$1', [req.user.id]);
    if (!await bcrypt.compare(old_password, r.rows[0].password_hash))
      return res.status(401).json({ error: '旧密码错误' });
    const hash = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE users SET password_hash=$1 WHERE id=$2', [hash, req.user.id]);
    res.json({ ok: true });
  } catch { res.status(500).json({ error: '服务器错误' }); }
});

// ════════════════════════════════════════════════════════════════
// 后台：文章管理
// ════════════════════════════════════════════════════════════════

app.get('/api/admin/posts', auth, async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT p.id, p.title, p.category, p.tag, p.status, p.featured, p.cover_url,
              p.read_time, p.created_at, p.updated_at, u.display_name AS author
       FROM posts p LEFT JOIN users u ON p.author_id=u.id
       ORDER BY p.created_at DESC`);
    res.json(r.rows);
  } catch { res.status(500).json({ error: '服务器错误' }); }
});

app.get('/api/admin/posts/:id', auth, async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM posts WHERE id=$1', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: '不存在' });
    res.json(r.rows[0]);
  } catch { res.status(500).json({ error: '服务器错误' }); }
});

app.post('/api/admin/posts', auth, async (req, res) => {
  const { title, excerpt, content, cover_url, category, tag, status, featured, read_time } = req.body;
  if (!title) return res.status(400).json({ error: '标题不能为空' });
  try {
    const r = await pool.query(
      `INSERT INTO posts (title,excerpt,content,cover_url,category,tag,status,featured,read_time,author_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [title, excerpt||'', content||'', cover_url||'', category||'未分类',
       tag||'', status||'draft', featured||false, read_time||'5 分钟', req.user.id]);
    res.status(201).json(r.rows[0]);
  } catch { res.status(500).json({ error: '服务器错误' }); }
});

app.put('/api/admin/posts/:id', auth, async (req, res) => {
  const { title, excerpt, content, cover_url, category, tag, status, featured, read_time } = req.body;
  try {
    const r = await pool.query(
      `UPDATE posts SET title=$1,excerpt=$2,content=$3,cover_url=$4,category=$5,
       tag=$6,status=$7,featured=$8,read_time=$9,updated_at=NOW() WHERE id=$10 RETURNING *`,
      [title, excerpt, content, cover_url||'', category, tag, status, featured, read_time, req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: '不存在' });
    res.json(r.rows[0]);
  } catch { res.status(500).json({ error: '服务器错误' }); }
});

app.delete('/api/admin/posts/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM posts WHERE id=$1', [req.params.id]);
    res.status(204).send();
  } catch { res.status(500).json({ error: '服务器错误' }); }
});

// ════════════════════════════════════════════════════════════════
// 后台：图片上传
// ════════════════════════════════════════════════════════════════

app.post('/api/admin/upload', auth, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: '没有文件' });
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});

// ════════════════════════════════════════════════════════════════
// 后台：分类管理（仅 admin）
// ════════════════════════════════════════════════════════════════

app.get('/api/admin/categories', auth, async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT c.*, COUNT(p.id)::int AS post_count
       FROM categories c LEFT JOIN posts p ON p.category=c.name
       GROUP BY c.id ORDER BY c.id`);
    res.json(r.rows);
  } catch { res.status(500).json({ error: '服务器错误' }); }
});

app.post('/api/admin/categories', auth, adminOnly, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: '分类名不能为空' });
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') || `cat-${Date.now()}`;
  try {
    await pool.query('INSERT INTO categories (name,slug) VALUES ($1,$2) ON CONFLICT DO NOTHING', [name, slug]);
    const r = await pool.query(`SELECT c.*,COUNT(p.id)::int AS post_count FROM categories c LEFT JOIN posts p ON p.category=c.name GROUP BY c.id ORDER BY c.id`);
    res.json(r.rows);
  } catch { res.status(500).json({ error: '服务器错误' }); }
});

app.delete('/api/admin/categories/:id', auth, adminOnly, async (req, res) => {
  try {
    const cat = await pool.query('SELECT name FROM categories WHERE id=$1', [req.params.id]);
    if (!cat.rows.length) return res.status(404).json({ error: '不存在' });
    const { name } = cat.rows[0];
    const cnt = await pool.query("SELECT COUNT(*) FROM posts WHERE category=$1 AND status='published'", [name]);
    if (parseInt(cnt.rows[0].count) > 0) return res.status(400).json({ error: '该分类下有已发布文章，无法删除' });
    await pool.query('DELETE FROM categories WHERE id=$1', [req.params.id]);
    res.status(204).send();
  } catch { res.status(500).json({ error: '服务器错误' }); }
});

// ════════════════════════════════════════════════════════════════
// 后台：用户管理（仅 admin）
// ════════════════════════════════════════════════════════════════

app.get('/api/admin/users', auth, adminOnly, async (req, res) => {
  try {
    const r = await pool.query('SELECT id,username,display_name,role,created_at FROM users ORDER BY id');
    res.json(r.rows);
  } catch { res.status(500).json({ error: '服务器错误' }); }
});

app.post('/api/admin/users', auth, adminOnly, async (req, res) => {
  const { username, password, display_name, role } = req.body;
  if (!username || !password) return res.status(400).json({ error: '请填写用户名和密码' });
  if (password.length < 6) return res.status(400).json({ error: '密码至少 6 位' });
  try {
    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (username,password_hash,display_name,role) VALUES ($1,$2,$3,$4)',
      [username, hash, display_name||username, role||'editor']);
    const r = await pool.query('SELECT id,username,display_name,role,created_at FROM users ORDER BY id');
    res.json(r.rows);
  } catch (e) {
    if (e.code === '23505') return res.status(400).json({ error: '用户名已存在' });
    res.status(500).json({ error: '服务器错误' });
  }
});

app.delete('/api/admin/users/:id', auth, adminOnly, async (req, res) => {
  if (parseInt(req.params.id) === req.user.id) return res.status(400).json({ error: '不能删除自己' });
  try {
    await pool.query('DELETE FROM users WHERE id=$1', [req.params.id]);
    res.status(204).send();
  } catch { res.status(500).json({ error: '服务器错误' }); }
});

// ── 启动：动态创建初始管理员账号 ──────────────────────────────────
async function ensureAdmin() {
  const INIT_USER = process.env.INIT_ADMIN_USER || 'admin';
  const INIT_PASS = process.env.INIT_ADMIN_PASS || 'admin123';
  try {
    const r = await pool.query('SELECT id FROM users WHERE username=$1', [INIT_USER]);
    if (r.rows.length === 0) {
      const hash = await bcrypt.hash(INIT_PASS, 10);
      await pool.query(
        'INSERT INTO users (username, password_hash, display_name, role) VALUES ($1,$2,$3,$4)',
        [INIT_USER, hash, '管理员', 'admin']
      );
      console.log(`✅ 初始账号已创建：${INIT_USER} / ${INIT_PASS}`);
    } else {
      console.log(`ℹ️  管理员账号已存在：${INIT_USER}`);
    }
  } catch (e) {
    console.error('⚠️  创建初始账号失败:', e.message);
  }
}

async function start() {
  // 等待数据库就绪（最多重试 10 次）
  for (let i = 0; i < 10; i++) {
    try {
      await pool.query('SELECT 1');
      break;
    } catch {
      console.log(`⏳ 等待数据库就绪… (${i+1}/10)`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  await ensureAdmin();
  app.listen(PORT, () => console.log(`🚀 Server on :${PORT}`));
}

start();
