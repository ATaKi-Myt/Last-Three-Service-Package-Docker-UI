# Last_Three_Service_Package_Docker_UI

一个用于从 GitHub 获取 Docker Compose YAML 文件、编辑并部署容器的 Web 界面。

## 功能特点

- 从 GitHub 获取 YAML 文件（支持公共和私有仓库）
- 在线编辑 YAML 文件内容
- 通过 Docker 守护进程部署容器
- 实时显示部署日志
- 响应式设计，适配各种屏幕尺寸

## 技术栈

- 后端：Node.js + Express
- 前端：HTML + Tailwind CSS + JavaScript
- 容器化：Docker

## 部署说明

### 前置条件

- 已安装 Docker 和 Docker Compose
- 有可用的 GitHub 仓库，包含 Docker Compose YAML 文件

### docker 命令行部署

#### 拉取镜像

```bash
docker pull lastthree/last-three-service-package-docker-ui:v1.0
```

#### 部署容器

```bash
docker run -d \
  -p 3000:3000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v ${you_host_path}:/app/data \
  lastthree/last-three-service-package-docker-ui:v1.0
```

### docker-compose 部署

```yml
version: '3'

services:
  last-three-service-package-docker-ui:
    image: lastthree/last-three-service-package-docker-ui:v1.0
    container_name: last-three-service-package-docker-ui
    ports:
      - "3000:3000"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ${you_host_path}:/app/data
    restart: unless-stopped
    network_mode: bridge
```

打开浏览器访问 `http://localhost:3000`

## 使用方法

1. 在配置页面填写 GitHub 仓库信息
2. 点击"获取 YAML 文件"按钮
3. 在编辑器中查看或修改 YAML 内容（可选）
4. 点击"部署"按钮创建容器
5. 在日志面板查看部署进度和结果
