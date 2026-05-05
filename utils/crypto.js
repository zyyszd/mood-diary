// 加密工具类

// 生成随机密钥
function generateKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = '';
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

// 生成随机IV
function generateIV() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let iv = '';
  for (let i = 0; i < 16; i++) {
    iv += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return iv;
}

// 加密数据
function encrypt(data, key, iv) {
  try {
    // 将数据转换为字符串
    const dataStr = typeof data === 'object' ? JSON.stringify(data) : String(data);
    
    // 使用微信小程序的加密API
    // 注意：实际使用时需要根据微信小程序的API进行调整
    // 这里使用模拟实现，实际项目中需要使用真实的加密API
    
    // 模拟加密过程 - 使用简单的编码方式
    return escape(dataStr);
  } catch (error) {
    console.error('加密失败:', error);
    // 降级处理：直接返回原始数据
    return data;
  }
}

// 解密数据
function decrypt(encryptedData, key, iv) {
  try {
    // 使用微信小程序的加密API
    // 注意：实际使用时需要根据微信小程序的API进行调整
    // 这里使用模拟实现，实际项目中需要使用真实的加密API
    
    // 模拟解密过程 - 使用简单的解码方式
    const decryptedStr = unescape(encryptedData);
    
    // 尝试解析为对象
    try {
      return JSON.parse(decryptedStr);
    } catch {
      return decryptedStr;
    }
  } catch (error) {
    console.error('解密失败:', error);
    // 降级处理：直接返回原始数据
    return encryptedData;
  }
}

// 加密存储数据
function encryptStorage(key, data) {
  try {
    // 获取或生成加密密钥
    let cryptoKey = wx.getStorageSync('cryptoKey');
    let cryptoIV = wx.getStorageSync('cryptoIV');
    
    if (!cryptoKey) {
      cryptoKey = generateKey();
      cryptoIV = generateIV();
      wx.setStorageSync('cryptoKey', cryptoKey);
      wx.setStorageSync('cryptoIV', cryptoIV);
    }
    
    // 加密数据
    const encryptedData = encrypt(data, cryptoKey, cryptoIV);
    
    // 存储加密后的数据
    wx.setStorageSync(`encrypted_${key}`, encryptedData);
    
    return true;
  } catch (error) {
    console.error('加密存储失败:', error);
    return false;
  }
}

// 解密获取数据
function decryptStorage(key) {
  try {
    // 获取加密密钥
    const cryptoKey = wx.getStorageSync('cryptoKey');
    const cryptoIV = wx.getStorageSync('cryptoIV');
    
    if (!cryptoKey) {
      return null;
    }
    
    // 获取加密数据
    const encryptedData = wx.getStorageSync(`encrypted_${key}`);
    
    if (!encryptedData) {
      return null;
    }
    
    // 解密数据
    const decryptedData = decrypt(encryptedData, cryptoKey, cryptoIV);
    
    return decryptedData;
  } catch (error) {
    console.error('解密获取失败:', error);
    return null;
  }
}

// 导出所有加密数据
function exportEncryptedData() {
  try {
    // 获取所有存储数据
    const keys = wx.getStorageInfoSync().keys;
    const exportData = {};
    
    // 筛选加密数据
    keys.forEach(key => {
      if (key.startsWith('encrypted_')) {
        const originalKey = key.replace('encrypted_', '');
        exportData[originalKey] = wx.getStorageSync(key);
      }
    });
    
    // 添加加密密钥（注意：实际项目中可能需要更安全的方式处理密钥）
    exportData.cryptoKey = wx.getStorageSync('cryptoKey');
    exportData.cryptoIV = wx.getStorageSync('cryptoIV');
    
    return exportData;
  } catch (error) {
    console.error('导出加密数据失败:', error);
    return null;
  }
}

// 导入加密数据
function importEncryptedData(data) {
  try {
    // 存储加密密钥
    if (data.cryptoKey && data.cryptoIV) {
      wx.setStorageSync('cryptoKey', data.cryptoKey);
      wx.setStorageSync('cryptoIV', data.cryptoIV);
    }
    
    // 存储加密数据
    Object.keys(data).forEach(key => {
      if (key !== 'cryptoKey' && key !== 'cryptoIV') {
        wx.setStorageSync(`encrypted_${key}`, data[key]);
      }
    });
    
    return true;
  } catch (error) {
    console.error('导入加密数据失败:', error);
    return false;
  }
}

module.exports = {
  encrypt,
  decrypt,
  encryptStorage,
  decryptStorage,
  exportEncryptedData,
  importEncryptedData
};