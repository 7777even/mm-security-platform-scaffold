# Capability: screen-map-toolbar

大屏端地图底座（`SharedCesiumMap`/`MaomingPetroCesiumMap`，Cesium）常驻地图工具栏，提供基础地图操作入口。

## Requirements

### Requirement: 常驻工具栏 UI

大屏地图底座覆盖一层常驻工具栏，仅 `:root` 大屏端渲染；样式引用 `tokens.css` 的 `--map-tool-*`/`--glass-*`/`--color-accent`，z-index 用 `--z-chrome(10)`，不硬编码颜色/尺寸，不与大屏禁止项（浅底白卡/#1677ff 等）冲突。

#### Scenario: 工具栏挂载于地图底座

- **WHEN** 大屏任意模块渲染地图底座
- **THEN** 工具栏覆盖在 Cesium 画布之上，且地图拖拽/旋转交互不受影响

### Requirement: 基础地图操作

工具栏提供放大、缩小、复位、图层、三维视角 五个可用操作，分别经 `sharedCesiumBridge` 调用 `MaomingPetroCesiumMap` expose 的 `zoomIn`/`zoomOut`/`restoreModuleDefaultView`/`toggleMapLayerPanel`/`toggleSceneMode`。

#### Scenario: 放大与缩小

- **WHEN** 点击放大/缩小
- **THEN** 相机沿当前视线方向按当前高度比例推进/拉远，地图视角变化

#### Scenario: 三维视角切换

- **WHEN** 点击三维视角
- **THEN** 在 2D 与 3D 场景模式间切换（`scene.morphTo2D/3D`），按钮回显当前模式

### Requirement: 占位控件

热力模式、区域、搜索、测距测面 四个按钮为占位态（禁用视觉 + 点击提示「敬请期待」），不接后端真实能力。

#### Scenario: 占位点击

- **WHEN** 点击占位按钮
- **THEN** 显示「敬请期待」提示，不触发任何地图副作用
