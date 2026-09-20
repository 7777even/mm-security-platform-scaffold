# Design: 大屏应急事件新增落库接线

## 数据流（POST-first）

1. 用户在 `EmergencyEventCreateModal` 提交 → `EmergencyEventListPanel.handleCreateSubmit`。
2. `createFireEmergencyEventFromForm(payload)` 组装 `EmergencyEventCreateRequest`（scene 固定 `FIRE`，
   地图撒点经 `stagePercentStringToWorldPosition` 得经纬度）。
3. `await createEmergencyEvent(req)` → 成功拿回 `EmergencyEventItem`（真实 `id`）。
4. 以真实 id 写入本地 store（`manual-*` 分组）→ 选中、切 tab、回第 1 页（列表乐观展示）。
5. 若带 `?create=event` intent → `goToEventDispose(event, 'replace')` 直达处置页。

## 为什么成功后不写 sessionStorage 草稿（关键）

救援页（`AccidentEmergencyRescue.vue`，fm-rescue 子应用）`loadIncident()` 会先
`getFireEmergencyEventById(eid)`：命中 `sessionStorage` 草稿（`isLocalDraft=true`）时走
`buildIncidentFromLocalEvent`（仅前端精简字段）。若成功落库后仍写草稿，救援页会**命中草稿而短路**，
拿不到后端完整的处置聚合（调度资源、值班、辅助统计等）。

因此：**成功落库 → 不写草稿**，救援子应用在本地内存/草稿里找不到该事件，自然回落到后端
`/accident/rescue-incident`（后端已同事务写入 `fac_accident_incident`），拿到完整数据。
**失败（弱网/离线）→ 写草稿**，救援页走 `buildIncidentFromLocalEvent` 前端闭环展示（原有兜底）。

## 跨子应用内存隔离

fm-emergency 与 fm-rescue 是独立 JS 实例，模块级单例不共享；唯二跨边界通道是 `sessionStorage`
（草稿）与后端。本变更让「后端」成为成功路径的跨边界通道，`sessionStorage` 退居失败兜底。

## 异步与导航竞态

`handleCreateSubmit` 改 async 后，弹窗可能在 `await` 期间 emit `close`。故**先**把 `createSubmitInFlight`
置真，避免 `closeCreateModal` 提前清掉 `?create=event`；非 intent（手动新增）在 await 后重置该标志。
