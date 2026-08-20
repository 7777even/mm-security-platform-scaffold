# Capability: cesium-viewer

Cesium.js 二三维一体化地图底座（单一 viewer，共享同一实体数据源）。

## Requirements

### Requirement: 单一 Viewer 初始化

Cesium 地图使用单一 `Cesium.Viewer` 实例承载 2D/3D 视图，所有图层与点位/区域共享同一实体数据源，禁止双引擎（OpenLayers + Three.js）并存。

#### Scenario: 容器挂载即初始化

- **WHEN** `BaseMap` 组件挂载且 WebGL 可用
- **THEN** 通过 `viewerFactory` 创建单一 viewer 注入容器，并记录 P9 `baseMapMs` 打点

#### Scenario: 移除默认干扰控件

- **WHEN** viewer 初始化
- **THEN** 关闭 `geocoder` / `timeline` / `animation` / `baseLayerPicker` / `sceneModePicker` / `navigationHelpButton` / `fullscreenButton` 等默认 UI 控件，仅保留画布

### Requirement: 2D / 3D 一体化切换

同一 viewer 内通过 `sceneMode` 在 2D（SceneMode.SCENE2D）与 3D（SceneMode.SCENE3D）间切换，数据图层不重建。

#### Scenario: 切换场景模式

- **WHEN** `sceneMode` prop 由 `3d` 变为 `2d`（或反向）
- **THEN** 调用 `scene.morphTo2D` / `scene.morphTo3D`，并 emit `mode-change`

#### Scenario: WebGL 不可用降级

- **WHEN** `detectWebGL()` 返回 false
- **THEN** 不初始化 viewer，emit `error`，渲染降级提示（不白屏）

### Requirement: 相机复位

提供复位到初始工厂视角（厂区中心 + 合适高度）的能力。

#### Scenario: 复位视角

- **WHEN** 调用复位（工具栏或 `resetView`）
- **THEN** `camera.flyTo` 回到初始 `FACTORY_CENTER` / `FACTORY_HEIGHT`
