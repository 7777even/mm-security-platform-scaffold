# Proposal: 危险源 / 监测点位 / 特殊作业写端点契约四同步与视图实时订阅

## 背景

监测 / 通信 / 生产域前两批（`video.camera` / `communication.device`、`device` / `communication.record`）已闭环。剩余 3 个只读视图未订阅实时通道，根因同样是后端无写端点、因而无广播源。第 3 批随后端补 `hazard`、`hazard.point`、`special-operation` 三域（其中后两者的后端 scope 由本批首次收录）。

## 目标

- 契约真源 `docs/api/hazard.openapi.json` / `special-operation.openapi.json` 补写端点与写请求 schema，完成跨库四同步第 2 步。
- 三个视图接入 `useDomainAutoRefresh`，分别订阅 `hazard` / `hazard.point` / `special-operation`，变更到达即只读重拉。

## 非目标

- 本批不落写 UI（无新增 / 编辑 / 删除弹窗与 `v-permission` 按钮），仅闭合「订阅 → 重拉」半环——与前两批口径一致。
- 不改动 `src/services/hazard.ts` / `specialOperation.ts` 的读函数签名。
- 后端所修「监测点位 PUT 不以请求体 id 覆盖路径主键」属服务端行为，前端本批无写 UI 故不涉及。
