# Design: 移动端应急演练域接后端

## 契约与类型

- 契约真源 `docs/api/drills.openapi.json`（后端不复制第二份）。
- `gen:api-types` 由契约生成 `src/types/generated/drills.ts`（不手写类型）。

## 服务层

- 新增 `src/services/drill.ts`：`fetchDrills()` / `fetchDrillDetail(id)`（契约类型内声明，同 `task.ts` 范式）。

## 视图接线

- `drills.vue`（列表 + 由后端状态派生的筛选 chip）、`drill-detail.vue`（详情 + 任务子项）统一走 ④-E 样板：
  `isOfflineNoBackend()` 短路 + `notifyBackendOffline()` + `try/catch` 空态，**不回灌假数据**。
- 原硬编码 chip（`['全部','计划中','进行中']`）改为按后端 `status` 去重派生，避免无效筛选。

## 边界

- 演练反馈文本框 / 确认接收按钮为前端交互占位，本次只读，不含写端点。
