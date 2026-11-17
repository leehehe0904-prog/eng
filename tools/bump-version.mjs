// 更新 index.html 裡所有檔案的版本號（?v=時間），讓瀏覽器一定會下載最新版，不會卡在舊的快取
// 用法：node tools/bump-version.mjs（git commit 前會自動執行）
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = path.join(root, 'index.html');
const d = new Date(), p = n => String(n).padStart(2, '0');
const v = `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;

let html = fs.readFileSync(file, 'utf8');
// 本網站自己的 .js / .css（不含外部網址）
html = html.replace(/((?:src|href)=")(?!https?:)([^"?]+\.(?:js|css))(?:\?v=[^"]*)?"/g, `$1$2?v=${v}"`);
// 給 app.js 動態載入的檔案（例如 schools.js）使用
html = html.replace(/window\.ASSET_V = '[^']*'/, `window.ASSET_V = '${v}'`);
fs.writeFileSync(file, html);
console.log('版本號更新為', v);
