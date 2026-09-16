# Design: 移动端处置任务域接后端

## 契约与类型

- 契约真源 `docs/api/tasks.openapi.json`（后端不复制第二份）。
- `npm run gen:api-types` 由契约生成 `src/types/generated/tasks.ts`（不手写类型）。

## 服务层

- 新增 `src/services/task.ts`：`fetchTasks()` / `fetchTaskDetail(id)`，直连 `/tasks`、`/tasks/{id}`。
- 契约类型在该文件内声明（与既有 `video.ts` / `specialOperation.ts` 同范式）。

## 视图接线

- `tasks.vue`（列表）、`task-detail.vue`（详情）、`path-nav.vue`（取首条任务）统一走 ④-E 样板：
  `isOfflineNoBackend()` 短路 + `notifyBackendOffline()` + `try/catch` 空态，**不回灌假数据**。
- 列表卡片改为 `RouterLink → /tasks/:id`（原为静态卡片，补齐详情入口）。

## 边界

- `path-nav.vue` 的地图几何（`data/geo.ts`：中心 / 标注 / 轨迹）为 by-design 本地数据，不在本次范围。
- `tasks.vue` 的旧内联演示数组删除（非 `mock.ts`，但同属 mock 数据）。
