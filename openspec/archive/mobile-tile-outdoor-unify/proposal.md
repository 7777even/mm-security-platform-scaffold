# Proposal: mobile-tile-outdoor-unify

## Why

移动端户外模式（`data-skin="outdoor"`）下，快捷四宫格（quick-grid）的 `IconTile` 使用 `variant="solid"`，被 `src/styles/tokens.css` 户外块钉为黑底白图；而其它图标（如个人中心菜单 `variant="soft"`）为白底黑图。两者在户外高反差场景出现「一组黑底、一组白底」的不一致。对照设计说明 `docs/UI规范-移动端.md` §6：户外「层级靠字号与字重拉开，不靠颜色」，且要求「纯白底 + 纯黑字」。因此户外模式不应靠瓦片底色区分 solid/soft，两者应收口为统一的白底黑图。常规态保留 solid（实色底高强调）/soft（浅底低强调）的语义区分不变。

## What Changes

- 修改 `src/styles/tokens.css` 户外块中 `.mb-tile--solid` 的覆盖规则：由 `background: var(--tile-fg); color: var(--color-on-primary)`（黑底白图）改为 `background: var(--tile-bg); color: var(--tile-fg)`（白底黑图），与 soft 一致。
- 同步修正两处注释：tone 块末尾「实色瓦片反相为黑底白图」改为收口一致表述；覆盖规则上方注释说明户外不靠颜色区分层级的依据（§6）。
- 不动 `apps/mobile/components/IconTile.vue` 的 solid/soft 变体定义，常规态行为不变。

## Capabilities

- 无新增 capability；属 `mobile` 端 `IconTile` + 户外皮肤的样式一致性修正。

## Impact

- 影响：`src/styles/tokens.css`（户外块 + tone 注释）。仅影响移动端户外皮肤下的 solid 瓦片（当前仅 `home.vue` 的 quick-grid）。
- 风险：低。户外下白底黑字字形可见（对接 §6 纯白底 + 纯黑字，对比度 21:1）；常规态 solid 仍为实色底白字，未改。
