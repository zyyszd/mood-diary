const { getAppearance, resolveTheme, applyTheme } = require('../../utils/appearance');

Page({
  data: {
    nickname: '',
    greetingText: '',
    streakDays: 0,
    todaySummary: null,
    todayRecords: [],
    themeClass: '',
    fontClass: '',
    reduceMotionClass: '',
    bgClass: 'bg--neutral'
  },

  onShow() {
    const nickname = wx.getStorageSync('nickname') || '';
    const records = wx.getStorageSync('emotionRecords') || [];
    const todayStr = this._formatDateKey(new Date());

    const todayRecords = records.filter(item => item.dateKey === todayStr);
    const streakDays = this._calcStreakDays(records);
    const todaySummary = this._buildTodaySummary(todayRecords);

    const ap = getAppearance();
    const themeResolved = resolveTheme(ap.theme);
    applyTheme(themeResolved);

    const themeClass = themeResolved === 'dark' ? 'theme--dark' : '';
    const fontClass = ap.fontScale === 'large' ? 'font--large' : '';
    const reduceMotionClass = ap.reduceMotion ? 'reduce-motion' : '';
    const bgClass = ap.followMoodBg ? this._moodToBgClass(todaySummary) : 'bg--neutral';

    this.setData({
      nickname,
      greetingText: this._getGreetingText(),
      streakDays,
      todayRecords: todayRecords.map(r => ({
        id: r.id,
        time: r.time,
        emotion: r.mainEmotion || r.moodLabel || '未标记情绪',
        tags: r.triggers || []
      })),
      todaySummary,
      themeClass,
      fontClass,
      reduceMotionClass,
      bgClass
    });
  },

  goToRecord() {
    wx.switchTab({
      url: '/pages/record/record'
    });
  },

  goToRecordText() {
    wx.switchTab({
      url: '/pages/record/record'
    });
  },

  goToRecordVoice() {
    wx.switchTab({
      url: '/pages/record/record'
    });
  },

  goToReport() {
    wx.switchTab({
      url: '/pages/report/report'
    });
  },

  goToHistory() {
    wx.navigateTo({
      url: '/pages/history/history'
    });
  },

  _getGreetingText() {
    const hour = new Date().getHours();
    if (hour < 6) return '深夜了';
    if (hour < 11) return '早上好';
    if (hour < 14) return '中午好';
    if (hour < 18) return '下午好';
    return '晚上好';
  },

  _formatDateKey(date) {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  },

  _calcStreakDays(records) {
    if (!records.length) return 0;
    const uniqueDates = Array.from(
      new Set(records.map(r => r.dateKey))
    ).sort((a, b) => (a < b ? 1 : -1));

    let streak = 0;
    const today = new Date();
    for (let i = 0; i < uniqueDates.length; i++) {
      const targetDate = new Date();
      targetDate.setDate(today.getDate() - i);
      const key = this._formatDateKey(targetDate);
      if (uniqueDates.includes(key)) {
        streak += 1;
      } else {
        break;
      }
    }
    return streak;
  },

  _buildTodaySummary(todayRecords) {
    if (!todayRecords.length) return null;
    const last = todayRecords[todayRecords.length - 1];
    const label = last.mainEmotion || last.moodLabel || '有点复杂';
    let suggestion = '可以试着先关上屏幕，深呼吸一分钟。';
    if (label.includes('开心') || label.includes('期待') || label.includes('平静')) {
      suggestion = '把这份好的感觉记下来，以后心情不好时可以回来看。';
    } else if (label.includes('疲惫') || label.includes('困')) {
      suggestion = '你已经很努力了，可以允许自己先休息一下。';
    } else if (label.includes('焦虑') || label.includes('紧张')) {
      suggestion = '可以先专注在呼吸上 3 分钟，让身体慢慢放松。';
    }
    return {
      label,
      suggestion
    };
  },

  _moodToBgClass(todaySummary) {
    if (!todaySummary || !todaySummary.label) return 'bg--neutral';
    const label = todaySummary.label;
    if (label.includes('平静')) return 'bg--calm';
    if (label.includes('开心') || label.includes('期待')) return 'bg--warm';
    if (label.includes('焦虑') || label.includes('紧张') || label.includes('失落') || label.includes('生气')) {
      return 'bg--soft-negative';
    }
    return 'bg--neutral';
  }
})
