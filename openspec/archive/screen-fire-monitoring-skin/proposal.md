# Proposal: screen-fire-monitoring-skin

## Why

用户要求将 fire-monitoring 大屏项目（mm-UIproject.zip）的视觉样式完整迁移到本脚手架的大屏端，同时保留脚手架既有项目结构、token 单一真源机制与 openspec/superpowers 流程。源项目视觉语言为深藏蓝底（#001630）+ 青蓝强调（#00b4ff）+ 竖向渐变 + 内发光 + 2px 小圆角，与现行大屏 token 值（#0b1526 / #00d8ff / 6-16px 圆角 / 64px 头部）不一致，需整体换肤。经确认：纯 CSS token 化复刻（不搬运 727 张设计切图），范围为全局样式 + 共享组件 + token。

## What Changes

- `tokens.css` `:root` 大屏块换为源项目色板与布局尺寸：背景 #001630、面板 rgb(0 35 75 / 72%)、强调 #00b4ff、语义红 #ff5a4a / 黄 #f0b429 / 绿 #3dd68c、四级报警红橙黄紫、头部 77px、底部 67px、圆角 2/4/10px、滚动条渐变 token、面板标题栏渐变 token、新增金/紫/青绿点缀色 token。
- `global.css` 全局类换肤：滚动条（8px 渐变发光 thumb）、玻璃面板（去 blur 依赖、内发光）、stat-card / alarm-card / alarm-list-item / btn 对齐源项目视觉。
- 共享组件对齐：PanelCard（标题栏渐变 + 18px 白字标题）、AppLayout（77px 头部、38px 发光大标题、20px 导航、底部亮线激活态、预警入口金色）、BottomMessageBar（67px 渐变底）。
- 收编欠账：FireAlarmPanel 两处硬编码渐变 token 化；element-dark.css 兜底色对齐新色板。
- 同步 `docs/UI规范-大屏端.md` 数值表；新增 `tokens.spec.ts` 守门测试（[TDD]）。

## Capabilities

- scaffold-foundation（大屏视觉层 / token 真源）

## Impact

- 大屏端主壳 + 6 个子应用视觉全量变更（wujie token 注入自动携带，子应用零改动）；`apps/mgmt`、`apps/mobile` 因 `data-theme` 覆盖块不受影响，需回归确认。
- 无路由 / 逻辑 / 服务层改动；类名不变，业务面板随 token 自动跟随。
