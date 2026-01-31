// 即时聊天APP - 前端逻辑（支持Claude AI）
let socket;
let currentUsername = '';

// DOM 元素
const loginScreen = document.getElementById('loginScreen');
const chatScreen = document.getElementById('chatScreen');
const usernameInput = document.getElementById('usernameInput');
const loginBtn = document.getElementById('loginBtn');
const messagesList = document.getElementById('messagesList');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const usersList = document.getElementById('usersList');
const onlineCount = document.getElementById('onlineCount');
const typingIndicator = document.getElementById('typingIndicator');

// 登录功能
loginBtn.addEventListener('click', login);
usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') login();
});

function login() {
    const username = usernameInput.value.trim();
    
    if (!username) {
        alert('请输入昵称！');
        return;
    }
    
    if (username.length < 2) {
        alert('昵称至少需要2个字符！');
        return;
    }
    
    currentUsername = username;
    
    // 连接Socket.IO服务器
    socket = io();
    
    // 设置Socket事件监听
    setupSocketListeners();
    
    // 发送登录事件
    socket.emit('user:login', username);
    
    // 切换到聊天界面
    loginScreen.classList.add('hidden');
    chatScreen.classList.remove('hidden');
    messageInput.focus();
}

// 设置Socket事件监听
function setupSocketListeners() {
    // 接收历史消息
    socket.on('messages:history', (messages) => {
        messages.forEach(msg => displayMessage(msg));
    });
    
    // 接收新消息
    socket.on('message:receive', (message) => {
        displayMessage(message);
    });
    
    // 用户加入
    socket.on('user:joined', (data) => {
        displaySystemMessage(`${data.username} 加入了聊天室`);
    });
    
    // 用户离开
    socket.on('user:left', (data) => {
        displaySystemMessage(`${data.username} 离开了聊天室`);
    });
    
    // 更新在线用户列表
    socket.on('users:list', (users) => {
        updateUsersList(users);
        // 减1是因为ClaudeBot不算真实用户
        const realUserCount = users.filter(u => !u.includes('🤖')).length;
        onlineCount.textContent = realUserCount;
    });
    
    // 用户正在输入
    socket.on('user:typing', (username) => {
        showTypingIndicator(username);
    });
    
    // 机器人正在输入
    socket.on('bot:typing', (botName) => {
        showTypingIndicator(botName + ' 🤖');
    });
}

// 发送消息功能
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// 输入时触发"正在输入"事件
let typingTimeout;
messageInput.addEventListener('input', () => {
    if (socket) {
        socket.emit('user:typing');
    }
});

function sendMessage() {
    const text = messageInput.value.trim();
    
    if (!text) return;
    
    // 发送消息到服务器
    socket.emit('message:send', { text });
    
    // 清空输入框
    messageInput.value = '';
    messageInput.focus();
}

// 显示消息
function displayMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    
    const isOwnMessage = message.username === currentUsername;
    const isBot = message.isBot || message.username === 'ClaudeBot';
    
    // 为机器人消息添加特殊样式
    if (isBot) {
        messageDiv.classList.add('bot-message');
    }
    
    messageDiv.innerHTML = `
        <div class="message-header">
            <span class="message-username ${isBot ? 'bot-username' : ''}">${escapeHtml(message.username)}${isOwnMessage ? ' (我)' : ''}${isBot ? ' 🤖' : ''}</span>
            <span class="message-time">${formatTime(message.timestamp)}</span>
        </div>
        <div class="message-text ${isBot ? 'bot-text' : ''}">${formatMessageText(message.text)}</div>
    `;
    
    messagesList.appendChild(messageDiv);
    scrollToBottom();
}

// 格式化消息文本（支持简单的Markdown）
function formatMessageText(text) {
    let formatted = escapeHtml(text);
    
    // 高亮@claude
    formatted = formatted.replace(/@claude/gi, '<span class="mention">@claude</span>');
    
    // 简单的代码块支持
    formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // 换行支持
    formatted = formatted.replace(/\n/g, '<br>');
    
    return formatted;
}

// 显示系统消息
function displaySystemMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'system-message';
    messageDiv.textContent = text;
    messagesList.appendChild(messageDiv);
    scrollToBottom();
}

// 更新在线用户列表
function updateUsersList(users) {
    usersList.innerHTML = '';
    users.forEach(username => {
        const li = document.createElement('li');
        const isBot = username.includes('🤖');
        
        li.textContent = username;
        if (username === currentUsername) {
            li.textContent += ' (我)';
            li.style.fontWeight = 'bold';
        }
        
        // 机器人特殊样式
        if (isBot) {
            li.style.color = '#667eea';
            li.style.fontWeight = 'bold';
        }
        
        usersList.appendChild(li);
    });
}

// 显示"正在输入"提示
function showTypingIndicator(username) {
    const typingText = typingIndicator.querySelector('.typing-text');
    typingText.textContent = `${username} 正在输入...`;
    typingIndicator.classList.remove('hidden');
    
    // 3秒后自动隐藏
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        typingIndicator.classList.add('hidden');
    }, 3000);
}

// 滚动到底部
function scrollToBottom() {
    messagesList.scrollTop = messagesList.scrollHeight;
}

// 格式化时间
function formatTime(timestamp) {
    const date = new Date(timestamp);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

// HTML转义，防止XSS攻击
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 快速插入@claude
messageInput.addEventListener('keydown', (e) => {
    // 按下@键时自动补全claude
    if (e.key === '@' && !messageInput.value.includes('@claude')) {
        setTimeout(() => {
            if (messageInput.value.endsWith('@')) {
                messageInput.value = messageInput.value.slice(0, -1) + '@claude ';
            }
        }, 10);
    }
});

// 页面加载完成后自动聚焦用户名输入框
window.addEventListener('load', () => {
    usernameInput.focus();
});
