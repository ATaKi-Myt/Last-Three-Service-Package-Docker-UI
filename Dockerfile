# 使用 Node.js 18 Alpine 基础镜像
FROM node:18-alpine

# 安装 Docker CLI
RUN apk add --no-cache docker-cli

# 安装 Python3 和 pip（用于虚拟环境）
RUN apk add --no-cache python3 py3-pip

# 创建并激活 Python 虚拟环境
RUN python3 -m venv /app/venv && \
    echo 'source /app/venv/bin/activate' >> /app/.bashrc && \
    . /app/venv/bin/activate

# 在虚拟环境中安装 docker-compose（避免影响系统环境）
RUN . /app/venv/bin/activate && \
    pip3 install docker-compose --no-cache-dir

# 设置工作目录
WORKDIR /app

# 复制并安装 Node.js 依赖
COPY package*.json ./
RUN npm install --production

# 复制项目代码
COPY . .

# 暴露端口
EXPOSE 3000

# 启动时激活虚拟环境
CMD [". /app/venv/bin/activate && node server.js"]
