# 📋 手动部署步骤（最简单）

如果自动脚本不工作，按照以下步骤手动部署：

## 步骤1️⃣：准备SSH密钥

你提到"无密码"，应该是使用SSH密钥登录。确保你的SSH密钥已配置好。

测试连接：
```bash
ssh root@38.123.103.120
```

如果能成功登录，继续下一步。

---

## 步骤2️⃣：使用SFTP工具上传（最简单）

### 推荐工具：WinSCP (Windows)

1. **下载安装 WinSCP**: https://winscp.net/

2. **配置连接**：
   - 文件协议: SFTP
   - 主机名: 38.123.103.120
   - 端口: 22
   - 用户名: root
   - 密码: （留空，使用密钥）
   - 高级 → SSH → 认证 → 选择你的私钥文件

3. **上传文件**：
   - 连接成功后，右侧是服务器，左侧是本地
   - 在服务器端进入 /root 目录
   - 从本地拖拽整个 chat-app 文件夹到服务器
   - **注意**：不要上传 node_modules 文件夹（太大）

---

## 步骤3️⃣：在服务器上安装和运行

打开SSH连接到服务器：
```bash
ssh root@38.123.103.120
```

执行以下命令：

```bash
# 进入项目目录
cd /root/chat-app

# 安装依赖
npm install --production

# 安装PM2（全局进程管理器）
npm install -g pm2

# 启动应用
pm2 start ecosystem.config.json

# 查看状态
pm2 status

# 查看日志
pm2 logs chat-app

# 设置开机自启
pm2 startup
pm2 save
```

---

## 步骤4️⃣：配置防火墙

确保8080端口开放：

```bash
# 检查防火墙状态
sudo ufw status

# 开放8080端口
sudo ufw allow 8080/tcp

# 如果防火墙未启用，可以启用它
sudo ufw enable
```

---

## 步骤5️⃣：测试访问

打开浏览器访问：
```
http://38.123.103.120:8080
```

如果看到登录界面，恭喜部署成功！🎉

---

## 常见问题解决

### ❌ 无法访问？

1. **检查应用是否运行**：
   ```bash
   pm2 status
   ```

2. **查看日志找错误**：
   ```bash
   pm2 logs chat-app
   ```

3. **检查端口监听**：
   ```bash
   netstat -tlnp | grep 8080
   ```

4. **检查防火墙**：
   ```bash
   sudo ufw status
   ```

5. **云服务商安全组**：
   - 登录云服务商控制台
   - 找到"安全组"设置
   - 添加入站规则：TCP 8080端口

### ❌ PM2命令不存在？

```bash
npm install -g pm2
```

### ❌ 端口仍被占用？

```bash
# 查看占用8080的进程
sudo lsof -i :8080

# 杀死进程（替换<PID>为实际进程ID）
sudo kill -9 <PID>
```

---

## PM2 管理命令

```bash
# 查看所有应用
pm2 list

# 重启应用
pm2 restart chat-app

# 停止应用
pm2 stop chat-app

# 删除应用
pm2 delete chat-app

# 查看实时日志
pm2 logs chat-app --lines 50

# 监控面板
pm2 monit
```

---

## 🎯 快速命令汇总

```bash
# 一键部署（复制粘贴到SSH）
cd /root/chat-app && \
npm install --production && \
npm install -g pm2 && \
pm2 delete chat-app 2>/dev/null || true && \
pm2 start ecosystem.config.json && \
pm2 save && \
sudo ufw allow 8080/tcp && \
pm2 status
```

---

需要帮助？检查这些：
- ✅ SSH能否连接
- ✅ 文件是否上传完整
- ✅ Node.js版本 (node -v)
- ✅ 防火墙8080端口
- ✅ 云服务商安全组
- ✅ PM2应用状态
