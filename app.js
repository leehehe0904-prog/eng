'use strict';
/* =========================================================
   英文小冒險 English Adventure — 主程式
   ========================================================= */

/* ---------- 基本工具 ---------- */
const app = document.getElementById('app');
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const sample = (a, n) => shuffle(a).slice(0, n);
const pick = a => a[Math.floor(Math.random() * a.length)];
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const ABC = 'ABCD';
const PRAISE = ['Great! 好棒！', 'Good job! 做得好！', 'Excellent! 太厲害了！', 'Super! 超棒！', 'Well done! 很好！', 'Awesome! 讚！'];

const store = {
  get(k, d) { try { const v = localStorage.getItem('engAdv_' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('engAdv_' + k, JSON.stringify(v)); } catch (e) { /* 無痕模式等情況就不存 */ } },
};

for (const g of Object.values(GRADES)) {
  g.W = g.words.map(([en, zh, emoji]) => ({ en, zh, emoji }));
  g.S = g.sentences.map(([en, zh]) => ({ en, zh }));
}
const GRADE_KEYS = Object.keys(GRADES).filter(k => /^\d+$/.test(k));
const ALL_WORDS = GRADE_KEYS.flatMap(k => GRADES[k].W);

/* ---------- 語音朗讀（瀏覽器內建 TTS） ---------- */
const TTS = 'speechSynthesis' in window;
const VOICE = { en: null, m: null, f: null };
function pickVoices() {
  if (!TTS) return;
  const en = speechSynthesis.getVoices().filter(v => /^en[-_]/i.test(v.lang));
  const us = en.filter(v => /en[-_]US/i.test(v.lang));
  const pool = us.length ? us : en;
  VOICE.f = pool.find(v => /zira|samantha|jenny|aria|female|google us english|ava|allison|susan/i.test(v.name)) || null;
  VOICE.m = pool.find(v => /\b(david|mark|guy|alex|fred|daniel|christopher|eric|roger|tony)\b|(?<!fe)male/i.test(v.name)) || null;
  VOICE.en = VOICE.f || pool[0] || en[0] || null;
}
if (TTS) { pickVoices(); speechSynthesis.onvoiceschanged = pickVoices; }

function cleanForSpeech(t) {
  return String(t).replace(/\p{Extended_Pictographic}|️|‍/gu, ' ').replace(/_{2,}/g, ' blank ').replace(/\s+/g, ' ').trim();
}
function utter(text, o = {}) {
  const u = new SpeechSynthesisUtterance(cleanForSpeech(text));
  u.lang = 'en-US';
  u.rate = o.rate || 0.85;
  let v = VOICE.en, pitch = 1;
  if (o.who === 'M') { v = VOICE.m || VOICE.en; pitch = VOICE.m ? 1 : 0.6; }
  if (o.who === 'W') { v = VOICE.f || VOICE.en; pitch = VOICE.f ? 1 : 1.3; }
  if (v) u.voice = v;
  u.pitch = pitch;
  return u;
}
/** 依序念出多段文字。queue=true 時不打斷正在念的內容 */
function speakSeq(items, onEnd, queue) {
  if (!TTS) { onEnd && onEnd(); return; }
  if (!queue) speechSynthesis.cancel();
  setTimeout(() => {
    items.forEach((it, i) => {
      if (!cleanForSpeech(it.text)) return;
      const u = utter(it.text, it);
      if (i === items.length - 1 && onEnd) u.onend = onEnd;
      speechSynthesis.speak(u);
    });
  }, queue ? 0 : 80);
}
const speak = (text, rate) => speakSeq([{ text, rate }]);

document.addEventListener('click', e => {
  const b = e.target.closest('[data-say]');
  if (b) speak(b.dataset.say, b.dataset.slow ? 0.55 : 0.85);
});

/* ---------- 語音辨識（Chrome / Edge） ---------- */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let activeRec = null;
function recognize(btn, onText, o = {}) {
  if (!SR) { toast('這個瀏覽器不支援語音辨識，請改用 Chrome 或 Edge 🙏'); return; }
  if (activeRec) { activeRec.stop(); return; }
  if (TTS) speechSynthesis.cancel();
  const r = new SR();
  r.lang = 'en-US'; r.interimResults = false; r.continuous = !!o.continuous; r.maxAlternatives = 1;
  let text = '';
  const label = btn.innerHTML;
  r.onresult = e => { for (let i = e.resultIndex; i < e.results.length; i++) if (e.results[i].isFinal) text += ' ' + e.results[i][0].transcript; };
  r.onerror = e => {
    if (e.error === 'not-allowed' || e.error === 'service-not-allowed') toast('請允許瀏覽器使用麥克風 🎤');
    else if (e.error === 'no-speech') toast('沒有聽到聲音，再試一次 🎤');
    else if (e.error === 'network') toast('語音辨識需要網路連線');
  };
  r.onend = () => {
    activeRec = null;
    btn.classList.remove('rec'); btn.innerHTML = label;
    if (text.trim()) onText(text.trim());
  };
  btn.classList.add('rec');
  btn.innerHTML = o.recText || '⏹ 正在聽…（按這裡結束）';
  activeRec = r;
  try { r.start(); } catch (err) { activeRec = null; btn.classList.remove('rec'); btn.innerHTML = label; }
}

/* ---------- 音效、提示、彩帶 ---------- */
let actx = null;
function sfx(ok) {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const notes = ok ? [523, 659, 784] : [300, 220];
    notes.forEach((f, i) => {
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = ok ? 'triangle' : 'square';
      o.frequency.value = f;
      const t = actx.currentTime + i * 0.1;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(ok ? 0.18 : 0.06, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
      o.connect(g).connect(actx.destination);
      o.start(t); o.stop(t + 0.25);
    });
  } catch (e) { /* 沒有音效也沒關係 */ }
}
function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2800);
}
function confetti() {
  const items = ['🎉', '⭐', '🌟', '🎈', '✨', '🏆'];
  for (let i = 0; i < 28; i++) {
    const s = document.createElement('span');
    s.className = 'confetti';
    s.textContent = pick(items);
    s.style.left = Math.random() * 100 + 'vw';
    s.style.animationDelay = Math.random() * 0.8 + 's';
    s.style.fontSize = 18 + Math.random() * 22 + 'px';
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 3500);
  }
}

/* ---------- 文字處理 ---------- */
const stripP = t => t.replace(/^[^A-Za-z0-9']+|[^A-Za-z0-9']+$/g, '');
const tokens = s => s.split(/\s+/).map(stripP).filter(Boolean);
const endPunct = s => (s.trim().match(/[.?!]$/) || [''])[0];
const CONTR = {
  "it's": 'it is', "i'm": 'i am', "don't": 'do not', "doesn't": 'does not', "let's": 'let us', "what's": 'what is',
  "that's": 'that is', "can't": 'cannot', "isn't": 'is not', "aren't": 'are not', "you're": 'you are', "he's": 'he is',
  "she's": 'she is', "here's": 'here is', "how's": 'how is', "where's": 'where is', "there's": 'there is',
  "they're": 'they are', "we're": 'we are', "i'll": 'i will', "won't": 'will not', "didn't": 'did not',
  "wasn't": 'was not', "weren't": 'were not', "i'd": 'i would', "you'll": 'you will', "i've": 'i have', "who's": 'who is',
  okay: 'ok', mum: 'mom',
};
const NUMW = { 0: 'zero', 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten', 11: 'eleven', 12: 'twelve' };
function norm(s) {
  return String(s).toLowerCase().replace(/[’‘`]/g, "'")
    .replace(/[^a-z0-9'\s]/g, ' ')
    .split(/\s+/).filter(Boolean)
    .map(w => CONTR[w] || NUMW[w] || w.replace(/^'+|'+$/g, ''))
    .join(' ').replace(/\bcan not\b/g, 'cannot').trim();
}
/** 單字層級的相似度 0~1（用最長共同子序列） */
function similarity(target, said) {
  const a = norm(target).split(' ').filter(Boolean), b = norm(said).split(' ').filter(Boolean);
  if (!a.length || !b.length) return 0;
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
  return dp[a.length][b.length] / Math.max(a.length, b.length);
}
const countWords = s => (s.match(/[A-Za-z][A-Za-z']*/g) || []).length;

/** 寫作小老師：檢查大小寫、標點和常見文法錯誤 */
const GRAMMAR = [
  [/\ba\s+(?=[aeio])[a-z]+/i, '「$0」→ 母音開頭的字前面要用 an（例如 an apple）'],
  [/\ban\s+(?=[bcdfgjklmnpqrstvwxyz])[a-z]+/i, '「$0」→ 子音開頭的字前面要用 a（例如 a book）'],
  [/\bI\s+(is|are)\b/, '「$0」→ I 後面要用 am'],
  [/\b(he|she|it)\s+(are|am)\b/i, '「$0」→ he / she / it 後面要用 is'],
  [/\b(you|we|they)\s+(is|am)\b/i, '「$0」→ you / we / they 後面要用 are'],
  [/\b(he|she|it)\s+(have|don't|do not)\b/i, "「$0」→ he / she / it 要用 has / doesn't"],
  [/\bI\s+(has|doesn't|does not)\b/, "「$0」→ I 後面要用 have / don't"],
  [/\b(he|she|it)\s+(like|want|go|play|eat|need|love|live|watch|have)\s/i, '「$0」→ he / she / it 的現在式動詞要加 s（例如 she likes）'],
  [/\b(can|will|should|must|to)\s+(goes|likes|plays|eats|wants|went|played|ate|liked)\b/i, '「$0」→ can / will / should / to 後面要接原形動詞'],
  [/\b(didn't|did not|doesn't|does not|don't)\s+(went|played|ate|goes|likes|plays|eats|saw)\b/i, "「$0」→ didn't / doesn't / don't 後面要接原形動詞"],
  [/\b(yesterday|last\s+(?:night|week|weekend|sunday|monday|year|summer))\b.*\b(go|eat|play|see|is|are)\b/i, '這句有過去時間（yesterday / last ...），動詞要用過去式喔'],
  [/\b(\w+)\s+\1\b/i, '「$0」有重複的字'],
];
function checkWriting(text, must = []) {
  const out = [];
  const s = text.trim();
  if (!s) return [{ ok: false, msg: '先寫一點東西吧！' }];
  const n = countWords(s);
  if (/[一-鿿]/.test(s)) out.push({ ok: false, msg: '裡面有中文字，試著全部用英文寫喔！' });
  must.forEach(w => {
    const re = new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(s|es|ed|d|ing)?\\b`, 'i');
    out.push(re.test(s) ? { ok: true, msg: `有用到「${w}」` } : { ok: false, msg: `要用到「${w}」喔` });
  });
  const sents = s.split(/(?<=[.!?])\s+/).filter(Boolean);
  const badCap = sents.filter(x => /^[a-z]/.test(x));
  out.push(badCap.length
    ? { ok: false, msg: `句子開頭要大寫：${badCap.map(x => '「' + x.slice(0, 14) + (x.length > 14 ? '…' : '') + '」').join('、')}` }
    : { ok: true, msg: '句子開頭有大寫' });
  out.push(/[.!?]["”']?$/.test(s) ? { ok: true, msg: '句尾有標點符號' } : { ok: false, msg: '句子最後要加上 . 或 ? 或 !' });
  if (/(^|[^A-Za-z'])i([^A-Za-z']|$)/.test(s)) out.push({ ok: false, msg: '「i」（我）要寫成大寫的「I」' });
  if (n < 3) out.push({ ok: false, msg: '句子太短了，試著寫 3 個字以上' });
  else out.push({ ok: true, msg: `寫了 ${n} 個英文字` });
  GRAMMAR.forEach(([re, msg]) => { const m = s.match(re); if (m) out.push({ ok: false, msg: msg.replace('$0', m[0].trim()) }); });
  return out;
}
const checkListHtml = list => `<ul class="checks">${list.map(c => `<li class="${c.ok ? 'ok' : 'bad'}">${c.ok ? '✅' : '⚠️'} ${esc(c.msg)}</li>`).join('')}</ul>`;

/* ---------- 畫面切換 ---------- */
let leaveFns = [];
const onLeave = f => leaveFns.push(f);
function view(html, back) {
  leaveFns.forEach(f => { try { f(); } catch (e) { } });
  leaveFns = [];
  if (TTS) speechSynthesis.cancel();
  if (activeRec) { try { activeRec.abort(); } catch (e) { } activeRec = null; }
  app.innerHTML = html;
  window.scrollTo(0, 0);
  const b = $('[data-back]', app);
  if (b && back) b.onclick = back;
}
const bar = (title, right = '') => `<div class="topbar"><button class="back" data-back>⬅ 返回</button><h2>${title}</h2><div class="tb-right">${right}</div></div>`;
const starsOf = pct => (pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 40 ? 1 : 0);
const starsHtml = n => `<span class="stars">${'★'.repeat(n)}<i>${'★'.repeat(3 - n)}</i></span>`;
function saveBest(key, pct) { const b = store.get('best', {}); if (!(b[key] >= pct)) { b[key] = pct; store.set('best', b); } }
const bestOf = key => store.get('best', {})[key];
const modeCard = (id, icon, name, desc, extra = '') =>
  `<button class="mode" data-m="${id}"><span class="mi">${icon}</span><b>${name}</b><small>${desc}</small>${extra}</button>`;
const sayBtns = text => `<div class="say-row"><button class="say-big" data-say="${esc(text)}" title="再聽一次">🔊</button><button class="say-slow" data-say="${esc(text)}" data-slow="1">🐢 慢速</button></div>`;

/* =========================================================
   題型（單字・句子）
   每個題型：make(ctx) 產生題目，render(el, q, done) 畫出題目
   done(答對?, {en, zh, note, say}) 回報結果
   ========================================================= */
function optButtons(opts, cls = '') {
  return `<div class="options ${cls}">${opts.map((o, i) => `<button class="opt" data-i="${i}">${o}</button>`).join('')}</div>`;
}
function bindOpts(el, correct, done, rev, onPick) {
  const bs = $$('.opt', el);
  bs.forEach(b => b.onclick = () => {
    const i = +b.dataset.i;
    bs.forEach(x => x.disabled = true);
    bs[correct].classList.add('right');
    if (i !== correct) b.classList.add('wrong');
    onPick && onPick(i);
    done(i === correct, rev);
  });
}
function typeAnswer(el, check, done, rev, o = {}) {
  const box = document.createElement('div');
  box.className = 'type-box';
  box.innerHTML = `<input class="type-in" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${o.ph || '在這裡輸入英文'}"><button class="btn primary">✔ 檢查</button>`;
  el.appendChild(box);
  const inp = $('input', box), b = $('button', box);
  setTimeout(() => inp.focus({ preventScroll: true }), 50);
  const go = () => {
    if (!inp.value.trim()) { inp.focus(); return; }
    inp.disabled = b.disabled = true;
    const ok = check(inp.value);
    inp.classList.add(ok ? 'right' : 'wrong');
    o.after && o.after(inp.value, ok);
    done(ok, rev);
  };
  b.onclick = go;
  inp.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); go(); } };
}
function shuffleDiff(a) {
  if (new Set(a).size < 2) return a.slice();
  let s, n = 0;
  do { s = shuffle(a); } while (s.join('\u0001') === a.join('\u0001') && n++ < 20);
  return s;
}
/** 積木拼拼樂：點積木放上去，再點一次拿下來 */
function blockPuzzle(el, pieces, done, rev, o = {}) {
  const order = shuffleDiff(pieces);
  const w = document.createElement('div');
  w.className = 'blocks-wrap' + (o.letters ? ' letters' : '');
  w.innerHTML = `<div class="answer-line">${o.pre ? `<span class="fixed">${esc(o.pre)}</span>` : ''}<div class="answer-area"><span class="ph">點下面的積木排在這裡</span></div>${o.post ? `<span class="fixed">${esc(o.post)}</span>` : ''}</div>
    <div class="pool"></div>
    <div class="row center"><button class="btn ghost" data-reset>↺ 重來</button><button class="btn primary" data-check disabled>✔ 檢查</button></div>`;
  el.appendChild(w);
  const area = $('.answer-area', w), pool = $('.pool', w), chk = $('[data-check]', w);
  let finished = false;
  const upd = () => {
    const n = $$('.block', area).length;
    chk.disabled = n !== pieces.length;
    $('.ph', area) && ($('.ph', area).style.display = n ? 'none' : '');
  };
  order.forEach(p => {
    const b = document.createElement('button');
    b.className = 'block'; b.textContent = p;
    b.onclick = () => {
      if (finished || b.classList.contains('used')) return;
      b.classList.add('used');
      const c = document.createElement('button');
      c.className = 'block placed'; c.textContent = p;
      c.onclick = () => { if (finished) return; c.remove(); b.classList.remove('used'); upd(); };
      area.appendChild(c);
      upd();
    };
    pool.appendChild(b);
  });
  $('[data-reset]', w).onclick = () => {
    if (finished) return;
    $$('.block', area).forEach(x => x.remove());
    $$('.block', pool).forEach(x => x.classList.remove('used'));
    upd();
  };
  chk.onclick = () => {
    finished = true;
    const got = $$('.block', area).map(b => b.textContent);
    const ok = got.join('\u0001') === pieces.join('\u0001');
    area.classList.add(ok ? 'right' : 'wrong');
    chk.disabled = true;
    done(ok, rev);
  };
}
const wrev = w => ({ en: w.en, zh: w.zh });
const spellable = words => words.filter(w => /^[A-Za-z]{3,10}$/.test(w.en));
function findVocab(tok, words) {
  const t = tok.toLowerCase();
  return words.find(w => { const e = w.en.toLowerCase(); return t === e || t === e + 's' || t === e + 'es'; });
}

const Q = {
  listen: {
    label: '聽音選圖',
    make(c) { if (c.words.length < 4) return null; const a = pick(c.words); return { key: a.en, a, opts: shuffle([a, ...sample(c.words.filter(w => w !== a), 3)]) }; },
    render(el, q, done) {
      el.innerHTML = `<p class="ask">🎧 聽一聽，選出正確的圖</p>${sayBtns(q.a.en)}${optButtons(q.opts.map(o => `<span class="emo">${o.emoji}</span><small>${esc(o.zh)}</small>`), 'pics')}`;
      setTimeout(() => speak(q.a.en), 350);
      bindOpts(el, q.opts.indexOf(q.a), done, wrev(q.a));
    },
  },
  pic2word: {
    label: '看圖選字',
    make(c) { if (c.words.length < 4) return null; const a = pick(c.words); return { key: a.en, a, opts: shuffle([a, ...sample(c.words.filter(w => w !== a), 3)]) }; },
    render(el, q, done) {
      el.innerHTML = `<p class="ask">👀 這是什麼？選出正確的英文</p><div class="big-emo">${q.a.emoji}</div><div class="zh-big">${esc(q.a.zh)}</div>${optButtons(q.opts.map(o => esc(o.en)), 'words')}`;
      bindOpts(el, q.opts.indexOf(q.a), done, wrev(q.a));
    },
  },
  listenSpell: {
    label: '聽寫單字',
    make(c) { const ws = spellable(c.words); if (!ws.length) return null; const a = pick(ws); return { key: a.en, a }; },
    render(el, q, done) {
      el.innerHTML = `<p class="ask">✍️ 聽一聽，把單字拼出來</p>${sayBtns(q.a.en)}<p class="hint-letters">${'_ '.repeat(q.a.en.length)}（${q.a.en.length} 個字母）</p>`;
      setTimeout(() => speak(q.a.en), 350);
      typeAnswer(el, v => v.trim().toLowerCase() === q.a.en.toLowerCase(), done, wrev(q.a));
    },
  },
  typeWord: {
    label: '看圖拼字',
    make(c) { const ws = spellable(c.words); if (!ws.length) return null; const a = pick(ws); return { key: a.en, a }; },
    render(el, q, done) {
      el.innerHTML = `<p class="ask">✍️ 看圖，寫出英文單字</p><div class="big-emo">${q.a.emoji}</div><div class="zh-big">${esc(q.a.zh)}</div><p class="hint-letters">${esc(q.a.en[0])} ${'_ '.repeat(q.a.en.length - 1)}（${q.a.en.length} 個字母）</p>`;
      typeAnswer(el, v => v.trim().toLowerCase() === q.a.en.toLowerCase(), done, wrev(q.a));
    },
  },
  missingLetter: {
    label: '缺字母填空',
    make(c) {
      const ws = spellable(c.words); if (!ws.length) return null;
      const a = pick(ws); const idx = Math.floor(Math.random() * a.en.length);
      const letter = a.en[idx].toLowerCase();
      const others = shuffle('abcdefghijklmnopqrstuvwxyz'.split('').filter(x => x !== letter)).slice(0, 3);
      return { key: a.en, a, idx, letter, opts: shuffle([letter, ...others]) };
    },
    render(el, q, done) {
      const shown = esc(q.a.en.slice(0, q.idx)) + '<span class="blank">_</span>' + esc(q.a.en.slice(q.idx + 1));
      el.innerHTML = `<p class="ask">🔤 少了哪一個字母？</p><div class="big-emo sm">${q.a.emoji}</div><div class="word-show">${shown}</div><div class="zh-big sm">${esc(q.a.zh)} <button class="mini" data-say="${esc(q.a.en)}">🔊</button></div>${optButtons(q.opts.map(esc), 'letters')}`;
      bindOpts(el, q.opts.indexOf(q.letter), done, wrev(q.a), i => { $('.blank', el).textContent = q.opts[i]; });
    },
  },
  spellBlocks: {
    label: '字母積木',
    make(c) { const ws = spellable(c.words).filter(w => w.en.length <= 9); if (!ws.length) return null; const a = pick(ws); return { key: a.en, a }; },
    render(el, q, done) {
      el.innerHTML = `<p class="ask">🧱 用字母積木拼出單字</p><div class="big-emo sm">${q.a.emoji}</div><div class="zh-big sm">${esc(q.a.zh)} <button class="mini" data-say="${esc(q.a.en)}">🔊</button></div>`;
      blockPuzzle(el, q.a.en.split(''), done, wrev(q.a), { letters: true });
    },
  },
  fillSentence: {
    label: '句子填空',
    make(c) {
      const ss = c.sentences.filter(s => tokens(s.en).length >= 3); if (!ss.length) return null;
      const s = pick(ss); const raw = s.en.split(/\s+/);
      const cands = raw.map((w, i) => ({ t: stripP(w), i, v: findVocab(stripP(w), c.words) })).filter(x => x.i > 0 && x.t.length > 1);
      let ch = cands.filter(x => x.v); if (!ch.length) ch = cands.filter(x => x.t.length >= 3); if (!ch.length) ch = cands; if (!ch.length) return null;
      const x = pick(ch), ans = x.t;
      let pool;
      if (x.v) {
        const suffix = ans.slice(x.v.en.length);
        pool = c.words.filter(w => w !== x.v && /^[A-Za-z]+$/.test(w.en)).map(w => w.en + suffix);
      } else {
        pool = [...new Set(c.sentences.flatMap(z => tokens(z.en)))].filter(t => t.length >= 2 && t.toLowerCase() !== ans.toLowerCase());
      }
      pool = [...new Set(pool)].filter(p => p.toLowerCase() !== ans.toLowerCase());
      if (pool.length < 3) return null;
      const display = raw.map((w, i) => (i === x.i ? esc(w).replace(esc(ans), '<span class="blank">_____</span>') : esc(w))).join(' ');
      return { key: s.en, s, ans, display, opts: shuffle([ans, ...sample(pool, 3)]) };
    },
    render(el, q, done) {
      el.innerHTML = `<p class="ask">✏️ 選出正確的字填入空格</p><div class="sentence">${q.display}</div><div class="zh-big sm">${esc(q.s.zh)}</div>${optButtons(q.opts.map(esc), 'words')}`;
      bindOpts(el, q.opts.indexOf(q.ans), done, { en: q.s.en, zh: q.s.zh }, i => { $('.blank', el).textContent = q.opts[i]; });
    },
  },
  sentenceBlocks: {
    label: '句子積木',
    make(c) { const ss = c.sentences.filter(s => { const n = tokens(s.en).length; return n >= 3 && n <= 9; }); if (!ss.length) return null; const s = pick(ss); return { key: s.en, s }; },
    render(el, q, done) {
      el.innerHTML = `<p class="ask">🧱 把積木排成正確的句子</p><div class="zh-big">${esc(q.s.zh)} <button class="mini" data-say="${esc(q.s.en)}">🔊</button></div>`;
      blockPuzzle(el, tokens(q.s.en), done, { en: q.s.en, zh: q.s.zh }, { post: endPunct(q.s.en) });
    },
  },
  listenBlocks: {
    label: '聽句子排積木',
    make(c) { const ss = c.sentences.filter(s => { const n = tokens(s.en).length; return n >= 3 && n <= 9; }); if (!ss.length) return null; const s = pick(ss); return { key: s.en, s }; },
    render(el, q, done) {
      el.innerHTML = `<p class="ask">🎧 聽句子，把積木排出來</p>${sayBtns(q.s.en)}`;
      setTimeout(() => speak(q.s.en), 350);
      blockPuzzle(el, tokens(q.s.en), done, { en: q.s.en, zh: q.s.zh }, { post: endPunct(q.s.en) });
    },
  },
  listenSentenceZh: {
    label: '聽句子選意思',
    make(c) { if (c.sentences.length < 4) return null; const s = pick(c.sentences); return { key: s.en, s, opts: shuffle([s, ...sample(c.sentences.filter(x => x !== s), 3)]) }; },
    render(el, q, done) {
      el.innerHTML = `<p class="ask">🎧 聽一聽，這句話是什麼意思？</p>${sayBtns(q.s.en)}${optButtons(q.opts.map(o => esc(o.zh)), 'zh-opts')}`;
      setTimeout(() => speak(q.s.en), 350);
      bindOpts(el, q.opts.indexOf(q.s), done, { en: q.s.en, zh: q.s.zh });
    },
  },
  writeSentence: {
    label: '看中文寫句子',
    make(c) { if (!c.sentences.length) return null; const s = pick(c.sentences); return { key: s.en, s }; },
    render(el, q, done) {
      el.innerHTML = `<p class="ask">✍️ 把這句中文寫成英文</p><div class="zh-big">${esc(q.s.zh)}</div>
        <div class="row center"><button class="mini" data-hint>💡 提示</button><button class="mini" data-say="${esc(q.s.en)}">🔊 聽聽看</button></div><p class="hint-letters" hidden></p>`;
      $('[data-hint]', el).onclick = () => { const h = $('.hint-letters', el); h.hidden = false; h.textContent = tokens(q.s.en).map(t => t[0] + '_'.repeat(t.length - 1)).join(' ') + endPunct(q.s.en); };
      typeAnswer(el, v => norm(v) === norm(q.s.en), done, { en: q.s.en, zh: q.s.zh }, {
        ph: '寫出整句英文…',
        after(v, ok) {
          if (ok) return;
          const good = new Set(norm(q.s.en).split(' '));
          const d = document.createElement('div'); d.className = 'diff';
          d.innerHTML = '你寫的：' + v.trim().split(/\s+/).map(w => `<span class="${good.has(norm(w)) ? 'g' : 'r'}">${esc(w)}</span>`).join(' ');
          el.appendChild(d);
        },
      });
    },
  },
};

/* ---------- 英檢題型 ---------- */
const scriptOf = it => it.lines ? it.lines.map(([w, t]) => `${w === 'M' ? '男' : '女'}：${t}`).join('\n') : '';
Object.assign(Q, {
  gPic: {
    label: '聽力・看圖辨義',
    render(el, q, done) {
      const it = q.item;
      el.innerHTML = `<p class="ask">🎧 看圖片，聽問題和 A、B、C 三個選項，選出最符合圖片的答案</p><div class="pic-scene">${it.pic}</div><div class="say-row"><button class="say-big wide" data-play>🔊 播放題目</button></div>${optButtons(['A', 'B', 'C'], 'abc')}`;
      const play = () => speakSeq([{ text: it.q }, { text: 'A. ' + it.opts[0] }, { text: 'B. ' + it.opts[1] }, { text: 'C. ' + it.opts[2] }]);
      $('[data-play]', el).onclick = play; setTimeout(play, 400);
      bindOpts(el, it.a, done, { en: `${ABC[it.a]}. ${it.opts[it.a]}`, note: `📜 聽力內容：\n${it.q}\nA. ${it.opts[0]}\nB. ${it.opts[1]}\nC. ${it.opts[2]}`, say: false });
    },
  },
  gQA: {
    label: '聽力・問答',
    render(el, q, done) {
      const it = q.item;
      el.innerHTML = `<p class="ask">🎧 聽一句話，選出最適合的回應</p><div class="say-row"><button class="say-big wide" data-say="${esc(it.q)}">🔊 播放題目</button></div>${optButtons(it.opts.map((o, i) => `<b>${ABC[i]}.</b> ${esc(o)}`), 'text-opts')}`;
      setTimeout(() => speak(it.q), 400);
      bindOpts(el, it.a, done, { en: `${ABC[it.a]}. ${it.opts[it.a]}`, note: `📜 聽力內容：${it.q}`, say: false });
    },
  },
  gDialog: {
    label: '聽力・簡短對話',
    render(el, q, done) {
      const it = q.item;
      el.innerHTML = `<p class="ask">🎧 聽一段對話和問題，選出正確答案</p><div class="say-row"><button class="say-big wide" data-play>🔊 播放對話</button></div><p class="q-print">❓ ${esc(it.q)}</p>${optButtons(it.opts.map((o, i) => `<b>${ABC[i]}.</b> ${esc(o)}`), 'text-opts')}`;
      const play = () => speakSeq([...it.lines.map(([who, text]) => ({ who, text })), { text: 'Question: ' + it.q, rate: 0.8 }]);
      $('[data-play]', el).onclick = play; setTimeout(play, 400);
      bindOpts(el, it.a, done, { en: `${ABC[it.a]}. ${it.opts[it.a]}`, note: `📜 對話內容：\n${scriptOf(it)}`, say: false });
    },
  },
  gTalk: {
    label: '聽力・短文聽解',
    render(el, q, done) {
      const it = q.item;
      el.innerHTML = `<p class="ask">🎧 聽一段短文，選出正確的圖片</p><div class="say-row"><button class="say-big wide" data-play>🔊 播放短文</button></div><p class="q-print">❓ ${esc(it.q)}</p>${optButtons(it.opts.map((o, i) => `<span class="emo">${o}</span><small>${ABC[i]}</small>`), 'pics three')}`;
      const play = () => speakSeq([{ text: it.talk }, { text: 'Question: ' + it.q, rate: 0.8 }]);
      $('[data-play]', el).onclick = play; setTimeout(play, 400);
      bindOpts(el, it.a, done, { en: `${ABC[it.a]}. ${it.opts[it.a]}`, note: `📜 短文內容：${it.talk}`, say: false });
    },
  },
  gVocab: {
    label: '閱讀・詞彙',
    render(el, q, done) {
      const it = q.item;
      el.innerHTML = `<p class="ask">📖 選出最適合填入空格的答案</p><div class="sentence">${esc(it.q).replace(/_{3,}/, '<span class="blank">______</span>')}</div>${optButtons(it.opts.map((o, i) => `<b>${ABC[i]}.</b> ${esc(o)}`), 'text-opts two')}`;
      bindOpts(el, it.a, done, { en: `${ABC[it.a]}. ${it.opts[it.a]}`, zh: it.ex, say: false }, i => { $('.blank', el).textContent = it.opts[i]; });
    },
  },
  gCloze: {
    label: '閱讀・段落填空',
    render(el, q, done) {
      const it = q.item, n = q.n, b = it.blanks[n];
      const txt = esc(it.text).replace(/\[(\d)\]/g, (m, k) => `<span class="cz ${+k === n + 1 ? 'cur' : ''}">(${k}) ${+k === n + 1 ? '______' : '___'}</span>`);
      el.innerHTML = `<p class="ask">📖 閱讀短文，選出第 (${n + 1}) 格的答案</p><div class="passage"><h4>${esc(it.title)}</h4>${txt}</div>${optButtons(b.opts.map((o, i) => `<b>${ABC[i]}.</b> ${esc(o)}`), 'text-opts two')}`;
      bindOpts(el, b.a, done, { en: `(${n + 1}) ${ABC[b.a]}. ${b.opts[b.a]}`, zh: b.ex, say: false }, i => { $('.cz.cur', el).textContent = `(${n + 1}) ${b.opts[i]}`; });
    },
  },
  gComp: {
    label: '閱讀・閱讀理解',
    render(el, q, done) {
      const it = q.item, sq = it.qs[q.n];
      el.innerHTML = `<p class="ask">📖 閱讀下面的內容，回答問題</p><div class="passage"><h4>${esc(it.title)}</h4>${esc(it.text)}</div><p class="q-print">❓ ${esc(sq.q)}</p>${optButtons(sq.opts.map((o, i) => `<b>${ABC[i]}.</b> ${esc(o)}`), 'text-opts two')}`;
      bindOpts(el, sq.a, done, { en: `${ABC[sq.a]}. ${sq.opts[sq.a]}`, say: false });
    },
  },
  gRewrite: {
    label: '寫作・句子改寫',
    render(el, q, done) {
      const it = q.item;
      el.innerHTML = `<p class="ask">✍️ 依照指示改寫句子</p><div class="sentence">${esc(it.s)}</div><p class="task">👉 ${esc(it.task)}</p>`;
      typeAnswer(el, v => it.ans.some(a => norm(a) === norm(v)), done, { en: it.ans[0], zh: it.ans.length > 1 ? '也可以：' + it.ans.slice(1).join(' / ') : '' }, { ph: '寫出改寫後的整句…' });
    },
  },
  gCombine: {
    label: '寫作・句子合併',
    render(el, q, done) {
      const it = q.item;
      el.innerHTML = `<p class="ask">✍️ 用提示的字，把兩句合併成一句</p><div class="sentence">${esc(it.a)}<br>${esc(it.b)}</div><p class="task">👉 提示：<b>${esc(it.hint)}</b></p>`;
      typeAnswer(el, v => it.ans.some(a => norm(a) === norm(v)), done, { en: it.ans[0], zh: it.ans.length > 1 ? '也可以：' + it.ans.slice(1).join(' / ') : '' }, { ph: '寫出合併後的句子…' });
    },
  },
  gReorder: {
    label: '寫作・重組',
    render(el, q, done) {
      const it = q.item;
      const full = `${it.pre} ${it.parts.join(' ')}${it.post}`;
      el.innerHTML = `<p class="ask">🧱 把積木排成正確的句子</p>`;
      blockPuzzle(el, it.parts, done, { en: full }, { pre: it.pre, post: it.post });
    },
  },
});

/* =========================================================
   測驗引擎
   ========================================================= */
function buildQs(o) {
  const ctx = { words: o.words || [], sentences: o.sentences || [] };
  const qs = [], used = new Set();
  let guard = 0;
  while (qs.length < o.n && guard++ < 300) {
    const type = pick(o.types);
    const q = Q[type].make(ctx);
    if (!q) continue;
    const sig = type + ':' + q.key;
    if (used.has(sig) && guard < 200) continue;
    used.add(sig);
    q.type = type;
    qs.push(q);
  }
  return qs;
}

function runQuiz(o) {
  const qs = o.questions ? o.questions : buildQs(o);
  if (!qs.length) { toast('題目不夠，換一個練習吧！'); o.back(); return; }
  let i = 0, score = 0;
  const wrong = [], sec = {};
  next();

  function next() {
    if (i >= qs.length) return finish();
    const q = qs[i], T = Q[q.type];
    view(`${bar(esc(o.title))}
      <div class="progress"><div style="width:${(i / qs.length) * 100}%"></div></div>
      <div class="qmeta"><span>第 ${i + 1} / ${qs.length} 題・${T.label}</span><span class="sc">⭐ ${score}</span></div>
      <div class="card qcard"><div class="qbody"></div><div class="qfoot"></div></div>`, o.back);
    let answered = false;
    T.render($('.qbody'), q, (ok, rev) => {
      if (answered) return;
      answered = true;
      if (q.sec) { sec[q.sec] = sec[q.sec] || { ok: 0, n: 0 }; sec[q.sec].n++; if (ok) sec[q.sec].ok++; }
      if (ok) score++; else wrong.push(rev);
      sfx(ok);
      $('.sc').textContent = '⭐ ' + score;
      const foot = $('.qfoot');
      foot.innerHTML = `<div class="feedback ${ok ? 'ok' : 'bad'}">
          <div>${ok ? '✅ ' + pick(PRAISE) : '❌ 正確答案：'} <b>${esc(rev.en)}</b>${rev.say === false ? '' : ` <button class="mini" data-say="${esc(rev.en)}">🔊</button>`}</div>
          ${rev.zh ? `<div class="zh">${esc(rev.zh)}</div>` : ''}
          ${rev.note ? `<details class="note"><summary>看內容／解析</summary>${esc(rev.note)}</details>` : ''}
        </div>
        <button class="btn primary big" data-next>${i + 1 < qs.length ? '下一題 ➡' : '看成績 🏆'}</button>`;
      if (rev.say !== false) setTimeout(() => speak(rev.en), 500);
      const nb = $('[data-next]', foot);
      nb.onclick = () => { i++; next(); };
      setTimeout(() => { nb.focus({ preventScroll: true }); foot.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 60);
    });
  }

  function finish() {
    const pct = Math.round((score * 100) / qs.length), st = starsOf(pct);
    if (o.key) saveBest(o.key, pct);
    let mock = '';
    if (o.mock) {
      const L = Math.round(((sec.L?.ok || 0) / (sec.L?.n || 1)) * 120);
      const R = Math.round(((sec.R?.ok || 0) / (sec.R?.n || 1)) * 120);
      const pass = L + R >= 160 && L >= 72 && R >= 72;
      const hist = store.get('mock', []);
      hist.unshift({ d: Date.now(), L, R });
      store.set('mock', hist.slice(0, 30));
      mock = `<div class="mock-score"><div><small>🎧 聽力</small><b>${L}</b><span>/120</span></div><div><small>📖 閱讀</small><b>${R}</b><span>/120</span></div><div><small>總分</small><b>${L + R}</b><span>/240</span></div></div>
        <p class="pass ${pass ? 'ok' : 'bad'}">${pass ? '🎉 以這次成績估算，可以通過英檢初級初試！繼續保持！' : '💪 還差一點！通過標準：總分 160 以上，且聽力、閱讀都要 72 分以上。'}</p>`;
    }
    const msg = st === 3 ? '太厲害了！🏆' : st === 2 ? '做得很好！👍' : st === 1 ? '不錯喔，再加油！💪' : '多練習幾次就會進步！🌱';
    view(`${bar(esc(o.title))}<div class="card result">
        <div class="big-stars">${'⭐'.repeat(st)}<span class="dim">${'⭐'.repeat(3 - st)}</span></div>
        <h2>${msg}</h2>
        <p class="score">答對 <b>${score}</b> / ${qs.length} 題（${pct} 分）</p>
        ${mock}
        ${wrong.length ? `<h4>📝 再複習一下：</h4><ul class="review">${wrong.map(w => `<li>${w.say === false ? '' : `<button class="mini" data-say="${esc(w.en)}">🔊</button>`} <b>${esc(w.en)}</b> <span>${esc(w.zh || '')}</span></li>`).join('')}</ul>` : ''}
        <div class="row center"><button class="btn primary" data-again>🔁 再玩一次</button><button class="btn" data-menu>⬅ 回選單</button></div>
      </div>`, o.back);
    $('[data-again]').onclick = () => runQuiz(o.rebuild ? { ...o, questions: o.rebuild() } : o);
    $('[data-menu]').onclick = o.back;
    if (st === 3) { confetti(); sfx(true); }
  }
}

/* =========================================================
   首頁與年級
   ========================================================= */
const MODES = [
  { id: 'cards', icon: '📇', name: '單字卡', desc: '看圖、聽發音、翻卡片', run: g => flashcards(g) },
  { id: 'listen', icon: '🎧', name: '聽力挑戰', desc: '聽聲音選答案、聽寫', types: ['listen', 'listenSentenceZh', 'listenSpell', 'listenBlocks'] },
  { id: 'fill', icon: '✏️', name: '填空題', desc: '缺字母、句子填空', types: ['fillSentence', 'missingLetter', 'pic2word'] },
  { id: 'blocks', icon: '🧱', name: '積木拼拼樂', desc: '用積木拼單字、拼句子', types: ['sentenceBlocks', 'spellBlocks', 'listenBlocks'] },
  { id: 'match', icon: '🔗', name: '配對遊戲', desc: '英文和圖配成一對', run: g => matchGame(g) },
  { id: 'mole', icon: '🔨', name: '打地鼠', desc: '快！打中正確的單字', run: g => whack(g) },
  { id: 'mix', icon: '🎲', name: '綜合挑戰', desc: '各種題型隨機出現', types: ['listen', 'pic2word', 'listenSpell', 'typeWord', 'missingLetter', 'spellBlocks', 'fillSentence', 'sentenceBlocks', 'listenBlocks', 'listenSentenceZh', 'writeSentence'] },
  { id: 'chat', icon: '🤖', name: 'AI 對話', desc: '跟機器人用英文聊天', run: g => chatMenu(g) },
  { id: 'write', icon: '✍️', name: '寫作練習', desc: '寫單字、寫句子、寫日記', run: g => writeMenu(g) },
  { id: 'daily', icon: '🏠', name: '生活英文', desc: '每天都用得到的句子', run: g => dailyMenu(() => gradeView(g)) },
];

function home() {
  const best = store.get('best', {});
  const gStars = g => MODES.filter(m => m.types).reduce((s, m) => s + starsOf(best[`${g}-${m.id}`] || 0), 0);
  const maxStars = MODES.filter(m => m.types).length * 3;
  view(`
    <section class="hero">
      <div><h1>英文小冒險 <span>English Adventure</span></h1><p>選一個年級，開始今天的英文挑戰吧！一路練到英檢初級 🚀</p></div>
      <div class="hero-emo">🦉</div>
    </section>
    <button class="gept-banner" data-gept><span class="gb-icon">🎓</span><span><b>全民英檢初級特訓</b><small>聽力・閱讀・寫作・口說 ＋ 模擬考</small></span><span class="go">GO ➡</span></button>
    <h3 class="sec">📚 選擇年級</h3>
    <div class="grades">${GRADE_KEYS.map(g => { const G = GRADES[g]; return `<button class="grade" style="--c:${G.color}" data-g="${g}"><span class="gi">${G.icon}</span><b>${G.name}</b><small>${G.theme}</small><span class="gs">⭐ ${gStars(g)} / ${maxStars}</span></button>`; }).join('')}</div>
    <h3 class="sec">🌟 更多練習</h3>
    <div class="modes">
      ${modeCard('daily', '🏠', '生活英文', '每天都用得到的句子')}
      ${modeCard('free', '🤖', '自由聊天', '跟機器人 Robo 聊天')}
      ${modeCard('diary', '📔', '英文日記', '自己寫英文句子')}
      ${modeCard('works', '📂', '我的作品', '看看寫過的句子')}
    </div>
    <p class="tip">🔊 發音使用瀏覽器內建語音・🎤 說話功能建議使用 Chrome 或 Edge・進度會自動存在這台電腦</p>`);
  $('[data-gept]').onclick = geptHome;
  $$('.grade').forEach(b => b.onclick = () => gradeView(b.dataset.g));
  const back = home;
  const act = { daily: () => dailyMenu(back), free: () => freeChat(back), diary: () => diary(back), works: () => works(back) };
  $$('.mode').forEach(b => b.onclick = () => act[b.dataset.m]());
}

function gradeView(g) {
  const G = GRADES[g];
  const back = g === 'gept' ? geptHome : home;
  const best = store.get('best', {});
  const extra = m => {
    if (m.types) return starsHtml(starsOf(best[`${g}-${m.id}`] || 0));
    if (m.id === 'match') { const t = store.get('matchBest', {})[g]; return t ? `<span class="badge">最快 ${t} 秒</span>` : ''; }
    if (m.id === 'mole') { const t = store.get('moleBest', {})[g]; return t ? `<span class="badge">最高 ${t} 分</span>` : ''; }
    return '';
  };
  view(`${bar(`${G.icon} ${G.name}`)}
    <div class="grade-head" style="--c:${G.color}">
      <div><h2>${G.icon} ${G.name}</h2><p>${G.theme}<br>${G.W.length} 個單字・${G.S.length} 個句子・${G.dialogues.length} 段對話</p></div>
      <button class="btn" data-words>📖 單字表</button>
    </div>
    ${+g >= 4 ? `<button class="gept-banner small" data-gept><span class="gb-icon">🎓</span><span><b>準備好挑戰英檢初級了嗎？</b><small>四年級以上可以開始練習英檢題型</small></span><span class="go">➡</span></button>` : ''}
    <div class="modes">${MODES.map(m => modeCard(m.id, m.icon, m.name, m.desc, extra(m))).join('')}</div>`, back);
  $('[data-words]').onclick = () => wordList(g);
  const gb = $('[data-gept]'); if (gb) gb.onclick = geptHome;
  $$('.mode').forEach(b => b.onclick = () => {
    const m = MODES.find(x => x.id === b.dataset.m);
    if (m.types) runQuiz({ title: `${G.name}・${m.name}`, types: m.types, words: G.W, sentences: G.S, n: 10, key: `${g}-${m.id}`, back: () => gradeView(g) });
    else m.run(g);
  });
}

function wordList(g) {
  const G = GRADES[g];
  view(`${bar(`${G.name}・單字表`)}
    <div class="card"><table class="wtable"><tbody>${G.W.map(w => `<tr><td class="e">${w.emoji}</td><td><b>${esc(w.en)}</b></td><td>${esc(w.zh)}</td><td><button class="mini" data-say="${esc(w.en)}">🔊</button></td></tr>`).join('')}</tbody></table></div>
    <div class="card"><h3>📝 句子</h3><table class="wtable"><tbody>${G.S.map(s => `<tr><td><b>${esc(s.en)}</b><br><small>${esc(s.zh)}</small></td><td><button class="mini" data-say="${esc(s.en)}">🔊</button></td></tr>`).join('')}</tbody></table></div>`, () => gradeView(g));
}

/* ---------- 單字卡 ---------- */
function flashcards(g) {
  const G = GRADES[g];
  let list = G.W.slice(), i = 0;
  draw();
  function draw() {
    const w = list[i];
    view(`${bar(`${G.name}・單字卡`)}
      <div class="fc-wrap">
        <div class="flip" tabindex="0"><div class="flip-inner">
          <div class="face"><div class="fc-emo">${w.emoji}</div><div class="fc-en">${esc(w.en)}</div><small>👆 點卡片看中文</small></div>
          <div class="face face-b"><div class="fc-emo">${w.emoji}</div><div class="fc-zh">${esc(w.zh)}</div><div class="fc-en sm">${esc(w.en)}</div></div>
        </div></div>
        <div class="fc-count">${i + 1} / ${list.length}</div>
        <div class="row center">
          <button class="btn" data-prev>◀ 上一張</button>
          <button class="btn" data-say="${esc(w.en)}">🔊</button>
          <button class="btn" data-say="${esc(w.en)}" data-slow="1">🐢</button>
          <button class="btn" data-mic>🎤 跟我唸</button>
          <button class="btn primary" data-nextc>下一張 ▶</button>
        </div>
        <div class="said"></div>
        <div class="row center"><button class="btn ghost" data-shuffle>🔀 打亂順序</button></div>
      </div>`, () => gradeView(g));
    const f = $('.flip');
    f.onclick = () => f.classList.toggle('on');
    $('[data-prev]').onclick = () => { i = (i - 1 + list.length) % list.length; draw(); };
    $('[data-nextc]').onclick = () => { i = (i + 1) % list.length; draw(); };
    $('[data-shuffle]').onclick = () => { list = shuffle(list); i = 0; draw(); toast('已打亂順序'); };
    $('[data-mic]').onclick = e => recognize(e.currentTarget, t => {
      const ok = norm(t).split(' ').includes(norm(w.en)) || similarity(w.en, t) >= 0.99;
      $('.said').innerHTML = `你說：「${esc(t)}」 ${ok ? '✅ 很標準！' : '🤔 再試一次，先按 🔊 聽聽看'}`;
      sfx(ok);
    }, { recText: '⏹ 聽你說…' });
    const key = e => {
      if (e.key === 'ArrowRight') $('[data-nextc]').click();
      else if (e.key === 'ArrowLeft') $('[data-prev]').click();
      else if (e.key === ' ') { e.preventDefault(); f.classList.toggle('on'); }
    };
    document.addEventListener('keydown', key);
    onLeave(() => document.removeEventListener('keydown', key));
    setTimeout(() => speak(w.en), 250);
  }
}

/* ---------- 配對遊戲 ---------- */
function matchGame(g) {
  const G = GRADES[g];
  const set = sample(G.W, 6), L = shuffle(set), R = shuffle(set);
  let sl = null, sr = null, matched = 0;
  const t0 = Date.now();
  view(`${bar(`${G.name}・配對遊戲`, '<span class="timer">⏱ 0 秒</span>')}
    <p class="ask center">把英文單字和圖片配成一對！先點左邊，再點右邊</p>
    <div class="match">
      <div class="col">${L.map((w, i) => `<button class="m-card m-l" data-i="${i}">${esc(w.en)}</button>`).join('')}</div>
      <div class="col">${R.map((w, i) => `<button class="m-card m-r" data-i="${i}"><span class="emo">${w.emoji}</span> ${esc(w.zh)}</button>`).join('')}</div>
    </div><div class="match-end"></div>`, () => gradeView(g));
  const timer = setInterval(() => { $('.timer').textContent = '⏱ ' + Math.floor((Date.now() - t0) / 1000) + ' 秒'; }, 500);
  onLeave(() => clearInterval(timer));
  const tryMatch = () => {
    if (sl == null || sr == null) return;
    const bl = $(`.m-l[data-i="${sl}"]`), br = $(`.m-r[data-i="${sr}"]`);
    if (L[sl] === R[sr]) {
      [bl, br].forEach(b => { b.classList.remove('sel'); b.classList.add('done'); b.disabled = true; });
      sfx(true); matched++;
      if (matched === set.length) {
        clearInterval(timer);
        const secs = Math.floor((Date.now() - t0) / 1000);
        const bests = store.get('matchBest', {});
        const nb = !bests[g] || secs < bests[g];
        if (nb) { bests[g] = secs; store.set('matchBest', bests); }
        confetti();
        $('.match-end').innerHTML = `<div class="card result"><h2>🎉 全部配對成功！</h2><p class="score">花了 <b>${secs}</b> 秒 ${nb ? '🏅 新紀錄！' : `（最快紀錄 ${bests[g]} 秒）`}</p><div class="row center"><button class="btn primary" data-again>🔁 再玩一次</button><button class="btn" data-menu>⬅ 回選單</button></div></div>`;
        $('[data-again]').onclick = () => matchGame(g);
        $('[data-menu]').onclick = () => gradeView(g);
      }
    } else {
      sfx(false);
      [bl, br].forEach(b => { b.classList.remove('sel'); b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 450); });
    }
    sl = sr = null;
  };
  $$('.m-l').forEach(b => b.onclick = () => { $$('.m-l').forEach(x => x.classList.remove('sel')); b.classList.add('sel'); sl = +b.dataset.i; speak(L[sl].en); tryMatch(); });
  $$('.m-r').forEach(b => b.onclick = () => { $$('.m-r').forEach(x => x.classList.remove('sel')); b.classList.add('sel'); sr = +b.dataset.i; tryMatch(); });
}

/* ---------- 打地鼠 ---------- */
function whack(g) {
  const G = GRADES[g], W = G.W;
  let score = 0, time = 45, target = pick(W), running = false;
  const timers = [];
  view(`${bar(`${G.name}・打地鼠`, '<span class="timer">⏱ 45</span>')}
    <div class="mole-top"><div class="target">🎯 打中：<span class="t-emo">${target.emoji}</span> <b class="t-zh">${esc(target.zh)}</b></div><div class="mole-score">分數 <b>0</b></div></div>
    <div class="holes">${Array.from({ length: 9 }, (_, i) => `<div class="hole" data-h="${i}"><button class="mole"></button></div>`).join('')}</div>
    <div class="mole-start"><button class="btn primary big" data-start>▶ 開始遊戲</button><p>地鼠身上有英文字，找到和目標一樣意思的就打下去！打錯會扣 1 分。</p></div>`, () => gradeView(g));
  onLeave(() => timers.forEach(t => { clearInterval(t); clearTimeout(t); }));
  const setTarget = () => {
    let n; do { n = pick(W); } while (n === target && W.length > 1);
    target = n;
    $('.t-emo').textContent = target.emoji; $('.t-zh').textContent = target.zh;
  };
  const holes = $$('.hole');
  function spawn() {
    if (!running) return;
    const empty = holes.filter(h => !h.classList.contains('up'));
    if (!empty.length) return;
    const h = pick(empty), m = $('.mole', h);
    const showing = holes.some(x => x.classList.contains('up') && x._w === target);
    const w = !showing && Math.random() < 0.6 ? target : pick(W.filter(x => x !== target));
    h._w = w; m.textContent = w.en; m.disabled = false;
    h.classList.add('up');
    const life = Math.max(1100, 2000 - score * 40);
    h._t = setTimeout(() => h.classList.remove('up'), life);
    timers.push(h._t);
  }
  holes.forEach(h => {
    $('.mole', h).onclick = () => {
      if (!running || !h.classList.contains('up')) return;
      clearTimeout(h._t);
      const ok = h._w === target;
      h.classList.add(ok ? 'hit' : 'miss');
      setTimeout(() => h.classList.remove('up', 'hit', 'miss'), 250);
      if (ok) { score++; sfx(true); speak(h._w.en); setTarget(); } else { score = Math.max(0, score - 1); sfx(false); }
      $('.mole-score b').textContent = score;
    };
  });
  $('[data-start]').onclick = () => {
    $('.mole-start').style.display = 'none';
    running = true;
    timers.push(setInterval(spawn, 750));
    timers.push(setInterval(() => {
      time--; $('.timer').textContent = '⏱ ' + time;
      if (time <= 0) end();
    }, 1000));
  };
  function end() {
    running = false;
    timers.forEach(t => { clearInterval(t); clearTimeout(t); });
    holes.forEach(h => h.classList.remove('up'));
    const bests = store.get('moleBest', {});
    const nb = !(bests[g] >= score);
    if (nb) { bests[g] = score; store.set('moleBest', bests); }
    if (score >= 10) confetti();
    const box = $('.mole-start');
    box.style.display = '';
    box.innerHTML = `<div class="card result"><h2>⏰ 時間到！</h2><p class="score">你得了 <b>${score}</b> 分 ${nb && score > 0 ? '🏅 新紀錄！' : `（最高 ${bests[g]} 分）`}</p><div class="row center"><button class="btn primary" data-again>🔁 再玩一次</button><button class="btn" data-menu>⬅ 回選單</button></div></div>`;
    $('[data-again]').onclick = () => whack(g);
    $('[data-menu]').onclick = () => gradeView(g);
  }
}

/* =========================================================
   AI 對話
   ========================================================= */
function chatMenu(g) {
  const G = GRADES[g];
  view(`${bar(`${G.name}・AI 對話`)}
    <p class="ask center">選一個主題，跟機器人 Robo 🤖 用英文聊天！<br><small>可以打字，也可以按 🎤 用說的；不會的時候點 💡 提示</small></p>
    <div class="modes">
      ${G.dialogues.map((d, i) => modeCard('d' + i, d.icon, d.title, `${d.turns.length} 個問題`)).join('')}
      ${modeCard('free', '🗨️', '自由聊天', '想說什麼就說什麼')}
    </div>`, () => gradeView(g));
  $$('.mode').forEach(b => b.onclick = () => {
    const id = b.dataset.m;
    if (id === 'free') freeChat(() => chatMenu(g));
    else dialogueChat(g, G.dialogues[+id.slice(1)]);
  });
}

function chatUI(title, back) {
  view(`${bar(title)}
    <div class="chat card">
      <div class="msgs"></div>
      <div class="chips"></div>
      <form class="chat-in"><button type="button" class="mic" title="用說的">🎤</button><input placeholder="用英文回答…" autocomplete="off" spellcheck="false"><button class="btn primary" type="submit">送出</button></form>
    </div>`, back);
  const msgs = $('.msgs'), chips = $('.chips'), form = $('.chat-in'), inp = $('input', form);
  let handler = () => { };
  const scroll = () => { msgs.scrollTop = msgs.scrollHeight; };
  form.onsubmit = e => { e.preventDefault(); const t = inp.value.trim(); if (!t) return; inp.value = ''; handler(t, true); };
  $('.mic', form).onclick = e => recognize(e.currentTarget, t => handler(t, false), { recText: '⏹' });
  setTimeout(() => inp.focus({ preventScroll: true }), 100);
  return {
    ai(text, zh) {
      const d = document.createElement('div');
      d.className = 'msg ai';
      d.innerHTML = `<span class="av">🤖</span><div class="bub"><div>${esc(text)}</div>${zh ? `<div class="zh" hidden>${esc(zh)}</div>` : ''}<div class="tools"><button class="mini" data-say="${esc(text)}">🔊</button>${zh ? '<button class="mini" data-zh>中文</button>' : ''}</div></div>`;
      const zb = $('[data-zh]', d);
      if (zb) zb.onclick = () => { const z = $('.zh', d); z.hidden = !z.hidden; };
      msgs.appendChild(d); scroll();
      speakSeq([{ text }], null, true);
    },
    me(text, typed) {
      const d = document.createElement('div');
      d.className = 'msg me';
      let tip = '';
      if (typed) {
        if (/(^|[^A-Za-z'])i([^A-Za-z']|$)/.test(text)) tip = '小提醒：「我」要寫大寫的 I 喔';
        else if (/^[a-z]/.test(text) && countWords(text) >= 3) tip = '小提醒：句子開頭要大寫喔';
      }
      d.innerHTML = `<div class="bub">${esc(text)}${tip ? `<div class="tip-s">💡 ${tip}</div>` : ''}</div><span class="av">🧒</span>`;
      msgs.appendChild(d); scroll();
    },
    chips(list) {
      chips.innerHTML = list && list.length ? `<span>💡 可以這樣說：</span>${list.map(x => `<button type="button" class="chip">${esc(x)}</button>`).join('')}` : '';
      $$('.chip', chips).forEach(c => c.onclick = () => { inp.value = c.textContent; inp.focus(); });
    },
    onSend(f) { handler = f; },
    end(html) {
      chips.innerHTML = ''; form.remove();
      const d = document.createElement('div'); d.className = 'chat-end'; d.innerHTML = html;
      msgs.after(d); scroll();
      return d;
    },
  };
}

function accepts(keys, text) {
  const n = ' ' + norm(text) + ' ';
  if (!/[a-z0-9]/.test(n)) return false;
  if (keys.includes('*')) return true;
  return keys.some(k => new RegExp('\\b' + norm(k).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).test(n));
}
function extractName(text) {
  const m = text.match(/(?:name is|i am|i'm|call me|this is)\s+([A-Za-z]+)/i);
  if (m && !/^(fine|ok|okay|good|happy|a|an|the|ten|twelve|eleven|nine|eight)$/i.test(m[1])) return cap(m[1].toLowerCase());
  const ws = text.match(/[A-Za-z]+/g);
  if (ws && ws.length <= 2) return cap(ws[ws.length - 1].toLowerCase());
  return null;
}

function dialogueChat(g, d) {
  const ui = chatUI(`${d.icon} ${d.title}`, () => chatMenu(g));
  let t = 0, tries = 0, name = 'friend', busy = false;
  const fill = s => s.replace(/\{name\}/g, name);
  const ask = (pre = '') => { const tn = d.turns[t]; ui.ai((pre ? pre + ' ' : '') + fill(tn.ai), tn.zh); ui.chips(tn.ex); busy = false; };
  ask();
  ui.onSend((text, typed) => {
    if (busy) return;
    ui.me(text, typed);
    const tn = d.turns[t];
    busy = true;
    if (accepts(tn.keys, text)) {
      if (tn.cap) name = extractName(text) || name;
      tries = 0; t++;
      const pr = pick(['Great!', 'Nice!', 'Good job!', 'Cool!', 'Wonderful!', 'Awesome!']);
      if (t < d.turns.length) setTimeout(() => ask(pr), 700);
      else setTimeout(() => { ui.ai(`${pr} You did it, ${name}! See you next time! 👋`, '你完成了！下次見！'); finish(); }, 700);
    } else {
      tries++;
      if (tries >= 2) {
        tries = 0; t++;
        setTimeout(() => {
          ui.ai(`That's OK! You can say: "${tn.ex[0]}"`, `沒關係！你可以說：「${tn.ex[0]}」`);
          if (t < d.turns.length) setTimeout(() => ask("Let's go on."), 2500); else { finish(); }
        }, 600);
      } else {
        setTimeout(() => { ui.ai(`Hmm... try again! For example: "${tn.ex[0]}"`, `再試一次！例如：「${tn.ex[0]}」`); busy = false; }, 600);
      }
    }
  });
  function finish() {
    sfx(true);
    const e = ui.end(`<p>🎉 對話完成！</p><div class="row center"><button class="btn primary" data-again>🔁 再聊一次</button><button class="btn" data-menu>⬅ 選其他對話</button></div>`);
    $('[data-again]', e).onclick = () => dialogueChat(g, d);
    $('[data-menu]', e).onclick = () => chatMenu(g);
  }
}

/** 自由聊天：Robo 用關鍵字規則回應，並一直丟問題讓學生回答 */
function botReply(raw, st) {
  const t = norm(raw);
  let m;
  if (!/[a-z0-9]/.test(t)) return ["Sorry, I don't understand. Can you say it in English?", '對不起，我看不懂。可以用英文說嗎？', false];
  if (/\b(bye|goodbye|see you)\b/.test(t)) return ['Bye-bye! It was nice talking with you! 👋', '掰掰！跟你聊天很開心！', 'end'];
  if (/\bhow are you\b/.test(t)) return ["I'm great, thank you! And you?", '我很好，謝謝！那你呢？', false];
  if (/\bwhat is your name\b|\bwho are you\b/.test(t)) return ["I'm Robo, a robot who loves English! 🤖", '我是 Robo，一個愛英文的機器人！', true];
  if (/\bhow old are you\b/.test(t)) return ["I'm a robot, so I'm only one year old! 😄", '我是機器人，所以我才一歲！', true];
  if ((m = t.match(/\b(?:my name is|call me)\s+([a-z]+)/))) { st.name = cap(m[1]); return [`Nice to meet you, ${st.name}!`, `很高興認識你，${st.name}！`, true]; }
  if ((m = t.match(/\bi am (\d+|[a-z]+) years? old\b|\bi am (\d+)\b/))) return ["Wow! You're so smart for your age!", '哇！你年紀小小好聰明！', true];
  if (/\b(sad|tired|sick|bad|angry|not good|not fine|bored)\b/.test(t)) return ['Oh no! I hope you feel better soon. 💛', '噢不！希望你很快好起來。', true];
  if (/\b(fine|good|great|ok|happy|well|excited)\b/.test(t) && t.split(' ').length <= 6) return ["I'm glad to hear that! 😊", '很高興聽你這麼說！', true];
  if ((m = t.match(/\bdo you like ([a-z ]+)/))) return [`Yes! I like ${m[1]} very much!`, `是的！我很喜歡 ${m[1]}！`, true];
  if ((m = t.match(/\bi (?:like|love) (?:to )?([a-z ]+)/))) return [`Wow, you like ${m[1]}! That's cool!`, `哇，你喜歡 ${m[1]}！好酷！`, true];
  if ((m = t.match(/\bmy favorite [a-z]+ is ([a-z ]+)/))) return [`${cap(m[1])}? Nice choice!`, `${m[1]}？好選擇！`, true];
  if ((m = t.match(/\bi want to be (?:a |an )?([a-z ]+)/))) return [`A ${m[1]}? That's a great dream! Study hard!`, `${m[1]}？好棒的夢想！要加油喔！`, true];
  if (/\b(thank|thanks)\b/.test(t)) return ["You're welcome! 😊", '不客氣！', true];
  if (/\b(sunny|rainy|cloudy|windy|hot|cold|raining|snowing)\b/.test(t)) return ["I see! Don't forget to wear the right clothes.", '了解！記得穿適合的衣服喔。', true];
  if (/\b(dog|cat|bird|fish|rabbit|hamster|turtle)s?\b/.test(t) && /\b(have|got)\b/.test(t)) return ["You have a pet? That's so cute! 🐾", '你有寵物？好可愛！', true];
  if (/\b(yesterday|last)\b/.test(t) || /\b(went|played|watched|ate|visited|saw|had)\b/.test(t)) return ['That sounds fun! 😃', '聽起來很好玩！', true];
  if (/\?\s*$/.test(raw) || /^(what|where|who|how|why|when|do|does|can|are|is)\b/.test(t)) return ["Good question! I'm a robot, so I'm still learning. 🤖", '好問題！我是機器人，還在學習中。', true];
  if (/^(yes|yeah|yep|sure)\b/.test(t)) return ['Cool! 😄', '酷！', true];
  if (/^(no|nope)\b/.test(t)) return ['Oh, I see.', '喔，我懂了。', true];
  if (/^(hi|hello|hey)\b/.test(t)) return ['Hello! Nice to see you! 👋', '哈囉！很高興見到你！', true];
  return [pick(["That's interesting!", 'Wow, really?', 'I see!', 'Cool!']), '真有趣！', true];
}
function freeChat(back) {
  const ui = chatUI('🗨️ 自由聊天', back);
  const st = { name: null, order: shuffle(BOT_QUESTIONS), qi: 0 };
  const nextQ = () => {
    const q = st.order[st.qi++ % st.order.length];
    ui.ai(q[0], q[1]); ui.chips(q[2]);
  };
  ui.ai("Hi! I'm Robo 🤖. Let's talk in English!", '嗨！我是 Robo。我們用英文聊天吧！');
  setTimeout(nextQ, 400);
  ui.onSend((text, typed) => {
    ui.me(text, typed);
    const [en, zh, more] = botReply(text, st);
    setTimeout(() => {
      ui.ai(en, zh);
      if (more === 'end') {
        const e = ui.end(`<p>👋 聊天結束！</p><div class="row center"><button class="btn primary" data-again>🔁 再聊一次</button><button class="btn" data-menu>⬅ 返回</button></div>`);
        $('[data-again]', e).onclick = () => freeChat(back);
        $('[data-menu]', e).onclick = back;
      } else if (more) setTimeout(nextQ, 300);
      else ui.chips([]);
    }, 600);
  });
}

/* =========================================================
   生活英文
   ========================================================= */
function dailyMenu(back) {
  view(`${bar('🏠 生活英文')}
    <p class="ask center">每天都用得到的英文句子！先聽、再跟著唸，最後做練習 💪</p>
    <div class="modes">${DAILY.map(c => modeCard(c.id, c.icon, c.name, `${c.items.length} 個句子`, starsHtml(starsOf(bestOf('daily-' + c.id) || 0)))).join('')}
    ${modeCard('all', '🎲', '全部混合練習', '所有生活句子隨機出題', starsHtml(starsOf(bestOf('daily-all') || 0)))}</div>`, back);
  $$('.mode').forEach(b => b.onclick = () => {
    if (b.dataset.m === 'all') {
      runQuiz({ title: '生活英文・混合練習', types: ['listenSentenceZh', 'sentenceBlocks', 'listenBlocks', 'fillSentence', 'writeSentence'], words: ALL_WORDS, sentences: DAILY.flatMap(c => c.items.map(([en, zh]) => ({ en, zh }))), n: 12, key: 'daily-all', back: () => dailyMenu(back) });
    } else dailyCat(DAILY.find(c => c.id === b.dataset.m), back);
  });
}
function dailyCat(c, back) {
  const S = c.items.map(([en, zh]) => ({ en, zh }));
  view(`${bar(`${c.icon} ${c.name}`)}
    <div class="card"><ul class="daily">${S.map((s, i) => `<li><div><b>${esc(s.en)}</b><small>${esc(s.zh)}</small><div class="res" data-r="${i}"></div></div>
      <div class="acts"><button class="mini" data-say="${esc(s.en)}">🔊</button><button class="mini" data-say="${esc(s.en)}" data-slow="1">🐢</button><button class="mini" data-mic="${i}">🎤 跟讀</button></div></li>`).join('')}</ul></div>
    <div class="row center"><button class="btn primary big" data-practice>📝 開始練習</button></div>`, () => dailyMenu(back));
  $$('[data-mic]').forEach(b => b.onclick = () => {
    const i = +b.dataset.mic;
    recognize(b, t => {
      const p = Math.round(similarity(S[i].en, t) * 100);
      $(`[data-r="${i}"]`).innerHTML = `你說：「${esc(t)}」 <b class="${p >= 80 ? 'g' : 'r'}">${p} 分</b> ${p >= 80 ? '🌟' : '再試試！'}`;
      sfx(p >= 80);
    }, { recText: '⏹ 聽你說' });
  });
  $('[data-practice]').onclick = () => runQuiz({ title: `${c.name}・練習`, types: ['listenSentenceZh', 'sentenceBlocks', 'listenBlocks', 'fillSentence', 'writeSentence'], words: ALL_WORDS, sentences: S, n: 8, key: 'daily-' + c.id, back: () => dailyCat(c, back) });
}

/* =========================================================
   寫作練習
   ========================================================= */
function writeMenu(g) {
  const G = GRADES[g], back = () => writeMenu(g);
  view(`${bar(`${G.name}・寫作練習`)}
    <div class="modes">
      ${modeCard('spell', '🔤', '拼寫測驗', '看圖、聽音寫出單字', starsHtml(starsOf(bestOf(g + '-spell') || 0)))}
      ${modeCard('wsent', '📝', '看中文寫句子', '把中文翻成英文句子', starsHtml(starsOf(bestOf(g + '-wsent') || 0)))}
      ${modeCard('make', '💭', '用單字造句', '自己想一個句子')}
      ${modeCard('diary', '📔', '英文日記', '寫一小段自己的故事')}
      ${modeCard('works', '📂', '我的作品', '看看寫過的句子')}
    </div>`, () => gradeView(g));
  const act = {
    spell: () => runQuiz({ title: `${G.name}・拼寫測驗`, types: ['typeWord', 'listenSpell'], words: G.W, sentences: G.S, n: 10, key: g + '-spell', back }),
    wsent: () => runQuiz({ title: `${G.name}・看中文寫句子`, types: ['writeSentence'], words: G.W, sentences: G.S, n: 8, key: g + '-wsent', back }),
    make: () => makeSentence(g),
    diary: () => diary(back),
    works: () => works(back),
  };
  $$('.mode').forEach(b => b.onclick = () => act[b.dataset.m]());
}

function saveWork(title, text) {
  const list = store.get('works', []);
  list.unshift({ d: Date.now(), title, text });
  store.set('works', list.slice(0, 200));
  toast('💾 已存到「我的作品」');
}

function writingBox(o) {
  // o: { must, starters, sampleHtml, title, rows }
  return `<div class="starters">${(o.starters || []).map(s => `<button class="chip" data-st="${esc(s)}">${esc(s)}</button>`).join('')}</div>
    <textarea class="write" rows="${o.rows || 3}" placeholder="在這裡用英文寫…" spellcheck="false"></textarea>
    <div class="wc">0 個字</div>
    <div class="row center">
      <button class="btn primary" data-check>🔍 幫我檢查</button>
      <button class="btn" data-read>🔊 唸給我聽</button>
      <button class="btn" data-save>💾 儲存</button>
    </div>
    <div class="check-out"></div>`;
}
function bindWriting(el, o) {
  const ta = $('textarea', el), wc = $('.wc', el), out = $('.check-out', el);
  const upd = () => { const n = countWords(ta.value); wc.textContent = `${n} 個字${o.target ? ` / 目標 ${o.target} 字` : ''}`; wc.classList.toggle('ok', !!o.target && n >= o.target); };
  ta.oninput = upd;
  $$('[data-st]', el).forEach(b => b.onclick = () => {
    const s = b.dataset.st;
    ta.value = (ta.value.trim() ? ta.value.trim() + ' ' : '') + s;
    ta.focus();
    const p = ta.value.indexOf('___');
    if (p >= 0) ta.setSelectionRange(p, p + 3);
    upd();
  });
  $('[data-check]', el).onclick = () => {
    const list = checkWriting(ta.value, o.must ? o.must() : []);
    if (o.target) { const n = countWords(ta.value); list.push(n >= o.target ? { ok: true, msg: `字數足夠（${n} 字）` } : { ok: false, msg: `字數還不夠，目標約 ${o.target} 字（現在 ${n} 字）` }); }
    if (ta.value.includes('___')) list.push({ ok: false, msg: '還有 ___ 沒有填完喔' });
    const good = list.every(c => c.ok);
    out.innerHTML = checkListHtml(list) + (good ? '<p class="great">🌟 寫得很棒！可以按「儲存」收藏起來！</p>' : '');
    sfx(good);
    if (good) confetti();
  };
  $('[data-read]', el).onclick = () => { if (ta.value.trim()) speak(ta.value); else toast('先寫一點東西吧！'); };
  $('[data-save]', el).onclick = () => { if (countWords(ta.value) < 1) return toast('先寫一點東西吧！'); saveWork(o.title(), ta.value.trim()); };
}

function makeSentence(g) {
  const G = GRADES[g];
  const w = pick(G.W);
  const starters = STARTERS.slice(0, Math.min(STARTERS.length, 4 + (+g || 6)));
  view(`${bar(`${G.name}・用單字造句`)}
    <div class="card">
      <div class="word-card"><span class="emo">${w.emoji}</span><div><b>${esc(w.en)}</b><small>${esc(w.zh)}</small></div><button class="mini" data-say="${esc(w.en)}">🔊</button></div>
      <p class="ask">💭 用「<b>${esc(w.en)}</b>」寫一個英文句子！可以點下面的句型開頭幫忙</p>
      ${writingBox({ starters })}
      <div class="row center"><button class="btn ghost" data-new>🔄 換一個單字</button></div>
    </div>`, () => writeMenu(g));
  bindWriting(app, { must: () => [w.en], title: () => `造句：${w.en}` });
  $('[data-new]').onclick = () => makeSentence(g);
}

function diary(back) {
  view(`${bar('📔 英文日記')}
    <p class="ask center">選一個題目，寫一小段英文！不會寫的字可以先用簡單的字代替 😊</p>
    <div class="modes">${DIARY_PROMPTS.map((p, i) => modeCard('p' + i, p.icon, p.title, p.zh)).join('')}</div>`, back);
  $$('.mode').forEach(b => b.onclick = () => diaryWrite(DIARY_PROMPTS[+b.dataset.m.slice(1)], () => diary(back)));
}
function diaryWrite(p, back) {
  view(`${bar(`${p.icon} ${p.title}`)}
    <div class="card"><p class="ask">✍️ 題目：<b>${esc(p.title)}</b>（${esc(p.zh)}）<br><small>點句型開頭加到文章裡，再把 ___ 換成你自己的話</small></p>
    ${writingBox({ starters: p.starters, rows: 7 })}</div>`, back);
  bindWriting(app, { title: () => p.title, target: 30 });
}

function works(back) {
  const list = store.get('works', []);
  view(`${bar('📂 我的作品')}
    ${list.length ? list.map((w, i) => `<div class="card work"><div class="wh"><b>${esc(w.title)}</b><small>${new Date(w.d).toLocaleString('zh-TW')}</small></div><p>${esc(w.text)}</p><div class="row"><button class="mini" data-say="${esc(w.text)}">🔊 朗讀</button><button class="mini" data-del="${i}">🗑️ 刪除</button></div></div>`).join('') : '<div class="card center"><p>還沒有作品喔！去「寫作練習」寫寫看吧 ✍️</p></div>'}`, back);
  $$('[data-del]').forEach(b => b.onclick = () => {
    if (!confirm('確定要刪除這篇作品嗎？')) return;
    const l = store.get('works', []); l.splice(+b.dataset.del, 1); store.set('works', l); works(back);
  });
}

/* =========================================================
   全民英檢初級特訓
   ========================================================= */
const G_PARTS = [
  { id: 'gPic', grp: 'L', icon: '🖼️', name: '第一部分 看圖辨義', desc: '看圖、聽問題，選出符合的描述', build: () => sample(GEPT.listenPic, 8).map(item => ({ type: 'gPic', item })) },
  { id: 'gQA', grp: 'L', icon: '💬', name: '第二部分 問答', desc: '聽一句話，選出最適合的回應', build: () => sample(GEPT.listenQA, 10).map(item => ({ type: 'gQA', item })) },
  { id: 'gDialog', grp: 'L', icon: '👫', name: '第三部分 簡短對話', desc: '聽男女對話，回答問題', build: () => sample(GEPT.listenDialog, 8).map(item => ({ type: 'gDialog', item })) },
  { id: 'gTalk', grp: 'L', icon: '📢', name: '第四部分 短文聽解', desc: '聽一段短文，選出正確圖片', build: () => sample(GEPT.listenTalk, 6).map(item => ({ type: 'gTalk', item })) },
  { id: 'gVocab', grp: 'R', icon: '🔤', name: '第一部分 詞彙', desc: '選出最適合的字（含文法解析）', build: () => sample(GEPT.readVocab, 10).map(item => ({ type: 'gVocab', item })) },
  { id: 'gCloze', grp: 'R', icon: '📄', name: '第二部分 段落填空', desc: '讀短文，選出空格的答案', build: () => { const p = sample(GEPT.readCloze, 2); return p.flatMap(item => item.blanks.map((_, n) => ({ type: 'gCloze', item, n }))); } },
  { id: 'gComp', grp: 'R', icon: '📰', name: '第三部分 閱讀理解', desc: '讀告示、菜單、信件並回答', build: () => { const p = sample(GEPT.readComp, 3); return p.flatMap(item => item.qs.map((_, n) => ({ type: 'gComp', item, n }))); } },
  { id: 'gRewrite', grp: 'W', icon: '🔁', name: '單句寫作：句子改寫', desc: '改成問句、否定句、過去式…', build: () => sample(GEPT.rewrite, 8).map(item => ({ type: 'gRewrite', item })) },
  { id: 'gCombine', grp: 'W', icon: '🔗', name: '單句寫作：句子合併', desc: '用 and / but / because… 合併', build: () => sample(GEPT.combine, 8).map(item => ({ type: 'gCombine', item })) },
  { id: 'gReorder', grp: 'W', icon: '🧱', name: '單句寫作：重組', desc: '用積木把句子排出來', build: () => sample(GEPT.reorder, 8).map(item => ({ type: 'gReorder', item })) },
];

function geptHome() {
  const card = p => modeCard(p.id, p.icon, p.name, p.desc, starsHtml(starsOf(bestOf('gept-' + p.id) || 0)));
  const hist = store.get('mock', []);
  view(`${bar('🎓 全民英檢初級特訓')}
    <div class="card gept-intro">
      <h3>英檢初級考什麼？</h3>
      <div class="exam-grid">
        <div><b>📝 初試</b><span>🎧 聽力：看圖辨義、問答、簡短對話、短文聽解</span><span>📖 閱讀：詞彙、段落填空、閱讀理解</span><small>聽力、閱讀各 120 分；總分 160 以上且單項不低於 72 分即通過</small></div>
        <div><b>🗣️ 複試（初試通過後）</b><span>✍️ 寫作：單句寫作（改寫・合併・重組）、段落寫作</span><span>🎤 口說：複誦、朗讀、回答問題</span><small>寫作、口說分別計分</small></div>
      </div>
      <p class="note-s">程度約為國中畢業，需要認得約 2,000 個常用字。題數與計分方式以 LTTC 語言訓練測驗中心最新公告為準。</p>
    </div>
    <div class="modes">
      ${modeCard('mock', '🏆', '初試模擬考', '聽力＋閱讀，算出預估分數', hist.length ? `<span class="badge">上次 ${hist[0].L + hist[0].R} 分</span>` : '')}
      ${modeCard('vocab', '📚', '英檢常用單字', '單字卡、配對、打地鼠…')}
    </div>
    <h3 class="sec">🎧 初試・聽力</h3><div class="modes">${G_PARTS.filter(p => p.grp === 'L').map(card).join('')}</div>
    <h3 class="sec">📖 初試・閱讀</h3><div class="modes">${G_PARTS.filter(p => p.grp === 'R').map(card).join('')}</div>
    <h3 class="sec">✍️ 複試・寫作</h3><div class="modes">${G_PARTS.filter(p => p.grp === 'W').map(card).join('')}${modeCard('para', '🖼️', '段落寫作（看圖）', '看三張圖寫約 50 字短文')}</div>
    <h3 class="sec">🎤 複試・口說</h3><div class="modes">
      ${modeCard('repeat', '🔁', '第一部分 複誦', '聽一句，跟著說一次')}
      ${modeCard('read', '📢', '第二部分 朗讀', '把短文大聲唸出來')}
      ${modeCard('answer', '🙋', '第三部分 回答問題', '聽問題，15 秒內回答')}
      ${modeCard('interview', '🤖', '口說面試練習', '跟 Robo 模擬問答')}
    </div>
    ${hist.length ? `<div class="card"><h3>📈 模擬考紀錄</h3><ul class="hist">${hist.slice(0, 8).map(h => `<li><span>${new Date(h.d).toLocaleDateString('zh-TW')}</span><span>聽力 ${h.L}</span><span>閱讀 ${h.R}</span><b class="${h.L + h.R >= 160 && h.L >= 72 && h.R >= 72 ? 'g' : 'r'}">總分 ${h.L + h.R}</b></li>`).join('')}</ul></div>` : ''}`, home);
  const back = geptHome;
  $$('.mode').forEach(b => b.onclick = () => {
    const id = b.dataset.m;
    const p = G_PARTS.find(x => x.id === id);
    if (p) return runQuiz({ title: '英檢・' + p.name.replace(/^第.部分 /, ''), questions: p.build(), rebuild: p.build, key: 'gept-' + p.id, back });
    ({
      mock: () => runQuiz({ title: '英檢初級・初試模擬考', questions: buildMock(), rebuild: buildMock, mock: true, back }),
      vocab: () => gradeView('gept'),
      para: () => geptParagraph(Math.floor(Math.random() * GEPT.paragraph.length)),
      repeat: () => speakRepeat(),
      read: () => speakRead(0),
      answer: () => speakAnswer(),
      interview: () => dialogueChat('gept', GRADES.gept.dialogues[0]),
    })[id]();
  });
}

function buildMock() {
  const L = [
    ...sample(GEPT.listenPic, 3).map(item => ({ type: 'gPic', item })),
    ...sample(GEPT.listenQA, 4).map(item => ({ type: 'gQA', item })),
    ...sample(GEPT.listenDialog, 4).map(item => ({ type: 'gDialog', item })),
    ...sample(GEPT.listenTalk, 2).map(item => ({ type: 'gTalk', item })),
  ].map(q => ({ ...q, sec: 'L' }));
  const cloze = pick(GEPT.readCloze);
  const comps = sample(GEPT.readComp, 2);
  const R = [
    ...sample(GEPT.readVocab, 6).map(item => ({ type: 'gVocab', item })),
    ...cloze.blanks.map((_, n) => ({ type: 'gCloze', item: cloze, n })),
    ...comps.flatMap(item => item.qs.map((_, n) => ({ type: 'gComp', item, n }))),
  ].map(q => ({ ...q, sec: 'R' }));
  return [...L, ...R];
}

/* ---------- 段落寫作 ---------- */
function geptParagraph(idx) {
  const p = GEPT.paragraph[idx];
  view(`${bar('🖼️ 段落寫作（看圖）')}
    <div class="card">
      <div class="panels">${p.panels.map((x, i) => `<div class="panel"><span class="pn">${i + 1}</span>${x}</div>`).join('')}</div>
      <p class="ask">✍️ ${esc(p.task)}</p>
      <p class="kw">可以用的字：${p.words.map(w => `<span class="chip static">${esc(w)}</span>`).join(' ')}</p>
      ${writingBox({ starters: [], rows: 7 })}
      <details class="sample"><summary>📖 看範文（先自己寫完再看喔！）</summary><p>${esc(p.sample)}</p><button class="mini" data-say="${esc(p.sample)}">🔊 朗讀範文</button></details>
      <div class="row center"><button class="btn ghost" data-new>🔄 換一題</button></div>
      <p class="note-s">💡 英檢評分重點：內容符合圖片、句子文法正確、有用連接詞（and, but, so, because, then）讓文章通順、拼字與標點正確。</p>
    </div>`, geptHome);
  bindWriting(app, { title: () => '看圖寫作：' + p.title, target: 40 });
  $('[data-new]').onclick = () => geptParagraph((idx + 1) % GEPT.paragraph.length);
}

/* ---------- 口說：複誦 ---------- */
const scoreMsg = p => (p >= 90 ? '🌟 非常好！' : p >= 70 ? '👍 不錯！再說清楚一點' : p >= 40 ? '💪 有進步空間，再試一次' : '🤔 再聽一次，跟著說說看');
function speakRepeat() {
  const list = sample(GEPT.repeat, 6);
  let i = 0;
  draw();
  function draw() {
    if (i >= list.length) {
      view(`${bar('🔁 口說・複誦')}<div class="card result"><h2>🎉 完成 ${list.length} 句複誦！</h2><div class="row center"><button class="btn primary" data-again>🔁 再練一次</button><button class="btn" data-menu>⬅ 回英檢</button></div></div>`, geptHome);
      $('[data-again]').onclick = speakRepeat; $('[data-menu]').onclick = geptHome;
      return;
    }
    const s = list[i];
    view(`${bar('🔁 口說・複誦')}
      <div class="progress"><div style="width:${(i / list.length) * 100}%"></div></div>
      <div class="card qcard">
        <p class="ask">🎧 第 ${i + 1} / ${list.length} 句：仔細聽，然後按 🎤 把句子<b>完整說一次</b><br><small>（正式考試時句子只唸給你聽，不會顯示）</small></p>
        ${sayBtns(s)}
        <div class="row center"><button class="btn primary big" data-mic>🎤 開始說</button></div>
        <div class="said"></div>
        <details class="sample"><summary>👀 看句子</summary><p><b>${esc(s)}</b></p></details>
        ${SR ? '' : '<p class="note-s">這個瀏覽器不能語音辨識，可以自己大聲說完後，打開「看句子」對照。</p>'}
        <div class="row center"><button class="btn" data-next>下一句 ➡</button></div>
      </div>`, geptHome);
    setTimeout(() => speak(s), 400);
    $('[data-mic]').onclick = e => recognize(e.currentTarget, t => {
      const p = Math.round(similarity(s, t) * 100);
      $('.said').innerHTML = `你說：「${esc(t)}」<br><b class="${p >= 70 ? 'g' : 'r'}">${p} 分</b> ${scoreMsg(p)}`;
      sfx(p >= 70);
      $('.sample').open = true;
    });
    $('[data-next]').onclick = () => { i++; draw(); };
  }
}

/* ---------- 口說：朗讀 ---------- */
function speakRead(idx) {
  const p = GEPT.readAloud[idx % GEPT.readAloud.length];
  view(`${bar('📢 口說・朗讀')}
    <div class="card qcard">
      <p class="ask">📢 先默念一遍，準備好後按 🎤，把短文<b>清楚、大聲</b>唸出來，唸完再按一次結束</p>
      <div class="passage read"><h4>${esc(p.title)}</h4><div class="rtext">${p.text.split(/\s+/).map(w => `<span>${esc(w)}</span>`).join(' ')}</div></div>
      <div class="row center"><button class="btn" data-say="${esc(p.text)}">🔊 聽示範</button><button class="btn" data-say="${esc(p.text)}" data-slow="1">🐢 慢速示範</button><button class="btn primary big" data-mic>🎤 開始朗讀</button></div>
      <div class="said"></div>
      <div class="row center"><button class="btn ghost" data-next>➡ 換一篇</button></div>
      <p class="note-s">💡 朗讀重點：發音清楚、速度穩定、句號要停頓、問句語調要上揚。</p>
    </div>`, geptHome);
  $('[data-mic]').onclick = e => recognize(e.currentTarget, t => {
    const said = new Set(norm(t).split(' '));
    const spans = $$('.rtext span');
    let hit = 0;
    spans.forEach(sp => { const k = norm(sp.textContent); const ok = !k || said.has(k); sp.className = ok ? 'g' : 'r'; if (ok) hit++; });
    const pct = Math.round((hit / spans.length) * 100);
    $('.said').innerHTML = `<b class="${pct >= 70 ? 'g' : 'r'}">${pct} 分</b> ${scoreMsg(pct)}<br><small>綠色＝有唸到，紅色＝電腦沒聽到，可以多練習這些字</small>`;
    sfx(pct >= 70);
  }, { continuous: true, recText: '⏹ 唸完了，按這裡結束' });
  $('[data-next]').onclick = () => speakRead(idx + 1);
}

/* ---------- 口說：回答問題 ---------- */
function speakAnswer() {
  const list = sample(GEPT.answer, 5);
  let i = 0;
  draw();
  function draw() {
    if (i >= list.length) {
      view(`${bar('🙋 口說・回答問題')}<div class="card result"><h2>🎉 完成 ${list.length} 題！</h2><p>多練習用「完整句子」回答，再多說一個理由或細節，分數會更高喔！</p><div class="row center"><button class="btn primary" data-again>🔁 再練一次</button><button class="btn" data-menu>⬅ 回英檢</button></div></div>`, geptHome);
      $('[data-again]').onclick = speakAnswer; $('[data-menu]').onclick = geptHome;
      return;
    }
    const q = list[i];
    let left = 15, tm = null;
    view(`${bar('🙋 口說・回答問題')}
      <div class="progress"><div style="width:${(i / list.length) * 100}%"></div></div>
      <div class="card qcard">
        <p class="ask">第 ${i + 1} / ${list.length} 題：聽問題，在 15 秒內用英文回答</p>
        <div class="say-row"><button class="say-big wide" data-say="${esc(q.q)}">🔊 再聽一次</button></div>
        <details class="sample"><summary>👀 看題目</summary><p><b>${esc(q.q)}</b><br><small>${esc(q.zh)}</small></p></details>
        <div class="countdown"><div class="cd-bar"><div></div></div><span>15</span></div>
        <div class="row center"><button class="btn primary big" data-mic>🎤 開始回答</button></div>
        <div class="type-alt"><input class="type-in" placeholder="沒有麥克風？也可以打字回答…" autocomplete="off"><button class="btn" data-type>送出</button></div>
        <div class="said"></div>
        <div class="row center"><button class="btn" data-next>下一題 ➡</button></div>
      </div>`, geptHome);
    let alive = true;
    const startTimer = () => {
      if (tm || !alive) return;
      tm = setInterval(() => {
        left--;
        const sp = $('.countdown span'), bar2 = $('.cd-bar div');
        if (sp) sp.textContent = Math.max(0, left);
        if (bar2) bar2.style.width = (Math.max(0, left) / 15) * 100 + '%';
        if (left <= 0) { clearInterval(tm); if (sp) sp.textContent = '時間到！'; }
      }, 1000);
    };
    onLeave(() => { alive = false; clearInterval(tm); });
    speakSeq([{ text: q.q }], startTimer);
    setTimeout(startTimer, 6000);
    const judge = t => {
      clearInterval(tm);
      const n = countWords(t);
      const tips = [];
      tips.push(n >= 6 ? { ok: true, msg: `說了 ${n} 個字，很完整` } : { ok: false, msg: `只說了 ${n} 個字，試著說成完整的句子（6 個字以上）` });
      if (/\bbecause\b|\bso\b|\band\b/i.test(t)) tips.push({ ok: true, msg: '有用連接詞，回答更豐富' });
      else tips.push({ ok: false, msg: '可以加上 because / and 說出理由或細節' });
      $('.said').innerHTML = `你的回答：「${esc(t)}」${checkListHtml(tips)}<div class="samples"><b>💡 參考回答：</b>${q.samples.map(s => `<div>${esc(s)} <button class="mini" data-say="${esc(s)}">🔊</button></div>`).join('')}</div>`;
      $('.sample').open = true;
    };
    $('[data-mic]').onclick = e => recognize(e.currentTarget, judge, { continuous: true, recText: '⏹ 說完了，按這裡' });
    const ti = $('.type-alt input');
    $('[data-type]').onclick = () => { if (ti.value.trim()) judge(ti.value.trim()); };
    ti.onkeydown = e => { if (e.key === 'Enter') $('[data-type]').click(); };
    $('[data-next]').onclick = () => { i++; draw(); };
  }
}

/* ---------- 開始 ---------- */
$('.brand').onclick = home;
home();
