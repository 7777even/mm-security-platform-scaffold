# Tasks: 契约 PUT/DELETE 路由对齐至 /{id}

## 契约真源（Task 1）

- [x] `docs/api/fire-monitoring.openapi.json`：将 `PUT` / `DELETE /fire/patrols` 从集合路径迁至 `/fire/patrols/{id}`（operation 已含 `id` path 参数，仅迁 path key）
- [x] `docs/api/security.openapi.json`：将 `PUT` / `DELETE /security/bollards` 迁至 `/security/bollards/{id}`
- [x] `docs/api/security.openapi.json`：将 `PUT` / `DELETE /security/gate-controls` 迁至 `/security/gate-controls/{id}`

## 生成类型（Task 2）

- [x] `npm run gen:api-types`：33 域全成功（security / fire-monitoring 路径图新增 /{id}，schema 不变）
- [x] `vue-tsc --noEmit` 无新增错误（service 仅 import `components` schema，路径图改动不影响编译）

## 守门（Task 3）

- [x] `node scripts/check-api-contract.mjs --strict`：路由差异 0 / schema 漂移 0（原 12 条预存路由差异全部消化）
- [x] 前端 contract-guard 等价校验（后端 main 实现 ⇄ 前端契约）偏差 0

## 收尾（Task 4）

- [x] 归档本 Change 并推送 `feature/scaffold-rebuild`（契约真源变更，需连带生成类型一并入库）
