// @ts-nocheck
/**
 * validate-api-contracts.mjs — 零依赖校验 docs/api 机器可读契约。
 *
 * 对齐 docs/api/README.md「四铁律」：
 *   ① 按域分组（每域一文件，复用 _shared.json 组件）
 *   ② 每个 path 操作具备 summary + description
 *   ③ 每个 schema 字段具备 description（中文）
 *   ④ 200 响应具备 example（或 content schema 带 example）
 *      —— 例外：二进制响应（image|audio|video/*、application/octet-stream、schema.format=binary）
 *         不适用 JSON example，予以豁免；仅当「响应无 application/json 且全部媒体类型均为二进制」才豁免。
 * 另：相对 $ref 必须可解析（./_shared.json#/... 与 #/...）。
 *
 * 退出码 1 = 存在违规；0 = 通过。
 * 用法：node scripts/validate-api-contracts.mjs
 */
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const API_DIR = resolve(dirname(__dirname), 'docs/api');
const SHARED_NAME = '_shared.json';
const HTTP_METHODS = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'];

const errors = [];
const warnings = [];
const err = (f, m) => errors.push(`[${f}] ${m}`);
const warn = (f, m) => warnings.push(`[${f}] ${m}`);

function loadJson(p) {
  return JSON.parse(readFileSync(p, 'utf-8'));
}

/** 与 gen-api-types.mjs 同逻辑合并 _shared.components，用于解析 #/ 引用 */
function mergeShared(domain, shared) {
  const c = domain.components || {};
  const sc = shared.components || {};
  const out = { ...c };
  for (const kind of [
    'schemas',
    'responses',
    'parameters',
    'securitySchemes',
    'requestBodies',
    'headers',
  ]) {
    if (sc[kind]) out[kind] = { ...sc[kind], ...(c[kind] || {}) };
  }
  return out;
}

function collectRefs(node, acc = []) {
  if (Array.isArray(node)) return node.reduce((a, n) => collectRefs(n, a), acc);
  if (node && typeof node === 'object') {
    if (typeof node.$ref === 'string') acc.push(node.$ref);
    for (const v of Object.values(node)) collectRefs(v, acc);
  }
  return acc;
}

const siblingCache = new Map();
function loadSibling(name) {
  if (!siblingCache.has(name)) {
    const p = resolve(API_DIR, name);
    siblingCache.set(name, loadJson(p));
  }
  return siblingCache.get(name);
}

function resolveWithin(doc, pointer) {
  let cur = doc;
  for (const seg of pointer.split('/')) cur = cur?.[seg];
  return cur !== undefined;
}

function resolveRef(ref, mergedDoc, shared) {
  if (ref.startsWith('./_shared.json#/')) {
    const pointer = ref.slice('./_shared.json#/'.length);
    return resolveWithin(shared, pointer);
  }
  // 跨文件引用兄弟域：./alarm.openapi.json#/components/...（openapiTS 原生支持）
  const sib = ref.match(/^\.\/([^/]+\.openapi\.json)#\//);
  if (sib) {
    const pointer = ref.slice(sib[0].length);
    const sdoc = loadSibling(sib[1]);
    const doc = { ...sdoc, components: mergeShared(sdoc, shared) };
    return resolveWithin(doc, pointer);
  }
  if (ref.startsWith('#/')) {
    return resolveWithin(mergedDoc, ref.slice(2));
  }
  if (ref.startsWith('./')) return false; // 其它相对引用不支持
  return true; // 外部/URL 不在此校验
}

/**
 * 是否为「纯二进制」响应内容。
 *
 * 快照 JPEG / 附件 / 文件导出这类端点的响应体本就不是 JSON，不存在可内联的 JSON example，
 * 不应被铁律 ④ 误判。判定刻意写窄：必须【没有 application/json】且【每个媒体类型都是二进制】，
 * 以免放过真正漏写 example 的 JSON 端点。
 */
function isBinaryOnlyContent(content) {
  const entries = Object.entries(content || {});
  if (entries.length === 0 || content['application/json']) return false;
  return entries.every(
    ([media, c]) =>
      /^(image|audio|video)\//.test(media) ||
      media === 'application/octet-stream' ||
      c?.schema?.format === 'binary',
  );
}

function hasExample(resp) {
  if (!resp) return false;
  if (!resp.content) return true; // 无响应体（如 204 No Content）无需 example
  if (isBinaryOnlyContent(resp.content)) return true; // 二进制响应不适用 JSON example
  const ct = resp.content['application/json'] || Object.values(resp.content)[0];
  if (!ct) return false;
  if (ct.example !== undefined || ct.examples !== undefined) return true;
  if (ct.schema?.example !== undefined || ct.schema?.examples !== undefined) return true;
  return false;
}

function validate(file, domain, shared) {
  if (!domain.openapi) err(file, '缺少 openapi 版本字段');
  if (!domain.info?.title) err(file, '缺少 info.title');
  const paths = domain.paths;
  if (!paths || typeof paths !== 'object') {
    err(file, '缺少 paths');
    return;
  }

  // 合并 _shared 后用于解析 #/components/... 引用
  const mergedDoc = { ...domain, components: mergeShared(domain, shared) };

  for (const ref of [...new Set(collectRefs(domain))]) {
    if (!resolveRef(ref, mergedDoc, shared)) err(file, `无法解析 $ref: ${ref}`);
  }

  for (const [p, item] of Object.entries(paths)) {
    if (!item || typeof item !== 'object') continue;
    for (const m of HTTP_METHODS) {
      const op = item[m];
      if (!op || typeof op !== 'object') continue;
      const tag = `${p} ${m.toUpperCase()}`;
      if (!op.summary || !String(op.summary).trim()) err(file, `${tag} 缺少 summary`);
      if (!op.description || !String(op.description).trim()) err(file, `${tag} 缺少 description`);
      const okResp =
        op.responses?.['200'] ||
        Object.entries(op.responses || {}).find(([k]) => /^2\d\d$/.test(k))?.[1];
      if (!okResp) {
        warn(file, `${tag} 无 2xx 响应`);
        continue;
      }
      if (!hasExample(okResp)) err(file, `${tag} 成功响应缺少 example`);
    }
  }

  const schemas = domain.components?.schemas || {};
  for (const [sname, schema] of Object.entries(schemas)) {
    if (!schema || typeof schema !== 'object') continue;
    const props = schema.properties || {};
    for (const [prop, pdef] of Object.entries(props)) {
      if (!pdef || typeof pdef !== 'object') continue;
      // 引用类型允许无自有 description（语义在目标 schema）
      if (pdef.$ref && !pdef.description) continue;
      if (!pdef.description || !String(pdef.description).trim())
        err(file, `schema ${sname}.${prop} 缺少 description`);
    }
  }
}

const shared = loadJson(resolve(API_DIR, SHARED_NAME));
const files = readdirSync(API_DIR)
  .filter((f) => f.endsWith('.openapi.json') && f !== SHARED_NAME)
  .sort();

for (const f of files) {
  try {
    validate(f, loadJson(resolve(API_DIR, f)), shared);
  } catch (e) {
    err(f, `校验异常: ${e.message}`);
  }
}

if (warnings.length) {
  console.log('⚠ 警告:');
  warnings.forEach((w) => console.log('  ' + w));
}
if (errors.length) {
  console.log(`\n✗ 契约校验失败（${errors.length} 处违规）:`);
  errors.forEach((e) => console.log('  ' + e));
  process.exit(1);
}
console.log(`✓ 契约校验通过：${files.length} 个域文件均符合四铁律`);
process.exit(0);
