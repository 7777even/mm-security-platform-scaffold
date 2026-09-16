# Proposal: 通讯通知记录五页真后端化（mgmt）

## Why

mgmt 端 `/comm-sms`、`/comm-call`、`/comm-broadcast`、`/comm-push`、`/comm-intercom` 原为
`module-embed.vue` 的 iframe 占位（见 `docs/frozen-prototype.md` 冻结清单）。后端补齐
`GET /api/v1/communication/records` 后，五页改为服务驱动视图并解除冻结。

## What Changes

- 新增 `apps/mgmt/views/comm/CommRecordView.vue`：五页共用，按 `route.path` 决定记录类型与列定义。
- `apps/mgmt/router.ts`：五路径加入 `SERVICE_PATHS` 并注册 `serviceRoutes`
  （覆盖 iframe 兜底；**不改** `src/data/protoPages.ts` 清单，保留原型兜底能力）。
- `src/services/communication.ts`：新增 `fetchCommunicationRecords` 与 `CommunicationRecord` 等类型。
- `src/types/generated/communication.ts`：由 `npm run gen:api-types` 重新生成。
- `docs/frozen-prototype.md`：从 mgmt 冻结表移除五行并注明来源 Change。

## Impact

- 仅新增视图 + 服务函数；`protoPages.ts` 与原型 `public/pc-admin` 保持不变。
- 后端契约扩展见 `frontend-scaffold/docs/api/communication.openapi.json`（同域扩展，无新域文件）。
