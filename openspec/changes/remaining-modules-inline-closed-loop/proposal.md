# 其余模块二级界面内嵌闭环（对齐消防报警范式）

## Why

消防报警、工业电视、生产应急、安全防恐四个模块已落地「模块级单例 composable + InteractionLayer 分发 + ScreenDialog 深蓝弹窗」的内嵌闭环范式（见 `openspec/archive/fire-alarm-interactions`）。压缩包 `fire-monitoring` 还含重大危险源、视频监控墙、视频控制平台、台风应急、生产区域、生产通信、事故应急救援、极端天气 8 个模块，脚手架当前仅有骨架/路由页或静态假数据，点击多为空壳/死链。需把这些模块全部补齐到同一标准，满足"全部都要加内嵌闭环"。

## What Changes

对 8 个模块分别：

1. 新增 `use<Module>Interaction.ts` 模块级单例调度（openKind/isOpen/openXxx/close）。
2. 新增 `<Module>InteractionLayer.vue` 分发层，挂载于模块视图。
3. 按行为语义新建/复用二级界面（深蓝 ScreenDialog；视频墙复用 `VideoWallDialog`、一键调度复用 `OneKeyDispatchDialog`、图标用 `PkgIcon`、图片占位用压缩包位图）。
4. 接线现有面板点击 → `ia.openXxx`，替换 emoji/静态占位与 `console.warn` 空壳。

## Capabilities

- 8 个模块均具备点击面板 → 模块内二级界面（不离开模块）的内嵌闭环。
- 复用既有 mock 数据与共享组件，不重复造轮子、不改共享/路由/tokens。

## Impact

- 影响面：`src/composables/`、`src/components/<module>/`、`src/views/<module>/` 新增与接线；不影响已完成的 4 模块与路由。
- 风险：低。仅新增组件与接线，保留现有面板/地图底座；严守零硬编码色、状态色映射、z-index 五层 token 等红线。
