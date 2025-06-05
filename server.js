const express = require('express');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');
const crypto = require('crypto');
const { exec } = require('child_process');
const HttpsProxyAgent = require('https-proxy-agent'); // 引入代理模块

const app = express();
const PORT = 3000;
const HOST_DIR = '/app/data';

// 获取代理配置
const getProxyAgent = () => {
  const proxyEnv = process.env.HTTP_PROXY || process.env.HTTPS_PROXY;
  if (proxyEnv) {
    return new HttpsProxyAgent(proxyEnv);
  }
  return null;
};

// 确保数据目录存在
(async () => {
  try {
    await fs.mkdir(HOST_DIR, { recursive: true });
    console.log('数据目录已创建或已存在');
  } catch (err) {
    console.error('创建数据目录失败:', err);
  }
})();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 设置 CSP 头
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', `
    default-src 'self';
    script-src 'self' 'unsafe-inline';
    style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css;
    img-src 'self' data:;
    font-src 'self' https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/fonts/;
    connect-src 'self' https://raw.githubusercontent.com;
  `.replace(/\s+/g, ' ').trim());
  next();
});

// 获取 YAML 文件
app.post('/api/fetch-yaml', async (req, res) => {
  const { version, projectFolder = 'fnOS', yamlFileName = '1panel.yml', githubToken, proxyIp, proxyPort } = req.body;
  
  try {
    let repoUrl;
    if (version === 'Free') {
      repoUrl = `https://raw.githubusercontent.com/ATaKi-Myt/Last_Three_Service_Package_Free/refs/heads/main/${projectFolder}/${yamlFileName}`;
    } else if (version === 'Pro') {
      repoUrl = `https://raw.githubusercontent.com/ATaKi-Myt/Last_Three_Service_Package_Pro/refs/heads/main/${projectFolder}/${yamlFileName}`;
    } else {
      return res.status(400).json({ error: '无效的版本选择' });
    }
    
    const headers = githubToken ? { 'Authorization': `token ${githubToken}` } : {};
    let agent = getProxyAgent();
    if (proxyIp && proxyPort) {
      agent = new HttpsProxyAgent(`http://${proxyIp}:${proxyPort}`);
    }
    const response = await axios.get(repoUrl, { headers, httpsAgent: agent });
    
    // 保留原始文件名，不添加哈希前缀
    const fileName = yamlFileName;
    const filePath = path.join(HOST_DIR, fileName);
    
    await fs.writeFile(filePath, response.data, 'utf8');
    
    res.json({ fileName, originalName: yamlFileName, content: response.data });
  } catch (error) {
    console.error('获取 YAML 文件失败:', error);
    res.status(500).json({ error: '获取 YAML 文件失败', details: error.message });
  }
});

// 保存 YAML 文件
app.post('/api/save-yaml', async (req, res) => {
  const { fileName, content } = req.body;
  
  try {
    const filePath = path.join(HOST_DIR, fileName);
    await fs.writeFile(filePath, content, 'utf8');
    
    res.json({ success: true, message: '文件已保存' });
  } catch (error) {
    console.error('保存 YAML 文件失败:', error);
    res.status(500).json({ error: '保存文件失败', details: error.message });
  }
});

// 部署 Docker 容器
app.post('/api/deploy', (req, res) => {
  const { fileName } = req.body;
  const filePath = path.join(HOST_DIR, fileName);
  
  // 使用正确的 Docker Compose 命令格式
  exec(`docker compose -f "${filePath}" up -d`, (error, stdout, stderr) => {
    if (error) {
      console.error('部署失败:', error);
      return res.status(500).json({ error: '部署失败', details: stderr });
    }
    
    res.json({ success: true, message: '部署成功', output: stdout });
  });
});

// 获取容器列表
app.get('/api/container-list', async (req, res) => {
  const { version, projectFolder = 'fnOS' } = req.query;
  try {
    let repoUrl;
    if (version === 'Free') {
      repoUrl = `https://api.github.com/repos/ATaKi-Myt/Last_Three_Service_Package_Free/contents/${projectFolder}`;
    } else if (version === 'Pro') {
      repoUrl = `https://api.github.com/repos/ATaKi-Myt/Last_Three_Service_Package_Pro/contents/${projectFolder}`;
    } else {
      return res.status(400).json({ error: '无效的版本选择' });
    }
    const headers = {
      'Accept': 'application/vnd.github.v3+json'
    };
    let agent = getProxyAgent();
    const response = await axios.get(repoUrl, { headers, httpsAgent: agent });
    const yamlFiles = response.data.filter(item => item.name.endsWith('.yml'));
    const containerList = yamlFiles.map(item => item.name);
    res.json({ containerList });
  } catch (error) {
    console.error('获取容器列表失败:', error);
    res.status(500).json({ error: '获取容器列表失败', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
