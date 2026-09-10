// 大屏端「零本地业务数据」门禁（聚焦回归守卫 + 透明审计）。
//
// 设计原则：
// - 不误杀「按设计保留本地」的常量（几何/路线/地图控件/表单字段定义/DTO 适配器/演示模式），
//   这些仍是合法的 src/screen/lib/data 内容。
// - 只硬性拦截「已后端化的 3 处」回归：它们曾经从 lib/data 直读业务常量，现已改走 @/services。
//   一旦组件又回退到本地业务常量，门禁失败，防 CI 回归。
// - 其余 lib/data 值引用仅做上报（exit 0），暴露「全量零本地数据」的后续清单，不阻断构建。
//
// 用法：node scripts/screen-local-data-gate.mjs
// 退出码：0 = 通过（或仅有上报项）；1 = 回归守卫命中。

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREEN = path.resolve(__dirname, '../src/screen');

// 1) 回归守卫：已后端化组件不得再值引用本地业务常量。
//    每条 {file: 相对 SCREEN 的路径, forbidden: [正则（命中即失败）]}。
const REGRESSION_GUARDS = [
  {
    file: 'components/common/AlarmDetailPanel.vue',
    forbidden: [/alarmDetailPersonnelOptions/], // 原硬编码 5 人名，现走 /emergency/dispatch-personnel
  },
  {
    file: 'components/video-wall/VideoLinkageConfigDialog.vue',
    forbidden: [
      /\bmonitorNameOptions\b/,
      /\bpresetPointOptions\b/,
      /\bbusinessObjectCategoryOptions\b/,
      /\bbusinessObjectOptions\b/,
    ], // 现走 /video/linkage-options
  },
  {
    file: 'lib/composables/usePatrolLinkage.ts',
    forbidden: [/patrolLinkagePointsForZone/, /from\s+['"][^'"]*patrolLinkageMock['"]/], // 现复用 /security/patrol-cameras
  },
];

// 2) 透明审计：扫描 src/screen（排除 lib/data 自身）对 lib/data 的「值导入」。
//    区分 import type（合法）与值导入（上报）。
function walk(dir, acc) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'lib' && e.isDirectory() && dir.endsWith('screen')) {
      // 不排除 lib，只排除 lib/data 自身；下面按路径过滤
    }
    const fp = path.join(dir, e.name);
    if (e.isDirectory()) {
      walk(fp, acc);
      continue;
    }
    if (!/\.(vue|ts)$/.test(e.name) || e.name.endsWith('.spec.ts')) continue;
    if (fp.includes(path.sep + 'lib' + path.sep + 'data' + path.sep)) continue; // 排除数据模块自身
    acc.push(fp);
  }
}

function findLibDataImports(src) {
  // 匹配 from '.../lib/data/X' （相对或 @ 别名），返回 {module, isType, raw}
  const re = /import\s+(type\s+)?([^;]+?)\s+from\s+['"]([^'"]*lib\/data\/[A-Za-z0-9_]+)['"]/g;
  const out = [];
  let m;
  while ((m = re.exec(src))) {
    out.push({ isType: m[1] === 'type', module: m[3], raw: m[0] });
  }
  return out;
}

let failed = false;
const audit = new Map(); // module -> {value:Set<file>, type:Set<file>}

// 回归守卫检查
for (const guard of REGRESSION_GUARDS) {
  const fp = path.join(SCREEN, guard.file);
  if (!fs.existsSync(fp)) continue;
  const src = fs.readFileSync(fp, 'utf8');
  for (const re of guard.forbidden) {
    if (re.test(src)) {
      failed = true;
      console.error(`✗ 回归命中 [${guard.file}] 仍含禁用本地业务常量：/${re.source}/`);
    }
  }
}

// 透明审计
const files = [];
walk(SCREEN, files);
for (const fp of files) {
  const src = fs.readFileSync(fp, 'utf8');
  for (const imp of findLibDataImports(src)) {
    const mod = imp.module.split('/').pop();
    if (!audit.has(mod)) audit.set(mod, { value: new Set(), type: new Set() });
    const rel = path.relative(SCREEN, fp).split(path.sep).join('/');
    if (imp.isType) audit.get(mod).type.add(rel);
    else audit.get(mod).value.add(rel);
  }
}

// 输出
console.log('\n=== 大屏 lib/data 值引用审计（透明，不阻断）===');
const rows = [...audit.entries()].sort((a, b) => b[1].value.size - a[1].value.size);
if (rows.length === 0) console.log('  （无）');
for (const [mod, v] of rows) {
  const tag = v.value.size ? `值导入×${v.value.size}` : `类型×${v.type.size}`;
  console.log(`  ${mod.padEnd(26)} ${tag}`);
}

console.log('\n=== 回归守卫 ===');
if (failed) {
  console.error('结果：FAIL — 已后端化的组件回退到了本地业务常量，请改回 @/services 调用。');
  process.exit(1);
} else {
  console.log('结果：PASS — 3 处已后端化组件均无本地业务常量回归。');
  process.exit(0);
}
