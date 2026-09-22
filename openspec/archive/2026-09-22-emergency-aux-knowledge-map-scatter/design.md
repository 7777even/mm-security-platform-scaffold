# Design: 应急辅助信息知识卡点击在地图撒点

## 复用的现成机制

应急事件页（`SectorEmergencyCommand.vue`）的「救援力量浮层」已实现「类别 → 地图散点」：

- 状态：`useRescueStrengthView`（模块级单例 composable）+ `useRescueDrawerActive`。
- 图层：`RescueDrawerMapOverlay.vue`，用 `useWorldMarkerScreenPositions` 把世界坐标投屏为 DOM 标点。
- 坐标：`coordsForPagedSpread(indexInPage, itemsOnPage, page, itemId)`（`rescueMapCoords.ts`）在厂区边界多边形内做**确定性散布**。

本次**完全沿用**该模式，仅替换数据源与状态载体，不新增坐标算法。

## 新增件

### `useAuxiliaryKnowledgeMapView.ts`

- `auxiliaryKnowledgeScatterActive` / `auxiliaryKnowledgeCategory` / `auxiliaryKnowledgeCount`（模块级 `ref`，跨组件共享）。
- `openAuxiliaryKnowledgeScatter(category, count)` / `closeAuxiliaryKnowledgeScatter()`。
- `AUXILIARY_KNOWLEDGE_SCATTER_CAP = 50`：知识项统计数量可能偏大，封顶避免海量 DOM 标点。

### `AuxiliaryKnowledgeMapOverlay.vue`

- 依据 `auxiliaryKnowledgeScatterActive` 渲染 `min(count, CAP)` 个标点，`mapKey` 含类别名；
- 坐标 `coordsForPagedSpread(index, n, 1, index+1)`；高度取 `getSharedMap()?.getBoundaryModelTopHeight?.() ?? 72.05`；
- `theme` prop 决定配色（accident 蓝 / drill 橙），与右侧面板 `theme` 一致。

## 接线

- `RescueAuxiliaryPanel.openItem`：保留详情弹窗，追加 `openAuxiliaryKnowledgeScatter`。
- `AccidentEmergencyRescue.vue`：`<AuxiliaryKnowledgeMapOverlay v-if="sceneMode === 'default'" :theme="panelTheme" />`；`incident.value.eventId` watcher 与 `onUnmounted` 调 `closeAuxiliaryKnowledgeScatter()`。

## 边界与取舍

- **位置示意**：知识项无坐标，散点语义为「该类资料在厂区内的示意分布」，非真实点位；已在注释与 spec 中显式标注。
- **主题**：drill/event 共用组件，`theme` 由视图 `panelTheme` 透传，保证两模式配色各自正确。
- **不落图项**：`rescue` 布局（救援力量统计）仍保持纯展示（`openItem` 仅对 `eventCommand` 生效）。
