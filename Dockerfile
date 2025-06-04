# 改用 Ubuntu 基础镜像
FROM node:18

# 安装 Docker 和 docker-compose（Ubuntu 环境）
RUN apt-get update && \
    apt-get install -y docker.io python3-pip && \
    pip3 install docker-compose --no-cache-dir && \
    rm -rf /var/lib/apt/lists/*

# 其他步骤与原 Dockerfile 一致
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
