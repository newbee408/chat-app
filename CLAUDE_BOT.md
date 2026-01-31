# 🤖 Claude AI机器人使用指南

## ✨ 新功能

你的聊天APP现在集成了Claude AI机器人！

### 功能特点
- 🤖 智能AI对话
- 💬 上下文记忆（每个用户独立对话历史）
- ⚡ 实时响应
- 🎨 特殊的机器人消息样式
- 🔒 安全的API密钥管理

---

## 🎯 如何使用

### 触发机器人

在消息前加上 `@claude` 即可与AI对话：

```
@claude 你好
@claude 帮我写一首诗
@claude 解释一下什么是WebSocket
```

### 快捷输入

- 输入 `@` 时会自动补全为 `@claude `
- 机器人会记住你的对话历史
- 每个用户有独立的对话上下文

---

## 🔑 配置API密钥

### 方法1：本地测试

1. **获取API密钥**
   - 访问：https://console.anthropic.com/
   - 登录并创建API密钥
   - 复制密钥

2. **配置本地环境**
   - 打开 `.env` 文件
   - 修改：`ANTHROPIC_API_KEY=你的API密钥`
   - 保存文件

3. **启动服务器**
   ```bash
   npm start
   ```

### 方法2：服务器部署

在服务器上配置：

```bash
# 进入项目目录
cd /root/chat-app

# 创建.env文件
nano .env

# 添加以下内容（替换为你的API密钥）
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
PORT=8080
CLAUDE_MODEL=claude-3-5-sonnet-20241022
CLAUDE_MAX_TOKENS=1024

# 保存并退出（Ctrl+X, Y, Enter）

# 重启应用
pm2 restart chat-app
```

---

## 📋 环境变量说明

在 `.env` 文件中配置：

```bash
# Claude API密钥（必需）
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx

# 服务器端口（可选，默认8080）
PORT=8080

# Claude模型版本（可选）
CLAUDE_MODEL=claude-3-5-sonnet-20241022

# 最大回复长度（可选，默认1024）
CLAUDE_MAX_TOKENS=1024
```

---

## 🎨 界面特点

### 机器人消息样式
- 💙 蓝色边框和背景
- 🤖 用户名后显示机器人图标
- ✨ 特殊的阴影效果

### @claude高亮
- 消息中的 `@claude` 会高亮显示
- 蓝色背景，白色文字

### 在线用户列表
- ClaudeBot 🤖 显示在列表顶部
- 蓝色字体，加粗显示

---

## 🔍 功能演示

### 示例对话

**用户**: @claude 你好，你是谁？

**ClaudeBot**: 你好！我是ClaudeBot，一个由Anthropic开发的AI助手。我在这个聊天室中，可以回答问题、提供帮助或者和大家聊天。有什么我可以帮你的吗？

---

**用户**: @claude 帮我写一个JavaScript函数

**ClaudeBot**: 当然！这是一个简单的JavaScript函数示例：

```javascript
function greet(name) {
    return `你好，${name}！`;
}
```

你想要什么类型的函数呢？

---

## ⚙️ 技术细节

### 对话历史管理
- 每个用户有独立的对话历史
- 自动保留最近20条消息（10轮对话）
- 用户离线后自动清理历史

### API调用
- 使用 Anthropic SDK
- 模型：claude-3-5-sonnet-20241022
- 系统提示：友好的聊天机器人角色

### 错误处理
- API密钥无效：提示配置错误
- 调用频率限制：提示稍后重试
- 网络错误：显示友好的错误信息

---

## 🚀 更新到服务器

### 1. 提交代码到GitHub

```bash
cd C:\Users\Administrator\Desktop\chat-app
git add .
git commit -m "集成Claude AI机器人"
git push
```

### 2. 在服务器上更新

```bash
# SSH登录服务器或使用Web终端
cd /root/chat-app

# 拉取最新代码
git pull

# 安装新依赖
npm install --production

# 配置API密钥
nano .env
# 添加: ANTHROPIC_API_KEY=你的密钥

# 重启应用
pm2 restart chat-app

# 查看日志
pm2 logs chat-app
```

---

## 📊 监控和调试

### 查看日志
```bash
# 实时日志
pm2 logs chat-app

# 最近100行
pm2 logs chat-app --lines 100
```

### 检查状态
```bash
# 应用状态
pm2 status

# 详细信息
pm2 show chat-app
```

### 常见问题

**问题1: 机器人不回复**
- 检查API密钥是否正确配置
- 查看日志：`pm2 logs chat-app`
- 确认消息包含 `@claude`

**问题2: API密钥错误**
- 错误信息：`❌ API密钥无效`
- 解决：检查 `.env` 文件中的密钥
- 重启应用：`pm2 restart chat-app`

**问题3: 调用频率限制**
- 错误信息：`⏳ API调用频率过高`
- 解决：等待几秒后重试
- 或升级API套餐

---

## 💡 使用技巧

### 1. 多轮对话
机器人会记住你的对话历史，可以进行连续对话：

```
你: @claude 我想学习编程
Bot: 很好！你想学习哪种编程语言呢？

你: @claude Python
Bot: Python是个很好的选择！让我们从基础开始...
```

### 2. 代码询问
可以询问编程相关问题：

```
@claude 如何在JavaScript中遍历数组？
@claude 解释一下async/await
```

### 3. 创意写作
可以让AI帮你创作：

```
@claude 写一首关于编程的诗
@claude 帮我想一个项目名称
```

---

## 🎯 下一步优化

可以考虑添加：

- 📝 支持Markdown格式化
- 🖼️ 图片生成功能
- 🔊 语音转文字
- 📊 对话统计
- 🎨 自定义机器人人格
- 💾 对话历史持久化

---

## 📞 获取API密钥

1. 访问：https://console.anthropic.com/
2. 注册/登录账号
3. 进入 API Keys 页面
4. 点击 "Create Key"
5. 复制密钥（以 `sk-ant-` 开头）
6. 配置到 `.env` 文件

**注意**：
- API密钥是敏感信息，不要分享
- 不要提交到GitHub（已在.gitignore中）
- 定期检查API使用量

---

🎉 享受与AI聊天的乐趣！
