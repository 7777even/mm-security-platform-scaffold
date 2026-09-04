# Retro — 二级子应用切换保活（先提案后动手、过确认关卡）

- 日期:2026-09-04
- 关联变更:openspec/changes/wujie-subapp-switch-race/
- 效率等级:L3

## 做得好

- 严格执行规范：先建 openspec 四件套（proposal/design/tasks/spec-delta）→ 过人工确认关卡（用户确认"实现"）→ 再动手，与上一个 Change（wujie-subapp-fullscreen）"先动手后补提案"形成对比，落实了 memory 中的硬规则。
- 定因前置、不猜测：直接读 `wujie-vue3`/`wujie` 源码坐实竞态机制（`window.__WUJIE_QUEUE` 跨实例复用 + `beforeDestroy` 不 destroyApp + `startApp` 失败被 catch 吞掉），而非凭组件局部推断，避免重蹈上一个 Change 误加 `watch` 的覆辙。
- 双保险设计：复用态靠 `watch(subappName)`、卸载态靠 `onBeforeUnmount`，并用 `activeName` 解决"稳定 key 复用后 mountName 滞后"的边界，覆盖了"首次进入 / 子应用间切换 / 切到非子应用"三种场景。

## 问题

- CDP 实证未在本轮完成：因需启动 dev server + 无头浏览器 + Cesium 加载，环境成本较高，暂以静态分析 + 静态守门（eslint/type-check）闭环，动实证列为待补轮次。若后续回归发现问题，可能需补一轮 CDP。

## 原因

- 仅大屏端单文件条件渲染改动，且根因已由依赖源码坐实，故优先交付代码与静态守门；动态实证的环境搭建与上一个 Change 的 CDP 取证复用度低，单独成本偏高。

## 改进方案

- 若 CDP 实证轮次确认根因已消除，则本变更关闭；若仍复现，回到 design.md 的 ADR 评估是否改引入 `alive` 复用策略。
- 长期：为 `WujieHost` 生命周期补 Vitest（mock `wujie-vue3` 的 `destroyApp`），覆盖"子应用→子应用"与"子应用→非子应用"两种销毁路径，消除存量覆盖缺口。
