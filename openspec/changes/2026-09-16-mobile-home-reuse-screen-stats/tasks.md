# Tasks

- [x] `home.vue` 告警概览改由 `fetchAlarmPage`（`/alarms`，大屏同源）按 `type` 聚合
- [x] `alarmTotal` 取分页 `total`；类型→标签/图标/色档由 `TYPE_META` 映射
- [x] 待办任务接 `/tasks`（`fetchTasks`）；`pendingCount` = 非「已完成」
- [x] 事件条接 `/emergency-events`（`fetchEmergencyEvents`）；0 条不渲染
- [x] 未读计数接消息中心 `fetchMessages`（`/messages`）
- [x] 删除无引用的 `apps/mobile/data/mock.ts`
- [x] 前端 `vue-tsc` / `vitest` / `vite build`
- [x] `docs/system-facts.md` 同步
