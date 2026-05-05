const { getAppearance, resolveTheme, applyTheme } = require('../../utils/appearance');

Page({
  data: {
    selectedDate: '',
    allRecords: [],
    filteredRecords: [],
    moodFilterOptions: ['不限', '开心', '平静', '疲惫', '焦虑', '紧张', '失落', '生气', '期待'],
    triggerFilterOptions: ['不限', '学业', '工作', '人际关系', '家庭', '睡眠', '身体状态', '金钱', '其他'],
    moodFilterIndex: 0,
    triggerFilterIndex: 0,
    moodFilterText: '不限',
    triggerFilterText: '不限',
    themeClass: '',
    fontClass: '',
    reduceMotionClass: ''
  },

  onLoad() {
    const today = this._formatDateKey(new Date());
    this.setData({
      selectedDate: today
    });
    this._loadRecords();
  },

  onShow() {
    const ap = getAppearance();
    const themeResolved = resolveTheme(ap.theme);
    applyTheme(themeResolved);
    this.setData({
      themeClass: themeResolved === 'dark' ? 'theme--dark' : '',
      fontClass: ap.fontScale === 'large' ? 'font--large' : '',
      reduceMotionClass: ap.reduceMotion ? 'reduce-motion' : ''
    });
    this._loadRecords();
  },

  onDateChange(e) {
    this.setData({
      selectedDate: e.detail.value
    });
    this._applyFilter();
  },

  onMoodFilterChange(e) {
    this.setData({
      moodFilterIndex: Number(e.detail.value || 0)
    });
    this._applyFilter();
  },

  onTriggerFilterChange(e) {
    this.setData({
      triggerFilterIndex: Number(e.detail.value || 0)
    });
    this._applyFilter();
  },

  _loadRecords() {
    const list = wx.getStorageSync('emotionRecords') || [];
    this.setData({
      allRecords: list
    });
    this._applyFilter();
  },

  _applyFilter() {
    const {
      selectedDate,
      allRecords,
      moodFilterIndex,
      triggerFilterIndex,
      moodFilterOptions,
      triggerFilterOptions
    } = this.data;
    const moodFilter = moodFilterOptions[moodFilterIndex];
    const triggerFilter = triggerFilterOptions[triggerFilterIndex];

    const filtered = allRecords.filter(item => {
      if (item.dateKey !== selectedDate) return false;
      if (moodFilter !== '不限') {
        const moods = item.moods || [];
        if (!moods.includes(moodFilter)) return false;
      }
      if (triggerFilter !== '不限') {
        const triggers = item.triggers || [];
        if (!triggers.includes(triggerFilter)) return false;
      }
      return true;
    });

    this.setData({
      filteredRecords: filtered,
      moodFilterText: moodFilter,
      triggerFilterText: triggerFilter
    });
  },

  _formatDateKey(date) {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
})
