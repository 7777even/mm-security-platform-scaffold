# Tasks: screen-map-base-replace

## 资源与依赖

- [x] 静态资源搬入 `public/`：`mapdata/`（map.png/配准图/GeoJSON）、`design/` sprite 切图、`icons/`；核实 vite `assetsInclude` 覆盖 `*.pgw`/`*.geojson`（中文 GeoJSON 文件名在解压时乱码，已按内容识别重命名为 装置区/边界/疏散路线.geojson）
- [x] cesium 1.119 → 1.144：更新 package.json 并安装；viteStaticCopy 目录核实；lerc alias 改顶层 `node_modules/lerc/LercDecode.js`；移除已消失的 zip-no-worker alias；build target 提升至 es2020（lerc 依赖链含 BigInt 字面量，Chromium 86 原生支持）
- [x] 源项目组件体系搬入：`SharedCesiumMap.vue`、`MaomingPetroCesiumMap.vue`、`config/cesiumMapModes.ts`、`composables/sharedCesiumBridge.ts`、`composables/useCesiumScreenAnchor.ts`、8 个 Overlay、`MapMarkerIcon.vue`、`spriteConfig.ts`，依赖的源项目 mock 数据一并搬入（标注兜底数据来源）

## 数据适配（TDD）

- [x] [TDD] 新增 `services/map-adapter.spec.ts` 先红：脚手架 `MapPoint`（/map/alarms、/map/devices）→ 覆盖层 `WorldMarkerAnchor` / MonitoringPoint 形状映射（字段映射、经纬度透传、缺省值、id 前缀防冲突）
- [x] 实现 `services/map-adapter.ts` 至全绿
- [x] 覆盖层 HTML/CSS 样式 token 化：hex 颜色替换为 tokens.css 引用（新增 `--map-*` 专用 token 小节；Cesium 引擎级颜色收编 `constants/mapScene.ts`，见下）

## 视图接线与旧体系清理

- [x] `dashboard/index.vue`：BaseMap → SharedCesiumMap + 覆盖层，clusterPoints/sceneMode 相关代码替换为 adapter 输出
- [x] `fire-alarm/index.vue`：同上接线（含 ModuleLayout 收敛 props、security-anti-terror/industrial-video/ops-monitor 移除旧 zones/cluster 引用）
- [x] 删除旧体系：`components/cesium/`（BaseMap 及 spec）、`services/cesium.ts`、`services/cesium-cluster.ts`（及 spec）、`constants/map.ts`（天地图/NIGHT_GRADING）、`components/map/` 旧组件（MapBottomTools/MapFloatTools/MapDetailPanel/MapClusterPopup）及 `map.spec.ts` 旧断言；同步清理 router/menu 等引用
- [x] 新增地图场景常量模块 `constants/mapScene.ts`：集中收编 Cesium 引擎级颜色参数（材质/Shader/调色），标注来源

## 规格同步

- [x] 重写 `openspec/specs/cesium-viewer/spec.md`：Esri World Imagery 底图 + 世界地形（Ion token 环境变量）、茂名石化初始视角、装置区立体渲染、渲染暂停/空闲控制
- [x] 重写 `openspec/specs/map-layers/spec.md`：图层控制改为源项目 mapMode 体系（12 种模式 + expose API 受控图层）
- [x] 重写 `openspec/specs/map-markers/spec.md`：点位呈现改为 HTML 覆盖层 + worldToScreen 锚定、数据接口契约（map-adapter）

## 验证与归档

- [x] `npm run type-check`（vue-tsc -b 全量 0 错误）+ `npm run lint` + `npm run stylelint` 通过（迁移文件保留 @ts-nocheck 并定点豁免 ban-ts-comment，约 900 处存量类型债不在本次范围内）
- [x] `npm run test`：新适配层测试 10/10 全绿，删除的旧 spec 不再引用；存量失败集合不扩大（8 例失败经 HEAD 基线 worktree 复跑确认全部存量）
- [x] `npx vite build` 全入口成功（es2020 target）
- [x] dev 冒烟：dashboard 壳层与面板正常渲染；子应用直开验证 `.shared-cesium-map`/`.acc-markers` 挂载成功；无 `VITE_CESIUM_ION_TOKEN` 时优雅降级显示错误提示条（完整底图视觉验证需配置令牌后人工确认）
- [x] 归档变更至 `openspec/archive/`
