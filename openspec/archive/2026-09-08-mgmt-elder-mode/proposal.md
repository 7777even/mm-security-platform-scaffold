## Why

后台管理端（`apps/mgmt`）顶栏「适老」按钮点击后无任何视觉响应，违反 `mgmt-scaffold` spec「适老开关由各端 token 适老档承接」约束（spec.md 第 17 行）。根因有二：① `src/styles/tokens.css` 从未新增 `[data-theme='mgmt'][data-elder='on']` 适老档，故切换根节点属性后无 CSS 接管；② `apps/mgmt/App.vue` 的 `toggleElder` 用 `toggleAttribute('data-elder', true)` 写入空值属性，与移动端 `data-elder='on'` 约定及 token 选择器不一致，CSS 永远不匹配。

## What Changes

- 在 `src/styles/tokens.css` 的 mgmt 块后新增 `[data-theme='mgmt'][data-elder='on']` 适老档：字号放大至不低于标准档（正文 16 / 页标题 30 / 区块 24 / 小标题 18 / 辅助 14 / 筛选 15）、控件与行高放大（筛选 48 / 主按钮 40 / 表格行高 56 / 侧栏 ≥48）、正文对比加深（`--color-text` 加深至 `#1a3550`），状态标签保持浅底深字描边（沿用全局类，不重定义）。
- 修正 `apps/mgmt/App.vue` 的 `toggleElder`：写入 `data-elder="on"`（与移动端一致），并经 `localStorage`（键 `mm-mgmt-elder`）持久化偏好，刷新后恢复；账号级记忆由后端承接（不在前端范围）。
- 补 `openspec/specs/mgmt-scaffold/spec.md` 适老模式要求，闭合 spec 缺口。

## Capabilities

### New Capabilities

- 无。

### Modified Capabilities

- `mgmt-scaffold`：新增后台端适老模式（字号 / 密度放大）要求，闭合「适老档承接」缺口。

## Impact

- `src/styles/tokens.css`：新增 `[data-theme='mgmt'][data-elder='on']` 块。
- `apps/mgmt/App.vue`：`toggleElder` 改写入 `data-elder="on"` 并加 `localStorage` 持久化。
- `openspec/specs/mgmt-scaffold/spec.md`：新增适老模式 Requirement。
