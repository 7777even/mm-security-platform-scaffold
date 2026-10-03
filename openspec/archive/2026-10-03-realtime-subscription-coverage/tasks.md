# Tasks: 实时订阅覆盖补齐

## 接线

- [x] 移动端 events / plans / plan-detail / contacts / library / resources / orders / ops-board 接入对应域订阅
- [x] 后台 MgmtLedgerView（mgmt-ledger）/ BarrierView（security.gate-control）接入订阅
- [x] 大屏 FireFacilityMonitoringDialog（fire-facility.monitor + fire-facility.fault）接入订阅

## 验证

- [x] `npm run build:subapps` 通过（11 视图编译 / 类型校验绿）
- [x] 双仓提交并按 scope 推送（前端 mobile / mgmt / screen），关联本 Change 归档
