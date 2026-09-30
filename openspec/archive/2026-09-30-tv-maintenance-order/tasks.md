# 任务清单：工业电视维修工单下钻真实工单

## 1. 契约真源

- [x] `docs/api/tv.openapi.json`：`TvMaintenanceOrderItem` schema（14 字段）+ `GET /tv/maintenance-orders` + `GET /tv/maintenance-orders/{id}`
- [x] `npm run gen:api-types` 重新生成 TS 类型（tv.ts 等）

## 2. 类型与服务

- [x] `src/services/tv.ts` 加 `TvMaintenanceOrderItem` interface
- [x] `fetchTvMaintenanceOrders(status?)` / `fetchTvMaintenanceOrder(id)`（空态兜底、绝不回灌假数据）

## 3. 面板重构

- [x] `MaintenanceOrderPanel.vue`：状态卡片 → 第一层 `InfoDetailDialog` 工单列表（可点击）→ 第二层 `InfoDetailDialog` 逐单明细
- [x] `STATUS_BY_LABEL` 映射 未接单→PENDING / 处理中→PROCESSING / 已超时→OVERTIME
- [x] 数据来源文案透明化（不暴露表名）；两个对话框 `Teleport to="#app"`

## 4. 验证

- [x] `vue-tsc --noEmit` 0 error
- [x] `eslint` 0 error
- [x] fm-tv 子应用 `vite build` 成功
- [x] 跨库 `check-api-contract.mjs --strict` 0 漂移（可比 274）
