# 任务清单：大屏数据接入接线（mock→service）

> L3。任务可勾选、单条 ≤2h；[TDD] 先写失败测试再实现。任务状态只回填此处（AGENTS.md §4）。

## 1. P0 样板 · 消防报警（service 已就绪）

- [x] 结构对齐审计：比对 `services/alarm.ts` 的 `AlarmItem`/`DashboardOverview`/`AlarmTrendPoint` 与 `fireAlarmListMock` 返回，列出缺失/错位字段。结论：通用 `AlarmItem` 缺消防域专有字段（typeLabel/typeTone/objectType/objectName/source/falseAlarm/monitorId(s)/rescueEventId/level 阈值文本），type/level 分类体系与规范 AlarmItem 不同维度 → 采用方案 A 新增消防域 `FireAlarmItem` 富模型。
- [x] 扩展 `services/alarm.ts`：新增 `FireAlarmItem` 接口 + `fetchFireAlarmPage(page,size)`（B3 包络 + `useDevMock` 降级，dev fixture 镜像原 `fireAlarmListMock` 10 模板/50 行，status 映射 ACTIVE/CLOSED）。后端契约（/fire-alarms 端点、type/level 分类）标 `#TODO-确认`。
- [x] 接线 `src/screen/components/common/FireAlarmListDialog.vue`：移除 `fireAlarmListMock` 数据导入，改调 `fetchFireAlarmPage`（dev 自动降级）；筛选项来自新建 `alarmMeta.ts`；状态列按规范 `ALARM_STATUS_META` 着色+标签（选项 A）；`fireListItemToDetail` 改接 `FireAlarmItem`（`alarmId`/`status`/`rescueEventId:Number`）。
- [x] [TDD] 写 `src/services/alarm.spec.ts`：覆盖 `VITE_API_BASE` 缺失时回退 fixture（10 条/页、total 50、alarmId 连续跨页）、有 base 时走 `request('/fire-alarms')` 两条路径；`npx vitest run` 3 passed。

## 2. P0 样板 · 事故应急（service 已就绪，体量最大）

- [x] 结构对齐审计：`accidentRescueMock` 各导出类型 vs `emergency.ts`/`emergencyEventStore`/`emergencyPlanStore`。结论（事故应急采用"部分接线"策略，对照消防报警方案 A 的"全量新增域模型"）：
  - service 侧已就绪三类真源：`fetchEmergencyStrength`(`EmergencyStrength`=聚合资源数 kind/count/icon)、`emergencyPlanStore`(`EmergencyPlan` CRUD)、`emergencyEventStore`(`AlarmItem` 事件 CRUD)。
  - 与 service 重合的 mock 导出（仅 2 类，可接 service）：①`emergencyPlanLevels`(`EmergencyPlanLevel` 一级/二级/三级) ↔ `EmergencyPlan.level`(`PlanLevel`)；②应急力量汇总展示（`rescueAuxiliaryStats`/`emergencyDispatchResources` 明细花名册）概念上对应 `fetchEmergencyStrength` 聚合计数，但形状不同（明细 vs 聚合），须字段映射。
  - 无对应 service 的 mock 导出（保留，删 mock 时不删这些）：`rescueDutyPersons`/`guidanceSteps`/`rescueDynamics*`/`eventCommandDynamics*`/`emergencyProcessStages`/`rescueStageProgressItems`/`eventCommandAuxiliaryItems`/`emergencyCommandInstruction*`/`emergencyCommand*`/`bottomToolbarItems`/`eventCommandToolbarItems`/`accidentInfo*`/`accidentReportFields`/`accidentArrivalFields`/`accidentRescueMapControls`/`accidentRescueRouteWaypoints`+`RescueRouteWaypoint`/`IncidentDetailField`/`AccidentRescueIncident`(`resolveAccidentRescueIncident` 事件富详情)/`EmergencyProcessStage`(类型) 等——均为屏幕本地 UI 域词汇或演示数据，后端契约 `#TODO-确认`，暂以 mock 为唯一真源。
  - 接线范围收敛：仅 `fetchEmergencyStrength`（力量汇总）、`emergencyPlanStore`（预案库）、`emergencyEventStore`（事件本体）三处有 service 等价；其余面板继续消费 `accidentRescueMock`，故本模块 mock 文件**不能整体删除**，仅随 P3 演练确认后清无引用项。
- [x] 接线力量汇总面板 `RescueAuxiliaryPanel`（rescue 布局）改消费 `fetchEmergencyStrength`（dev 降级；`EmergencyResource.kind` 顺序对齐 `RESCUE_ICONS` 索引映射 `iconIndex`/`label`/`value`），`eventCommand` 布局保留 `eventCommandAuxiliaryItems` mock。预案库（`emergencyPlanStore.fetchPlans`）与事件本体（`emergencyEventStore`/`resolveAccidentRescueIncident`）在现有 UI 中无 1:1 消费者（`EmergencyPlanPanel` 用硬编码 UI + `emergencyPlanSwitchMock`、`AccidentEmergencyRescue.vue` 用事件富详情且无单条 `getById`），按审计"部分接线"策略保留 mock、不强行接线，避免字段错位。
- [x] 接线 `drillRescueMock` 复用点（PreliminaryGuidancePanel / IncidentDetailPanel / RescueDynamicsPanel）：经审计，`drillRescueMock` 全部导出（`drillGuidanceSteps`/`drillResponseFields`/`drillDispatchFields`/`drillVideoFields`/`drillDynamics*`/`drillAwarenessDynamics`/`drillBriefDynamics`）均为演练（training）本地演示数据，无对应 service；演练数据本质即本地 mock，造 service 会违反设计决策 1（不新建并行 data 层），故三个复用点保留 `drillRescueMock`、不强行接线，与事故应急"部分接线"结论一致。
- [x] [TDD] 补 `src/services/emergency.spec.ts` 关键路径（strength / 事件 CRUD 降级）：覆盖 `fetchEmergencyStrength` dev 降级返回 8 维聚合、真实调用走 `/emergency/strength`、非法结构回退 DEV_FIXTURE；`emergencyEventStore` CRUD（mockPage 分页=9、mockCreate 推导 category/warned/title、mockUpdate 重推导、mockDelete 幂等），共 7 例，`vitest` 全绿。

## 3. P0 样板 · 极端天气 / 台风（真实外部 API）

- [x] 结构对齐审计：`weatherMock`/`typhoonEmergencyMock`/`satelliteCloudMapMock` vs `services/weather/*` 真实返回。结论（极端天气/台风为"真实外部 API 已就绪于 `src/**`，screen 侧仍 import `src/screen/lib/*` 旧副本"的迁移缺口，非缺 service）：
  - `weatherMock`(`currentWeather`/`hourlyWeather`/`dailyWeather`=实时观测+24h+7天预报) → `services/weather/*` 全为**地图气象瓦片源**(雷达/风云/葵花/Himawari/RainViewer)，非观测/预报数据；无对应 service（真实观测需 OWM 类后端，`#TODO-确认`）→ `WeatherEntry.vue`/`WeatherDetailsDialog.vue` **保留 mock**，不强行接线（同 §2 drill 逻辑）。
  - `satelliteCloudMapMock` → 仅导出静态 dBZ 图例 `satelliteCloudReflectivityLegend`（常量，非数据通道）；真实云图已由 `@/composables/useSatelliteCloudMap` 接 `services/weather/{rainViewerApi,fengyunApi,chinaRadarApi}` 真实外部 API（`fix-weather-tile-sources` 变更已落地）→ screen `SatelliteCloudMapDialog.vue` 重指向 `@/composables/useSatelliteCloudMap`+`@/composables/useTyphoonTrackMap`+真实 `services/weather/*`，消解旧副本依赖。
  - `typhoonEmergencyMock`(`resolveTyphoonEmergencyIncident`=调度资源/监测对象/风险预警/地图风险点/直播视频合成的 `TyphoonEmergencyIncident`) → 台风**路径点**由 `@/services/weather/istrongcloudTyphoonApi`(`IstrongTyphoonDetail.points`)+`@/composables/useTyphoonTrackMap`（已接真实 API）提供；但 `TyphoonEmergencyIncident` 其余字段为屏幕本地演示、无 1:1 后端 → 采用"部分接线"：`TyphoonEmergencyDetail*.vue` 保留 `typhoonEmergencyMock` 合成事件，仅其内嵌卫星云图子对话框重指向真实 composable。
  - 迁移本质：真源(`src/composables/*`+`src/services/weather/*`)已就绪；screen 侧 `SatelliteCloudMapDialog.vue` 当前混合 import 真实 `services/weather/{fengyunApi,chinaRadarApi}` 与旧副本 `src/screen/lib/{composables/useSatelliteCloudMap,composables/useTyphoonTrackMap,weather/rainViewerApi,data/satelliteCloudMapMock}`；接线=把 screen 对话框 import 重指向 `@/` 真源，随后清 `src/screen/lib` 天气/台风旧副本与 `satelliteCloudMapMock`。
- [x] 接线 screen 卫星云图/台风对话框改消费 `@/composables/useSatelliteCloudMap`+`@/composables/useTyphoonTrackMap`+`@/services/weather/*`（删除对 `src/screen/lib/{composables,weather,data/satelliteCloudMapMock}` 旧副本依赖）；`WeatherEntry`/`WeatherDetailsDialog`/`TyphoonEmergencyDetail*` 无对应 service，**保留**各自 mock（观测/合成事件）。已完成：新建 `services/weather/weatherLegend.ts` 承接静态 dBZ 图例；screen `SatelliteCloudMapDialog`+`TyphoonHistoryPanel`+`typhoonEyeMarker` 与 2 个非 screen 对话框 import 重指向真源；删除 6 个旧 screen/map-data 副本；`npm run type-check`+`npx eslint` 0 error。
- [x] [TDD] 补「无 key 时降级」用例：经核查 `chinaRadar`/`fengyun`/`himawari`(GIBS) 均为免密钥公共源、无 key 降级分支，唯一带可选 key 的是 `rainViewerApi`(`buildRainViewerTileUrl` 的 `?key=`)；新建 `services/weather/rainViewerApi.spec.ts` 覆盖无 key→免密钥 URL、有 key→追加 `?key=`、空 key 等同无 key 及最近帧覆盖窗回退；`npx vitest run src/services/weather` 29 passed。

## 4. P1 · 安全防恐 + 重大危险源（store 打底 / 需补 service）

- [x] 结构对齐审计：screen `lib/data/*` 安全/重大危险源 mock 实为 `services/map-data/*` 共享 fixture 的 screen 端重复副本（securityMock/securitySearchMock/securityTrackMock/majorHazardMock/monitoringPointsMock/facilityDetailMock 在 map-data 已有同导出共享版；非 screen 的 `MajorHazardMapOverlay`/`src/views/major-hazard/*`/mgmt 已消费 map-data 版）。唯一仅存 screen 端的是 `securityCameraMock`/`securityGateControlMock`/`securityBollardMock`（map-data 无）。结论：接线=screen 改指向新建 `@/services/security`+`@/services/hazard`（统一 import 面，dev 降级复用 map-data fixture + 内联 camera/gate/bollard），随后删 screen 旧副本；不必再造平行 data 层。
- [x] 新建 `services/security.ts`：`export *` 复用 `map-data/{securityMock,securitySearchMock,securityTrackMock}` + 内联 camera/gate/bollard（原仅 screen 端），加 `fetchPatrolCameras/fetchGateControls/fetchBollards/fetchVehicleSearch/fetchPersonSearch` B3 GET 降级封装；新建 `services/securityEventStore.ts`（本地 in-memory + dev 兜底 `patrolAlarms`，CRUD 打底）；`npm run type-check` 0 error。
- [x] 新建 `services/hazard.ts`：`export *` 复用 `map-data/{majorHazardMock,monitoringPointsMock,facilityDetailMock}` + `fetchMajorHazards/fetchMajorHazardDetail/fetchMonitoringPoints/fetchMonitoringAlarms/fetchFacilityDetail` B3 GET 降级封装；`npm run type-check` 0 error。
- [x] 接线 security* 系列面板：composable 抽象层（`usePatrolCameraListView`/`useGateControlListView`/`useBollardListView`/`useGateControlDetailDialog`/`useBollardDetailDialog`/`useSecuritySearchDetail`/`useSecurityTrackView`/`useSecuritySearchPanel`）与直接 import 的面板（`EntryExitStatsPanel`/`PatrolAlarmPanel`/`AlarmTrendPanel`/`PatrolLinkagePanel`/`PatrolCameraList*`/`GateControl*`/`Bollard*`/`SecuritySearch*`/`SecurityTrackScenePanel`/`SecurityMap`/`SecurityTrackMapOverlay`/`SecurityToolbarIcon`）改从 `@/services/security` 取数；`alarmDetailMock`(`PatrolAlarmItem`)/`geo/securityTrackRoute`(`SecurityTrackMode`) 内部引用一并改指向服务。
- [x] 接线 hazard 系列：screen `MajorHazardListView`/`MajorHazardDetailView`/`MajorHazardMapOverlay`/`MajorHazardStatsBar`/`MajorHazardListPanel`/`AccidentEmergencyRescue`(`monitoringPointsMock`+`facilityDetailMock`)/`MonitoringPointsScenePanel`/`FacilityDetailPanel` 改从 `@/services/hazard` 取数。
- [x] `grep` 确认 `src/screen/lib/data/{security*,majorHazard*,monitoringPointsMock,facilityDetailMock}` import 清零后删除这些旧副本（map-data/* 共享版保留）；`geo/securityTrackRoute` 随 `securityTrackMock` 失效一并删除。
- [x] [TDD] 补 `services/security.spec.ts`/`services/hazard.spec.ts` 关键路径（各 fetch 在 dev 降级返回 fixture、真实调用走 request 分支）；`npm test` 绿（security 6 + hazard 5 = 11 例通过）。

- [x] 联调前置记录：实测 8787 后端 `/health` 正常但所有数据端点（含已签约 `emergency/strength`/`dashboard`）均 500，且 `docs/api/` 无 security/hazard OpenAPI 契约；后端就绪后仅需 `VITE_API_BASE` 命中即联调，端点路径已写入 `services/security.ts`/`hazard.ts`。**需反馈后端定位 8787 数据端点 500 问题**。

## 5. P2 · 生产 / 工业电视 / 生产通信（需新建 service）

- [x] 结构对齐审计：比对 `services/production.ts` 契约类型（`OverviewGridItem`/`StatOverviewItem`/`PersonnelMarker`/`ProductionAreaDetail`/`RiskSummary`/`RiskWarningItem`/`ProductionAlarmItem`）与 `productionMock`/`productionAreaMock`/`productionDeviceMock` 返回，列出字段漂移：`StatOverviewItem.valueSuffix?`(mock) vs `unit:string|null`(契约)；`PersonnelMarker.markerIcon/popupBg/markerDot/markerLine:string|null`(契约，其中 `markerOuter/markerInner` 仅前端装饰环、不在契约)；`ProductionAlarmItem.thumb` 契约必需可空 `string|null` vs mock 可选 `string?`；`resolveProductionAreaDetail` 同步→改异步 `fetchProductionAreaDetail(facilityId)`。结论：新建 `services/production.ts` 承接全部 fetch + 共享工具（`statusTone`/`resolveDeviceCategoryTitle`/`getDevicesByCategory`/`productionDevicePageSize`/`productionDeviceStatusOptions`/`ProductionDeviceCategory`/`ProductionAreaPersonnelSlice=PersonnelSlice`）。
- [x] 新建 `docs/api/production.openapi.json` 契约（overview/alarms/risk-warnings/personnel/areas/{facilityId}/devices 六端点）+ `src/services/production.ts`（fetch 全集 + 契约类型 + 共享工具）+ `src/services/productionMapConfig.ts`（抽离前端静态几何 `productionMapControls`，非后端数据，避免随 mock 删除丢失）+ `src/types/generated/production.ts`（`npm run gen:api-types` 生成；`scripts/gen-api-types.mjs` 修复连字符域名 PascalCase 命名 `accident-rescue`→`AccidentRescue`，预存改良非本次引入）。
- [x] 接线 src 树：`ProductionMap.vue`（`fetchProductionPersonnel`+`designImg` 装饰环+`filterByPlantArea`，`DecoratedPersonnelMarker` 统一 `?? ''` 兜底以免 `string|null` 落入模板 `img.src`）、`ProductionAlarmCard.vue`/`map-data/alarmDetailMock.ts` 类型重指向 `@/services/production`；`ProductionAreaView.vue` 改 `watch(...,{immediate:true})` 首屏即 `loadDetail()`（`fetchProductionAreaDetail`），暴露式降级保持上一帧不白屏、不静默回落假数据。
- [x] 接线 src/screen 树：StatsOverviewBar/RiskControlPanel/FacilitiesOverview/DeviceOverview/ProductionAlarmPanel/ProductionAreaTopBar/ProductionAreaPersonnelPanel/ProductionAreaFacilityListPanel/ProductionAreaAlarmPanel/ProductionDeviceListPanel/ProductionStatCard/ProductionAlarmCard 逐个 type import 重指向 `@/services/production`；`alarmAdapter.toProductionAlarmItem` 补 `thumb:null`（契约必需可空）；`lib/data/alarmDetailMock.ts` 类型重指向；双树 `ProductionMap.vue` 装饰环逻辑一致。
- [x] 删除 6 个 mock 双副本（`src/services/map-data/{production,productionArea,productionDevice}Mock.ts` + `src/screen/lib/data/{production,productionArea,productionDevice}Mock.ts`）；`alarmDetailMock.ts`(双树) 保留（跨 fire/security/production 复用，仅改类型 import）；`productionZoneOverlays`/`resolveFacilityItem` 死代码随删。`grep` 确认 `productionMock|productionAreaMock|productionDeviceMock` 引用清零。
- [x] [TDD] `src/services/production.spec.ts` 覆盖 overview/alarms/risk-warnings/personnel/areas/devices 在 dev 降级返回 fixture、真实调用走 `request('/production/...')`、非法结构回退空态并告警；`npm test` 全绿（364 passed）。
- [x] 守门：`npm run type-check`(vue-tsc) 0 error；`npm run test` 364 passed（accidentRescue 单测在本机慢机偶发 5s 超时，已把 `vite.config.ts` `testTimeout` 提至 15s，非掩盖逻辑缺陷）；`npx eslint src/screen/<生产改动路径> src/services/<生产改动路径>` 0 error（全量 eslint 余 3 errors 在 `scripts/*.mjs` 预存、与本变更无关）；`SUBAPP_NO_EMPTY=1 npm run build:subapps` 重建 12 子应用产物（grep 确认 `fm-production` 产物含 `fetchProductionOverview` 且无 `productionMock` 残留）；后端 `mvn test` 223 passed、`/production/*` 端到端冒烟全 code=0（alarms 20 / risk-warnings 7 / personnel 3）。
- [x] 新建 `services/video.ts` 并接线：已落地 `fetchVideoNavigation`/`fetchVideoWallNavigation`(V37 视频墙)/`fetchImportantVideoGroups`(V41)/`fetchVideoCameras`(V40)/`fetchVideoLinkages`/`fetchVideoLinkageRules`/`fetchVideoSnapshotUrl`/`fetchVideoLinkageOptions`；`tvMock`/`videoControlMock`/`videoLinkageMock` 值引用已清零（残留仅 `tvAlarmMarker`/`tvMapControls` 静态几何 + `resolveTvVideoMonitorDetail` 适配器 + `import type`，均 by-design），视频元数据/联动/快照均经 service 取后端。
- [x] 新建 `services/communication.ts`（`fetchCommunicationDevices`/`fetchCommunicationDevice(id)`）并接线；`communicationDeviceMock` 仅 `import type` 视图模型类型（`CommunicationTab`/`CommunicationDevice`），数据经 service 取后端。

## 6. P3 · 演练（子应用为主，低优先）

- [x] 确认：`drillRescueMock` 由 SPA（大屏）侧 PreliminaryGuidancePanel/IncidentDetailPanel/RescueDynamicsPanel 引用，但演练(training)数据本质即本地仿真、无对应 service（造 service 违反设计决策 1 不建平行 data 层），故按审计结论**刻意保留 by-design**；`fm-drill` 子应用侧不在本变更范围。

## 8. 2026-09-10 续做 · 大屏残留 mock 清零（V24 后端数据集 + 四端点四同步）

- [x] 盘点确认最后真缺口：`fireEquipment`/`systemMessages`（`mock.ts`）与 `tvVideoMapPoints`/`tvVideoMonitorDetails`（`tvMock.ts`），其余面板均已接 service。
- [x] 后端 V24 `screen_panel_dataset`：4 表 + 种子（消防设备分类 12 项 count=665、系统消息 2 条、电视地图撒点 15 点、监控档案 15 条）；列名避开 H2 保留字（`equip_count`/`point_height`/`height_text`/`msg_type`/`monitor_type` 等）。
- [x] 后端 3 域新增 4 端点：`GET /fire/equipment`、`GET /dashboard/messages`、`GET /tv/map-points`、`GET /tv/monitors/{code}`（TvController 无 `@RequireAuth` 但受全局 JwtFilter 管控，/tv/* 无 token 返 401 为预期）；补 `FireMonitoringServiceTest.equipment_mapsCategoryTable`、`DashboardServiceTest.systemMessages_mapsRealTable`。
- [x] 契约四同步：`fire-monitoring/dashboard/tv.openapi.json` 增端点+schema（修复 `tv.openapi.json` line103 缺逗号导致的整体解析跳过）；`check-api-contract.mjs --strict` 路由 0 差异 / schema 0 漂移；`npm run gen:api-types` 生成 3 文件无 churn。
- [x] 前端接线：`FireEquipment.vue`→`fetchFireEquipment`、`SystemMessageBar.vue`→`fetchDashboardMessages`（无 DEV 兜底直连）、`TvMap.vue`→`fetchTvMapPoints`（保留 `tvAlarmMarker`/`tvMapControls` 静态几何）、`useTvVideoDetail`→`fetchTvMonitor`（catch 回退本地解析）。
- [x] 门禁：`vue-tsc --noEmit` 0 错；后端 8787 四端点冒烟全 `code=0`（12 项/2 条/15 点/9 字段档案）；后端单测、前端 vitest 复验绿（当日复跑）。
- [x] `videoControlMock`/`videoLinkageMock` 接线已完成（见本变更 video.ts 落地项）：联动经 `fetchVideoLinkages`/`fetchVideoLinkageRules`/`fetchVideoLinkageOptions` 取后端，值引用已清零。

## 7. 守门测试与验证

- [x] [TDD] 受影响 service 集成测试经 `npm test` 必绿（alarm/emergency/weather 及本次 production）。
- [x] 按 AGENTS.md §2 矩阵对应行：`npm run type-check` + 受改动路径 `npx eslint` 0 error；结果见 `engineering/qa/production-mock-to-service.md`。
- [x] 接线后 `grep` 确认 `productionMock|productionAreaMock|productionDeviceMock` import 清零，再删除 6 个 mock 文件（仅 `alarmDetailMock` 跨域保留、改类型指向）。

## 验收标准（Definition of Done）

- [x] `tasks.md` 生产域（P2-生产）全部勾选，验收标准逐条满足；video/communication 仍为 `#TODO-确认` 显式递延，不阻塞本期切片。
- [x] 受影响目标 `npm test` / type-check / eslint（受改动路径）0 error（按 §2 矩阵对应行）。
- [x] 新增 `docs/api/production.openapi.json` 契约 + `src/types/generated/production.ts` 生成类型；行为改动已同步契约（短期记录不写进 `docs/UI规范-*.md`）。
- [x] 提交按 scope 拆分：`type(screen): 描述`，单行成句、禁止 `- ` 分点列表；临时输出文件不入库。（2026-09-10 续做切片：前端 81481ae/81e9473/9b81b14，后端 dab0dfa/f208b36，均按 scope 拆分并推送）
- [x] L3 完成后写 `engineering/qa/production-mock-to-service.md` + `engineering/retro/`（见对应文件）。
