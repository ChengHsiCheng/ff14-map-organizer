// 在瀏覽器環境中，我們將 mapPresets 定義為全域變數
// 這樣 App.js 就能直接存取 window.mapPresets
window.mapPresets = {
  '7.0 寶圖 (G17)': [
    {
      name: '奧闊帕恰山',
      priority: 1,
      points: [
        { name: '維查考那', x: 28.5, y: 13.8 },
        { name: '沃庫扎馬爾', x: 14.2, y: 9.3 }
      ]
    },
    {
      name: '高腳孤丘',
      priority: 2,
      points: [
        { name: '考札魯札里', x: 14.5, y: 12.5 },
        { name: '奧克漢札', x: 22.1, y: 35.8 }
      ]
    },
    {
      name: '亞科特萊',
      priority: 3,
      points: [
        { name: '伊奇特修', x: 13.0, y: 13.4 },
        { name: '穆努伊奇', x: 31.0, y: 17.5 }
      ]
    },
    {
      name: '謝羅里格荒野',
      priority: 4,
      points: [
        { name: '胡努馬里', x: 13.5, y: 11.0 },
        { name: '艾索哈恩', x: 32.0, y: 14.5 }
      ]
    },
    {
      name: '沙勞韋勒湖',
      priority: 5,
      points: [
        { name: '嘉利艾萊萊', x: 26.5, y: 13.6 },
        { name: '潘帕努卡洛', x: 14.3, y: 25.0 }
      ]
    },
    {
      name: '遺產之地',
      priority: 6,
      points: [
        { name: '亞歷山德里亞', x: 18.2, y: 11.5 },
        { name: '電氣城', x: 25.0, y: 30.0 }
      ]
    }
  ],
  '6.0 寶圖 (G15)': [
    {
      name: '嘆息海',
      priority: 1,
      points: [{ name: '最佳路徑', x: 20.0, y: 20.0 }]
    },
    {
      name: '埃爾皮斯',
      priority: 2,
      points: [{ name: '阿那格諾里西斯', x: 24.5, y: 24.5 }]
    }
  ]
};
