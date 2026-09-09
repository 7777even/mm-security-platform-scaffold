// @ts-nocheck
/**
 * gen-api-types.mjs — 把 docs/api/*.openapi.json 机器可读契约
 * 生成为 TypeScript 类型，落到 src/types/generated/。
 *
 * 设计要点（对齐 AGENTS.md §3 + docs/api/README.md「变更四同步」）：
 *  - 各域文件通过相对 $ref 复用 _shared.json 的组件（ApiResponse / PageResult /
 *    ErrorEnvelope / 安全方案 / 参数 / 标准响应）。本脚本把 _shared.components
 *    整体合并进每个域文档，并把 `./_shared.json#/components/...` 改写为内部
 *    `#/components/...` 引用，使契约自洽后再交给 openapi-typescript，避免引入
 *    redocly 等额外依赖。
 *  - 生成物为自动代码，请勿手改；改契约后重跑 `npm run gen:api-types`。
 *
 * 用法：node scripts/gen-api-types.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import openapiTS, { astToString } from 'openapi-typescript';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const API_DIR = resolve(ROOT, 'docs/api');
const OUT_DIR = resolve(ROOT, 'src/types/generated');
const SHARED_NAME = '_shared.json';

function deepClone(o) {
  return structuredClone(o);
}

/** 把 _shared.components 整体合并进域文档（域自身同名项优先） */
function mergeSharedComponents(domain, shared) {
  const c = domain.components || (domain.components = {});
  const sc = shared.components || {};
  for (const kind of ['schemas', 'responses', 'parameters', 'securitySchemes', 'requestBodies', 'headers']) {
    if (sc[kind]) {
      c[kind] = { ...sc[kind], ...(c[kind] || {}) };
    }
  }
  return domain;
}

/** 把 `./_shared.json#/components/<kind>/<name>` 改写为内部 `#/components/<kind>/<name>` */
function rewriteRefs(node) {
  if (Array.isArray(node)) return node.map(rewriteRefs);
  if (node && typeof node === 'object') {
    if (typeof node.$ref === 'string' && node.$ref.startsWith('./_shared.json#/components/')) {
      return { ...node, $ref: node.$ref.replace('./_shared.json#/components/', '#/components/') };
    }
    const out = {};
    for (const [k, v] of Object.entries(node)) out[k] = rewriteRefs(v);
    return out;
  }
  return node;
}

function loadJson(p) {
  return JSON.parse(readFileSync(p, 'utf-8'));
}

// 域名转合法 TS 命名空间标识符：accident-rescue → AccidentRescue。
// 直接用域名会产生 `import type * as Accident-rescue`，连字符不是合法标识符 → 全量 type-check 报错。
function capitalize(s) {
  const pascal = s
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
  return /^[0-9]/.test(pascal) ? `D${pascal}` : pascal;
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const shared = loadJson(resolve(API_DIR, SHARED_NAME));

  const files = readdirSync(API_DIR)
    .filter((f) => f.endsWith('.openapi.json') && f !== SHARED_NAME)
    .sort();

  const domains = [];
  for (const file of files) {
    const domainName = basename(file, '.openapi.json'); // alarm / auth / ...
    let doc = deepClone(loadJson(resolve(API_DIR, file)));
    doc = mergeSharedComponents(doc, shared);
    doc = rewriteRefs(doc);

    try {
      const nodes = await openapiTS(doc);
      const ts = astToString(nodes);
      writeFileSync(resolve(OUT_DIR, `${domainName}.ts`), ts, 'utf-8');
      domains.push(domainName);
      console.log(`  ✓ ${domainName}.ts  (${file})`);
    } catch (err) {
      console.error(`  ✗ ${domainName}.ts 生成失败：${err && err.message ? err.message : err}`);
      process.exitCode = 1;
    }
  }

  // 聚合入口：用命名空间重导出，避免各域 paths/components 同名冲突
  const indexLines = [
    '// 自动生成：scripts/gen-api-types.mjs。请勿手改。',
    "// 用法：import type { Alarm } from '@/types/generated'; 再取 Alarm.components['schemas']['AlarmItem']",
    ...domains.map((d) => `import type * as ${capitalize(d)} from './${d}';`),
    ...domains.map((d) => `export { ${capitalize(d)} };`),
    '',
  ];
  writeFileSync(resolve(OUT_DIR, 'index.ts'), indexLines.join('\n'), 'utf-8');
  console.log(`\n生成完成：${domains.length} 个域 → src/types/generated/`);
  console.log('聚合入口：src/types/generated/index.ts');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
