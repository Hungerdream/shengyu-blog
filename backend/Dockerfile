# ---- 构建阶段 ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production

# ---- 运行阶段 ----
FROM node:20-alpine
WORKDIR /app

# 安装 wget（用于健康检查）
RUN apk add --no-cache wget

# 只复制生产依赖
COPY --from=builder /app/node_modules ./node_modules
COPY src/ ./src/
COPY package.json ./

# 非 root 用户运行（安全最佳实践）
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3000
CMD ["node", "src/index.js"]
