const { getAppearance, resolveTheme, applyTheme } = require('../../utils/appearance');

Page({
  data: {
    period: 'week',
    trendPoints: [],
    emotionStats: [],
    triggerStats: [],
    wordCloudData: [],
    summary: {
      overall: '记录还不太多，可以先从偶尔记上一两条开始，不必给自己太大压力。',
      positive: '你已经开始尝试用文字和语音面对自己的情绪，这是很重要的一步。',
      suggestion: '可以给自己设定一个温和的小目标，比如每周选择一天简单记录当日心情。'
    },
    headerText: '你的情绪报告',
    themeClass: '',
    fontClass: '',
    reduceMotionClass: ''
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
    this._refreshReport();
  },

  setPeriod(e) {
    const value = e.currentTarget.dataset.value || 'week';
    if (value === this.data.period) return;
    this.setData({ period: value });
    this._refreshReport();
  },

  _refreshReport() {
    const records = wx.getStorageSync('emotionRecords') || [];
    if (!records.length) {
      this.setData({
        trendPoints: [],
        emotionStats: [],
        triggerStats: [],
        summary: {
          overall: '目前的记录还比较少，暂时无法形成完整的趋势。',
          positive: '愿意开始记录本身就值得被肯定。',
          suggestion: '当你想起的时候，可以简单写下一句“今天整体还可以 / 有点累 / 有点期待”等。'
        },
        headerText: '开始记录你的情绪吧～'
      });
      return;
    }

    const now = new Date();
    const days = this.data.period === 'week' ? 7 : 30;
    const dateKeys = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      dateKeys.push(this._formatDateKey(d));
    }

    const grouped = {};
    records.forEach(r => {
      if (!dateKeys.includes(r.dateKey)) return;
      if (!grouped[r.dateKey]) grouped[r.dateKey] = [];
      grouped[r.dateKey].push(r);
    });

    const trendPoints = dateKeys.map(key => {
      const list = grouped[key] || [];
      const level = 
        list.length > 0
          ? Math.round(
              list.reduce((sum, item) => sum + (Number(item.moodLevel) || 3), 0) /
                list.length
            )
          : 0;
      const height = level === 0 ? 6 : 14 + level * 16;
      return {
        date: key,
        shortDate: key.slice(5),
        level,
        height: Math.min(height, 100)
      };
    });

    const emotionStats = this._calcEmotionStats(records, dateKeys);
    const triggerStats = this._calcTriggerStats(records, dateKeys);
    const wordCloudData = this._calcWordCloudData(records, dateKeys);
    const summary = this._buildSummary(records, dateKeys, emotionStats, triggerStats);
    const headerText = this._generateHeaderText(records, dateKeys, emotionStats);

    this.setData({
      trendPoints,
      emotionStats,
      triggerStats,
      wordCloudData,
      summary,
      headerText
    });
  },

  _generateHeaderText(records, dateKeys, emotionStats) {
    const inRange = records.filter(r => dateKeys.includes(r.dateKey));
    if (!inRange.length) {
      return '开始记录你的情绪吧～';
    }

    const avgLevel = 
      inRange.reduce((sum, item) => sum + (Number(item.moodLevel) || 3), 0) /
      inRange.length;

    const topEmotion = emotionStats[0]?.label || '';

    // 生成口语化表头
    if (avgLevel >= 4) {
      if (topEmotion.includes('开心') || topEmotion.includes('快乐')) {
        return '最近心情不错哦！';
      } else if (topEmotion.includes('期待')) {
        return '最近有很多期待的事情呢！';
      } else {
        return '最近状态挺稳定的，继续保持～';
      }
    } else if (avgLevel >= 3) {
      if (topEmotion.includes('平静')) {
        return '最近心态很平和，不错哦！';
      } else if (topEmotion.includes('焦虑') || topEmotion.includes('紧张')) {
        return '最近有点压力，慢慢来～';
      } else {
        return '最近情绪起起伏伏，都是正常的～';
      }
    } else {
      if (topEmotion.includes('疲惫') || topEmotion.includes('累')) {
        return '最近有点累，要好好照顾自己～';
      } else if (topEmotion.includes('难过') || topEmotion.includes('悲伤')) {
        return '最近有点低落，给自己一点时间～';
      } else {
        return '最近状态不太好，记得对自己好一点～';
      }
    }
  },

  _calcEmotionStats(records, dateKeys) {
    const counter = {};
    records.forEach(r => {
      if (!dateKeys.includes(r.dateKey)) return;
      const moods = r.moods || [];
      if (!moods.length && r.moodLabel) {
        moods.push(r.moodLabel);
      }
      moods.forEach(m => {
        counter[m] = (counter[m] || 0) + 1;
      });
    });

    const entries = Object.keys(counter).map(label => ({
      label,
      count: counter[label]
    }));
    const total = entries.reduce((sum, e) => sum + e.count, 0);
    if (!total) return [];

    return entries
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
      .map(e => ({
        label: e.label,
        percent: Math.max(6, Math.round((e.count / total) * 100))
      }));
  },

  _calcTriggerStats(records, dateKeys) {
    const counter = {};
    records.forEach(r => {
      if (!dateKeys.includes(r.dateKey)) return;
      const triggers = r.triggers || [];
      triggers.forEach(t => {
        counter[t] = (counter[t] || 0) + 1;
      });
    });

    const entries = Object.keys(counter).map(label => ({
      label,
      count: counter[label]
    }));
    const total = entries.reduce((sum, e) => sum + e.count, 0);
    if (!total) return [];

    return entries
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
      .map(e => ({
        label: e.label,
        percent: Math.max(6, Math.round((e.count / total) * 100))
      }));
  },

  _buildSummary(records, dateKeys, emotionStats, triggerStats) {
    const inRange = records.filter(r => dateKeys.includes(r.dateKey));
    if (!inRange.length) {
      return {
        overall: '这一段时间你的记录还比较少，可以慢慢来，不必着急。',
        positive: '重要的是，你已经开始关注自己的情绪，而不是忽略它们。',
        suggestion: '可以从每周挑一两天，在睡前简单写下“今天大致是什么感觉”。'
      };
    }

    const avgLevel =
      inRange.reduce((sum, item) => sum + (Number(item.moodLevel) || 3), 0) /
      inRange.length;

    let overall = '';
    if (avgLevel >= 4) {
      overall = '这段时间整体情绪状态偏向稳定和积极，说明你在慢慢找到自己的节奏。';
    } else if (avgLevel >= 3) {
      overall = '整体来说是比较平稳的一段时间，既有轻松时刻，也有压力和波动。';
    } else {
      overall = '最近这段时间，你的整体情绪偏向疲惫或低落，压力感可能比较明显。';
    }

    const topEmotion = emotionStats[0]?.label || '';
    const topTrigger = triggerStats[0]?.label || '';

    let positive = '你愿意把这些感受记录下来，本身就是在和情绪保持联系。';
    if (topEmotion.includes('开心') || topEmotion.includes('期待')) {
      positive =
        '你有不少开心或期待的时刻，可以多给自己一些肯定——你正在为自己创造这些瞬间。';
    } else if (topEmotion.includes('平静')) {
      positive =
        '“平静”在你的记录中比较常见，这说明你在某些时刻能够稳住自己，不被情绪完全带走。';
    }

    let suggestion =
      '如果遇到情绪很重、影响到日常生活的情况，也可以考虑向可信任的人或专业人士求助。';
    if (topTrigger) {
      suggestion = `在你的记录里，“${topTrigger}”出现得比较频繁，可以试着在这方面给自己一点缓冲空间，比如适当降低标准、提前规划，或者找一个你信任的人聊一聊。`;
    }

    return {
      overall,
      positive,
      suggestion
    };
  },

  _calcWordCloudData(records, dateKeys) {
    const stopWords = new Set([
      '的', '了', '是', '在', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这', '个', '那', '他', '她', '它', '们', '我', '你', '他', '她', '它', '这', '那', '和', '与', '或', '但', '而', '如果', '因为', '所以', '虽然', '但是', '然后', '接着', '而且', '并且', '或者', '还是', '不过', '只是', '已经', '曾经', '刚刚', '正在', '将要', '马上', '现在', '今天', '明天', '昨天', '后天', '前天', '早上', '上午', '中午', '下午', '晚上', '夜晚', '时候', '时间', '地方', '位置', '这里', '那里', '哪里', '什么', '怎么', '为什么', '多少', '多久', '多远', '很好', '不错', '可以', '不行', '好的', '是的', '不是', '对的', '错的', '是的', '好的', '行', '不行', '可以', '不可以', '能', '不能', '会', '不会', '应该', '不应该', '必须', '不必', '需要', '不需要', '想要', '不想要', '喜欢', '不喜欢', '爱', '不爱', '恨', '不恨', '高兴', '开心', '快乐', '愉快', '兴奋', '激动', '难过', '伤心', '悲伤', '痛苦', '愤怒', '生气', '烦躁', '焦虑', '紧张', '害怕', '恐惧', '担心', '担忧', '希望', '期望', '期待', '失望', '绝望', '满意', '不满意', '满足', '不满足', '幸福', '不幸福', '健康', '不健康', '累', '不累', '困', '不困', '饿', '不饿', '渴', '不渴', '热', '不热', '冷', '不冷', '舒服', '不舒服', '开心', '不开心', '快乐', '不快乐', '高兴', '不高兴', '兴奋', '不兴奋', '激动', '不激动', '难过', '不难过', '伤心', '不伤心', '悲伤', '不悲伤', '痛苦', '不痛苦', '愤怒', '不愤怒', '生气', '不生气', '烦躁', '不烦躁', '焦虑', '不焦虑', '紧张', '不紧张', '害怕', '不害怕', '恐惧', '不恐惧', '担心', '不担心', '担忧', '不担忧', '希望', '不希望', '期望', '不期望', '期待', '不期待', '失望', '不失望', '绝望', '不绝望', '满意', '不满意', '满足', '不满足', '幸福', '不幸福', '健康', '不健康', '累', '不累', '困', '不困', '饿', '不饿', '渴', '不渴', '热', '不热', '冷', '不冷', '舒服', '不舒服'
    ]);

    const wordCounter = {};
    records.forEach(r => {
      if (!dateKeys.includes(r.dateKey) || !r.content) return;
      
      // 提取中文词语（简单分词）
      const words = r.content.match(/[\u4e00-\u9fa5]{2,}/g) || [];
      words.forEach(word => {
        if (!stopWords.has(word) && word.length >= 2) {
          wordCounter[word] = (wordCounter[word] || 0) + 1;
        }
      });
    });

    // 转换为数组并排序
    const wordArray = Object.keys(wordCounter).map(word => ({
      word,
      count: wordCounter[word]
    })).sort((a, b) => b.count - a.count);

    if (wordArray.length === 0) return [];

    // 计算最大和最小词频
    const maxCount = wordArray[0].count;
    const minCount = wordArray[wordArray.length - 1].count;
    const countRange = maxCount - minCount || 1;

    // 生成词云数据
    return wordArray.slice(0, 30).map((item, index) => {
      // 计算字体大小（12-24px）
      const size = 12 + (item.count - minCount) / countRange * 12;
      // 计算透明度（0.6-1）
      const opacity = 0.6 + (item.count - minCount) / countRange * 0.4;
      return {
        word: item.word,
        size: Math.round(size * 10) / 10,
        opacity: Math.round(opacity * 10) / 10
      };
    });
  },

  _formatDateKey(date) {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
})
