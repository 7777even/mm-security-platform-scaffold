# Proposal: 实时订阅覆盖补齐

## 背景

后端已为多个业务域广播 `<domain>.changed`（realtime-broadcast / realtime-channel spec），但部分「只读展示这些域、却未订阅」的视图在其它端改写后不会自动刷新，造成三端不同步。本批盘点后补齐遗漏订阅。

## 目标

为 10 个视图 + 通用台账视图接入 `useDomainAutoRefresh`，使其订阅对应业务域变更通知并只读重拉，闭合三端同源实时刷新。

## 范围

- 移动端 8 视图：events（emergency.event / emergency.command）、plans / plan-detail（emergency.plan-catalog）、contacts（emergency.phone）、library（emergency.knowledge）、resources（rescue.vehicle / rescue.equipment / rescue.personnel / rescue.brigade）、orders / ops-board（fire-facility.ledger / fire-facility.fault）。
- 后台：MgmtLedgerView（mgmt-ledger）、BarrierView（security.gate-control）。
- 大屏：FireFacilityMonitoringDialog（fire-facility.monitor + 既有 fire-facility.fault）。

## 非目标

- 不新增 / 修改任何 HTTP 端点或契约 schema（契约不变，无需四同步）。
- 不改动后端广播逻辑（除通用台账 `@RealtimeSync` 在后端 Change 单独跟踪）。
