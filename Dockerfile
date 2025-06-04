# 使用 Node.js 18 Alpine 基础镜像
FROM node:18-alpine

# 安装 Docker CLI
RUN apk add --no-cache docker-cli

# 通过 APK 安装 Docker Compose
RUN apk add --no-cache docker-compose

# 设置工作目录
WORKDIR /app

# 复制依赖文件并安装
COPY package*.json ./
RUN npm install --production

# 复制项目文件
COPY . .

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["node", "server.js"]
