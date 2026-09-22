# Proposal: 应急辅助信息知识卡点击在地图撒点（演练+应急事件）

## 背景

演练详情页（`/emergency/drill`，由 `fm-rescue` 承载）右侧「应急辅助信息」面板（`RescueAuxiliaryPanel`，`layout="eventCommand"`）当前仅以知识库卡片陈列信息（预案/处置卡/知识库），点击只弹 `InfoDetailDialog`，**不落图**。

用户要求该面板实现「应急事件的效果」：即对齐应急事件页（`SectorEmergencyCommand.vue`）「救援力量浮层 → 地图散点」的呈现——点击后把信息标到地图上。经确认：**保留知识库卡片**（点开详情不变），**点击时同时在地图撒点**，且**演练与应急事件两种模式都改**。

## 变更内容

1. 新增 composable `useAuxiliaryKnowledgeMapView.ts`：持有散点状态（类别名 + 数量）与开/关函数，附撒点上限 `AUXILIARY_KNOWLEDGE_SCATTER_CAP=50`。
2. 新增地图叠加层 `AuxiliaryKnowledgeMapOverlay.vue`：镜像 `RescueDrawerMapOverlay` 做法，用 `coordsForPagedSpread` 把该类别 `count`（封顶）个点在厂区边界内确定性散布（位置示意）；`theme` 驱动配色（accident 蓝 / drill 橙）。
3. `RescueAuxiliaryPanel.vue`：`openItem` 保留 `InfoDetailDialog`，并调用 `openAuxiliaryKnowledgeScatter(label, count)`。
4. `AccidentEmergencyRescue.vue`：地图区（`sceneMode==='default'`）挂载 `AuxiliaryKnowledgeMapOverlay`；`eventId` 变化与 `onUnmounted` 时 `closeAuxiliaryKnowledgeScatter()`。

## 不做的事

- 知识项**无真实地理坐标**，撒点仅作位置示意，不引入后端坐标字段（**无后端/契约变更**）。
- 不改变知识库卡片内容与详情弹窗行为。

## 变更级别

前端呈现增强（`src/screen/**`）。无 API 变更、无 OpenAPI/schema 变更、无类型重新生成需要。
