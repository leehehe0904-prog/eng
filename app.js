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

/* 儲存：每個學生（個人資料）的進度分開存；語音、AI、學生名單是整台電腦共用 */
const GLOBAL_KEYS = new Set(['voice', 'ai', 'profiles', 'pid', 'banks']);
const rawGet = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
const rawSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* 無痕模式等情況就不存 */ } };
const storeKey = k => {
  if (GLOBAL_KEYS.has(k)) return 'engAdv_' + k;
  const pid = rawGet('engAdv_pid', null);
  return pid ? `engAdv_p${pid}_${k}` : 'engAdv_' + k;   // 沒登入（訪客）沿用舊的存法
};
const store = {
  get(k, d) { return rawGet(storeKey(k), d); },
  set(k, v) { rawSet(storeKey(k), v); },
};

for (const g of Object.values(GRADES)) {
  g.W = g.words.map(([en, zh, emoji]) => ({ en, zh, emoji }));
  g.S = g.sentences.map(([en, zh]) => ({ en, zh }));
}
const GRADE_KEYS = Object.keys(GRADES).filter(k => k !== 'gept');
const ALL_WORDS = GRADE_KEYS.filter(k => GRADES[k].level === 'elem').flatMap(k => GRADES[k].W);

/* ---------- 語音朗讀 ----------
   1. 優先播放預先產生的高清錄音（audio/*.mp3，由 tools/make-audio.mjs 產生）
   2. 沒有錄音的句子，改用瀏覽器裡最自然的男聲（Edge 的 Andrew / Guy 等 Natural 語音最好）
   ------------------------------------------------------------------ */
const TTS = 'speechSynthesis' in window;
const CLIPS = window.AUDIO_CLIPS || {};
const VOICE = { m: null, f: null };
const voicePref = () => {
  const p = store.get('voice', { name: '', rate: 1 });
  // 舊版自動存到的 Multilingual（多語言）聲音念單字常常念錯，沒有特別確認過就不用
  if (/multilingual/i.test(p.name) && !p.sure) p.name = '';
  return p;
};
const isMulti = v => /multilingual/i.test(v.name);

// 高品質男聲排序：越前面越好（只限純英文的聲音；多語言聲音念單一單字容易判斷錯語言）
const MALE_RANK = [/\b(andrew|guy|christopher|brian|eric|roger|steffan|davis|tony|jason|ryan)\b.*(natural|online)/i,
  /(natural|online|neural).*(male|andrew|brian|guy|christopher|eric)/i, /google uk english male/i,
  /\b(aaron|evan|nathan|tom|alex|daniel|fred)\b.*(enhanced|premium)?/i, /\b(david|mark|george|james)\b/i, /(?<!fe)\bmale\b/i];
const FEMALE_RANK = [/(aria|jenny|ava|emma|michelle|ana|sara|nancy|jane).*(natural|online)/i, /google us english/i,
  /\b(samantha|allison|ava|susan|zoe)\b/i, /\b(zira|hazel)\b/i, /female/i];
function rankVoice(list, ranks) {
  for (const re of ranks) { const v = list.find(x => re.test(x.name)); if (v) return v; }
  return null;
}
function englishVoices() {
  if (!TTS) return [];
  return speechSynthesis.getVoices().filter(v => /^en[-_]/i.test(v.lang))
    .sort((a, b) => (/natural|online|neural|enhanced|premium/i.test(b.name) - /natural|online|neural|enhanced|premium/i.test(a.name)) || a.name.localeCompare(b.name));
}
function pickVoices() {
  const en = englishVoices();
  const us = en.filter(v => /en[-_]US/i.test(v.lang));
  const usOne = us.filter(v => !isMulti(v)), enOne = en.filter(v => !isMulti(v));
  const pref = voicePref().name;
  VOICE.m = (pref && en.find(v => v.name === pref)) || rankVoice(usOne, MALE_RANK) || rankVoice(enOne, MALE_RANK)
    || rankVoice(us, MALE_RANK) || usOne[0] || enOne[0] || en[0] || null;
  VOICE.f = rankVoice(usOne, FEMALE_RANK) || rankVoice(enOne, FEMALE_RANK) || rankVoice(us, FEMALE_RANK) || VOICE.m;
}
if (TTS) { pickVoices(); speechSynthesis.onvoiceschanged = pickVoices; }

function cleanForSpeech(t) {
  return String(t).replace(/\p{Extended_Pictographic}|️|‍/gu, ' ').replace(/_{2,}/g, ' blank ').replace(/\s+/g, ' ').replace(/ ([.,!?])/g, '$1').trim();
}
/** 錄音檔名：FNV-1a 雜湊（tools/make-audio.mjs 用一樣的算法） */
function clipKey(voice, text) {
  let h = 0x811c9dc5;
  const s = voice + '|' + text;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16).padStart(8, '0');
}
const clipFor = (text, who) => { const k = clipKey(who === 'W' ? 'f' : 'm', text); return CLIPS[k] ? `audio/${k}.mp3` : null; };

/** 把一段文字拆成可播放的片段：整句有錄音就用錄音，否則逐句找錄音，找不到的用瀏覽器語音 */
function toParts(it) {
  const text = cleanForSpeech(it.text);
  if (!text) return [];
  const rate = it.rate || 0.85, who = it.who;
  const whole = clipFor(text, who);
  if (whole) return [{ url: whole, rate, text, who }];
  return text.split(/(?<=[.!?])\s+/).filter(Boolean).map(s => {
    const u = clipFor(s, who);
    return u ? { url: u, rate, text: s, who } : { tts: s, rate, who };
  });
}

const audioEl = new Audio();
audioEl.preload = 'auto';
let speechQ = [], speechGen = 0, speaking = false;
function stopSpeech() {
  speechGen++; speechQ = []; speaking = false;
  try { audioEl.pause(); } catch (e) { }
  if (TTS) speechSynthesis.cancel();
}
/* ---------- 高清標準語音：Kokoro 在瀏覽器裡即時合成（美式發音，每台電腦聽起來都一樣） ----------
   第一次開啟要下載約 90 MB 模型，之後存在瀏覽器裡。沒開或還沒載好時用瀏覽器內建語音。 */
const KOKORO_URL = 'https://cdn.jsdelivr.net/npm/kokoro-js@1.2.1/dist/kokoro.web.js';
const HD = { tts: null, loading: null, cache: new Map(), pct: 0 };
const hdReady = () => voicePref().hd && HD.tts;
function setHD(on) { const p = store.get('voice', { name: '', rate: 1 }); p.hd = on; store.set('voice', p); }
function loadHD(onProgress) {
  if (HD.tts) return Promise.resolve(HD.tts);
  if (HD.loading) return HD.loading;
  const files = {};
  HD.loading = (async () => {
    const { KokoroTTS } = await import(KOKORO_URL);
    HD.tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', {
      dtype: 'q8', device: 'wasm',
      progress_callback: r => {
        if (r.status !== 'progress' || !r.total) return;
        files[r.file] = [r.loaded, r.total];
        const v = Object.values(files), got = v.reduce((s, x) => s + x[0], 0), all = v.reduce((s, x) => s + x[1], 0);
        HD.pct = Math.round((got / all) * 100);
        onProgress && onProgress(HD.pct);
      },
    });
    return HD.tts;
  })();
  HD.loading.catch(() => { }).finally(() => { HD.loading = null; });
  return HD.loading;
}
function hdAudio(text, who) {
  const key = (who === 'W' ? 'f|' : 'm|') + text;
  if (!HD.cache.has(key)) {
    const p = HD.tts.generate(text, { voice: who === 'W' ? 'af_heart' : 'am_michael', speed: 0.95 })
      .then(a => URL.createObjectURL(a.toBlob()));
    p.catch(() => HD.cache.delete(key));
    HD.cache.set(key, p);
    if (HD.cache.size > 300) HD.cache.delete(HD.cache.keys().next().value);
  }
  return HD.cache.get(key);
}

function playNext() {
  const gen = speechGen;
  const p = speechQ.shift();
  if (!p) { speaking = false; return; }
  speaking = true;
  const next = () => { if (gen === speechGen) playNext(); };
  if (typeof p === 'function') { try { p(); } catch (e) { } return next(); }
  const playUrl = (url, base, fallback) => {
    audioEl.src = url;
    audioEl.playbackRate = Math.max(0.5, ((p.rate || 0.85) / base) * (voicePref().rate || 1));
    audioEl.onended = next;
    audioEl.onerror = () => { if (gen === speechGen) fallback(); };
    audioEl.play().catch(() => { if (gen === speechGen) fallback(); });
  };
  const browserTTS = () => {
    if (!TTS || !p.tts) return next();
    // 單一個字後面加句點，語音才會完整、清楚地念出來
    const u = new SpeechSynthesisUtterance(/^[A-Za-z'-]+$/.test(p.tts) ? p.tts + '.' : p.tts);
    u.lang = 'en-US';
    u.rate = (p.rate || 0.85) * (voicePref().rate || 1);
    const v = p.who === 'W' ? VOICE.f : VOICE.m;
    if (v) u.voice = v;
    if (p.who === 'W' && VOICE.f === VOICE.m) u.pitch = 1.3;
    u.onend = next; u.onerror = next;
    speechSynthesis.speak(u);
  };
  if (p.url) return playUrl(p.url, 0.85, () => { speechQ.unshift({ tts: p.text || '', rate: p.rate, who: p.who }); next(); });
  if (!p.tts) return next();
  if (hdReady()) {
    hdAudio(p.tts, p.who)
      .then(url => { if (gen === speechGen) playUrl(url, 0.85, browserTTS); })
      .catch(() => { if (gen === speechGen) browserTTS(); });
    return;
  }
  browserTTS();
}
/** 依序念出多段文字。queue=true 時接在目前正在念的後面 */
function speakSeq(items, onEnd, queue) {
  if (!queue) stopSpeech();
  const parts = items.flatMap(it => toParts(it));
  if (hdReady()) parts.forEach(p => { if (p.tts) hdAudio(p.tts, p.who); });   // 先在背景合成，念起來不會卡
  speechQ.push(...parts);
  if (onEnd) speechQ.push(onEnd);
  if (!speaking) setTimeout(playNext, queue ? 0 : 60);
}
const speak = (text, rate) => speakSeq([{ text, rate }]);

document.addEventListener('click', e => {
  const b = e.target.closest('[data-say]');
  if (b) speak(b.dataset.say, b.dataset.slow ? 0.55 : 0.85);
});
// 之前開過高清語音：開網頁時在背景自動載入（從瀏覽器快取，很快）
if (voicePref().hd) setTimeout(() => loadHD().catch(() => { }), 1500);

/** 語音設定視窗 */
function voiceSettings() {
  const vs = englishVoices();
  const pref = voicePref();
  const d = document.createElement('div');
  d.className = 'modal';
  d.innerHTML = `<div class="modal-card">
    <h3><i class="ic ic-say"></i> 語音設定</h3>
    <div class="hd-box">
      <b>高清標準美式男聲（推薦）</b>
      <small>用 AI 語音模型在電腦上合成，發音標準清楚，每個瀏覽器聽起來都一樣。第一次要下載約 90 MB，之後會記住。</small>
      <div class="hd-state"></div>
    </div>
    <p class="note-s">沒開高清語音時，會用下面選的瀏覽器聲音。</p>
    <label>瀏覽器聲音：<select data-v>${vs.map(v => `<option value="${esc(v.name)}" ${VOICE.m && v.name === VOICE.m.name ? 'selected' : ''}>${esc(v.name)}${isMulti(v) ? '（多語言，單字可能念錯）' : ''}</option>`).join('') || '<option>（這個瀏覽器沒有英文語音）</option>'}</select></label>
    <label>速度：<select data-r>${[[0.8, '慢一點'], [1, '正常'], [1.15, '快一點']].map(([r, t]) => `<option value="${r}" ${+pref.rate === r ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
    <div class="row center"><button class="btn" data-test>試聽</button><button class="btn primary" data-ok>完成</button></div>
  </div>`;
  document.body.appendChild(d);
  const st = $('.hd-state', d);
  const drawHD = () => {
    if (!d.isConnected) return;
    if (voicePref().hd && HD.tts) st.innerHTML = '<span class="g">已開啟</span> <button class="mini" data-hdoff>改回瀏覽器聲音</button>';
    else if (HD.loading) st.innerHTML = `<div class="ai-bar"><div style="width:${HD.pct}%"></div></div><small>下載中 ${HD.pct}%…</small>`;
    else st.innerHTML = '<button class="btn primary" data-hdon>開啟高清語音</button>';
    const on = $('[data-hdon]', st), off = $('[data-hdoff]', st);
    if (on) on.onclick = () => {
      setHD(true);
      loadHD(() => drawHD()).then(() => { drawHD(); speakSeq([{ text: 'Hello! I am Robo. My voice is clear now.' }]); })
        .catch(e => { setHD(false); st.innerHTML = `<span class="r">載入失敗：${esc(e.message || e)}</span>`; });
      drawHD();
    };
    if (off) off.onclick = () => { setHD(false); drawHD(); };
  };
  drawHD();
  let wasLoading = !!HD.loading;
  const iv = setInterval(() => {
    if (!d.isConnected) return clearInterval(iv);
    if (HD.loading || wasLoading) { drawHD(); wasLoading = !!HD.loading; }
  }, 700);
  const save = () => {
    const old = store.get('voice', {});
    store.set('voice', { ...old, name: $('[data-v]', d).value, rate: +$('[data-r]', d).value, sure: true });
    pickVoices();
  };
  $('[data-v]', d).onchange = save; $('[data-r]', d).onchange = save;
  $('[data-test]', d).onclick = () => { save(); speakSeq([{ text: 'Hello! I am Robo. Let us learn English together.' }]); };
  $('[data-ok]', d).onclick = () => { save(); d.remove(); };
  d.onclick = e => { if (e.target === d) d.remove(); };
}

/* ---------- 語音辨識（Chrome / Edge） ---------- */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let activeRec = null;
function recognize(btn, onText, o = {}) {
  if (!SR) { toast('這個瀏覽器不支援語音辨識，請改用 Chrome 或 Edge'); return; }
  if (activeRec) { activeRec.stop(); return; }
  stopSpeech();
  const r = new SR();
  r.lang = 'en-US'; r.interimResults = !!o.interim; r.continuous = !!o.continuous; r.maxAlternatives = 1;
  let text = '';
  const label = btn.innerHTML;
  r.onresult = e => {
    let live = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      if (e.results[i].isFinal) text += ' ' + e.results[i][0].transcript;
      else live += ' ' + e.results[i][0].transcript;
    }
    if (o.interim) o.interim((text + live).trim());
  };
  r.onerror = e => {
    if (e.error === 'not-allowed' || e.error === 'service-not-allowed') toast('請允許瀏覽器使用麥克風');
    else if (e.error === 'no-speech') toast('沒有聽到聲音，再試一次');
    else if (e.error === 'network') toast('語音辨識需要網路連線');
  };
  r.onend = () => {
    activeRec = null;
    btn.classList.remove('rec'); btn.innerHTML = label;
    if (text.trim()) onText(text.trim());
  };
  btn.classList.add('rec');
  btn.innerHTML = o.recText || '<i class="ic ic-stop"></i> 正在聽…（按這裡結束）';
  activeRec = r;
  try { r.start(); } catch (err) { activeRec = null; btn.classList.remove('rec'); btn.innerHTML = label; }
}
/** 用說的輸入：說話時文字即時出現在輸入框，說完後自己檢查、再按送出 */
function micToInput(btn, inp, o = {}) {
  if (activeRec) { activeRec.stop(); return; }   // 再按一次 = 說完了
  if (inp.disabled) return;
  const before = inp.value;
  inp.classList.add('listening');
  recognize(btn, t => {
    inp.classList.remove('listening');
    inp.value = cap(t);
    inp.focus();
    inp.setSelectionRange(inp.value.length, inp.value.length);
    toast('說完了！看看文字對不對，可以修改，再按送出');
  }, { recText: o.recText || '<i class="ic ic-stop"></i>', continuous: o.continuous, interim: t => { inp.value = t; } });
  // 沒聽到任何聲音時，恢復原本的內容
  const restore = setInterval(() => {
    if (activeRec) return;
    clearInterval(restore);
    inp.classList.remove('listening');
    if (!inp.value.trim()) inp.value = before;
  }, 300);
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
  const colors = ['#ff6b6b', '#ffa94d', '#ffd43b', '#51cf66', '#4dabf7', '#9775fa', '#f783ac'];
  for (let i = 0; i < 40; i++) {
    const s = document.createElement('span');
    s.className = 'confetti';
    s.style.left = Math.random() * 100 + 'vw';
    s.style.animationDelay = Math.random() * 0.8 + 's';
    s.style.background = pick(colors);
    s.style.width = 6 + Math.random() * 8 + 'px';
    s.style.height = 10 + Math.random() * 10 + 'px';
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
const checkListHtml = list => `<ul class="checks">${list.map(c => `<li class="${c.ok ? 'ok' : 'bad'}">${esc(c.msg)}</li>`).join('')}</ul>`;

/* ---------- 畫面切換 ---------- */
let leaveFns = [];
const onLeave = f => leaveFns.push(f);
function view(html, back) {
  leaveFns.forEach(f => { try { f(); } catch (e) { } });
  leaveFns = [];
  stopSpeech();
  if (activeRec) { try { activeRec.abort(); } catch (e) { } activeRec = null; }
  app.innerHTML = html;
  window.scrollTo(0, 0);
  const b = $('[data-back]', app);
  if (b && back) b.onclick = back;
}
const bar = (title, right = '') => `<div class="topbar"><button class="back" data-back>← 返回</button><h2>${title}</h2><div class="tb-right">${right}</div></div>`;
const starsOf = pct => (pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 40 ? 1 : 0);
const starsHtml = n => `<span class="stars">${'★'.repeat(n)}<i>${'★'.repeat(3 - n)}</i></span>`;
function saveBest(key, pct) { const b = store.get('best', {}); if (!(b[key] >= pct)) { b[key] = pct; store.set('best', b); } }
const bestOf = key => store.get('best', {})[key];
const modeCard = (id, icon, name, desc, extra = '') =>
  `<button class="mode" data-m="${id}"><b>${name}</b><small>${desc}</small>${extra}</button>`;
const sayBtns = text => `<div class="say-row"><button class="say-big" data-say="${esc(text)}" title="再聽一次"><i class="ic ic-say"></i></button><button class="say-slow" data-say="${esc(text)}" data-slow="1">慢速</button></div>`;
/** 小喇叭＋慢速：用在正確答案、參考答案、例句旁邊 */
const sayMini = text => `<span class="say-mini"><button class="mini" data-say="${esc(text)}" title="朗讀"><i class="ic ic-say"></i></button><button class="mini slow" data-say="${esc(text)}" data-slow="1" title="慢速朗讀">慢速</button></span>`;

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
  box.innerHTML = `${o.mic && SR ? '<button class="mic" type="button" title="用說的"><i class="ic ic-mic"></i></button>' : ''}<input class="type-in" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${o.ph || '在這裡輸入英文'}"><button class="btn primary" data-go>檢查</button>`;
  el.appendChild(box);
  const inp = $('input', box), b = $('[data-go]', box), mic = $('.mic', box);
  if (mic) mic.onclick = () => micToInput(mic, inp);
  setTimeout(() => inp.focus({ preventScroll: true }), 50);
  const go = () => {
    if (!inp.value.trim()) { inp.focus(); return; }
    inp.disabled = b.disabled = true;
    if (mic) mic.disabled = true;
    const ok = check(inp.value);
    inp.classList.add(ok ? 'right' : 'wrong');
    o.after && o.after(inp.value, ok);
    done(ok, rev);
  };
  b.onclick = go;
  inp.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); go(); } };
  if (o.onInput) inp.oninput = () => o.onInput(inp.value);
}

/* ---------- 提示工具 ---------- */
/** 字母格：打字時即時顯示對（綠）錯（紅），也可以一個一個揭曉字母 */
function letterBoxes(el, word, revealed = 0) {
  const d = document.createElement('div');
  d.className = 'lboxes';
  el.appendChild(d);
  const st = { rev: revealed, v: '' };
  const draw = () => {
    d.innerHTML = word.split('').map((c, i) => {
      const t = st.v[i];
      if (t) return `<span class="lb ${t.toLowerCase() === c.toLowerCase() ? 'g' : 'r'}">${esc(t)}</span>`;
      return `<span class="lb ${i < st.rev ? 'rev' : ''}">${i < st.rev ? esc(c) : ''}</span>`;
    }).join('') + `<small>${word.length} 個字母</small>`;
  };
  draw();
  return {
    set(v) { st.v = v.trim(); draw(); },
    reveal() { if (st.rev < word.length - 1) { st.rev++; draw(); return true; } return false; },
  };
}
/** 拼字題的提示按鈕列 */
function spellHints(el, w, lb, o = {}) {
  const box = document.createElement('div');
  box.className = 'hint-row';
  box.innerHTML = `${o.sound ? `<button class="mini" data-say="${esc(w.en)}"><i class="ic ic-say"></i> 聽發音</button>` : ''}
    ${o.zh ? '<button class="mini" data-zhh>看中文</button>' : ''}
    <button class="mini" data-more>多給一個字母</button>
    <button class="mini" data-mix>打亂的字母</button>
    <div class="hint-out"></div>`;
  el.appendChild(box);
  const out = $('.hint-out', box);
  const zb = $('[data-zhh]', box);
  if (zb) zb.onclick = () => { out.insertAdjacentHTML('beforeend', `<div class="hint-line">${w.emoji} ${esc(w.zh)}</div>`); zb.remove(); };
  $('[data-more]', box).onclick = e => { if (!lb.reveal()) { toast('只剩最後一個字母，自己試試看！'); e.currentTarget.disabled = true; } };
  $('[data-mix]', box).onclick = e => {
    e.currentTarget.remove();
    out.insertAdjacentHTML('beforeend', `<div class="hint-line">用這些字母拼：${shuffleDiff(w.en.split('')).map(c => `<button type="button" class="wchip letter">${esc(c)}</button>`).join('')}</div>`);
    $$('.wchip.letter', out).forEach(c => c.onclick = () => {
      const inp = $('.type-in', el); if (!inp || inp.disabled) return;
      inp.value += c.textContent; inp.focus(); lb.set(inp.value);
    });
  };
}
/** 漸進式提示：每按一次多給一個提示。steps 是回傳 HTML 的函式 */
function hintLadder(el, steps) {
  if (!steps.length) return;
  const box = document.createElement('div');
  box.className = 'hint-row';
  box.innerHTML = `<button type="button" class="mini hint-btn">提示（共 ${steps.length} 個）</button><div class="hint-out"></div>`;
  ($('.hl', el) || el).appendChild(box);
  const btn = $('.hint-btn', box), out = $('.hint-out', box);
  let i = 0;
  btn.onclick = () => {
    out.insertAdjacentHTML('beforeend', `<div class="hint-line">${steps[i++]()}</div>`);
    if (i >= steps.length) btn.remove();
    else btn.textContent = `再一個提示（還有 ${steps.length - i} 個）`;
  };
}
const firstHalf = s => { const t = s.split(/\s+/); return t.slice(0, Math.ceil(t.length / 2)).join(' ') + ' …'; };
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
    <div class="row center"><button class="btn ghost" data-reset>↺ 重來</button><button class="btn primary" data-check disabled>檢查</button></div>`;
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
/* ---------- 不重複出題 ----------
   記住每個單字／句子／題目上次出現的順序（存在這台電腦），每次都優先出「最久沒出現」的，
   全部輪過一遍之後才會再出現重複的。 */
const SEEN = store.get('seen', {});
let seenTick = store.get('seenTick', 0);
function lruPick(list, keyOf) {
  if (!list.length) return null;
  let best = Infinity, cands = [];
  for (const x of list) {
    const v = SEEN[keyOf(x)] || 0;
    if (v < best) { best = v; cands = [x]; } else if (v === best) cands.push(x);
  }
  const c = pick(cands);
  SEEN[keyOf(c)] = ++seenTick;
  return c;
}
const saveSeen = () => { store.set('seen', SEEN); store.set('seenTick', seenTick); };
function lruSample(list, n, ns) {
  const keyOf = it => ns + ':' + (typeof it === 'string' ? it : JSON.stringify(it).slice(0, 120));
  const out = [], rest = list.slice();
  while (out.length < n && rest.length) { const c = lruPick(rest, keyOf); out.push(c); rest.splice(rest.indexOf(c), 1); }
  saveSeen();
  return shuffle(out);
}
const pickW = (c, list) => (c.lru ? lruPick(list, w => 'w:' + w.en) : pick(list));
const pickS = (c, list) => (c.lru ? lruPick(list, x => 's:' + x.en) : pick(list));
const wrev = w => ({ en: w.en, zh: w.zh });
const spellable = words => words.filter(w => /^[A-Za-z]{3,10}$/.test(w.en));
function findVocab(tok, words) {
  const t = tok.toLowerCase();
  return words.find(w => { const e = w.en.toLowerCase(); return t === e || t === e + 's' || t === e + 'es'; });
}

const Q = {
  listen: {
    label: '聽音選圖',
    make(c) { if (c.words.length < 4) return null; const a = pickW(c, c.words); return { key: a.en, a, opts: shuffle([a, ...sample(c.words.filter(w => w !== a), 3)]) }; },
    render(el, q, done) {
      const pics = q.opts.every(o => o.emoji);   // 只要有一個沒圖，就全部只顯示中文，避免洩漏答案
      el.innerHTML = `<p class="ask">聽一聽，選出正確的${pics ? '圖' : '意思'}</p>${sayBtns(q.a.en)}${optButtons(q.opts.map(o => `<span class="emo">${pics ? o.emoji : ''}</span><small>${esc(o.zh)}</small>`), 'pics')}`;
      setTimeout(() => speak(q.a.en), 350);
      bindOpts(el, q.opts.indexOf(q.a), done, wrev(q.a));
    },
  },
  pic2word: {
    label: '看圖選字',
    make(c) { if (c.words.length < 4) return null; const a = pickW(c, c.words); return { key: a.en, a, opts: shuffle([a, ...sample(c.words.filter(w => w !== a), 3)]) }; },
    render(el, q, done) {
      el.innerHTML = `<p class="ask">這是什麼？選出正確的英文</p><div class="big-emo">${q.a.emoji}</div><div class="zh-big">${esc(q.a.zh)}</div><div class="hl"></div>${optButtons(q.opts.map(o => esc(o.en)), 'words')}`;
      hintLadder(el, [() => `第一個字母是 <b>${esc(q.a.en[0])}</b>`, () => { speak(q.a.en); return '<i class="ic ic-say"></i> 聽聽看發音'; }]);
      bindOpts(el, q.opts.indexOf(q.a), done, wrev(q.a));
    },
  },
  listenSpell: {
    label: '聽寫單字',
    make(c) { const ws = spellable(c.words); if (!ws.length) return null; const a = pickW(c, ws); return { key: a.en, a }; },
    render(el, q, done) {
      el.innerHTML = `<p class="ask">聽一聽，把單字拼出來</p>${sayBtns(q.a.en)}`;
      setTimeout(() => speak(q.a.en), 350);
      const lb = letterBoxes(el, q.a.en, 0);
      spellHints(el, q.a, lb, { zh: true });
      typeAnswer(el, v => v.trim().toLowerCase() === q.a.en.toLowerCase(), done, wrev(q.a), { onInput: v => lb.set(v) });
    },
  },
  typeWord: {
    label: '看圖拼字',
    make(c) { const ws = spellable(c.words); if (!ws.length) return null; const a = pickW(c, ws); return { key: a.en, a }; },
    render(el, q, done) {
      el.innerHTML = `<p class="ask">看圖，寫出英文單字</p><div class="big-emo">${q.a.emoji}</div><div class="zh-big">${esc(q.a.zh)}</div>`;
      const lb = letterBoxes(el, q.a.en, 1);
      spellHints(el, q.a, lb, { sound: true });
      typeAnswer(el, v => v.trim().toLowerCase() === q.a.en.toLowerCase(), done, wrev(q.a), { onInput: v => lb.set(v) });
    },
  },
  missingLetter: {
    label: '缺字母填空',
    make(c) {
      const ws = spellable(c.words); if (!ws.length) return null;
      const a = pickW(c, ws); const idx = Math.floor(Math.random() * a.en.length);
      const letter = a.en[idx].toLowerCase();
      const others = shuffle('abcdefghijklmnopqrstuvwxyz'.split('').filter(x => x !== letter)).slice(0, 3);
      return { key: a.en, a, idx, letter, opts: shuffle([letter, ...others]) };
    },
    render(el, q, done) {
      const shown = esc(q.a.en.slice(0, q.idx)) + '<span class="blank">_</span>' + esc(q.a.en.slice(q.idx + 1));
      el.innerHTML = `<p class="ask">少了哪一個字母？</p><div class="big-emo sm">${q.a.emoji}</div><div class="word-show">${shown}</div><div class="zh-big sm">${esc(q.a.zh)} <button class="mini" data-say="${esc(q.a.en)}"><i class="ic ic-say"></i></button></div><div class="hl"></div>${optButtons(q.opts.map(esc), 'letters')}`;
      hintLadder(el, [() => { speak(q.a.en, 0.55); return '慢慢聽一次，注意空格那個音'; }]);
      bindOpts(el, q.opts.indexOf(q.letter), done, wrev(q.a), i => { $('.blank', el).textContent = q.opts[i]; });
    },
  },
  spellBlocks: {
    label: '字母積木',
    make(c) { const ws = spellable(c.words).filter(w => w.en.length <= 9); if (!ws.length) return null; const a = pickW(c, ws); return { key: a.en, a }; },
    render(el, q, done) {
      el.innerHTML = `<p class="ask">用字母積木拼出單字</p><div class="big-emo sm">${q.a.emoji}</div><div class="zh-big sm">${esc(q.a.zh)} <button class="mini" data-say="${esc(q.a.en)}"><i class="ic ic-say"></i></button></div>`;
      hintLadder(el, [() => `第一個字母是 <b>${esc(q.a.en[0])}</b>`, () => `前半段：<b>${esc(q.a.en.slice(0, Math.ceil(q.a.en.length / 2)))}</b> …`]);
      blockPuzzle(el, q.a.en.split(''), done, wrev(q.a), { letters: true });
    },
  },
  fillSentence: {
    label: '句子填空',
    make(c) {
      const ss = c.sentences.filter(s => tokens(s.en).length >= 3); if (!ss.length) return null;
      const s = pickS(c, ss); const raw = s.en.split(/\s+/);
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
      pool = [...new Map(pool.map(p => [p.toLowerCase(), p])).values()].filter(p => p.toLowerCase() !== ans.toLowerCase());
      if (pool.length < 3) return null;
      const display = raw.map((w, i) => (i === x.i ? esc(w).replace(esc(ans), '<span class="blank">_____</span>') : esc(w))).join(' ');
      return { key: s.en, s, ans, display, opts: shuffle([ans, ...sample(pool, 3)]) };
    },
    render(el, q, done) {
      el.innerHTML = `<p class="ask">選出正確的字填入空格</p><div class="sentence">${q.display}</div><div class="zh-big sm">${esc(q.s.zh)}</div><div class="hl"></div>${optButtons(q.opts.map(esc), 'words')}`;
      hintLadder(el, [() => { speak(q.s.en); return '<i class="ic ic-say"></i> 聽整句話，找出空格的字'; }, () => `答案的第一個字母是 <b>${esc(q.ans[0])}</b>`, () => `答案有 <b>${q.ans.length}</b> 個字母`]);
      bindOpts(el, q.opts.indexOf(q.ans), done, { en: q.s.en, zh: q.s.zh }, i => { $('.blank', el).textContent = q.opts[i]; });
    },
  },
  sentenceBlocks: {
    label: '句子積木',
    make(c) { const ss = c.sentences.filter(s => { const n = tokens(s.en).length; return n >= 3 && n <= 12; }); if (!ss.length) return null; const s = pickS(c, ss); return { key: s.en, s }; },
    render(el, q, done) {
      el.innerHTML = `<p class="ask">把積木排成正確的句子</p><div class="zh-big">${esc(q.s.zh)} <button class="mini" data-say="${esc(q.s.en)}"><i class="ic ic-say"></i></button></div>`;
      hintLadder(el, [() => `第一個字是 <b>${esc(tokens(q.s.en)[0])}</b>`, () => { speak(q.s.en); return '<i class="ic ic-say"></i> 聽整句，照順序排'; }, () => `前半句：<b>${esc(firstHalf(q.s.en))}</b>`]);
      blockPuzzle(el, tokens(q.s.en), done, { en: q.s.en, zh: q.s.zh }, { post: endPunct(q.s.en) });
    },
  },
  listenBlocks: {
    label: '聽句子排積木',
    make(c) { const ss = c.sentences.filter(s => { const n = tokens(s.en).length; return n >= 3 && n <= 12; }); if (!ss.length) return null; const s = pickS(c, ss); return { key: s.en, s }; },
    render(el, q, done) {
      el.innerHTML = `<p class="ask">聽句子，把積木排出來</p>${sayBtns(q.s.en)}`;
      setTimeout(() => speak(q.s.en), 350);
      hintLadder(el, [() => `中文意思：<b>${esc(q.s.zh)}</b>`, () => `第一個字是 <b>${esc(tokens(q.s.en)[0])}</b>`, () => `前半句：<b>${esc(firstHalf(q.s.en))}</b>`]);
      blockPuzzle(el, tokens(q.s.en), done, { en: q.s.en, zh: q.s.zh }, { post: endPunct(q.s.en) });
    },
  },
  listenSentenceZh: {
    label: '聽句子選意思',
    make(c) { if (c.sentences.length < 4) return null; const s = pickS(c, c.sentences); return { key: s.en, s, opts: shuffle([s, ...sample(c.sentences.filter(x => x !== s), 3)]) }; },
    render(el, q, done) {
      el.innerHTML = `<p class="ask">聽一聽，這句話是什麼意思？</p>${sayBtns(q.s.en)}<div class="hl"></div>${optButtons(q.opts.map(o => esc(o.zh)), 'zh-opts')}`;
      hintLadder(el, [() => { speak(q.s.en, 0.55); return '慢慢再聽一次'; }, () => `英文句子：<b>${esc(q.s.en)}</b>`]);
      setTimeout(() => speak(q.s.en), 350);
      bindOpts(el, q.opts.indexOf(q.s), done, { en: q.s.en, zh: q.s.zh });
    },
  },
  writeSentence: {
    label: '看中文寫句子',
    make(c) { if (!c.sentences.length) return null; const s = pickS(c, c.sentences); return { key: s.en, s }; },
    render(el, q, done) {
      el.innerHTML = `<p class="ask">把這句中文寫成英文</p><div class="zh-big">${esc(q.s.zh)}</div>
`;
      hintLadder(el, [
        () => `每個字的第一個字母：<b class="mono">${esc(tokens(q.s.en).map(t => t[0] + '_'.repeat(t.length - 1)).join(' ') + endPunct(q.s.en))}</b>`,
        () => `會用到這些字（點一下加進去）：${shuffleDiff(tokens(q.s.en)).map(t => `<button type="button" class="wchip addw">${esc(t)}</button>`).join('')}`,
        () => { speak(q.s.en); return '<i class="ic ic-say"></i> 聽整句（可以再按上面的提示重聽）'; },
        () => `前半句：<b>${esc(firstHalf(q.s.en))}</b>`,
      ]);
      el.addEventListener('click', e => { const c = e.target.closest('.wchip.addw'); const inp = $('.type-in', el); if (c && inp && !inp.disabled) { inp.value = (inp.value.trim() + ' ' + c.textContent).trim(); inp.focus(); } });
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

/* ---------- AI 對話提示：句型 + 字庫 + 例句 ---------- */
const hintFor = ai => {
  const h = (typeof CHAT_HINTS !== 'undefined' && CHAT_HINTS[ai]) || null;
  return h ? { pat: h[0], words: h[1] } : null;
};
function hintHtml(h, examples, showEx) {
  return `<div class="hint-box">
    ${h ? `<div class="pat">句型：<b>${esc(h.pat)}</b></div>
    <div class="wbank"><span>點字放進去：</span>${h.words.map(w => `<button type="button" class="wchip">${esc(w)}</button>`).join('')}</div>` : ''}
    ${examples && examples.length ? `<div class="exs" ${showEx ? '' : 'hidden'}><span>例句：</span>${examples.map(x => `<span class="ex-item"><button type="button" class="chip ex">${esc(x)}</button>${sayMini(x)}</span>`).join('')}</div>
    ${showEx ? '' : '<button type="button" class="mini" data-showex>還是不會？看例句</button>'}` : ''}
  </div>`;
}
/** 把字庫的字填進輸入框：空的話先放句型，有 ___ 就填進第一個空格 */
function bindHint(box, getInput, h) {
  const fillIn = w => {
    const inp = getInput();
    if (!inp || inp.disabled) return;
    let v = inp.value;
    if (/[.!?]$/.test(w)) v = w;
    else {
      if (!v.trim() && h) v = h.pat.split(' / ')[0];
      v = v.includes('___') ? v.replace('___', w) : (v.trim() + ' ' + w).trim();
    }
    inp.value = v; inp.focus();
    const p = v.indexOf('___');
    if (p >= 0) inp.setSelectionRange(p, p + 3); else inp.setSelectionRange(v.length, v.length);
  };
  $$('.wchip', box).forEach(b => b.onclick = () => fillIn(b.textContent));
  $$('.chip.ex', box).forEach(b => b.onclick = () => { const inp = getInput(); if (inp && !inp.disabled) { inp.value = b.textContent; inp.focus(); } });
  const se = $('[data-showex]', box);
  if (se) se.onclick = () => { $('.exs', box).hidden = false; se.remove(); };
}

/* ---------- 遊戲型題目（直接出現在答題中） ---------- */
Object.assign(Q, {
  match: {
    label: '配對遊戲', max: 1,
    make(c) {
      if (c.words.length < 4) return null;
      const set = sample(c.words, 4);
      return { key: 'match:' + set.map(w => w.en).join(), set, L: shuffle(set), R: shuffle(set) };
    },
    render(el, q, done) {
      el.innerHTML = `<p class="ask">把英文和圖片配成一對（先點左邊，再點右邊）</p>
        <div class="match">
          <div class="col">${q.L.map((w, i) => `<button class="m-card m-l" data-i="${i}">${esc(w.en)}</button>`).join('')}</div>
          <div class="col">${q.R.map((w, i) => `<button class="m-card m-r" data-i="${i}"><span class="emo">${w.emoji}</span> ${esc(w.zh)}</button>`).join('')}</div>
        </div>`;
      let sl = null, sr = null, matched = 0, miss = 0;
      const tryMatch = () => {
        if (sl == null || sr == null) return;
        const bl = $(`.m-l[data-i="${sl}"]`, el), br = $(`.m-r[data-i="${sr}"]`, el);
        if (q.L[sl] === q.R[sr]) {
          [bl, br].forEach(b => { b.classList.remove('sel'); b.classList.add('done'); b.disabled = true; });
          matched++;
          if (matched === q.set.length) {
            done(miss <= 1, { head: `配錯了 ${miss} 次，再熟悉一下：`, en: q.set.map(w => `${w.en} = ${w.zh}`).join('、'), say: false });
          } else sfx(true);
        } else {
          miss++; sfx(false);
          [bl, br].forEach(b => { b.classList.remove('sel'); b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 450); });
        }
        sl = sr = null;
      };
      $$('.m-l', el).forEach(b => b.onclick = () => { $$('.m-l', el).forEach(x => x.classList.remove('sel')); b.classList.add('sel'); sl = +b.dataset.i; speak(q.L[sl].en); tryMatch(); });
      $$('.m-r', el).forEach(b => b.onclick = () => { $$('.m-r', el).forEach(x => x.classList.remove('sel')); b.classList.add('sel'); sr = +b.dataset.i; tryMatch(); });
    },
  },
  chatReply: {
    label: 'AI 對話', max: 2,
    make(c) {
      const turns = (c.dialogues || []).flatMap(d => d.turns.map((t, i) => ({ t, prev: i > 0 ? d.turns[i - 1] : null })));
      if (!turns.length) return null;
      const x = c.lru ? lruPick(turns, x => 't:' + x.t.ai) : pick(turns);
      return { key: 'chat:' + x.t.ai, t: x.t, prev: x.prev };
    },
    render(el, q, done) {
      const t = q.t, ai = t.ai.replace(/\{name\}/g, 'friend'), h = hintFor(t.ai);
      const p = q.prev;
      el.innerHTML = `<p class="ask">Robo 在問你問題，用英文回答它！</p>
        ${p ? `<div class="chat-ctx"><small>剛剛聊到：</small>
          <div class="msg ai"><span class="av bot">Robo</span><div class="bub">${esc(p.ai.replace(/\{name\}/g, 'friend'))}<div class="zh">${esc(p.zh)}</div></div></div>
          <div class="msg me"><div class="bub">${esc(p.ex[0])}</div><span class="av kid">我</span></div></div>` : ''}
        <div class="msg ai solo"><span class="av bot">Robo</span><div class="bub"><div>${esc(ai)}</div><div class="zh">${esc(t.zh)}</div>
          <div class="tools"><button class="mini" data-say="${esc(ai)}"><i class="ic ic-say"></i></button><button class="mini" data-say="${esc(ai)}" data-slow="1">慢速</button><button class="mini" data-zh>中文</button></div></div></div>
        ${hintHtml(h, t.ex, false)}`;
      setTimeout(() => speak(ai), 350);
      $('[data-zh]', el).onclick = () => { const z = $('.msg.solo .zh', el); z.hidden = !z.hidden; };
      typeAnswer(el, v => accepts(t.keys, v), done, { head: '可以這樣回答：', okHead: '參考說法：', en: t.ex[0], zh: t.zh }, { ph: h ? h.pat.split(' / ')[0] : '用英文回答…', mic: true });
      bindHint($('.hint-box', el), () => $('.type-in', el), h);
    },
  },
  makeSentence: {
    label: '自己造句', max: 1,
    make(c) {
      const ws = c.words.filter(w => /^[A-Za-z]+$/.test(w.en));
      if (!ws.length) return null;
      const w = pickW(c, ws);
      const ex = c.sentences.find(s => new RegExp(`\\b${w.en}`, 'i').test(s.en));
      return { key: 'make:' + w.en, w, ex };
    },
    render(el, q, done) {
      const w = q.w;
      el.innerHTML = `<p class="ask">用「${esc(w.en)}」自己寫一個英文句子！</p>
        <div class="word-card inline"><span class="emo">${w.emoji}</span><div><b>${esc(w.en)}</b><small>${esc(w.zh)}</small></div><button class="mini" data-say="${esc(w.en)}"><i class="ic ic-say"></i></button></div>
        <div class="starters">${STARTERS.slice(0, 6).map(s => `<button class="chip" data-st="${esc(s)}">${esc(s)}</button>`).join('')}</div>`;
      const rev = q.ex ? { head: '參考句子：', en: q.ex.en, zh: q.ex.zh } : { head: '照上面的提示改一改就更好了', en: '', say: false };
      hintLadder(el, [
        () => `好句子的樣子：<b>大寫開頭</b>、有用到 <b>${esc(w.en)}</b>、<b>3 個字以上</b>、最後加 <b>. ? !</b>`,
        () => `例如：<b>I like ${esc(w.en)}.</b><b>This is my ${esc(w.en)}.</b><b>It is ${esc(w.en)}.</b>（選最通順的改一改）`,
        ...(q.ex ? [() => `參考句子：<b>${esc(q.ex.en)}</b> <small>${esc(q.ex.zh)}</small>`] : []),
      ]);
      typeAnswer(el, v => checkWriting(v, [w.en]).every(c => c.ok), done, rev, {
        ph: '寫一個完整的句子…',
        after(v, ok) {
          const d = document.createElement('div');
          d.innerHTML = checkListHtml(checkWriting(v, [w.en]));
          el.appendChild(d);
          if (ok) { rev.en = v.trim(); rev.zh = ''; rev.say = true; }
        },
      });
      $$('[data-st]', el).forEach(b => b.onclick = () => {
        const inp = $('.type-in', el); if (inp.disabled) return;
        inp.value = b.dataset.st; inp.focus();
        const p = inp.value.indexOf('___'); if (p >= 0) inp.setSelectionRange(p, p + 3);
      });
    },
  },
  speakSay: {
    label: '跟著說', max: 2,
    make(c) {
      if (!SR) return null;
      const ss = c.sentences.filter(s => tokens(s.en).length <= 8);
      if (!ss.length) return null;
      const s = pickS(c, ss);
      return { key: 'say:' + s.en, s };
    },
    render(el, q, done) {
      const rev = { en: q.s.en, zh: q.s.zh };
      el.innerHTML = `<p class="ask">聽一聽，按 <i class="ic ic-mic"></i> 跟著說一次（每個字都念清楚才過關）</p>${sayBtns(q.s.en)}
        <div class="zh-big sm">${esc(q.s.zh)}</div>`;
      setTimeout(() => speak(q.s.en), 350);
      // 發音不正確不給過關；三次內過關算答對，略過算答錯
      pronPractice(el, q.s.en, { skip: true, onPass: (r, tries) => done(tries <= 3, rev), onSkip: () => done(false, rev) });
    },
  },
});

/* ---------- 英檢題型 ---------- */
const scriptOf = it => it.lines ? it.lines.map(([w, t]) => `${w === 'M' ? '男' : '女'}：${t}`).join('\n') : '';
Object.assign(Q, {
  gPic: {
    label: '聽力・看圖辨義',
    render(el, q, done) {
      const it = q.item;
      el.innerHTML = `<p class="ask">看圖片，聽問題和 A、B、C 三個選項，選出最符合圖片的答案</p><div class="pic-scene">${it.pic}</div><div class="say-row"><button class="say-big wide" data-play><i class="ic ic-say"></i> 播放題目</button></div>${optButtons(['A', 'B', 'C'], 'abc')}`;
      const play = () => speakSeq([{ text: it.q }, { text: 'A. ' + it.opts[0] }, { text: 'B. ' + it.opts[1] }, { text: 'C. ' + it.opts[2] }]);
      $('[data-play]', el).onclick = play; setTimeout(play, 400);
      bindOpts(el, it.a, done, { en: `${ABC[it.a]}. ${it.opts[it.a]}`, note: `聽力內容：\n${it.q}\nA. ${it.opts[0]}\nB. ${it.opts[1]}\nC. ${it.opts[2]}`, say: false });
    },
  },
  gQA: {
    label: '聽力・問答',
    render(el, q, done) {
      const it = q.item;
      el.innerHTML = `<p class="ask">聽一句話，選出最適合的回應</p><div class="say-row"><button class="say-big wide" data-say="${esc(it.q)}"><i class="ic ic-say"></i> 播放題目</button></div>${optButtons(it.opts.map((o, i) => `<b>${ABC[i]}.</b> ${esc(o)}`), 'text-opts')}`;
      setTimeout(() => speak(it.q), 400);
      bindOpts(el, it.a, done, { en: `${ABC[it.a]}. ${it.opts[it.a]}`, note: `聽力內容：${it.q}`, say: false });
    },
  },
  gDialog: {
    label: '聽力・簡短對話',
    render(el, q, done) {
      const it = q.item;
      el.innerHTML = `<p class="ask">聽一段對話和問題，選出正確答案</p><div class="say-row"><button class="say-big wide" data-play><i class="ic ic-say"></i> 播放對話</button></div><p class="q-print">${esc(it.q)}</p>${optButtons(it.opts.map((o, i) => `<b>${ABC[i]}.</b> ${esc(o)}`), 'text-opts')}`;
      const play = () => speakSeq([...it.lines.map(([who, text]) => ({ who, text })), { text: 'Question: ' + it.q, rate: 0.8 }]);
      $('[data-play]', el).onclick = play; setTimeout(play, 400);
      bindOpts(el, it.a, done, { en: `${ABC[it.a]}. ${it.opts[it.a]}`, note: `對話內容：\n${scriptOf(it)}`, say: false });
    },
  },
  gTalk: {
    label: '聽力・短文聽解',
    render(el, q, done) {
      const it = q.item;
      el.innerHTML = `<p class="ask">聽一段短文，選出正確的圖片</p><div class="say-row"><button class="say-big wide" data-play><i class="ic ic-say"></i> 播放短文</button></div><p class="q-print">${esc(it.q)}</p>${optButtons(it.opts.map((o, i) => `<span class="emo">${o}</span><small>${ABC[i]}</small>`), 'pics three')}`;
      const play = () => speakSeq([{ text: it.talk }, { text: 'Question: ' + it.q, rate: 0.8 }]);
      $('[data-play]', el).onclick = play; setTimeout(play, 400);
      bindOpts(el, it.a, done, { en: `${ABC[it.a]}. ${it.opts[it.a]}`, note: `短文內容：${it.talk}`, say: false });
    },
  },
  gVocab: {
    label: '閱讀・詞彙',
    render(el, q, done) {
      const it = q.item;
      el.innerHTML = `<p class="ask">選出最適合填入空格的答案</p><div class="sentence">${esc(it.q).replace(/_{3,}/, '<span class="blank">______</span>')}</div>${optButtons(it.opts.map((o, i) => `<b>${ABC[i]}.</b> ${esc(o)}`), 'text-opts two')}`;
      bindOpts(el, it.a, done, { en: `${ABC[it.a]}. ${it.opts[it.a]}`, zh: it.ex, say: false }, i => { $('.blank', el).textContent = it.opts[i]; });
    },
  },
  gCloze: {
    label: '閱讀・段落填空',
    render(el, q, done) {
      const it = q.item, n = q.n, b = it.blanks[n];
      const txt = esc(it.text).replace(/\[(\d)\]/g, (m, k) => `<span class="cz ${+k === n + 1 ? 'cur' : ''}">(${k}) ${+k === n + 1 ? '______' : '___'}</span>`);
      el.innerHTML = `<p class="ask">閱讀短文，選出第 (${n + 1}) 格的答案</p><div class="passage"><h4>${esc(it.title)}</h4>${txt}</div>${optButtons(b.opts.map((o, i) => `<b>${ABC[i]}.</b> ${esc(o)}`), 'text-opts two')}`;
      bindOpts(el, b.a, done, { en: `(${n + 1}) ${ABC[b.a]}. ${b.opts[b.a]}`, zh: b.ex, say: false }, i => { $('.cz.cur', el).textContent = `(${n + 1}) ${b.opts[i]}`; });
    },
  },
  gComp: {
    label: '閱讀・閱讀理解',
    render(el, q, done) {
      const it = q.item, sq = it.qs[q.n];
      el.innerHTML = `<p class="ask">閱讀下面的內容，回答問題</p><div class="passage"><h4>${esc(it.title)}</h4>${esc(it.text)}</div><p class="q-print">${esc(sq.q)}</p>${optButtons(sq.opts.map((o, i) => `<b>${ABC[i]}.</b> ${esc(o)}`), 'text-opts two')}`;
      bindOpts(el, sq.a, done, { en: `${ABC[sq.a]}. ${sq.opts[sq.a]}`, say: false });
    },
  },
  gRewrite: {
    label: '寫作・句子改寫',
    render(el, q, done) {
      const it = q.item;
      el.innerHTML = `<p class="ask">依照指示改寫句子</p><div class="sentence">${esc(it.s)}</div><p class="task">${esc(it.task)}</p>`;
      typeAnswer(el, v => it.ans.some(a => norm(a) === norm(v)), done, { en: it.ans[0], zh: it.ans.length > 1 ? '也可以：' + it.ans.slice(1).join(' / ') : '' }, { ph: '寫出改寫後的整句…' });
    },
  },
  gCombine: {
    label: '寫作・句子合併',
    render(el, q, done) {
      const it = q.item;
      el.innerHTML = `<p class="ask">用提示的字，把兩句合併成一句</p><div class="sentence">${esc(it.a)}<br>${esc(it.b)}</div><p class="task">提示：<b>${esc(it.hint)}</b></p>`;
      typeAnswer(el, v => it.ans.some(a => norm(a) === norm(v)), done, { en: it.ans[0], zh: it.ans.length > 1 ? '也可以：' + it.ans.slice(1).join(' / ') : '' }, { ph: '寫出合併後的句子…' });
    },
  },
  gReorder: {
    label: '寫作・重組',
    render(el, q, done) {
      const it = q.item;
      const full = `${it.pre} ${it.parts.join(' ')}${it.post}`;
      el.innerHTML = `<p class="ask">把積木排成正確的句子</p>`;
      blockPuzzle(el, it.parts, done, { en: full }, { pre: it.pre, post: it.post });
    },
  },
});

/* =========================================================
   測驗引擎
   ========================================================= */
function buildQs(o) {
  const ctx = { words: o.words || [], sentences: o.sentences || [], dialogues: o.dialogues || [], lru: true };
  const qs = [], used = new Set(), count = {};
  let guard = 0, last = null;
  while (qs.length < o.n && guard++ < 400) {
    const type = pick(o.types);
    if (o.types.length > 1 && type === last && guard < 300) continue;      // 不連續出同一種題型
    if (Q[type].max && (count[type] || 0) >= Q[type].max && guard < 300) continue;
    const q = Q[type].make(ctx);
    if (!q) continue;
    const key = String(q.key).replace(/^\w+:/, '');
    if (used.has(key) && guard < 250) continue;                            // 同一個字／句子不重複出現
    used.add(key);
    q.type = type; last = type;
    count[type] = (count[type] || 0) + 1;
    qs.push(q);
  }
  saveSeen();
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
      <div class="qmeta"><span>第 ${i + 1} / ${qs.length} 題・${T.label}</span><span class="sc">★ ${score}</span></div>
      <div class="card qcard"><div class="qbody"></div><div class="qfoot"></div></div>`, o.back);
    let answered = false;
    T.render($('.qbody'), q, (ok, rev) => {
      if (answered) return;
      answered = true;
      if (q.sec) { sec[q.sec] = sec[q.sec] || { ok: 0, n: 0 }; sec[q.sec].n++; if (ok) sec[q.sec].ok++; }
      if (ok) score++; else wrong.push(rev);
      sfx(ok);
      $('.sc').textContent = '★ ' + score;
      const foot = $('.qfoot');
      foot.innerHTML = `<div class="feedback ${ok ? 'ok' : 'bad'}">
          <div>${ok ? pick(PRAISE) + (rev.okHead ? ' ' + rev.okHead : '') : rev.head || '正確答案：'} <b>${esc(rev.en)}</b>${rev.say === false || !rev.en ? '' : ` ${sayMini(rev.en)}`}</div>
          ${rev.zh ? `<div class="zh">${esc(rev.zh)}</div>` : ''}
          ${rev.note ? `<details class="note"><summary>看內容／解析</summary>${esc(rev.note)}</details>` : ''}
        </div>
        <button class="btn primary big" data-next>${i + 1 < qs.length ? '下一題 →' : '看成績 '}</button>`;
      if (rev.say !== false && rev.en) setTimeout(() => speak(rev.en), 500);
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
      mock = `<div class="mock-score"><div><small>聽力</small><b>${L}</b><span>/120</span></div><div><small>閱讀</small><b>${R}</b><span>/120</span></div><div><small>總分</small><b>${L + R}</b><span>/240</span></div></div>
        <p class="pass ${pass ? 'ok' : 'bad'}">${pass ? '以這次成績估算，可以通過英檢初級初試！繼續保持！' : '還差一點！通過標準：總分 160 以上，且聽力、閱讀都要 72 分以上。'}</p>`;
    }
    const msg = st === 3 ? '太厲害了！' : st === 2 ? '做得很好！' : st === 1 ? '不錯喔，再加油！' : '多練習幾次就會進步！';
    view(`${bar(esc(o.title))}<div class="card result">
        <div class="big-stars">${'★'.repeat(st)}<span class="dim">${'★'.repeat(3 - st)}</span></div>
        <h2>${msg}</h2>
        <p class="score">答對 <b>${score}</b> / ${qs.length} 題（${pct} 分）</p>
        ${mock}
        ${wrong.filter(w => w.en).length ? `<h4>再複習一下：</h4><ul class="review">${wrong.filter(w => w.en).map(w => `<li>${w.say === false ? '' : sayMini(w.en)} <b>${esc(w.en)}</b> <span>${esc(w.zh || '')}</span></li>`).join('')}</ul>` : ''}
        <div class="row center"><button class="btn primary" data-again>${o.againText || '再玩一次'}</button>${o.wordsOf ? '<button class="btn" data-words>單字表</button>' : ''}<button class="btn" data-menu>${o.menuText || '← 回選單'}</button></div>
      </div>`, o.back);
    $('[data-again]').onclick = () => runQuiz(o.rebuild ? { ...o, questions: o.rebuild() } : o);
    $('[data-menu]').onclick = o.back;
    if (o.wordsOf) $('[data-words]').onclick = () => wordList(o.wordsOf, () => runQuiz(o.rebuild ? { ...o, questions: o.rebuild() } : o));
    if (st === 3) { confetti(); sfx(true); }
  }
}

/* =========================================================
   首頁與年級
   ========================================================= */
// 年級練習：所有題型直接混在答題裡
const GRADE_TYPES = ['listen', 'pic2word', 'listenSpell', 'typeWord', 'missingLetter', 'spellBlocks', 'fillSentence',
  'sentenceBlocks', 'listenBlocks', 'listenSentenceZh', 'writeSentence', 'match', 'chatReply', 'makeSentence', 'speakSay'];
const DAILY_FOR = g => (GRADES[g].level !== 'elem' ? [] : +g <= 2 ? ['polite', 'morning'] : +g <= 4 ? ['polite', 'morning', 'school', 'meal', 'night', 'friends'] : DAILY.map(c => c.id));

function home() {
  const lv = store.get('level', 'elem');
  const best = store.get('best', {});
  const me = currentProfile();
  const myBanks = me && me.school ? banksFor(me.school) : [];
  view(`
    <section class="hero">
      <div><h1>英文小冒險 <span>English Adventure</span></h1><p>點一個年級就開始答題！一路練到英檢初級 </p></div>
      
    </section>
    <button class="gept-banner" data-gept><span><b>全民英檢初級特訓</b><small>聽力・閱讀・寫作・口說 ＋ 模擬考</small></span><span class="go">GO →</span></button>
    <div class="levels">${LEVELS.map(l => `<button class="lv ${l.id === lv ? 'on' : ''}" data-lv="${l.id}"><b>${l.name}</b><small>${l.sub}</small></button>`).join('')}</div>
    <h3 class="sec">選擇年級，直接開始</h3>
    <div class="grades">${GRADE_KEYS.filter(g => GRADES[g].level === lv).map(g => { const G = GRADES[g], b = best[`${g}-all`]; return `<button class="grade" style="--c:${G.color}" data-g="${g}"><span class="gi${G.badge ? ' sm' : ''}">${G.badge || g}</span><b>${G.name}</b><small>${G.theme}</small>${starsHtml(starsOf(b || 0))}<span class="gs">${b == null ? '開始' : `最高 ${b} 分`}</span></button>`; }).join('')}</div>
    ${me && me.school ? `<h3 class="sec">我的學校題庫・${esc(me.school.replace(/（.*$/, ''))}</h3>
      ${myBanks.length ? `<div class="modes">${myBanks.map(b => modeCard('bk:' + b.id, '', b.title, `${b.words.length} 個單字・${b.sentences.length} 個句子${b.by ? '・' + b.by : ''}`, starsHtml(starsOf(bestOf('bank-' + b.id) || 0)))).join('')}</div>`
        : '<p class="note-s school-empty">你的學校還沒有專屬題目。請老師到下面的「老師出題」建立題庫，再把分享連結傳給你。</p>'}` : ''}
    <h3 class="sec">更多練習</h3>
    <div class="modes">
      ${modeCard('daily', '', '生活英文', '每天都用得到的句子')}
      ${modeCard('free', '', '自由聊天', '跟機器人 Robo 聊天')}
      ${modeCard('news', '', '時事聊天', '依年齡挑選今天的新聞來聊')}
      ${modeCard('ask', '', '問問 AI 老師', '某句話有哪些說法？都可以問')}
      ${modeCard('diary', '', '英文日記', '自己寫英文句子')}
      ${modeCard('works', '', '我的作品', '看看寫過的句子')}
      ${modeCard('teacher', '', '老師出題', '建立學校專屬題庫並分享')}
    </div>
    <p class="tip"><i class="ic ic-say"></i> 發音使用瀏覽器內建語音・<i class="ic ic-mic"></i> 說話功能建議使用 Chrome 或 Edge・進度會自動存在這台電腦</p>`);
  $('[data-gept]').onclick = geptHome;
  $$('.lv').forEach(b => b.onclick = () => { store.set('level', b.dataset.lv); home(); });
  $$('.grade').forEach(b => b.onclick = () => gradeView(b.dataset.g));
  const back = home;
  const act = { daily: () => dailyMenu(back), free: () => freeChat(back), news: () => newsChat(back), ask: () => askTeacher(back), diary: () => diary(back), works: () => works(back), teacher: () => teacherPage(back) };
  $$('.mode').forEach(b => b.onclick = () => {
    const id = b.dataset.m;
    if (id.startsWith('bk:')) bankQuiz(myBanks.find(x => 'bk:' + x.id === id), back);
    else act[id]();
  });
}

function gradeView(g) {
  const G = GRADES[g];
  const daily = DAILY.filter(c => DAILY_FOR(g).includes(c.id)).flatMap(c => c.items.map(([en, zh]) => ({ en, zh })));
  const o = {
    title: `${G.name}`,
    types: GRADE_TYPES,
    words: G.W,
    sentences: G.S.concat(sample(daily, 8)),
    dialogues: G.dialogues,
    n: 10,
    key: `${g}-all`,
    wordsOf: g,
    againText: '再來 10 題',
    menuText: g === 'gept' ? '← 回英檢' : '回首頁',
    back: g === 'gept' ? geptHome : home,
  };
  o.rebuild = () => buildQs(o);
  runQuiz({ ...o, questions: o.rebuild() });
}

function wordList(g, back) {
  const G = GRADES[g];
  view(`${bar(`${G.name}・單字表`)}
    <div class="card"><table class="wtable"><tbody>${G.W.map(w => `<tr><td class="e">${w.emoji}</td><td><b>${esc(w.en)}</b></td><td>${esc(w.zh)}</td><td><button class="mini" data-say="${esc(w.en)}"><i class="ic ic-say"></i></button></td></tr>`).join('')}</tbody></table></div>
    <div class="card"><h3>句子</h3><table class="wtable"><tbody>${G.S.map(s => `<tr><td><b>${esc(s.en)}</b><br><small>${esc(s.zh)}</small></td><td><button class="mini" data-say="${esc(s.en)}"><i class="ic ic-say"></i></button></td></tr>`).join('')}</tbody></table></div>
    <div class="row center"><button class="btn primary big" data-go>開始答題</button></div>`, back);
  $('[data-go]').onclick = back;
}

/* =========================================================
   AI 對話
   ========================================================= */
function chatUI(title, back) {
  view(`${bar(title)}
    <div class="chat card">
      <div class="msgs"></div>
      <div class="chips"></div>
      <form class="chat-in"><button type="button" class="mic" title="用說的"><i class="ic ic-mic"></i></button><input placeholder="用英文回答…" autocomplete="off" spellcheck="false"><button class="btn primary" type="submit">送出</button></form>
    </div>`, back);
  const msgs = $('.msgs'), chips = $('.chips'), form = $('.chat-in'), inp = $('input', form);
  let handler = () => { };
  const scroll = () => { msgs.scrollTop = msgs.scrollHeight; };
  form.onsubmit = e => { e.preventDefault(); const t = inp.value.trim(); if (!t) return; inp.value = ''; handler(t, true); };
  $('.mic', form).onclick = e => micToInput(e.currentTarget, inp);
  setTimeout(() => inp.focus({ preventScroll: true }), 100);
  return {
    ai(text, zh) {
      const d = document.createElement('div');
      d.className = 'msg ai';
      d.innerHTML = `<span class="av bot">Robo</span><div class="bub"><div>${esc(text)}</div>${zh ? `<div class="zh">${esc(zh)}</div>` : ''}<div class="tools"><button class="mini" data-say="${esc(text)}"><i class="ic ic-say"></i></button><button class="mini slow" data-say="${esc(text)}" data-slow="1">慢速</button>${zh ? '<button class="mini" data-zh>中文</button>' : ''}</div></div>`;
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
      d.innerHTML = `<div class="bub">${esc(text)}${tip ? `<div class="tip-s">${tip}</div>` : ''}</div><span class="av kid">我</span>`;
      msgs.appendChild(d); scroll();
    },
    chips(list, h) {
      chips.innerHTML = (list && list.length) || h ? hintHtml(h, list, false) : '';
      bindHint(chips, () => inp, h);
      inp.placeholder = h ? h.pat.split(' / ')[0] : '用英文回答…';
    },
    onSend(f) { handler = f; },
    /** 顯示「Robo 正在想…」，回傳移除用的函式 */
    typing() {
      const d = document.createElement('div');
      d.className = 'msg ai typing';
      d.innerHTML = '<span class="av bot">Robo</span><div class="bub"><span class="dots"><i></i><i></i><i></i></span> 正在想…</div>';
      msgs.appendChild(d); scroll();
      return () => d.remove();
    },
    /** 在對話框上方放一個資訊面板 */
    panel() {
      const p = document.createElement('div');
      p.className = 'ai-panel';
      msgs.before(p);
      return p;
    },
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

function dialogueChat(d, back) {
  const ui = chatUI(`${d.title}`, back);
  let t = 0, tries = 0, name = 'friend', busy = false;
  const fill = s => s.replace(/\{name\}/g, name);
  const ask = (pre = '') => { const tn = d.turns[t]; ui.ai((pre ? pre + ' ' : '') + fill(tn.ai), tn.zh); ui.chips(tn.ex, hintFor(tn.ai)); busy = false; };
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
      else setTimeout(() => { ui.ai(`${pr} You did it, ${name}! See you next time! `, '你完成了！下次見！'); finish(); }, 700);
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
    const e = ui.end(`<p>對話完成！</p><div class="row center"><button class="btn primary" data-again>再聊一次</button><button class="btn" data-menu>← 返回</button></div>`);
    $('[data-again]', e).onclick = () => dialogueChat(d, back);
    $('[data-menu]', e).onclick = back;
  }
}

/** 自由聊天：Robo 用關鍵字規則回應，並一直丟問題讓學生回答 */
function botReply(raw, st) {
  const t = norm(raw);
  let m;
  if (!/[a-z0-9]/.test(t)) return ["Sorry, I don't understand. Can you say it in English?", '對不起，我看不懂。可以用英文說嗎？', false];
  if (/\b(bye|goodbye|see you)\b/.test(t)) return ['Bye-bye! It was nice talking with you!', '掰掰！跟你聊天很開心！', 'end'];
  if (/\bhow are you\b/.test(t)) return ["I'm great, thank you! And you?", '我很好，謝謝！那你呢？', false];
  if (/\bwhat is your name\b|\bwho are you\b/.test(t)) return ["I'm Robo, a robot who loves English! ", '我是 Robo，一個愛英文的機器人！', true];
  if (/\bhow old are you\b/.test(t)) return ["I'm a robot, so I'm only one year old! ", '我是機器人，所以我才一歲！', true];
  if ((m = t.match(/\b(?:my name is|call me)\s+([a-z]+)/))) { st.name = cap(m[1]); return [`Nice to meet you, ${st.name}!`, `很高興認識你，${st.name}！`, true]; }
  if ((m = t.match(/\bi am (\d+|[a-z]+) years? old\b|\bi am (\d+)\b/))) return ["Wow! You're so smart for your age!", '哇！你年紀小小好聰明！', true];
  if (/\b(sad|tired|sick|bad|angry|not good|not fine|bored)\b/.test(t)) return ['Oh no! I hope you feel better soon.', '噢不！希望你很快好起來。', true];
  if (/\b(fine|good|great|ok|happy|well|excited)\b/.test(t) && t.split(' ').length <= 6) return ["I'm glad to hear that! ", '很高興聽你這麼說！', true];
  if ((m = t.match(/\bdo you like ([a-z ]+)/))) return [`Yes! I like ${m[1]} very much!`, `是的！我很喜歡 ${m[1]}！`, true];
  if ((m = t.match(/\bi (?:like|love) (?:to )?([a-z ]+)/))) return [`Wow, you like ${m[1]}! That's cool!`, `哇，你喜歡 ${m[1]}！好酷！`, true];
  if ((m = t.match(/\bmy favorite [a-z]+ is ([a-z ]+)/))) return [`${cap(m[1])}? Nice choice!`, `${m[1]}？好選擇！`, true];
  if ((m = t.match(/\bi want to be (?:a |an )?([a-z ]+)/))) return [`A ${m[1]}? That's a great dream! Study hard!`, `${m[1]}？好棒的夢想！要加油喔！`, true];
  if (/\b(thank|thanks)\b/.test(t)) return ["You're welcome! ", '不客氣！', true];
  if (/\b(sunny|rainy|cloudy|windy|hot|cold|raining|snowing)\b/.test(t)) return ["I see! Don't forget to wear the right clothes.", '了解！記得穿適合的衣服喔。', true];
  if (/\b(dog|cat|bird|fish|rabbit|hamster|turtle)s?\b/.test(t) && /\b(have|got)\b/.test(t)) return ["You have a pet? That's so cute! ", '你有寵物？好可愛！', true];
  if (/\b(yesterday|last)\b/.test(t) || /\b(went|played|watched|ate|visited|saw|had)\b/.test(t)) return ['That sounds fun!', '聽起來很好玩！', true];
  if (/\?\s*$/.test(raw) || /^(what|where|who|how|why|when|do|does|can|are|is)\b/.test(t)) return ["Good question! I'm a robot, so I'm still learning. ", '好問題！我是機器人，還在學習中。', true];
  if (/^(yes|yeah|yep|sure)\b/.test(t)) return ['Cool!', '酷！', true];
  if (/^(no|nope)\b/.test(t)) return ['Oh, I see.', '喔，我懂了。', true];
  if (/^(hi|hello|hey)\b/.test(t)) return ['Hello! Nice to see you!', '哈囉！很高興見到你！', true];
  return [pick(["That's interesting!", 'Wow, really?', 'I see!', 'Cool!']), '真有趣！', true];
}
/* ---------- 真正的 AI 聊天：WebLLM 在瀏覽器裡用顯示卡跑開源模型（免費、不用金鑰） ---------- */
const WEBLLM_URL = 'https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.87/+esm';
const AI_MODELS = [
  { id: 'Qwen2.5-1.5B-Instruct', name: '標準（建議）', size: '約 1 GB' },
  { id: 'Qwen2.5-0.5B-Instruct', name: '輕量（舊電腦用）', size: '約 0.4 GB' },
  { id: 'Qwen2.5-3B-Instruct', name: '比較聰明（較慢）', size: '約 2 GB' },
];
const AI = { engine: null, model: null, loading: null };
/** 依照學生年齡決定 AI 說話的難度 */
function ageLevel(age) {
  if (!age) return { cefr: 'A1-A2 (beginner)', words: 25, who: 'a child' };
  if (age <= 9) return { cefr: 'pre-A1 to A1 (very easy words only)', words: 15, who: 'a young child' };
  if (age <= 12) return { cefr: 'A1-A2 (beginner)', words: 25, who: 'a child' };
  if (age <= 15) return { cefr: 'A2-B1 (junior high school level)', words: 35, who: 'a junior high school student' };
  if (age <= 18) return { cefr: 'B1-B2 (senior high school level)', words: 45, who: 'a senior high school student' };
  return { cefr: 'B2-C1 (university level, natural English)', words: 60, who: 'a university student or adult' };
}
function learnerInfo() {
  const p = currentProfile();
  if (!p) return '';
  const city = COUNTIES.find(c => c[0] === p.city);
  const stage = { elem: 'elementary school', jh: 'junior high school', sh: 'senior high school', uni: 'university' }[p.stage] || '';
  return `The learner's name is ${p.name || 'not given'}${p.age ? `, age ${p.age}` : ''}${city ? `, living in ${city[1]}, Taiwan` : ''}${p.school ? `, studying at ${p.school}${stage ? ` (a ${stage})` : ''}` : stage ? `, a ${stage} student` : ''}.`;
}
/** AI 聊天的系統提示（會依照年齡調整難度；extra 可以加上話題） */
function aiSystem(extra = '') {
  const p = currentProfile(), L = ageLevel(p && p.age);
  return `You are Robo, a friendly robot who chats in English with ${L.who} in Taiwan who is learning English. ${learnerInfo()}
Rules:
- Read what the learner just said and reply to THAT. Stay on the learner's topic. Never ignore what they said.
- Use English at CEFR ${L.cefr}. 1 to 3 short sentences, no more than ${L.words} words.
- End with ONE question so the learner can keep talking about the same topic.
- If the learner's English has a mistake, first show the correct sentence kindly, like: You can say "I went to the park."
- If the learner writes Chinese, reply in English and show how to say it in English.
- Be kind, positive and safe for children. Do not use emoji.
${extra}
Always answer in exactly this format (three lines):
EN: your English reply
ZH: the same reply in Traditional Chinese (繁體中文)
TRY: one short example answer the learner could say next`;
}

async function getGPU() {
  if (!navigator.gpu) return null;
  try { return await navigator.gpu.requestAdapter(); } catch (e) { return null; }
}
async function loadAI(base, onProgress) {
  if (AI.engine && AI.model === base) return AI.engine;
  if (AI.loading) return AI.loading;
  AI.loading = (async () => {
    const gpu = await getGPU();
    if (!gpu) throw new Error('nogpu');
    const id = `${base}-${gpu.features.has('shader-f16') ? 'q4f16_1' : 'q4f32_1'}-MLC`;
    const webllm = await import(WEBLLM_URL);
    if (AI.engine) { try { await AI.engine.unload(); } catch (e) { } AI.engine = null; }
    AI.engine = await webllm.CreateMLCEngine(id, { initProgressCallback: r => onProgress && onProgress(r) });
    AI.model = base;
    return AI.engine;
  })();
  try { return await AI.loading; } finally { AI.loading = null; }
}
const aiReady = () => !!(AI.engine && AI.model);
function parseAI(raw) {
  const get = k => { const m = raw.match(new RegExp(`^\\s*${k}\\s*[:：]\\s*(.+)$`, 'mi')); return m ? m[1].trim() : ''; };
  let en = get('EN'), zh = get('ZH'), tryIt = get('TRY');
  if (!en) en = raw.replace(/^\s*(ZH|TRY)\s*[:：].*$/gmi, '').trim();
  const clean = s => s.replace(/\p{Extended_Pictographic}|️/gu, '').replace(/^["“]|["”]$/g, '').trim();
  return { en: clean(en).slice(0, 400), zh: clean(zh), tryIt: clean(tryIt) };
}

/** AI 大腦面板（自由聊天、時事聊天、問問 AI 老師共用）。onReady：AI 準備好時呼叫 */
function mountAIPanel(panel, isAlive, o = {}) {
  const pref = store.get('ai', { model: AI_MODELS[0].id, auto: false });
  const draw = (state, extra = '') => {
    if (!isAlive()) return;
    if (state === 'on') {
      panel.className = 'ai-panel on';
      panel.innerHTML = `<b>AI 大腦已開啟</b>${esc(o.onText || 'Robo 會依照你說的話回答你')}（${esc(AI_MODELS.find(m => m.id === AI.model)?.name || '')}）
        <small>${hdReady() ? '聲音：高清標準美式發音' : HD.loading ? `高清聲音下載中 ${HD.pct}%…（先用瀏覽器聲音）` : '聲音：瀏覽器內建（可到右上角「語音設定」開啟高清語音）'}</small>`;
    } else if (state === 'loading') {
      panel.className = 'ai-panel';
      panel.innerHTML = `<b>正在啟動 AI 大腦…</b><div class="ai-bar"><div style="width:${extra.pct || 0}%"></div></div><small>${esc(extra.text || '')}</small><small>第一次要下載模型，請保持網路連線；下載完會存在電腦裡，下次就很快。</small>`;
    } else if (state === 'nogpu') {
      panel.className = 'ai-panel off';
      panel.innerHTML = `<b>這台電腦或瀏覽器不能開 AI 大腦</b>${esc(o.noGpuText || '需要電腦版 Chrome 或 Edge（支援 WebGPU）。')}`;
    } else {
      panel.className = 'ai-panel';
      panel.innerHTML = `<b>${esc(o.offTitle || '想讓 Robo 真的聽懂你說的話嗎？')}</b>${esc(o.offText || '開啟免費的 AI 大腦，它會跟著你說的內容回答。')}
        ${extra ? `<div class="r">${esc(extra)}</div>` : ''}
        <div class="row"><select data-model>${AI_MODELS.map(m => `<option value="${m.id}" ${m.id === pref.model ? 'selected' : ''}>${m.name}・${m.size}</option>`).join('')}</select>
        <button class="btn primary" data-load>開啟 AI 大腦</button></div>
        <small>模型在你的電腦上執行，不用帳號、不用錢；第一次需要下載。手機通常跑不動。</small>`;
      $('[data-load]', panel).onclick = () => start($('[data-model]', panel).value);
    }
  };
  const start = async base => {
    draw('loading', { pct: 0, text: '' });
    // AI 的聲音也換成高清標準美式（和 AI 大腦同時下載）
    setHD(true);
    loadHD().then(() => { if (aiReady()) draw('on'); }).catch(() => setHD(false));
    try {
      await loadAI(base, r => draw('loading', { pct: Math.round((r.progress || 0) * 100), text: r.text }));
      store.set('ai', { model: base, auto: true });
      draw('on');
      if (isAlive()) { toast('AI 大腦開啟了！'); o.onReady && o.onReady(); }
    } catch (e) {
      if (e.message === 'nogpu') draw('nogpu');
      else draw('off', '啟動失敗：' + (e.message || e) + '（可以改選「輕量」再試一次）');
    }
  };
  if (aiReady()) { draw('on'); o.onReady && setTimeout(o.onReady, 0); }
  else getGPU().then(g => {
    if (!isAlive()) return;
    if (!g) draw('nogpu');
    else if (pref.auto) start(pref.model);   // 之前開過：自動從電腦裡的快取載入
    else draw('off');
  });
}

function freeChat(back) {
  const ui = chatUI('自由聊天', back);
  const st = { name: null, order: shuffle(BOT_QUESTIONS), qi: 0 };
  const history = [];
  let busy = false, alive = true;
  onLeave(() => { alive = false; });
  const ready = aiReady;
  const nextQ = () => {
    const q = st.order[st.qi++ % st.order.length];
    ui.ai(q[0], q[1]); ui.chips(q[2], hintFor(q[0]));
    history.push({ role: 'assistant', content: `EN: ${q[0]}\nZH: ${q[1]}\nTRY: ${q[2][0]}` });
  };
  mountAIPanel(ui.panel(), () => alive, { noGpuText: '需要電腦版 Chrome 或 Edge（支援 WebGPU）。先用簡單版 Robo 聊天吧！' });

  const me = currentProfile();
  if (me) ui.ai(`Hi, ${me.name}! I'm Robo. Let's talk in English!`, `嗨，${me.name}！我是 Robo。我們用英文聊天吧！`);
  else ui.ai("Hi! I'm Robo. Let's talk in English!", '嗨！我是 Robo。我們用英文聊天吧！');
  setTimeout(nextQ, 400);

  ui.onSend(async (text, typed) => {
    if (busy) return;
    ui.me(text, typed);
    if (ready()) {
      busy = true;
      const done = ui.typing();
      history.push({ role: 'user', content: text });
      try {
        const r = await AI.engine.chat.completions.create({
          messages: [{ role: 'system', content: aiSystem() }, ...history.slice(-12)],
          temperature: 0.7, max_tokens: 180,
        });
        const raw = r.choices[0].message.content || '';
        history.push({ role: 'assistant', content: raw });
        if (!alive) return;
        done();
        const a = parseAI(raw);
        ui.ai(a.en || "Sorry, can you say that again?", a.zh);
        ui.chips(a.tryIt ? [a.tryIt] : [], null);
      } catch (e) {
        history.pop();
        if (!alive) return;
        done();
        const [en, zh] = botReply(text, st);
        ui.ai(en, zh);
      }
      busy = false;
      return;
    }
    const [en, zh, more] = botReply(text, st);
    setTimeout(() => {
      ui.ai(en, zh);
      if (more === 'end') {
        const e = ui.end(`<p>聊天結束！</p><div class="row center"><button class="btn primary" data-again>再聊一次</button><button class="btn" data-menu>← 返回</button></div>`);
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
  view(`${bar('生活英文')}
    <p class="ask center">每天都用得到的英文句子！先聽、再跟著唸，最後做練習 </p>
    <div class="modes">${DAILY.map(c => modeCard(c.id, c.icon, c.name, `${c.items.length} 個句子`, starsHtml(starsOf(bestOf('daily-' + c.id) || 0)))).join('')}
    ${modeCard('all', '', '全部混合練習', '所有生活句子隨機出題', starsHtml(starsOf(bestOf('daily-all') || 0)))}</div>`, back);
  $$('.mode').forEach(b => b.onclick = () => {
    if (b.dataset.m === 'all') {
      runQuiz({ title: '生活英文・混合練習', types: ['listenSentenceZh', 'sentenceBlocks', 'listenBlocks', 'fillSentence', 'writeSentence'], words: ALL_WORDS, sentences: DAILY.flatMap(c => c.items.map(([en, zh]) => ({ en, zh }))), n: 12, key: 'daily-all', back: () => dailyMenu(back) });
    } else dailyCat(DAILY.find(c => c.id === b.dataset.m), back);
  });
}
function dailyCat(c, back) {
  const S = c.items.map(([en, zh]) => ({ en, zh }));
  view(`${bar(`${c.name}`)}
    <div class="card"><ul class="daily">${S.map((s, i) => `<li><div><b>${esc(s.en)}</b><small>${esc(s.zh)}</small><div class="res" data-r="${i}"></div></div>
      <div class="acts"><button class="mini" data-say="${esc(s.en)}"><i class="ic ic-say"></i></button><button class="mini" data-say="${esc(s.en)}" data-slow="1">慢速</button><button class="mini" data-mic="${i}"><i class="ic ic-mic"></i> 跟讀</button></div></li>`).join('')}</ul></div>
    <div class="row center"><button class="btn primary big" data-practice>開始練習</button></div>`, () => dailyMenu(back));
  // 跟讀：打開這句的發音練習，念清楚才過關
  $$('[data-mic]').forEach(b => b.onclick = () => {
    const res = $(`[data-r="${+b.dataset.mic}"]`);
    if (res.firstChild) return;
    pronPractice(res, S[+b.dataset.mic].en, { micText: '開始跟讀' });
  });
  $('[data-practice]').onclick = () => runQuiz({ title: `${c.name}・練習`, types: ['listenSentenceZh', 'sentenceBlocks', 'listenBlocks', 'fillSentence', 'writeSentence'], words: ALL_WORDS, sentences: S, n: 8, key: 'daily-' + c.id, back: () => dailyCat(c, back) });
}

/* =========================================================
   寫作練習
   ========================================================= */
function saveWork(title, text) {
  const list = store.get('works', []);
  list.unshift({ d: Date.now(), title, text });
  store.set('works', list.slice(0, 200));
  toast('已存到「我的作品」');
}

function writingBox(o) {
  // o: { must, starters, sampleHtml, title, rows }
  return `<div class="starters">${(o.starters || []).map(s => `<button class="chip" data-st="${esc(s)}">${esc(s)}</button>`).join('')}</div>
    <textarea class="write" rows="${o.rows || 3}" placeholder="在這裡用英文寫…" spellcheck="false"></textarea>
    <div class="wc">0 個字</div>
    <div class="row center">
      <button class="btn primary" data-check>幫我檢查</button>
      <button class="btn" data-read><i class="ic ic-say"></i> 唸給我聽</button>
      <button class="btn" data-save>儲存</button>
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
    out.innerHTML = checkListHtml(list) + (good ? '<p class="great">寫得很棒！可以按「儲存」收藏起來！</p>' : '');
    sfx(good);
    if (good) confetti();
  };
  $('[data-read]', el).onclick = () => { if (ta.value.trim()) speak(ta.value); else toast('先寫一點東西吧！'); };
  $('[data-save]', el).onclick = () => { if (countWords(ta.value) < 1) return toast('先寫一點東西吧！'); saveWork(o.title(), ta.value.trim()); };
}

function diary(back) {
  view(`${bar('英文日記')}
    <p class="ask center">選一個題目，寫一小段英文！不會寫的字可以先用簡單的字代替 </p>
    <div class="modes">${DIARY_PROMPTS.map((p, i) => modeCard('p' + i, p.icon, p.title, p.zh)).join('')}</div>`, back);
  $$('.mode').forEach(b => b.onclick = () => diaryWrite(DIARY_PROMPTS[+b.dataset.m.slice(1)], () => diary(back)));
}
function diaryWrite(p, back) {
  view(`${bar(`${p.title}`)}
    <div class="card"><p class="ask">題目：<b>${esc(p.title)}</b>（${esc(p.zh)}）<br><small>點句型開頭加到文章裡，再把 ___ 換成你自己的話</small></p>
    ${writingBox({ starters: p.starters, rows: 7 })}</div>`, back);
  bindWriting(app, { title: () => p.title, target: 30 });
}

function works(back) {
  const list = store.get('works', []);
  view(`${bar('我的作品')}
    ${list.length ? list.map((w, i) => `<div class="card work"><div class="wh"><b>${esc(w.title)}</b><small>${new Date(w.d).toLocaleString('zh-TW')}</small></div><p>${esc(w.text)}</p><div class="row"><button class="mini" data-say="${esc(w.text)}"><i class="ic ic-say"></i> 朗讀</button><button class="mini" data-del="${i}">刪除</button></div></div>`).join('') : '<div class="card center"><p>還沒有作品喔！去「寫作練習」寫寫看吧 </p></div>'}`, back);
  $$('[data-del]').forEach(b => b.onclick = () => {
    if (!confirm('確定要刪除這篇作品嗎？')) return;
    const l = store.get('works', []); l.splice(+b.dataset.del, 1); store.set('works', l); works(back);
  });
}

/* =========================================================
   全民英檢初級特訓
   ========================================================= */
const G_PARTS = [
  { id: 'gPic', grp: 'L', icon: '', name: '第一部分 看圖辨義', desc: '看圖、聽問題，選出符合的描述', build: () => lruSample(GEPT.listenPic, 8, 'glistenPic').map(item => ({ type: 'gPic', item })) },
  { id: 'gQA', grp: 'L', icon: '', name: '第二部分 問答', desc: '聽一句話，選出最適合的回應', build: () => lruSample(GEPT.listenQA, 10, 'glistenQA').map(item => ({ type: 'gQA', item })) },
  { id: 'gDialog', grp: 'L', icon: '', name: '第三部分 簡短對話', desc: '聽男女對話，回答問題', build: () => lruSample(GEPT.listenDialog, 8, 'glistenDialog').map(item => ({ type: 'gDialog', item })) },
  { id: 'gTalk', grp: 'L', icon: '', name: '第四部分 短文聽解', desc: '聽一段短文，選出正確圖片', build: () => lruSample(GEPT.listenTalk, 6, 'glistenTalk').map(item => ({ type: 'gTalk', item })) },
  { id: 'gVocab', grp: 'R', icon: '', name: '第一部分 詞彙', desc: '選出最適合的字（含文法解析）', build: () => lruSample(GEPT.readVocab, 10, 'greadVocab').map(item => ({ type: 'gVocab', item })) },
  { id: 'gCloze', grp: 'R', icon: '', name: '第二部分 段落填空', desc: '讀短文，選出空格的答案', build: () => { const p = lruSample(GEPT.readCloze, 2, 'greadCloze'); return p.flatMap(item => item.blanks.map((_, n) => ({ type: 'gCloze', item, n }))); } },
  { id: 'gComp', grp: 'R', icon: '', name: '第三部分 閱讀理解', desc: '讀告示、菜單、信件並回答', build: () => { const p = lruSample(GEPT.readComp, 3, 'greadComp'); return p.flatMap(item => item.qs.map((_, n) => ({ type: 'gComp', item, n }))); } },
  { id: 'gRewrite', grp: 'W', icon: '', name: '單句寫作：句子改寫', desc: '改成問句、否定句、過去式…', build: () => lruSample(GEPT.rewrite, 8, 'grewrite').map(item => ({ type: 'gRewrite', item })) },
  { id: 'gCombine', grp: 'W', icon: '', name: '單句寫作：句子合併', desc: '用 and / but / because… 合併', build: () => lruSample(GEPT.combine, 8, 'gcombine').map(item => ({ type: 'gCombine', item })) },
  { id: 'gReorder', grp: 'W', icon: '', name: '單句寫作：重組', desc: '用積木把句子排出來', build: () => lruSample(GEPT.reorder, 8, 'greorder').map(item => ({ type: 'gReorder', item })) },
];

function geptHome() {
  const card = p => modeCard(p.id, p.icon, p.name, p.desc, starsHtml(starsOf(bestOf('gept-' + p.id) || 0)));
  const hist = store.get('mock', []);
  view(`${bar('全民英檢初級特訓')}
    <div class="card gept-intro">
      <h3>英檢初級考什麼？</h3>
      <div class="exam-grid">
        <div><b>初試</b><span>聽力：看圖辨義、問答、簡短對話、短文聽解</span><span>閱讀：詞彙、段落填空、閱讀理解</span><small>聽力、閱讀各 120 分；總分 160 以上且單項不低於 72 分即通過</small></div>
        <div><b>複試（初試通過後）</b><span>寫作：單句寫作（改寫・合併・重組）、段落寫作</span><span>口說：複誦、朗讀、回答問題</span><small>寫作、口說分別計分</small></div>
      </div>
      <p class="note-s">程度約為國中畢業，需要認得約 2,000 個常用字。題數與計分方式以 LTTC 語言訓練測驗中心最新公告為準。</p>
    </div>
    <div class="modes">
      ${modeCard('mock', '', '初試模擬考', '聽力＋閱讀，算出預估分數', hist.length ? `<span class="badge">上次 ${hist[0].L + hist[0].R} 分</span>` : '')}
      ${modeCard('vocab', '', '英檢常用單字', '單字、句子、對話綜合練習')}
    </div>
    <h3 class="sec">初試・聽力</h3><div class="modes">${G_PARTS.filter(p => p.grp === 'L').map(card).join('')}</div>
    <h3 class="sec">初試・閱讀</h3><div class="modes">${G_PARTS.filter(p => p.grp === 'R').map(card).join('')}</div>
    <h3 class="sec">複試・寫作</h3><div class="modes">${G_PARTS.filter(p => p.grp === 'W').map(card).join('')}${modeCard('para', '', '段落寫作（看圖）', '看三張圖寫約 50 字短文')}</div>
    <h3 class="sec">複試・口說</h3><div class="modes">
      ${modeCard('repeat', '', '第一部分 複誦', '聽一句，跟著說一次')}
      ${modeCard('read', '', '第二部分 朗讀', '把短文大聲唸出來')}
      ${modeCard('answer', '', '第三部分 回答問題', '聽問題，15 秒內回答')}
      ${modeCard('interview', '', '口說面試練習', '跟 Robo 模擬問答')}
    </div>
    ${hist.length ? `<div class="card"><h3>模擬考紀錄</h3><ul class="hist">${hist.slice(0, 8).map(h => `<li><span>${new Date(h.d).toLocaleDateString('zh-TW')}</span><span>聽力 ${h.L}</span><span>閱讀 ${h.R}</span><b class="${h.L + h.R >= 160 && h.L >= 72 && h.R >= 72 ? 'g' : 'r'}">總分 ${h.L + h.R}</b></li>`).join('')}</ul></div>` : ''}`, home);
  const back = geptHome;
  $$('.mode').forEach(b => b.onclick = () => {
    const id = b.dataset.m;
    const p = G_PARTS.find(x => x.id === id);
    if (p) return runQuiz({ title: '英檢・' + p.name.replace(/^第.部分 /, ''), questions: p.build(), rebuild: p.build, key: 'gept-' + p.id, back });
    ({
      mock: () => runQuiz({ title: '英檢初級・初試模擬考', questions: buildMock(), rebuild: buildMock, mock: true, back }),
      vocab: () => gradeView('gept'),
      para: () => geptParagraph(GEPT.paragraph.indexOf(lruSample(GEPT.paragraph, 1, 'gparagraph')[0])),
      repeat: () => speakRepeat(),
      read: () => speakRead(0),
      answer: () => speakAnswer(),
      interview: () => dialogueChat(GRADES.gept.dialogues[0], back),
    })[id]();
  });
}

function buildMock() {
  const L = [
    ...lruSample(GEPT.listenPic, 3, 'glistenPic').map(item => ({ type: 'gPic', item })),
    ...lruSample(GEPT.listenQA, 4, 'glistenQA').map(item => ({ type: 'gQA', item })),
    ...lruSample(GEPT.listenDialog, 4, 'glistenDialog').map(item => ({ type: 'gDialog', item })),
    ...lruSample(GEPT.listenTalk, 2, 'glistenTalk').map(item => ({ type: 'gTalk', item })),
  ].map(q => ({ ...q, sec: 'L' }));
  const cloze = lruSample(GEPT.readCloze, 1, 'greadCloze')[0];
  const comps = lruSample(GEPT.readComp, 2, 'greadComp');
  const R = [
    ...lruSample(GEPT.readVocab, 6, 'greadVocab').map(item => ({ type: 'gVocab', item })),
    ...cloze.blanks.map((_, n) => ({ type: 'gCloze', item: cloze, n })),
    ...comps.flatMap(item => item.qs.map((_, n) => ({ type: 'gComp', item, n }))),
  ].map(q => ({ ...q, sec: 'R' }));
  return [...L, ...R];
}

/* ---------- 段落寫作 ---------- */
function geptParagraph(idx) {
  const p = GEPT.paragraph[idx];
  view(`${bar('段落寫作（看圖）')}
    <div class="card">
      <div class="panels">${p.panels.map((x, i) => `<div class="panel"><span class="pn">${i + 1}</span>${x}</div>`).join('')}</div>
      <p class="ask">${esc(p.task)}</p>
      <p class="kw">可以用的字：${p.words.map(w => `<span class="chip static">${esc(w)}</span>`).join(' ')}</p>
      ${writingBox({ starters: [], rows: 7 })}
      <details class="sample"><summary>看範文（先自己寫完再看喔！）</summary><p>${esc(p.sample)}</p><button class="mini" data-say="${esc(p.sample)}"><i class="ic ic-say"></i> 朗讀範文</button> <button class="mini slow" data-say="${esc(p.sample)}" data-slow="1">慢速朗讀</button></details>
      <div class="row center"><button class="btn ghost" data-new>換一題</button></div>
      <p class="note-s">英檢評分重點：內容符合圖片、句子文法正確、有用連接詞（and, but, so, because, then）讓文章通順、拼字與標點正確。</p>
    </div>`, geptHome);
  bindWriting(app, { title: () => '看圖寫作：' + p.title, target: 40 });
  $('[data-new]').onclick = () => geptParagraph((idx + 1) % GEPT.paragraph.length);
}

/* ---------- 口說：複誦 ---------- */
const scoreMsg = p => (p >= 90 ? '非常好！' : p >= 70 ? '不錯！再說清楚一點' : p >= 40 ? '有進步空間，再試一次' : '再聽一次，跟著說說看');
function speakRepeat() {
  const list = lruSample(GEPT.repeat, 6, 'grepeat');
  let i = 0;
  draw();
  function draw() {
    if (i >= list.length) {
      view(`${bar('口說・複誦')}<div class="card result"><h2>完成 ${list.length} 句複誦！</h2><div class="row center"><button class="btn primary" data-again>再練一次</button><button class="btn" data-menu>← 回英檢</button></div></div>`, geptHome);
      $('[data-again]').onclick = speakRepeat; $('[data-menu]').onclick = geptHome;
      return;
    }
    const s = list[i];
    view(`${bar('口說・複誦')}
      <div class="progress"><div style="width:${(i / list.length) * 100}%"></div></div>
      <div class="card qcard">
        <p class="ask">第 ${i + 1} / ${list.length} 句：仔細聽，然後按 <i class="ic ic-mic"></i> 把句子<b>完整說一次</b>，每個字都念清楚才過關<br><small>（正式考試時句子只唸給你聽，不會顯示）</small></p>
        ${sayBtns(s)}
        <div class="pron-host"></div>
        <details class="sample"><summary>看句子</summary><p><b>${esc(s)}</b></p></details>
        <div class="row center"><button class="btn" data-next disabled>下一句 →</button></div>
      </div>`, geptHome);
    setTimeout(() => speak(s), 400);
    const nx = $('[data-next]');
    pronPractice($('.pron-host'), s, {
      showText: false, skip: true,
      onPass: () => { nx.disabled = false; $('.sample').open = true; },
      onFail: () => { $('.sample').open = true; },
      onSkip: () => { nx.disabled = false; $('.sample').open = true; },
    });
    nx.onclick = () => { i++; draw(); };
  }
}

/* ---------- 口說：朗讀 ---------- */
function speakRead(idx) {
  const p = GEPT.readAloud[idx % GEPT.readAloud.length];
  view(`${bar('口說・朗讀')}
    <div class="card qcard">
      <p class="ask">先默念一遍，準備好後按 <i class="ic ic-mic"></i>，把短文<b>清楚、大聲</b>唸出來，唸完再按一次結束</p>
      <div class="passage read"><h4>${esc(p.title)}</h4><div class="rtext">${p.text.split(/\s+/).map(w => `<span>${esc(w)}</span>`).join(' ')}</div></div>
      <div class="row center"><button class="btn" data-say="${esc(p.text)}"><i class="ic ic-say"></i> 聽示範</button><button class="btn" data-say="${esc(p.text)}" data-slow="1">慢速示範</button><button class="btn primary big" data-mic><i class="ic ic-mic"></i> 開始朗讀</button></div>
      <div class="said"></div>
      <div class="row center"><button class="btn ghost" data-next>換一篇 →</button></div>
      <p class="note-s">朗讀重點：發音清楚、速度穩定、句號要停頓、問句語調要上揚。</p>
    </div>`, geptHome);
  $('[data-mic]').onclick = e => recognize(e.currentTarget, t => {
    const r = pronCheck(p.text, t);
    const spans = $$('.rtext span');
    r.words.forEach((w, i) => { if (spans[i]) spans[i].className = w.ok ? 'g' : 'r'; });
    $('.said').innerHTML = `<b class="${r.pass ? 'g' : 'r'}">${r.pct} 分</b> ${r.pass ? '過關！念得很清楚' : '還沒過關，紅色的字再練習一下'}
      ${r.missed.length ? `<div class="pron-miss">沒念清楚的字：${[...new Set(r.missed)].map(w => `<button class="wchip miss" data-say="${esc(w)}" data-slow="1"><i class="ic ic-say"></i> ${esc(w)}</button>`).join('')}</div>` : ''}
      ${pronTips(r.missed).map(x => `<div class="pron-tip">${esc(x)}</div>`).join('')}
      <small>綠色＝念清楚了，紅色＝電腦沒聽到。點紅色的字聽慢速發音。</small>`;
    sfx(r.pass);
  }, { continuous: true, recText: '<i class="ic ic-stop"></i> 唸完了，按這裡結束' });
  $('[data-next]').onclick = () => speakRead(idx + 1);
}

/* ---------- 口說：回答問題 ---------- */
function speakAnswer() {
  const list = lruSample(GEPT.answer, 5, 'ganswer');
  let i = 0;
  draw();
  function draw() {
    if (i >= list.length) {
      view(`${bar('口說・回答問題')}<div class="card result"><h2>完成 ${list.length} 題！</h2><p>多練習用「完整句子」回答，再多說一個理由或細節，分數會更高喔！</p><div class="row center"><button class="btn primary" data-again>再練一次</button><button class="btn" data-menu>← 回英檢</button></div></div>`, geptHome);
      $('[data-again]').onclick = speakAnswer; $('[data-menu]').onclick = geptHome;
      return;
    }
    const q = list[i];
    let left = 15, tm = null;
    view(`${bar('口說・回答問題')}
      <div class="progress"><div style="width:${(i / list.length) * 100}%"></div></div>
      <div class="card qcard">
        <p class="ask">第 ${i + 1} / ${list.length} 題：聽問題，在 15 秒內用英文回答</p>
        <div class="say-row"><button class="say-big wide" data-say="${esc(q.q)}"><i class="ic ic-say"></i> 再聽一次</button></div>
        <details class="sample"><summary>看題目</summary><p><b>${esc(q.q)}</b><br><small>${esc(q.zh)}</small></p></details>
        <div class="countdown"><div class="cd-bar"><div></div></div><span>15</span></div>
        <div class="row center"><button class="btn primary big" data-mic><i class="ic ic-mic"></i> 開始回答</button></div>
        <div class="type-alt"><input class="type-in" placeholder="說的話會出現在這裡（也可以直接打字）" autocomplete="off"><button class="btn primary" data-type>送出</button></div>
        <div class="said"></div>
        <div class="row center"><button class="btn" data-next>下一題 →</button></div>
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
      $('.said').innerHTML = `你的回答：「${esc(t)}」${checkListHtml(tips)}<div class="samples"><b>參考回答：</b>${q.samples.map(s => `<div>${esc(s)} ${sayMini(s)}</div>`).join('')}</div>`;
      $('.sample').open = true;
    };
    const ti = $('.type-alt input');
    $('[data-mic]').onclick = e => micToInput(e.currentTarget, ti, { continuous: true, recText: '<i class="ic ic-stop"></i> 說完了，按這裡' });
    $('[data-type]').onclick = () => { if (ti.value.trim()) judge(ti.value.trim()); };
    ti.onkeydown = e => { if (e.key === 'Enter') $('[data-type]').click(); };
    $('[data-next]').onclick = () => { i++; draw(); };
  }
}

/* =========================================================
   個人資料（在這台電腦登入；每個學生的進度分開存）
   ========================================================= */
const COUNTIES = [
  ['臺北市', 'Taipei'], ['新北市', 'New Taipei'], ['桃園市', 'Taoyuan'], ['臺中市', 'Taichung'], ['臺南市', 'Tainan'], ['高雄市', 'Kaohsiung'],
  ['基隆市', 'Keelung'], ['新竹市', 'Hsinchu City'], ['嘉義市', 'Chiayi City'], ['新竹縣', 'Hsinchu County'], ['苗栗縣', 'Miaoli'], ['彰化縣', 'Changhua'],
  ['南投縣', 'Nantou'], ['雲林縣', 'Yunlin'], ['嘉義縣', 'Chiayi County'], ['屏東縣', 'Pingtung'], ['宜蘭縣', 'Yilan'], ['花蓮縣', 'Hualien'],
  ['臺東縣', 'Taitung'], ['澎湖縣', 'Penghu'], ['金門縣', 'Kinmen'], ['連江縣', 'Matsu'],
];
const profiles = () => store.get('profiles', []);
const currentProfile = () => { const id = rawGet('engAdv_pid', null); return id ? profiles().find(p => p.id === id) || null : null; };
const levelForAge = a => (a <= 12 ? 'elem' : a <= 15 ? 'jh' : a <= 18 ? 'sh' : 'uni');
function switchProfile(id) { rawSet('engAdv_pid', id); location.reload(); }   // 重新載入，換成這個學生的進度

function profilePage(back, editId) {
  const list = profiles(), cur = currentProfile();
  const ed = editId === 'new' ? { id: '', name: '', age: '', city: '', stage: '', school: '' } : list.find(p => p.id === editId) || null;
  view(`${bar('個人資料')}
    <div class="card">
      <p class="ask">目前使用：${cur ? `<b>${esc(cur.name)}</b>（${cur.age ? cur.age + ' 歲' : '未填年齡'}${cur.city ? '・' + esc(cur.city) : ''}）` : '<b>訪客</b>（沒有登入，進度存在共用區）'}</p>
      <div class="profiles">${list.map(p => `<div class="pf ${cur && cur.id === p.id ? 'on' : ''}"><span class="pf-av" style="background:${p.color}">${esc((p.name || '?').slice(0, 1))}</span>
        <div><b>${esc(p.name)}</b><small>${p.age ? p.age + ' 歲' : ''}${p.city ? '・' + esc(p.city) : ''}${p.school ? '・' + esc(p.school) : ''}</small></div>
        ${cur && cur.id === p.id ? '<span class="badge">使用中</span>' : `<button class="btn primary" data-use="${p.id}">登入</button>`}
        <button class="mini" data-edit="${p.id}">編輯</button></div>`).join('') || '<p class="note-s">還沒有任何學生，先新增一個吧！</p>'}</div>
      <div class="row"><button class="btn" data-new>＋ 新增學生</button>${cur ? '<button class="btn ghost" data-out>登出（改用訪客）</button>' : ''}</div>
    </div>
    ${ed ? `<div class="card pf-form"><h3>${ed.id ? '編輯資料' : '新增學生'}</h3>
      <label>名字（英文名或中文名都可以）<input class="type-in" data-name value="${esc(ed.name)}" maxlength="20"></label>
      <label>年齡（會用來挑選適合的時事話題和 AI 說話難度）<select data-age><option value="">請選擇</option>${Array.from({ length: 55 }, (_, i) => i + 6).map(a => `<option value="${a}" ${+ed.age === a ? 'selected' : ''}>${a} 歲</option>`).join('')}</select></label>
      <label>縣市<select data-city><option value="">（不填）</option>${COUNTIES.map(([c]) => `<option ${ed.city === c ? 'selected' : ''}>${c}</option>`).join('')}</select></label>
      <label>學校階段（首頁會自動切到這個階段）<select data-stage>${LEVELS.map(l => `<option value="${l.id}" ${(ed.stage || (ed.age ? levelForAge(+ed.age) : 'elem')) === l.id ? 'selected' : ''}>${l.name}</option>`).join('')}</select></label>
      <label>學校（打學校名稱的一部分，例如「文聖」，再從清單選）<input class="type-in" data-school list="school-list" value="${esc(ed.school || '')}" placeholder="輸入或從清單選擇學校" autocomplete="off"><datalist id="school-list"></datalist></label>
      <p class="note-s school-count"></p>
      <div class="row"><button class="btn primary" data-save>儲存並登入</button>${ed.id ? '<button class="btn ghost" data-del>刪除這個學生</button>' : ''}</div>
    </div>` : ''}`, back);
  $$('[data-use]').forEach(b => b.onclick = () => switchProfile(b.dataset.use));
  $$('[data-edit]').forEach(b => b.onclick = () => profilePage(back, b.dataset.edit));
  $('[data-new]').onclick = () => profilePage(back, 'new');
  const out = $('[data-out]'); if (out) out.onclick = () => switchProfile(null);
  if (!ed) return;
  // 學校清單：依縣市和階段列出教育部名錄裡的學校
  let stageTouched = !!ed.stage;
  const fillSchools = () => loadSchools().then(S => {
    const k = { elem: 'e', jh: 'j', sh: 'h', uni: 'u' }[$('[data-stage]').value];
    const city = $('[data-city]').value;
    // 全台的學校都可以搜尋，選的縣市排在最前面；每所學校後面附上縣市和鄉鎮區，避免同名學校搞混
    const all = Object.entries(S[k]).flatMap(([c, arr]) => arr.map(x => { const [n, d] = x.split('|'); return { n, c, d: d || '' }; }));
    const mine = all.filter(x => x.c === city);
    const list = city ? [...mine, ...all.filter(x => x.c !== city)] : all;
    $('#school-list').innerHTML = list.map(x => `<option value="${esc(`${x.n}（${x.c}${x.d}）`)}">`).join('');
    const stageName = LEVELS.find(l => l.id === $('[data-stage]').value).name;
    $('.school-count').textContent = `全台共有 ${all.length} 所${stageName}${city ? `（${city} ${mine.length} 所）` : ''}，輸入學校名稱的一部分就能找到，其他縣市的學校也可以（資料：教育部各級學校名錄）`;
  }).catch(() => { $('.school-count').textContent = '學校清單載入失敗，可以直接打學校名稱。'; });
  $('[data-city]').onchange = fillSchools;
  // 選了別的縣市的學校，就自動把縣市換過去
  $('[data-school]').onchange = () => {
    const m = $('[data-school]').value.match(/（(.{2}[縣市])/);
    if (m && COUNTIES.some(c => c[0] === m[1]) && $('[data-city]').value !== m[1]) { $('[data-city]').value = m[1]; fillSchools(); }
  };
  $('[data-stage]').onchange = () => { stageTouched = true; fillSchools(); };
  $('[data-age]').onchange = () => { if (!stageTouched && +$('[data-age]').value) { $('[data-stage]').value = levelForAge(+$('[data-age]').value); fillSchools(); } };
  fillSchools();
  $('[data-save]').onclick = () => {
    const name = $('[data-name]').value.trim(), age = +$('[data-age]').value || 0, city = $('[data-city]').value;
    const stage = $('[data-stage]').value, school = $('[data-school]').value.trim();
    if (!name) return toast('請輸入名字');
    if (!age) return toast('請選擇年齡');
    const all = profiles();
    const colors = ['#ff6b6b', '#ff922b', '#40c057', '#339af0', '#845ef7', '#f06595', '#20c997'];
    let p = all.find(x => x.id === ed.id);
    if (!p) { p = { id: Date.now().toString(36), color: pick(colors) }; all.push(p); }
    Object.assign(p, { name, age, city, stage, school });
    store.set('profiles', all);
    rawSet(`engAdv_p${p.id}_level`, stage || levelForAge(age));   // 首頁切到自己的學校階段
    switchProfile(p.id);
  };
  const del = $('[data-del]');
  if (del) del.onclick = () => {
    if (!confirm(`確定要刪除「${ed.name}」嗎？這個學生的進度也會一起刪掉。`)) return;
    store.set('profiles', profiles().filter(p => p.id !== ed.id));
    try { Object.keys(localStorage).filter(k => k.startsWith(`engAdv_p${ed.id}_`)).forEach(k => localStorage.removeItem(k)); } catch (e) { }
    if (cur && cur.id === ed.id) switchProfile(null); else profilePage(back);
  };
}
/** 學校名錄比較大，打開個人資料時才載入 */
function loadSchools() {
  if (window.SCHOOLS) return Promise.resolve(window.SCHOOLS);
  return new Promise((ok, fail) => {
    const s = document.createElement('script');
    s.src = 'schools.js';
    s.onload = () => (window.SCHOOLS ? ok(window.SCHOOLS) : fail());
    s.onerror = fail;
    document.head.appendChild(s);
  });
}
function drawWhoButton() {
  const b = $('[data-who]'); if (!b) return;
  const p = currentProfile();
  b.innerHTML = p ? `<span class="pf-av sm" style="background:${p.color}">${esc(p.name.slice(0, 1))}</span> ${esc(p.name)}` : '登入';
}

/* =========================================================
   發音矯正：逐字比對，全部念清楚才過關，並指出哪些字沒念好
   ========================================================= */
const HOMOPHONES = [['to', 'too', 'two'], ['for', 'four'], ['there', 'their', "they're"], ['right', 'write'], ['hear', 'here'], ['know', 'no'],
  ['see', 'sea'], ['son', 'sun'], ['one', 'won'], ['by', 'buy', 'bye'], ['eight', 'ate'], ['ok', 'okay'], ['meet', 'meat'], ['flower', 'flour'],
  ['week', 'weak'], ['new', 'knew'], ['red', 'read'], ['blue', 'blew'], ['dear', 'deer'], ['its', 'it is']];
const sameWord = (a, b) => a === b || HOMOPHONES.some(g => g.includes(a) && g.includes(b));
/** 比對目標句和電腦聽到的句子，回傳每個字有沒有念到 */
function pronCheck(target, said) {
  const raw = target.split(/\s+/).filter(w => stripP(w));
  const t = raw.flatMap((w, i) => norm(stripP(w)).split(' ').filter(Boolean).map(n => ({ n, i })));
  const s = norm(said).split(' ').filter(Boolean);
  const dp = Array.from({ length: t.length + 1 }, () => new Array(s.length + 1).fill(0));
  for (let i = 1; i <= t.length; i++)
    for (let j = 1; j <= s.length; j++)
      dp[i][j] = sameWord(t[i - 1].n, s[j - 1]) ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
  const hit = new Set();
  for (let i = t.length, j = s.length; i > 0 && j > 0;) {
    if (sameWord(t[i - 1].n, s[j - 1])) { hit.add(i - 1); i--; j--; } else if (dp[i - 1][j] >= dp[i][j - 1]) i--; else j--;
  }
  const okWord = raw.map((_, wi) => t.every((x, k) => x.i !== wi || hit.has(k)));
  const words = raw.map((w, i) => ({ raw: w, ok: okWord[i] }));
  const missed = words.filter(w => !w.ok).map(w => stripP(w.raw));
  const extra = Math.max(0, s.length - hit.size);
  const pct = Math.round((hit.size / Math.max(t.length, s.length - Math.min(extra, 2), 1)) * 100);
  // 過關條件：每個字都念到（只容許一個兩個字母以內的小字，例如 a、to 被聽錯）
  const pass = missed.filter(w => w.length > 2).length === 0 && missed.length <= 1 && pct >= 80;
  return { words, missed, pct: Math.min(100, pct), pass };
}
/** 針對台灣學生常見的發音問題給提示 */
function pronTips(words) {
  const tips = new Map();
  for (const raw of words) {
    const w = raw.toLowerCase();
    const add = (k, t) => { if (!tips.has(k)) tips.set(k, t); };
    if (/th/.test(w)) add('th', '「th」：舌尖輕放在上下牙齒中間吐氣（think、this），不要念成 s 或 z。');
    if (/v/.test(w)) add('v', '「v」：上排牙齒輕碰下唇再發聲（very、five），不要念成 b 或 w。');
    if (/^r|[bcdfgkpt]r/.test(w)) add('r', '「r」：嘴唇稍微嘟起，舌頭往後捲、不要碰到上顎（red、tree）。');
    if (/l$|ll$|le$/.test(w)) add('l', '字尾「l」：舌尖要頂住上排牙齒後面（ball、apple），不要念成「歐」。');
    if (/ng$/.test(w)) add('ng', '「ng」結尾：舌根頂住上顎、用鼻子發音（sing、long）。');
    if (/ed$/.test(w) && w.length > 3) add('ed', '過去式「-ed」要念出來（played、wanted）。');
    else if (/[^s']s$|es$/.test(w) && w.length > 3) add('s', '字尾「s」要念出來（books、likes），不要吃掉。');
    else if (/[tdkpbg]$/.test(w)) add('end', '字尾的子音（t、d、k、p、b、g）要輕輕念出來（cat、bed、book），不要省略。');
    if (w.length >= 8) add('long:' + w, `「${w}」比較長：按慢速聽清楚重音在哪一節，再一段一段念。`);
  }
  if (!tips.size && words.length) tips.set('slow', '先按喇叭聽清楚，嘴巴張大、說慢一點、一個字一個字念清楚。');
  return [...tips.values()].slice(0, 4);
}
/** 發音練習區：按麥克風念 target，全部念清楚才過關 */
function pronPractice(host, target, o = {}) {
  const box = document.createElement('div');
  box.className = 'pron';
  box.innerHTML = `${o.showText === false ? '' : `<div class="pron-words">${target.split(/\s+/).filter(Boolean).map(w => `<span>${esc(w)}</span>`).join(' ')}</div>`}
    <div class="row center"><button class="btn primary big" data-mic><i class="ic ic-mic"></i> ${o.micText || '開始說'}</button>${o.skip ? '<button class="btn ghost" data-skip>略過這題</button>' : ''}</div>
    <div class="pron-out"></div>
    ${SR ? '' : '<p class="note-s">這個瀏覽器不能語音辨識（請用電腦版 Chrome 或 Edge），可以先按「略過」。</p>'}`;
  host.appendChild(box);
  let over = false, tries = 0;
  const mic = $('[data-mic]', box), out = $('.pron-out', box);
  mic.onclick = () => {
    if (over) return;
    recognize(mic, said => {
      tries++;
      const r = pronCheck(target, said);
      const spans = $$('.pron-words span', box);
      r.words.forEach((w, i) => { if (spans[i]) spans[i].className = w.ok ? 'g' : 'r'; });
      if (r.pass) {
        over = true; mic.disabled = true;
        const sk = $('[data-skip]', box); if (sk) sk.disabled = true;
        out.innerHTML = `<div class="pron-ok"><b>過關！</b> ${r.pct} 分　電腦聽到：「${esc(said)}」</div>`;
        sfx(true);
        o.onPass && o.onPass(r, tries);
        return;
      }
      sfx(false);
      out.innerHTML = `<div class="pron-bad"><b>還沒過關（${r.pct} 分）</b>　電腦聽到：「${esc(said)}」
        ${r.missed.length ? `<div class="pron-miss">這些字沒念清楚：${r.missed.map(w => `<button class="wchip miss" data-say="${esc(w)}" data-slow="1"><i class="ic ic-say"></i> ${esc(w)}</button>`).join('')}</div>` : ''}
        ${pronTips(r.missed).map(t => `<div class="pron-tip">${esc(t)}</div>`).join('')}
        <small>點紅色的字聽慢速發音，跟著念幾次，再按「開始說」重來（第 ${tries} 次）。</small></div>`;
      // Robo 把沒念好的字慢慢念一次
      if (r.missed.length) setTimeout(() => speakSeq(r.missed.slice(0, 3).map(w => ({ text: w, rate: 0.6 }))), 700);
      o.onFail && o.onFail(r, tries);
    }, { continuous: o.continuous, recText: o.continuous ? '<i class="ic ic-stop"></i> 念完了，按這裡' : '<i class="ic ic-stop"></i> 聽你說…（說完按這裡）' });
  };
  const sk = $('[data-skip]', box);
  if (sk) sk.onclick = () => { if (over) return; over = true; mic.disabled = sk.disabled = true; o.onSkip && o.onSkip(); };
  return box;
}

/* =========================================================
   時事聊天：抓維基百科「今日新聞」，依年齡過濾和改寫難度
   ========================================================= */
const NEWS_BLOCK = {
  kid: /\b(kill\w*|dead|death\w*|die|died|dying|war|wars|attack\w*|bomb\w*|shoot\w*|shot|gun\w*|murder\w*|terror\w*|crash\w*|assault\w*|rape\w*|sex\w*|abuse\w*|suicide|drug\w*|massacre\w*|hostage\w*|explosion\w*|militant\w*|invasion|invade\w*|airstrike\w*|genocide|execut\w*|prison\w*|arrest\w*|riot\w*|coup|violen\w*|weapon\w*|missile\w*|earthquake\w*|flood\w*|wildfire\w*|hurricane\w*|typhoon\w*|tornado\w*|victim\w*|injur\w*|wounded|disaster\w*|epidemic|outbreak|scandal\w*|corrupt\w*|impeach\w*|sentenc\w*|trial|protest\w*|election\w*|elected|military|army|soldier\w*|conflict\w*|ceasefire|refugee\w*|nuclear|collapse\w*|fire|allegation\w*|alleged\w*|affair\w*|extramarital|spy|spies|spying|hack\w*|resign\w*|lawsuit\w*|sued|fraud\w*|steal\w*|stole\w*|stolen|theft|jail\w*|court\w*|accus\w*|charged|investigat\w*|police|crime\w*|criminal\w*|cheat\w*|divorce\w*|kidnap\w*|smuggl\w*|sanction\w*|tariff\w*|strike\w*|controvers\w*|ban|banned|fined|bankrupt\w*|layoff\w*|recession|hijack\w*|overdose|alcohol|gambl\w*|casino)\b/i,
  teen: /\b(kill\w*|dead|death\w*|died|massacre\w*|rape\w*|sex\w*|suicide|terror\w*|bomb\w*|shoot\w*|murder\w*|genocide|execut\w*|hostage\w*|abuse\w*|airstrike\w*|militant\w*|drug\w*)\b/i,
  adult: /\b(rape\w*|sexual\w*|suicide|massacre\w*|genocide|behead\w*)\b/i,
};
// 12 歲以下：新聞除了要通過上面的過濾，還必須是這些適合小朋友的主題
const NEWS_ALLOW_KID = /\b(sport\w*|football|soccer|baseball|basketball|tennis|swim\w*|olympic\w*|paralympic\w*|marathon|champion\w*|cup|tournament|medal\w*|prize\w*|award\w*|wins?|won|space|nasa|rocket\w*|astronaut\w*|planet\w*|moon|mars|satellite\w*|telescope\w*|comet\w*|star|scien\w*|discover\w*|species|animal\w*|zoo|panda\w*|whale\w*|bird\w*|dinosaur\w*|fossil\w*|museum\w*|film\w*|movie\w*|animat\w*|music\w*|album\w*|song\w*|book\w*|novel\w*|festival\w*|record|robot\w*|invent\w*|ocean\w*|reef\w*|forest\w*|park|bridge|train|art\w*|painting\w*|game\w*|disney|pixar|launch\w*|opens?|opened)\b/i;
const TOPIC_BANK = {
  kid: [
    ['Your favorite sport', 'Many kids in Taiwan love basketball, baseball, swimming and running. Sports keep us healthy and happy.'],
    ['Animals at the zoo', 'Taipei Zoo has pandas, koalas and penguins. Many families visit the zoo on weekends.'],
    ['Space and planets', 'There are eight planets in our solar system. Scientists send robots and rockets to learn about them.'],
    ['Healthy food', 'Fruit and vegetables help us grow strong. Too much candy and soda is not good for our teeth.'],
    ['Screen time', 'Many children play games on phones and tablets. Doctors say we should also play outside and rest our eyes.'],
    ['Protecting the ocean', 'Plastic in the sea can hurt fish and turtles. We can help by using less plastic and recycling.'],
    ['Festivals in Taiwan', 'Taiwan has fun festivals like Chinese New Year, the Dragon Boat Festival and the Moon Festival.'],
    ['Robots and AI helpers', 'Some robots can clean the floor, and AI can answer questions. People use them to make life easier.'],
  ],
  teen: [
    ['Social media', 'Teenagers spend hours on apps like Instagram and YouTube. It helps them connect, but it can also cause stress.'],
    ['AI at school', 'More students use AI tools to study. Teachers worry about cheating, but AI can also explain hard ideas.'],
    ['Climate change', 'Summers are getting hotter. Young people around the world are asking leaders to cut carbon emissions.'],
    ['Esports', 'Video game competitions now fill big stadiums, and some players earn money like sports stars.'],
    ['Study pressure', 'Many students in Taiwan go to cram school after class. Some say they need more time to rest.'],
    ['Smartphone rules', 'Some schools ban phones in class to help students focus. Others think phones are useful learning tools.'],
  ],
  adult: [
    ['AI and jobs', 'Generative AI can write, draw and code. Many workers wonder which jobs will change and which new jobs will appear.'],
    ['Remote work', 'After the pandemic, many companies let people work from home some days a week.'],
    ['Housing prices', 'In many big cities, young people find it hard to buy a home because prices keep rising.'],
    ['Sustainable living', 'More people choose public transport, second-hand clothes and plant-based meals to reduce their impact on the planet.'],
    ['Travel trends', 'Travelers now look for local experiences, like cooking classes and small towns, instead of only famous sights.'],
  ],
};
const ageGroup = age => (age <= 12 ? 'kid' : age <= 15 ? 'teen' : age <= 18 ? 'teen' : 'adult');
const stripHtml = h => { const d = document.createElement('div'); d.innerHTML = h || ''; return (d.textContent || '').replace(/\s+/g, ' ').trim(); };
async function fetchNewsTopics(age) {
  const group = age <= 15 ? 'kid' : age <= 18 ? 'teen' : 'adult';
  const block = NEWS_BLOCK[group];
  const okText = (...ts) => ts.every(t => !block.test(t || '')) && (age > 12 || NEWS_ALLOW_KID.test(ts[0] || ''));
  const out = [];
  const pad = n => String(n).padStart(2, '0');
  for (let back = 0; back < 3 && !out.length; back++) {
    const t = new Date(Date.now() - back * 864e5);
    try {
      const r = await fetch(`https://en.wikipedia.org/api/rest_v1/feed/featured/${t.getFullYear()}/${pad(t.getMonth() + 1)}/${pad(t.getDate())}`);
      if (!r.ok) continue;
      const j = await r.json();
      (j.news || []).forEach(n => {
        const text = stripHtml(n.story), ctx = (n.links && n.links[0] && n.links[0].extract) || '';
        if (text && okText(text, ctx)) out.push({ kind: '今日新聞', title: text, text, ctx });
      });
      if (j.tfa && j.tfa.extract && !block.test(j.tfa.extract) && !block.test(j.tfa.normalizedtitle || '')) out.push({ kind: '今日推薦文章', title: j.tfa.normalizedtitle || j.tfa.title, text: j.tfa.extract, ctx: '' });
      (j.onthisday || []).slice(0, 12).forEach(e => {
        const tx = stripHtml(e.text);
        if (tx && okText(tx)) out.push({ kind: '歷史上的今天', title: `${e.year}: ${tx}`, text: `On this day in ${e.year}, ${tx}`, ctx: '' });
      });
    } catch (e) { /* 沒網路或被擋：用下面的話題 */ }
  }
  const bank = TOPIC_BANK[ageGroup(age)].map(([title, text]) => ({ kind: '生活話題', title, text, ctx: '' }));
  return [...out.slice(0, 6), ...sample(bank, out.length ? 3 : 6)];
}

function newsChat(back) {
  const p = currentProfile();
  if (!p || !p.age) {
    view(`${bar('時事聊天')}<div class="card center"><p class="ask">時事話題會依照你的年齡挑選，請先設定個人資料（名字和年齡）。</p><button class="btn primary" data-pf>設定個人資料</button></div>`, back);
    $('[data-pf]').onclick = () => profilePage(() => newsChat(back), p ? p.id : 'new');
    return;
  }
  let alive = true;
  view(`${bar('時事聊天')}
    <div class="card"><div class="ai-panel-host"></div>
      <p class="ask">選一個話題，用英文跟 Robo 聊聊（${p.age} 歲適合的內容）</p>
      <div class="topics"><p class="note-s">正在找今天的新聞…</p></div></div>`, back);
  onLeave(() => { alive = false; });
  const host = $('.ai-panel-host'); const panel = document.createElement('div'); host.appendChild(panel);
  mountAIPanel(panel, () => alive, { offTitle: '時事聊天需要 AI 大腦', offText: '開啟後 Robo 會用適合你年齡的英文介紹新聞，再跟你討論。', onText: 'Robo 會用適合你年齡的英文介紹話題' });
  fetchNewsTopics(p.age).then(list => {
    if (!alive) return;
    $('.topics').innerHTML = list.map((t, i) => `<div class="topic"><span class="badge">${t.kind}</span><p>${esc(t.title.length > 160 ? t.title.slice(0, 160) + '…' : t.title)}</p><button class="btn primary" data-t="${i}">聊這個</button></div>`).join('');
    $$('[data-t]').forEach(b => b.onclick = () => {
      if (!aiReady()) return toast('請先按上面的「開啟 AI 大腦」，等它準備好');
      topicChat(list[+b.dataset.t], () => newsChat(back));
    });
  });
}
function topicChat(t, back) {
  const ui = chatUI('時事聊天：' + (t.title.length > 24 ? t.title.slice(0, 24) + '…' : t.title), back);
  let alive = true, busy = false;
  onLeave(() => { alive = false; });
  mountAIPanel(ui.panel(), () => alive, { onText: '依照你的年齡調整難度' });
  const sys = aiSystem(`Today's conversation topic: "${t.text.slice(0, 700)}"${t.ctx ? `\nBackground information: "${t.ctx.slice(0, 600)}"` : ''}
Talk about this topic. Explain it in easy words that fit the learner's age, and ask for the learner's opinion or experience. Do not say anything scary or violent.`);
  const history = [];
  const ask = async userText => {
    busy = true;
    const done = ui.typing();
    history.push({ role: 'user', content: userText });
    try {
      const r = await AI.engine.chat.completions.create({ messages: [{ role: 'system', content: sys }, ...history.slice(-12)], temperature: 0.7, max_tokens: 220 });
      const raw = r.choices[0].message.content || '';
      history.push({ role: 'assistant', content: raw });
      if (!alive) return;
      done();
      const a = parseAI(raw);
      ui.ai(a.en || 'Sorry, can you say that again?', a.zh);
      ui.chips(a.tryIt ? [a.tryIt] : [], null);
    } catch (e) {
      history.pop();
      if (!alive) return;
      done();
      ui.ai('Sorry, my AI brain is not ready. Please try again.', '抱歉，AI 大腦還沒準備好，請再試一次。');
    }
    busy = false;
  };
  ask('Please introduce today\'s topic to me in a few easy sentences, then ask me a question about it.');
  ui.onSend((text, typed) => { if (busy) return; ui.me(text, typed); ask(text); });
}

/* =========================================================
   問問 AI 老師：自由提問，整理多種說法和使用情境
   ========================================================= */
const ASK_EXAMPLES = ['「我喜歡你」有哪些說法？', '「加油」英文怎麼說？', 'How are you? 可以怎麼回答？', 'make 和 do 有什麼不同？', '「不好意思」在不同情況怎麼說？', '怎麼用英文禮貌地拒絕別人？'];
function askSystem() {
  const p = currentProfile(), L = ageLevel(p && p.age);
  return `你是一位親切、專業的英文老師，學生是台灣的${p && p.age ? p.age + ' 歲' : ''}學習者（${L.who}）。學生會用中文或英文問英文學習的問題。
回答規則：
- 用繁體中文解釋。英文要自然、正確，難度約 CEFR ${L.cefr}。
- 如果學生問「某句話有哪些說法」或「怎麼說」，列出 4 到 6 種英文說法，包含正式說法和生活口語。每種說法單獨一行，格式固定為：
1. 英文句子｜中文意思｜使用情境（例如：正式、朋友之間、浪漫、開玩笑、職場）
- 如果是文法或用法問題，先用一兩句話說明差別，再用上面同樣的格式給 2 到 4 個例句。
- 最後一行用「小提醒：」開頭，簡短說明怎麼選用。
- 不要使用表情符號，不要用 Markdown 標題或表格。`;
}
function renderAnswer(text) {
  return text.split(/\n+/).map(line => {
    const l = line.trim();
    if (!l) return '';
    const m = l.match(/^\s*\d+\s*[.、)）]\s*(.+?)\s*[｜|]\s*(.+?)\s*(?:[｜|]\s*(.+))?$/);
    if (m && /[A-Za-z]/.test(m[1])) {
      const en = m[1].replace(/\*\*/g, '').replace(/^["“]|["”]$/g, '');
      return `<div class="ans-row"><div class="ans-en">${sayMini(en)} <b>${esc(en)}</b></div><div class="ans-zh">${esc(m[2])}</div>${m[3] ? `<span class="badge">${esc(m[3])}</span>` : ''}</div>`;
    }
    const body = esc(l.replace(/^#+\s*/, '')).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
    return /^小提醒/.test(l) ? `<div class="ans-tip">${body}</div>` : `<p>${body}</p>`;
  }).join('');
}
function askTeacher(back) {
  let alive = true, busy = false;
  const history = [];
  view(`${bar('問問 AI 老師')}
    <div class="card"><div class="ai-panel-host"></div>
      <p class="ask">想知道什麼英文都可以問！例如某句話有哪些說法、單字怎麼用、文法差在哪</p>
      <div class="starters">${ASK_EXAMPLES.map(x => `<button class="chip" data-ex>${esc(x)}</button>`).join('')}</div>
      <div class="ask-box"><textarea class="write" rows="2" placeholder="在這裡輸入你的問題（中文或英文都可以）"></textarea><button class="btn primary" data-send>問老師</button></div>
    </div>
    <div class="answers"></div>`, back);
  onLeave(() => { alive = false; });
  const panel = document.createElement('div'); $('.ai-panel-host').appendChild(panel);
  mountAIPanel(panel, () => alive, { offTitle: '問問 AI 老師需要 AI 大腦', offText: '建議選「比較聰明」，回答會更完整（下載約 2 GB）。', onText: '老師準備好了，問吧！' });
  const ta = $('textarea.write');
  $$('[data-ex]').forEach(b => b.onclick = () => { ta.value = b.textContent; ta.focus(); });
  const send = async () => {
    const q = ta.value.trim();
    if (!q || busy) return;
    if (!aiReady()) return toast('請先按上面的「開啟 AI 大腦」，等它準備好');
    busy = true; ta.value = '';
    const item = document.createElement('div');
    item.className = 'card qa';
    item.innerHTML = `<div class="qa-q">${esc(q)}</div><div class="qa-a"><span class="dots"><i></i><i></i><i></i></span> 老師正在想…</div>`;
    $('.answers').prepend(item);
    const out = $('.qa-a', item);
    let text = '';
    try {
      const stream = await AI.engine.chat.completions.create({
        messages: [{ role: 'system', content: askSystem() }, ...history.slice(-4), { role: 'user', content: q }],
        temperature: 0.6, max_tokens: 700, stream: true,
      });
      for await (const ch of stream) {
        if (!alive) return;
        text += (ch.choices[0] && ch.choices[0].delta && ch.choices[0].delta.content) || '';
        out.innerHTML = renderAnswer(text.replace(/\p{Extended_Pictographic}|️/gu, ''));
      }
      history.push({ role: 'user', content: q }, { role: 'assistant', content: text });
    } catch (e) {
      if (alive) out.innerHTML = '<p class="r">抱歉，老師現在沒辦法回答，請再試一次。</p>';
    }
    busy = false;
  };
  $('[data-send]').onclick = send;
  ta.onkeydown = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };
}

/* =========================================================
   學校題庫：每間學校自己的題目
   老師在「老師出題」建立 → 產生分享連結（題目整個包在連結裡）→ 學生點連結匯入
   或把題庫檔放進 school-banks.js，該校學生自動看到
   ========================================================= */
const localBanks = () => store.get('banks', {});
function banksFor(school) {
  if (!school) return [];
  const official = ((window.SCHOOL_BANKS || {})[school] || []).map(b => ({ ...b, official: true }));
  return [...official, ...(localBanks()[school] || [])];
}
function cleanBank(b) {
  const s = (x, n) => String(x == null ? '' : x).slice(0, n).trim();
  return {
    v: 1, id: s(b.id, 40) || Date.now().toString(36), school: s(b.school, 80), title: s(b.title, 60) || '未命名題庫', by: s(b.by, 30),
    words: (Array.isArray(b.words) ? b.words : []).slice(0, 400).map(w => [s(w[0], 60), s(w[1], 60), s(w[2], 16)]).filter(w => w[0] && w[1]),
    sentences: (Array.isArray(b.sentences) ? b.sentences : []).slice(0, 300).map(x => [s(x[0], 300), s(x[1], 300)]).filter(x => x[0] && x[1]),
  };
}
function saveLocalBank(b) {
  const all = localBanks();
  const list = (all[b.school] = all[b.school] || []);
  const i = list.findIndex(x => x.id === b.id);
  if (i >= 0) list[i] = b; else list.push(b);
  store.set('banks', all);
}
function deleteLocalBank(school, id) {
  const all = localBanks();
  all[school] = (all[school] || []).filter(x => x.id !== id);
  if (!all[school].length) delete all[school];
  store.set('banks', all);
}
/** 把題庫壓縮成可以放進網址的文字 */
const b64u = bytes => { let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
const unb64u = t => { const s = atob(t.replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from(s, c => c.charCodeAt(0)); };
async function packBank(b) {
  let bytes = new TextEncoder().encode(JSON.stringify(b));
  if (window.CompressionStream) {
    const st = new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate-raw'));
    return 'z' + b64u(new Uint8Array(await new Response(st).arrayBuffer()));
  }
  return 'p' + b64u(bytes);
}
async function unpackBank(t) {
  let bytes = unb64u(t.slice(1));
  if (t[0] === 'z') {
    const st = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
    bytes = new Uint8Array(await new Response(st).arrayBuffer());
  }
  return cleanBank(JSON.parse(new TextDecoder().decode(bytes)));
}
const shareUrl = code => location.href.split('#')[0] + '#bank=' + code;
/** 解析老師貼上的內容：每行「英文 = 中文」，單字可以再加「= 圖案」 */
function parseLines(text, withPic) {
  return text.split(/\r?\n/).map(l => l.trim()).filter(Boolean).map(l => {
    const p = l.split(/\s*(?:=|｜|\||\t)\s*/);
    return withPic ? [p[0], p[1] || '', p[2] || ''] : [p[0], p.slice(1).join(' ') || ''];
  }).filter(x => x[0] && x[1]);
}
const linesOf = (arr, withPic) => arr.map(x => (withPic && x[2] ? `${x[0]} = ${x[1]} = ${x[2]}` : `${x[0]} = ${x[1]}`)).join('\n');

/** 用學校題庫出題 */
function bankQuiz(b, back) {
  const W = b.words.map(([en, zh, emoji]) => ({ en, zh, emoji: emoji || '' }));
  const S = b.sentences.map(([en, zh]) => ({ en, zh }));
  if (!W.length && !S.length) return toast('這個題庫還沒有題目');
  const o = {
    title: b.title, types: GRADE_TYPES.filter(t => t !== 'chatReply'), words: W, sentences: S, dialogues: [],
    n: Math.min(10, Math.max(4, W.length + S.length)), key: 'bank-' + b.id, againText: '再來一回', menuText: '回首頁', back,
  };
  o.rebuild = () => buildQs(o);
  runQuiz({ ...o, questions: o.rebuild() });
}

/** 學校名稱搜尋欄（個人資料和老師出題共用） */
function schoolPicker(input, list, stageSel) {
  return loadSchools().then(S => {
    const ks = stageSel ? [{ elem: 'e', jh: 'j', sh: 'h', uni: 'u' }[stageSel]] : ['e', 'j', 'h', 'u'];
    list.innerHTML = ks.flatMap(k => Object.entries(S[k]).flatMap(([c, arr]) => arr.map(x => { const [n, d] = x.split('|'); return `<option value="${esc(`${n}（${c}${d || ''}）`)}">`; }))).join('');
  });
}

function teacherPage(back, editId, autoShare) {
  const me = currentProfile();
  const school0 = (me && me.school) || '';
  const all = localBanks();
  let ed = null;
  if (editId) for (const s in all) { const f = all[s].find(b => b.id === editId); if (f) ed = f; }
  if (editId === 'new' || !ed) ed = ed || (editId === 'new' ? { id: '', school: school0, title: '', by: '', words: [], sentences: [] } : null);
  const mine = Object.entries(all).flatMap(([s, arr]) => arr.map(b => ({ ...b, school: s })));
  view(`${bar('老師出題：學校題庫')}
    <div class="card">
      <p class="ask">幫你的學校建立專屬題目！學生打開你分享的連結就能練習。</p>
      <p class="note-s">建好後按「產生分享連結」，用 LINE、班級網頁傳給學生；學生在「個人資料」選同一間學校，首頁就會出現這份題庫。</p>
      <div class="bank-list">${mine.map(b => `<div class="bank"><div><b>${esc(b.title)}</b><small>${esc(b.school)}・${b.words.length} 個單字・${b.sentences.length} 個句子</small></div>
        <button class="btn" data-share="${b.id}">分享連結</button><button class="mini" data-edit="${b.id}">編輯</button></div>`).join('') || '<p class="note-s">這台電腦還沒有建立任何題庫。</p>'}</div>
      <div class="row"><button class="btn primary" data-new>＋ 建立新題庫</button><button class="btn ghost" data-file>從檔案匯入</button><input type="file" accept=".json,application/json" hidden data-fileinput></div>
      <div class="share-out"></div>
    </div>
    ${ed ? `<div class="card bank-form">
      <h3>${ed.id ? '編輯題庫' : '建立新題庫'}</h3>
      <label>學校（打學校名稱的一部分搜尋）<input class="type-in" data-school list="bank-schools" value="${esc(ed.school)}" placeholder="例如：文聖" autocomplete="off"><datalist id="bank-schools"></datalist></label>
      <label>題庫名稱<input class="type-in" data-title value="${esc(ed.title)}" placeholder="例如：五年級上學期 Unit 3 Food" maxlength="60"></label>
      <label>出題老師（可不填）<input class="type-in" data-by value="${esc(ed.by)}" maxlength="30"></label>
      <label>單字（一行一個：英文 = 中文，可以再加 = 圖案）<textarea class="write" rows="8" data-words placeholder="apple = 蘋果 = 🍎&#10;banana = 香蕉&#10;delicious = 美味的">${esc(linesOf(ed.words, true))}</textarea></label>
      <label>句子（一行一句：英文 = 中文）<textarea class="write" rows="6" data-sents placeholder="I like apples. = 我喜歡蘋果。&#10;What do you want to eat? = 你想吃什麼？">${esc(linesOf(ed.sentences))}</textarea></label>
      <p class="note-s bank-count"></p>
      <div class="row"><button class="btn primary" data-save>儲存</button><button class="btn" data-try>試做一次</button>${ed.id ? '<button class="btn ghost" data-del>刪除</button>' : ''}</div>
    </div>` : ''}`, back);
  const shareOut = $('.share-out');
  const showShare = async b => {
    const url = shareUrl(await packBank(cleanBank(b)));
    shareOut.innerHTML = `<div class="share-box"><b>「${esc(b.title)}」的分享連結</b>
      <textarea class="write" rows="3" readonly>${esc(url)}</textarea>
      <div class="row"><button class="btn primary" data-copy>複製連結</button><button class="btn" data-dl>下載題庫檔（放到網站上永久使用）</button></div>
      <small>連結裡已經包含全部題目，學生點開就會自動匯入。網址${url.length > 6000 ? '比較長，若傳送失敗請改用下載題庫檔' : '長度沒問題'}。</small></div>`;
    $('[data-copy]', shareOut).onclick = () => { const t = $('textarea', shareOut); t.select(); (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(() => toast('已複製連結'), () => { document.execCommand('copy'); toast('已複製連結'); }); };
    $('[data-dl]', shareOut).onclick = () => {
      const blob = new Blob([JSON.stringify(cleanBank(b), null, 2)], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `題庫-${b.title}.json`; a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    };
    shareOut.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };
  $$('[data-share]').forEach(x => x.onclick = () => showShare(mine.find(b => b.id === x.dataset.share)));
  $$('[data-edit]').forEach(x => x.onclick = () => teacherPage(back, x.dataset.edit));
  $('[data-new]').onclick = () => teacherPage(back, 'new');
  const fi = $('[data-fileinput]');
  $('[data-file]').onclick = () => fi.click();
  fi.onchange = () => {
    const f = fi.files[0]; if (!f) return;
    f.text().then(t => { const b = cleanBank(JSON.parse(t)); if (!b.school) throw new Error('沒有學校'); saveLocalBank(b); toast('已匯入「' + b.title + '」'); teacherPage(back); })
      .catch(() => toast('這個檔案不是正確的題庫檔'));
  };
  if (autoShare && ed && ed.id) showShare(ed);
  if (!ed) return;
  schoolPicker($('[data-school]'), $('#bank-schools')).catch(() => { });
  const collect = () => cleanBank({
    id: ed.id || Date.now().toString(36), school: $('[data-school]').value.trim(), title: $('[data-title]').value, by: $('[data-by]').value,
    words: parseLines($('[data-words]').value, true), sentences: parseLines($('[data-sents]').value, false),
  });
  const count = () => { const b = collect(); $('.bank-count').textContent = `目前有 ${b.words.length} 個單字、${b.sentences.length} 個句子（至少 4 個單字或 4 個句子，題型才會比較多樣）`; };
  $('[data-words]').oninput = count; $('[data-sents]').oninput = count; count();
  $('[data-save]').onclick = () => {
    const b = collect();
    if (!b.school) return toast('請選擇學校');
    if (!b.words.length && !b.sentences.length) return toast('請至少輸入一個單字或句子');
    if (ed.id && ed.school !== b.school) deleteLocalBank(ed.school, ed.id);
    saveLocalBank(b); toast('已儲存，可以把分享連結傳給學生');
    teacherPage(back, b.id, true);
  };
  $('[data-try]').onclick = () => { const b = collect(); bankQuiz(b, () => teacherPage(back, ed.id || undefined)); };
  const del = $('[data-del]');
  if (del) del.onclick = () => { if (confirm('確定要刪除這份題庫嗎？')) { deleteLocalBank(ed.school, ed.id); teacherPage(back); } };
}

/** 學生點了老師的分享連結：匯入題庫 */
async function importFromHash() {
  const m = location.hash.match(/^#bank=([A-Za-z0-9_-]+)$/);
  if (!m) return false;
  history.replaceState(null, '', location.href.split('#')[0]);
  let b;
  try { b = await unpackBank(m[1]); } catch (e) { toast('題庫連結壞掉了，請請老師重新分享'); return false; }
  const me = currentProfile();
  view(`${bar('匯入學校題庫')}
    <div class="card center">
      <p class="ask">老師分享了一份題庫給你</p>
      <h2>${esc(b.title)}</h2>
      <p>${esc(b.school)}${b.by ? '・' + esc(b.by) : ''}<br>${b.words.length} 個單字・${b.sentences.length} 個句子</p>
      ${me && me.school && me.school !== b.school ? `<p class="note-s">你的個人資料是「${esc(me.school)}」，和這份題庫的學校不同；加入後可以在「老師出題」看到它，或把個人資料的學校改成「${esc(b.school)}」。</p>` : ''}
      <div class="row center"><button class="btn primary big" data-add>加入並開始練習</button><button class="btn" data-no>不要</button></div>
    </div>`, home);
  $('[data-add]').onclick = () => { saveLocalBank(b); toast('已加入「' + b.title + '」'); bankQuiz(b, home); };
  $('[data-no]').onclick = home;
  return true;
}

/* ---------- 開始 ---------- */
$('.brand').onclick = home;
$('[data-voice]').onclick = voiceSettings;
$('[data-who]').onclick = () => profilePage(home);
drawWhoButton();
home();
importFromHash();                                    // 從老師的分享連結打開：匯入題庫
window.addEventListener('hashchange', importFromHash);
