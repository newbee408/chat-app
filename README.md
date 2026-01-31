# 💬 即时聊天APP + 🤖 Claude AI机器人

一个基于 Node.js + Socket.IO 的实时聊天应用，集成Claude AI智能机器人

## 📋 功能特性

✅ 实时消息收发  
✅ 在线用户列表  
✅ 用户上线/离线通知  
✅ 正在输入提示  
✅ 消息历史记录  
✅ 响应式设计，支持移动端  
✅ 美观的渐变UI设计  
🤖 **Claude AI智能机器人**（新功能！）
✨ AI对话上下文记忆
💬 @claude触发AI回复

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 配置API密钥（可选）
如果要启用Claude AI机器人：
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑.env文件，填入你的API密钥
# ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
```

获取API密钥：https://console.anthropic.com/

### 3. 启动服务器
```bash
npm start
```

### 4. 打开浏览器
访问 http://localhost:8080

### 5. 开始聊天
- 输入昵称进入聊天室
- 发送消息与其他用户聊天
- 发送 `@claude 你好` 与AI机器人对话
- 可以打开多个浏览器窗口模拟多用户聊天

## 🤖 Claude AI机器人

详细使用说明请查看：[CLAUDE_BOT.md](CLAUDE_BOT.md)

### 快速使用
```
@claude 你好
@claude 帮我写一首诗
@claude 解释一下WebSocket
```

## 📁 项目结构

```
chat-app/
├── server.js           # 后端服务器（Express + Socket.IO + Claude AI）
├── package.json        # 项目配置文件
├── .env               # 环境变量（API密钥等）
├── .env.example       # 环境变量模板
├── CLAUDE_BOT.md      # AI机器人使用指南
├── public/            # 前端文件
│   ├── index.html     # 主页面
│   ├── style.css      # 样式文件
│   └── app.js         # 前端逻辑
└── README.md          # 说明文档
```

## 🛠️ 技术栈

- **后端**: Node.js + Express + Socket.IO
- **前端**: HTML5 + CSS3 + JavaScript (原生)
- **实时通信**: WebSocket (Socket.IO)
- **AI**: Anthropic Claude API
- **环境管理**: dotenv

## 💡 核心功能说明

### 后端 (server.js)
- 使用 Express 提供静态文件服务
- Socket.IO 处理实时双向通信
- 内存存储用户和消息（可扩展为数据库）

### 前端 (app.js)
- 用户登录验证
- 实时消息收发
- 在线用户列表更新
- 输入状态提示

## 🎨 界面预览

- **登录界面**: 简洁的渐变背景 + 输入框
- **聊天界面**: 
  - 左侧：在线用户列表
  - 右侧：消息区域 + 输入框
  - 顶部：在线人数显示

## 📝 使用说明

1. **登录**: 输入2个字符以上的昵称
2. **发送消息**: 在输入框输入内容，点击"发送"或按回车
3. **查看在线用户**: 左侧边栏显示所有在线用户
4. **多人测试**: 打开多个浏览器标签页，使用不同昵称登录

## 🔧 扩展建议

如果想进一步完善这个APP，可以添加：

- 💾 数据库持久化（MongoDB/MySQL）
- 🔐 用户注册和登录系统
- 📷 图片/文件发送功能
- 🎭 用户头像
- 💬 私聊功能
- 🔔 消息提醒
- 📱 表情包支持
- 🌙 深色模式
- 🔍 消息搜索
- ⚙️ 用户设置

## 📞 常见问题

**Q: 刷新页面后消息丢失？**  
A: 当前版本使用内存存储，重启服务器会清空。可以集成数据库来持久化。

**Q: 如何部署到服务器？**  
A: 可以部署到 Heroku、Vercel、Railway 等平台，或使用自己的VPS。

**Q: 如何修改端口？**  
A: 修改 server.js 中的 PORT 变量，或设置环境变量 PORT。

## 📄 许可证

MIT License - 可自由使用和修改

---

🎉 享受聊天的乐趣！
