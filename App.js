// 注意：這裡移除了 import React, { useState, useMemo } from 'react';
// 因為它會由 index.html 中的 Babel Standalone 處理

// 讓 App 組件可以在全域被 index.html 引用
function App() {
  const [rawData, setRawData] = useState('');
  // mapPresets 現在從 window.mapPresets 取得
  const [activeGroup, setActiveGroup] = useState(Object.keys(window.mapPresets)[0]);

  const currentSettings = window.mapPresets[activeGroup];

  const getDistance = (x1, y1, x2, y2) => Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));

  const parsedData = useMemo(() => {
    if (!rawData.trim()) return [];
    const lines = rawData.split('\n');
    
    const results = lines.map((line, index) => {
      const regex = /(?:\[\d+:\d+\])?(?:(.+?)[:：])?\s*?(.+?)\s*\(\s*(\d+\.?\d*)\s*[,，]\s*(\d+\.?\d*)\s*\)/;
      const match = line.match(regex);

      if (match) {
        const playerName = match[1] ? match[1].trim() : '未知玩家';
        const mapName = match[2].replace(/[\s]/g, '').trim();
        const x = parseFloat(match[3]);
        const y = parseFloat(match[4]);

        const mapDef = currentSettings.find(m => m.name.trim() === mapName);
        if (!mapDef) return null;

        let bestPoint = { name: '未匹配', dist: 999 };
        mapDef.points.forEach(p => {
          const d = getDistance(x, y, p.x, p.y);
          if (d < bestPoint.dist) {
            bestPoint = { name: p.name, dist: d };
          }
        });

        return { 
          player: playerName, 
          mapName, 
          x, 
          y, 
          closestPoint: bestPoint.name, 
          dist: bestPoint.dist,
          priority: mapDef.priority 
        };
      }
      return null;
    }).filter(item => item !== null);

    return results.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      if (a.closestPoint !== b.closestPoint) return a.closestPoint.localeCompare(b.closestPoint);
      return a.dist - b.dist;
    });
  }, [rawData, currentSettings]);

  const copyChainFormat = () => {
    if (parsedData.length === 0) return;
    const chain = parsedData.map(item => item.player).join('=>');
    navigator.clipboard.writeText(chain);
    alert(`已複製順序：${chain}`);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#111', color: '#eee', fontFamily: 'sans-serif' }}>
      
      {/* 左側選單：組別切換 */}
      <div style={{ width: '280px', borderRight: '1px solid #333', padding: '20px', background: '#161616' }}>
        <h3 style={{ color: '#ff9800', marginBottom: '20px' }}>📁 選擇地圖組</h3>
        {Object.keys(window.mapPresets).map(groupName => (
          <button
            key={groupName}
            onClick={() => { setActiveGroup(groupName); setRawData(''); }}
            style={{
              width: '100%', padding: '12px', marginBottom: '8px', borderRadius: '4px', border: 'none', cursor: 'pointer',
              background: activeGroup === groupName ? '#ff9800' : '#2a2a2a',
              color: activeGroup === groupName ? '#000' : '#aaa',
              fontWeight: 'bold'
            }}
          >
            {groupName}
          </button>
        ))}

        <div style={{ marginTop: '30px', borderTop: '1px solid #333', paddingTop: '20px' }}>
          <h4 style={{ color: '#666', marginBottom: '10px' }}>當前有效區域</h4>
          {currentSettings.map((map, idx) => (
            <div key={idx} style={{ marginBottom: '5px', fontSize: '13px', color: '#888' }}>
              • {map.name}
            </div>
          ))}
          <p style={{ fontSize: '11px', color: '#444', marginTop: '10px' }}>※ 非以上區域之座標將自動忽略</p>
        </div>
      </div>

      {/* 右側：主介面 */}
      <div style={{ flex: 1, padding: '30px', display: 'flex', flexDirection: 'column' }}>
        <h2>⚔️ 路線自動排序 (組別過濾模式)</h2>

        <textarea
          value={rawData}
          onChange={(e) => setRawData(e.target.value)}
          placeholder="貼上聊天內容... (不屬於當前組別的地圖將不會顯示)"
          style={{ width: '100%', height: '120px', background: '#1e1e1e', color: '#fff', border: '1px solid #444', padding: '15px', borderRadius: '4px' }}
        />

        <div style={{ margin: '20px 0', display: 'flex', gap: '10px' }}>
          <button
            onClick={copyChainFormat}
            disabled={parsedData.length === 0}
            style={{ padding: '12px 30px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            📋 複製 A=>B=>C
          </button>
          <button onClick={() => setRawData('')} style={{ padding: '12px 30px', background: '#444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            🗑️ 清空
          </button>
        </div>

        <div style={{ flex: 1, background: '#181818', border: '1px solid #333', borderRadius: '8px', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#252525', color: '#ff9800' }}>
              <tr>
                <th style={{ padding: '15px' }}>順序</th>
                <th>玩家名稱</th>
                <th>區域</th>
                <th>最近傳送點</th>
                <th>相對距離</th>
              </tr>
            </thead>
            <tbody>
              {parsedData.map((item, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #2a2a2a' }}>
                  <td style={{ padding: '15px', color: '#ff9800', fontWeight: 'bold' }}>#{index + 1}</td>
                  <td>{item.player}</td>
                  <td>{item.mapName}</td>
                  <td style={{ color: '#4a90e2' }}>{item.closestPoint}</td>
                  <td style={{ color: '#666', fontSize: '12px' }}>{item.dist.toFixed(1)} y</td>
                </tr>
              ))}
            </tbody>
          </table>
          {parsedData.length === 0 && rawData.trim() !== '' && (
            <p style={{ textAlign: 'center', padding: '20px', color: '#e74c3c' }}>⚠ 偵測到的地圖不屬於「{activeGroup}」組別</p>
          )}
        </div>
      </div>
    </div>
  );
}

// 注意：這裡移除了 export default App;
// App 會直接成為一個全域函數，被 index.html 中的 Babel 渲染器調用
