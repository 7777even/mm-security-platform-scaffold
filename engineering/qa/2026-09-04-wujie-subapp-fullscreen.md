# QA — 二级子应用页全屏渲染（消除顶部栏重复）

- 日期:2026-09-04
- 效率等级:L3（大屏壳布局呈现，触及 wujie-shell 主壳挂载槽）
- 范围:`src/components/layout/AppLayout.vue`（新增 `isFullscreenSubapp` 条件渲染）；`src/shell/WujieHost.vue`（撤销此前无效 `watch`）；仅大屏端 `:root`，不动后台 `apps/mgmt` 与移动端 `apps/mobile`。

## 验收口径

- 二级子应用页（`meta.subapp === true && meta.hidden === true`，如 `/fire/rescue`、`/emergency/drill`）渲染时，主壳 §7 顶栏与 §11.2 底部消息栏收起，页面仅保留子应用自带页头。
- 一级模块页（`/fire`、`/emergency`…，同样 `subapp: true` 但无 `hidden`）主壳顶栏、模块导航、底部消息栏完整保留，可在模块间切换。
- 非 subapp 主应用页（如 `/fire-alarm/records`）主壳 Chrome 行为不变。
- 子应用实例数正常：任一二级页仅 1 个 wujie iframe、1 个 `wujie-app`、shadow DOM 内 1 个 `.rescue-header`（排除多实例）。

## 实际执行命令与结果

- `npx eslint src/components/layout/AppLayout.vue src/shell/WujieHost.vue`：通过，0 error。
- `npm run type-check`（vue-tsc）：通过，0 error。
- CDP 实证（`Page.navigate` + `Runtime.evaluate` 穿透 iframe / shadow DOM）：
  - `/fire/rescue?eventId=6` 仅 1 个 iframe（`name="fm-rescue::/fire/rescue?eventId=6"`）、1 个 `wujie-app`、`shadowHeaders: 1`。
  - 多起点（/fire、/fire-alarm）经 `router.push` 到该页均得 1 个实例、1 个 `.rescue-header`，无重复。
- 截图证据（见下方）：修复前存在两个顶部栏，修复后仅子应用 rescue-header，且 `/fire` 一级页导航完好。

## 未运行项

- 全量 `npm run build` 受本机 dist 清空守卫限制未跑；本次为单文件条件渲染改动，非构建/部署链路，已由 eslint + type-check 兜底。
- 无既有 Vitest 覆盖 AppLayout（存量缺口，不在本变更范围，记遗留）。

## 截图证据

- `evidence/rescue-header-duplicated-before.png`：修复前 `/fire/rescue?eventId=6`，系统顶栏与子应用 rescue-header 两个顶部栏叠加。
- `evidence/rescue-header-fullscreen-after.png`：修复后同一页，仅子应用 rescue-header，地图铺满视口。
- `evidence/fire-module-nav-regression.png`：回归 `/fire` 一级模块页，主壳顶栏/导航/消息栏完整保留。

## 结论

达成。二级子应用页"两个顶部栏"已消除，一级模块页无回归。遗留两项：①从某二级页切走再切回，wujie 实例数变为 0（子应用不挂载），与本现象无关，涉及 `startApp`/`destroyApp` 同名复用竞态，另立 Change；②AppLayout 无 Vitest 覆盖（存量缺口）。
