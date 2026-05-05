const { getAppearance, setAppearance, resolveTheme, applyTheme } = require('../../utils/appearance');
const { encryptStorage, decryptStorage, exportEncryptedData, importEncryptedData } = require('../../utils/crypto');

Page({
  data: {
    nickname: '',
    avatarInitial: '心',
    storageMode: 'local',
    storageModeText: '仅本地存储',
    dailyReminder: false,
    reminderTime: '21:30',

    themeOptions: ['浅色', '夜间', '跟随系统'],
    themeIndex: 0,
    themeText: '浅色',
    followMoodBg: true,
    fontOptions: ['默认', '大号'],
    fontIndex: 0,
    fontText: '默认',
    reduceMotion: false,

    themeClass: '',
    fontClass: '',
    reduceMotionClass: ''
  },

  onShow() {
    const nickname = wx.getStorageSync('nickname') || '';
    const storageMode = wx.getStorageSync('storageMode') || 'local';
    const dailyReminder = wx.getStorageSync('dailyReminder') || false;
    const reminderTime = wx.getStorageSync('reminderTime') || '21:30';
    const initial = nickname ? nickname[0] : '心';
    const storageModeText =
      storageMode === 'encrypted' ? '加密本地存储' : '仅本地存储';

    const ap = getAppearance();
    const themeResolved = resolveTheme(ap.theme);
    applyTheme(themeResolved);

    const themeIndex = ap.theme === 'dark' ? 1 : ap.theme === 'system' ? 2 : 0;
    const themeText = this.data.themeOptions[themeIndex];
    const fontIndex = ap.fontScale === 'large' ? 1 : 0;
    const fontText = this.data.fontOptions[fontIndex];

    this.setData({
      nickname,
      storageMode,
      storageModeText,
      dailyReminder,
      reminderTime,
      avatarInitial: initial,

      themeIndex,
      themeText,
      followMoodBg: !!ap.followMoodBg,
      fontIndex,
      fontText,
      reduceMotion: !!ap.reduceMotion,

      themeClass: themeResolved === 'dark' ? 'theme--dark' : '',
      fontClass: ap.fontScale === 'large' ? 'font--large' : '',
      reduceMotionClass: ap.reduceMotion ? 'reduce-motion' : ''
    });
  },

  changeStorageMode() {
    const that = this;
    wx.showActionSheet({
      itemList: ['仅本地存储', '加密本地存储'],
      success(res) {
        const index = res.tapIndex;
        const mode = index === 1 ? 'encrypted' : 'local';
        const text = mode === 'encrypted' ? '加密本地存储' : '仅本地存储';
        that.setData({ storageMode: mode, storageModeText: text });
        wx.setStorageSync('storageMode', mode);
        
        // 如果切换到加密存储，将现有数据加密
        if (mode === 'encrypted') {
          // 获取现有数据
          const nickname = wx.getStorageSync('nickname') || '';
          const dailyReminder = wx.getStorageSync('dailyReminder') || false;
          const reminderTime = wx.getStorageSync('reminderTime') || '21:30';
          
          // 加密存储
          encryptStorage('nickname', nickname);
          encryptStorage('dailyReminder', dailyReminder);
          encryptStorage('reminderTime', reminderTime);
          
          wx.showToast({
            title: '已切换到加密存储',
            icon: 'success'
          });
        }
      }
    });
  },

  exportData() {
    try {
      // 导出加密数据
      const exportData = exportEncryptedData();
      
      if (exportData) {
        // 将数据转换为JSON字符串
        const dataStr = JSON.stringify(exportData);
        
        // 保存为文件
        wx.setStorageSync('exportedData', dataStr);
        
        wx.showToast({
          title: '数据导出成功',
          icon: 'success'
        });
        
        // 实际项目中可以使用 wx.saveFile 或其他方式保存文件
        console.log('导出的数据:', exportData);
      } else {
        wx.showToast({
          title: '导出失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('导出数据失败:', error);
      wx.showToast({
        title: '导出失败',
        icon: 'none'
      });
    }
  },

  clearAllData() {
    wx.showModal({
      title: '确认清空所有数据？',
      content: '这会删除你的全部情绪记录和设置，且无法恢复，请谨慎操作。',
      confirmText: '仍要清空',
      confirmColor: '#E27A7A',
      success(res) {
        if (res.confirm) {
          wx.clearStorageSync();
          wx.showToast({
            title: '已清空',
            icon: 'success'
          });
        }
      }
    });
  },

  importData() {
    try {
      // 实际项目中可以使用 wx.chooseMessageFile 或其他方式选择文件
      // 这里使用模拟数据进行测试
      const exportedData = wx.getStorageSync('exportedData');
      
      if (exportedData) {
        const importData = JSON.parse(exportedData);
        const success = importEncryptedData(importData);
        
        if (success) {
          wx.showToast({
            title: '数据导入成功',
            icon: 'success'
          });
        } else {
          wx.showToast({
            title: '导入失败',
            icon: 'none'
          });
        }
      } else {
        wx.showToast({
          title: '没有找到导出数据',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('导入数据失败:', error);
      wx.showToast({
        title: '导入失败',
        icon: 'none'
      });
    }
  },

  toggleDailyReminder(e) {
    const value = e.detail.value;
    this.setData({
      dailyReminder: value
    });
    if (value) {
      // 检查存储模式
      const storageMode = wx.getStorageSync('storageMode') || 'local';
      if (storageMode === 'encrypted') {
        encryptStorage('dailyReminder', true);
        encryptStorage('reminderTime', this.data.reminderTime);
      } else {
        wx.setStorageSync('dailyReminder', true);
        wx.setStorageSync('reminderTime', this.data.reminderTime);
      }
      wx.showToast({
        title: '已开启每日提醒',
        icon: 'success'
      });
    } else {
      // 检查存储模式
      const storageMode = wx.getStorageSync('storageMode') || 'local';
      if (storageMode === 'encrypted') {
        encryptStorage('dailyReminder', false);
      } else {
        wx.setStorageSync('dailyReminder', false);
      }
      wx.showToast({
        title: '已关闭每日提醒',
        icon: 'success'
      });
    }
  },

  onReminderTimeChange(e) {
    const time = e.detail.value;
    this.setData({
      reminderTime: time
    });
    // 检查存储模式
    const storageMode = wx.getStorageSync('storageMode') || 'local';
    if (storageMode === 'encrypted') {
      encryptStorage('reminderTime', time);
    } else {
      wx.setStorageSync('reminderTime', time);
    }
    wx.showToast({
      title: '提醒时间已更新',
      icon: 'success'
    });
  },

  onThemeChange(e) {
    const idx = Number(e.detail.value || 0);
    const theme = idx === 1 ? 'dark' : idx === 2 ? 'system' : 'light';
    const next = setAppearance({ theme });
    const themeResolved = resolveTheme(next.theme);
    applyTheme(themeResolved);
    this.setData({
      themeIndex: idx,
      themeText: this.data.themeOptions[idx],
      themeClass: themeResolved === 'dark' ? 'theme--dark' : ''
    });
  },

  toggleFollowMoodBg(e) {
    const value = !!e.detail.value;
    setAppearance({ followMoodBg: value });
    this.setData({ followMoodBg: value });
  },

  onFontChange(e) {
    const idx = Number(e.detail.value || 0);
    const fontScale = idx === 1 ? 'large' : 'default';
    setAppearance({ fontScale });
    this.setData({
      fontIndex: idx,
      fontText: this.data.fontOptions[idx],
      fontClass: fontScale === 'large' ? 'font--large' : ''
    });
  },

  toggleReduceMotion(e) {
    const value = !!e.detail.value;
    setAppearance({ reduceMotion: value });
    this.setData({
      reduceMotion: value,
      reduceMotionClass: value ? 'reduce-motion' : ''
    });
  }
})
