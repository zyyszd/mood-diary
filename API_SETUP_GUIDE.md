# 情绪日记小程序 - 后端API使用指南

## 📱 问题说明

微信小程序真机体验版无法直接访问 `localhost`，需要配置内网穿透或使用本地网络IP。

---

## 🔧 解决方案

### 方案一：局域网IP（推荐 - 同WiFi下使用）

#### 步骤1：获取电脑的局域网IP

**Windows系统**：
```bash
# 打开CMD或PowerShell，执行
ipconfig
```
找到类似这样的地址：
```
IPv4 地址 . . . . . . . . . . . . : 192.168.1.100
```

**Mac/Linux系统**：
```bash
ifconfig
# 或
ip addr
```

#### 步骤2：修改配置文件

打开 `utils/config.js`，修改 `trial` 配置：

```javascript
trial: {
  // 将 localhost 改为你的局域网IP
  baseUrl: 'http://192.168.1.100:5000',  // ⚠️ 替换为你的实际IP
  debug: true
}
```

#### 步骤3：确保手机和电脑在同一WiFi网络

#### 步骤4：重新编译并上传体验版

---

### 方案二：使用内网穿透工具（ngrok）

#### 步骤1：下载并安装ngrok

访问 https://ngrok.com/download 下载并安装

#### 步骤2：启动ngrok

```bash
# 启动ngrok，转发到5000端口
ngrok http 5000
```

#### 步骤3：获取公网地址

启动后会显示类似这样的信息：
```
Forwarding  https://abc123.ngrok-free.app -> http://localhost:5000
```

#### 步骤4：修改配置文件

打开 `utils/config.js`：

```javascript
trial: {
  // 使用ngrok提供的HTTPS地址
  baseUrl: 'https://abc123.ngrok-free.app',  // ⚠️ 替换为实际地址
  debug: true
}
```

---

### 方案三：使用其他内网穿透工具

#### 可选工具：
- **cpolar** - https://www.cpolar.com/
- **花生壳** - https://hsk.oray.com/
- **frp** - https://github.com/fatedier/frp

使用方法类似，获取公网地址后填入配置文件即可。

---

## 📝 已完成的配置优化

### 1. API配置文件 (`utils/config.js`)
- ✅ 自动识别环境（开发/体验/正式）
- ✅ 支持不同环境使用不同API地址
- ✅ 可配置调试模式

### 2. 项目配置优化 (`project.private.config.json`)
- ✅ 关闭了安全域名检查（`urlCheck: false`）
- ✅ 开启了局域网调试（`useLanDebug: true`）

### 3. 后端服务
- ✅ 后端服务已运行在 `http://localhost:5000`
- ✅ 所有API接口都有Mock实现

---

## 🚀 快速测试步骤

### 1️⃣ 确认后端服务运行

确保后端服务正在运行：
```bash
cd backend
python app.py
```

看到这个说明成功：
```
🚀 后端服务启动中...
📌 服务地址: http://localhost:5000
```

### 2️⃣ 获取你的局域网IP

Windows:
```bash
ipconfig
```

找到你的IPv4地址，例如：`192.168.1.100`

### 3️⃣ 修改配置文件

编辑 `utils/config.js`：

```javascript
trial: {
  baseUrl: 'http://192.168.1.100:5000',  // ⚠️ 替换为你的IP
  debug: true
}
```

### 4️⃣ 测试局域网访问

在手机浏览器中访问：
```
http://192.168.1.100:5000
```

如果能看到页面或响应，说明网络通了。

### 5️⃣ 重新上传体验版

在微信开发者工具中：
1. 点击「编译」
2. 点击「上传」
3. 在微信公众平台提交体验版

---

## 🔍 常见问题排查

### Q: 手机无法访问局域网IP？

**A: 检查以下几点：**
1. 手机和电脑是否连接同一个WiFi？
2. 电脑防火墙是否阻止了5000端口？
3. 后端服务是否正在运行？

**临时关闭Windows防火墙测试：**
```
设置 → 更新和安全 → Windows安全中心 → 防火墙和网络保护 → 允许应用通过防火墙
```

### Q: 微信小程序提示"request:fail"？

**A: 常见原因：**
1. `urlCheck` 没有关闭（已在配置中关闭）
2. API地址配置错误
3. 后端服务未启动
4. 网络不通

### Q: 如何在开发者工具中测试？

**A: 开发者工具不需要内网穿透，直接使用 `localhost` 即可：**
- 开发环境会自动使用 `develop` 配置
- 确保 `project.private.config.json` 中 `urlCheck: false`

---

## 💡 高级配置

### 使用环境变量

你也可以通过环境变量来动态设置API地址：

```javascript
// utils/config.js
trial: {
  baseUrl: process.env.API_URL || 'http://localhost:5000',
  debug: true
}
```

### 添加更多环境配置

```javascript
const CONFIG = {
  develop: { ... },
  trial: { ... },
  release: { ... },
  // 自定义环境
  custom: {
    baseUrl: 'http://your-custom-server.com',
    debug: true
  }
};
```

---

## 📚 参考文档

- 微信小程序网络请求文档：https://developers.weixin.qq.com/miniprogram/dev/api/network/request/wx.request.html
- ngrok官方文档：https://ngrok.com/docs
- 微信开发者工具配置：https://developers.weixin.qq.com/miniprogram/dev/devtools/projectconfig.html

---

## ⚠️ 注意事项

1. **安全警告**：在正式发布时，请使用HTTPS协议
2. **域名白名单**：正式版需要在微信公众平台配置服务器域名白名单
3. **端口**：确保防火墙允许5000端口（或你使用的其他端口）的入站连接
4. **内网穿透稳定性**：免费的ngrok地址会变化，如需稳定请考虑付费方案

---

## 🎯 下一步

配置完成后，你可以：
1. ✅ 测试AI聊天功能
2. ✅ 测试语音转文字功能
3. ✅ 测试情绪分析功能

祝使用愉快！🎉
