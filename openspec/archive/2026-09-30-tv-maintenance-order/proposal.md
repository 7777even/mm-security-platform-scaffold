# 提案：工业电视维修工单下钻真实工单（contract + UI）

> **状态：`done` —— 已实现并验证（vue-tsc 0 / eslint 0 / fm-tv 构建成功）。归档 Change。**
> 配套后端 Change：`backend-scaffold/openspec/archive/2026-09-30-tv-maintenance-order`。

## 背景

与后端维修工单根治方案配套：后端新建 `fac_tv_maintenance_order` 真实台账并实时聚合概览后，前端需要 ① 契约同步新增 `TvMaintenanceOrderItem` schema 与两个端点；② 维修工单卡片从"展示字典值"改为"按状态下钻真实工单列表 → 点击工单看逐单明细"（对齐重大危险源列出真实清单 + 下钻的做法）。用户明确"维修工单这几项同理也要"。

## 目标

1. `docs/api/tv.openapi.json` 新增 `TvMaintenanceOrderItem` schema（14 字段）+ `GET /tv/maintenance-orders` + `GET /tv/maintenance-orders/{id}` 两条路径（契约真源）。
2. `npm run gen:api-types` 重新生成 TS 类型（`src/services/tv.ts` 加 `TvMaintenanceOrderItem` + `fetchTvMaintenanceOrders` / `fetchTvMaintenanceOrder`，含空态兜底、绝不回灌假数据）。
3. `MaintenanceOrderPanel.vue` 重构：点击状态卡片 → `InfoDetailDialog` 列出该状态真实工单（可点击）→ 点击工单 → 第二层 `InfoDetailDialog` 展示逐单完整明细。
4. 数据来源文案透明化："实时维修工单台账（按工单状态实时统计）"，不暴露表名。

## 非目标（本期不做）

- 不改动重大危险源（MAJOR_HAZARD）的下钻（仍走既有 hazard 列表）。
- 不改 `tv.ts` 之外的契约域。

## ADR

- **ADR-1 契约真源在 frontend**：后端 DTO 对齐本文件，跨库四同步经 `check-api-contract.mjs --strict` 守门。
- **ADR-2 下钻两层级**：状态卡片 → 工单列表（按 status 过滤）→ 单工单明细；`STATUS_BY_LABEL` 映射 未接单→PENDING / 处理中→PROCESSING / 已超时→OVERTIME。
- **ADR-3 wujie 约束**：两个对话框均 `Teleport to="#app"`（隐蔽 iframe 下 `to="body"` 不可见）。

## 风险

- 改 `src/screen/` 共享源码会令其它子应用产物 stale，需全量 `npm run build:subapps` 整体预览。
