-- ── 用户表 ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    username      VARCHAR(50)  UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name  VARCHAR(100) DEFAULT '',
    role          VARCHAR(20)  DEFAULT 'editor',
    created_at    TIMESTAMP    DEFAULT NOW()
);

-- ── 分类表 ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(100) UNIQUE NOT NULL,
    slug       VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ── 文章表 ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS posts (
    id          SERIAL PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    excerpt     TEXT         DEFAULT '',
    content     TEXT         DEFAULT '',
    cover_url   VARCHAR(500) DEFAULT '',
    category    VARCHAR(100) DEFAULT '未分类',
    tag         VARCHAR(50)  DEFAULT '',
    status      VARCHAR(20)  DEFAULT 'draft',
    featured    BOOLEAN      DEFAULT FALSE,
    read_time   VARCHAR(20)  DEFAULT '5 分钟',
    author_id   INTEGER      REFERENCES users(id),
    created_at  TIMESTAMP    DEFAULT NOW(),
    updated_at  TIMESTAMP    DEFAULT NOW()
);

-- ── 默认分类 ────────────────────────────────────────────────────
INSERT INTO categories (name, slug) VALUES
    ('云原生',    'cloud-native'),
    ('Kubernetes','kubernetes'),
    ('工具链',    'toolchain'),
    ('技术思考',  'thinking'),
    ('生活',      'life')
ON CONFLICT DO NOTHING;

-- ── 示例文章（无 author_id，启动脚本会处理账号）────────────────
INSERT INTO posts (title, excerpt, content, category, tag, status, featured, read_time)
VALUES
(
  '从零搭建：Docker + K8s 全栈部署实战',
  '将一个 React + Node.js + PostgreSQL 应用完整容器化，理解每一层网络、存储与服务发现背后的原理。',
  '## 前言

容器化不只是把应用打个包，它改变的是你对**基础设施**的思考方式。

## Docker 核心概念

- **镜像（Image）**：只读的模板，用来创建容器
- **容器（Container）**：镜像的运行实例
- **网络（Network）**：容器间通信的桥梁
- **数据卷（Volume）**：持久化存储

## 实战：docker-compose

```yaml
version: "3.8"
services:
  db:
    image: postgres:15-alpine
  backend:
    build: ./backend
  frontend:
    build: ./frontend
  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
```

## 总结

通过这次实战，你应该理解了容器化的核心价值：**环境一致性**和**服务解耦**。',
  '云原生', '实战', 'published', TRUE, '8 分钟'
),
(
  'Nginx 反向代理：我踩过的那些坑',
  '从 proxy_pass 的斜杠陷阱，到 WebSocket 升级头——每一个坑都是一次深夜排障的记忆。',
  '## 斜杠陷阱

```nginx
# 错误：会把 /api/users 转发为 /users
location /api/ {
    proxy_pass http://backend/;
}

# 正确：保留完整路径
location /api/ {
    proxy_pass http://backend;
}
```

## WebSocket 升级头

```nginx
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
```',
  '工具链', '踩坑', 'published', FALSE, '7 分钟'
)
ON CONFLICT DO NOTHING;
