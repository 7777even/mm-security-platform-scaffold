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
  // 应急事件分组：本地 fixture 仅在 demo（VITE_USE_DEV_MOCK=true）回落；地图控件为几何
  fireEmergencyMock: [
    'fireEmergencyDrillEventGroups',
    'fireEmergencyEventGroups',
    'fireEmergencyMapControls',
  ],
  // 消防力量 fixture：仅 demo 回落（live/offline 均不使用）
  fireBrigadeMock: ['fireBrigadeTeams'],
  // 抓拍列表：页容量为 UI 配置常量、条目 fixture 仅 demo 回落
  entryCaptureMock: ['ENTRY_CAPTURE_PAGE_SIZE', 'entryCaptureItems'],
  // 应急流程默认值（离线兜底/演示）：仅 demo 使用
  emergencyProcessData: ['EMERGENCY_PHASES', 'RESPONSE_MODE_OPTIONS', 'mockEmergencyProcessStages'],
  // 节点处置指导默认值：仅 demo 使用
  nodeGuidanceData: ['mockDutyRoster', 'mockNodeGuidances'],
  // 消防页地图固定标记与地图控件（几何/UI）
  mock: ['fireAlarmMarker', 'mapControls'],
  nav: ['navItems'],
  // 节点配置默认值 + 锚点元数据 + 离线缓存读写（无后端演示模式兜底）
  nodeConfigData: [
    'ALL_NODE_IDS',
    'CAMERA_ANCHOR_METADATA',
    'cloneDefaultNodeConfigs',
    'loadNodeConfigs',
    'mergeNodeConfigs',
    'saveNodeConfigs',
  ],
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
  // 工业电视：静态地图控件/告警钉 + 巡检扫描几何 + 详情 DEV 回落解析器（仅 demo 用）。
  // tvVideoMapPoints（本地撒点）已删除：TvMap 改为三态取数（/tv/map-points），不再本地兜底。
  tvMock: [
    'resolveTvVideoMonitorDetail',
    'tvAlarmMarker',
    'tvInspectionScanPointsByCircle',
    'tvMapControls',
  ],
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
  {
    file: 'lib/composables/useFireBrigadeView.ts',
    // 原「初始态预填本地 fixture / 结构异常保留本地 fixture」，现三态（offline 空态 + 报错）。
    forbidden: [/保留本地 fixture，绝不覆盖/, /初始态预填本地 fixture/],
  },
  {
    file: 'lib/composables/useFireEmergencyEventList.ts',
    // 原「初始态预填本地 fixture / 非数组保持本地 fixture」，现三态。
    forbidden: [/保持本地 fixture/, /初始态预填本地 fixture/],
  },
  {
    file: 'lib/composables/useTvVideoDetail.ts',
    // 原 catch 静默回退本地预设档案，现三态（offline / live 失败均置空）。
    forbidden: [/回退到本地预设档案/],
  },
  {
    file: 'lib/data/alarmDetailMock.ts',
    // 原从本地 fixture 取 fireFacilityFaults 补关联工单，现由调用方传入后端已加载故障。
    forbidden: [/\bfireFacilityFaults\b/],
  },
  {
    file: 'components/common/FireFacilityMonitoringDialog.vue',
    // 原直接从 lib/data/fireFacilityMonitoringMock 取业务数据，现走 @/services/map-data loaders。
    forbidden: [/from\s+['"][^'"]*lib\/data\/fireFacilityMonitoringMock['"]/],
  },
  {
    file: 'components/map/TvMap.vue',
    // 原以本地撒点 tvVideoMapPoints 兜底（掩盖「无后端」）；现三态取数 /tv/map-points，失败空态 + 显式告警。
    forbidden: [/\btvVideoMapPoints\b/],
  },
  {
    file: 'components/layout/WeatherEntry.vue',
    // 原 fetchWeatherOverview().catch(() => {}) 静默吞错；现服务层三态（空态判定），禁止静默空 catch。
    forbidden: [/\.catch\(\(\)\s*=>\s*\{\}\)/],
  },
  {
    file: 'components/video-wall/videoWallStore.ts',
    // 原模块加载期代码生成 120 目标×954 通道（targetCategories/factoryAreas/generated*）；
    // 现四份数据由 GET /video/wall-navigation 下发（V37 fac_video_wall_node），禁再出现本地生成逻辑。
    forbidden: [/\bgenerated(?:TargetTree|VideoTree|CameraTargetMap)\b/, /\btargetCategories\b/, /\bfactoryAreas\b/],
  },
  {
    file: 'components/panels/tv/ImportantVideoPanel.vue',
    // 原内联硬编码 6 组×4 通道（highArGroups/focusGroups 字面量 + arFeeds 生成器）；
    // 现由 GET /video/important-groups 下发（V40 fac_video_important_group/_feed），
    // 静态图资按 image_key 映射为 by-design。禁再出现本地硬编码分组。
    forbidden: [/const\s+highArGroups\s*:\s*VideoGroup\[\]/, /function\s+arFeeds\b/],
  },
];

// ── 2b) 必备守卫：已验证「失败显式告警 / 三态取数」的文件，必须持续引用 backendFallback ──
// 防止日后被改回「静默 catch（失败只置 error 不报错）」。
const REQUIRED_GUARDS = [
  { file: 'lib/composables/useRescueEquipmentView.ts', must: /backendFallback/ },
  { file: 'lib/composables/useRescuePersonnelView.ts', must: /backendFallback/ },
  { file: 'lib/composables/useRescueVehicleView.ts', must: /backendFallback/ },
  { file: 'lib/composables/useCommunicationDevices.ts', must: /backendFallback/ },
  { file: 'lib/composables/usePreliminaryEventList.ts', must: /backendFallback/ },
  // 2026-09-11 静默组件收敛：以下组件失败须显式告警（引用 backendFallback），
  // 不得再改回「静默 catch（失败只置空/置 error 不报错）」。
  { file: 'components/layout/SystemMessageBar.vue', must: /backendFallback/ },
  { file: 'components/map/CenterMap.vue', must: /backendFallback/ },
  { file: 'components/map/TvMap.vue', must: /backendFallback/ },
  { file: 'components/panels/production/ProductionWorkstationPanel.vue', must: /backendFallback/ },
  { file: 'components/panels/production/ProductionDeviceLedgerPanel.vue', must: /backendFallback/ },
  { file: 'components/common/FirePatrolDialog.vue', must: /backendFallback/ },
  { file: 'components/common/FireAlarmListDialog.vue', must: /backendFallback/ },
  { file: 'components/video-wall/videoWallStore.ts', must: /backendFallback/ },
  { file: 'components/panels/tv/ImportantVideoPanel.vue', must: /fetchImportantVideoGroups/ },
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

// 匹配任意 import，再按「模块目录是否为 data/」过滤：既覆盖 `lib/data/x`，也覆盖相对 `../data/x`
// （后者历史上是门禁盲区，composables 大量如此引用）。用 `(^|/)data/` 精确匹配目录段，
// 避免误伤 service 层的 `@/services/map-data/x`（其段名为 map-data，data 前是 `-`）。
const VALUE_IMPORT_RE = /import\s+(type\s+)?([^;]+?)\s+from\s+['"]([^'"]+)['"]/gs;
const DATA_MODULE_RE = /(?:^|\/)data\/[A-Za-z0-9_.]+$/;

function parseValueImports(src) {
  const out = [];
  let m;
  VALUE_IMPORT_RE.lastIndex = 0;
  while ((m = VALUE_IMPORT_RE.exec(src))) {
    if (m[1]) continue; // `import type` 整体放行
    const clause = m[2];
    if (!DATA_MODULE_RE.test(m[3])) continue; // 仅审 data/ 目录下的模块
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

// 必备守卫
for (const guard of REQUIRED_GUARDS) {
  const fp = path.join(SCREEN, guard.file);
  if (!fs.existsSync(fp)) continue;
  const src = fs.readFileSync(fp, 'utf8');
  if (!guard.must.test(src)) {
    failed = true;
    console.error(`✗ 必备引用缺失 [${guard.file}]：未匹配 /${guard.must.source}/（失败须显式告警）`);
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
