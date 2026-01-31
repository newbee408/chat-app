// 即时聊天APP - 后端服务器
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// 存储在线用户和消息（简化版，实际项目应使用数据库）
const users = new Map(); // userId -> { username, socketId }
const messages = []; // 存储所有消息历史

// 静态文件服务
app.use(express.static('public'));

// 主页路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Socket.IO 连接处理
io.on('connection', (socket) => {
    console.log('新用户连接:', socket.id);

    // 用户登录
    socket.on('user:login', (username) => {
        users.set(socket.id, { username, socketId: socket.id });
        
        // 发送历史消息给新用户
        socket.emit('messages:history', messages);
        
        // 广播用户上线通知
        io.emit('user:joined', {
            username,
            userCount: users.size,
            timestamp: new Date().toISOString()
        });
        
        // 发送在线用户列表
        const onlineUsers = Array.from(users.values()).map(u => u.username);
        io.emit('users:list', onlineUsers);
        
        console.log(`${username} 已登录，当前在线: ${users.size}`);
    });

    // 接收消息
    socket.on('message:send', (data) => {
        const user = users.get(socket.id);
        if (!user) return;

        const message = {
            id: Date.now(),
            username: user.username,
            text: data.text,
            timestamp: new Date().toISOString()
        };

        // 保存消息
        messages.push(message);
        
        // 广播消息给所有用户
        io.emit('message:receive', message);
        
        console.log(`${user.username}: ${data.text}`);
    });

    // 用户正在输入
    socket.on('user:typing', () => {
        const user = users.get(socket.id);
        if (user) {
            socket.broadcast.emit('user:typing', user.username);
        }
    });

    // 用户断开连接
    socket.on('disconnect', () => {
        const user = users.get(socket.id);
        if (user) {
            users.delete(socket.id);
            
            // 广播用户离线通知
            io.emit('user:left', {
                username: user.username,
                userCount: users.size,
                timestamp: new Date().toISOString()
            });
            
            // 更新在线用户列表
            const onlineUsers = Array.from(users.values()).map(u => u.username);
            io.emit('users:list', onlineUsers);
            
            console.log(`${user.username} 已离线，当前在线: ${users.size}`);
        }
    });
});

// 启动服务器
const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ 聊天服务器运行在 http://0.0.0.0:${PORT}`);
    console.log('按 Ctrl+C 停止服务器');
});
