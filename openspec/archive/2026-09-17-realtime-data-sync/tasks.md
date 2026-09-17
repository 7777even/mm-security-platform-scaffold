# Tasks

## 1. 实时中枢路由

- [x] 改造 `src/services/realtime.ts`：`dispatch` 按 topic 路由（`alarm.push` 保持；`<domain>.changed` → 域刷新钩子）；新增 `subscribeDomainChange(domain, handler)`
- [x] [TDD] `realtime.spec.ts` 补测：`.changed` 路由到正确域钩子、未知 topic 容错、退订

## 2. 域 store 接线

- [x] 设备 / 工作站 / 系统管理(user·role·menu) / 台账 / R1–R4 业务写域 store 接入 `subscribeDomainChange`（挂载 / 激活订阅，卸载退订）
- [x] 客户端同域去抖（如 400ms 合并）

## 3. 契约与守门

- [x] 扩展 `docs/api/realtime.openapi.json`（RealtimeDataChange + `<domain>.changed`，端点仍 `/ws/alarm`）
- [x] `npm run gen:api-types`（若类型受影响）；`node scripts/validate-api-contracts.mjs` 0 问题

## 4. 验证与归档

- [x] `vitest run` + `vue-tsc --noEmit` 全绿
- [x] 与后端联调：写一条设备 / 台账 → 三端该域自动刷新（含大屏 / 移动端真机或 E2E 验证）
- [x] spec-delta 合入 `openspec/specs/realtime-channel/spec.md`；归档 `git mv` 到 `openspec/archive/2026-09-17-realtime-data-sync`
- [x] `node scripts/check-openspec-hygiene.mjs` 通过
