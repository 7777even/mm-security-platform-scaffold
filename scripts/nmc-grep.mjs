// 临时探针：从 HTML 中提取指定正则匹配（命令行转义不友好时使用）
// 用法：node scripts/nmc-grep.mjs <file> <regex> [limit]
import fs from 'node:fs';

const [, , file, pattern, limitArg] = process.argv;
const s = fs.readFileSync(file, 'utf8');
const re = new RegExp(pattern, 'gi');
const out = [];
let m;
while ((m = re.exec(s)) && out.length < (Number(limitArg) || 12)) {
  out.push(m[0].replace(/\s+/g, ' ').slice(0, 160));
}
console.log(out.join('\n') || '(no match)');
