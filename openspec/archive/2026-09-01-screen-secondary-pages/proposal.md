# Proposal: screen-secondary-pages

## Why

用户要求「不止样式迁移，源项目二级页面功能也要整体迁移」。地图底座替换（screen-map-base-replace）只覆盖了一级模块的地图呈现；源项目 fire-monitoring 的 8 个二级页面（应急/救援详情、台风应急、生产区域、重大危险源列表/详情、生产通信、视频控制平台、视频墙）尚未进入脚手架，功能缺失。

## What Changes

- 搬入 8 个页面组件及其依赖闭包（约 117 文件：MapPageShell/AccidentRescueMap/ProductionMap 等 map 变体、约 40 个 panels、video-control/video-wall 组件族、布局件、21 个 composables、17 个 mock、5 个 utils、天气 API、样式 css）
- 新增外部依赖 `leaflet`、`vue-echarts`（卫星云图/台风轨迹底图、曲线图）
- 页面挂载为主壳 AppLayout 的 hidden 二级路由（同 records/plans 模式），按模块归属映射 9 条路由（AccidentEmergencyRescue 复用于 /dashboard/rescue 与 /fire-alarm/rescue）；剥离源项目 AppHeader 顶导航（避免与脚手架壳层双头部），保留页面级头部（返回导航）
- 新增文件颜色 token 化：DOM 层入 tokens.css（`--map-*` 小节延续），引擎级收编 constants/mapScene.ts
- mock 数据随迁（推演/详情类页面源项目即 mock 驱动），存 src/services/map-data/

## Capabilities

- accident-rescue（新增：应急演练/事故救援详情页）
- typhoon-emergency（新增：台风应急详情页）
- production-secondary（新增：生产区域/重大危险源/生产通信二级页）
- video-secondary（新增：视频控制平台/视频墙二级页）

## Impact

- 影响：src/views（8 目录新增）、src/components（约 70 文件）、src/composables、src/services/map-data、src/utils、src/styles、src/router（SECONDARY_ROUTES 扩充）、package.json（leaflet/vue-echarts）
- 风险：源页面与脚手架壳层视觉融合（双头部/滚动容器）；jsdom spec 需 mock 地图组件；约 900 行级 ts-nocheck 迁移件沿用既有豁免策略
