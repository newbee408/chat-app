#!/bin/bash
# 服务器部署脚本
# 在服务器Web终端中执行此脚本

echo "========================================"
echo "  聊天APP服务器部署"
echo "  仓库: newbee408/chat-app"
echo "========================================"
echo ""

# 进入root目录
cd /root

# 检查是否已存在项目
if [ -d "chat-app" ]; then
    echo "⚠️  检测到已存在chat-app目录"
    read -p "是否删除并重新部署？(y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🗑️  删除旧版本..."
        pm2 delete chat-app 2>/dev/null || true
        rm -rf chat-app
    else
        echo "❌ 取消部署"
        exit 1
    fi
fi

echo "📥 克隆项目..."
git clone https://github.com/newbee408/chat-app.git

if [ $? -ne 0 ]; then
    echo "❌ 克隆失败！请检查网络连接"
    exit 1
fi

cd chat-app

echo ""
echo "📦 安装依赖..."
npm install --production

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败！"
    exit 1
fi

echo ""
echo "🔧 安装PM2..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

echo ""
echo "🚀 启动应用..."
pm2 start ecosystem.config.json

echo ""
echo "💾 保存PM2配置..."
pm2 save

echo ""
echo "⚙️  设置开机自启..."
pm2 startup

echo ""
echo "🔥 配置防火墙..."
sudo ufw allow 8080/tcp 2>/dev/null || true

echo ""
echo "========================================"
echo "📊 应用状态:"
echo "========================================"
pm2 status

echo ""
echo "========================================"
echo "✅ 部署完成！"
echo "========================================"
echo ""
echo "🌐 访问地址: http://38.123.103.120:8080"
echo ""
echo "📝 常用命令:"
echo "  查看状态: pm2 status"
echo "  查看日志: pm2 logs chat-app"
echo "  重启应用: pm2 restart chat-app"
echo "  停止应用: pm2 stop chat-app"
echo ""
echo "⚠️  重要: 请在云服务商控制台开放8080端口！"
echo ""
