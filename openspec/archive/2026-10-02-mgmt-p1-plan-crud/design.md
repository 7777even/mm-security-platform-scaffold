# Design: 应急预案管理页 CRUD

## 接入方式

`EmergencyPlanView` 复用 `MgmtProTable` + `MgmtPageHead` + `MgmtRecordEditDialog`（schema 驱动弹窗）。
FIELDS：planName(必填 input)、tabKey/domain(select 既定枚举)、accidentType/facility(input)、
nuclear/isActive(select 是/否 → boolean)、sortNo(number)。

## 实时

`useDomainAutoRefresh('emergency.plan', load, { immediate: false })`。

## 离线兜底

`fetchEmergencyPlanMetaList` 经 `resolveOfflineFetch` 回落空态，不回灌假数据（零下行控制红线）。
