# 使用 Node.js 18 Alpine 基础镜像（已包含最小化的 Node 环境）
FROM node:18-alpine

# 安装 Docker CLI（用于与 Docker 守护进程通信）
RUN apk add --no-cache docker-cli

# ✅ 直接安装 Alpine 官方提供的 docker-compose 包（无需 Python/pip）
RUN apk add --no-cache docker-compose

# 设置工作目录
WORKDIR /app

# 复制并安装 Node.js 依赖（仅安装生产环境所需依赖）
COPY package*.json ./
RUN npm install --production --no-audit --loglevel=error

# 复制项目代码
COPY . .

# 暴露应用端口
EXPOSE 3000

# 启动 Node.js 服务
CMD ["node", "server.js"]
