# 声屿笺 · 个人博客系统

> 一个基于 React + Node.js + PostgreSQL 的全栈博客，全部容器化部署，运行在 [emdream.icu](https://emdream.icu)

---

## ✨ 功能特性

- 📖 **博客前台** — 文章列表、分类筛选、文章详情、Markdown 渲染
- ✍️ **管理后台** — Markdown 编辑器、封面图上传、草稿/发布状态管理
- 🔐 **用户系统** — JWT 认证、多账号管理（admin / editor 角色）
- 🗂 **分类管理** — 后台增删分类，首页动态筛选
- 🖼 **图片上传** — 拖拽上传封面图，持久化存储
- 🔒 **HTTPS** — Nginx 反向代理 + SSL 证书，全站强制 HTTPS
- 🐳 **容器化** — 全部服务 Docker Compose 编排，一键启动

---

## 🏗 架构

```
浏览器
  │  :443 HTTPS
  ▼
┌─────────────────────────────────────┐
│          Nginx 反向代理              │
│  /api/*  →  backend:3000            │
│  /*      →  frontend:80             │
│  /uploads → 静态图片文件             │
└────────┬──────────────┬─────────────┘
         │              │
  ┌──────▼──────┐ ┌─────▼──────┐
  │  Node.js    │ │   React    │
  │  Express    │ │   前端     │
  │  :3000      │ │   :80      │
  └──────┬──────┘ └────────────┘
         │
  ┌──────▼──────┐   ┌─────────────┐
  │ PostgreSQL  │   │  uploads/   │
  │  :5432      │   │  图片存储    │
  └─────────────┘   └─────────────┘
```

---

## 📁 目录结构

```
fullstack-app/
├── docker-compose.yml        # 服务编排
├── .env                      # 环境变量（不提交 Git）
├── .gitignore
├── nginx/
│   ├── nginx.conf            # Nginx 反向代理 + HTTPS 配置
│   └── ssl/                  # SSL 证书目录（不提交 Git）
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   ├── init.sql              # 数据库初始化脚本
│   └── src/
│       └── index.js          # Express API 服务
└── frontend/
    ├── Dockerfile
    ├── .dockerignore
    ├── nginx.conf
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── index.js
        └── App.js            # React 主应用
```

---

## 🚀 快速部署

### 前置要求

- 一台云服务器（Ubuntu 20.04+）
- 已安装 Docker 和 Docker Compose
- 一个域名，并完成 DNS A 记录解析到服务器 IP

### 1. 安装 Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER && newgrp docker
```

### 2. 克隆仓库

```bash
git clone https://github.com/你的用户名/shengyu-blog.git
cd shengyu-blog
```

### 3. 配置环境变量

```bash
cp .env.example .env
nano .env
```

```env
# 数据库
POSTGRES_DB=appdb
POSTGRES_USER=appuser
POSTGRES_PASSWORD=your_strong_password

# JWT 密钥（随机字符串，越长越好）
JWT_SECRET=your_random_jwt_secret_here

# 初始管理员账号
INIT_ADMIN_USER=admin
INIT_ADMIN_PASS=your_admin_password
```

### 4. 配置 SSL 证书

将证书文件放入 `nginx/ssl/` 目录：

```
nginx/ssl/
└── emdream.icu_nginx/
    ├── emdream.icu_bundle.crt   # 证书链
    └── emdream.icu.key          # 私钥
```

### 5. 开放防火墙端口

在云服务商控制台安全组中开放：

| 端口 | 协议 | 用途 |
|------|------|------|
| 80   | TCP  | HTTP（自动跳转 HTTPS）|
| 443  | TCP  | HTTPS |

### 6. 一键启动

```bash
docker compose up -d --build
```

启动后访问 `https://你的域名` 即可。

---

## 🔧 常用命令

```bash
# 查看所有服务状态
docker compose ps

# 查看日志
docker compose logs -f backend
docker compose logs -f nginx

# 重启某个服务
docker compose restart backend

# 更新代码后重新部署
git pull
docker compose up -d --build

# 备份数据库
docker compose exec db pg_dump -U appuser appdb > backup_$(date +%Y%m%d).sql

# 进入数据库
docker compose exec db psql -U appuser -d appdb
```

---

## 🔑 后台入口

后台入口不在导航栏，在浏览器地址栏输入：

```
https://emdream.icu/#/secret-admin
```

首次登录后请立即修改密码。

---

## 🛠 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18、Playfair Display 字体 |
| 后端 | Node.js、Express、JWT、Multer |
| 数据库 | PostgreSQL 15 |
| 代理 | Nginx（反向代理 + HTTPS）|
| 容器 | Docker、Docker Compose |

---

## 📡 API 概览

### 公开接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/posts` | 获取已发布文章列表 |
| GET | `/api/posts/:id` | 获取单篇文章 |
| GET | `/api/categories` | 获取分类列表 |
| GET | `/api/health` | 健康检查 |

### 后台接口（需 JWT）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/login` | 登录 |
| GET/POST/PUT/DELETE | `/api/admin/posts` | 文章管理 |
| POST | `/api/admin/upload` | 上传图片 |
| GET/POST/DELETE | `/api/admin/categories` | 分类管理 |
| GET/POST/DELETE | `/api/admin/users` | 用户管理（admin）|

---

## 📋 环境变量说明

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `POSTGRES_DB` | `appdb` | 数据库名 |
| `POSTGRES_USER` | `appuser` | 数据库用户 |
| `POSTGRES_PASSWORD` | — | 数据库密码（必填）|
| `JWT_SECRET` | — | JWT 签名密钥（必填）|
| `INIT_ADMIN_USER` | `admin` | 初始管理员用户名 |
| `INIT_ADMIN_PASS` | `admin123` | 初始管理员密码 |

---

## 📄 License

MIT
