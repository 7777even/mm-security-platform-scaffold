#!/usr/bin/env node
/**
 * 新增文件测试覆盖守门：新增的业务逻辑文件必须被某个 *.spec.ts 引用。
 *
 * 背景（为什么需要它）：
 *   `vite.config.ts` 的覆盖率门禁是 `coverage.all: false` + `include` 白名单——
 *   **没被任何测试加载的文件根本不插桩**。因此「新增一个零测试的 src/services/xxx.ts」
 *   不会拉低覆盖率、门禁照样绿。覆盖率门禁只防存量回退，不防新增代码零测试。
 *   `all: true` 会因全量插桩 OOM（配置注释已说明），故无法简单翻开关——
 *   改用本脚本对**新增文件**做增量校验。
 *
 * 规则：
 *   对本次新增（git diff --diff-filter=A）的下列文件：
 *     - `src/services/` 下的 .ts
 *     - `src/composables/` 下的 .ts
 *     - `apps/<端>/data/` 下的 .ts
 *     - `apps/<端>/composables/` 下的 .ts
 *   （排除 .spec.ts / .d.ts / index.ts / __mocks__）
 *   要求存在至少一个 `*.spec.ts` 引用它（按「目录/文件名」匹配 import 路径，
 *   兼容 `@/services/task` 别名与 `../services/task` 相对路径）。
 *   确实不需要测试的，进 ALLOWLIST 并写明理由。
 *
 * 用法：
 *   node scripts/check-spec-coverage.mjs                    # 默认 HEAD~1..HEAD
 *   node scripts/check-spec-coverage.mjs --base <ref>       # 指定基线
 *   node scripts/check-spec-coverage.mjs --report           # 只打印，不判失败
 *
 * 已知限制（有意为之）：只查**最近一次提交**新增的文件（CI checkout 为 fetch-depth: 2，
 * 仓库 .git 约 157MB，不做全历史 clone）。多提交推送只覆盖最后一个提交——
 * 宁可漏检，不要误报。
 *
 * 退出码：违规时 1，否则 0。
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

/** 需要被测试覆盖的新增文件模式 */
const TARGET_PATTERNS = [
  /^src\/services\/.*\.ts$/,
  /^src\/composables\/.*\.ts$/,
  /^apps\/[^/]+\/data\/.*\.ts$/,
  /^apps\/[^/]+\/composables\/.*\.ts$/,
];

/** 目标模式内仍需排除的（非业务逻辑） */
const EXCLUDE_PATTERNS = [/\.spec\.ts$/, /\.d\.ts$/, /(^|\/)index\.ts$/, /(^|\/)__mocks__\//];

/**
 * 显式豁免名单。**每条必须写理由**。
 * 键为仓库相对路径。
 */
const ALLOWLIST = new Map([
  // 目前为空——新增业务逻辑文件默认都应有测试。
  // 例：['src/services/legacy-xxx.ts', '纯类型再导出，无运行时逻辑'],
]);

function git(args) {
  return execFileSync('git', args, { cwd: REPO_ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

function listAddedFiles(range) {
  const out = git(['diff', '--name-only', '--diff-filter=A', range]);
  return out.split('\n').map((s) => s.trim()).filter(Boolean);
}

/** 收集所有 spec 里 import / require / import() 的说明符，按「解析后的模块路径」判定引用关系 */
function collectSpecImports() {
  const out = git(['ls-files', '*.spec.ts', '*.spec.tsx']);
  const files = out.split('\n').map((s) => s.trim()).filter(Boolean);
  const refs = new Map(); // 解析后的模块路径 -> 引用它的 spec 文件（取首个即可）
  let specCount = 0;

  for (const specFile of files) {
    const abs = path.join(REPO_ROOT, specFile);
    if (!fs.existsSync(abs)) continue;
    specCount++;
    const text = fs.readFileSync(abs, 'utf8');

    // from '...' / require('...') / import('...')
    const specRe = /(?:\bfrom\s*|\brequire\s*\(\s*|\bimport\s*\(\s*)['"]([^'"]+)['"]/g;
    let m;
    while ((m = specRe.exec(text)) !== null) {
      const resolved = resolveSpecifier(specFile, m[1]);
      if (!resolved) continue;
      if (!refs.has(resolved)) refs.set(resolved, specFile);
    }
  }
  return { refs, specCount };
}

/** 把 import 说明符解析成「仓库相对、无扩展名」的模块路径；非本地模块返回 null */
function resolveSpecifier(specFile, spec) {
  let p;
  if (spec.startsWith('@/')) {
    p = path.posix.join('src', spec.slice(2)); // alias: "@/*" -> "src/*"（见 tsconfig.app.json）
  } else if (spec.startsWith('.')) {
    p = path.posix.join(path.posix.dirname(specFile), spec);
  } else {
    return null; // 第三方包 / 绝对 URL
  }
  return normalizeModulePath(p);
}

/** 归一化：去扩展名、去结尾 /index */
function normalizeModulePath(p) {
  return p.replace(/\\/g, '/').replace(/\.(ts|tsx|vue|js|mjs|json)$/, '').replace(/\/index$/, '');
}

function main() {
  const argv = process.argv.slice(2);
  const reportOnly = argv.includes('--report');
  const baseIdx = argv.indexOf('--base');
  const base = baseIdx >= 0 && argv[baseIdx + 1] ? argv[baseIdx + 1] : 'HEAD~1';
  // 允许直接传完整 range（如 `A^..A`），便于对历史提交复现；否则视为基线 ref
  const range = base.includes('..') ? base : `${base}..HEAD`;

  let added;
  try {
    added = listAddedFiles(range);
  } catch (e) {
    console.warn(
      `[spec-coverage] ⚠️ 无法计算 ${range} 的差异（浅克隆 / 无父提交 / 基线不存在）：` +
        `${String(e.message || e).split('\n')[0]}`
    );
    console.warn('[spec-coverage] 本次跳过检查（**非通过**——请确保 CI checkout 使用 fetch-depth: 2）。');
    process.exit(0);
  }

  const targets = added.filter(
    (f) => TARGET_PATTERNS.some((re) => re.test(f)) && !EXCLUDE_PATTERNS.some((re) => re.test(f))
  );

  const { refs, specCount } = collectSpecImports();

  const violations = [];
  const rows = [];

  for (const f of targets) {
    const allowed = ALLOWLIST.has(f);
    const by = refs.get(normalizeModulePath(f)) || null;
    const referenced = Boolean(by);
    rows.push({ file: f, referenced, allowed, by });
    if (!referenced && !allowed) {
      violations.push(
        `${f} —— 新增业务逻辑文件，但没有任何 *.spec.ts 引用它。\n` +
          `      为什么会被拦：覆盖率门禁是 coverage.all:false + 白名单，未被测试加载的文件不插桩，\n` +
          `      所以「零测试的新文件」不会拉低覆盖率、能静默通过。\n` +
          `      修法：为该文件补一个 ${path.basename(f).replace(/\.ts$/, '.spec.ts')}（或让既有 spec 用 import 引用它）；\n` +
          `      确不需要测试的，在本脚本 ALLOWLIST 登记并写明理由。`
      );
    }
  }

  if (reportOnly) {
    // 分隔符用全角空格（\u3000），写成转义而非字面量，避免触发 no-irregular-whitespace
    console.log(`基线：${range}\u3000新增文件 ${added.length} 个，命中目标模式 ${targets.length} 个。`);
    console.log(`spec 文件总数：${specCount}\n`);
    for (const r of rows) {
      const mark = r.referenced ? `✓ 已引用（${r.by}）` : '✗ 未被引用';
      console.log(`  ${mark}${r.allowed ? ' [豁免]' : ''}  ${r.file}`);
    }
    console.log('');
  }

  // 豁免名单腐烂提示（不阻塞）：指向的文件已不存在
  const staleAllow = [...ALLOWLIST.keys()].filter((f) => !fs.existsSync(path.join(REPO_ROOT, f)));
  if (staleAllow.length > 0) {
    console.warn(`[spec-coverage] 告警：ALLOWLIST 有 ${staleAllow.length} 条指向不存在的文件，建议清理：`);
    for (const f of staleAllow) console.warn(`  - ${f}`);
  }

  if (violations.length > 0) {
    console.error(`[spec-coverage] 发现 ${violations.length} 个新增文件缺少测试引用：`);
    for (const v of violations) console.error('  - ' + v);
    process.exit(1);
  }

  console.log(
    `[spec-coverage] OK：本次新增目标文件 ${targets.length} 个（检出 ${added.length} 个新增）` +
      `均已具备测试引用或已登记豁免。`
  );
}

main();
