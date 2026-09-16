# Tasks

- [x] 新增契约 `docs/api/msds.openapi.json`（`GET /msds`、`GET /msds/{cas}` + 3 schema）
- [x] `npm run gen:api-types` 生成 `src/types/generated/msds.ts`
- [x] 新增 `src/services/msds.ts`（`fetchMsdsList` / `fetchMsdsDetail`）
- [x] `msds.vue` 接 `fetchMsdsList`（列表 + 名称/CAS 检索 + 卡片跳详情）
- [x] `msds-detail.vue` 接 `fetchMsdsDetail`（按 CAS 详情 + 未命中空态）
- [x] 后端 `check-api-contract --strict` 0 差异
- [x] `docs/frozen-prototype.md` / `docs/system-facts.md` 同步
- [x] 前端 `vue-tsc` / `vitest` / `vite build`
