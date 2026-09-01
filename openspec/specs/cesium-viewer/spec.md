# Capability: cesium-viewer

Cesium.js 三维地图底座（源项目 fire-monitoring 体系迁入）：`SharedCesiumMap` 全局共享壳 + `MaomingPetroCesiumMap` 单一 viewer 实现，经 `sharedCesiumBridge` 全局单例桥向各模块视图暴露受控 API。

## Requirements

### Requirement: 单一 Viewer 与全局共享桥

系统仅存在一个 `Cesium.Viewer` 实例，由 `MaomingPetroCesiumMap` 创建并挂载于 `SharedCesiumMap`；各业务模块不直接持有 viewer，经 `sharedCesiumBridge`（`bindSharedMap` / `getSharedMap` / `onSharedMapReady`）获取受控 expose API，禁止双引擎并存或模块私建 viewer。

#### Scenario: 容器挂载即初始化并广播就绪

- **WHEN** `SharedCesiumMap` 挂载且 WebGL 可用
- **THEN** `MaomingPetroCesiumMap` 创建单一 viewer，emit `ready` 后 `bindSharedMap` 注入 expose 并 `setSharedMapReady(true)` 广播给所有等待方

#### Scenario: 路由驱动的显示与模式

- **WHEN** 路由切换
- **THEN** 由 `config/cesiumMapModes.ts` 的路由元信息解析 `cesium` 可见性与 `mapMode`（fire/production/security/tv/park-overview 等 12 种），`cesiumMapModeOverride` 可页内覆盖；切路由后按 `SKIP_RESTORE_ROUTE_NAMES` 规则决定是否恢复模块默认视角

#### Scenario: 移除默认干扰控件

- **WHEN** viewer 初始化
- **THEN** 隐藏 Cesium 自带 toolbar/animation/timeline/geocoder/credits/infoBox/selectionIndicator 等全部默认 UI，仅保留画布

### Requirement: 底图与世界地形

底图使用 Esri World Imagery（`UrlTemplateImageryProvider`，arcgisonline 瓦片模板），地形使用 `Cesium.Terrain.fromWorldTerrain()`；Ion 访问令牌经 `VITE_CESIUM_ION_TOKEN` 环境变量注入。

#### Scenario: 底图加载

- **WHEN** viewer 初始化
- **THEN** 注入 Esri World Imagery 影像图层，场景底色/地球基色来自 `constants/mapScene.ts` 收编的场景常量

#### Scenario: 令牌缺失不崩溃

- **WHEN** `VITE_CESIUM_ION_TOKEN` 未配置或地形服务不可用
- **THEN** 底图仍可渲染（地形加载失败降级为椭球面），错误经 `.cesium-error` 提示条呈现，不白屏

### Requirement: 茂名石化厂区场景与初始视角

场景聚焦茂名石化厂区（中心约经 110.8863 / 纬 21.6750），默认初始视角（heading/pitch/range）与厂区边界、装置区数据均来自源项目 mapdata；支持 `restoreModuleDefaultView` 恢复模块默认视角与 `flyToWorldPositions` 受控飞行。

#### Scenario: 初始视角

- **WHEN** viewer 就绪且无装置区选中态
- **THEN** 相机位于 MAOMING_PETRO 初始视角（pitch ≈ -38°，range ≈ 2800m，俯瞰厂区）

#### Scenario: 装置区立体渲染与选中

- **WHEN** mapdata 装置区 GeoJSON 加载完成
- **THEN** 装置区以挤出立体块渲染（`usePlantArea` 调色板 + 棱线/侧壁渐变材质，颜色取自 `constants/mapScene.ts`），支持 `setPlantAreaSelection` 选中飞行与标签牌（`plantZoneTagBillboard`）

### Requirement: 渲染暂停与空闲控制

viewer 暴露 `pauseRendering` / `resumeRendering` / `waitForIdle`，供抽屉/浮层打开时节能与飞行动画时序同步。

#### Scenario: 等待相机空闲

- **WHEN** 调用 `waitForIdle()`
- **THEN** Promise 在当前 `camera.flyTo` 等相机动画结束后 resolve
