## Why

移动端（`apps/mobile`，根节点 `data-theme="mobile"`）在实现布局壳（App.vue 底部标签栏 / 内页顶栏）、首页（home.vue hero 统计 + 模块入口）时，未纳入 openspec spec-driven 管理，且实现中出现 1 处硬编码色值（home.vue:314 的 `rgb(255 255 255 / 18%)`），违反 AGENTS.md 红线 1（禁止硬编码颜色）。本变更补建移动端 capability 规格、补建变更提案，并消除硬编码色值违例，使三端（screen / mgmt / mobile）统一受 spec-driven + superpowers 约束。

## What Changes

- 在 `openspec/specs/mobile-scaffold/` 下新增移动端 capability spec（布局骨架、底部标签栏、首页 hero、token 纪律、户外强光皮肤约定）。
- 将已提交 / 在制的移动端布局壳与首页实现纳入上述 spec 验收。
- 在 `src/styles/tokens.css` 的 `[data-theme='mobile']` 块新增 hero 统计块 token（单一真源），并在 `apps/mobile/views/home.vue` 中引用，移除硬编码 `rgb(...)`。

## Capabilities

### New Capabilities

- `mobile-scaffold`：移动端布局壳与首页，含 token 纪律（禁止硬编码）。

### Modified Capabilities

- 无。

## Impact

- `openspec/specs/mobile-scaffold/spec.md`：新增能力规格。
- `openspec/changes/mobile-scaffold/{proposal.md, tasks.md}`：本变更提案与任务。
- `src/styles/tokens.css`：新增 `--mb-hero-stat-bg`。
- `apps/mobile/views/home.vue`：硬编码色值改为 token 引用。
