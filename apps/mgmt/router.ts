import { createRouter, createWebHistory } from 'vue-router';
import { mgmtMenus, mgmtLeafByPath } from '@/data/mgmtMenus';
import type { RouteRecordRaw } from 'vue-router';

// 后台独立入口路由（与主壳一致使用 history 模式，base 指向子路径）。
// dev 访问路径：/apps/mgmt/（多入口构建，见 vite.config.ts rollupOptions.input）。
// - dev：vite.config.ts 的 appsHtmlFallback 中间件把 /apps/mgmt/* 回退到本入口 index.html；
// - 生产：网关需为 /apps/mgmt/* 配置 rewrite → /apps/mgmt/index.html（与主壳回退规则同理）。

// 消防设施管理域：台账段（facility-* 叶子）与运行监控段（monitor-* 叶子）由菜单嵌套 helper 批量生成，
// 各叶子共用同一后端资源（台账 / 报警），故用路径数组批量接管（避免逐条重复声明）。
const FIRE_FACILITY_LEDGER_PATHS = [
  '/facility-fire-alarm',
  '/facility-water-source',
  '/facility-hydrant',
  '/facility-sprinkler',
  '/facility-gas',
  '/facility-foam',
  '/facility-dry-powder',
  '/facility-smoke',
  '/facility-separation',
  '/facility-broadcast',
  '/facility-light',
  '/facility-power',
];
const FIRE_MONITOR_PATHS = [
  '/monitor-fas',
  '/monitor-linkage',
  '/monitor-pump',
  '/monitor-hydrant',
  '/monitor-fire-monitor',
  '/monitor-sprinkler',
  '/monitor-foam',
  '/monitor-steam',
  '/monitor-gas',
  '/monitor-dry-powder',
  '/monitor-smoke',
  '/monitor-door',
  '/monitor-hvac',
  '/monitor-broadcast',
  '/monitor-light',
  '/monitor-power',
];

// 已接后端的系统管理页路径：显式指向服务驱动视图（优先于数据驱动的 module-embed 兜底页）。
// 其余叶子仍统一走 module-embed.vue（原型 iframe / 静态数据兜底），后续按域逐步接入。
const SERVICE_PATHS = [
  '/staff-mgmt',
  '/role-mgmt',
  '/dict-mgmt',
  '/audit-log',
  '/area-config',
  '/alarm-record',
  '/fault-mgmt',
  // 应急及演练管理域：已接后端只读台账
  '/emergency-plan',
  '/emergency-knowledge',
  '/plan-mgmt',
  '/resource-mgmt',
  '/emergency-team',
  '/emergency-vehicle',
  '/emergency-expert',
  // 应急及演练管理域：补管理端缺失的「应急事件」页（大屏/移动端早已读 /emergency-events）
  '/emergency-event',
  // 设备管理域：已接后端只读台账
  '/video-mgmt',
  '/video-health',
  '/monitor-point',
  '/phone-management',
  '/radio-management',
  '/broadcast-device',
  // 治安防恐管理域：已接后端防撞柱 / 道闸 / 人车检索接口
  '/bollard-mgmt',
  '/barrier-mgmt',
  '/personnel-registration',
  '/vehicle-registration',
  // 设备管理域：已接后端设备台账接口
  '/device-mgmt',
  // 治安防恐管理域：已接后端卡口门禁接口
  '/gate-mgmt',
  // 消防设施管理域：已接后端防火巡查接口
  '/patrol-mgmt',
  // 应急及演练管理域：已接后端视频联动配置接口
  '/auto-linkage',
  // 消防设施管理域：台账段 + 运行监控段（嵌套 helper 批量生成，共用视图）
  ...FIRE_FACILITY_LEDGER_PATHS,
  ...FIRE_MONITOR_PATHS,
  '/facility-maintenance',
  // 生产信息管理域：已接后端作业票 / 重大危险源接口
  '/special-ops',
  '/hazard-mgmt',
  // 应急及演练管理域（补接通讯录 / 事故案例库；其余演练/预案/联动/危化品/监控池等无后端端点）
  '/contacts-mgmt',
  '/case-lib',
  // 通用台账（静态页真后端化）：24 个原 mgmtMenus 硬编码静态域，统一走 MgmtLedgerView.vue
  // （含 ④-C 扩展的 6 个生产必需域：key-location/incident-archive/drill-script/linkage-unit/emergency-pool/ef-medium）
  '/alarm-config',
  '/chemsafe-db',
  '/drill-mgmt',
  '/drill-evaluation',
  '/ef-tank',
  '/ef-tankfarm',
  '/ef-unit',
  '/ef-warehouse',
  '/ef-warehouse-zone',
  '/enterprise-basic',
  '/fire-rescue-plan',
  '/flood-point',
  '/media-fire-params',
  '/org-mgmt',
  '/prod-emergency',
  '/training-mgmt',
  '/water-system',
  '/broadcast-template',
  '/key-location',
  '/incident-archive',
  '/drill-script',
  '/linkage-unit',
  '/emergency-pool',
  '/ef-medium',
  '/ef-equipment',
  '/emergency-command',
  '/duty-sign-in',
  '/typhoon-dispatch',
  '/patrol-execution',
  // 通讯通知管理域：短信 / 电话通话 / 广播播报 / APP推送 / 语音对讲五类记录
  // 已接后端 GET /communication/records（Change：openspec/changes/2026-09-16-add-comm-records-domain/）
  '/comm-sms',
  '/comm-call',
  '/comm-broadcast',
  '/comm-push',
  '/comm-intercom',
];

// 通用台账（静态页真后端化）：18 个原 mgmtMenus 硬编码静态域，复用同一 MgmtLedgerView.vue，
// 由组件按 route.path 去前导 / 得到 domain 调 /api/v1/mgmt-ledger/{domain}。
const MGMT_LEDGER_PATHS = [
  '/alarm-config',
  '/chemsafe-db',
  '/drill-mgmt',
  '/drill-evaluation',
  '/ef-tank',
  '/ef-tankfarm',
  '/ef-unit',
  '/ef-warehouse',
  '/ef-warehouse-zone',
  '/enterprise-basic',
  '/fire-rescue-plan',
  '/flood-point',
  '/media-fire-params',
  '/org-mgmt',
  '/prod-emergency',
  '/training-mgmt',
  '/water-system',
  '/broadcast-template',
  '/key-location',
  '/incident-archive',
  '/drill-script',
  '/linkage-unit',
  '/emergency-pool',
  '/ef-medium',
  '/ef-equipment',
];
const mgmtLedgerRoutes: RouteRecordRaw[] = MGMT_LEDGER_PATHS.map((p) => ({
  path: p,
  component: () => import('./views/MgmtLedgerView.vue'),
  meta: routeMeta(p, '通用台账'),
}));

function routeMeta(path: string, fallbackTitle: string) {
  const leaf = mgmtLeafByPath[path];
  return {
    title: leaf?.name ?? fallbackTitle,
    group: leaf?.group ?? '',
    groupKey: leaf?.groupKey ?? '',
  };
}

// 消防设施管理域：台账段（facility-*）共用台账视图，运行监控段（monitor-*）共用报警视图。
// 后端以 facilityType 维度提供统一台账、以 level/status 维度提供统一报警，前端按类型/级别过滤。
const fireFacilityLedgerRoutes: RouteRecordRaw[] = FIRE_FACILITY_LEDGER_PATHS.map((p) => ({
  path: p,
  component: () => import('./views/fire/FireFacilityLedgerView.vue'),
  meta: routeMeta(p, '消防设施台账'),
}));
const fireMonitorRoutes: RouteRecordRaw[] = FIRE_MONITOR_PATHS.map((p) => ({
  path: p,
  component: () => import('./views/fire/FireFacilityAlarmView.vue'),
  meta: routeMeta(p, '消防设施运行监控'),
}));

// 服务驱动路由（先行注册，确保静态路径命中真实页面）。
const serviceRoutes: RouteRecordRaw[] = [
  {
    path: '/staff-mgmt',
    component: () => import('./views/system/StaffView.vue'),
    meta: routeMeta('/staff-mgmt', '人员与账号管理'),
  },
  {
    path: '/role-mgmt',
    component: () => import('./views/system/RoleView.vue'),
    meta: routeMeta('/role-mgmt', '角色与权限管理'),
  },
  {
    path: '/dict-mgmt',
    component: () => import('./views/system/DictView.vue'),
    meta: routeMeta('/dict-mgmt', '字典管理'),
  },
  {
    path: '/audit-log',
    component: () => import('./views/system/AuditView.vue'),
    meta: routeMeta('/audit-log', '审计日志管理'),
  },
  {
    path: '/area-config',
    component: () => import('./views/system/AreaView.vue'),
    meta: routeMeta('/area-config', '茂名石化厂区配置'),
  },
  {
    path: '/alarm-record',
    component: () => import('./views/alarm/AlarmRecordView.vue'),
    meta: routeMeta('/alarm-record', '报警记录'),
  },
  {
    path: '/fault-mgmt',
    component: () => import('./views/fire/FaultMgmtView.vue'),
    meta: routeMeta('/fault-mgmt', '消防设施故障管理'),
  },
  // —— 应急及演练管理域（只读台账，接后端救援资源 / 预案 / 知识库接口）——
  {
    path: '/emergency-knowledge',
    component: () => import('./views/emergency/KnowledgeView.vue'),
    meta: routeMeta('/emergency-knowledge', '应急知识库'),
  },
  {
    path: '/plan-mgmt',
    component: () => import('./views/emergency/PlanCatalogView.vue'),
    meta: routeMeta('/plan-mgmt', '预案管理'),
  },
  {
    path: '/resource-mgmt',
    component: () => import('./views/emergency/ResourceView.vue'),
    meta: routeMeta('/resource-mgmt', '应急物资与装备管理'),
  },
  {
    path: '/emergency-team',
    component: () => import('./views/emergency/EmergencyTeamView.vue'),
    meta: routeMeta('/emergency-team', '应急队伍管理'),
  },
  {
    path: '/emergency-vehicle',
    component: () => import('./views/emergency/EmergencyVehicleView.vue'),
    meta: routeMeta('/emergency-vehicle', '应急车辆管理'),
  },
  {
    path: '/emergency-expert',
    component: () => import('./views/emergency/EmergencyExpertView.vue'),
    meta: routeMeta('/emergency-expert', '应急专家管理'),
  },
  // —— 应急及演练管理域：应急事件（接后端 /emergency-events，与大屏/移动端同源）——
  {
    path: '/emergency-event',
    component: () => import('./views/emergency/EmergencyEventView.vue'),
    meta: routeMeta('/emergency-event', '应急事件'),
  },
  {
    path: '/emergency-plan',
    component: () => import('./views/emergency/EmergencyPlanView.vue'),
    meta: routeMeta('/emergency-plan', '应急预案管理'),
  },
  // —— 设备管理域（只读台账，接后端视频 / 监测点位 / 通讯设备接口）——
  {
    path: '/video-mgmt',
    component: () => import('./views/monitor/VideoMgmtView.vue'),
    meta: routeMeta('/video-mgmt', '视频监控管理'),
  },
  {
    path: '/video-health',
    component: () => import('./views/monitor/VideoHealthView.vue'),
    meta: routeMeta('/video-health', '视频健康度管理'),
  },
  {
    path: '/monitor-point',
    component: () => import('./views/monitor/MonitorPointView.vue'),
    meta: routeMeta('/monitor-point', '监测点位管理'),
  },
  {
    path: '/phone-management',
    component: () => import('./views/monitor/PhoneMgmtView.vue'),
    meta: routeMeta('/phone-management', '电话设备管理'),
  },
  {
    path: '/radio-management',
    component: () => import('./views/monitor/RadioMgmtView.vue'),
    meta: routeMeta('/radio-management', '无线对讲设备管理'),
  },
  {
    path: '/broadcast-device',
    component: () => import('./views/monitor/BroadcastDeviceView.vue'),
    meta: routeMeta('/broadcast-device', '广播设备管理'),
  },
  // —— 治安防恐管理域（接后端防撞柱 / 道闸 / 人车检索接口）——
  {
    path: '/bollard-mgmt',
    component: () => import('./views/security/BollardView.vue'),
    meta: routeMeta('/bollard-mgmt', '液压防撞柱管理'),
  },
  {
    path: '/barrier-mgmt',
    component: () => import('./views/security/BarrierView.vue'),
    meta: routeMeta('/barrier-mgmt', '道闸管理'),
  },
  {
    path: '/personnel-registration',
    component: () => import('./views/security/PersonnelRegView.vue'),
    meta: routeMeta('/personnel-registration', '人员备案管理'),
  },
  {
    path: '/vehicle-registration',
    component: () => import('./views/security/VehicleRegView.vue'),
    meta: routeMeta('/vehicle-registration', '车辆备案管理'),
  },
  // —— 消防设施管理域（台账段 / 运行监控段批量接管，共用视图）——
  ...fireFacilityLedgerRoutes,
  ...fireMonitorRoutes,
  {
    path: '/facility-maintenance',
    component: () => import('./views/fire/FireFacilityMaintenanceView.vue'),
    meta: routeMeta('/facility-maintenance', '维护保养记录'),
  },
  // —— 生产信息管理域（接后端作业票分页 / 重大危险源接口）——
  {
    path: '/special-ops',
    component: () => import('./views/production/SpecialOpsView.vue'),
    meta: routeMeta('/special-ops', '特殊作业管理'),
  },
  {
    path: '/hazard-mgmt',
    component: () => import('./views/production/HazardMgmtView.vue'),
    meta: routeMeta('/hazard-mgmt', '两重点一重大管理'),
  },
  // —— 应急及演练管理域（补接通讯录 / 事故案例库）——
  {
    path: '/contacts-mgmt',
    component: () => import('./views/emergency/ContactsView.vue'),
    meta: routeMeta('/contacts-mgmt', '应急通讯录管理'),
  },
  {
    path: '/case-lib',
    component: () => import('./views/emergency/CaseLibView.vue'),
    meta: routeMeta('/case-lib', '事故案例库管理'),
  },
  // —— 设备管理域：装置/设备台账（接后端 /devices 分页）——
  {
    path: '/device-mgmt',
    component: () => import('./views/production/DeviceView.vue'),
    meta: routeMeta('/device-mgmt', '设备台账管理'),
  },
  // —— 治安防恐管理域：卡口门禁（接后端 /security/gate-controls）——
  {
    path: '/gate-mgmt',
    component: () => import('./views/security/GateView.vue'),
    meta: routeMeta('/gate-mgmt', '卡口门禁信息管理'),
  },
  // —— 消防设施管理域：日常防火巡查（接后端 /fire/patrols）——
  {
    path: '/patrol-mgmt',
    component: () => import('./views/fire/PatrolView.vue'),
    meta: routeMeta('/patrol-mgmt', '日常防火巡查管理'),
  },
  // —— 应急及演练管理域：应急自动联动配置（接后端 /video/linkages）——
  {
    path: '/auto-linkage',
    component: () => import('./views/emergency/AutoLinkageView.vue'),
    meta: routeMeta('/auto-linkage', '应急自动联动配置管理'),
  },
  // —— 业务写侧（D 类，接 businessWrite.ts 4 写端点 + v-permission 按钮级显隐）——
  {
    path: '/emergency-command',
    component: () => import('./views/emergency/EmergencyCommandView.vue'),
    meta: routeMeta('/emergency-command', '应急指令下发'),
  },
  {
    path: '/duty-sign-in',
    component: () => import('./views/emergency/DutySignInView.vue'),
    meta: routeMeta('/duty-sign-in', '值班签到'),
  },
  {
    path: '/typhoon-dispatch',
    component: () => import('./views/typhoon/TyphoonDispatchView.vue'),
    meta: routeMeta('/typhoon-dispatch', '台风资源调度'),
  },
  {
    path: '/patrol-execution',
    component: () => import('./views/fire/PatrolExecutionView.vue'),
    meta: routeMeta('/patrol-execution', '消防巡更执行'),
  },
  // —— 通讯通知管理域（五类通讯记录共用同一视图，按 route.path 决定记录类型与列）——
  {
    path: '/comm-sms',
    component: () => import('./views/comm/CommRecordView.vue'),
    meta: routeMeta('/comm-sms', '短信记录'),
  },
  {
    path: '/comm-call',
    component: () => import('./views/comm/CommRecordView.vue'),
    meta: routeMeta('/comm-call', '电话通话记录'),
  },
  {
    path: '/comm-broadcast',
    component: () => import('./views/comm/CommRecordView.vue'),
    meta: routeMeta('/comm-broadcast', '广播播报记录'),
  },
  {
    path: '/comm-push',
    component: () => import('./views/comm/CommRecordView.vue'),
    meta: routeMeta('/comm-push', 'APP推送记录'),
  },
  {
    path: '/comm-intercom',
    component: () => import('./views/comm/CommRecordView.vue'),
    meta: routeMeta('/comm-intercom', '语音对讲记录'),
  },
  // —— 通用台账（静态页真后端化，复用 MgmtLedgerView.vue）——
  ...mgmtLedgerRoutes,
];

// 数据驱动兜底路由：未接入后端能力的叶子走 module-embed.vue
// （原型页命中 → iframe 嵌入 public/pc-admin；/form → 流程填报向导；否则 module.vue 静态页）。
const moduleRoutes: RouteRecordRaw[] = mgmtMenus.flatMap((g) =>
  g.children
    .filter((c) => !SERVICE_PATHS.includes(c.path))
    .map((c) => ({
      path: c.path,
      component: () => import('./views/module-embed.vue'),
      meta: { title: c.name, group: g.title, groupKey: g.key },
    })),
);

const router = createRouter({
  history: createWebHistory('/apps/mgmt/'),
  routes: [
    { path: '/', redirect: '/workbench' },
    {
      path: '/workbench',
      name: 'mgmt-workbench',
      component: () => import('./views/workbench.vue'),
      meta: { title: '工作台' },
    },
    {
      // 流程填报向导（mgmtWorkbenchLinks 顶层入口，不在菜单分组内）
      path: '/form',
      name: 'mgmt-form-wizard',
      component: () => import('./views/module-embed.vue'),
      meta: { title: '流程填报' },
    },
    ...serviceRoutes,
    ...moduleRoutes,
    { path: '/:pathMatch(.*)*', redirect: '/workbench' },
  ],
});

router.afterEach((to) => {
  document.title = `${String(to.meta.title ?? '管理后台')} · 安全管控平台`;
});

export default router;
