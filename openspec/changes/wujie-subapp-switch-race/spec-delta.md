# Spec Delta：二级子应用切换保活

> 适用：L3 / L4。描述本变更对 `openspec/specs/` 的增量：新增 / 修改 / 移除。
> 段落到 Requirement / Scenario 使用 Gherkin 风格（WHEN / THEN），与既有 `spec.md` 同构。

## ADDED Requirements

### Requirement: 二级子应用切换保活

主壳挂载槽在二级子应用页之间切换（及切走再切回）时，须复用同一 `WujieHost` 实例并由 `watch(subappName)` 驱动沙箱生命周期，保证子应用重新正常挂载（≥1 个 wujie iframe），不出现"切回后 0 实例"。

#### Scenario: 从二级子应用切走再切回

- **WHEN** 用户从 `/fire/rescue?eventId=6` 切到 `/fire` 再切回 `/fire/rescue?eventId=6`
- **THEN** 子应用重新挂载，页面出现 ≥1 个 wujie iframe 与子应用页头，不再为空

#### Scenario: 在二级子应用之间切换

- **WHEN** 用户在 `/fire/rescue` 与 `/emergency/drill` 之间导航
- **THEN** 旧子应用沙箱被 `destroyApp` 清理，新子应用正常挂载，无 sandbox 残留

#### Scenario: 子应用启动中快速切走再切回

- **WHEN** 子应用仍在加载（Cesium 脚本未就绪）时用户快速切走再切回
- **THEN** 路由切换不触发 `window.__WUJIE_QUEUE` 跨实例竞态，切回后子应用仍正常挂载

## MODIFIED Requirements

### Requirement: 子应用挂载

`AppLayout` 作为主壳挂载槽，按当前路由 meta 呈现主壳 Chrome（见 `wujie-subapp-fullscreen`）；子应用的**切换生命周期**由稳定 key + `watch(subappName)` 管理：二级子应用页共用稳定挂载槽 key，切换时 `WujieVue.destroyApp(prev)` 清理旧沙箱、WujieVue 内部 watch 自动 startApp 新实例。

#### Scenario: 在一级模块页与二级子应用页之间导航

- **WHEN** 用户在 `/fire` 与 `/fire/rescue` 之间导航
- **THEN** 主壳 Chrome 随之收起/恢复；子应用经复用实例 + watch 驱动重新挂载，不再依赖 `:key="route.fullPath"` 的重建策略

## REMOVED Requirements

无。

## 关联 Spec

- 目标 spec 文件：`openspec/specs/wujie-shell/spec.md`（`### 子应用挂载`）。
- 与 `proposal.md` 的 Capabilities（`wujie-shell`）、`tasks.md` 的验收标准三者一一对应、闭环。
