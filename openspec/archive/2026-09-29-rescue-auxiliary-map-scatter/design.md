# Design: 应急辅助信息地图落图浮层

## ADR-1：复用救援力量浮层范式

`AuxiliaryKnowledgeMapOverlay` 完全镜像 `RescueDrawerMapOverlay`：同样的 composable 投屏（`useWorldMarkerScreenPositions`）+ 厂区边界确定性散布（`coordsForPagedSpread(index, n, 1, index)`）+ 高度 `getSharedMap().getBoundaryModelTopHeight()`。仅数据源从救援力量改为「应急辅助知识的类别散布点」。

## ADR-2：位置示意而非精确定位

辅助知识无真实经纬度，撒点为「位置示意散布」（厂区边界内确定性分布），与救援力量浮层语义一致（用户要浮层非只散点）。

## ADR-3：生命周期

浮层由 `auxiliaryKnowledgeScatterActive` 控制渲染；`eventId` 变化 / 视图卸载时 `closeAuxiliaryKnowledgeScatter` 复位，避免跨事件残留。
