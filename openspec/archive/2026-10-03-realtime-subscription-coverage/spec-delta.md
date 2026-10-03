# Spec Delta: realtime-channel（订阅覆盖补齐）

## 新增订阅

- 移动端 8 视图订阅 emergency.event / emergency.command / emergency.plan-catalog / emergency.phone / emergency.knowledge / rescue.vehicle / rescue.equipment / rescue.personnel / rescue.brigade / fire-facility.ledger / fire-facility.fault。
- 后台 MgmtLedgerView 订阅 mgmt-ledger；BarrierView 订阅 security.gate-control。
- 大屏 FireFacilityMonitoringDialog 订阅 fire-facility.monitor（保留既有 fire-facility.fault）。

## 不变

- 无契约 / schema 变更；契约四同步不适用。
- 既有订阅（mgmt emergency / fire / security / system / typhoon、system.*、tv.monitor、video.linkage、form.record、screen 面板、MgmtLedgerView 等）不受影响。
