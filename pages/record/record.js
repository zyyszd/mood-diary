const { getAppearance, resolveTheme, applyTheme } = require('../../utils/appearance');
const { getBaseUrl, isDebug } = require('../../utils/config');

const MOOD_TEXT = {
  1: '状态不太好，可以先照顾好自己。',
  2: '有点低落，试着慢慢放松一下。',
  3: '一般般，今天也算平稳的一天。',
  4: '整体还不错，可以好好享受当下。',
  5: '感觉很好，把这份感觉记下来吧！'
};

const ENCOURAGEMENT_TEXTS = [
  '情绪是内心的潮汐，允许它自然起伏，不必强求风平浪静。',
  '每一种感受都有它的重量，记录下来，便是与自己和解的开始。',
  '文字是情绪的容器，在这里，你可以坦诚地安放所有心事。',
  '不必完美，只需真实。你的每一笔，都是对自己的温柔。',
  '情绪无好坏，只是内心的信使，试着与它们温柔对话。',
  '记录不是为了评判，而是为了看见——看见真实的自己。',
  '每一次书写，都是与内心的一次和解，慢慢来，你已经很好。',
  '情绪如四季，有春的温暖，也有冬的凛冽，接纳它们，便是生活的智慧。',
  '在这里，你的感受被听见，你的故事被珍视，你被温柔以待。',
  '文字是时光的刻度，记录此刻，便是留给未来的礼物。'
];

const BACKEND_URL = getBaseUrl();

Page({
  data: {
    displayTime: '',
    moodLevel: 3,
    moodLabel: MOOD_TEXT[3],
    encouragementText: '',
    moodTags: [
      { label: '焦虑', value: '焦虑', active: false },
      { label: '疲惫', value: '疲惫', active: false },
      { label: '开心', value: '开心', active: false },
      { label: '平静', value: '平静', active: false },
      { label: '失落', value: '失落', active: false },
      { label: '生气', value: '生气', active: false },
      { label: '紧张', value: '紧张', active: false },
      { label: '期待', value: '期待', active: false },
      { label: '无奈', value: '无奈', active: false },
      { label: '惆怅', value: '惆怅', active: false },
      { label: '迷茫', value: '迷茫', active: false },
      { label: '纠结', value: '纠结', active: false },
      { label: '委屈', value: '委屈', active: false },
      { label: '感动', value: '感动', active: false },
      { label: '欣慰', value: '欣慰', active: false },
      { label: '满足', value: '满足', active: false },
      { label: '兴奋', value: '兴奋', active: false },
      { label: '愤怒', value: '愤怒', active: false },
      { label: '悲伤', value: '悲伤', active: false },
      { label: '孤独', value: '孤独', active: false }
    ],
    triggerTags: [
      { label: '学业', value: '学业', active: false },
      { label: '工作', value: '工作', active: false },
      { label: '人际关系', value: '人际关系', active: false },
      { label: '家庭', value: '家庭', active: false },
      { label: '睡眠', value: '睡眠', active: false },
      { label: '身体状态', value: '身体状态', active: false },
      { label: '金钱', value: '金钱', active: false },
      { label: '社交', value: '社交', active: false },
      { label: '恋爱', value: '恋爱', active: false },
      { label: '健康', value: '健康', active: false },
      { label: '学习', value: '学习', active: false },
      { label: '职场', value: '职场', active: false },
      { label: '财务', value: '财务', active: false },
      { label: '生活琐事', value: '生活琐事', active: false },
      { label: '兴趣爱好', value: '兴趣爱好', active: false },
      { label: '旅行', value: '旅行', active: false },
      { label: '家庭矛盾', value: '家庭矛盾', active: false },
      { label: '朋友关系', value: '朋友关系', active: false },
      { label: '个人成长', value: '个人成长', active: false },
      { label: '其他', value: '其他', active: false }
    ],
    content: '',
    isRecording: false,
    recordDuration: 0,
    audioFilePath: '',
    audioText: '',
    isTranscribing: false,
    isPlaying: false,
    aiPreview: null,
    themeClass: '',
    fontClass: '',
    reduceMotionClass: '',
    showAllMoodTags: false,
    showAllTriggerTags: false,
    aiInput: '',
    aiMessages: [],
    enableAiChat: false,
    recordError: ''
  },

  onShow() {
    this._refreshTime();
    const ap = getAppearance();
    const themeResolved = resolveTheme(ap.theme);
    applyTheme(themeResolved);

    const randomIndex = Math.floor(Math.random() * ENCOURAGEMENT_TEXTS.length);
    const randomEncouragement = ENCOURAGEMENT_TEXTS[randomIndex];

    this.setData({
      themeClass: themeResolved === 'dark' ? 'theme--dark' : '',
      fontClass: ap.fontScale === 'large' ? 'font--large' : '',
      reduceMotionClass: ap.reduceMotion ? 'reduce-motion' : '',
      encouragementText: randomEncouragement
    });

    this._initRecorder();
    this._initAudioPlayer();
  },

  onUnload() {
    if (this._recorderManager) {
      this._recorderManager.stop();
    }
    if (this._audioContext) {
      this._audioContext.destroy();
    }
  },

  onPullDownRefresh() {
    this._resetForm();
    wx.stopPullDownRefresh();
  },

  _refreshTime() {
    const now = new Date();
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    this.setData({
      displayTime: `${h}:${m}`
    });
  },

  _initRecorder() {
    this._recorderManager = wx.getRecorderManager();

    this._recorderManager.onStart(() => {
      this.setData({
        isRecording: true,
        recordDuration: 0,
        recordError: ''
      });
      this._startDurationTimer();
    });

    this._recorderManager.onStop((res) => {
      this._stopDurationTimer();
      const durationSec = Math.round(res.duration / 1000);

      if (res.tempFilePath) {
        this._saveAudioFile(res.tempFilePath, durationSec);
      }

      this.setData({
        isRecording: false,
        recordDuration: durationSec > 0 ? durationSec : 0
      });
    });

    this._recorderManager.onError((err) => {
      this._stopDurationTimer();
      let errorMsg = '录音失败';
      if (err.errMsg && err.errMsg.includes('auth deny')) {
        errorMsg = '请授权录音权限';
      } else if (err.errMsg && err.errMsg.includes('operate timeout')) {
        errorMsg = '录音超时，请重试';
      }
      this.setData({
        isRecording: false,
        recordError: errorMsg
      });
      wx.showToast({
        title: errorMsg,
        icon: 'none'
      });
    });
  },

  _initAudioPlayer() {
    this._audioContext = wx.createInnerAudioContext();

    this._audioContext.onPlay(() => {
      this.setData({ isPlaying: true });
    });

    this._audioContext.onEnded(() => {
      this.setData({ isPlaying: false });
    });

    this._audioContext.onError((err) => {
      this.setData({ isPlaying: false });
      wx.showToast({
        title: '播放失败',
        icon: 'none'
      });
    });
  },

  _startDurationTimer() {
    this._durationTimer = setInterval(() => {
      this.setData({
        recordDuration: this.data.recordDuration + 1
      });
    }, 1000);
  },

  _stopDurationTimer() {
    if (this._durationTimer) {
      clearInterval(this._durationTimer);
      this._durationTimer = null;
    }
  },

  _saveAudioFile(tempFilePath, duration) {
    const fileName = `record_${Date.now()}.mp3`;
    const savedFilePath = `${wx.env.USER_DATA_PATH}/${fileName}`;

    wx.saveFile({
      tempFilePath: tempFilePath,
      filePath: savedFilePath,
      success: (res) => {
        this.setData({
          audioFilePath: res.savedFilePath
        });
        wx.showToast({
          title: '录音已保存',
          icon: 'success',
          duration: 1000
        });
      },
      fail: (err) => {
        console.error('保存录音文件失败:', err);
        this.setData({
          audioFilePath: tempFilePath
        });
      }
    });
  },

  _transcribeAudio() {
    if (!this.data.audioFilePath) {
      return Promise.resolve('');
    }

    this.setData({ isTranscribing: true });

    return new Promise((resolve, reject) => {
      wx.uploadFile({
        url: `${BACKEND_URL}/api/audio-transcribe`,
        filePath: this.data.audioFilePath,
        name: 'file',
        success: (res) => {
          this.setData({ isTranscribing: false });
          if (res.statusCode === 200) {
            const data = JSON.parse(res.data);
            if (data.text) {
              resolve(data.text);
            } else {
              resolve('');
            }
          } else {
            resolve('');
          }
        },
        fail: (err) => {
          this.setData({ isTranscribing: false });
          console.error('语音转文字失败:', err);
          resolve('');
        }
      });
    });
  },

  playAudio() {
    if (!this.data.audioFilePath) {
      wx.showToast({
        title: '暂无录音',
        icon: 'none'
      });
      return;
    }

    if (this.data.isPlaying) {
      this._audioContext.stop();
      this.setData({ isPlaying: false });
    } else {
      this._audioContext.src = this.data.audioFilePath;
      this._audioContext.play();
    }
  },

  deleteAudio() {
    wx.showModal({
      title: '删除录音',
      content: '确定要删除这段录音吗？',
      success: (res) => {
        if (res.confirm) {
          if (this._audioContext) {
            this._audioContext.stop();
          }
          this.setData({
            audioFilePath: '',
            recordDuration: 0,
            audioText: '',
            isPlaying: false
          });
          wx.showToast({
            title: '已删除',
            icon: 'success'
          });
        }
      }
    });
  },

  startRecord() {
    if (this.data.isRecording) return;

    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.record']) {
          wx.authorize({
            scope: 'scope.record',
            success: () => {
              this._doStartRecord();
            },
            fail: () => {
              wx.showModal({
                title: '需要录音权限',
                content: '请在设置中开启录音权限，以便使用语音记录功能',
                confirmText: '去设置',
                success: (modalRes) => {
                  if (modalRes.confirm) {
                    wx.openSetting();
                  }
                }
              });
            }
          });
        } else {
          this._doStartRecord();
        }
      }
    });
  },

  _doStartRecord() {
    this._recorderManager.start({
      duration: 600000,
      sampleRate: 16000,
      encodeBitRate: 96000,
      format: 'mp3'
    });
  },

  stopRecord() {
    if (!this.data.isRecording) return;
    this._recorderManager.stop();
  },

  onMoodChange(e) {
    const value = Number(e.detail.value || 3);
    this.setData({
      moodLevel: value,
      moodLabel: MOOD_TEXT[value] || MOOD_TEXT[3]
    });
  },

  toggleMoodTag(e) {
    const value = e.currentTarget.dataset.value;
    const moodTags = this.data.moodTags.map(item => ({
      ...item,
      active: item.value === value ? !item.active : item.active
    }));
    this.setData({ moodTags });
  },

  toggleTriggerTag(e) {
    const value = e.currentTarget.dataset.value;
    const triggerTags = this.data.triggerTags.map(item => ({
      ...item,
      active: item.value === value ? !item.active : item.active
    }));
    this.setData({ triggerTags });
  },

  toggleMoodTags() {
    this.setData({ showAllMoodTags: !this.data.showAllMoodTags });
  },

  toggleTriggerTags() {
    this.setData({ showAllTriggerTags: !this.data.showAllTriggerTags });
  },

  getDisplayedMoodTags() {
    return this.data.showAllMoodTags ? this.data.moodTags : this.data.moodTags.slice(0, 8);
  },

  getDisplayedTriggerTags() {
    return this.data.showAllTriggerTags ? this.data.triggerTags : this.data.triggerTags.slice(0, 8);
  },

  onContentInput(e) {
    this.setData({
      content: e.detail.value
    });
  },

  onAiInput(e) {
    this.setData({
      aiInput: e.detail.value
    });
  },

  async transcribeAndFill() {
    if (!this.data.audioFilePath) {
      wx.showToast({
        title: '请先录音',
        icon: 'none'
      });
      return;
    }

    const text = await this._transcribeAudio();
    if (text) {
      const currentContent = this.data.content;
      const newContent = currentContent ? `${currentContent}\n${text}` : text;
      this.setData({
        content: newContent,
        audioText: text
      });
      wx.showToast({
        title: '已转为文字',
        icon: 'success'
      });
    } else {
      wx.showToast({
        title: '转写失败，请重试',
        icon: 'none'
      });
    }
  },

  sendAiMessage() {
    const input = this.data.aiInput.trim();
    if (!input) return;

    const newMessages = [...this.data.aiMessages, { type: 'user', content: input }];
    this.setData({
      aiMessages: newMessages,
      aiInput: '',
      enableAiChat: true
    });

    this._callChatApi(input).then(aiReply => {
      this.setData({
        aiMessages: [...newMessages, { type: 'ai', content: aiReply }]
      });
    });
  },

  async _callChatApi(userMessage) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${BACKEND_URL}/api/chat`,
        method: 'POST',
        header: {
          'Content-Type': 'application/json'
        },
        data: {
          message: userMessage,
          history: this.data.aiMessages.map(m => ({
            role: m.type === 'user' ? 'user' : 'assistant',
            content: m.content
          }))
        },
        success: (res) => {
          if (res.statusCode === 200 && res.data.reply) {
            resolve(res.data.reply);
          } else {
            resolve(this._fallbackReply(userMessage));
          }
        },
        fail: (err) => {
          console.error('Chat API 调用失败:', err);
          resolve(this._fallbackReply(userMessage));
        }
      });
    });
  },

  _fallbackReply(input) {
    if (input.includes('开心') || input.includes('高兴') || input.includes('快乐')) {
      return '很高兴听到你心情不错！能具体说说是什么让你这么开心吗？';
    } else if (input.includes('难过') || input.includes('伤心') || input.includes('悲伤')) {
      return '我能理解你现在的感受，难过是很正常的。如果你愿意，可以和我多聊聊。';
    } else if (input.includes('焦虑') || input.includes('担心') || input.includes('紧张')) {
      return '焦虑和紧张是很常见的情绪，试着深呼吸，慢慢放松。你在担心什么呢？';
    } else if (input.includes('累') || input.includes('疲惫') || input.includes('辛苦')) {
      return '听起来你最近很辛苦，记得要照顾好自己，适当休息。';
    } else {
      return '谢谢你和我分享这些。你现在感觉怎么样？';
    }
  },

  toggleAiChat() {
    this.setData({
      enableAiChat: !this.data.enableAiChat
    });
  },

  saveWithoutAnalysis() {
    this._saveRecord({ withAnalysis: false });
  },

  saveWithAnalysis() {
    this._saveRecord({ withAnalysis: true });
  },

  async _saveRecord({ withAnalysis }) {
    const now = new Date();
    const dateKey = this._formatDateKey(now);
    const time = this.data.displayTime;
    const selectedMoods = this.data.moodTags.filter(i => i.active).map(i => i.label);
    const selectedTriggers = this.data.triggerTags.filter(i => i.active).map(i => i.label);

    const content = this.data.content;

    if (!content && !selectedMoods.length && !this.data.audioFilePath) {
      wx.showToast({
        title: '可以先简单写一句话～',
        icon: 'none'
      });
      return;
    }

    if (withAnalysis) {
      wx.showLoading({
        title: '分析中...',
      });

      try {
        const aiPreview = await this._analyzeEmotion({
          moodLevel: this.data.moodLevel,
          moods: selectedMoods,
          triggers: selectedTriggers,
          content: content
        });
        this.setData({ aiPreview });

        const record = {
          id: Date.now(),
          dateKey,
          time,
          moodLevel: this.data.moodLevel,
          moodLabel: this.data.moodLabel,
          moods: selectedMoods,
          triggers: selectedTriggers,
          content: content,
          audioFilePath: this.data.audioFilePath || '',
          recordDuration: this.data.recordDuration,
          mainEmotion: aiPreview ? aiPreview.mainEmotion : (selectedMoods[0] || ''),
          analysis: aiPreview || null
        };

        const list = wx.getStorageSync('emotionRecords') || [];
        list.push(record);
        wx.setStorageSync('emotionRecords', list);

        wx.hideLoading();
        wx.showToast({
          title: '已保存',
          icon: 'success'
        });

        setTimeout(() => {
          wx.switchTab({
            url: '/pages/home/home'
          });
        }, 600);
      } catch (err) {
        wx.hideLoading();
        console.error('分析失败:', err);
        const aiPreview = this._mockAnalysis({
          moodLevel: this.data.moodLevel,
          moods: selectedMoods,
          triggers: selectedTriggers,
          content: content
        });

        const record = {
          id: Date.now(),
          dateKey,
          time,
          moodLevel: this.data.moodLevel,
          moodLabel: this.data.moodLabel,
          moods: selectedMoods,
          triggers: selectedTriggers,
          content: content,
          audioFilePath: this.data.audioFilePath || '',
          recordDuration: this.data.recordDuration,
          mainEmotion: aiPreview ? aiPreview.mainEmotion : (selectedMoods[0] || ''),
          analysis: aiPreview || null
        };

        const list = wx.getStorageSync('emotionRecords') || [];
        list.push(record);
        wx.setStorageSync('emotionRecords', list);

        wx.showToast({
          title: '已保存',
          icon: 'success'
        });

        setTimeout(() => {
          wx.switchTab({
            url: '/pages/home/home'
          });
        }, 600);
      }
    } else {
      const record = {
        id: Date.now(),
        dateKey,
        time,
        moodLevel: this.data.moodLevel,
        moodLabel: this.data.moodLabel,
        moods: selectedMoods,
        triggers: selectedTriggers,
        content: content,
        audioFilePath: this.data.audioFilePath || '',
        recordDuration: this.data.recordDuration,
        mainEmotion: selectedMoods[0] || '',
        analysis: null
      };

      const list = wx.getStorageSync('emotionRecords') || [];
      list.push(record);
      wx.setStorageSync('emotionRecords', list);

      wx.showToast({
        title: '已保存',
        icon: 'success'
      });

      setTimeout(() => {
        wx.switchTab({
          url: '/pages/home/home'
        });
      }, 600);
    }
  },

  _analyzeEmotion({ moodLevel, moods, triggers, content }) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${BACKEND_URL}/api/text-emotion`,
        method: 'POST',
        header: {
          'Content-Type': 'application/json'
        },
        data: { text: content },
        success: (res) => {
          if (res.statusCode === 200 && res.data.emotion) {
            resolve({
              mainEmotion: res.data.emotion,
              triggers: triggers.length ? triggers.join(' / ') : '暂时没有明显的触发事件',
              suggestion: this._generateSuggestion(res.data.emotion)
            });
          } else {
            resolve(this._mockAnalysis({ moodLevel, moods, triggers, content }));
          }
        },
        fail: () => {
          resolve(this._mockAnalysis({ moodLevel, moods, triggers, content }));
        }
      });
    });
  },

  _mockAnalysis({ moodLevel, moods, triggers, content }) {
    let mainEmotion = '有点复杂';
    if (moods.length) {
      mainEmotion = moods[0];
    } else if (moodLevel <= 2) {
      mainEmotion = '偏低落';
    } else if (moodLevel >= 4) {
      mainEmotion = '整体不错';
    }

    let triggerText = '暂时没有明显的触发事件';
    if (triggers.length) {
      triggerText = triggers.join(' / ');
    }

    return {
      mainEmotion,
      triggers: triggerText,
      suggestion: this._generateSuggestion(mainEmotion)
    };
  },

  _generateSuggestion(emotion) {
    const suggestions = {
      '开心': '可以记录下让你开心的小片段，以后心情不好时可以翻回来看看。',
      '期待': '期待是美好的，带着这份心情去面对生活吧。',
      '焦虑': '试着做 3 分钟深呼吸或短暂走动一下，让身体知道可以慢慢放松。',
      '紧张': '紧张是很正常的反应，试着深呼吸，给自己一点时间。',
      '疲惫': '也许可以给自己多一点休息时间，不需要总是那么用力。',
      '平静': '平静是很好的状态，享受这份宁静吧。',
      '失落': '失落的时候，允许自己难过，然后试着做一些让自己舒服的事情。',
      '生气': '生气是正常的，试着先离开让你生气的地方，深呼吸几次。',
      '悲伤': '悲伤需要被看见和释放，如果需要，可以找信任的人聊聊。',
      '孤独': '孤独感每个人都可能有，试着联系一下久未联系的朋友？'
    };
    return suggestions[emotion] || '谢谢你愿意把这些写下来，这本身就是在照顾自己。';
  },

  _formatDateKey(date) {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  },

  _resetForm() {
    const randomIndex = Math.floor(Math.random() * ENCOURAGEMENT_TEXTS.length);
    const randomEncouragement = ENCOURAGEMENT_TEXTS[randomIndex];

    if (this._audioContext) {
      this._audioContext.stop();
    }

    this.setData({
      moodLevel: 3,
      moodLabel: MOOD_TEXT[3],
      encouragementText: randomEncouragement,
      moodTags: this.data.moodTags.map(i => ({ ...i, active: false })),
      triggerTags: this.data.triggerTags.map(i => ({ ...i, active: false })),
      content: '',
      isRecording: false,
      recordDuration: 0,
      audioFilePath: '',
      audioText: '',
      isPlaying: false,
      aiPreview: null,
      aiInput: '',
      aiMessages: [],
      enableAiChat: false,
      recordError: ''
    });
    this._refreshTime();
  }
})