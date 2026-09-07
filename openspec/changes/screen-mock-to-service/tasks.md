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

- [ ] 新建 `services/security.ts`（camera/gate/track/search 等 GET），`securityEventStore` 打底；接线 `security*` 系列面板。
- [ ] 新建 `services/hazard.ts`；接线 `majorHazardMock`/`monitoringPointsMock`/`facilityDetailMock` 及 `MajorHazardMapOverlay` 地图引用。

## 5. P2 · 生产 / 工业电视 / 生产通信（需新建 service）

- [ ] `#TODO-确认` 后端契约后新建 `services/production.ts`，接线 `productionMock`/`productionAreaMock`/`productionDeviceMock`。
- [ ] `#TODO-确认` 后端契约后新建 `services/video.ts`，接线 `tvMock`/`videoControlMock`/`videoLinkageMock`（含流媒体，复杂度高，放末位）。
- [ ] `#TODO-确认` 后端契约后新建 `services/communication.ts`，接线 `communicationDeviceMock`。

## 6. P3 · 演练（子应用为主，低优先）

- [ ] 仅确认 `drillRescueMock` 在 SPA 侧引用已随 P0 事故应急接清；`fm-drill` 子应用侧不在本变更范围。

## 7. 守门测试与验证

- [ ] [TDD] 受影响 service 集成测试经 `npm test` 必绿（alarm/emergency/weather）。
- [ ] 按 AGENTS.md §2 矩阵对应行：`npm run type-check` + `npx eslint src/screen/<改动路径> src/services/<改动路径>` 0 error；命令与结果记入 `engineering/qa/`。
- [ ] 接线后 `grep` 确认对应模块 `lib/data/*Mock` import 清零，再删除该 mock 文件。

## 验收标准（Definition of Done）

- [ ] `tasks.md` 全部勾选，验收标准逐条满足（本期以 P0 三模块接线 + 测试绿为最小可验收切片）。
- [ ] 受影响目标 `npm test` / type-check / eslint 0 error（按 §2 矩阵对应行，不连跑四套）。
- [ ] 代码若改变契约/行为，同步 `docs/` 与对应 `docs/UI规范-*.md`（短期记录不写进 docs/）。
- [ ] 提交按 scope 拆分：`type(screen): 描述`，单行成句、禁止 `- ` 分点列表；临时输出文件不入库。
- [ ] L3 完成后即刻写 `engineering/qa/` + `engineering/retro/`，不攒到最后补。
