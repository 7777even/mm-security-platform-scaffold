# Proposal: 移动端应急演练域接后端（契约 + 视图）

## Why

`apps/mobile` 的 `/drills`、`/drills/:id` 仍走 `data/mock.ts` 的 `drills` 静态数据（④-A 冻结清单）。
后端本次新增只读域 `drills`（见后端库同名 Change），前端完成「契约 → 类型 → 服务 → 视图」接线。

## What Changes

- 新增契约 `docs/api/drills.openapi.json`（tags: `drills`；`GET /drills`、`GET /drills/{id}`；
  schema `DrillItem`/`DrillDetail`/`DrillTaskItem`/`DrillList`，四铁律齐备）。
- `npm run gen:api-types` 生成 `src/types/generated/drills.ts`。
- 新增 `src/services/drill.ts`（`fetchDrills` / `fetchDrillDetail`）。
- `drills.vue` / `drill-detail.vue` 改接 `@/services/drill`（样板同 ④-E）。
- `docs/frozen-prototype.md` 解除两路径冻结；`docs/system-facts.md` 记录本次变更。

## Capabilities

- 「演练信息」列表 / 详情（含任务子项）由后端 `fac_drill`(`_task`) 驱动（只读），移动端不再有演练 mock。

## Impact

- 仅新增契约 + 服务 + 视图改造，无破坏性改动。回退：恢复两视图 + 删 `services/drill.ts`。
