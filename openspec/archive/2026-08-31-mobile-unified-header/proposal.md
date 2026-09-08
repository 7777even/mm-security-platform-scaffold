# 变更提案：移动端统一顶栏组件

## Why

移动端 4 个页面各自手写 `<header>`，呈现 3 种互不一致写法：`profile.vue` 用浅蓝软底 `.profile-header`（内联 `<style>`）、`home.vue`/`messages.vue` 用白卡底 `.mb-brand-header`（写在 `mobile.css`）、`messageHistory.vue` 的 `.mb-header` 甚至**完全没有对应 CSS（裸标签）**。同一端内顶栏视觉语言漂移，且样式归属散落（内联 / 全局 / 缺失），违反 AGENTS.md §5「既有能力优先复用、不要重造」。

用户已拍板：统一到 `home.vue`/`messages.vue` 的 `.mb-brand-header` 样式，并抽成共享组件彻底消除散落。

## What Changes

- 新建 `apps/mobile/components/MobileHeader.vue`：
  - props：`variant: 'brand' | 'back'`（默认 `brand`）、`title: string`（必填）、`subtitle?: string`、`navTo?: string`（默认 `/tasks`，传空串隐藏）、`backTo?: string`（默认 `/messages`）。
  - 统一容器 `.mb-header`：全宽负 margin 出血 + `padding` 含 `env(safe-area-inset-top)`、背景 `var(--card-mobile)`、底部 `1px solid var(--color-border)`；brand / back 共用容器，仅内部元素不同。
  - 所有取值走 token，组件内不硬编码颜色 / 字号 / 边框。
- `home.vue` / `messages.vue`：改用 `<MobileHeader variant="brand" title="安全管控指挥系统" subtitle="茂名石化" />`（nav 默认 导航→/tasks）。
- `profile.vue`：改用 `<MobileHeader variant="brand" title="我的" />`，删除浅蓝软底 `.profile-header*` 内联样式。
- `messageHistory.vue`：改用 `<MobileHeader variant="back" title="通知历史" back-to="/messages" />`，删除裸 `.mb-header`。
- 删除 `mobile.css` 中 `.mb-brand-header*` 系列规则，样式归并入组件 `<style>`。

## Capabilities

- `mobile-unified-header`：移动端统一顶栏组件（品牌头 / 返回头两种变体），视觉与令牌约束收敛到单一真源。

## Impact

- 仅影响移动端（`data-theme='mobile'`）；与无障碍 `data-skin` / `data-elder` 正交叠加，互不干扰。
- 不引入新 token（复用 `--card-mobile` / `--color-border` / `--mb-pad-x` / `--space-*` 等现有令牌）。
- 不触碰后台 `apps/mgmt`、大屏 `screen` 及共享 `src/`。
