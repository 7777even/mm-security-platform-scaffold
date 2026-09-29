# Proposal: 应急辅助信息地图落图浮层（rescue-auxiliary-map-scatter）

> 状态：`approved` —— 前端 UI 增强，无对外接口/契约变更。

## Why

应急事件页「应急辅助信息」面板（`RescueAuxiliaryPanel`，知识库布局）此前仅作纯信息展示。用户要求改为「点击类别后在 Cesium 大屏地图上撒点浮层（位置示意散布）」，让辅助信息真正落图，与救援力量浮层体验一致。

## What Changes

- 新增 `lib/composables/useAuxiliaryKnowledgeMapView.ts`：模块级单例状态（active / category / count / scatter cap=60）+ open / close。
- 新增 `components/map/AuxiliaryKnowledgeMapOverlay.vue`：镜像 `RescueDrawerMapOverlay`；`coordsForPagedSpread` 位置示意 + `useWorldMarkerScreenPositions` 投屏 + close 按钮。
- 改 `components/panels/accident-rescue/RescueAuxiliaryPanel.vue`：`openItem` 追加 `openAuxiliaryKnowledgeScatter`（保留原 InfoDetailDialog）。
- 改 `views/AccidentEmergencyRescue.vue`：`#map` 插槽 `sceneMode==='default'` 挂 `<AuxiliaryKnowledgeMapOverlay>`；`eventId` watcher + `onUnmounted` 调 `closeAuxiliaryKnowledgeScatter`。
- 新增 `useAuxiliaryKnowledgeMapView.spec.ts`（5 例 vitest）。

## Impact

- 契约：无对外接口变更，不触发四同步 / 不重生成 TS 类型。
- UI：仅在应急事件页（fm-rescue 子应用）生效；须 `build:subapps(fm-rescue)` 后 dev 才可见。
