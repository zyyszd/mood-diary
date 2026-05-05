// 引导页：首次设置昵称和存储偏好
const { getAppearance, resolveTheme, applyTheme } = require('../../utils/appearance');

Page({
  data: {
    nickname: '',
    storageMode: 'local',
    storageOptions: [
      {
        label: '仅本地存储',
        value: 'local',
        desc: '数据只保存在本机，不会上传服务器，适合只在当前设备使用。'
      },
      {
        label: '加密云端存储（预留）',
        value: 'encrypted',
        desc: '未来将支持加密同步到云端，当前版本仍以本地为主。'
      }
    ],
    isEntering: false,
    enterBtnText: '进入我的情绪日记',
    themeClass: '',
    fontClass: '',
    reduceMotionClass: ''
  },

  onLoad() {
    const nickname = wx.getStorageSync('nickname') || '';
    const storageMode = wx.getStorageSync('storageMode') || 'local';
    const hasOnboarded = wx.getStorageSync('hasOnboarded');

    if (hasOnboarded) {
      // 已完成引导，直接跳转到首页
      wx.switchTab({
        url: '/pages/home/home'
      });
      return;
    }

    const ap = getAppearance();
    const themeResolved = resolveTheme(ap.theme);
    applyTheme(themeResolved);

    this.setData({
      nickname,
      storageMode,
      themeClass: themeResolved === 'dark' ? 'theme--dark' : '',
      fontClass: ap.fontScale === 'large' ? 'font--large' : '',
      reduceMotionClass: ap.reduceMotion ? 'reduce-motion' : ''
    });
  },

  onNicknameInput(e) {
    this.setData({
      nickname: e.detail.value
    });
  },

  onStorageChange(e) {
    const value = e.detail.value || 'local';
    this.setData({
      storageMode: value
    });
  },

  handleEnter() {
    if (this.data.isEntering) {
      return;
    }
    this.setData({
      isEntering: true,
      enterBtnText: '进入中...'
    });

    wx.setStorageSync('nickname', this.data.nickname);
    wx.setStorageSync('storageMode', this.data.storageMode);
    wx.setStorageSync('hasOnboarded', true);

    setTimeout(() => {
      wx.switchTab({
        url: '/pages/home/home',
        success: () => {
          this.setData({
            isEntering: false,
            enterBtnText: '进入我的情绪日记'
          });
        },
        fail: () => {
          this.setData({
            isEntering: false,
            enterBtnText: '进入我的情绪日记'
          });
        }
      });
    }, 300);
  }
})
