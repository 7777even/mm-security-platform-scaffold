## Why

大屏端地图底座（`SharedCesiumMap`/`MaomingPetroCesiumMap`，Cesium）当前无可见地图工具栏，用户无法在界面上直接放大/缩小/复位视角、切换 2D/3D、开关图层。UI规范-大屏端 §3 与 §10.1 明确要求提供常驻地图工具栏（图层/区域/搜索/测距测面/三维视角/热力模式/视图复位），且 `tokens.css` 已预留 `--map-tool-*` 令牌。本次补齐工具栏 UI 与基础地图操作（放大/缩小/复位/图层/三维视角），热力/区域/搜索/测距按钮先占位（后端未就绪），对齐规范玻璃+科技青视觉语言。

## What Changes

- 新增大屏组件 `src/components/map/MapToolBar.vue`：右侧竖状常驻地图工具栏，玻璃+科技青发光样式（仅大屏 `:root`），z-index 用 `--z-chrome(10)`，垂直居中覆盖在 Cesium 画布之上并避让右侧 419px 面板（`right: calc(--layout-aside-w + --space-md + --space-lg)`），挂载于 `SharedCesiumMap.vue`。
- `MaomingPetroCesiumMap.vue` 的 `expose` 新增 `zoomIn()`/`zoomOut()`/`toggleSceneMode()`/`getSceneMode()`；`sharedCesiumBridge.ts` 接口与桥接函数新增对应方法。
- 复位复用 `restoreSharedMapModuleView()`；图层复用 `toggleMapLayerPanel()`。
- 热力/区域/搜索/测距按钮为占位态（灰色+点击 `ElMessage` 提示「敬请期待」），不接后端。

## Capabilities

### New Capabilities

- `screen-map-toolbar`：大屏地图底座右侧竖状常驻工具栏，提供放大/缩小/复位/图层/三维视角基础操作，热力/区域/搜索/测距占位。

### Modified Capabilities

- `cesium-viewer`：viewer expose 扩展 `zoomIn`/`zoomOut`/`toggleSceneMode`/`getSceneMode`。

## Impact

- 仅大屏端（`:root`）受影响；不动后台 `apps/mgmt` 与移动端 `apps/mobile`。
- 样式全部引用 `tokens.css`（`--map-tool-*`/`--glass-*`/`--color-accent`/`--z-chrome`），不硬编码。
- 改动文件：`MapToolBar.vue`(新)、`MaomingPetroCesiumMap.vue`、`sharedCesiumBridge.ts`、`SharedCesiumMap.vue`。
