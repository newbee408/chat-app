# Git推送脚本
# 使用方法: .\push-to-github.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  推送聊天APP到GitHub" -ForegroundColor Cyan
Write-Host "  仓库: newbee408/chat-app" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查是否在正确的目录
$currentPath = Get-Location
if ($currentPath.Path -notlike "*chat-app*") {
    Write-Host "⚠️  警告: 当前不在chat-app目录" -ForegroundColor Yellow
    Write-Host "正在切换到chat-app目录..." -ForegroundColor Yellow
    Set-Location "$HOME\Desktop\chat-app"
}

Write-Host "📋 第1步: 检查Git状态..." -ForegroundColor Green
git status

Write-Host ""
Write-Host "📤 第2步: 推送到GitHub..." -ForegroundColor Green
Write-Host "仓库地址: https://github.com/newbee408/chat-app.git" -ForegroundColor Gray
Write-Host ""

# 推送
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✅ 推送成功！" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 查看仓库: https://github.com/newbee408/chat-app" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📋 下一步: 在服务器上部署" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "在服务器Web终端执行以下命令:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "cd /root && git clone https://github.com/newbee408/chat-app.git && cd chat-app && npm install --production && npm install -g pm2 && pm2 start ecosystem.config.json && pm2 save && pm2 startup && sudo ufw allow 8080/tcp && pm2 status" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "❌ 推送失败！" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "可能的原因:" -ForegroundColor Yellow
    Write-Host "1. 还没有在GitHub创建仓库" -ForegroundColor White
    Write-Host "   解决: 访问 https://github.com/new 创建名为 chat-app 的仓库" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. 需要GitHub登录认证" -ForegroundColor White
    Write-Host "   解决: 按提示登录或使用Personal Access Token" -ForegroundColor Gray
    Write-Host "   获取Token: https://github.com/settings/tokens" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. 网络问题" -ForegroundColor White
    Write-Host "   解决: 检查网络连接" -ForegroundColor Gray
    Write-Host ""
}

Write-Host ""
Write-Host "按任意键退出..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
