# Proposal: 流程填报向导真后端化（mgmt /form）

## Why

mgmt 端 `/form` 流程填报向导原为 `module-embed` 空壳（见 `docs/frozen-prototype.md` 冻结清单），无后端填报存储端点。后端补齐 `POST/PUT /api/v1/form-records` 后，`/form` 改为服务驱动视图并解除冻结，落实「列表 + 多步向导 + ADMIN 审核」闭环。

## What Changes

- 新增 `src/services/formRecords.ts`：`fetchFormRecords` / `fetchFormRecord` / `createFormRecord` / `updateFormRecord`（对齐 `docs/api/form-records.openapi.json`）。
- `docs/api/form-records.openapi.json`：`content` → `detailJson` 结构化；`formType` 改为枚举；`POST` 放开为登录即可提交；`PUT` 保留 ADMIN 审核。
- `npm run gen:api-types` 重新生成 `src/types/generated/form-records.ts`。
- 新增 `apps/mgmt/views/form-wizard.vue`：列表 + 多步填报向导 + ADMIN 审核按钮。
- `apps/mgmt/router.ts`：`/form` 由 `module-embed.vue` 改为 `form-wizard.vue`。
- `docs/frozen-prototype.md` / `docs/system-facts.md`：解除 `/form` 冻结记录。

## Capabilities

### Added Capabilities

- `form-records`：mgmt 端流程填报向导服务驱动渲染与写回能力。

## Impact

- 仅 mgmt 端新增视图 + 服务；原型兜底与 `protoPages.ts` 不受影响。
- 权限语义：新增一线人员即可提交，审核需 ADMIN 角色。
