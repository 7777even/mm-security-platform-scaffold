# Design: 移动端化学品 MSDS 域接后端

## 契约与类型

- 契约真源 `docs/api/msds.openapi.json`（后端不复制第二份）。
- `gen:api-types` 由契约生成 `src/types/generated/msds.ts`（不手写类型）。

## 服务层

- 新增 `src/services/msds.ts`：`fetchMsdsList()` / `fetchMsdsDetail(cas)`（契约类型内声明，同 `task.ts` 范式）。

## 视图接线

- `msds.vue`（列表 + 名称/CAS 前端检索）、`msds-detail.vue`（按 CAS 详情）统一走 ④-E 样板：
  `isOfflineNoBackend()` 短路 + `notifyBackendOffline()` + `try/catch` 空态，**不回灌假数据**。
- 列表分类标签取 `classification.split('/')[0]`（与原原型一致）；详情按 CAS 路由取数。

## 边界

- 「离线缓存」按钮为前端交互占位，本次只读，不含写端点。
