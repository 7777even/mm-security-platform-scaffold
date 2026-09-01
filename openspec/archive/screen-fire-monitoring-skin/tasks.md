# Tasks: screen-fire-monitoring-skin

## TDD 守门

- [x] [TDD] 新增 `src/styles/tokens.spec.ts`：断言迁移后的关键 token 值（--color-bg #001630、--color-accent #00b4ff、--layout-header-h 77px、--layout-bottom-h 67px、--panel-head-gradient、滚动条 token、四级报警色、--radius-sm 2px），先红后绿

## Token 真源

- [x] `tokens.css` `:root` 大屏块迁移源项目色板（背景/面板/强调/语义/四级报警/文本四阶/点缀色）与渐变 token（--gradient-bg、--panel-head-gradient、--btn 竖向渐变、--gradient-risk）
- [x] `tokens.css` 布局与组件级 token 对齐：header 77px、bottom 67px、圆角 2/4/10px、--glass-blur 0px、滚动条 token、面板标题栏渐变、导航字号 20px、标题发光 token

## 全局样式

- [x] `global.css` 换肤：body 背景、滚动条（8px 渐变 thumb + 发光 + hover）、glass-panel（内发光 + border-glow）、panel-title、stat-card（竖向渐变 + 内发光 + hover）、alarm-card / alarm-list-item（源项目底色 + hover 提亮）、btn（深蓝描边实底默认态 + 竖向渐变主按钮）、list-row / row-alt

## 共享组件

- [x] `PanelCard.vue`：标题栏渐变底 + 底部分隔线 + 18px 白字标题 + 源项目内容区留白
- [x] `AppLayout.vue`：77px 头部渐变底、品牌大标题 38px + 蓝辉光、导航 20px + 底部亮线激活态、预警入口金色（--accent-gold）、时间/用户区对齐源项目
- [x] `BottomMessageBar.vue`：67px 渐变底 + 顶亮线 + 边框对齐源项目消息条

## 收编与同步

- [x] `FireAlarmPanel.vue` 两处硬编码渐变改引 token（tokens.css 新增 --tone-fire-bg / --tone-dcs-bg）
- [x] `element-dark.css` 兜底色对齐新色板（#04111c 主按钮文字、rgb(143 166 200/x) 边框系、语义色 fallback）

## 验证与归档

- [x] `npm run type-check` + `npm run lint` + `npm run stylelint` + `npm run test`（type-check / lint / stylelint 通过；tokens.spec 6/6 全绿；视图 spec 存量失败 8 例经 git worktree HEAD 基线对比为既有环境性问题，非本次引入）
- [x] `npm run build` 成功（vite build 全入口产物完整；`vue-tsc -b` 存量类型错误位于 cesium-cluster / map.spec / fire-alarm records，最后提交 2026-08-28，经核实非本次引入）
- [x] 按《UI规范-大屏端》§7 自检清单核对（深蓝黑底、无后台/移动蓝、渐变主按钮、z-index 五层、token 无硬编码）
- [x] 同步 `docs/UI规范-大屏端.md` 数值表并在文首标注迁移来源
- [x] mgmt / mobile 两端回归确认不受影响；归档变更至 `openspec/archive/`
