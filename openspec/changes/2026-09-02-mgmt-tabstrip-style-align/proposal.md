## Why

`apps/mgmt/App.vue` 的 `.mgmt-tab*` 样式未完成 token 化对齐：未选中文字色错用 `var(--text-title-mgmt)`（墨蓝 #1a3550），而 tabstrip 铺在深蓝顶栏上应走白字；未选中/选中背景、下划线也与迁移压缩包（`D:\feishu\ui-redesign.zip` 的 `PcLayout.vue`）及已在 `tokens.css` 定义好的 `--mgmt-tab-*` 系列 token 不一致。既违反 AGENTS.md 红线 #1（token 单一真源、禁止硬编码），也与迁移参考视觉不符。

## What Changes

- 修正 `apps/mgmt/App.vue` 的 `.mgmt-tab` / `.mgmt-tab--on` 等，统一引用 `[data-theme='mgmt']` 顶栏 tab token：`--mgmt-tab-fg`（未选中白字）、`--mgmt-tab-bg`（未选中底，对齐迁移包 10% 白）、`--mgmt-tab-on-bg`（选中 #eff5f9）、`--mgmt-tab-on-fg`（选中主色蓝）、`--mgmt-tab-hover-bg`。
- 字号统一复用 `--mgmt-fz-caption`（12px）；移除错用的 `--text-title-mgmt`、`--card-mgmt` 硬编码背景，并去掉迁移包没有的 `box-shadow` 内嵌下划线，使观感对齐迁移包。

## Capabilities

### Modified Capabilities

- `mgmt-scaffold`：顶栏 tabstrip 样式对齐 token 真源与迁移参考。

## Impact

- `apps/mgmt/App.vue`：仅 `<style>` 内 `.mgmt-tab*` 规则调整，无逻辑/结构改动。
- `src/styles/tokens.css`：复用既有 `--mgmt-tab-*` token，不新增、不改动。
