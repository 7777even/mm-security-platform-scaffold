# Proposal: 监测 / 通信 / 生产三批订阅接线补充单测

## 背景

第 1/2/3 批共为 10 个视图组件（含 CommRecordView 五页共用，覆盖 14 个路由）接了 `useDomainAutoRefresh` 订阅，
但三批**均未落 vitest 用例**——订阅是否真的接上、卸载是否退订、回调是否真会重拉，全靠人工在页面上观察。
此前本仓只在 Batch2 的 `SecuritySearchCrudViews.spec.ts`（33 例）里为 security 域验证过同类接线。

## 目标

- 新增 `apps/mgmt/views/__tests__/MonitorCommProductionSubscriptionViews.spec.ts`，覆盖三批全部 11 个组件。
- 每条接线断言三件事：挂载时订阅的**域名正确**、卸载时**退订**、广播回调到达时**确实重拉**列表。

## 非目标

- 不测列表渲染细节（表格列、分页器由共用组件负责，另有 `MgmtRecordEditDialog.spec.ts` 等覆盖）。
- 不改任何视图源码与订阅逻辑——本次纯补测，若用例失败应说明接线回归而非改测试。
- 不涉及写 UI（详见后续 change）。
