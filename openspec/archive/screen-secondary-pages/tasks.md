# Tasks: screen-secondary-pages

## 资源搬入

- [x] 闭包 117 文件搬入（映射：lib/composables→src/composables、lib/data(geo)→src/services/map-data(/geo)、lib/map→src/utils、lib/weather→src/services/weather、styles→src/styles、views→按功能域 src/views/<feature>），import 别名改写规则同 screen-map-base-replace
- [x] 安装依赖 leaflet、vue-echarts（+@types/leaflet）；vue-echarts 仅 V3 需要，若最终只用 V1 则仅装 leaflet

## 路由与壳层适配

- [x] SECONDARY_ROUTES 注册 9 条 hidden 路由（/dashboard/rescue、/fire-alarm/rescue、/extreme-weather/typhoon、/ops-monitor/area/:facilityId、/ops-monitor/hazards、/ops-monitor/hazards/:hazardId、/ops-monitor/communication、/industrial-video/video-control、/industrial-video/video-wall），perm 沿用模块码
- [x] 页面壳适配：剥离源 AppHeader 顶导航引用（VideoControlPlatform/VideoWallView 等），保留页面级头部与返回导航；核实滚动容器与脚手架壳层无双滚动
- [x] 入口跳转接线：各一级模块面板中源项目跳转点（更多/详情/推演入口）改为 router.push 新路由

## 颜色与规范

- [x] 新增文件 DOM 层颜色 token 化（tokens.css `--map-*` 小节延续），引擎级/canvas 颜色收编 constants/mapScene.ts
- [x] jsdom spec 需 mock 的地图组件（MapPageShell/AccidentRescueMap/ProductionMap）确认不真实加载 Cesium/leaflet

## 验证与归档

- [x] vue-tsc -b / eslint / stylelint 通过（迁移件沿用 @ts-nocheck 定点豁免策略）
- [x] npm run test：存量失败集合不扩大；npx vite build 全入口成功
- [x] dev 冒烟：9 条路由可达、页面渲染、地图页无引擎报错
- [x] 勾选 tasks.md 并归档至 openspec/archive/
