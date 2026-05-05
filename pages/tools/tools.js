const { getAppearance, resolveTheme, applyTheme } = require('../../utils/appearance');

const AFFIRMATIONS = [
  '已经撑到今天的你，其实比自己想象中更坚韧。',
  '你可以允许自己有状态不好的时候，这并不代表你不够好。',
  '哪怕今天只是活过来，也是值得被认可的一件事。',
  '你正在认真地面对自己的情绪，这很勇敢。',
  '可以慢一点，没有谁规定你一定要一直往前冲。',
  '那些你觉得不起眼的小进步，其实都在慢慢积累。'
];

Page({
  data: {
    breathStage: 'inhale',
    breathHint: '吸气 4 秒',
    breathTimer: null,
    bodyScanStep: 0,
    bodyScanHint: '点击开始，从头到脚温柔地感受一下自己的身体。',
    affirmation: AFFIRMATIONS[0],
    themeClass: '',
    fontClass: '',
    reduceMotionClass: '',
    reduceMotion: false
  },

  onShow() {
    const ap = getAppearance();
    const themeResolved = resolveTheme(ap.theme);
    applyTheme(themeResolved);
    this.setData({
      themeClass: themeResolved === 'dark' ? 'theme--dark' : '',
      fontClass: ap.fontScale === 'large' ? 'font--large' : '',
      reduceMotionClass: ap.reduceMotion ? 'reduce-motion' : '',
      reduceMotion: !!ap.reduceMotion
    });
  },

  onUnload() {
    if (this.data.breathTimer) {
      clearInterval(this.data.breathTimer);
    }
  },

  startBreathing() {
    if (this.data.reduceMotion) {
      wx.showToast({
        title: '已开启减少动效：请按 4 秒节拍缓慢呼吸',
        icon: 'none'
      });
      return;
    }
    if (this.data.breathTimer) {
      return;
    }
    let index = 0;
    const steps = [
      { stage: 'inhale', hint: '吸气 4 秒' },
      { stage: 'hold', hint: '屏住 4 秒' },
      { stage: 'exhale', hint: '呼气 4 秒' },
      { stage: 'hold', hint: '停留 4 秒' }
    ];

    this.setData({
      breathStage: steps[0].stage,
      breathHint: steps[0].hint
    });

    const timer = setInterval(() => {
      index = (index + 1) % steps.length;
      this.setData({
        breathStage: steps[index].stage,
        breathHint: steps[index].hint
      });
    }, 4000);

    this.setData({
      breathTimer: timer
    });
  },

  startBodyScan() {
    const steps = [
      '先把注意力放在呼吸上，感受空气进出鼻腔。',
      '留意一下头部和脸部，有没有哪块特别紧绷，可以轻轻放松。',
      '把注意力移到肩膀和背部，可以微微转动，让它们松一点。',
      '关注胸口和腹部的起伏，允许它们自然地呼吸。',
      '感觉一下双手和手指，注意是否攥得太紧，可以轻轻张开。',
      '最后，将注意力放到腿和脚，感受它们和地面的接触。'
    ];
    let step = this.data.bodyScanStep;
    step = (step + 1) % steps.length;
    this.setData({
      bodyScanStep: step,
      bodyScanHint: steps[step]
    });
  },

  randomAffirmation() {
    const index = Math.floor(Math.random() * AFFIRMATIONS.length);
    this.setData({
      affirmation: AFFIRMATIONS[index]
    });
  },

  recordAfterTool() {
    wx.switchTab({
      url: '/pages/record/record'
    });
  }
})
