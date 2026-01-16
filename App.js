const { useState, useMemo } = React;

function App() {
  const [rawData, setRawData] = useState('');
  const mapPresets = window.mapPresets;
  const [activeGroup, setActiveGroup] = useState(Object.keys(mapPresets)[0]);
  const currentSettings = mapPresets[activeGroup];

  const getDistance = (x1, y1, x2, y2) => Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));

  const parsedData = useMemo(() => {
    if (!rawData.trim()) return [];
    const lines = rawData.split('\n');
    const results = lines.map((line) => {
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
          player: playerName, mapName, x, y, closestPoint: bestPoint.name,
          dist: bestPoint.dist, priority: mapDef.priority
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
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: '#0f0f0f', color: '#e0e0e0', fontFamily: '"Microsoft JhengHei", sans-serif', overflow: 'hidden' }}>

      {/* 左側側邊欄 */}
      <div style={{ width: '260px', background: '#1a1a1a', borderRight: '1px solid #333', padding: '24px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', flexShrink: 0 }}>
        <h3 style={{ color: '#ffa726', fontSize: '1.2rem', marginBottom: '24px', borderLeft: '4px solid #ffa726', paddingLeft: '12px' }}>地圖組選擇</h3>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {Object.keys(mapPresets).map(groupName => (
            <button
              key={groupName}
              onClick={() => { setActiveGroup(groupName); setRawData(''); }}
              style={{
                width: '100%', padding: '12px 16px', marginBottom: '10px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                textAlign: 'left', fontSize: '14px', transition: 'all 0.2s',
                background: activeGroup === groupName ? '#ffa726' : '#2d2d2d',
                color: activeGroup === groupName ? '#000' : '#bbb',
                fontWeight: activeGroup === groupName ? 'bold' : 'normal'
              }}
            >
              {groupName}
            </button>
          ))}
        </div>

        <div style={{ background: '#252525', padding: '16px', borderRadius: '8px', border: '1px solid #333', marginTop: '20px' }}>
          <h4 style={{ color: '#888', fontSize: '11px', marginBottom: '8px', textTransform: 'uppercase' }}>當前區域清單</h4>
          <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
            {currentSettings.map((map, idx) => (
              <div key={idx} style={{ fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>
                <span style={{ color: '#ffa726', marginRight: '8px' }}>•</span> {map.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 右側主區域 */}
      <div style={{ flex: 1, padding: '30px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', overflow: 'hidden' }}>
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.5rem', margin: '0 0 4px 0', color: '#fff' }}>⚔️ 路線自動排序</h2>
          <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>當前模式：{activeGroup}</p>
        </div>

        <textarea
          value={rawData}
          onChange={(e) => setRawData(e.target.value)}
          placeholder="貼上聊天內容清單..."
          style={{
            width: '100%', height: '120px', background: '#1e1e1e', color: '#fff', border: '1px solid #444',
            padding: '16px', borderRadius: '8px', fontSize: '14px', outline: 'none', resize: 'none',
            boxSizing: 'border-box', marginBottom: '20px', flexShrink: 0
          }}
        />

        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <button
            onClick={copyChainFormat}
            disabled={parsedData.length === 0}
            style={{
              padding: '10px 24px', background: '#2e7d32', color: '#fff', border: 'none', borderRadius: '6px',
              cursor: 'pointer', fontWeight: 'bold', opacity: parsedData.length === 0 ? 0.5 : 1
            }}
          >
            📋 複製
          </button>
          <button
            onClick={() => setRawData('')}
            style={{ padding: '10px 24px', background: '#424242', color: '#eee', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            🗑️ 清空
          </button>
        </div>

        {/* 表格區塊 */}
        <div style={{ flex: 1, background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead style={{ position: 'sticky', top: 0, background: '#252525', zIndex: 1 }}>
                <tr>
                  <th style={{ padding: '12px 16px', color: '#ffa726', width: '50px' }}>#</th>
                  <th style={{ padding: '12px 16px' }}>玩家名稱</th>
                  <th style={{ padding: '12px 16px' }}>區域</th>
                  <th style={{ padding: '12px 16px' }}>傳送點</th>
                </tr>
              </thead>
              <tbody>
                {parsedData.map((item, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #2d2d2d' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 'bold', color: '#ffa726' }}>{index + 1}</td>
                    <td style={{ padding: '12px 16px', color: '#fff' }}>{item.player}</td>
                    <td style={{ padding: '12px 16px' }}>{item.mapName}</td>
                    <td style={{ padding: '12px 16px', color: '#64b5f6' }}>{item.closestPoint}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {parsedData.length === 0 && (
              <div style={{ padding: '40px', textAlign: 'center', color: '#444' }}>
                {rawData.trim() !== '' ? '⚠ 無相符座標' : '等待輸入...'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}