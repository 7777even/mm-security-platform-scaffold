# 变更提案：二级子应用切换保活（修复切回后实例消失）

> 适用：L3 / L4。须含 Why / What Changes / Capabilities / Impact，≤500 字，聚焦单一变更。

## Why

上一个变更（`wujie-subapp-fullscreen`）修复"两个顶栏"后，遗留现象：从某二级子应用页（如 `/fire/rescue`）切到其它路由再切回，wujie 实例数变为 0、子应用不挂载（已 CDP 取证）。根因经 wujie 源码坐实：`WujieVue`（wujie-vue3）`mounted` 时用全局 `window.__WUJIE_QUEUE[name]` 把**同名** `startApp` 串行化并**跨组件实例复用**，且 `beforeDestroy` 只 `bus.$offAll`、不 `destroyApp`；其 `startApp` 异步链出错仅 `console.log` 吞掉。本项目 `AppLayout` 的 `<RouterView :key="route.fullPath">` 强制每条路由重建 `WujieHost/WujieVue`，叠加 `WujieHost` 的 `onBeforeUnmount` 手动 `destroyApp`——在子应用启动未完成（Cesium 大体积脚本加载中）时切走再切回，新实例复用那条已损坏的全局队列，最终 0 实例。不修则二级子应用页"进得去出不来 / 回不去"，可用性归零。

## What Changes

- `src/components/layout/AppLayout.vue`：将 `<RouterView :key="route.fullPath">` 改为对二级子应用页使用**稳定 key**（如 `isFullscreenSubapp ? 'subapp-slot' : route.fullPath`），使 `WujieHost` 在子应用间切换时**复用**而非重建，避开 `window.__WUJIE_QUEUE` 跨实例复用竞态。
- `src/shell/WujieHost.vue`：用 `watch(subappName, (cur, prev) => ...)` 在子应用间切换时显式 `WujieVue.destroyApp(prev)` 清理旧沙箱；保留 `onBeforeUnmount` 仅在组件真正卸载（子应用→非子应用）时兜底 `destroyApp(mountName)`。
- 不引入 `alive` 常驻（维持用完即毁，避免 WebGL 上下文累积）。

## Capabilities

### Modified Capabilities

- `wujie-shell`：主壳挂载槽对二级子应用的**切换生命周期**改为"实例复用 + watch 驱动销毁"，消除同名 startApp/destroyApp 竞态，保证切走再切回子应用仍正常挂载。

## Impact

- 仅大屏端（`:root`）；不动后台 `apps/mgmt` 与移动端 `apps/mobile`。
- 回归面：所有 `SECONDARY_ROUTES` 内 `subapp` 路由（含一级模块页 `/fire` 等在壳下的页面）的切换行为；主应用页面因去掉 fullPath 强重建改为 Vue Router 默认复用。
- 不触碰 API 契约 / 零下行控制 / B3 包络 / 令牌；不改路由表与 token。

## 人工确认关卡（L3 须过 / L4 实施前须过）

- [ ] 方案选型确认：稳定 key + watch 驱动（而非引入 alive 或保留 :key 重建）。
- [ ] 提案范围与用户确认一致，无需求扩散。
- [ ] 目标端 UI 规范已对齐，未新增硬编码。
- [ ] 高风险项：触及 wujie 主壳生命周期，已明确并取得人工确认。
