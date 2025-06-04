# 使用 Node.js 18 Alpine 基础镜像，包含最新安全更新
FROM node:18-alpine

# 安装 Docker CLI 和 Docker Compose（通过 APK 安装）
RUN apk add --no-cache docker-cli docker-compose

# 设置工作目录
WORKDIR /app

# 复制依赖文件并安装
COPY package*.json ./
RUN npm install --production

# 复制应用代码
COPY . .

# 创建数据目录
RUN mkdir -p /app/data

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["node", "server.js"]
