# 任务清单

- [x] 定位漂移：strict 守门报「实现有 / 契约无」GET /security/perimeter-alarms/{id}
- [x] 根因：`security.openapi.json` 该 path key 重复，`get` 被 `put` 覆盖
- [x] 合并两处 path 块为单 key 下 `get` + `put`，校验 JSON 合法且 key 唯一
- [x] 重跑后端 `check-api-contract.mjs --strict` 确认差异合计 0
- [x] 重跑前端 `npm run gen:api-types` 重新生成 `security.ts`
- [x] 提交并推送前端（契约 + 生成类型 + openspec 归档）
