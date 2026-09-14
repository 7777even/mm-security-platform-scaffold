# Capability: Mgmt Tabstrip Style Align

## ADDED Requirements

### Requirement: 顶栏 tabstrip 样式与迁移包对齐

统一 `apps/mgmt/App.vue` 中 tabstrip 的选中态 / 未选中态 / hover 态视觉表现，使其与 `ui-redesign` 迁移包一致，并消除关闭按钮 hover 不可见、图标不居中的问题。

#### Scenario: 未选中 tab

- **WHEN** tabstrip 中存在未激活页签
- **THEN** 其文字颜色为 `var(--mgmt-tab-fg)`（白字），背景为 `var(--mgmt-tab-bg)`（10% 白色半透明），不使用 `var(--text-title-mgmt)`；字号走 `var(--mgmt-fz-caption)`。

#### Scenario: 选中 tab

- **WHEN** tabstrip 中存在当前激活页签
- **THEN** 其文字颜色为 `var(--mgmt-tab-on-fg)`（主色蓝），背景为 `var(--mgmt-tab-on-bg)`（`#eff5f9`）；不使用 `var(--card-mgmt)` 与内嵌下划线。

#### Scenario: tab hover

- **WHEN** 鼠标悬浮在 tab 上
- **THEN** 未选中 tab 背景变为 `var(--mgmt-tab-hover-bg)`；选中 tab 保持选中态背景与文字色不变。

#### Scenario: 关闭按钮

- **WHEN** 鼠标悬浮在 tab 关闭按钮上
- **THEN** 关闭按钮居中于圆形 hover 底，hover 背景为 `var(--tag-danger-bg)`、文字为 `var(--danger-mgmt)`；选中态 tab 的关闭按钮 hover 不再使用白字落浅底导致不可见。

#### Scenario: 无硬编码

- **WHEN** 检视 `App.vue` 的 `<style scoped>`
- **THEN** tabstrip 相关颜色 / 字号 / 尺寸全部引用 `--mgmt-tab-*` 或 `--mgmt-fz-*` token，无裸色字面量。
