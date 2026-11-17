// =============================================
//  知識庫圖解（自己畫的 SVG 示意圖，不需網路、沒有版權問題）
//  KFIGS[代號] = { cap: '圖說', svg: '<svg …>' }；在 knowledge.js 的主題加上 fig: '代號'
// =============================================
const KFIGS = (() => {
  const T = (x, y, s, o = {}) => `<text x="${x}" y="${y}" font-size="${o.size || 15}" font-weight="${o.w || 700}" fill="${o.c || '#343a40'}" text-anchor="${o.a || 'middle'}">${s}</text>`;
  const svg = (w, h, body) => `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" style="max-width:${w}px;width:100%;height:auto">${body}</svg>`;
  const arrow = (x1, y1, x2, y2, c = '#495057', w = 3) => { const a = Math.atan2(y2 - y1, x2 - x1), h = 10; return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}"/><polygon points="${x2},${y2} ${x2 - h * Math.cos(a - 0.45)},${y2 - h * Math.sin(a - 0.45)} ${x2 - h * Math.cos(a + 0.45)},${y2 - h * Math.sin(a + 0.45)}" fill="${c}"/>`; };
  const box = (x, y, w, h, fill, stroke, r = 10) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="2.5"/>`;
  const F = {};

  // ---------------- 自然 ----------------
  F.states = { cap: '水的三態變化：加熱往右，冷卻往左', svg: svg(460, 200,
    box(10, 60, 110, 80, '#e7f5ff', '#339af0') + T(65, 95, '冰') + T(65, 120, '固態', { size: 13, w: 500 }) +
    box(175, 60, 110, 80, '#d0ebff', '#1c7ed6') + T(230, 95, '水') + T(230, 120, '液態', { size: 13, w: 500 }) +
    box(340, 60, 110, 80, '#f8f9fa', '#868e96') + T(395, 95, '水蒸氣') + T(395, 120, '氣態', { size: 13, w: 500 }) +
    arrow(122, 80, 172, 80, '#e8590c') + T(147, 50, '融化', { c: '#e8590c', size: 14 }) + T(147, 30, '0°C', { size: 12, c: '#868e96' }) +
    arrow(172, 120, 122, 120, '#1971c2') + T(147, 160, '凝固', { c: '#1971c2', size: 14 }) +
    arrow(287, 80, 337, 80, '#e8590c') + T(312, 50, '蒸發／沸騰', { c: '#e8590c', size: 14 }) + T(312, 30, '100°C 沸騰', { size: 12, c: '#868e96' }) +
    arrow(337, 120, 287, 120, '#1971c2') + T(312, 160, '凝結', { c: '#1971c2', size: 14 }) +
    T(230, 192, '加熱（橘色）　冷卻（藍色）', { size: 12, w: 500, c: '#868e96' })) };

  F.insect = { cap: '昆蟲的身體：頭、胸、腹，6 隻腳都長在胸部', svg: svg(420, 220,
    `<g stroke="#5c3b00" stroke-width="3" fill="none">
      <path d="M150 85 Q120 40 95 30"/><path d="M160 82 Q150 35 135 20"/>
      <path d="M185 125 L150 175"/><path d="M200 128 L195 185"/><path d="M215 125 L250 180"/>
      <path d="M185 95 L150 55"/><path d="M200 92 L200 45"/><path d="M215 95 L250 55"/>
    </g>
    <circle cx="160" cy="105" r="22" fill="#ffd43b" stroke="#5c3b00" stroke-width="3"/>
    <ellipse cx="200" cy="110" rx="26" ry="20" fill="#ffa94d" stroke="#5c3b00" stroke-width="3"/>
    <ellipse cx="275" cy="112" rx="52" ry="26" fill="#ff922b" stroke="#5c3b00" stroke-width="3"/>
    <circle cx="153" cy="100" r="4" fill="#000"/>` +
    T(160, 210, '頭') + T(200, 210, '胸') + T(275, 210, '腹') +
    `<line x1="160" y1="128" x2="160" y2="193" stroke="#adb5bd" stroke-dasharray="3 3"/><line x1="200" y1="131" x2="200" y2="193" stroke="#adb5bd" stroke-dasharray="3 3"/><line x1="275" y1="139" x2="275" y2="193" stroke="#adb5bd" stroke-dasharray="3 3"/>` +
    T(90, 20, '觸角', { size: 13 }) + T(340, 60, '6 隻腳 → 胸部', { size: 13, c: '#e8590c' })) };

  F.meta = { cap: '完全變態有「蛹」，不完全變態沒有', svg: svg(460, 230,
    T(230, 22, '完全變態（蝴蝶、獨角仙）', { size: 15, c: '#c2255c' }) +
    [['卵', 40], ['幼蟲', 150], ['蛹', 260], ['成蟲', 370]].map(([s, x], i) => box(x, 35, 70, 46, ['#fff9db', '#d3f9d8', '#f1f3f5', '#ffe3ec'][i], '#c2255c') + T(x + 35, 64, s)).join('') +
    arrow(112, 58, 147, 58, '#c2255c') + arrow(222, 58, 257, 58, '#c2255c') + arrow(332, 58, 367, 58, '#c2255c') +
    T(230, 135, '不完全變態（蟋蟀、蝗蟲、螳螂）', { size: 15, c: '#1971c2' }) +
    [['卵', 75], ['若蟲', 195], ['成蟲', 315]].map(([s, x], i) => box(x, 148, 70, 46, ['#fff9db', '#d3f9d8', '#ffe3ec'][i], '#1971c2') + T(x + 35, 177, s)).join('') +
    arrow(147, 171, 192, 171, '#1971c2') + arrow(267, 171, 312, 171, '#1971c2') +
    T(230, 220, '若蟲長得和成蟲很像，只是比較小、沒有翅膀', { size: 12, w: 500, c: '#868e96' })) };

  const moon = (cx, phase) => {   // phase: new / first / full / last（北半球看）
    const r = 26;
    const dark = `<circle cx="${cx}" cy="70" r="${r}" fill="#495057"/>`;
    if (phase === 'new') return dark;
    if (phase === 'full') return `<circle cx="${cx}" cy="70" r="${r}" fill="#ffe066" stroke="#fab005" stroke-width="2"/>`;
    const right = phase === 'first';
    return dark + `<path d="M${cx} ${70 - r} A${r} ${r} 0 0 ${right ? 1 : 0} ${cx} ${70 + r} Z" fill="#ffe066"/>`;
  };
  F.moon = { cap: '月相變化（在臺灣看到的樣子），約 29.5 天一個循環', svg: svg(460, 150,
    [['new', '新月', '初一'], ['first', '上弦月', '初七、八'], ['full', '滿月', '十五'], ['last', '下弦月', '廿二、廿三']].map(([p, n, d], i) => { const cx = 60 + i * 113; return moon(cx, p) + T(cx, 120, n) + T(cx, 140, '農曆' + d, { size: 12, w: 500, c: '#868e96' }); }).join('') +
    T(230, 22, '上弦月亮在右半邊，下弦月亮在左半邊', { size: 13, w: 500, c: '#5f3dc4' })) };

  const magnet = (x, y, left, right) => `<rect x="${x}" y="${y}" width="60" height="34" fill="${left === 'N' ? '#ff6b6b' : '#4dabf7'}"/><rect x="${x + 60}" y="${y}" width="60" height="34" fill="${right === 'N' ? '#ff6b6b' : '#4dabf7'}"/>` + T(x + 30, y + 23, left, { c: '#fff' }) + T(x + 90, y + 23, right, { c: '#fff' });
  F.magnet = { cap: '磁鐵：同極相斥、異極相吸', svg: svg(440, 190,
    magnet(20, 30, 'S', 'N') + magnet(190, 30, 'S', 'N') + arrow(158, 47, 182, 47, '#2f9e44') + arrow(212, 47, 188, 47, '#2f9e44') + T(400, 52, '相吸', { c: '#2f9e44' }) +
    magnet(20, 120, 'S', 'N') + magnet(220, 120, 'N', 'S') + arrow(170, 137, 145, 137, '#e03131') + arrow(195, 137, 220, 137, '#e03131') + T(400, 142, '相斥', { c: '#e03131' }) +
    T(220, 100, 'N 對 S 會吸在一起，N 對 N 會推開', { size: 12, w: 500, c: '#868e96' })) };

  const bulb = (x, y) => `<circle cx="${x}" cy="${y}" r="14" fill="#fff3bf" stroke="#f08c00" stroke-width="2.5"/><path d="M${x - 6} ${y} l4 -6 l4 6 l4 -6" stroke="#f08c00" stroke-width="2" fill="none"/>`;
  const batt = (x, y) => `<line x1="${x}" y1="${y - 14}" x2="${x}" y2="${y + 14}" stroke="#212529" stroke-width="3"/><line x1="${x + 8}" y1="${y - 8}" x2="${x + 8}" y2="${y + 8}" stroke="#212529" stroke-width="5"/>` + T(x - 8, y - 18, '+', { size: 13 });
  F.circuit = { cap: '串聯：一條路，一顆壞全部不亮；並聯：分岔的路，互不影響', svg: svg(460, 210,
    T(110, 22, '串聯') + `<rect x="30" y="45" width="160" height="120" fill="none" stroke="#495057" stroke-width="3"/>` + `<rect x="100" y="150" width="20" height="30" fill="#fff"/>` + batt(102, 165) + bulb(75, 45) + bulb(145, 45) +
    T(340, 22, '並聯') + `<rect x="260" y="45" width="160" height="120" fill="none" stroke="#495057" stroke-width="3"/><line x1="260" y1="100" x2="420" y2="100" stroke="#495057" stroke-width="3"/>` + `<rect x="330" y="150" width="20" height="30" fill="#fff"/>` + batt(332, 165) + bulb(340, 45) + bulb(340, 100) +
    T(230, 202, '電池（長線是正極＋）　燈泡', { size: 12, w: 500, c: '#868e96' })) };

  F.lever = { cap: '槓桿三要素：支點、施力點、抗力點。施力臂越長越省力', svg: svg(460, 190,
    `<polygon points="160,120 140,160 180,160" fill="#868e96"/><rect x="40" y="108" width="380" height="12" rx="5" fill="#b08968"/>` +
    `<rect x="50" y="70" width="44" height="38" fill="#74c0fc" stroke="#1971c2" stroke-width="2"/>` + T(72, 94, '重物', { size: 12 }) +
    arrow(400, 40, 400, 102, '#e8590c', 4) + arrow(72, 120, 72, 150, '#1971c2', 3) +
    T(160, 182, '支點') + T(400, 30, '施力點', { c: '#e8590c' }) + T(72, 170, '抗力點', { c: '#1971c2' }) +
    `<line x1="160" y1="96" x2="400" y2="96" stroke="#e8590c" stroke-dasharray="5 4"/><line x1="72" y1="62" x2="160" y2="62" stroke="#1971c2" stroke-dasharray="5 4"/>` +
    T(280, 90, '施力臂（長）', { size: 12, c: '#e8590c' }) + T(116, 56, '抗力臂（短）', { size: 12, c: '#1971c2' })) };

  F.solar = { cap: '太陽系八大行星（由近到遠：水金地火木土天海；大小、距離不按比例）', svg: svg(500, 170,
    `<circle cx="-30" cy="85" r="85" fill="#ffd43b"/>` + T(25, 90, '太陽', { c: '#5c3b00' }) +
    [['水星', 6, '#adb5bd'], ['金星', 9, '#f4a261'], ['地球', 10, '#4dabf7'], ['火星', 7, '#e8590c'], ['木星', 26, '#d4a373'], ['土星', 21, '#e9c46a'], ['天王星', 14, '#99e9f2'], ['海王星', 14, '#4263eb']]
      .reduce((acc, [n, r, c]) => { const x = acc.x + acc.r + r + 12; acc.s += `<circle cx="${x}" cy="85" r="${r}" fill="${c}"/>` + (n === '土星' ? `<ellipse cx="${x}" cy="85" rx="${r + 10}" ry="5" fill="none" stroke="#b08968" stroke-width="2"/>` : '') + T(x, 85 + Math.max(r, 12) + 20, n, { size: 12 }); return { x, r, s: acc.s }; }, { x: 55, r: 0, s: '' }).s) };

  F.cell = { cap: '植物細胞有細胞壁、葉綠體和大液胞；動物細胞沒有', svg: svg(460, 220,
    T(115, 20, '植物細胞') + `<rect x="20" y="35" width="190" height="150" rx="6" fill="#d3f9d8" stroke="#2b8a3e" stroke-width="6"/><rect x="28" y="43" width="174" height="134" rx="4" fill="#ebfbee" stroke="#69db7c" stroke-width="2"/>` +
    `<ellipse cx="135" cy="110" rx="55" ry="45" fill="#e7f5ff" stroke="#74c0fc" stroke-width="2"/>` + `<circle cx="60" cy="80" r="16" fill="#b197fc" stroke="#7048e8" stroke-width="2"/>` +
    [[55, 150], [80, 160], [190, 70], [185, 150]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="10" ry="6" fill="#40c057"/>`).join('') +
    T(45, 205, '細胞核', { size: 12, c: '#7048e8' }) + T(135, 114, '液胞', { size: 12, c: '#1971c2' }) + T(185, 205, '葉綠體', { size: 12, c: '#2b8a3e' }) +
    T(345, 20, '動物細胞') + `<ellipse cx="345" cy="110" rx="95" ry="72" fill="#fff0f6" stroke="#f06595" stroke-width="2.5"/><circle cx="345" cy="110" r="22" fill="#b197fc" stroke="#7048e8" stroke-width="2"/>` +
    T(345, 115, '細胞核', { size: 12, c: '#fff' }) + T(345, 205, '細胞膜（沒有細胞壁）', { size: 12, c: '#c2255c' }) + T(115, 205, '細胞壁', { size: 12, c: '#2b8a3e' })) };

  F.photo = { cap: '光合作用：二氧化碳 ＋ 水 —（光、葉綠體）→ 葡萄糖 ＋ 氧氣', svg: svg(460, 220,
    `<circle cx="60" cy="50" r="30" fill="#ffd43b"/>` + T(60, 55, '陽光', { size: 13, c: '#5c3b00' }) + arrow(95, 65, 175, 100, '#fab005') +
    `<path d="M180 110 Q260 30 340 110 Q260 190 180 110 Z" fill="#69db7c" stroke="#2b8a3e" stroke-width="3"/><line x1="180" y1="110" x2="340" y2="110" stroke="#2b8a3e" stroke-width="2"/>` + T(260, 116, '葉子', { c: '#1b4332' }) +
    arrow(420, 50, 335, 85, '#868e96') + T(420, 40, '二氧化碳', { size: 13 }) +
    arrow(260, 205, 260, 150, '#1c7ed6') + T(330, 205, '水（從根運上來）', { size: 13, c: '#1c7ed6' }) +
    arrow(335, 135, 420, 170, '#2f9e44') + T(420, 190, '氧氣', { size: 13, c: '#2f9e44' }) +
    arrow(185, 125, 100, 165, '#e8590c') + T(80, 185, '養分（葡萄糖）', { size: 13, c: '#e8590c' })) };

  F.ph = { cap: 'pH 值：小於 7 是酸性、等於 7 中性、大於 7 鹼性', svg: svg(460, 150,
    Array.from({ length: 15 }, (_, i) => `<rect x="${20 + i * 28}" y="50" width="28" height="36" fill="hsl(${i * 18},75%,${55 + (i === 7 ? 10 : 0)}%)"/>` + T(34 + i * 28, 73, i, { size: 13, c: '#fff' })).join('') +
    T(80, 40, '← 酸性', { c: '#e03131' }) + T(230, 40, '中性', { c: '#2f9e44' }) + T(380, 40, '鹼性 →', { c: '#5f3dc4' }) +
    [[2, '檸檬汁'], [3, '醋'], [7, '純水'], [8.5, '小蘇打水'], [10, '肥皂水']].map(([v, n]) => `<line x1="${34 + v * 28}" y1="88" x2="${34 + v * 28}" y2="105" stroke="#495057" stroke-width="2"/>` + T(34 + v * 28, 122, n, { size: 12 })).join('')) };

  F.plant = { cap: '植物的構造和功能', svg: svg(440, 260,
    `<rect x="0" y="180" width="440" height="80" fill="#e9c46a" opacity=".45"/>` +
    `<path d="M200 180 L200 70" stroke="#2b8a3e" stroke-width="7"/>` +
    `<path d="M200 140 Q160 120 150 145 Q175 150 200 140" fill="#69db7c" stroke="#2b8a3e" stroke-width="2"/><path d="M200 115 Q245 90 255 118 Q228 125 200 115" fill="#69db7c" stroke="#2b8a3e" stroke-width="2"/>` +
    [0, 72, 144, 216, 288].map(a => `<ellipse cx="${200 + 16 * Math.cos(a * Math.PI / 180)}" cy="${55 + 16 * Math.sin(a * Math.PI / 180)}" rx="12" ry="8" transform="rotate(${a} ${200 + 16 * Math.cos(a * Math.PI / 180)} ${55 + 16 * Math.sin(a * Math.PI / 180)})" fill="#f783ac"/>`).join('') + `<circle cx="200" cy="55" r="9" fill="#ffd43b"/>` +
    `<g stroke="#8d6e63" stroke-width="3" fill="none"><path d="M200 180 L185 230"/><path d="M200 180 L215 235"/><path d="M200 185 L170 210"/><path d="M200 185 L232 212"/></g>` +
    T(300, 50, '花：開花後結果實、種子', { size: 13, a: 'start' }) + T(270, 110, '葉：行光合作用，製造養分', { size: 13, a: 'start' }) +
    T(215, 165, '莖：運送水分和養分', { size: 13, a: 'start' }) + T(240, 228, '根：吸收水分、固定植物', { size: 13, a: 'start' })) };

  F.seasons = { cap: '四季的成因：地軸傾斜約 23.5 度，太陽直射點在南北回歸線之間移動', svg: svg(460, 200,
    `<circle cx="70" cy="100" r="45" fill="#ffd43b"/>` + T(70, 105, '太陽', { c: '#5c3b00' }) +
    [0, 1, 2].map(i => arrow(120, 75 + i * 25, 260, 75 + i * 25, '#fab005', 2)).join('') +
    `<circle cx="330" cy="100" r="60" fill="#74c0fc" stroke="#1971c2" stroke-width="2"/>` +
    `<line x1="${330 - 75 * Math.sin(0.41)}" y1="${100 + 75 * Math.cos(0.41)}" x2="${330 + 75 * Math.sin(0.41)}" y2="${100 - 75 * Math.cos(0.41)}" stroke="#212529" stroke-width="3" stroke-dasharray="6 4"/>` +
    `<line x1="270" y1="100" x2="390" y2="100" stroke="#e03131" stroke-width="2"/>` + T(415, 104, '赤道', { size: 12, c: '#e03131' }) +
    T(330 + 75 * Math.sin(0.41) + 18, 100 - 75 * Math.cos(0.41), '地軸', { size: 12 }) + T(330, 190, '傾斜 23.5°：北半球朝向太陽時是夏天', { size: 13, c: '#1971c2' })) };

  // ---------------- 社會 ----------------
  const tw = [[121.54, 25.30], [121.75, 25.15], [122.0, 25.01], [121.85, 24.85], [121.87, 24.6], [121.62, 23.98], [121.51, 23.48], [121.38, 23.1], [121.15, 22.75], [120.9, 22.35], [120.85, 21.9], [120.73, 21.93], [120.59, 22.37], [120.28, 22.62], [120.16, 23.0], [120.08, 23.15], [120.15, 23.38], [120.15, 23.58], [120.4, 24.08], [120.52, 24.27], [120.7, 24.55], [120.92, 24.82], [121.05, 25.05], [121.41, 25.18]];
  const P = ([lon, lat]) => [((lon - 119.9) * 160).toFixed(1), ((25.45 - lat) * 160).toFixed(1)];
  const twPath = 'M' + tw.map(p => P(p).join(' ')).join(' L') + ' Z';
  const lab = (lon, lat, s, o) => { const [x, y] = P([lon, lat]); return T(x, y, s, o); };
  F.taiwan = { cap: '臺灣地形示意圖（比例不精確）', svg: svg(400, 590,
    `<rect width="400" height="590" fill="#e7f5ff"/><path d="${twPath}" fill="#d8f5a2" stroke="#5c940d" stroke-width="2.5"/>` +
    `<path d="M${P([121.55, 24.75]).join(' ')} Q${P([121.15, 23.6]).join(' ')} ${P([120.87, 22.25]).join(' ')}" stroke="#a0522d" stroke-width="12" fill="none" opacity=".75" stroke-linecap="round"/>` +
    lab(121.05, 23.95, '中央山脈', { size: 14, c: '#7f3b08' }) +
    (() => { const [x, y] = P([120.96, 23.47]); return `<polygon points="${x},${+y - 12} ${+x - 10},${+y + 6} ${+x + 10},${+y + 6}" fill="#7f3b08"/>` + T(+x + 38, +y + 4, '玉山', { size: 13, c: '#7f3b08' }); })() +
    `<line x1="0" y1="${P([0, 23.45])[1]}" x2="400" y2="${P([0, 23.45])[1]}" stroke="#e03131" stroke-width="2" stroke-dasharray="7 5"/>` + T(340, +P([0, 23.45])[1] - 6, '北回歸線', { size: 13, c: '#e03131' }) +
    `<path d="M${P([120.95, 23.82]).join(' ')} Q${P([120.6, 23.88]).join(' ')} ${P([120.22, 23.84]).join(' ')}" stroke="#1971c2" stroke-width="3.5" fill="none"/>` + lab(120.45, 24.0, '濁水溪', { size: 12, c: '#1971c2' }) +
    lab(120.35, 23.25, '嘉南平原', { size: 13, c: '#2b8a3e' }) + lab(120.5, 22.62, '屏東平原', { size: 12, c: '#2b8a3e' }) +
    lab(121.5, 25.05, '臺北盆地', { size: 12, c: '#2b8a3e' }) + lab(121.9, 24.72, '蘭陽平原', { size: 12, c: '#2b8a3e', a: 'start' }) + lab(120.68, 24.15, '臺中盆地', { size: 12, c: '#2b8a3e' }) +
    T(42, 175, '臺灣海峽', { size: 13, c: '#1864ab' }) + T(360, 420, '太平洋', { size: 14, c: '#1864ab' }) +
    `<g transform="translate(355,40)">${arrow(0, 30, 0, 0, '#212529', 2)}${T(0, 48, '北', { size: 13 })}</g>`) };

  F.timeline = { cap: '臺灣歷史時間軸', svg: svg(500, 170,
    `<line x1="15" y1="80" x2="485" y2="80" stroke="#495057" stroke-width="4"/>` +
    [['1624', '荷蘭', '#4dabf7'], ['1662', '鄭氏', '#ff922b'], ['1683', '清領', '#fab005'], ['1895', '日治', '#f06595'], ['1945', '戰後', '#40c057'], ['1987', '解嚴', '#845ef7'], ['1996', '總統直選', '#e64980']]
      .map(([y, n, c], i) => { const x = 35 + i * 72; return `<circle cx="${x}" cy="80" r="9" fill="${c}"/>` + T(x, i % 2 ? 120 : 50, y, { size: 14 }) + T(x, i % 2 ? 140 : 30, n, { size: 13, c }); }).join('') +
    T(250, 165, '1626 年西班牙也曾占領北臺灣', { size: 12, w: 500, c: '#868e96' })) };

  F.gov = { cap: '我國中央政府：總統與五院', svg: svg(500, 200,
    box(195, 10, 110, 44, '#ffe3e3', '#e03131') + T(250, 38, '總統') + `<line x1="250" y1="54" x2="250" y2="80" stroke="#495057" stroke-width="3"/><line x1="50" y1="80" x2="450" y2="80" stroke="#495057" stroke-width="3"/>` +
    [['行政院', '執行政策'], ['立法院', '制定法律'], ['司法院', '審判'], ['考試院', '考選公務員'], ['監察院', '彈劾、糾舉']].map(([n, d], i) => { const x = 50 + i * 100; return `<line x1="${x}" y1="80" x2="${x}" y2="100" stroke="#495057" stroke-width="3"/>` + box(x - 45, 100, 90, 70, ['#e7f5ff', '#fff4e6', '#f3f0ff', '#ebfbee', '#fff0f6'][i], '#495057') + T(x, 128, n, { size: 14 }) + T(x, 152, d, { size: 11, w: 500, c: '#495057' }); }).join('')) };

  F.local = { cap: '地方政府的層級', svg: svg(460, 220,
    [['中央政府', '#ffe3e3', '#e03131'], ['直轄市　／　縣（市）', '#fff4e6', '#e8590c'], ['區　／　鄉、鎮、市', '#ebfbee', '#2f9e44'], ['里　／　村', '#e7f5ff', '#1971c2']]
      .map(([n, f, s], i) => box(60 + i * 25, 10 + i * 52, 340 - i * 50, 40, f, s) + T(230, 36 + i * 52, n, { size: 14 }) + (i < 3 ? arrow(230, 50 + i * 52, 230, 62 + i * 52, '#495057', 2) : '')).join('') +
    T(230, 215, '6 個直轄市：臺北、新北、桃園、臺中、臺南、高雄', { size: 12, w: 500, c: '#868e96' })) };

  F.supply = { cap: '供需圖：兩線交會處決定市場價格', svg: svg(420, 260,
    arrow(50, 230, 50, 20, '#212529', 2) + arrow(50, 230, 390, 230, '#212529', 2) + T(50, 14, '價格', { size: 13 }) + T(395, 250, '數量', { size: 13, a: 'end' }) +
    `<line x1="80" y1="50" x2="350" y2="210" stroke="#1971c2" stroke-width="4"/><line x1="80" y1="210" x2="350" y2="50" stroke="#e03131" stroke-width="4"/>` +
    T(360, 215, '需求 D', { size: 13, c: '#1971c2', a: 'start' }) + T(355, 50, '供給 S', { size: 13, c: '#e03131', a: 'start' }) +
    `<circle cx="215" cy="130" r="7" fill="#212529"/>` + T(235, 125, '均衡點', { size: 13, a: 'start' }) +
    `<line x1="50" y1="130" x2="215" y2="130" stroke="#868e96" stroke-dasharray="5 4"/>` + T(30, 134, 'P', { size: 13 })) };

  F.continents = { cap: '七大洲面積比較（百萬平方公里，約略數字）', svg: svg(460, 250,
    [['亞洲', 44.6], ['非洲', 30.3], ['北美洲', 24.7], ['南美洲', 17.8], ['南極洲', 14.2], ['歐洲', 10.2], ['大洋洲', 8.5]]
      .map(([n, v], i) => { const w = v * 7.5; return T(70, 32 + i * 32, n, { size: 14, a: 'end' }) + `<rect x="80" y="${16 + i * 32}" width="${w}" height="22" rx="4" fill="${['#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c', '#74c0fc', '#b197fc', '#f783ac'][i]}"/>` + T(86 + w, 32 + i * 32, v, { size: 12, a: 'start', w: 500 }); }).join('')) };

  F.climate = { cap: '依緯度分成熱帶、溫帶、寒帶', svg: svg(420, 260,
    `<clipPath id="eclip"><circle cx="160" cy="130" r="110"/></clipPath><g clip-path="url(#eclip)">` +
    `<rect x="40" y="0" width="240" height="260" fill="#74c0fc"/>` +
    [[0, 40, '#a5d8ff'], [40, 76, '#b2f2bb'], [76, 102, '#ffd8a8'], [102, 158, '#ffa8a8'], [158, 184, '#ffd8a8'], [184, 220, '#b2f2bb'], [220, 260, '#a5d8ff']].map(([a, b, c]) => `<rect x="40" y="${a}" width="240" height="${b - a}" fill="${c}"/>`).join('') + '</g>' +
    `<circle cx="160" cy="130" r="110" fill="none" stroke="#495057" stroke-width="2"/>` +
    [[130, '赤道 0°', '#e03131'], [102, '北回歸線 23.5°N', '#e8590c'], [158, '南回歸線 23.5°S', '#e8590c'], [40, '北極圈 66.5°N', '#1971c2'], [220, '南極圈 66.5°S', '#1971c2']].map(([y, n, c]) => `<line x1="40" y1="${y}" x2="290" y2="${y}" stroke="${c}" stroke-width="1.5" stroke-dasharray="4 3"/>` + T(296, y + 4, n, { size: 12, c, a: 'start' })).join('') +
    T(160, 134, '熱帶', { size: 14 }) + T(160, 64, '溫帶', { size: 13 }) + T(160, 206, '溫帶', { size: 13 }) + T(160, 30, '寒帶', { size: 12 }) + T(160, 240, '寒帶', { size: 12 })) };

  F.phones = { cap: '重要的求救與服務電話', svg: svg(460, 130,
    [['110', '報警', '#1971c2'], ['119', '火災・救護', '#e03131'], ['165', '反詐騙', '#e8590c'], ['113', '保護專線', '#2f9e44']]
      .map(([n, d, c], i) => box(10 + i * 112, 15, 102, 100, '#fff', c, 14) + T(61 + i * 112, 65, n, { size: 30, w: 900, c }) + T(61 + i * 112, 95, d, { size: 13 })).join('')) };

  F.powers = { cap: '三權分立：行政、立法、司法互相制衡', svg: svg(420, 230,
    box(150, 10, 120, 50, '#fff4e6', '#e8590c') + T(210, 42, '行政') + box(20, 160, 120, 50, '#e7f5ff', '#1971c2') + T(80, 192, '立法') + box(280, 160, 120, 50, '#f3f0ff', '#7048e8') + T(340, 192, '司法') +
    arrow(170, 62, 100, 155, '#495057', 2) + arrow(110, 155, 180, 62, '#495057', 2) + arrow(250, 62, 320, 155, '#495057', 2) + arrow(310, 155, 240, 62, '#495057', 2) +
    arrow(145, 180, 275, 180, '#495057', 2) + arrow(275, 192, 145, 192, '#495057', 2) + T(210, 120, '制衡', { size: 16, c: '#c2255c' })) };

  return F;
})();
