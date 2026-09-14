// 子应用产物「悬空资产引用」门禁。
//
// 背景：wujie 子应用经 `npm run build:subapps` 预打成 IIFE 落到 `subapps/<name>/dist`
// （该目录 gitignore 不入库；dev 与生产都直接托管它，而主壳 `npm run build` **不**构建子应用）。
// 于是只要改了 `public/design`、`public/images` 或 `src/utils/designAssets.ts` 却没重建子应用，
// 已构建的 bundle 仍会引用**已删除 / 改名**的资源（典型：PNG→WebP 转换后仍请求 .png），
// 表现为「大屏整页图全裂」且后端无任何报错——静态资源与后端无关，接口日志查不出问题。
//
// 判据（高精度，零误报）：
//   1) 绝对路径 `/…`（项目资源）→ 解码后必须存在于 public/；
//   2) 裸引用（设计资源后缀，运行时由 designImg(前缀+后缀) 拼接）→ 若 public/ 下存在
//      「同 stem、不同扩展名」的资产，则判为扩展名漂移（本次故障的精确签名）。
//   其余裸引用（库内部相对路径 Images/…、http(s) 外链、数据里的文件名字符串如「现场拍照.jpg」）自动跳过。
//
// 用法：node scripts/check-subapp-assets.mjs [扫描目录，默认 subapps]
//   前置：先跑 `npm run build:subapps` 确保产物最新（CI 中由同一 job 先构建再校验）。
// 退出码：0 = 通过（或未发现可校验产物）；1 = 存在悬空引用。

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const SCAN_ROOT = process.argv[2] ? path.resolve(process.argv[2]) : path.join(ROOT, 'subapps');

const EXTS = ['webp', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'bmp', 'avif', 'ico'];
// 引用提取：单/双/反引号包裹、以已知图片扩展名结尾的字符串（可带 ?query / #hash）。
const REF_RE = new RegExp(
  `["'\`]([^"'\`\\r\\n]{1,240}?\\.(?:${EXTS.join('|')})(?:[?#][^"'\`\\r\\n]*)?)["'\`]`,
  'gi',
);

// 设计资源路径经 encodeURIComponent 拼进样式表/代码，故先解码再解析；剥离 ?query/#hash。
const decodeRef = (ref) => {
  try {
    return decodeURIComponent(ref);
  } catch {
    return ref;
  }
};
const cleanRef = (ref) => decodeRef(ref).split(/[?#]/)[0];

const extWithDot = (ref) => {
  const base = cleanRef(ref);
  const idx = base.lastIndexOf('.');
  return idx >= 0 ? base.slice(idx) : '';
};
const extOf = (ref) => extWithDot(ref).toLowerCase();
const stemOf = (ref) => {
  const base = cleanRef(ref);
  return base.slice(0, base.length - extWithDot(ref).length);
};

// ── 收集 public 下的项目资产 basename（design + images + 顶层）──────────────────
const projectBasenames = [];
for (const sub of ['design', 'images', '']) {
  const dir = sub ? path.join(PUBLIC, sub) : PUBLIC;
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir)) {
    if (fs.statSync(path.join(dir, f)).isFile()) projectBasenames.push(f);
  }
}

const existsInPublic = (ref) => {
  const rel = cleanRef(ref).replace(/^\/+/, '');
  return rel !== '' && fs.existsSync(path.join(PUBLIC, rel));
};

// 设计资源后缀真源：src/utils/designAssets.ts 中所有以图片扩展名结尾的字符串字面量。
// 用于区分「已删除的设计资源」与「数据里的文件名字符串」（如 mobile 端 现场拍照.jpg）。
const designSuffixes = new Set();
const DA_FILE = path.join(ROOT, 'src', 'utils', 'designAssets.ts');
if (fs.existsSync(DA_FILE)) {
  const da = fs.readFileSync(DA_FILE, 'utf8');
  const daRe = new RegExp(`["'\`]([^"'\`\\r\\n]+?\\.(?:${EXTS.join('|')}))["'\`]`, 'gi');
  let dm;
  while ((dm = daRe.exec(da))) designSuffixes.add(dm[1]);
}
const isKnownDesignSuffix = (ref) => designSuffixes.has(cleanRef(ref)) || designSuffixes.has(ref);

/** 扩展名漂移：存在同 stem、但扩展名不同的项目资产（如引 .png、实存 .webp）。 */
const matchesStemDrift = (ref) => {
  const stem = stemOf(ref);
  const wantExt = extOf(ref);
  if (!stem) return false;
  return projectBasenames.some((b) => {
    const be = extWithDot(b).toLowerCase();
    if (!be || be === wantExt) return false;
    return b.slice(0, b.length - be.length).endsWith(stem);
  });
};

// ── 遍历已构建产物 ─────────────────────────────────────────────────────────────
function collectArtifacts(root) {
  const out = [];
  if (!fs.existsSync(root)) return out;
  for (const name of fs.readdirSync(root)) {
    const distDir = path.join(root, name, 'dist');
    if (!fs.existsSync(distDir) || !fs.statSync(distDir).isDirectory()) continue;
    for (const f of fs.readdirSync(distDir)) {
      if (!/\.(js|css|html)$/i.test(f)) continue;
      const fp = path.join(distDir, f);
      if (fs.statSync(fp).isFile()) out.push({ name, file: f, fp });
    }
  }
  return out;
}

const artifacts = collectArtifacts(SCAN_ROOT);
const seen = new Set();
const dangling = [];
const stats = { refs: 0, checked: 0, skipped: 0 };

for (const { name, file, fp } of artifacts) {
  const src = fs.readFileSync(fp, 'utf8');
  let m;
  REF_RE.lastIndex = 0;
  while ((m = REF_RE.exec(src))) {
    const ref = m[1];
    stats.refs += 1;

    // 跳过：外链、模板占位。
    if (/:\/\//.test(ref) || ref.includes('${')) {
      stats.skipped += 1;
      continue;
    }

    if (ref.startsWith('/')) {
      // 绝对路径 = 项目资源，必须存在。
      stats.checked += 1;
      if (existsInPublic(ref)) continue;
      const key = `${name}/${file}::${ref}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const reason = matchesStemDrift(ref)
        ? '扩展名漂移（public 下有同 stem、不同后缀的资产）'
        : '文件不存在';
      dangling.push({ name, file, ref, reason });
      continue;
    }

    // 裸引用且带 `/` = 库内部相对路径（Cesium: Images/…、Assets/… 等），跳过。
    if (ref.includes('/')) {
      stats.skipped += 1;
      continue;
    }

    // 裸后缀（设计资源，运行时由 designImg(前缀+后缀) 拼接）：
    //   ① 精确命中 public/ 任意前缀 → OK；
    //   ② 同 stem 扩展名漂移 → 悬空（本次 PNG→WebP 故障签名）；
    //   ③ 是 designAssets.ts 的已知设计后缀却不存在 → 悬空（设计资源被删）；
    //   ④ 其余裸引用（库内部 ASCII 资源 / 数据里的文件名字符串）跳过。
    const bareRef = cleanRef(ref);
    if (projectBasenames.some((b) => b.endsWith(bareRef))) {
      stats.checked += 1;
      continue;
    }
    if (matchesStemDrift(ref)) {
      stats.checked += 1;
      const key = `${name}/${file}::${ref}`;
      if (seen.has(key)) continue;
      seen.add(key);
      dangling.push({
        name,
        file,
        ref,
        reason: '扩展名漂移（public 下有同 stem、不同后缀的资产）',
      });
      continue;
    }
    if (isKnownDesignSuffix(ref)) {
      stats.checked += 1;
      const key = `${name}/${file}::${ref}`;
      if (seen.has(key)) continue;
      seen.add(key);
      dangling.push({
        name,
        file,
        ref,
        reason: '设计资源文件不存在（designAssets.ts 有此后缀，public/ 缺失）',
      });
      continue;
    }
    stats.skipped += 1;
  }
}

console.log('=== 子应用产物悬空资产引用门禁 ===');
console.log(`  扫描目录：${path.relative(ROOT, SCAN_ROOT).split(path.sep).join('/') || '.'}`);
console.log(
  `  子应用产物：${artifacts.length} 个文件（${[...new Set(artifacts.map((a) => a.name))].length} 个子应用）`,
);
console.log(`  引用：共 ${stats.refs} 处 → 校验 ${stats.checked} / 跳过 ${stats.skipped}`);

if (artifacts.length === 0) {
  console.log('\n⚠️  未发现已构建的子应用产物（subapps/<name>/dist）。');
  console.log('   → 请先 `npm run build:subapps`；本门禁在无产物时不代表通过。');
  console.log('\nPASS（跳过：无可校验产物）');
  process.exit(0);
}

if (dangling.length) {
  console.error('\n✗ 检测到悬空资产引用（构建产物引用了 public/ 下不存在的资源）：');
  for (const d of dangling) {
    console.error(`    [${d.name}/${d.file}] ${d.ref}  —— ${d.reason}`);
  }
  console.error(
    '  → 典型原因：改了 public/design|images 或 src/utils/designAssets.ts 后**忘了重建子应用**。',
  );
  console.error('  → 修复：`SUBAPP_NO_EMPTY=1 npm run build:subapps`，再跑本门禁复验。');
  console.error('\nFAIL — 存在悬空引用，大屏大概率整页图裂。');
  process.exit(1);
}

console.log('\nPASS — 子应用产物引用的项目资产全部可解析。');
process.exit(0);
