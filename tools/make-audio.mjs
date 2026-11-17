// =============================================================
//  產生網站用的高清語音（Kokoro TTS，Apache-2.0 開源模型，離線執行）
//
//  用法（在 tools 資料夾）：
//    npm install
//    npm run audio            ← 只產生新的或改過的句子
//    npm run audio -- --clean ← 順便刪掉已經用不到的舊錄音
//
//  第一次執行會從 Hugging Face 下載模型（約 90 MB）。
//  產生的檔案：../audio/*.mp3 和 ../audio/manifest.js
// =============================================================
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
const DRY = process.argv.includes('--dry');   // --dry：只列出數量，不產生

// ---------- 可以調整的設定 ----------
const MALE = 'am_michael';   // 男聲（其他可試：am_fenrir、am_puck、bm_george 英國腔）
const FEMALE = 'af_heart';   // 英檢對話中女生的聲音
const SPEED = 0.9;           // 1 = 正常速度；小朋友聽稍微慢一點
const KBPS = 48;             // MP3 位元率（48 kbps 單聲道，人聲很清楚且檔案小）

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'audio');

// ---------- 讀取題庫 ----------
const ctx = { window: {}, console };
vm.createContext(ctx);
const src = ['data.js', 'levels.js', 'gept.js'].map(f => fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n;\n')
  + '\n;globalThis.__D = { GRADES, DAILY, BOT_QUESTIONS, CHAT_HINTS, GEPT };';
vm.runInContext(src, ctx);
const { GRADES, DAILY, BOT_QUESTIONS, CHAT_HINTS, GEPT } = ctx.__D;

// ---------- 和 app.js 完全相同的文字處理與檔名算法 ----------
function cleanForSpeech(t) {
  return String(t).replace(/\p{Extended_Pictographic}|️|‍/gu, ' ').replace(/_{2,}/g, ' blank ').replace(/\s+/g, ' ').replace(/ ([.,!?])/g, '$1').trim();
}
function clipKey(voice, text) {
  let h = 0x811c9dc5;
  const s = voice + '|' + text;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16).padStart(8, '0');
}

// ---------- 收集所有要念的句子 ----------
const jobs = new Map(); // key -> { voice, text }
function add(text, voice = 'm') {
  const t = cleanForSpeech(text);
  if (!t || !/[A-Za-z]/.test(t)) return;
  const put = s => { const k = clipKey(voice, s); if (!jobs.has(k)) jobs.set(k, { voice, text: s }); };
  put(t);
  const parts = t.split(/(?<=[.!?])\s+/).filter(Boolean);   // 也存逐句版本，讓組合句可以拼起來播
  if (parts.length > 1) parts.forEach(put);
}
const fillName = s => s.replace(/\{name\}/g, 'friend');

for (const G of Object.values(GRADES)) {
  G.words.forEach(([en]) => add(en));
  G.sentences.forEach(([en]) => add(en));
  G.dialogues.forEach(d => d.turns.forEach(t => { add(fillName(t.ai)); t.ex.forEach(x => add(x)); }));
}
DAILY.forEach(c => c.items.forEach(([en]) => add(en)));
BOT_QUESTIONS.forEach(([q, , ex]) => { add(q); ex.forEach(x => add(x)); });
Object.values(CHAT_HINTS).forEach(([, words]) => words.forEach(w => add(w)));
['Great!', 'Nice!', 'Good job!', 'Cool!', 'Wonderful!', 'Awesome!', "Let's go on.", "Hi! I'm Robo. Let's talk in English!",
  'Hello! I am Robo. Let us learn English together.'].forEach(x => add(x));

GEPT.listenPic.forEach(it => { add(it.q); it.opts.forEach((o, i) => add('ABC'[i] + '. ' + o)); });
GEPT.listenQA.forEach(it => add(it.q));
GEPT.listenDialog.forEach(it => { it.lines.forEach(([who, t]) => add(t, who === 'W' ? 'f' : 'm')); add('Question: ' + it.q); });
GEPT.listenTalk.forEach(it => { add(it.talk); add('Question: ' + it.q); });
GEPT.rewrite.forEach(it => add(it.ans[0]));
GEPT.combine.forEach(it => add(it.ans[0]));
GEPT.reorder.forEach(it => add(`${it.pre} ${it.parts.join(' ')}${it.post}`));
GEPT.repeat.forEach(s => add(s));
GEPT.readAloud.forEach(it => add(it.text));
GEPT.answer.forEach(it => { add(it.q); it.samples.forEach(s => add(s)); });
GEPT.paragraph.forEach(it => add(it.sample));

// ---------- 產生 ----------
fs.mkdirSync(OUT, { recursive: true });
const todo = [...jobs].filter(([k]) => !fs.existsSync(path.join(OUT, k + '.mp3')));
console.log(`共 ${jobs.size} 段語音，需要新產生 ${todo.length} 段`);

function trimSilence(a, sr) {
  const th = 0.004, pad = Math.round(sr * 0.08);
  let s = 0, e = a.length - 1;
  while (s < e && Math.abs(a[s]) < th) s++;
  while (e > s && Math.abs(a[e]) < th) e--;
  return a.subarray(Math.max(0, s - pad), Math.min(a.length, e + pad));
}
function toMp3(Mp3Encoder, f32, sr) {
  const enc = new Mp3Encoder(1, sr, KBPS);
  const i16 = new Int16Array(f32.length);
  for (let i = 0; i < f32.length; i++) i16[i] = Math.max(-1, Math.min(1, f32[i])) * 32767;
  const out = [];
  for (let i = 0; i < i16.length; i += 1152) { const b = enc.encodeBuffer(i16.subarray(i, i + 1152)); if (b.length) out.push(Buffer.from(b)); }
  const end = enc.flush(); if (end.length) out.push(Buffer.from(end));
  return Buffer.concat(out);
}

if (DRY) {
  const chars = todo.reduce((s, [, j]) => s + j.text.length, 0);
  console.log(`（--dry）待產生 ${todo.length} 段，共 ${chars} 個字元；女聲 ${todo.filter(([, j]) => j.voice === 'f').length} 段`);
  process.exit(0);
}
if (todo.length) {
  const { KokoroTTS } = await import('kokoro-js');
  const { Mp3Encoder } = await import('@breezystack/lamejs');
  const tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', { dtype: 'q8', device: 'cpu' });
  const t0 = Date.now();
  let n = 0;
  for (const [k, { voice, text }] of todo) {
    const audio = await tts.generate(text, { voice: voice === 'f' ? FEMALE : MALE, speed: SPEED });
    fs.writeFileSync(path.join(OUT, k + '.mp3'), toMp3(Mp3Encoder, trimSilence(audio.audio, audio.sampling_rate), audio.sampling_rate));
    n++;
    if (n % 20 === 0 || n === todo.length) {
      const eta = Math.round(((Date.now() - t0) / n) * (todo.length - n) / 1000);
      console.log(`${n}/${todo.length}  剩約 ${eta} 秒  （${text.slice(0, 40)}）`);
    }
  }
}

// ---------- 清理與清單 ----------
if (process.argv.includes('--clean')) {
  let removed = 0;
  for (const f of fs.readdirSync(OUT)) {
    const m = f.match(/^([0-9a-f]{8})\.mp3$/);
    if (m && !jobs.has(m[1])) { fs.unlinkSync(path.join(OUT, f)); removed++; }
  }
  console.log(`刪除 ${removed} 個用不到的舊錄音`);
}
const have = [...jobs.keys()].filter(k => fs.existsSync(path.join(OUT, k + '.mp3'))).sort();
fs.writeFileSync(path.join(OUT, 'manifest.js'),
  `// 自動產生，請勿手動修改（tools/make-audio.mjs）\nwindow.AUDIO_CLIPS = {${have.map(k => `"${k}":1`).join(',')}};\n`);
console.log(`完成！audio/manifest.js 列出 ${have.length} 段錄音`);
