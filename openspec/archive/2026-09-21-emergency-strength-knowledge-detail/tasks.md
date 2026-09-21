# Tasks: 应急指挥首页面板明细接入真实数据

> 唯一任务真源；完成即勾选（`[x]`），全勾后同交付内归档。

- [x] 1. `gen:api-types` 重生成（含 StrengthItem / items / description）
- [x] 2. `services/emergency.ts` 加 `StrengthItem` + `items`
- [x] 3. `services/knowledge.ts` 加 `description`
- [x] 4. `InfoDetailDialog` 加可选 `items` 列表区（含样式）
- [x] 5. `EmergencyRescuePanel` 用真实 items，删除写死 RESCUE_DESC
- [x] 6. `SafetyKnowledgePanel` 用真实 description
- [x] 7. `type-check` 通过
- [x] 8. `eslint` 0 error
- [x] 9. `build:subapps`（SUBAPP=fm-emergency）通过
- [x] 10. 按 scope 提交推送；合并 spec-delta 并归档本 Change
