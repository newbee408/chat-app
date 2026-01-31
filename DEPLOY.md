# 🚀 云服务器部署指南

## 服务器信息
- IP: 38.123.103.120
- 系统: Ubuntu
- 端口: 8080

## 方法一：使用SCP上传（推荐）

### 1. 打包项目（在本地执行）
```bash
cd C:\Users\Administrator\Desktop\chat-app
tar -czf chat-app.tar.gz server.js package.json ecosystem.config.json public/
```

### 2. 上传到服务器
```bash
scp chat-app.tar.gz root@38.123.103.120:/root/
```

### 3. SSH登录服务器
```bash
ssh root@38.123.103.120
```

### 4. 在服务器上解压和部署
```bash
# 解压项目
cd /root
tar -xzf chat-app.tar.gz
cd chat-app

# 安装依赖
npm install --production

# 安装PM2（如果没有）
npm install -g pm2

# 启动应用
pm2 start ecosystem.config.json

# 设置开机自启
pm2 startup
pm2 save

# 查看运行状态
pm2 status
pm2 logs chat-app
```

### 5. 配置防火墙
```bash
# Ubuntu UFW防火墙
sudo ufw allow 8080/tcp
sudo ufw status

# 或者使用iptables
sudo iptables -A INPUT -p tcp --dport 8080 -j ACCEPT
```

### 6. 访问应用
打开浏览器访问: http://38.123.103.120:8080

---

## 方法二：使用Git部署

### 1. 在本地初始化Git仓库
```bash
cd C:\Users\Administrator\Desktop\chat-app
git init
git add .
git commit -m "Initial commit"
```

### 2. 推送到GitHub/Gitee
```bash
# 创建远程仓库后
git remote add origin <你的仓库地址>
git push -u origin main
```

### 3. 在服务器上克隆
```bash
ssh root@38.123.103.120
cd /root
git clone <你的仓库地址>
cd chat-app
npm install --production
pm2 start ecosystem.config.json
```

---

## 方法三：使用SFTP工具（图形化界面）

推荐工具：
- **WinSCP** (Windows)
- **FileZilla** (跨平台)
- **Cyberduck** (Mac/Windows)

### 步骤：
1. 打开SFTP工具
2. 连接信息：
   - 主机: 38.123.103.120
   - 端口: 22
   - 用户名: root
   - 认证方式: 密钥文件
3. 上传整个 chat-app 文件夹到 /root/
4. 通过SSH执行安装命令

---

## PM2 常用命令

```bash
# 查看所有应用
pm2 list

# 查看日志
pm2 logs chat-app

# 重启应用
pm2 restart chat-app

# 停止应用
pm2 stop chat-app

# 删除应用
pm2 delete chat-app

# 监控
pm2 monit
```

---

## 故障排查

### 1. 端口被占用
```bash
# 查看8080端口占用
sudo lsof -i :8080
# 或
sudo netstat -tlnp | grep 8080

# 杀死进程
sudo kill -9 <PID>
```

### 2. 防火墙问题
```bash
# 检查防火墙状态
sudo ufw status
# 临时关闭防火墙测试
sudo ufw disable
```

### 3. Node.js版本问题
```bash
# 检查版本
node -v
npm -v

# 更新Node.js（如需要）
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 4. 查看应用日志
```bash
pm2 logs chat-app --lines 100
```

---

## 配置域名（可选）

如果你有域名，可以配置Nginx反向代理：

### 1. 安装Nginx
```bash
sudo apt update
sudo apt install nginx
```

### 2. 配置Nginx
```bash
sudo nano /etc/nginx/sites-available/chat-app
```

添加配置：
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. 启用配置
```bash
sudo ln -s /etc/nginx/sites-available/chat-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 安全建议

1. **修改SSH端口**（避免默认22端口）
2. **配置防火墙**，只开放必要端口
3. **使用HTTPS**（配置SSL证书）
4. **定期更新系统**
   ```bash
   sudo apt update && sudo apt upgrade
   ```
5. **设置环境变量**存储敏感信息

---

## 下一步优化

- ✅ 已修改端口为8080
- ✅ 已配置PM2守护进程
- 📝 可添加数据库（MongoDB/MySQL）
- 📝 可配置Nginx反向代理
- 📝 可申请SSL证书启用HTTPS
- 📝 可配置CDN加速

---

🎉 部署完成后，访问 http://38.123.103.120:8080 即可使用！
