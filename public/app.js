// 即时聊天APP - 前端逻辑
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
        onlineCount.textContent = users.length;
    });
    
    // 用户正在输入
    socket.on('user:typing', (username) => {
        showTypingIndicator(username);
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
    
    messageDiv.innerHTML = `
        <div class="message-header">
            <span class="message-username">${escapeHtml(message.username)}${isOwnMessage ? ' (我)' : ''}</span>
            <span class="message-time">${formatTime(message.timestamp)}</span>
        </div>
        <div class="message-text">${escapeHtml(message.text)}</div>
    `;
    
    messagesList.appendChild(messageDiv);
    scrollToBottom();
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
        li.textContent = username;
        if (username === currentUsername) {
            li.textContent += ' (我)';
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

// 页面加载完成后自动聚焦用户名输入框
window.addEventListener('load', () => {
    usernameInput.focus();
});
