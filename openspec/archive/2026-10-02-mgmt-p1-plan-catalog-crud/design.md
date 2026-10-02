# Design: 预案目录管理页 CRUD

## 接入方式

`PlanCatalogView` 复用 `MgmtProTable` + `MgmtPageHead` + `MgmtRecordEditDialog`（schema 驱动弹窗）。
FIELDS：planCode(input)、label(必填 input)、planName(input)、canSwitch/isCurrent(select 0/1)、sortNo(number)。

## 实时

`useDomainAutoRefresh('emergency.plan-catalog', load, { immediate: false })`。

## 离线兜底

`fetchEmergencyPlanCatalogRows` 经 `resolveOfflineFetch` 回落空态，不回灌假数据（零下行控制红线）。
