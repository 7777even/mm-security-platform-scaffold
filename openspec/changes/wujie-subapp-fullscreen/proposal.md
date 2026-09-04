# 变更提案：二级子应用页全屏渲染

> 适用：L3 / L4 改动（业务能力 / 高风险）。L0–L2 不建此文件。
> 约束：本文件须含 Why / What Changes / Capabilities / Impact 四节，控制在 500 字内，聚焦单一变更（openspec/config.yaml）。

## Why

二级子应用页（`/fire/rescue`、`/emergency/drill` 等）是自带页头的全屏大屏视图，但在 `src/router/index.ts` 中这批路由被定义在 `SECONDARY_ROUTES`（11–214 行）内，而后者是 `AppLayout`（`path: '/'`，216–223 行）的 `children`。因此渲染时被主壳包裹，页面顶部同时出现主壳 §7 顶栏与子应用自带 `rescue-header`，即用户反馈的"两个顶部栏"。CDP 取证已排除多实例：该路由仅 1 个 wujie iframe、1 个 `wujie-app`、shadow DOM 内 1 个 `.rescue-header`。不修则大屏全屏视图（Cesium 一张图）长期被顶栏与消息栏挤压，视口不完整。

## What Changes

- `src/components/layout/AppLayout.vue`：新增 `isFullscreenSubapp` computed（`route.meta.subapp === true && route.meta.hidden === true`），在该条件下用 `v-if` 收起 §7 顶栏 `<header class="header">` 与 §11.2 底部 `<BottomMessageBar />`；`<main class="content">` 保持 `flex: 1` 自然占满。
- 判定条件同时要求 `hidden`：一级模块页（`/fire`、`/emergency`…，由 `menu.ts` 装配）同样带 `subapp: true`，但用户依赖主壳导航切换模块，不得收起。
- 撤销 `src/shell/WujieHost.vue` 中此前修复该问题时加的 `watch(subappName)` 销毁逻辑——A/B 验证表明它对本次现象无效。
- 不新增 / 修改 token，不改路由表。

## Capabilities

### Modified Capabilities

- `wujie-shell`：主壳挂载槽对二级子应用页切换为全屏渲染，收起主壳顶栏与消息栏，避免与子应用自带页头叠加。

## Impact

- 仅大屏端（`:root`）受影响；不动后台 `apps/mgmt` 与移动端 `apps/mobile`。
- 受影响路由：`SECONDARY_ROUTES` 内 `subapp && hidden` 的 9 条二级子应用页（`/fire/rescue`、`/emergency/drill`、`/emergency/typhoon`、`/production/area/:facilityId`、`/production/hazards`、`/production/hazards/:hazardId`、`/production/communication`、`/tv/video-control`、`/tv/video-wall`）。
- 不受影响：一级模块页（`/fire`、`/emergency`、`/security`、`/tv`、`/production`）与所有非 subapp 主应用页。
- 契约与权限语义：不触碰零下行控制 / B3 包络 / 20 位 MDM / 防重放签名 / 令牌内存态，不改权限语义与状态流转。
- 依赖与回归面：依赖 `route.meta` 的 `subapp` / `hidden` 约定与 `BottomMessageBar`；不触及 `src/screen` 存量与 Cesium 内核；无既有 Vitest 覆盖 AppLayout。

## 人工确认关卡（L3 须过 / L4 实施前须过）

- [ ] 提案范围与用户确认一致，无需求扩散、无自造平行任务。
- [ ] 目标端 UI 规范（docs/UI规范-大屏端.md）已对齐，未新增硬编码，端间视觉语言未混用。
- [ ] API 契约（AGENTS.md §3）未违反。
- [ ] 高风险项：触及 wujie 主壳布局（AppLayout 挂载槽），已明确并取得人工确认。
