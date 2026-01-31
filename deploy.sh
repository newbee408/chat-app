#!/bin/bash

# 云服务器自动部署脚本
# 使用方法: bash deploy.sh

echo "🚀 开始部署聊天APP到云服务器..."

# 配置信息
SERVER_IP="38.123.103.120"
SERVER_USER="root"
SERVER_PATH="/root/chat-app"
LOCAL_PATH="."

echo "📦 正在打包项目文件..."
# 排除node_modules等大文件
tar -czf chat-app.tar.gz \
    server.js \
    package.json \
    ecosystem.config.json \
    public/ \
    --exclude=node_modules \
    --exclude=.git

echo "📤 上传文件到服务器 $SERVER_IP ..."
scp chat-app.tar.gz $SERVER_USER@$SERVER_IP:/tmp/

echo "🔧 在服务器上部署..."
ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
    echo "📂 创建项目目录..."
    mkdir -p /root/chat-app
    cd /root/chat-app
    
    echo "📦 解压项目文件..."
    tar -xzf /tmp/chat-app.tar.gz
    rm /tmp/chat-app.tar.gz
    
    echo "📥 安装依赖..."
    npm install --production
    
    echo "🔍 检查PM2是否安装..."
    if ! command -v pm2 &> /dev/null; then
        echo "📥 安装PM2..."
        npm install -g pm2
    fi
    
    echo "🛑 停止旧版本（如果存在）..."
    pm2 delete chat-app 2>/dev/null || true
    
    echo "🚀 启动应用..."
    pm2 start ecosystem.config.json
    
    echo "💾 保存PM2配置..."
    pm2 save
    
    echo "🔥 配置防火墙..."
    if command -v ufw &> /dev/null; then
        ufw allow 8080/tcp 2>/dev/null || true
    fi
    
    echo "📊 应用状态:"
    pm2 status
    
    echo ""
    echo "✅ 部署完成！"
    echo "🌐 访问地址: http://38.123.103.120:8080"
ENDSSH

echo ""
echo "🎉 部署成功！"
echo "🌐 请访问: http://38.123.103.120:8080"
echo ""
echo "📝 查看日志: ssh $SERVER_USER@$SERVER_IP 'pm2 logs chat-app'"
echo "📊 查看状态: ssh $SERVER_USER@$SERVER_IP 'pm2 status'"

# 清理本地临时文件
rm chat-app.tar.gz
