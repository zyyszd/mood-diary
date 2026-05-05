// app.js
const { getAppearance, setAppearance } = require('./utils/appearance');

App({
  onLaunch() {
    // 初始化外观设置默认值
    try {
      const ap = getAppearance();
      setAppearance(ap);

      // 展示本地存储能力
      const logs = wx.getStorageSync('logs') || []
      logs.unshift(Date.now())
      wx.setStorageSync('logs', logs)

      // 登录 - 仅在非模拟环境中执行
      if (typeof __wxConfig !== 'undefined' && __wxConfig.envVersion !== 'develop') {
        wx.login({
          success: res => {
            // 发送 res.code 到后台换取 openId, sessionKey, unionId
          },
          fail: err => {
            console.error('登录失败:', err);
            // 登录失败不影响应用使用
          }
        })
      } else {
        // 模拟环境，跳过登录
        console.log('模拟环境，跳过登录');
      }
    } catch (error) {
      console.error('初始化失败:', error);
      // 初始化失败不影响应用使用
    }
  },
  globalData: {
    userInfo: null
  }
})
