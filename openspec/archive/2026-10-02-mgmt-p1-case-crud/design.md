# Design: 事故案例库管理页 CRUD

## 接入方式

`CaseLibView` 复用 `MgmtProTable` + `MgmtPageHead` + `MgmtRecordEditDialog`（schema 驱动弹窗）。
FIELDS：title(必填 input)、accidentType/location(input)、occurredAt(date datetime)、summary/lessons(textarea)。

## 实时

`useDomainAutoRefresh('emergency.case', load, { immediate: false })`。

## 离线兜底

`fetchEmergencyCases` 经 `resolveOfflineFetch` 回落空态，不回灌假数据（零下行控制红线）。
