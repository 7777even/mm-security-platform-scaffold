## Why

品牌要求 1–6（《石化智云 UI 规范》/ 中石化品牌）此前已分别落到三端 UI 规范文档，但 `AGENTS.md`（AI 改代码前的唯一入口）仅有户外皮肤一行零散提及，未把品牌条款收口成红线；要求 3.5（2 空格缩进 / HTML5 `DOCTYPE`+`UTF-8`）更是仅由 `.prettierrc.json` + `index.html` 工程配置实际满足，未作为品牌条款写入任何文档。这导致 AI 后续改动时不易在入口层看到完整品牌约束，存在降级风险。本提案聚焦把 1–6 + 3.5 收口进 `AGENTS.md` 红线清单，不新增任何视觉 / 代码改动，与既有 `brand-ui-alignment`、`mobile-accessibility-modes` 提案互补（仅补入口层红线，不重复实现）。

## What Changes

- `AGENTS.md` 文末新增 §8「品牌规范对齐（中石化 / 《石化智云 UI 规范》）」，列出 7 条红线：① Logo 回主页 ② 弹性间距 16/24 ③ 隔行变色 ④ 微软雅黑 + 少即是多配色 ⑤ 移动端户外高反差（2px 黑硬描边）⑥ 适老 / 高易用（行高 1.8 倍）⑦ 2 空格缩进 + HTML5；每条交叉引用三端规范章节与对应 token / 组件，注明「偏离需回规范文档确认，不得擅自降级」。

## Capabilities

### Modified Capabilities

- `scaffold-foundation`（AI 编码入口约束）：`AGENTS.md` 新增品牌红线清单，与三端 UI 规范交叉引用一致，使品牌硬约束在入口层可见、可核查。

## Impact

- 仅文档 `AGENTS.md` 改动，无代码 / 视觉 / token 变更，不影响任何端运行与既有主题基调。
- 3.5 落地现状：`.prettierrc.json`（`tabWidth:2`）+ `index.html`（`<!DOCTYPE html>` + `UTF-8`）已实际满足，提案仅补文档声明，提交前 prettier / stylelint 钩子继续兜底。
- 既有 `brand-ui-alignment`、移动端无障碍模式实现不受影响。
- 改动文件：`AGENTS.md`。
