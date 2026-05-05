const DEFAULT_APPEARANCE = {
  theme: 'light', // light | dark | system
  followMoodBg: true,
  fontScale: 'default', // default | large
  reduceMotion: false
};

function getAppearance() {
  const saved = wx.getStorageSync('appearance');
  return { ...DEFAULT_APPEARANCE, ...(saved || {}) };
}

function setAppearance(patch) {
  const next = { ...getAppearance(), ...(patch || {}) };
  wx.setStorageSync('appearance', next);
  return next;
}

function resolveTheme(theme) {
  if (theme === 'system') {
    try {
      const sys = wx.getSystemInfoSync();
      // some base libs expose theme: 'dark' | 'light'
      if (sys && (sys.theme === 'dark' || sys.theme === 'light')) return sys.theme;
    } catch (e) {}
    return 'light';
  }
  return theme === 'dark' ? 'dark' : 'light';
}

function applyNavBar(themeResolved) {
  const isDark = themeResolved === 'dark';
  wx.setNavigationBarColor({
    frontColor: isDark ? '#ffffff' : '#000000',
    backgroundColor: isDark ? '#1F2123' : '#F7F5F2'
  });
}

function applyTabBar(themeResolved) {
  const isDark = themeResolved === 'dark';
  try {
    wx.setTabBarStyle({
      color: isDark ? 'rgba(255,255,255,0.65)' : '#666666',
      selectedColor: isDark ? '#4FB6B2' : '#2F6E9E',
      backgroundColor: isDark ? '#1F2123' : '#FFFFFF',
      borderStyle: isDark ? 'white' : 'black'
    });
  } catch (e) {}
}

function applyTheme(themeResolved) {
  applyNavBar(themeResolved);
  applyTabBar(themeResolved);
}

module.exports = {
  DEFAULT_APPEARANCE,
  getAppearance,
  setAppearance,
  resolveTheme,
  applyNavBar,
  applyTabBar,
  applyTheme
};
