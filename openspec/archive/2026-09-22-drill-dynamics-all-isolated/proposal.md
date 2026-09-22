# Proposal: 演练事件 12–16 响应动态各自独立展示（前端侧）

## 背景

后端 Change `2026-09-22-drill-dynamics-all-isolated`（V64）为演练事件 12–16 各补独立 `fac_accident_incident` 行 + 演练专属动态，使 `GET /accident/rescue-incident?eventId=<N>` 对每个演练事件返回各自独立的 `dynamics`。

## 前端影响

- **无契约变更**：`incident_id` 为后端内部字段不暴露，`dynamics` schema 不变，OpenAPI 与生成类型无差异。
- **无代码变更**：演练页（`AccidentEmergencyRescue.vue` + `RescueDynamicsPanel.vue`）已按 `eventId` 拉后端动态并按事件切换重拉，机制天然支持本次扩展（无需改动）。
- **仅事实基线同步**：`docs/system-facts.md` 追加 2026-09-22 条目，记录 11–16 全部演练事件现已各自独立展示响应动态。

## 变更级别

文档同步（docs-only）。属后端 L4 数据种子扩展的前端对应记录。
