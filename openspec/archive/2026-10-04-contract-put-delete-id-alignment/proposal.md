# Proposal: 契约 PUT/DELETE 路由对齐至 /{id}（消化 12 条路由差异技术债）

## Why

`check-api-contract.mjs` 守门显示后端实现与前端契约存在 **12 条预存路由差异**：三域（`fire/patrols`、`security/bollards`、`security/gate-controls`）的 PUT/DELETE 后端实现落在 `/{id}` 子路径（符合 AGENTS.md §11 约定），而契约（`openapi.json`）误挂集合路径，每域产生「契约有实现无」+「实现有契约无」两条差异，合计 12 条（基线技术债）。

前端 `src/services/security.ts` / `fireMonitoring.ts` 的写函数**早已调用 `/{id}`**（运行时正确），仅契约文档与生成类型路径图未对齐。属纯文档对账，零行为风险。

## What Changes

- `docs/api/fire-monitoring.openapi.json`：PUT/DELETE `/fire/patrols` → `/fire/patrols/{id}`。
- `docs/api/security.openapi.json`：PUT/DELETE `/security/bollards` → `/security/bollards/{id}`；PUT/DELETE `/security/gate-controls` → `/security/gate-controls/{id}`。
- `npm run gen:api-types`：重生成 `src/types/generated/security.ts` / `fire-monitoring.ts`（路径图新增 /{id}，schema 不变）。
- 无后端代码变更（差异在契约真源，后端仅作实现方，守门读取前端契约）。

## Capabilities

- `fire-monitoring` / `security`：契约 PUT/DELETE 路径与后端实现、前端调用逐字一致。

## Impact

- 影响：`docs/api/fire-monitoring.openapi.json`、`docs/api/security.openapi.json`、`src/types/generated/fire-monitoring.ts`、`src/types/generated/security.ts`。
- 风险：零行为变更；前端 service 调用与后端实现本就一致，仅消除守门噪声。

## 非目标 / 后续

- 不引入新接口/新权限码；不动 schema 字段。
- 其余历史路由差异（若存在）不在本变更范围。
