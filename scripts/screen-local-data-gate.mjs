// 大屏端「零本地业务数据」门禁（白名单强校验 + 回归守卫）。
//
// 设计原则：
// - 大屏端 (src/screen) 的**业务数据必须来自 @/services**，不得值引用本地 lib/data 的业务常量。
// - 但并非所有 lib/data 内容都是「业务数据」：几何/路线/地图控件/表单字段定义/DTO→视图适配器/
//   演练仿真/DEV 回落解析器/导航配置等属「按设计保留本地」，已逐条 review 后登记进白名单。
// - 门禁对白名单**之外**的任何 lib/data「值导入」直接判失败 —— 新出现的本地业务数据会被拦下。
//   修复方式二选一：(a) 改接 @/services；(b) 确认其确为 by-design 后登记进 BY_DESIGN_VALUE_IMPORTS。
// - `import type { ... }` 一律放行（类型不承载业务数据）。
//
// 用法：node scripts/screen-local-data-gate.mjs
// 退出码：0 = 通过；1 = 存在白名单外的值导入或回归守卫命中。

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREEN = path.resolve(__dirname, '../src/screen');

// ── 1) 按设计保留本地的值导入白名单（module -> [identifier]）────────────────────
// 每一条都代表「此处本地引用经 review 判定为 by-design」。新增条目须说明理由。
const BY_DESIGN_VALUE_IMPORTS = {
  // 事故救援：面板 UI 结构（tabs/字段/toolbar/控件）+ 地图几何路线 + DEV 回落解析器
  accidentRescueMock: [
    'accidentArrivalFields',
    'accidentInfoFields',
    'accidentInfoTabs',
    'accidentReportFields',
    'accidentRescueMapControls',
    'accidentRescueMapMarkers',
    'accidentRescueRouteWaypoints',
    'bottomToolbarItems',
    'emergencyCommandInstructionTabs',
    'emergencyCommandPhaseFilterOptions',
    'emergencyCommandStatusFilterOptions',
    'emergencyPlanLevels',
    'eventCommandDetailTabs',
    'eventCommandDispatchFields',
    'eventCommandDynamicsTabs',
    'eventCommandToolbarItems',
    'guidanceSteps',
    'resolveAccidentRescueIncident', // DEV 回落解析器（仅未配置 VITE_API_BASE 时用）
  ],
  // 告警详情：各域后端 DTO → 统一视图模型的适配器（by-design）
  alarmDetailMock: [
    'facilityAlarmToDetail',
    'fireAlarmToDetail',
    'fireListItemToDetail',
    'patrolAlarmToDetail',
    'perimeterAlarmToDetail',
    'productionAlarmToDetail',
  ],
  // 告警状态展示元数据（by-design UI，含主题色 token；业务下拉选项已迁后端字典）
  alarmMeta: ['ALARM_STATUS_META'],
  // 演练仿真内容（by-design，非真实业务数据）
  drillRescueMock: [
    'drillAwarenessDynamics',
    'drillBriefDynamics',
    'drillDispatchFields',
    'drillDynamics',
    'drillGuidanceSteps',
    'drillIncidentDetailTabs',
    'drillResponseFields',
    'drillVideoFields',
    'resolveDrillRescueIncident', // DEV 回落解析器
  ],
  // 疏散人员：沿路线按进度取点的几何工具（by-design）
  evacuationPeopleMock: ['pickPointAlongRoute'],
  fireEmergencyMock: ['fireEmergencyMapControls'],
  // 消防页地图固定标记与地图控件（几何/UI）
  mock: ['fireAlarmMarker', 'mapControls'],
  nav: ['navItems'],
  nodeConfigData: ['ALL_NODE_IDS', 'CAMERA_ANCHOR_METADATA'],
  // 厂区几何（边界环/定位/区域码解析）
  plantAreas: [
    'getPlantAreaDefinition',
    'plantAreaBoundaryRings',
    'plantAreaDefinitions',
    'resolvePlantAreaCode',
    'resolvePlantAreaWorldPosition',
  ],
  preliminaryMock: ['preliminaryMapControls'],
  // 救援地图坐标派生（几何）
  rescueMapCoords: ['coordsForFireBrigadeTeam', 'coordsForPagedSpread', 'coordsForSquadronPaged'],
  // 工业电视：静态几何/演示撒点（业务数据已迁 @/services/tv）
  tvMock: ['tvAlarmMarker', 'tvInspectionScanPointsByCircle', 'tvMapControls', 'tvVideoMapPoints'],
  typhoonEmergencyMock: ['resolveTyphoonEmergencyIncidentV2'], // DEV 回落解析器
};

const ALLOWED = new Set();
for (const [mod, ids] of Object.entries(BY_DESIGN_VALUE_IMPORTS)) {
  for (const id of ids) ALLOWED.add(`${mod}#${id}`);
}

// ── 2) 回归守卫：已后端化组件不得再值引用本地业务常量 ──────────────────────────
// 每条 {file: 相对 SCREEN 的路径, forbidden: [正则（命中即失败）]}。
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
  {
    file: 'components/panels/DutyInfoPanel.vue',
    // 原为「后端不可用时的本地兜底展示」，现严格空态（走 /emergency/duty ⇄ fetchDutyRoster）。
    forbidden: [/\bdutyPersons\b/],
  },
];

// ── 扫描 ─────────────────────────────────────────────────────────────────────
function walk(dir, acc) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
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

const VALUE_IMPORT_RE =
  /import\s+(type\s+)?([^;]+?)\s+from\s+['"]([^'"]*lib\/data\/[A-Za-z0-9_.]+)['"]/gs;

function parseValueImports(src) {
  const out = [];
  let m;
  VALUE_IMPORT_RE.lastIndex = 0;
  while ((m = VALUE_IMPORT_RE.exec(src))) {
    if (m[1]) continue; // `import type` 整体放行
    const clause = m[2];
    const mod = m[3]
      .split('/')
      .pop()
      .replace(/\.ts$/, '');
    const brace = clause.match(/\{([\s\S]*)\}/);
    if (!brace) continue;
    for (let it of brace[1].split(',')) {
      it = it.trim();
      if (!it || /^type\b/.test(it)) continue; // 内联 type 成员放行
      const id = it.replace(/\s+as\s+.*$/, '').trim();
      out.push({ mod, id });
    }
  }
  return out;
}

let failed = false;

// 回归守卫
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

// 白名单强校验
const files = [];
walk(SCREEN, files);
const audit = new Map(); // mod -> Set(file)
const unallowed = [];
for (const fp of files) {
  const src = fs.readFileSync(fp, 'utf8');
  const rel = path.relative(SCREEN, fp).split(path.sep).join('/');
  for (const { mod, id } of parseValueImports(src)) {
    if (!audit.has(mod)) audit.set(mod, new Set());
    audit.get(mod).add(rel);
    if (!ALLOWED.has(`${mod}#${id}`)) unallowed.push({ rel, mod, id });
  }
}

if (unallowed.length) {
  failed = true;
  console.error('\n✗ 白名单外的 lib/data 值导入（疑似新增本地业务数据）：');
  for (const u of unallowed) {
    console.error(`    ${u.rel}  ←  ${u.mod}#${u.id}`);
  }
  console.error('  → 请改接 @/services；若确为 by-design，请在 BY_DESIGN_VALUE_IMPORTS 登记并注明理由。');
}

console.log('\n=== 大屏 lib/data 值引用审计（白名单已 review）===');
const rows = [...audit.entries()].sort((a, b) => b[1].size - a[1].size);
if (rows.length === 0) console.log('  （无）');
for (const [mod, set] of rows) {
  console.log(`  ${mod.padEnd(26)} 值导入×${set.size}`);
}

console.log('\n=== 门禁结果 ===');
if (failed) {
  console.error('FAIL — 大屏端出现白名单外的本地业务数据引用或回归命中，见上。');
  process.exit(1);
} else {
  console.log('PASS — 白名单外的本地业务数据零引用；回归守卫全部通过。');
  process.exit(0);
}
