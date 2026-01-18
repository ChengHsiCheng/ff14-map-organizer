const { useState, useMemo } = React;

function App() {
  const [rawData, setRawData] = useState('');
  const [currentPosRaw, setCurrentPosRaw] = useState('');
  const [nameLimit, setNameLimit] = useState(2);
  const [currentIndex, setCurrentIndex] = useState(0);
  const mapPresets = window.mapPresets;
  const [activeGroup, setActiveGroup] = useState(Object.keys(mapPresets)[0]);
  const currentSettings = mapPresets[activeGroup];

  const getDistance = (x1, y1, x2, y2) => Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));

  const parsedData = useMemo(() => {
    setCurrentIndex(0);
    if (!rawData.trim()) return [];

    const fullRegex = /(?:\[\d+:\d+\])?\s*(?:\((?:.+?)\)|(?:.+?)[:：])?\s*?(.+?)\s*\(\s*(\d+\.?\d*)\s*[\s,，]+\s*(\d+\.?\d*)\s*\)/;

    const startMatch = currentPosRaw.match(fullRegex);
    const startPoint = startMatch ? {
      mapName: startMatch[1].replace(/[\s]/g, '').trim(),
      x: parseFloat(startMatch[2]),
      y: parseFloat(startMatch[3])
    } : null;

    const lines = rawData.split('\n');
    const servers = ['伊弗利特', '迦樓羅', '利維坦', '鳳凰', '奧汀', '巴哈姆特', '泰坦', '希瓦', '拉姆', '利維亞桑', '莫古力', '白銀鄉'];

    const results = lines.map((line) => {
      const match = line.match(fullRegex);
      const nameRegex = /(?:\[\d+:\d+\])?\s*(?:\((?:.*?)([^\s\(\)]+)\)|([^:：\s]+)[:：])/;
      const nameMatch = line.match(nameRegex);

      if (match) {
        let playerName = '未知玩家';
        if (nameMatch) {
          playerName = (nameMatch[1] || nameMatch[2]).trim().replace(/[\uE000-\uF8FF]/g, '');
          servers.forEach(srv => {
            if (playerName.endsWith(srv)) {
              playerName = playerName.substring(0, playerName.length - srv.length);
            }
          });
          if (nameLimit !== "none" && playerName.length > nameLimit) {
            playerName = playerName.substring(0, nameLimit);
          }
        }

        const mapName = match[1].replace(/[\s]/g, '').trim();
        const x = parseFloat(match[2]);
        const y = parseFloat(match[3]);

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
      if (startPoint) {
        const aInStartMap = a.mapName === startPoint.mapName ? 0 : 1;
        const bInStartMap = b.mapName === startPoint.mapName ? 0 : 1;
        if (aInStartMap !== bInStartMap) return aInStartMap - bInStartMap;
        if (aInStartMap === 0 && bInStartMap === 0) {
          const distA = getDistance(a.x, a.y, startPoint.x, startPoint.y);
          const distB = getDistance(b.x, b.y, startPoint.x, startPoint.y);
          return distA - distB;
        }
      }
      if (a.priority !== b.priority) return a.priority - b.priority;
      if (a.closestPoint !== b.closestPoint) return a.closestPoint.localeCompare(b.closestPoint);
      return a.dist - b.dist;
    });
  }, [rawData, currentPosRaw, currentSettings, nameLimit]);

  const performCopy = (index) => {
    if (parsedData.length === 0 || index >= parsedData.length) return;
    const item = parsedData[index];
    let pointLabel = item.closestPoint;
    if (index > 0) {
      const prevItem = parsedData[index - 1];
      if (prevItem.closestPoint === item.closestPoint && prevItem.mapName === item.mapName) {
        pointLabel = "繼續";
      }
    }
    const text = `[${item.player}]  ${item.mapName} (${pointLabel}) (${item.x}, ${item.y})`;
    navigator.clipboard.writeText(text);
  };

  const copyChainFormat = () => {
    if (parsedData.length === 0) return;
    const chain = parsedData.map(item => item.player).join('  ');
    navigator.clipboard.writeText(chain);
    alert(`已複製完整順序：${chain}`);
  };

  const nextTargetAndCopy = () => {
    if (parsedData.length === 0) return;
    const nextIdx = (currentIndex + 1) % parsedData.length;
    setCurrentIndex(nextIdx);
    performCopy(nextIdx);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: '#0f0f0f', color: '#e0e0e0', fontFamily: '"Microsoft JhengHei", sans-serif', overflow: 'hidden' }}>
      <div style={{ width: '260px', background: '#1a1a1a', borderRight: '1px solid #333', padding: '24px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', flexShrink: 0 }}>
        <h3 style={{ color: '#ffa726', fontSize: '1.2rem', marginBottom: '24px', borderLeft: '4px solid #ffa726', paddingLeft: '12px' }}>地圖組選擇</h3>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {Object.keys(mapPresets).map(groupName => (
            <button key={groupName} onClick={() => { setActiveGroup(groupName); setRawData(''); setCurrentPosRaw(''); }}
              style={{
                width: '100%', padding: '12px 16px', marginBottom: '10px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                textAlign: 'left', fontSize: '14px', transition: 'all 0.2s',
                background: activeGroup === groupName ? '#ffa726' : '#2d2d2d',
                color: activeGroup === groupName ? '#000' : '#bbb',
                fontWeight: activeGroup === groupName ? 'bold' : 'normal'
              }}>
              {groupName}
            </button>
          ))}
        </div>
        <div style={{ background: '#252525', padding: '16px', borderRadius: '8px', border: '1px solid #333' }}>
          <h4 style={{ color: '#888', fontSize: '11px', marginBottom: '8px', textTransform: 'uppercase' }}>當前區域清單</h4>
          <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
            {currentSettings.map((map, idx) => (
              <div key={idx} style={{ fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>
                <span style={{ color: '#ffa726', marginRight: '8px' }}>•</span> {map.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, padding: '30px', display: 'flex', flexDirection: 'row', gap: '24px', boxSizing: 'border-box', overflow: 'hidden' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexShrink: 0 }}>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '1.5rem', margin: '0 0 4px 0', color: '#fff' }}>挖寶路線排序</h2>
              <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>當前模式：{activeGroup}</p>
            </div>
            <div style={{ width: '320px' }}>
              <span style={{ fontSize: '13px', color: '#ffa726', display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>📍 當前位置 (作為起點優先排序)</span>
              <input
                type="text"
                value={currentPosRaw}
                onChange={(e) => setCurrentPosRaw(e.target.value)}
                placeholder="貼上座標或聊天紀錄..."
                style={{
                  width: '100%', background: '#1e1e1e', color: '#ffa726', border: '1px solid #ffa726',
                  padding: '10px 14px', borderRadius: '6px', fontSize: '14px', outline: 'none',
                  boxSizing: 'border-box', height: '42px'
                }}
              />
            </div>
          </div>

          <textarea
            value={rawData}
            onChange={(e) => setRawData(e.target.value)}
            placeholder="貼上聊天內容清單..."
            style={{ width: '100%', height: '120px', background: '#1e1e1e', color: '#fff', border: '1px solid #444', padding: '16px', borderRadius: '8px', fontSize: '14px', outline: 'none', resize: 'none', boxSizing: 'border-box', marginBottom: '20px', flexShrink: 0 }}
          />

          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center', flexShrink: 0 }}>
            <button onClick={copyChainFormat} disabled={parsedData.length === 0} style={{ fontSize: '18px', padding: '10px 20px', background: '#2e7d32', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', opacity: parsedData.length === 0 ? 0.5 : 1 }}>📋 完整順序</button>
            <button onClick={() => performCopy(currentIndex)} disabled={parsedData.length === 0} style={{ fontSize: '18px', padding: '8px 16px', background: '#1565c0', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', opacity: parsedData.length === 0 ? 0.5 : 1 }}>🎯 複製當前</button>
            <button onClick={nextTargetAndCopy} disabled={parsedData.length === 0} style={{ fontSize: '18px', padding: '10px 20px', background: '#ffa726', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', opacity: parsedData.length === 0 ? 0.5 : 1 }}>下一位並複製 ➡</button>
            <div style={{ display: 'flex', alignItems: 'center', background: '#252525', padding: '4px 10px', borderRadius: '6px', border: '1px solid #444' }}>
              <span style={{ fontSize: '12px', color: '#aaa', marginRight: '8px' }}>字數:</span>
              <select value={nameLimit} onChange={(e) => setNameLimit(e.target.value === "none" ? "none" : parseInt(e.target.value))} style={{ background: '#fff', color: '#000', border: 'none', padding: '2px 6px', borderRadius: '4px', outline: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                {[2, 3, 4, 5, 6, 7, 8].map(num => <option key={num} value={num}>{num}</option>)}
                <option value="none">全部</option>
              </select>
            </div>
            <button onClick={() => { setRawData(''); setCurrentPosRaw(''); setCurrentIndex(0); }} style={{ padding: '10px 15px', background: '#424242', color: '#eee', border: 'none', borderRadius: '6px', cursor: 'pointer', marginLeft: 'auto' }}>🗑️ 清空</button>
          </div>

          <div style={{ flex: 1, background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead style={{ position: 'sticky', top: 0, background: '#252525', zIndex: 1 }}>
                  <tr>
                    <th style={{ padding: '12px 16px', color: '#ffa726', width: '50px' }}>#</th>
                    <th style={{ padding: '12px 16px' }}>玩家名稱</th>
                    <th style={{ padding: '12px 16px' }}>區域</th>
                    <th style={{ padding: '12px 16px' }}>傳送點</th>
                    <th style={{ padding: '12px 16px' }}>座標</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.map((item, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #2d2d2d', background: index === currentIndex ? 'rgba(255, 167, 38, 0.15)' : 'transparent', boxShadow: index === currentIndex ? 'inset 4px 0 0 #ffa726' : 'none' }}>
                      <td style={{ padding: '6px 16px', fontWeight: 'bold', color: index === currentIndex ? '#fff' : '#ffa726' }}>{index + 1}</td>
                      <td style={{ padding: '6px 16px', color: '#fff' }}>{item.player}</td>
                      <td style={{ padding: '6px 16px' }}>{item.mapName}</td>
                      <td style={{ padding: '6px 16px', color: '#64b5f6' }}>{item.closestPoint}</td>
                      <td style={{ padding: '6px 16px', color: '#888', fontSize: '12px' }}>({item.x}, {item.y})</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div style={{ width: '280px', background: 'rgba(255, 167, 38, 0.05)', border: '1px solid rgba(255, 167, 38, 0.2)', borderRadius: '12px', padding: '24px', boxSizing: 'border-box', flexShrink: 0 }}>
          <h3 style={{ color: '#ffa726', fontSize: '1rem', marginTop: 0, marginBottom: '16px' }}>💡 跑圖操作說明</h3>
          <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '13px', color: '#bbb', lineHeight: '1.8' }}>
            <li><b>📍 當前位置</b>：貼入目前座標。若你在地圖組內，該地圖的人會排到最前面，並按距離遠近排序。</li>
            <li>左邊選擇地圖。</li>
            <li>在上方輸入框貼上遊戲內聊天室座標清單。</li>
            <li>下方出現排序為正確。</li>
            <li>可以複製當前成員或切換至下一位成員。</li>
          </ul>
        </div>
      </div>
    </div>
  );
}