# Tasks

- [x] 新增契约 `docs/api/tasks.openapi.json`（`GET /tasks`、`GET /tasks/{id}` + `TaskItem`/`TaskList`）
- [x] `npm run gen:api-types` 生成 `src/types/generated/tasks.ts`
- [x] 新增 `src/services/task.ts`（`fetchTasks` / `fetchTaskDetail`）
- [x] `tasks.vue` 接 `fetchTasks`（列表 + 状态标签 + 卡片跳详情）
- [x] `task-detail.vue` 接 `fetchTaskDetail`（详情 + 未命中空态）
- [x] `path-nav.vue` 接 `fetchTasks`（取首条任务）
- [x] 后端 `check-api-contract --strict` 0 差异（跨库对齐）
- [x] `docs/frozen-prototype.md` / `docs/system-facts.md` 同步
- [x] 前端 `vue-tsc` / `vitest` / `vite build`
