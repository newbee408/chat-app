# Windows PowerShell 部署脚本
# 使用方法: .\deploy.ps1

Write-Host "🚀 开始部署聊天APP到云服务器..." -ForegroundColor Green

# 配置信息
$SERVER_IP = "38.123.103.120"
$SERVER_USER = "root"
$SERVER_PATH = "/root/chat-app"

Write-Host "📦 正在打包项目文件..." -ForegroundColor Yellow

# 检查是否安装了tar（Windows 10 1803+自带）
if (Get-Command tar -ErrorAction SilentlyContinue) {
    tar -czf chat-app.tar.gz `
        server.js `
        package.json `
        ecosystem.config.json `
        public `
        --exclude=node_modules `
        --exclude=.git
} else {
    Write-Host "❌ 未找到tar命令，请使用WinSCP等工具手动上传" -ForegroundColor Red
    Write-Host "或者安装Git Bash后使用 deploy.sh 脚本" -ForegroundColor Yellow
    exit 1
}

Write-Host "📤 上传文件到服务器 $SERVER_IP ..." -ForegroundColor Yellow

# 使用scp上传（需要安装OpenSSH客户端）
scp chat-app.tar.gz "${SERVER_USER}@${SERVER_IP}:/tmp/"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 上传失败！请检查SSH配置" -ForegroundColor Red
    exit 1
}

Write-Host "🔧 在服务器上部署..." -ForegroundColor Yellow

# SSH执行部署命令
$deployScript = @"
echo '📂 创建项目目录...'
mkdir -p /root/chat-app
cd /root/chat-app

echo '📦 解压项目文件...'
tar -xzf /tmp/chat-app.tar.gz
rm /tmp/chat-app.tar.gz

echo '📥 安装依赖...'
npm install --production

echo '🔍 检查PM2是否安装...'
if ! command -v pm2 &> /dev/null; then
    echo '📥 安装PM2...'
    npm install -g pm2
fi

echo '🛑 停止旧版本（如果存在）...'
pm2 delete chat-app 2>/dev/null || true

echo '🚀 启动应用...'
pm2 start ecosystem.config.json

echo '💾 保存PM2配置...'
pm2 save

echo '🔥 配置防火墙...'
if command -v ufw &> /dev/null; then
    ufw allow 8080/tcp 2>/dev/null || true
fi

echo '📊 应用状态:'
pm2 status

echo ''
echo '✅ 部署完成！'
echo '🌐 访问地址: http://38.123.103.120:8080'
"@

ssh "${SERVER_USER}@${SERVER_IP}" $deployScript

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "🎉 部署成功！" -ForegroundColor Green
    Write-Host "🌐 请访问: http://38.123.103.120:8080" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📝 查看日志: ssh ${SERVER_USER}@${SERVER_IP} 'pm2 logs chat-app'" -ForegroundColor Yellow
    Write-Host "📊 查看状态: ssh ${SERVER_USER}@${SERVER_IP} 'pm2 status'" -ForegroundColor Yellow
} else {
    Write-Host "❌ 部署失败！" -ForegroundColor Red
}

# 清理本地临时文件
Remove-Item chat-app.tar.gz -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "按任意键退出..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
