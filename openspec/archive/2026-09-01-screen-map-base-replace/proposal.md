# Proposal: screen-map-base-replace

## Why

用户要求大屏地图底座直接采用 fire-monitoring 源项目（`mm-UIproject.zip`）的实现，替换脚手架现有天地图瓦片 + Cesium 实体聚合方案。源项目底座为 Esri World Imagery 影像 + 世界地形 + 茂名石化厂区立体渲染（装置区 GeoJSON 立体挤出、发光 Shader、悬停交互），点位用 HTML/Vue 覆盖层 + worldToScreen 屏幕锚定——与脚手架方案差异是体系级的，混搭不可行，需整体替换。

## What Changes

- 新增地图组件体系（自源项目原样迁移）：`SharedCesiumMap.vue`、`MaomingPetroCesiumMap.vue`、`config/cesiumMapModes.ts`、`composables/sharedCesiumBridge.ts`、`composables/useCesiumScreenAnchor.ts`、8 个地图 Overlay、`MapMarkerIcon.vue`、`spriteConfig.ts`。
- 静态资源全量搬入 `public/`：`mapdata/`（厂区贴图 map.png 24.9MB、配准图、边界/装置区/疏散路线 GeoJSON）、`design/`（点位 sprite 切图 39MB）、`icons/`。
- 数据适配层 `services/map-adapter.ts`（[TDD]）：脚手架现有 `/map/alarms`、`/map/devices` 接口数据 → 覆盖层 WorldMarker 输入形状；消防车队、重大危险源等暂无后端接口的 Overlay 以源项目 mock 数据驱动（标记 TODO 后续接接口）。
- cesium 1.119 → 1.142（保留现有 viteStaticCopy + CESIUM_BASE_URL 方案，不引入 vite-plugin-cesium，避免多入口注入副作用）。
- 删除旧体系：`components/cesium/BaseMap.vue`、`services/cesium.ts`、`services/cesium-cluster.ts`、`constants/map.ts`、`components/map/`（MapBottomTools/MapFloatTools/MapDetailPanel/MapClusterPopup）及对应 spec。
- 接线：`dashboard/index.vue`、`fire-alarm/index.vue` 改用 SharedCesiumMap + 覆盖层。
- 颜色处理：HTML/CSS 覆盖层样式 token 化（对齐红线）；Cesium 材质/Shader/调色参数为引擎级渲染参数，集中收编至 `constants/mapScene.ts` 单一模块（CSS 变量无法进入 WebGL 材质）。
- 重写 specs：`cesium-viewer`、`map-layers`、`map-markers`（破坏性变更）。

## Capabilities

- cesium-viewer（破坏性）
- map-layers（破坏性）
- map-markers（破坏性）

## Impact

大屏中央地图的底图、地形、点位呈现、交互全部更换；`dashboard`、`fire-alarm` 两个消费视图与地图相关测试重写。子应用（wujie 注入 token 机制）与后台/移动端不受影响。仓库体积约 +65MB（用户已确认全量搬入资源）。
