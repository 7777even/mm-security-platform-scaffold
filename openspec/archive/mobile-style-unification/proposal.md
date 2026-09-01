## Why

移动端（`apps/mobile`，`data-theme="mobile"`）在 scaffold 阶段由多视图分别实现，出现系统性样式不一致：① 大量硬编码颜色/间距/字号/圆角/尺寸（如 `#fff`、`16px`、`56px`、`32px`、`22px`），违反 AGENTS.md 红线 1（禁止硬编码，一律引用 `tokens.css` 单一真源）；② 多个视图重复定义 `mobile.css` 已有的共享类（`.mb-menu__*`、`.mb-switch`、`.mb-empty`、`.mb-chip`），造成维护分裂；③ `messages.vue`/`MessageFilterTabs.vue` 中 `height:32px` 内联胶囊按钮违反 UI规范-移动端 §3.4 触控 48–56px。需整端统一。

## What Changes

- 在 `src/styles/tokens.css` 的 `[data-theme='mobile']` 块补移动端尺寸刻度：图标尺寸 `--mb-ico-xs/sm/md/lg/xl/play`、`--mb-chevron` 22、`--mb-empty-pad` 56；户外皮肤同步（仅反相颜色，尺寸不变）。
- 36 个移动端视图/组件的 `<style>` 块：硬编码值改为 token 引用；重复 UI 片段改用 `mobile.css` 共享类（删本地定义）；32px 胶囊改用 `.mb-chip`/`.mb-btn-ghost`（48px）。
- `mobile.css` 补 `.mb-menu__ico--green/blue/orange/red` 软底修饰类（引用既有 `--mb-menu-*-soft`）。

## Capabilities

### New Capabilities

- 无（属既有 `mobile-scaffold` 能力内的样式纪律增强）。

### Modified Capabilities

- `mobile-scaffold`：样式统一纪律（token 单一真源 + 共享类复用）纳入验收。

## Impact

- `src/styles/tokens.css`：`[data-theme='mobile']` 新增尺寸刻度 token。
- `apps/mobile/styles/mobile.css`：补 `.mb-menu__ico--*` 修饰类。
- `apps/mobile` 下 36 个视图/组件：引用 token、复用共享类、去硬编码。
- 验证：stylelint + `vite build` + `/apps/mobile/` 三页视觉抽查。
