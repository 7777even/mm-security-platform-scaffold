# Tasks

- [x] 新增契约 `docs/api/drills.openapi.json`（`GET /drills`、`GET /drills/{id}` + 4 schema）
- [x] `npm run gen:api-types` 生成 `src/types/generated/drills.ts`
- [x] 新增 `src/services/drill.ts`（`fetchDrills` / `fetchDrillDetail`）
- [x] `drills.vue` 接 `fetchDrills`（列表 + 状态派生 chip + 卡片跳详情）
- [x] `drill-detail.vue` 接 `fetchDrillDetail`（详情 + 任务子项 + 未命中空态）
- [x] 后端 `check-api-contract --strict` 0 差异
- [x] `docs/frozen-prototype.md` / `docs/system-facts.md` 同步
- [x] 前端 `vue-tsc` / `vitest` / `vite build`
