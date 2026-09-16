# Proposal: 移动端处置任务域接后端（契约 + 视图）

## Why

`apps/mobile` 的 `/tasks`、`/tasks/:id`、`/path` 仍走 `data/mock.ts` 的 `tasks` 静态数据
（④-A 冻结清单）。后端本次新增只读域 `tasks`（见后端库同名 Change），前端据此完成
「契约 → 类型 → 服务 → 视图」接线，解除冻结。作为缺端点移动端域的模板域。

## What Changes

- 新增契约 `docs/api/tasks.openapi.json`（tags: `tasks`；`GET /tasks`、`GET /tasks/{id}`；
  schema `TaskItem`/`TaskList`，四铁律齐备：接口有注释 / 字段有中文 description / 有 example）。
- `npm run gen:api-types` 生成 `src/types/generated/tasks.ts`。
- 新增 `src/services/task.ts`（`fetchTasks` / `fetchTaskDetail`）。
- `tasks.vue` / `task-detail.vue` / `path-nav.vue` 改接 `@/services/task`，对齐 ④-E 样板
  （`isOfflineNoBackend()` + `notifyBackendOffline()` + loading/空态/错误态，不回灌假数据）。
- `docs/frozen-prototype.md` 解除三路径冻结；`docs/system-facts.md` 记录本次变更。

## Capabilities

- 「任务中心」列表 / 详情 / 路径规划由后端 `fac_dispatch_task` 驱动（只读），移动端不再有任务 mock。

## Impact

- 仅新增契约 + 服务 + 视图改造，无破坏性改动。回退：恢复 `tasks.vue` 等三视图 + 删 `services/task.ts`。
- `path-nav.vue` 的地图几何（`data/geo.ts`：中心/标注/轨迹）为 by-design 本地数据，不在本次范围。
