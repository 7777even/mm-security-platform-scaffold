# 变更提案：移动端补齐 15 个缺失页面并对齐 ui-redesign 样式

## Why

`apps/mobile/router.ts` 已按参考项目 `ui-redesign` 声明全部 35 条移动端路由，但其中 15 条指向的视图文件在磁盘上不存在（`anomalies` / `contacts` / `duty` / `event-detail` / `event-resources` / `events` / `login` / `map` / `order-detail` / `orders` / `path-nav` / `patrol-exec` / `settings` / `task-detail` / `ticket-exec`）。任一懒加载被触发即构建/运行时报错，移动端入口当前实际处于**不可用**状态。

同时，样式迁移只完成到"基础设施层"：`tokens.css` 移动端令牌、`mobile.css` 共享类库、`data/mock.ts` 与 `data/geo.ts` 数据已齐备（含 `.mb-calendar` / `.mb-switch` / `.mb-safe-bar` 等专为未建页面预留的类），但页面层未落地，参考项目的样式资产无法被走查与验收。

## What Changes

- 新建上述 15 个视图，页面集合与参考项目 `src/views/mobile/` 一一对应；顶栏统一复用 `MobileHeader`（`variant="back"` + 路由 `meta.title`）。
- 版面一律复用 `mobile.css` 既有共享类（`.mb-card` / `.mb-stack` / `.mb-detail` / `.mb-timeline` / `.mb-seg` / `.mb-menu` / `.mb-switch` / `.mb-calendar` / `.mb-safe-bar` …），页面 `<style scoped>` 只保留自身特有版式。
- `mobile.css` 补齐参考项目中反复出现、但尚无共享承载的 6 组类：`.mb-auth*`（登录居中外框）、`.mb-legend*`（地图图例）、`.mb-search*`（搜索框）、`.mb-textarea` / `.mb-photo` / `.mb-steps*`（工单处置）、`.mb-upload` / `.mb-stepno`（操作票执行）、`.mb-select`（筛选下拉）、以及 `.mb-page--bar`（固定操作条的页面底部留白）。
- 参考项目中所有硬编码色值（`#8AA0B3` / `#22C55E` / `#FA8C16` / `#F5222D` / `#0B5ED7` / `#ffe0b8` / `#b9770e` / `#7C5CFF` 等）映射为对应 token；登录页的 `linear-gradient` 背景按 AGENTS.md §4「渐变仅限大屏」改为纯色软底。
- 触控热区统一 ≥48（`--mb-row-h`），底部流程页（巡查执行 / 操作票执行）用 `.mb-safe-bar` 固定主操作条。

## Capabilities

- 新增 `mobile-views-parity`：移动端页面集合与参考项目对齐，全部 35 条路由可解析、可构建。

## Impact

- 仅影响移动端 `apps/mobile/`；不触碰大屏 `screen`、后台 `apps/mgmt`。
- `mobile.css` 为纯新增类，不改动既有规则（无回归面）。
- 不新增 token：全部复用 `tokens.css` 现有变量；`data-skin="outdoor"` / `data-elder` 无障碍皮肤自动跟随。
