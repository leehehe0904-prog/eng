// 檢查化學教學影片是否還能播放（YouTube oEmbed：200 = 存在且可嵌入；401/403 = 不能嵌入；404 = 下架）
// 用法：node tools/check-videos.mjs
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ctx = {};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'chem-videos.js'), 'utf8') + ';this.V = CHEM_VIDEOS;', ctx);

let bad = 0;
for (const [key, v] of Object.entries(ctx.V)) {
  const url = `https://www.youtube.com/oembed?url=${encodeURIComponent('https://www.youtube.com/watch?v=' + v.id)}&format=json`;
  let status = 0, title = '';
  try {
    const r = await fetch(url);
    status = r.status;
    if (r.ok) title = (await r.json()).title;
  } catch (e) { status = 'ERR ' + e.message; }
  if (status !== 200) bad++;
  console.log(`${status === 200 ? 'OK ' : 'BAD'} ${key.padEnd(14)} ${v.id}  ${status}  ${title}`);
}
console.log(bad ? `\n有 ${bad} 部影片不能播放，請換一部` : '\n全部影片都可以播放');
process.exit(bad ? 1 : 0);
