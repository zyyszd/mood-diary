// API配置文件
// 根据不同环境自动切换API地址

const CONFIG = {
  // 开发环境 - 本地服务器
  develop: {
    baseUrl: 'http://localhost:5000',
    debug: true
  },
  // 体验版 - 使用内网穿透地址
  trial: {
    // ⚠️ 注意：请将此地址替换为你实际的内网穿透地址（如 ngrok 或本地网络IP）
    // 例如：'https://abc123.ngrok-free.app' 或 'http://192.168.1.100:5000'
    baseUrl: 'http://localhost:5000',
    debug: true
  },
  // 正式版 - 生产服务器
  release: {
    baseUrl: 'https://your-production-domain.com',
    debug: false
  }
};

// 获取当前环境配置
function getConfig() {
  const envVersion = typeof __wxConfig !== 'undefined' ? __wxConfig.envVersion : 'develop';
  return CONFIG[envVersion] || CONFIG.develop;
}

// 获取API基础地址
function getBaseUrl() {
  return getConfig().baseUrl;
}

// 是否是调试模式
function isDebug() {
  return getConfig().debug;
}

module.exports = {
  getBaseUrl,
  isDebug,
  getConfig
};
