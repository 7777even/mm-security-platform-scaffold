# 任务清单：大屏数据接入接线（mock→service）

> L3。任务可勾选、单条 ≤2h；[TDD] 先写失败测试再实现。任务状态只回填此处（AGENTS.md §4）。

## 1. P0 样板 · 消防报警（service 已就绪）

- [x] 结构对齐审计：比对 `services/alarm.ts` 的 `AlarmItem`/`DashboardOverview`/`AlarmTrendPoint` 与 `fireAlarmListMock` 返回，列出缺失/错位字段。结论：通用 `AlarmItem` 缺消防域专有字段（typeLabel/typeTone/objectType/objectName/source/falseAlarm/monitorId(s)/rescueEventId/level 阈值文本），type/level 分类体系与规范 AlarmItem 不同维度 → 采用方案 A 新增消防域 `FireAlarmItem` 富模型。
- [x] 扩展 `services/alarm.ts`：新增 `FireAlarmItem` 接口 + `fetchFireAlarmPage(page,size)`（B3 包络 + `useDevMock` 降级，dev fixture 镜像原 `fireAlarmListMock` 10 模板/50 行，status 映射 ACTIVE/CLOSED）。后端契约（/fire-alarms 端点、type/level 分类）标 `#TODO-确认`。
- [x] 接线 `src/screen/components/common/FireAlarmListDialog.vue`：移除 `fireAlarmListMock` 数据导入，改调 `fetchFireAlarmPage`（dev 自动降级）；筛选项来自新建 `alarmMeta.ts`；状态列按规范 `ALARM_STATUS_META` 着色+标签（选项 A）；`fireListItemToDetail` 改接 `FireAlarmItem`（`alarmId`/`status`/`rescueEventId:Number`）。
- [x] [TDD] 写 `src/services/alarm.spec.ts`：覆盖 `VITE_API_BASE` 缺失时回退 fixture（10 条/页、total 50、alarmId 连续跨页）、有 base 时走 `request('/fire-alarms')` 两条路径；`npx vitest run` 3 passed。

## 2. P0 样板 · 事故应急（service 已就绪，体量最大）

- [ ] 结构对齐审计：`accidentRescueMock` 各导出类型 vs `emergency.ts`/`emergencyEventStore`/`emergencyPlanStore`。
- [ ] 接线 `src/screen/views/AccidentEmergencyRescue.vue` 与 accident-rescue 面板（RescueDutyPanel / RescueAuxiliaryPanel / AccidentInfoPanel 等）消费对应 service/store，dev 降级。
- [ ] 接线 `drillRescueMock` 复用点（PreliminaryGuidancePanel / IncidentDetailPanel / RescueDynamicsPanel）改消费 service。
- [ ] [TDD] 补 `src/services/emergency.spec.ts` 关键路径（strength / 事件 CRUD 降级）。

## 3. P0 样板 · 极端天气 / 台风（真实外部 API）

- [ ] 结构对齐审计：`weatherMock`/`typhoonEmergencyMock`/`satelliteCloudMapMock` vs `services/weather/*` 真实返回。
- [ ] 接线 `src/screen/components/layout/WeatherEntry.vue`、`WeatherDetailsDialog.vue` 与台风视图消费 `services/weather/*`。
- [ ] [TDD] 复用既有 `services/weather/*.spec.ts`（chinaRadar / fengyun / himawari）补「无 key 时降级」用例。

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
