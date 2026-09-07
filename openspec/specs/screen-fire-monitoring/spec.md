# Capability: screen-fire-monitoring

fire-monitoring 高保真大屏原型（15 视图 + 单例 Cesium + PanelCard 设计体系）迁入 `src/screen/` 后，经 12 个 wujie 薄子应用（`subapps/fm-*`）承载的运行约定：挂载组合、委托导航、参数透传与中央地图模式、二级路由镜像路径、存量代码补位规则。

## Requirements

### Requirement: fm 子应用清单（12 个）

`subapps/fm-*` 各子应用仅含 `index.html` + `main.ts`，入口 `import '@/screen/style.css'`，无独立路由树。按源项目页面结构分两种挂载形态：

**地图组合页（10 个）**——`ViewportSimulator > MapDashboardLayout > 视图`：

- `fm-emergency` — `SectorEmergencyCommand.vue`（应急指挥），一级路由 `/emergency`
- `fm-fire` — `FireMonitoring.vue`（消防报警），一级路由 `/fire`
- `fm-security` — `SecurityAntiTerror.vue`（治安防恐），一级路由 `/security`
- `fm-tv` — `IndustrialTv.vue`（工业电视），一级路由 `/tv`
- `fm-production` — `ProductionEmergency.vue`（生产应急），一级路由 `/production`
- `fm-rescue` — `AccidentEmergencyRescue.vue`，二级路由 `/emergency/drill`、`/fire/rescue`
- `fm-typhoon` — `TyphoonEmergencyDetailV3.vue`（台风详情 V1/V2 已合并，V3 最全含 ECharts 趋势），二级路由 `/emergency/typhoon`
- `fm-production-area` — `ProductionAreaView.vue`，二级路由 `/production/area/:facilityId`（透传 `facilityId` prop）
- `fm-major-hazard` — `MajorHazardListView` / `MajorHazardDetailView` 双视图，二级路由 `/production/hazards`、`/production/hazards/:hazardId`
- `fm-communication` — `ProductionCommunicationView.vue`，二级路由 `/production/communication`

**TV 直挂页（2 个）**——仅 `ViewportSimulator` 直挂视图，不包 `MapDashboardLayout`（镜像源项目布局）：

- `fm-video-control` — `VideoControlPlatform.vue`，二级路由 `/tv/video-control`
- `fm-video-wall` — `VideoWallView.vue`，二级路由 `/tv/video-wall`

`src/screen/views/` 内未接线的备选视图（`TyphoonEmergencyDetailV2/V3` 等源项目废弃版本）保留迁移存量、不建子应用入口。

### Requirement: 入口组合约定

地图组合页入口以 render 函数 1:1 复刻源项目 `App.vue` 组合，`AppToast` 与组合根并列渲染：

- `h(ViewportSimulator, null, { default: () => h(MapDashboardLayout, null, { default: () => h(View) }) })` + `h(AppToast)`
- 以 **default slot 替代 router-view**：子应用无路由树，不引入视图内 `<router-view>`；跨页跳转一律委托主壳（见下）。
- TV 直挂页为 `h(ViewportSimulator, null, { default: () => h(View) })` + `h(AppToast)`。

#### Scenario: 主壳单条二级路由复用同一子应用双视图

- **WHEN** 进入 `/production/hazards/:hazardId`
- **THEN** 子应用读 `window.$wujie.props.routeParams.hazardId`，有值渲染 `MajorHazardDetailView({ hazardId })`；进入 `/production/hazards`（无值）渲染 `MajorHazardListView`

#### Scenario: TV 直挂页渲染

- **WHEN** 打开 `/tv/video-control` 或 `/tv/video-wall`
- **THEN** 子应用仅挂 `ViewportSimulator` 包裹视图，页面不含地图布局与地图模式

### Requirement: createSubappRouter 委托导航

子应用内 `router.push` 不进行本地路由跳转，统一委托主壳：

- `createSubappRouter()` 注册 catch-all `subapp-fallback` 路由兜底沙箱初始 URL（消除 vue-router 无匹配告警）。
- `router.push` 被覆写：取目标 `path`，经 wujie 总线 `emitWujieEvent('route-navigate', { path })` 发往主壳。
- 主壳 `src/main.ts` 监听 `WujieVue.bus.$on('route-navigate')` 并 `router.push(path)`，二级页由主壳 `SECONDARY_ROUTES` 承载。

#### Scenario: 地图页内跳转二级详情

- **WHEN** 视图内 `router.push('/fire/rescue')`
- **THEN** 子应用经 `route-navigate` 事件请求主壳，主壳路由切到 `fm-fire-rescue`（`subappUrl: /subapps/fm-rescue/`），wujie 复用实例切换页面

### Requirement: routeParams 传参与中央地图模式透传

主壳 `WujieHost.vue` 向子应用下传 props `{ user, perms, theme, routeParams, routeName, routePath }`：

- `routeParams`：`{ ...route.params }`，承载动态段参数——`fm-production-area` 消费 `facilityId`、`fm-major-hazard` 消费 `hazardId`；子应用经 `window.$wujie?.props.routeParams` 读取（缺省 `?? {}`）。
- `routeName` / `routePath`：子应用无独立路由树，`useRoute()` 拿不到主壳当前路由；`SharedCesiumMap.vue` 以透传的 `routeName` 覆盖本地 `route.name`（`effectiveRouteName`），经 `config/cesiumMapModes.ts` `resolveRouteCesiumMeta` 解析中央地图模式与 focus。
- `cesiumMapModes` 的 routeName 命中规则：直查 `ROUTE_CESIUM_META` → 剥 `fm-` 前缀 → `ROUTE_NAME_ALIAS` 别名表（kebab/camel、短名歧义），保证主壳 `fm-*` 命名与旧 6 子应用短命名同时命中；`INCIDENT_DETAIL_ROUTE_NAMES` 决定是否飞行定位厂区。

#### Scenario: 从消防报警进入事故救援详情

- **WHEN** 主壳路由 `name = fm-fire-rescue`
- **THEN** 子应用地图以事故救援详情 mode/focus 渲染（不飞回厂区），且主壳 `routePath` 供子应用回退路由上下文

### Requirement: 二级路由镜像源项目路径

fm 二级路由集中在 `src/router/index.ts` `SECONDARY_ROUTES`（`hidden`，不进顶部导航，由一级页「更多/查看」进入）：

- 路径镜像源项目 router 体系：`/emergency/*`、`/fire/*`、`/production/*`、`/tv/*` 前缀，动态段 `:facilityId` / `:hazardId` 保留为路由参数。
- 每个记录 `component: WujieHost.vue` + `meta.subappUrl` 指向对应 fm 子应用；`meta.perm` 沿用 RBAC 权限码由守卫校验。
- 旧 6 子应用二级页（`/fire-alarm/*`、`/ops-monitor/*`、`/industrial-video/*`、`/extreme-weather/*`）保留在 `SECONDARY_ROUTES` 上半段与其 `src/views` 代码，供对照与回退。
- 顶部菜单路径由 `menu.ts` `DEFAULT_MENUS` 指向 fm 五项（应急指挥 `/emergency`、消防报警 `/fire`、治安防恐 `/security`、工业电视 `/tv`、生产应急 `/production`），对齐源项目 `navItems`；旧 6 子应用摘出默认菜单、保留 `MENU_ROUTE_SPECS` 与构建入口（可用 env 指回）。

### Requirement: 存量补位条款

`src/screen/**` 为 fire-monitoring 迁入存量，样式治理按「规范优先、源体系补位」：

- UI 规范/token **已覆盖**项（`docs/UI规范-大屏端.md` 色彩 token、状态色映射表、z-index 五层、玻璃拟态 `--glass-*`、`--map-tool-*`）一律以规范为准，迁入代码硬编码同值须替换为 `var(--token)`（`tokens.css` 单一真源，数值不动）。
- 规范**未覆盖**项（特效、特殊尺寸、滚动条、雪碧图体系等）沿用 `src/screen/styles/variables.css` 源体系。
- 新增/修改 `src/screen/**` 代码一律按 UI 规范执行；未覆盖值如需固化，先提案入 `tokens.css`，不得新增裸硬编码（AGENTS.md「存量补位例外（src/screen）」）。

### Requirement: 门禁

`src/screen/**` 与 `subapps/fm-*` 全量通过迁移门禁后方可提交：

- prettier → eslint → stylelint → `vue-tsc --noEmit` 全部 0 error（不豁免规则）；type-check 以 `tsconfig.app.json` 为准。
- `vite build` 成功且 12 个 fm-* 入口均出 HTML（rollupInputs 主壳 index + apps + 新旧子应用同源同 serve）。
- dev 冒烟逐子应用截图比对源项目（地图 canvas、面板数、标注数、图表渲染）；变更分批提交（scope=screen，文件数受控防 lint-staged OOM），本 capability 变更归档至 `openspec/archive/`。
