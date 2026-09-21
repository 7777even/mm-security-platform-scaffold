# Design: 应急指挥首页面板明细接入真实数据

## 决策

- **契约优先**：先由后端同 Change 更新 `docs/api/emergency.openapi.json`，再 `gen:api-types` 重生成，最后接线组件。
- **明细渲染**：复用既有 `InfoDetailDialog`（系统「更多=弹对话框」先例），新增可选 `items` 列表区（`primary`/`secondary`），
  不引入新对话框组件，保持暗色视觉一致。
- **无明细源降级**：4 个无 ledger 源的类别（装备车辆/应急场所/医疗机构/消防设施）弹窗给统一说明
  「该类别为统计口径，暂无逐项明细台账。」，不虚构内容。

## 数据流

`fetchEmergencyStrength()` → `resources[].items` → `openStat()` 选中 → `statFields`/`statItems` → `InfoDetailDialog`。
`fetchEmergencyKnowledge()` → `items[].description` → `openItem()` → `itemFields['说明']`。

## 风险

- 内容溢出：明细最多 20 项，列表区 `max-height:320px` + `overflow:auto`。
- 类型：`services/*` 手写接口与生成类型并存，以契约字段名为准（`items`/`name`/`meta`/`description`）。
