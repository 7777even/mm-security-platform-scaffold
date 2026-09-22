# Spec Delta: 应急辅助信息知识卡点击在地图撒点

## 变更的能力

`screen-data-wiring`（新增 Requirement）。

## ADDED Requirement: 事故救援/演练详情页应急辅助信息落图

事故应急救援 / 演练详情页（`AccidentEmergencyRescue.vue`，drill 与 event 共用）右侧「应急辅助信息」面板的知识库卡片，点击时须同时：

- 打开 `InfoDetailDialog` 展示知识主题 / 条目 / 说明（既有行为保持不变）；
- 按该卡片统计数量，在 Cesium 地图厂区范围内确定性撒点（位置示意），drill 主题橙色、event 主题蓝色。

知识项无真实地理坐标，撒点仅作位置示意；单次撒点数量须封顶（`AUXILIARY_KNOWLEDGE_SCATTER_CAP`），避免统计口径大数渲染海量 DOM 标点；切换事件或离开页面时须清理散点。

#### Scenario: 点击知识卡落图

- **WHEN** 在演练 / 应急事件详情页右侧「应急辅助信息」点击某知识卡（如「危险化学品泄漏处置 · 9 条」）
- **THEN** 地图上出现该类别 9 个散点标记（携带类别名）确定性散布在厂区范围内，且同时弹出该知识主题详情

#### Scenario: 大数封顶

- **WHEN** 该类别统计数量超过 `AUXILIARY_KNOWLEDGE_SCATTER_CAP`（50）
- **THEN** 地图仅渲染上限个散点

#### Scenario: 事件切换 / 离开清理

- **WHEN** 切换事件（`eventId` 变化）或离开详情页
- **THEN** 已渲染的散点标记全部清除

#### Scenario: 主题着色

- **WHEN** 演练模式（`theme=drill`）点击知识卡
- **THEN** 散点标记为演练橙色主题；应急事件模式（`theme=accident`）为蓝色主题
