# 设计文档：二级子应用切换保活

> 适用：L3 / L4。记录架构决策、取舍、风险与依赖。L1 / L2 不建此文件。
> 与本变更 `proposal.md` / `tasks.md` / `spec-delta.md` 四者闭环，人工确认后才动手。

## 目标与约束

- 设计目标：从任一二级子应用页切到其它路由再切回，子应用必须重新正常挂载（≥1 个 wujie iframe），中间切换不残留、不泄漏 sandbox。可被 `tasks.md` 验收标准逐条印证。
- 硬约束：三端不迁移视觉语言（仅大屏 `:root`）；不引入 `alive` 常驻（WujieHost 注释明确其会累积 iframe/WebGL 上下文）；z-index 五层 token 不变；不改 API 契约。

## 架构与方案

- 根因（已源码坐实）：`WujieVue` 在 `mounted` 注册/复用 `window.__WUJIE_QUEUE[name]`，把同名 `startApp` 全局串行；`beforeDestroy` 不 `destroyApp`；`startApp` 异步链失败被 `catch` 吞掉（`wujie-vue3/esm/index.js:125-211`、`wujie/esm/index.js:50-219`）。本项目 `:key="route.fullPath"` 强制重建 + `onBeforeUnmount` 手动 `destroyApp` 在"慢启动中切走再切回"时序下，新实例复用损坏队列 → 0 实例。
- 修复策略（双保险）：
  1. **稳定 key**：`AppLayout` 的 `<RouterView>` 对子应用页用稳定 key，使 `WujieHost` 实例在子应用间复用，不再因路由变化反复重建 `WujieVue`，从而不触发 `window.__WUJIE_QUEUE` 跨实例复用。
  2. **watch 驱动生命周期**：`WujieHost` 内 `watch(subappName, (cur, prev) => { if (prev && prev !== cur) WujieVue.destroyApp(prev); })`，在"子应用→子应用"切换时清理旧沙箱（WujieVue 内部 `$watch(name+url)` 会自动 startApp 新实例）。
  3. **卸载兜底**：保留 `onBeforeUnmount(() => WujieVue.destroyApp(mountName))`，仅用于组件真正卸载（子应用→非子应用时 key 变化导致实例销毁）时清理。

## 决策记录（ADR）

- 决策 1：稳定 key（`isFullscreenSubapp ? 'subapp-slot' : route.fullPath`）而非直接移除 `:key` — 理由：仅隔离子应用挂载槽，主应用页面仍按 fullPath 重建，回归面最小；反对项：需在 AppLayout 计算子应用态，轻微增加耦合。
- 决策 2：生命周期用 `watch(subappName)` 而非仅靠 `onBeforeUnmount` — 理由：去掉 `:key` 重建后实例复用，`onBeforeUnmount` 不再每次切换触发；watch 能在切换时拿到 prev 精确销毁，正回应原注释"watch 在 key 重建下拿不到 prev"的痛点。
- 决策 3：不引入 `alive` — 理由：WujieHost 注释确认常驻会累积 Cesium/WebGL 上下文；本方案用完即毁、watch 精确销毁，内存可控。

## 风险与缓解

| 风险                                       | 可能影响           | 缓解措施                                                                           |
| ------------------------------------------ | ------------------ | ---------------------------------------------------------------------------------- |
| 主应用页面去掉 fullPath 强重建后行为变化   | 个别页面依赖硬刷新 | 仅子应用页改稳定 key，主应用页仍 fullPath；回归 3 条主应用路由                     |
| 同 slug 不同 query 复用导致子应用状态错乱  | params/mode 未刷新 | `subappName` 含 path+query 哈希，WujieVue 内部 watch 命中 name 变化会重新 startApp |
| watch 与 onBeforeUnmount 双重 destroy 报错 | 重复 destroy 异常  | `destroyApp` 对未注册 name 为幂等 no-op（`wujie/esm/index.js:328`），安全          |
| Cesium 大子应用切换闪白/重加载             | 体验               | 接受（task-12 smoke 已确认经验可接受），记录为已知体验项                           |

## 依赖

- 上游：`route.meta.subapp` / `hidden` 约定、`WujieVue` 内部 `window.__WUJIE_QUEUE` 与 `$watch(name+url)` 行为。
- 下游：`SECONDARY_ROUTES` 内全部 `subapp` 路由及其子应用。
- 待确认：无。
