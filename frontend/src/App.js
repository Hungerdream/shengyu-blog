import React, { useState, useEffect, useCallback, useRef } from 'react';

// ── 全局样式 ─────────────────────────────────────────────────────
const G = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{
      --ink:#0f0e0d;--paper:#f5f0e8;--cream:#ede8dc;
      --accent:#c8392b;--gold:#c4972a;--muted:#7a7268;--border:#c8c0b0;
      --ok:#16a34a;--err:#dc2626;--warn:#d97706;
    }
    html{scroll-behavior:smooth}
    body{background:var(--paper);color:var(--ink);font-family:'DM Sans',sans-serif;min-height:100vh}
    ::selection{background:var(--accent);color:#fff}
    ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:var(--cream)}::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px}
    @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes toast-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
    .fu{animation:fadeUp .55s ease both}
    .fu1{animation-delay:.08s}.fu2{animation-delay:.16s}.fu3{animation-delay:.24s}.fu4{animation-delay:.32s}
    .nav-a:hover{color:var(--accent)!important}
    .card-hover:hover{border-color:var(--ink)!important;background:var(--cream)!important}
    .pt{transition:color .2s}.card-hover:hover .pt{color:var(--accent)}

    /* inputs */
    .inp{width:100%;padding:10px 14px;border:1px solid var(--border);border-radius:8px;font-family:'DM Sans',sans-serif;font-size:14px;background:var(--paper);color:var(--ink);outline:none;transition:border-color .2s}
    .inp:focus{border-color:var(--ink)}
    .inp-title{font-family:'Playfair Display',serif;font-size:26px;font-weight:700;border:none;border-bottom:2px solid var(--border);border-radius:0;padding:8px 0;background:transparent;width:100%;outline:none;color:var(--ink)}
    .inp-title:focus{border-bottom-color:var(--ink)}
    textarea.inp{resize:vertical;line-height:1.7}

    /* buttons */
    .btn{padding:9px 18px;border:none;border-radius:8px;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;transition:all .18s;display:inline-flex;align-items:center;gap:6px;white-space:nowrap}
    .btn:disabled{opacity:.5;cursor:not-allowed}
    .btn-ink{background:var(--ink);color:var(--paper)}.btn-ink:hover:not(:disabled){background:#2a2826}
    .btn-red{background:var(--accent);color:#fff}.btn-red:hover:not(:disabled){background:#a82f23}
    .btn-ghost{background:transparent;border:1px solid var(--border);color:var(--muted)}.btn-ghost:hover:not(:disabled){border-color:var(--ink);color:var(--ink)}
    .btn-danger{background:#fee2e2;color:var(--err)}.btn-danger:hover:not(:disabled){background:var(--err);color:#fff}
    .btn-ok{background:#dcfce7;color:var(--ok)}.btn-ok:hover:not(:disabled){background:var(--ok);color:#fff}
    .btn-sm{padding:5px 12px;font-size:12px;border-radius:6px}

    /* badges */
    .badge{display:inline-block;padding:2px 9px;border-radius:20px;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.08em}
    .b-pub{background:#dcfce7;color:var(--ok)}.b-draft{background:#f1f5f9;color:#64748b}.b-feat{background:#fef3c7;color:#92400e}
    .b-admin{background:#ede9fe;color:#7c3aed}.b-editor{background:#f1f5f9;color:#64748b}

    /* md body */
    .md h1,.md h2,.md h3{font-family:'Playfair Display',serif;margin:1.5em 0 .5em;line-height:1.2}
    .md h1{font-size:2rem}.md h2{font-size:1.5rem;border-bottom:1px solid var(--border);padding-bottom:.35em}.md h3{font-size:1.2rem}
    .md p{line-height:1.85;margin-bottom:1em;color:#2c2a28}
    .md a{color:var(--accent);text-decoration:underline}
    .md ul,.md ol{margin:1em 0 1em 1.6em;line-height:1.8}.md li{margin:.25em 0}
    .md blockquote{border-left:3px solid var(--accent);margin:1.5em 0;padding:.75em 1.2em;background:var(--cream);color:var(--muted);font-style:italic}
    .md code{font-family:'DM Mono',monospace;font-size:.87em;background:var(--cream);padding:.15em .4em;border-radius:3px}
    .md pre{background:var(--ink);color:#e8e4dc;padding:1.2em 1.5em;border-radius:8px;overflow-x:auto;margin:1.5em 0}
    .md pre code{background:none;padding:0;font-size:.84em}
    .md hr{border:none;border-top:1px solid var(--border);margin:2em 0}
    .md strong{font-weight:600}
    .md img{max-width:100%;border-radius:8px;margin:1em 0}
    .md table{width:100%;border-collapse:collapse;margin:1.5em 0}
    .md th{background:var(--cream);padding:.6em 1em;text-align:left;border:1px solid var(--border);font-weight:500}
    .md td{padding:.6em 1em;border:1px solid var(--border)}

    /* editor */
    .md-ed{font-family:'DM Mono',monospace;font-size:13.5px;line-height:1.75;resize:vertical;min-height:420px}

    /* cover upload zone */
    .drop-zone{border:2px dashed var(--border);border-radius:10px;padding:28px;text-align:center;cursor:pointer;transition:all .2s;background:var(--cream)}
    .drop-zone:hover,.drop-zone.over{border-color:var(--accent);background:#fdf0ee}

    /* toast */
    .toast{position:fixed;bottom:28px;right:28px;z-index:9999;padding:12px 20px;border-radius:10px;font-size:14px;font-family:'DM Sans',sans-serif;box-shadow:0 4px 20px rgba(0,0,0,.15);animation:toast-in .3s ease;display:flex;align-items:center;gap:8px}
    .toast-ok{background:#dcfce7;color:var(--ok);border:1px solid #86efac}
    .toast-err{background:#fee2e2;color:var(--err);border:1px solid #fca5a5}

    /* tab bar */
    .tab-bar{display:flex;border-bottom:1px solid var(--border);margin-bottom:16px}
    .tab{padding:8px 20px;background:none;border:none;cursor:pointer;font-family:'DM Mono',monospace;font-size:12px;letter-spacing:.08em;color:var(--muted);border-bottom:2px solid transparent;margin-bottom:-1px;transition:all .2s}
    .tab.active{color:var(--ink);border-bottom-color:var(--ink)}

    /* modal */
    .overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:500;display:flex;align-items:center;justify-content:center;padding:20px}
    .modal{background:var(--paper);border-radius:12px;padding:32px;width:100%;max-width:440px;box-shadow:0 20px 60px rgba(0,0,0,.25)}

    /* table rows */
    .tr:hover{background:var(--cream)!important}
  `}</style>
);

// ── Markdown 渲染 ────────────────────────────────────────────────
function md(text) {
  if (!text) return '';
  return text
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/^### (.+)$/gm,'<h3>$1</h3>')
    .replace(/^## (.+)$/gm,'<h2>$1</h2>')
    .replace(/^# (.+)$/gm,'<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,'<em>$1</em>')
    .replace(/```[\w]*\n([\s\S]*?)```/g,(_,c)=>`<pre><code>${c.trim()}</code></pre>`)
    .replace(/`([^`\n]+)`/g,'<code>$1</code>')
    .replace(/^> (.+)$/gm,'<blockquote>$1</blockquote>')
    .replace(/^---$/gm,'<hr>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g,'<img src="$2" alt="$1">')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" target="_blank">$1</a>')
    .replace(/^- (.+)$/gm,'<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>)/g,'<ul>$1</ul>')
    .replace(/<\/ul>\s*<ul>/g,'')
    .replace(/^(?!<[hupbli])(.+)$/gm, l=>l.trim()?`<p>${l}</p>`:'');
}

// ── API ──────────────────────────────────────────────────────────
const API = '/api';
function tok() { return localStorage.getItem('jwt')||''; }
async function api(path, opts={}) {
  const res = await fetch(API+path, {
    headers:{'Content-Type':'application/json','Authorization':`Bearer ${tok()}`,...(opts.headers||{})},
    ...opts,
  });
  if (res.status===204) return null;
  const j = await res.json().catch(()=>({}));
  if (!res.ok) throw new Error(j.error||'请求失败');
  return j;
}
async function uploadFile(file) {
  const fd = new FormData(); fd.append('image', file);
  const res = await fetch(API+'/admin/upload',{method:'POST',headers:{'Authorization':`Bearer ${tok()}`},body:fd});
  if (!res.ok) throw new Error('上传失败');
  return res.json();
}

// ── Toast ─────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  useEffect(()=>{ const t=setTimeout(onClose,3000); return()=>clearTimeout(t); },[onClose]);
  return <div className={`toast toast-${type}`}>{type==='ok'?'✓':'✕'} {msg}</div>;
}
function useToast() {
  const [t,setT]=useState(null);
  const show=(msg,type='ok')=>setT({msg,type,key:Date.now()});
  const el=t&&<Toast key={t.key} msg={t.msg} type={t.type} onClose={()=>setT(null)}/>;
  return [show,el];
}

// ── Header ───────────────────────────────────────────────────────
function Header({page,setPage,user,onLogout}) {
  const [sc,setSc]=useState(false);
  useEffect(()=>{const f=()=>setSc(window.scrollY>40);window.addEventListener('scroll',f);return()=>window.removeEventListener('scroll',f);},[]);
  return (
    <header style={{position:'sticky',top:0,zIndex:200,background:sc?'rgba(245,240,232,.94)':'var(--paper)',backdropFilter:sc?'blur(12px)':'none',borderBottom:`1px solid ${sc?'var(--border)':'transparent'}`,transition:'all .3s',padding:'0 clamp(20px,5vw,80px)'}}>
      <div style={{maxWidth:1100,margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'space-between',height:64}}>
        <div onClick={()=>setPage({v:'home'})} style={{cursor:'pointer',display:'flex',alignItems:'baseline',gap:8}}>
          <span style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:900,letterSpacing:'-.02em'}}>声屿笺</span>
          <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:'var(--accent)',letterSpacing:'.1em'}}>BLOG</span>
        </div>
        <nav style={{display:'flex',gap:20,alignItems:'center'}}>
          {[['文章','home'],['关于','about']].map(([l,v])=>(
            <a key={v} className="nav-a" href="#" onClick={e=>{e.preventDefault();setPage({v})}}
              style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:500,color:page.v===v?'var(--accent)':'var(--muted)',textDecoration:'none'}}>
              {l}
            </a>
          ))}
          {user && (
            <button className="btn btn-ghost" style={{fontSize:13,padding:'6px 14px'}} onClick={()=>setPage({v:'admin'})}>后台 @ {user.display_name}</button>
          )}
        </nav>
      </div>
    </header>
  );
}

// ── Hero ─────────────────────────────────────────────────────────
function Hero({count}) {
  return (
    <section style={{maxWidth:1100,margin:'0 auto',padding:'clamp(48px,8vw,88px) clamp(20px,5vw,80px) 0'}}>
      <div className="fu" style={{display:'flex',alignItems:'center',gap:16,marginBottom:28}}>
        <div style={{width:40,height:2,background:'var(--accent)'}}/>
        <span style={{fontFamily:"'DM Mono',monospace",fontSize:11,letterSpacing:'.2em',color:'var(--muted)',textTransform:'uppercase'}}>个人技术博客</span>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:40,alignItems:'end'}}>
        <div>
          <h1 className="fu fu1" style={{fontFamily:"'Playfair Display',serif",fontSize:'clamp(44px,7vw,80px)',fontWeight:900,lineHeight:1.0,letterSpacing:'-.03em'}}>
            写下每一次<br/><em style={{color:'var(--accent)',fontStyle:'italic'}}>折腾</em>的痕迹
          </h1>
          <p className="fu fu2" style={{marginTop:20,maxWidth:460,fontFamily:"'DM Sans',sans-serif",fontSize:16,lineHeight:1.75,color:'var(--muted)',fontWeight:300}}>
            云原生 · 全栈开发 · 工具链 · 偶尔的生活碎片。记录真实的学习路径，不只有答案，更有问题本身。
          </p>
        </div>
        <div className="fu fu3" style={{display:'flex',flexDirection:'column',gap:20,borderLeft:'1px solid var(--border)',paddingLeft:36,minWidth:120}}>
          {[{n:count,l:'篇文章'},{n:'∞',l:'个坑'}].map(x=>(
            <div key={x.l}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:44,fontWeight:900,lineHeight:1}}>{x.n}</div>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:'var(--muted)',letterSpacing:'.1em',marginTop:4}}>{x.l}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="fu fu4" style={{marginTop:48,display:'grid',gridTemplateColumns:'repeat(3,1fr)',borderTop:'1px solid var(--border)',borderBottom:'1px solid var(--border)'}}>
        {['Docker & K8s','Node.js & React','服务器运维'].map((t,i)=>(
          <div key={t} style={{padding:'12px 0',borderRight:i<2?'1px solid var(--border)':'none',paddingLeft:i>0?20:0,fontFamily:"'DM Mono',monospace",fontSize:12,color:'var(--muted)',letterSpacing:'.06em'}}>{t}</div>
        ))}
      </div>
    </section>
  );
}

// ── 文章卡 ───────────────────────────────────────────────────────
function FeaturedCard({post,onClick}) {
  return (
    <article className="fu fu1" onClick={onClick} style={{cursor:'pointer',display:'grid',gridTemplateColumns:'1fr 1fr',border:'1px solid var(--border)',background:'var(--cream)',overflow:'hidden',marginBottom:2}}>
      <div style={{padding:'clamp(28px,4vw,48px)'}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
          <span style={{background:'var(--accent)',color:'#fff',fontFamily:"'DM Mono',monospace",fontSize:10,padding:'3px 10px',letterSpacing:'.15em'}}>FEATURED</span>
          <span style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:'var(--muted)'}}>{post.category}</span>
        </div>
        <h2 className="pt" style={{fontFamily:"'Playfair Display',serif",fontSize:'clamp(22px,2.8vw,32px)',fontWeight:700,lineHeight:1.25,letterSpacing:'-.02em',marginBottom:14}}>{post.title}</h2>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:15,lineHeight:1.75,color:'var(--muted)',marginBottom:28}}>{post.excerpt}</p>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <span style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:'var(--muted)'}}>{new Date(post.created_at).toLocaleDateString('zh-CN')} · {post.read_time}</span>
          <span style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:'var(--accent)',letterSpacing:'.08em'}}>阅读全文 →</span>
        </div>
      </div>
      <div style={{background:'var(--ink)',display:'flex',alignItems:'center',justifyContent:'center',minHeight:260,position:'relative',overflow:'hidden'}}>
        {post.cover_url
          ? <img src={post.cover_url} alt="" style={{width:'100%',height:'100%',objectFit:'cover',position:'absolute',inset:0,opacity:.6}}/>
          : null
        }
        <svg width="100%" height="100%" style={{position:'absolute',opacity:.08}}><defs><pattern id="g" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0L0 0 0 40" fill="none" stroke="#f5f0e8" strokeWidth=".5"/></pattern></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>
        <div style={{textAlign:'center',position:'relative',zIndex:1}}>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:80,lineHeight:1,color:'rgba(245,240,232,.1)',fontWeight:900}}>01</div>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:'rgba(245,240,232,.45)',letterSpacing:'.18em',marginTop:6}}>{post.category?.toUpperCase()}</div>
        </div>
      </div>
    </article>
  );
}

function PostCard({post,index,onClick}) {
  return (
    <article className={`card-hover fu fu${Math.min(index+1,4)}`} onClick={onClick} style={{cursor:'pointer',padding:'clamp(20px,3vw,30px)',border:'1px solid var(--border)',background:'var(--paper)',display:'flex',flexDirection:'column',gap:10,transition:'all .2s'}}>
      {post.cover_url && <img src={post.cover_url} alt="" style={{width:'100%',height:140,objectFit:'cover',borderRadius:6,marginBottom:4}}/>}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:'var(--muted)',letterSpacing:'.14em',textTransform:'uppercase'}}>{post.category}</span>
        {post.tag&&<span style={{fontFamily:"'DM Mono',monospace",fontSize:10,padding:'2px 8px',border:'1px solid var(--border)',color:'var(--muted)'}}>{post.tag}</span>}
      </div>
      <h3 className="pt" style={{fontFamily:"'Playfair Display',serif",fontSize:'clamp(17px,2vw,21px)',fontWeight:700,lineHeight:1.3,letterSpacing:'-.01em'}}>{post.title}</h3>
      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,lineHeight:1.7,color:'var(--muted)',flexGrow:1}}>{post.excerpt}</p>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',paddingTop:10,borderTop:'1px solid var(--border)'}}>
        <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:'var(--muted)'}}>{new Date(post.created_at).toLocaleDateString('zh-CN')} · {post.read_time}</span>
        <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:'var(--accent)'}}>READ →</span>
      </div>
    </article>
  );
}

// ── 首页 ─────────────────────────────────────────────────────────
function HomePage({setPage}) {
  const [posts,setPosts]=useState([]);
  const [cats,setCats]=useState([]);
  const [tag,setTag]=useState('全部');
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    Promise.all([api('/posts').catch(()=>[]),api('/categories').catch(()=>[])])
      .then(([p,c])=>{setPosts(p);setCats(['全部',...c.map(x=>x.name)]);setLoading(false);});
  },[]);

  const filtered=tag==='全部'?posts:posts.filter(p=>p.category===tag);
  const feat=filtered.find(p=>p.featured);
  const rest=filtered.filter(p=>!p.featured);

  return (
    <div>
      <Hero count={posts.length}/>
      <div style={{maxWidth:1100,margin:'0 auto',padding:'clamp(36px,6vw,64px) clamp(20px,5vw,80px)',display:'grid',gridTemplateColumns:'1fr 272px',gap:48}}>
        <div>
          {loading
            ? <div style={{textAlign:'center',padding:64,color:'var(--muted)',fontFamily:"'DM Mono',monospace",fontSize:13}}>加载中…</div>
            : <>
                {feat&&tag==='全部'&&<FeaturedCard post={feat} onClick={()=>setPage({v:'post',id:feat.id})}/>}
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(255px,1fr))',gap:2,marginTop:feat&&tag==='全部'?2:0}}>
                  {rest.map((p,i)=><PostCard key={p.id} post={p} index={i} onClick={()=>setPage({v:'post',id:p.id})}/>)}
                  {filtered.length===0&&<div style={{padding:48,textAlign:'center',border:'1px solid var(--border)',fontFamily:"'DM Mono',monospace",fontSize:13,color:'var(--muted)',gridColumn:'1/-1'}}>该分类暂无文章</div>}
                </div>
              </>
          }
        </div>
        {/* 侧边栏 */}
        <aside style={{display:'flex',flexDirection:'column',gap:32}}>
          <div className="fu" style={{padding:24,background:'var(--ink)',color:'var(--paper)'}}>
            <div style={{width:50,height:50,borderRadius:'50%',background:'var(--accent)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:900,marginBottom:14}}>声</div>
            <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,marginBottom:8}}>Hi，我是声屿</h3>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,lineHeight:1.7,color:'rgba(245,240,232,.65)'}}>写字的人，造代码的人。热衷于把复杂的基础设施问题变成可以讲清楚的文字。</p>
          </div>
          <div className="fu fu2">
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:'.2em',color:'var(--muted)',marginBottom:12,textTransform:'uppercase'}}>— 分类</div>
            {cats.map(c=>(
              <button key={c} onClick={()=>setTag(c)} style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:tag===c?500:400,textAlign:'left',padding:'9px 0',background:'none',border:'none',borderBottom:'1px solid var(--border)',color:tag===c?'var(--accent)':'var(--ink)',cursor:'pointer',display:'flex',justifyContent:'space-between',width:'100%',transition:'color .2s'}}>
                <span>{c}</span>{tag===c&&<span style={{fontSize:10,color:'var(--accent)'}}>●</span>}
              </button>
            ))}
          </div>
          <div className="fu fu3">
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:'.2em',color:'var(--muted)',marginBottom:12,textTransform:'uppercase'}}>— 近期</div>
            {posts.slice(0,4).map(p=>(
              <div key={p.id} onClick={()=>setPage({v:'post',id:p.id})} style={{padding:'10px 0',borderBottom:'1px solid var(--border)',cursor:'pointer'}}>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:'var(--gold)',marginBottom:3}}>{new Date(p.created_at).toLocaleDateString('zh-CN')}</div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:14,lineHeight:1.4,color:'var(--ink)'}}>{p.title}</div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

// ── 文章详情 ─────────────────────────────────────────────────────
function PostPage({id,setPage}) {
  const [post,setPost]=useState(null);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    api(`/posts/${id}`).then(p=>{setPost(p);setLoading(false);}).catch(()=>setLoading(false));
  },[id]);

  if (loading) return <div style={{textAlign:'center',padding:80,color:'var(--muted)'}}>加载中…</div>;
  if (!post) return <div style={{textAlign:'center',padding:80,color:'var(--muted)'}}>文章不存在</div>;

  return (
    <article style={{maxWidth:740,margin:'0 auto',padding:'clamp(36px,6vw,64px) clamp(20px,5vw,40px)'}}>
      <button className="btn btn-ghost btn-sm" onClick={()=>setPage({v:'home'})} style={{marginBottom:36}}>← 返回</button>
      {post.cover_url&&<img src={post.cover_url} alt="" style={{width:'100%',height:320,objectFit:'cover',borderRadius:10,marginBottom:32}}/>}
      <div className="fu" style={{display:'flex',alignItems:'center',gap:10,marginBottom:18}}>
        <span style={{background:'var(--accent)',color:'#fff',fontFamily:"'DM Mono',monospace",fontSize:10,padding:'3px 10px',letterSpacing:'.12em'}}>{post.category?.toUpperCase()}</span>
        {post.tag&&<span style={{fontFamily:"'DM Mono',monospace",fontSize:10,padding:'3px 8px',border:'1px solid var(--border)',color:'var(--muted)'}}>{post.tag}</span>}
      </div>
      <h1 className="fu fu1" style={{fontFamily:"'Playfair Display',serif",fontSize:'clamp(28px,5vw,50px)',fontWeight:900,lineHeight:1.1,letterSpacing:'-.02em',marginBottom:18}}>{post.title}</h1>
      {post.excerpt&&<p className="fu fu2" style={{fontFamily:"'DM Sans',sans-serif",fontSize:17,lineHeight:1.75,color:'var(--muted)',marginBottom:24,paddingBottom:24,borderBottom:'1px solid var(--border)'}}>{post.excerpt}</p>}
      <div className="fu fu2" style={{display:'flex',gap:16,marginBottom:40,fontFamily:"'DM Mono',monospace",fontSize:12,color:'var(--muted)'}}>
        <span>{new Date(post.created_at).toLocaleDateString('zh-CN',{year:'numeric',month:'long',day:'numeric'})}</span>
        <span>·</span><span>{post.read_time} 阅读</span>
        {post.author&&<><span>·</span><span>{post.author}</span></>}
      </div>
      <div className="md fu fu3" dangerouslySetInnerHTML={{__html:md(post.content)}}/>
      <div style={{marginTop:56,paddingTop:28,borderTop:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <button className="btn btn-ghost btn-sm" onClick={()=>setPage({v:'home'})}>← 返回列表</button>
        <span style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:'var(--muted)'}}>emdream.icu</span>
      </div>
    </article>
  );
}

// ── 登录页 ───────────────────────────────────────────────────────
function LoginPage({onLogin,setPage}) {
  const [f,setF]=useState({u:'',p:''});
  const [err,setErr]=useState('');
  const [loading,setLoading]=useState(false);
  const go=async()=>{
    if(!f.u||!f.p)return setErr('请填写用户名和密码');
    setLoading(true);setErr('');
    try{
      const r=await api('/auth/login',{method:'POST',body:JSON.stringify({username:f.u,password:f.p})});
      localStorage.setItem('jwt',r.token);
      onLogin(r.user);setPage({v:'admin'});
    }catch(e){setErr(e.message);}
    finally{setLoading(false);}
  };
  return (
    <div style={{maxWidth:380,margin:'80px auto',padding:'0 20px'}}>
      <div style={{padding:40,border:'1px solid var(--border)',background:'var(--cream)'}}>
        <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:700,marginBottom:6}}>后台登录</h2>
        <p style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:'var(--muted)',marginBottom:28,letterSpacing:'.08em'}}>声屿笺管理后台</p>
        <input className="inp" placeholder="用户名" value={f.u} onChange={e=>setF({...f,u:e.target.value})} style={{marginBottom:10}}/>
        <input className="inp" type="password" placeholder="密码" value={f.p} onChange={e=>setF({...f,p:e.target.value})} onKeyDown={e=>e.key==='Enter'&&go()} style={{marginBottom:err?8:16}}/>
        {err&&<p style={{color:'var(--err)',fontSize:13,marginBottom:12}}>{err}</p>}
        <button className="btn btn-ink" style={{width:'100%',justifyContent:'center'}} onClick={go} disabled={loading}>{loading?'登录中…':'进入后台'}</button>
        <button className="btn btn-ghost" style={{width:'100%',justifyContent:'center',marginTop:10}} onClick={()=>setPage({v:'home'})}>← 返回博客</button>
        <p style={{marginTop:20,fontFamily:"'DM Mono',monospace",fontSize:11,color:'var(--muted)',textAlign:'center'}}>默认账号 admin / admin123</p>
      </div>
    </div>
  );
}

// ── 封面上传组件 ─────────────────────────────────────────────────
function CoverUpload({value,onChange}) {
  const [dragging,setDragging]=useState(false);
  const [uploading,setUploading]=useState(false);
  const ref=useRef();
  const doUpload=async(file)=>{
    if(!file)return;
    setUploading(true);
    try{const r=await uploadFile(file);onChange(r.url);}
    catch(e){alert(e.message);}
    finally{setUploading(false);}
  };
  return (
    <div>
      <div className={`drop-zone${dragging?' over':''}`}
        onClick={()=>ref.current.click()}
        onDragOver={e=>{e.preventDefault();setDragging(true);}}
        onDragLeave={()=>setDragging(false)}
        onDrop={e=>{e.preventDefault();setDragging(false);doUpload(e.dataTransfer.files[0]);}}>
        {uploading
          ? <p style={{color:'var(--muted)',fontSize:13}}>上传中…</p>
          : value
            ? <img src={value} alt="" style={{maxHeight:160,maxWidth:'100%',borderRadius:6,margin:'0 auto',display:'block'}}/>
            : <div>
                <p style={{fontSize:24,marginBottom:8}}>🖼️</p>
                <p style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:'var(--muted)'}}>点击或拖拽上传封面图</p>
                <p style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:'var(--border)',marginTop:4}}>JPG / PNG / WebP · 最大 5MB</p>
              </div>
        }
      </div>
      {value&&<button className="btn btn-ghost btn-sm" style={{marginTop:8,color:'var(--err)'}} onClick={()=>onChange('')}>✕ 移除封面</button>}
      <input ref={ref} type="file" accept="image/*" style={{display:'none'}} onChange={e=>doUpload(e.target.files[0])}/>
    </div>
  );
}

// ── 文章编辑器 ───────────────────────────────────────────────────
function Editor({postId,onSave,onCancel,toast}) {
  const isNew=!postId;
  const [f,setF]=useState({title:'',excerpt:'',content:'',cover_url:'',category:'云原生',tag:'',status:'draft',featured:false,read_time:'5 分钟'});
  const [tab,setTab]=useState('edit');
  const [saving,setSaving]=useState(false);
  const [cats,setCats]=useState([]);
  const set=(k,v)=>setF(x=>({...x,[k]:v}));

  useEffect(()=>{
    api('/categories').then(c=>setCats(c.map(x=>x.name))).catch(()=>{});
    if(!isNew){
      api(`/admin/posts/${postId}`).then(p=>setF({
        title:p.title,excerpt:p.excerpt||'',content:p.content||'',cover_url:p.cover_url||'',
        category:p.category,tag:p.tag||'',status:p.status,featured:p.featured,read_time:p.read_time
      })).catch(e=>toast(e.message,'err'));
    }
  },[postId]);

  const save=async(status)=>{
    if(!f.title.trim())return toast('标题不能为空','err');
    setSaving(true);
    try{
      const data={...f,status:status||f.status};
      if(isNew) await api('/admin/posts',{method:'POST',body:JSON.stringify(data)});
      else await api(`/admin/posts/${postId}`,{method:'PUT',body:JSON.stringify(data)});
      toast(status==='published'?'发布成功！':'草稿已保存');
      onSave();
    }catch(e){toast(e.message,'err');}
    finally{setSaving(false);}
  };

  const lbl={fontFamily:"'DM Mono',monospace",fontSize:11,letterSpacing:'.1em',color:'var(--muted)',display:'block',marginBottom:6};

  return (
    <div style={{background:'var(--paper)',minHeight:'100vh'}}>
      {/* 顶栏 */}
      <div style={{position:'sticky',top:64,zIndex:100,background:'var(--cream)',borderBottom:'1px solid var(--border)',padding:'12px clamp(20px,4vw,48px)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <button className="btn btn-ghost btn-sm" onClick={onCancel}>← 返回</button>
          <span style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700}}>{isNew?'写新文章':'编辑文章'}</span>
        </div>
        <div style={{display:'flex',gap:8}}>
          <button className="btn btn-ghost" onClick={()=>save('draft')} disabled={saving}>存草稿</button>
          <button className="btn btn-red" onClick={()=>save('published')} disabled={saving}>{saving?'处理中…':'发布文章'}</button>
        </div>
      </div>

      <div style={{maxWidth:960,margin:'0 auto',padding:'28px clamp(20px,4vw,48px)'}}>
        {/* 标题 */}
        <input className="inp-title" placeholder="文章标题…" value={f.title} onChange={e=>set('title',e.target.value)} style={{marginBottom:24}}/>

        {/* 封面 */}
        <div style={{marginBottom:20}}>
          <label style={lbl}>封面图片</label>
          <CoverUpload value={f.cover_url} onChange={v=>set('cover_url',v)}/>
        </div>

        {/* 摘要 */}
        <div style={{marginBottom:20}}>
          <label style={lbl}>摘要</label>
          <textarea className="inp" rows={3} placeholder="一句话描述这篇文章…" value={f.excerpt} onChange={e=>set('excerpt',e.target.value)}/>
        </div>

        {/* 元信息 */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr auto',gap:12,marginBottom:20,alignItems:'end'}}>
          <div>
            <label style={lbl}>分类</label>
            <select className="inp" value={f.category} onChange={e=>set('category',e.target.value)}>
              {cats.map(c=><option key={c}>{c}</option>)}
              <option value={f.category}>{f.category}</option>
            </select>
          </div>
          <div>
            <label style={lbl}>标签</label>
            <input className="inp" value={f.tag} onChange={e=>set('tag',e.target.value)} placeholder="教程、踩坑…"/>
          </div>
          <div>
            <label style={lbl}>阅读时长</label>
            <input className="inp" value={f.read_time} onChange={e=>set('read_time',e.target.value)} placeholder="5 分钟"/>
          </div>
          <div>
            <label style={lbl}>状态</label>
            <select className="inp" value={f.status} onChange={e=>set('status',e.target.value)}>
              <option value="draft">草稿</option>
              <option value="published">已发布</option>
            </select>
          </div>
          <label style={{display:'flex',alignItems:'center',gap:6,cursor:'pointer',paddingBottom:10,whiteSpace:'nowrap'}}>
            <input type="checkbox" checked={f.featured} onChange={e=>set('featured',e.target.checked)}/>
            <span style={{fontSize:13,color:'var(--muted)'}}>⭐ 精选</span>
          </label>
        </div>

        {/* 编辑器 */}
        <div className="tab-bar">
          {[['edit','✏️ 编辑'],['preview','👁 预览']].map(([k,l])=>(
            <button key={k} className={`tab${tab===k?' active':''}`} onClick={()=>setTab(k)}>{l}</button>
          ))}
        </div>
        {tab==='edit'
          ? <textarea className="inp md-ed" value={f.content} onChange={e=>set('content',e.target.value)}
              placeholder={"# 标题\n\n正文内容，支持 **Markdown** 语法...\n\n```javascript\n// 代码块\nconsole.log('Hello')\n```"}/>
          : <div style={{minHeight:420,padding:24,border:'1px solid var(--border)',borderRadius:8,background:'var(--cream)'}}>
              {f.content
                ? <div className="md" dangerouslySetInnerHTML={{__html:md(f.content)}}/>
                : <p style={{color:'var(--muted)',fontFamily:"'DM Mono',monospace",fontSize:13}}>还没有内容…</p>
              }
            </div>
        }
      </div>
    </div>
  );
}

// ── 分类管理 tab ─────────────────────────────────────────────────
function CatsTab({toast}) {
  const [cats,setCats]=useState([]);
  const [newName,setNewName]=useState('');
  const [loading,setLoading]=useState(true);
  const [delId,setDelId]=useState(null);

  const load=useCallback(()=>{
    api('/admin/categories').then(c=>{setCats(c);setLoading(false);}).catch(()=>setLoading(false));
  },[]);
  useEffect(()=>load(),[load]);

  const add=async()=>{
    if(!newName.trim())return;
    try{const r=await api('/admin/categories',{method:'POST',body:JSON.stringify({name:newName.trim()})});setCats(r);setNewName('');toast('分类已添加');}
    catch(e){toast(e.message,'err');}
  };
  const del=async(id)=>{
    try{await api(`/admin/categories/${id}`,{method:'DELETE'});load();toast('分类已删除');setDelId(null);}
    catch(e){toast(e.message,'err');}
  };

  return (
    <div>
      <div style={{display:'flex',gap:10,marginBottom:24}}>
        <input className="inp" value={newName} onChange={e=>setNewName(e.target.value)} placeholder="新分类名…" onKeyDown={e=>e.key==='Enter'&&add()} style={{maxWidth:260}}/>
        <button className="btn btn-ink" onClick={add}>+ 添加</button>
      </div>
      {loading?<p style={{color:'var(--muted)'}}>加载中…</p>:
        <div style={{border:'1px solid var(--border)',overflow:'hidden'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr auto auto auto',gap:16,padding:'10px 20px',background:'var(--cream)',borderBottom:'1px solid var(--border)'}}>
            {['分类名','文章数','',''].map((h,i)=><span key={i} style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:'var(--muted)'}}>{h}</span>)}
          </div>
          {cats.map((c,i)=>(
            <div key={c.id} className="tr" style={{display:'grid',gridTemplateColumns:'1fr auto auto auto',gap:16,padding:'12px 20px',borderBottom:i<cats.length-1?'1px solid var(--border)':'none',alignItems:'center',background:'var(--paper)'}}>
              <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:15}}>{c.name}</span>
              <span style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:'var(--muted)'}}>{c.post_count} 篇</span>
              <span style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:'var(--muted)'}}>{c.slug}</span>
              {delId===c.id
                ? <div style={{display:'flex',gap:6}}>
                    <button className="btn btn-danger btn-sm" onClick={()=>del(c.id)}>确认</button>
                    <button className="btn btn-ghost btn-sm" onClick={()=>setDelId(null)}>取消</button>
                  </div>
                : <button className="btn btn-ghost btn-sm" style={{color:'var(--err)'}} onClick={()=>setDelId(c.id)}>删除</button>
              }
            </div>
          ))}
        </div>
      }
    </div>
  );
}

// ── 用户管理 tab ─────────────────────────────────────────────────
function UsersTab({currentUser,toast}) {
  const [users,setUsers]=useState([]);
  const [showAdd,setShowAdd]=useState(false);
  const [f,setF]=useState({username:'',password:'',display_name:'',role:'editor'});
  const [pwModal,setPwModal]=useState(false);
  const [pwF,setPwF]=useState({old:'',n1:'',n2:''});
  const [delId,setDelId]=useState(null);

  const load=useCallback(()=>{api('/admin/users').then(setUsers).catch(()=>{});},[]);
  useEffect(()=>load(),[load]);

  const addUser=async()=>{
    if(!f.username||!f.password)return toast('请填写用户名和密码','err');
    try{const r=await api('/admin/users',{method:'POST',body:JSON.stringify(f)});setUsers(r);setShowAdd(false);setF({username:'',password:'',display_name:'',role:'editor'});toast('账号已创建');}
    catch(e){toast(e.message,'err');}
  };
  const delUser=async(id)=>{
    try{await api(`/admin/users/${id}`,{method:'DELETE'});load();toast('账号已删除');setDelId(null);}
    catch(e){toast(e.message,'err');}
  };
  const changePw=async()=>{
    if(pwF.n1!==pwF.n2)return toast('两次密码不一致','err');
    try{await api('/auth/change-password',{method:'POST',body:JSON.stringify({old_password:pwF.old,new_password:pwF.n1})});toast('密码已修改');setPwModal(false);setPwF({old:'',n1:'',n2:''});}
    catch(e){toast(e.message,'err');}
  };

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:20}}>
        <button className="btn btn-ink" onClick={()=>setShowAdd(!showAdd)}>+ 新建账号</button>
        <button className="btn btn-ghost" onClick={()=>setPwModal(true)}>🔑 修改我的密码</button>
      </div>

      {showAdd&&(
        <div style={{padding:24,border:'1px solid var(--border)',background:'var(--cream)',borderRadius:8,marginBottom:20}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr auto',gap:12,alignItems:'end'}}>
            <div><label style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:'var(--muted)',display:'block',marginBottom:6}}>用户名</label>
              <input className="inp" value={f.username} onChange={e=>setF({...f,username:e.target.value})} placeholder="username"/></div>
            <div><label style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:'var(--muted)',display:'block',marginBottom:6}}>密码</label>
              <input className="inp" type="password" value={f.password} onChange={e=>setF({...f,password:e.target.value})} placeholder="至少 6 位"/></div>
            <div><label style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:'var(--muted)',display:'block',marginBottom:6}}>显示名</label>
              <input className="inp" value={f.display_name} onChange={e=>setF({...f,display_name:e.target.value})} placeholder="昵称"/></div>
            <div><label style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:'var(--muted)',display:'block',marginBottom:6}}>角色</label>
              <select className="inp" value={f.role} onChange={e=>setF({...f,role:e.target.value})}>
                <option value="editor">编辑</option><option value="admin">管理员</option>
              </select></div>
          </div>
          <div style={{display:'flex',gap:8,marginTop:16}}>
            <button className="btn btn-ink btn-sm" onClick={addUser}>创建</button>
            <button className="btn btn-ghost btn-sm" onClick={()=>setShowAdd(false)}>取消</button>
          </div>
        </div>
      )}

      <div style={{border:'1px solid var(--border)',overflow:'hidden'}}>
        {users.map((u,i)=>(
          <div key={u.id} className="tr" style={{display:'grid',gridTemplateColumns:'auto 1fr auto auto auto',gap:16,padding:'14px 20px',borderBottom:i<users.length-1?'1px solid var(--border)':'none',alignItems:'center',background:'var(--paper)'}}>
            <div style={{width:36,height:36,borderRadius:'50%',background:'var(--ink)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--paper)',fontFamily:"'Playfair Display',serif",fontWeight:900,fontSize:14}}>
              {(u.display_name||u.username)[0].toUpperCase()}
            </div>
            <div>
              <div style={{fontWeight:500,fontSize:15}}>{u.display_name||u.username}</div>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:'var(--muted)'}}>{u.username}</div>
            </div>
            <span className={`badge b-${u.role}`}>{u.role==='admin'?'管理员':'编辑'}</span>
            <span style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:'var(--muted)'}}>{new Date(u.created_at).toLocaleDateString('zh-CN')}</span>
            {u.id===currentUser?.id
              ? <span style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:'var(--muted)'}}>（我）</span>
              : delId===u.id
                ? <div style={{display:'flex',gap:6}}><button className="btn btn-danger btn-sm" onClick={()=>delUser(u.id)}>确认</button><button className="btn btn-ghost btn-sm" onClick={()=>setDelId(null)}>取消</button></div>
                : <button className="btn btn-ghost btn-sm" style={{color:'var(--err)'}} onClick={()=>setDelId(u.id)}>删除</button>
            }
          </div>
        ))}
      </div>

      {/* 修改密码 modal */}
      {pwModal&&(
        <div className="overlay" onClick={()=>setPwModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,marginBottom:20}}>修改密码</h3>
            {[{k:'old',l:'当前密码'},{k:'n1',l:'新密码'},{k:'n2',l:'确认新密码'}].map(x=>(
              <div key={x.k} style={{marginBottom:12}}>
                <label style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:'var(--muted)',display:'block',marginBottom:5}}>{x.l}</label>
                <input className="inp" type="password" value={pwF[x.k]} onChange={e=>setPwF({...pwF,[x.k]:e.target.value})}/>
              </div>
            ))}
            <div style={{display:'flex',gap:8,marginTop:20}}>
              <button className="btn btn-ink" onClick={changePw}>确认修改</button>
              <button className="btn btn-ghost" onClick={()=>setPwModal(false)}>取消</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── 后台主页 ─────────────────────────────────────────────────────
function AdminPage({setPage,user,onLogout}) {
  const [tab,setTab]=useState('posts');
  const [editing,setEditing]=useState(null);
  const [posts,setPosts]=useState([]);
  const [loading,setLoading]=useState(true);
  const [delId,setDelId]=useState(null);
  const [toast,toastEl]=useToast();

  const loadPosts=useCallback(()=>{
    setLoading(true);
    api('/admin/posts').then(p=>{setPosts(p);setLoading(false);}).catch(()=>setLoading(false));
  },[]);
  useEffect(()=>{loadPosts();},[loadPosts]);

  const del=async(id)=>{
    try{await api(`/admin/posts/${id}`,{method:'DELETE'});loadPosts();toast('文章已删除');setDelId(null);}
    catch(e){toast(e.message,'err');}
  };
  const logout=()=>{localStorage.removeItem('jwt');onLogout();setPage({v:'home'});};

  if(editing!==null){
    return <Editor postId={editing==='new'?null:editing} toast={toast} onSave={()=>{setEditing(null);loadPosts();}} onCancel={()=>setEditing(null)}/>;
  }

  const pub=posts.filter(p=>p.status==='published').length;
  const draft=posts.filter(p=>p.status==='draft').length;

  return (
    <div style={{maxWidth:1040,margin:'0 auto',padding:'36px clamp(20px,4vw,48px)'}}>
      {toastEl}
      {/* 顶部 */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:32}}>
        <div>
          <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:28,fontWeight:900}}>管理后台</h1>
          <p style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:'var(--muted)',marginTop:4}}>你好，{user?.display_name||user?.username} · 声屿笺</p>
        </div>
        <div style={{display:'flex',gap:10}}>
          <button className="btn btn-ghost" style={{fontSize:13}} onClick={()=>setPage({v:'home'})}>← 前台</button>
          {tab==='posts'&&<button className="btn btn-red" onClick={()=>setEditing('new')}>✏️ 写文章</button>}
          <button className="btn btn-ghost" style={{fontSize:13}} onClick={logout}>退出</button>
        </div>
      </div>

      {/* 统计卡 */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:28}}>
        {[{l:'全部文章',v:posts.length,c:'var(--ink)'},{l:'已发布',v:pub,c:'var(--ok)'},{l:'草稿',v:draft,c:'var(--muted)'}].map(s=>(
          <div key={s.l} style={{padding:'18px 22px',border:'1px solid var(--border)',background:'var(--cream)'}}>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:36,fontWeight:900,color:s.c}}>{s.v}</div>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:'var(--muted)',marginTop:4}}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Tab 导航 */}
      <div className="tab-bar">
        {[['posts','📝 文章'],['cats','🗂 分类'],['users','👥 账号']].map(([k,l])=>(
          user?.role==='admin'||k==='posts'
            ? <button key={k} className={`tab${tab===k?' active':''}`} onClick={()=>setTab(k)}>{l}</button>
            : null
        ))}
      </div>

      {/* 文章列表 */}
      {tab==='posts'&&(
        loading
          ? <div style={{textAlign:'center',padding:48,color:'var(--muted)'}}>加载中…</div>
          : <div style={{border:'1px solid var(--border)',overflow:'hidden'}}>
              <div style={{display:'grid',gridTemplateColumns:'auto 1fr auto auto auto auto',gap:12,padding:'10px 20px',background:'var(--cream)',borderBottom:'1px solid var(--border)'}}>
                {['封面','标题','分类','状态','日期','操作'].map(h=>(
                  <span key={h} style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:'var(--muted)'}}>{h}</span>
                ))}
              </div>
              {posts.length===0
                ? <div style={{padding:48,textAlign:'center',fontFamily:"'DM Mono',monospace",fontSize:13,color:'var(--muted)'}}>还没有文章，点击「写文章」开始！</div>
                : posts.map((p,i)=>(
                    <div key={p.id} className="tr" style={{display:'grid',gridTemplateColumns:'auto 1fr auto auto auto auto',gap:12,padding:'12px 20px',borderBottom:i<posts.length-1?'1px solid var(--border)':'none',alignItems:'center',background:'var(--paper)'}}>
                      <div style={{width:48,height:36,borderRadius:4,background:'var(--cream)',overflow:'hidden',flexShrink:0}}>
                        {p.cover_url
                          ? <img src={p.cover_url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                          : <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>📄</div>
                        }
                      </div>
                      <div>
                        <div style={{fontWeight:500,fontSize:14,marginBottom:3}}>{p.title}</div>
                        <div style={{display:'flex',gap:6,alignItems:'center'}}>
                          {p.featured&&<span className="badge b-feat">精选</span>}
                          {p.tag&&<span style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:'var(--muted)'}}>{p.tag}</span>}
                        </div>
                      </div>
                      <span style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:'var(--muted)'}}>{p.category}</span>
                      <span className={`badge b-${p.status}`}>{p.status==='published'?'已发布':'草稿'}</span>
                      <span style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:'var(--muted)',whiteSpace:'nowrap'}}>{new Date(p.created_at).toLocaleDateString('zh-CN')}</span>
                      <div style={{display:'flex',gap:6}}>
                        <button className="btn btn-ghost btn-sm" onClick={()=>setEditing(p.id)}>编辑</button>
                        {delId===p.id
                          ? <><button className="btn btn-danger btn-sm" onClick={()=>del(p.id)}>确认</button><button className="btn btn-ghost btn-sm" onClick={()=>setDelId(null)}>取消</button></>
                          : <button className="btn btn-ghost btn-sm" style={{color:'var(--err)'}} onClick={()=>setDelId(p.id)}>删除</button>
                        }
                      </div>
                    </div>
                  ))
              }
            </div>
      )}

      {tab==='cats'&&<CatsTab toast={toast}/>}
      {tab==='users'&&user?.role==='admin'&&<UsersTab currentUser={user} toast={toast}/>}
    </div>
  );
}

// ── 关于页 ───────────────────────────────────────────────────────
function AboutPage() {
  return (
    <div style={{maxWidth:680,margin:'0 auto',padding:'clamp(48px,8vw,80px) clamp(20px,5vw,40px)'}}>
      <h1 className="fu" style={{fontFamily:"'Playfair Display',serif",fontSize:'clamp(36px,6vw,54px)',fontWeight:900,lineHeight:1.1,marginBottom:24}}>关于声屿笺</h1>
      <div className="md fu fu1" dangerouslySetInnerHTML={{__html:md(`## 这是什么

声屿笺是一个个人技术博客，记录一个开发者真实的学习路径。

内容涵盖：

- **云原生**：Docker、Kubernetes、服务网格
- **全栈开发**：Node.js、React、PostgreSQL  
- **工具链**：Nginx、CI/CD、监控告警
- **偶尔的生活碎片**

## 关于博主

独立开发者，云原生爱好者。喜欢把复杂的技术拆解成可以讲清楚的文字。

## 联系

- 域名：[emdream.icu](https://emdream.icu)
`)}}/>
    </div>
  );
}

// ── 根组件 ───────────────────────────────────────────────────────
export default function App() {
  const [page,setPage]=useState({v:'home'});
  const [user,setUser]=useState(()=>{
    const t=localStorage.getItem('jwt');
    if(!t)return null;
    try{ const p=JSON.parse(atob(t.split('.')[1])); return {id:p.id,username:p.username,display_name:p.display_name,role:p.role}; }
    catch{return null;}
  });

  // 监听隐藏入口：在地址栏输入 /#/secret-admin 进入后台
  useEffect(()=>{
    const check = () => {
      if (window.location.hash === '#/secret-admin') {
        window.location.hash = '';
        setPage({v: user ? 'admin' : 'login'});
      }
    };
    check();
    window.addEventListener('hashchange', check);
    return () => window.removeEventListener('hashchange', check);
  }, [user]);

  useEffect(()=>window.scrollTo(0,0),[page]);

  const handleLogin=(u)=>setUser(u);
  const handleLogout=()=>setUser(null);

  return (
    <>
      <G/>
      <Header page={page} setPage={setPage} user={user} onLogout={handleLogout}/>
      {page.v==='home'  && <HomePage setPage={setPage}/>}
      {page.v==='post'  && <PostPage id={page.id} setPage={setPage}/>}
      {page.v==='about' && <AboutPage/>}
      {page.v==='login' && <LoginPage onLogin={handleLogin} setPage={setPage}/>}
      {page.v==='admin' && (user
        ? <AdminPage setPage={setPage} user={user} onLogout={handleLogout}/>
        : <LoginPage onLogin={handleLogin} setPage={setPage}/>
      )}
      {page.v!=='admin'&&(
        <footer style={{borderTop:'1px solid var(--border)',padding:'28px clamp(20px,5vw,80px)',marginTop:40}}>
          <div style={{maxWidth:1100,margin:'0 auto',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:900}}>声屿笺</div>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:'var(--muted)'}}>© 2026 · emdream.icu · React + Docker</div>
          </div>
        </footer>
      )}
    </>
  );
}
