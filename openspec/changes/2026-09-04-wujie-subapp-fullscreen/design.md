# 设计文档：二级子应用页全屏渲染

> 适用：L3 / L4。记录架构决策、取舍、风险与依赖。L1 / L2 不建此文件。
> 与本变更 `proposal.md` / `tasks.md` / `spec-delta.md` 四者闭环，人工确认后才动手（AGENTS.md §1.1）。

## 目标与约束

- 设计目标：二级子应用页渲染时，页面顶部只保留子应用自身页头，视口完整不被主壳顶栏 / 消息栏挤压；一级模块页的主壳导航不受影响。可被 `tasks.md` 验收标准逐条印证。
- 硬约束：三端不迁移视觉语言（本次仅大屏 `:root`）；不改 API 契约（§3 零下行控制 / B3 包络）；token 单一真源（本次不改 token）；z-index 只用五层 token。

## 架构与方案

- 落点：`src/components/layout/AppLayout.vue`（大屏主壳），不新增组件、不改 `WujieHost.vue` 挂载逻辑、不动 `src/screen` 存量。
- 职责边界：`AppLayout` 只决定"是否呈现主壳 Chrome"，`WujieHost` 仍只负责子应用挂载与沙箱生命周期，二者不互相越界。
- 判定依据：复用既有 `route.meta` 约定（`subapp` / `hidden`），不新增路由字段、不改 `router/index.ts`，以最小回归面达成目标。
- 状态与数据流：仅读取 `useRoute()` 的 `meta`，无新增 store / composable / 事件。

## 决策记录（ADR）

- 决策 1：在 `AppLayout` 做条件渲染，而非把二级子应用路由从 `SECONDARY_ROUTES` 移到顶层 — 理由：搬移路由会改变匹配与嵌套关系、回归面大；条件渲染只改一处且可逆 — 反对项：路由层级仍保留"二级页挂在 AppLayout 下"，语义上不贴切，记为后续技术债。
- 决策 2：判定用 `subapp && hidden` 而非只用 `subapp` — 理由：一级模块页同样带 `subapp: true`，只用 `subapp` 会连带收起模块导航，用户将无法切换模块 — 反对项：`hidden` 本义是"不进导航"，借作"全屏"判据不够直白，已在代码注释中说明。
- 决策 3：不改动 `WujieHost.vue` — 理由：CDP 取证确认子应用实例数正常（1 iframe / 1 `wujie-app`），此前基于"实例残留"推断加的 `watch` 经 A/B 验证对本现象无效，故撤销而非保留。

## 风险与缓解

| 风险                                 | 可能影响                | 缓解措施                                                     |
| ------------------------------------ | ----------------------- | ------------------------------------------------------------ |
| 收敛条件写宽，一级模块页丢失导航     | 用户无法在模块间切换    | 条件同时要求 `hidden: true`；已截图回归验证 `/fire` 导航完好 |
| 其他 hidden 二级页被意外收起壳层     | 部分页面视口 / 导航变化 | 逐个列出 9 条受影响路由，均为自带页头的全屏子应用视图        |
| 后续新增二级子应用页未延续 meta 约定 | 新页重现"两个顶栏"      | 在 `wujie-shell` spec 固化该 Requirement，新页照此声明 meta  |

## 依赖

- 上游依赖：`route.meta.subapp` / `meta.hidden` 约定（`src/router/index.ts`、`src/router/menu.ts`）。
- 下游影响：`SECONDARY_ROUTES` 内 `subapp && hidden` 的 9 条二级子应用路由及其子应用（`fm-rescue`、`fm-typhoon`、`fm-production-area` 等）。
- 待确认项：无。
