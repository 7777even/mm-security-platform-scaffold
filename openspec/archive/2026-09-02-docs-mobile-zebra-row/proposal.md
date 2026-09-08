## Why

移动端规范此前对数据列表 / 表格未显式写明「隔行变色」，仅靠 `--row-alt-bg-mobile` token 承载，与后台（§数据表格已强制斑马纹）、大屏（§数据列表开启隔行变色）措辞不统一；`AGENTS.md` §8 第 3 条已把「隔行变色」收口为品牌红线。本提案补移动端规范显式措辞，使三端一致、自检可核查，不新增任何代码 / 视觉 / token 改动。

## What Changes

- `docs/UI规范-移动端.md` §4「卡片与列表」补：「数据列表 / 表格开启**隔行变色（斑马纹）**，复用 `--row-alt-bg-mobile` 提升户外高压阅读下的视觉舒适度（对齐中石化品牌规范与《石化智云 UI 规范》）」。
- `docs/UI规范-移动端.md` §9 代码生成自检清单补对应核对项：「数据列表 / 表格开启隔行变色（斑马纹，复用 `--row-alt-bg-mobile`）」。

## Capabilities

### Modified Capabilities

- `scaffold-foundation`（三端 UI 规范一致性）：移动端规范补隔行变色显式条款，与后台 / 大屏及 `AGENTS.md` §8 品牌红线交叉引用一致。

## Impact

- 仅文档 `docs/UI规范-移动端.md` 改动，无 token / 组件 / 视觉变更。
- 与 `brand-ui-alignment`、`mobile-accessibility-modes`、`docs-brand-redlines` 提案互补，仅补一致性措辞。
- 改动文件：`docs/UI规范-移动端.md`。
