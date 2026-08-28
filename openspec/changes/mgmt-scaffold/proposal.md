## Why

后台管理端（`apps/mgmt`）在实现布局壳（App.vue T 型布局 / 顶栏时钟 / 适老开关 / 折叠侧栏）与工作台（workbench.vue 卡片网格）时，未纳入 openspec spec-driven 管理，且实现中出现 2 处硬编码色值（App.vue:326、workbench.vue:285），违反 AGENTS.md 红线 1（禁止硬编码颜色）与 `scaffold-foundation`「禁止散落硬编码色值」。本变更补建后台端 capability 规格、补建变更提案，并消除硬编码色值违例，使三端（screen / mgmt / mobile）统一受 spec-driven + superpowers 约束。

## What Changes

- 在 `openspec/specs/mgmt-scaffold/` 下新增后台管理端 capability spec（布局骨架、顶栏、侧栏、工作台卡片网格、token 纪律）。
- 将已提交的后台布局壳与工作台实现纳入上述 spec 验收。
- 在 `src/styles/tokens.css` 的 `[data-theme='mgmt']` 块新增 2 个悬浮态 token（单一真源），并在 `apps/mgmt/App.vue`、`apps/mgmt/views/workbench.vue` 中引用，移除硬编码 `rgb(...)`。

## Capabilities

### New Capabilities

- `mgmt-scaffold`：后台管理端布局壳与工作台，含 token 纪律（禁止硬编码）。

### Modified Capabilities

- 无。

## Impact

- `openspec/specs/mgmt-scaffold/spec.md`：新增能力规格。
- `openspec/changes/mgmt-scaffold/{proposal.md, tasks.md}`：本变更提案与任务。
- `src/styles/tokens.css`：新增 `--mgmt-header-pill-hover-bg`、`--mgmt-card-shadow-hover`。
- `apps/mgmt/App.vue` / `apps/mgmt/views/workbench.vue`：硬编码色值改为 token 引用。
