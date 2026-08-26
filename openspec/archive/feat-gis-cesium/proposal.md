# feat-gis-cesium — 地图引擎切换 Cesium.js（详细设计对齐）

## Why

《安全管控指挥系统详细设计说明书（提纲，刘明华+钟瑜均合并版）》4.2.2.2「地图集成服务(map)」明确要求：

> 基于 Cesium.js 引擎构建二三维一体化时空底座，接收南向 WMS/WMTS 地图服务，提供空间位置匹配与路径规划算法接口。

当前脚手架地图为 **双引擎分离** 实现（OpenLayers 2D + Three.js 3D），与详细设计要求的 **Cesium.js 二三维一体化** 不符。按「详细设计为上游权威、脚手架为执行方」的原则，本 change 将地图底座切换为 Cesium.js 单引擎二三维一体化，作为后续 GIS 相关功能（电子地图/视频联动）的统一地基。

## What Changes

- 引入 `cesium` 依赖，替换 `ol` 与 `three` 双引擎。
- 新增 `src/services/cesium.ts`：Cesium 初始化（viewer 配置、瓦片底图、初始相机）、图层/点位/区域渲染抽象，保持 `fetchAlarmPoints/fetchDevicePoints/fetchRiskZones` 数据源不变。
- 新增 `src/components/cesium/BaseMap.vue`：Cesium viewer 容器组件（懒加载、WebGL 检测、降级提示、P9 打点），替代 `dashboard` 中 OL 地图 + `FactoryScene.vue` 3D 场景的双组件结构。
- `src/views/dashboard/index.vue`：2D/3D 切换改为 Cesium 二三维一体化视图切换（单一 viewer，2D/3D 为相机/投影模式切换）。
- 保留：`services/map.ts` 数据层、`constants/map.ts` 瓦片配置、P9 `baseMapMs` 预算打点、`detectWebGL` 降级、零下行红线。
- 删除：`ol`、`three`、`@types/three` 依赖及其相关组件/测试。
- 文档：`docs/perf/` 补 Cesium 首屏基线；spec 并入「二三维一体化地图底座」能力。

## Capabilities

- **Cesium 二三维一体化**：单一 viewer 内 2D（Columbus View / 2D 投影）与 3D（SceneMode 切换），数据图层共享同一实体数据源。
- **点位/区域渲染**：报警点（等级色）、设备点（状态色）、风险区域（评分色面）在 Cesium 中渲染，点击报警点浮窗。
- **瓦片可配置**：沿用 `VITE_MAP_TILE_URL`，生产同源离线瓦片、开发可公网预览。
- **性能预算**：P9 `baseMapMs` 继续打点，新增 Cesium 初始化耗时度量。
- **降级兜底**：WebGL 不可用或 Cesium 加载失败时降级提示，不白屏。

## Impact

- **依赖变更**：移除 `ol`/`three`/`@types/three`，新增 `cesium`（约 300MB 包体积，需评估分包与构建配置）。
- **文件变更**：
  - 新增 `src/services/cesium.ts`、`src/components/cesium/BaseMap.vue` 及其 spec
  - 重写 `src/views/dashboard/index.vue`（地图部分）
  - 删除 `src/components/three/FactoryScene.vue`、`FactoryScene.spec.ts`
  - 更新 `vite.config.ts`（cesium 静态资源 copy 插件）
- **性能风险**：Cesium 是重型引擎，首屏体积显著增大；需保证 P9 ≤2s 红线，必要时将 cesium 拆为独立 chunk 懒加载。
- **真机风险**：Cesium WebGL 在石化窗（Chromium 86）+ 弱 GPU 的兼容性需 G1 真机复核，本 change 仅做浏览器级验证。

## Non-Goals

- 不接入天地图 WMTS 真实密钥（仍用占位瓦片/可配置 URL）。
- 不实现地图标绘/框选/路径规划等后续功能（归「电子地图/视频」模块）。
- 不做 Cesium 与 3D Tiles 倾斜摄影模型接入（依赖真实数据源，G1 后）。
- 不实现移动端地图。

## Verification

- `services/cesium.spec.ts`：viewer 配置参数、点位/区域数据映射（纯函数部分 TDD）。
- `BaseMap.spec.ts`（jsdom）：WebGL 不可用降级、容器渲染、卸载清理。
- `dashboard` 手测：2D/3D 切换、点位/区域渲染、点击浮窗、实时流刷新。
- 全量 `vitest` + `vue-tsc` + `eslint` + `vite build` 绿。
- 性能基线文档更新。
