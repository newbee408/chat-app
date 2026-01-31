// 即时聊天APP - 后端服务器（集成Claude AI）
require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// 初始化Claude AI客户端
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// 配置
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022';
const CLAUDE_MAX_TOKENS = parseInt(process.env.CLAUDE_MAX_TOKENS) || 1024;
const BOT_NAME = 'ClaudeBot';
const BOT_TRIGGER = '@claude'; // 触发机器人的关键词

// 存储在线用户和消息
const users = new Map(); // userId -> { username, socketId }
const messages = []; // 存储所有消息历史
const conversationHistory = new Map(); // 存储每个用户与Claude的对话历史

// 静态文件服务
app.use(express.static('public'));

// 主页路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Claude AI回复函数
async function getClaudeResponse(userMessage, username) {
    try {
        // 检查API密钥
        if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_api_key_here') {
            return '抱歉，管理员还没有配置Claude API密钥。请在服务器的.env文件中设置ANTHROPIC_API_KEY。';
        }

        // 获取或创建对话历史
        if (!conversationHistory.has(username)) {
            conversationHistory.set(username, []);
        }
        const history = conversationHistory.get(username);

        // 添加用户消息到历史
        history.push({
            role: 'user',
            content: userMessage
        });

        // 保持历史记录在合理范围内（最近10轮对话）
        if (history.length > 20) {
            history.splice(0, history.length - 20);
        }

        // 调用Claude API
        const response = await anthropic.messages.create({
            model: CLAUDE_MODEL,
            max_tokens: CLAUDE_MAX_TOKENS,
            system: `你是一个友好的聊天机器人，名叫ClaudeBot。你在一个即时聊天室中，当前正在和用户 ${username} 对话。请用简洁、友好的方式回复。`,
            messages: history
        });

        const assistantMessage = response.content[0].text;

        // 添加助手回复到历史
        history.push({
            role: 'assistant',
            content: assistantMessage
        });

        return assistantMessage;
    } catch (error) {
        console.error('Claude API错误:', error);
        if (error.status === 401) {
            return '❌ API密钥无效，请检查配置。';
        } else if (error.status === 429) {
            return '⏳ API调用频率过高，请稍后再试。';
        } else {
            return `❌ 抱歉，我遇到了一些问题：${error.message}`;
        }
    }
}

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
        
        // 发送在线用户列表（包括机器人）
        const onlineUsers = Array.from(users.values()).map(u => u.username);
        onlineUsers.unshift(BOT_NAME + ' 🤖'); // 添加机器人到列表顶部
        io.emit('users:list', onlineUsers);
        
        console.log(`${username} 已登录，当前在线: ${users.size}`);
        
        // 机器人欢迎消息
        setTimeout(() => {
            const welcomeMessage = {
                id: Date.now(),
                username: BOT_NAME,
                text: `👋 欢迎 ${username}！我是Claude AI助手。在消息前加上 @claude 来和我对话，例如："@claude 你好"`,
                timestamp: new Date().toISOString(),
                isBot: true
            };
            messages.push(welcomeMessage);
            io.emit('message:receive', welcomeMessage);
        }, 500);
    });

    // 接收消息
    socket.on('message:send', async (data) => {
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

        // 检查是否触发Claude机器人
        if (data.text.toLowerCase().includes(BOT_TRIGGER)) {
            // 提取实际问题（去掉@claude）
            const question = data.text.replace(/@claude/gi, '').trim();
            
            if (question) {
                // 显示"正在输入"提示
                io.emit('bot:typing', BOT_NAME);

                // 获取Claude回复
                const aiResponse = await getClaudeResponse(question, user.username);

                // 发送机器人回复
                const botMessage = {
                    id: Date.now(),
                    username: BOT_NAME,
                    text: aiResponse,
                    timestamp: new Date().toISOString(),
                    isBot: true
                };

                messages.push(botMessage);
                io.emit('message:receive', botMessage);
                
                console.log(`${BOT_NAME} -> ${user.username}: ${aiResponse}`);
            }
        }
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
            
            // 清理对话历史
            conversationHistory.delete(user.username);
            
            // 广播用户离线通知
            io.emit('user:left', {
                username: user.username,
                userCount: users.size,
                timestamp: new Date().toISOString()
            });
            
            // 更新在线用户列表
            const onlineUsers = Array.from(users.values()).map(u => u.username);
            onlineUsers.unshift(BOT_NAME + ' 🤖');
            io.emit('users:list', onlineUsers);
            
            console.log(`${user.username} 已离线，当前在线: ${users.size}`);
        }
    });
});

// 启动服务器
const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ 聊天服务器运行在 http://0.0.0.0:${PORT}`);
    console.log(`🤖 Claude AI机器人: ${process.env.ANTHROPIC_API_KEY ? '已启用' : '未配置'}`);
    console.log(`💡 使用 "${BOT_TRIGGER}" 触发AI对话`);
    console.log('按 Ctrl+C 停止服务器');
});
