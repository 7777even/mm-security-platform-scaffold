# 后台管理端 18 个静态域接入通用台账真后端

## Why

`apps/mgmt` 仍有 18 个功能页由 `src/data/mgmtMenus.ts` 硬编码静态列表驱动，未接真实后端。按「全功能真后端化清零」主线，需将这些域改为通用台账视图 `MgmtLedgerView.vue` 按 `:domain` 渲染，数据来自后端 `GET /api/v1/mgmt-ledger/{domain}`。

## What Changes

- 新增契约 `docs/api/mgmt-ledger.openapi.json`（schema 名与后端 DTO 类名一一对应，四铁律达标）。
- 新增 `src/services/mgmtLedger.ts` 调 `/mgmt-ledger/{domain}` 与 `/meta`。
- 新增通用视图 `apps/mgmt/views/MgmtLedgerView.vue`（动态列 + 筛选 + 关键字 + 分页 + 单元格着色）。
- `apps/mgmt/router.ts` 注册 18 个域路由（复用通用视图，`moduleRoutes` 的静态兜底自动排除）。
- `gen:api-types` 生成 `src/types/generated/mgmt-ledger.ts`。

## Capabilities

- `mgmt-ledger`

## Impact

- 仅消费只读 GET，无写操作、不写审计，符合零下行控制。
- 移除 18 个域对 `mgmtMenus.ts` 静态数据的依赖（菜单仅作路由入口）。
