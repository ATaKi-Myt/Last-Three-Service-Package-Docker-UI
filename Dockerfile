# 使用 Node.js 18 作为基础镜像，包含最新的安全更新
FROM node:18-alpine

# 安装 Docker CLI 和 Docker Compose
RUN apk add --no-cache docker-cli
RUN apk add --no-cache py3-pip && pip3 install docker-compose

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install --production

# 复制应用代码
COPY . .

# 创建数据目录
RUN mkdir -p /app/data

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["node", "server.js"]    
