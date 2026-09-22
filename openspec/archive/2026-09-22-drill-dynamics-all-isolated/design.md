# Design: 演练事件 12–16 响应动态各自独立展示（前端侧）

## 消费侧无需改动

- `RescueDynamicsPanel.vue` 以 `props.eventId` 调 `fetchAccidentIncident(eventId)`，并在 `eventId` 变化时重拉（watcher 已具备），因此后端为每个演练事件返回各自动态后，前端自动按事件展示，无需改代码。
- 演练页经路由 `?eventId=12..16` 进入时，`incident.eventId` 即对应演练事件 id，后端按 `incident_id` 隔离返回，前端无感知差异。

## 文档同步

仅 `docs/system-facts.md` 事实基线追加条目；无 `src/`、无 `docs/api/*.openapi.json`、无 `src/types/generated` 变更。
