# Spec Delta：二级子应用页全屏渲染

> 适用：L3 / L4。描述本变更对 `openspec/specs/` 的增量：新增 / 修改 / 移除。
> 段落到 Requirement / Scenario 使用 Gherkin 风格（WHEN / THEN），与既有 `spec.md` 同构。

## ADDED Requirements

### Requirement: 二级子应用页全屏渲染

主壳须在渲染自带页头的二级子应用页（`meta.subapp === true && meta.hidden === true`）时收起自身 Chrome（§7 顶栏与 §11.2 底部消息栏），使子应用页头成为页面唯一顶部栏，视口完整交给子应用（Cesium 一张图）。

#### Scenario: 打开事故应急救援页

- **WHEN** 用户访问 `/fire/rescue?eventId=6`
- **THEN** 不渲染主壳 `.header` 与底部消息栏，仅渲染子应用自带 `rescue-header`，地图与面板占满视口

#### Scenario: 打开一级模块页

- **WHEN** 用户访问 `/fire`（一级模块页，`subapp: true` 但无 `hidden`）
- **THEN** 主壳顶栏、模块导航与底部消息栏完整保留，用户可在模块间切换

#### Scenario: 打开非子应用主应用页

- **WHEN** 用户访问 `/fire-alarm/records`
- **THEN** 主壳 Chrome 完整保留，行为不变

## MODIFIED Requirements

### Requirement: 子应用挂载

`AppLayout` 作为主壳挂载槽，须按当前路由 meta 决定是否呈现主壳 Chrome：二级子应用页（`subapp && hidden`）全屏渲染，其余路由保留 Chrome。挂载本身仍由 `<WujieVue>` 按 `meta.subappUrl` 完成，不受影响。

#### Scenario: 在一级模块页与二级子应用页之间导航

- **WHEN** 用户在 `/fire` 与 `/fire/rescue` 之间导航
- **THEN** 主壳 Chrome 随之收起 / 恢复，子应用实例按既有 `:key="route.fullPath"` 策略重建

#### Scenario: 子应用页头唯一性

- **WHEN** 任一二级子应用页完成挂载
- **THEN** 页面可视区域内只有一个顶部栏，即子应用自带页头

## REMOVED Requirements

无。

## 关联 Spec

- 目标 spec 文件：`openspec/specs/wujie-shell/spec.md`（`## 接口与契约` → `### 子应用挂载`）。
- 与 `proposal.md` 的 Capabilities（`wujie-shell`）、`tasks.md` 的验收标准三者一一对应、闭环。
