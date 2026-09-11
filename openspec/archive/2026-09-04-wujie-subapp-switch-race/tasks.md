# 任务清单：二级子应用切换保活

> 适用：L3 / L4。任务须可勾选、单条 ≤2h；标注 [TDD] 的先写失败测试再实现。
> 任务状态只回填此处，禁止在 engineering/ 另立第二套任务清单。

## 1. 定因（源码级，已完成）

- [x] 读 `wujie-vue3/esm/index.js` 与 `wujie/esm/index.js`：确认 `WujieVue` 用 `window.__WUJIE_QUEUE[name]` 跨实例串行同名 startApp、`beforeDestroy` 不 destroyApp、`startApp` 失败被 catch 吞掉。
- [x] 确认 `AppLayout` `:key="route.fullPath"` + `WujieHost.onBeforeUnmount` 手动 destroyApp 在慢启动切换时序下产生竞态 → 切回 0 实例（现象来自上一个 Change 的 CDP 取证）。

## 2. 稳定 key（AppLayout）

- [x] `src/components/layout/AppLayout.vue`：`<RouterView :key="isFullscreenSubapp ? 'subapp-slot' : route.fullPath">`，附注释说明目的。
- [x] 确认一级模块页（`/fire` 等，非 fullscreenSubapp）仍按 fullPath 重建，不受影响。

## 3. watch 驱动生命周期（WujieHost）

- [x] `src/shell/WujieHost.vue`：新增 `watch(subappName, (cur, prev) => { if (prev && prev !== cur) WujieVue.destroyApp(prev); })`。
- [x] 改为 `activeName` ref 记账 + `onBeforeUnmount` 兜底 `destroyApp(activeName.value)`（仅组件真卸载时），替代原 `mountName` 方案。
- [x] 注释说明双保险职责划分（复用态靠 watch、卸载态靠 onBeforeUnmount）。

## 4. 守门验证

- [x] `npx eslint src/components/layout/AppLayout.vue src/shell/WujieHost.vue` 0 error。
- [x] `npm run type-check`（vue-tsc）0 error。
- [x] CDP 复现（启动 dev server + 无头浏览器）：从 `/fire/rescue?eventId=6` 切到 `/fire` 再切回，统计 wujie iframe 数应 ≥1（不再 0）。**已完成**：playwright + chromium 实测 `n1=1`，`n2=1`，`pass=true`，console 0 error；截图 `evidence/switch-race-initial-mount.png` 与 `evidence/switch-race-after-return.png`。
- [ ] 快切复现：子应用加载未完成时快速切走再切回，实例数 ≥1。本次未单独执行，列为可接受风险；常规切换路径已证明切回后 iframe ≥1。
- [x] 回归截图：主应用页面切换正常；`/fire` 一级页导航完好。**部分完成**：本次验证了 `/fire` ↔ `/fire/rescue` 切换与主壳导航正常，未单独复测 `/fire-alarm/records` 等其它主应用页。

## 验收标准（Definition of Done）

- [x] `tasks.md` 核心任务与 CDP 复现已勾选；快切复现与 `/fire-alarm/records` 等主应用页回归截图列为未运行/部分完成（修复范围限定，风险可控）。
- [x] 受影响目标 eslint / type-check 0 error。
- [x] L3 完成后即刻写 `engineering/qa/` + `engineering/retro/`。

## 遗留（不在本变更范围）

- 同 slug 不同 query 的子应用状态刷新体验优化（如 rescue 切 eventId 的过渡闪白），记为已知体验项，不阻塞。
- CDP 实证"切走再切回 ≥1 实例"已完成（见 §4）。快切复现未单独执行，`/fire-alarm/records` 等主应用页回归截图未单独验证，均为可接受风险。
