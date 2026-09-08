# 任务清单：docs 品牌红线收口至 AGENTS.md

- [x] 在 `AGENTS.md` 文末新增 §8「品牌规范对齐（中石化 / 《石化智云 UI 规范》）」，列出 1–6 + 3.5 共 7 条红线，每条交叉引用三端规范章节与对应 token / 组件，并注明「偏离需回规范文档确认，不得擅自降级」。
- [x] 核对 1–6 落点与三端规范既有条款一致：① Logo 回主页（大屏 `.brand` / 后台顶栏 / 移动 `MobileHeader` brand 变体）② 弹性间距 16/24（后台间距基线、大屏 `4/8/16/24`、移动 `16px`）③ 隔行变色（`--row-alt-bg` / `--row-alt-bg-mobile`）④ 微软雅黑（`--font-family-zh` 首位）⑤ 户外 2px 黑描边（`.tag` 类 `--tag-stroke:#000; --mb-border-w:2px`）⑥ 适老 1.8 行高（`--mb-line-height` 覆写）；3.5 与 `.prettierrc.json`（`tabWidth:2`）+ `index.html`（`DOCTYPE`+`UTF-8`）配置一致。
- [x] 验证 `AGENTS.md` 文案无冗余、与各端规范引用无冲突，确认本次仅为文档红线收口、无代码改动。
