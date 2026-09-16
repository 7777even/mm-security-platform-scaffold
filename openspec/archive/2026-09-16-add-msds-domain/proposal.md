# Proposal: 移动端化学品 MSDS 域接后端（契约 + 视图）

## Why

`apps/mobile` 的 `/msds`、`/msds/:cas` 仍走 `data/mock.ts` 的 `msds` 静态数据（④-A 冻结清单）。
后端本次新增只读域 `msds`（见后端库同名 Change），前端完成「契约 → 类型 → 服务 → 视图」接线。

## What Changes

- 新增契约 `docs/api/msds.openapi.json`（tags: `msds`；`GET /msds`、`GET /msds/{cas}`；
  schema `MsdsItem`/`MsdsDetail`/`MsdsList`，四铁律齐备）。
- `npm run gen:api-types` 生成 `src/types/generated/msds.ts`。
- 新增 `src/services/msds.ts`（`fetchMsdsList` / `fetchMsdsDetail`）。
- `msds.vue` / `msds-detail.vue` 改接 `@/services/msds`（样板同 ④-E）。
- `docs/frozen-prototype.md` 解除两路径冻结；`docs/system-facts.md` 记录本次变更。

## Capabilities

- 「化学品知识」检索 / MSDS 详情由后端 `fac_msds` 驱动（只读），移动端不再有 MSDS mock。

## Impact

- 仅新增契约 + 服务 + 视图改造，无破坏性改动。回退：恢复两视图 + 删 `services/msds.ts`。
