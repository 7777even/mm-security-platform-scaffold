# Proposal: 设备与通讯记录写端点契约四同步与视图实时订阅

## 背景

第 1 批（`video.camera` / `communication.device`）已闭环。监测 / 通信域仍有 5 个只读视图未订阅实时通道，根因是后端无写端点、因而无广播源。第 2 批随后端补 `device` 与 `communication.record` 两域：`DeviceView`（装置/设备台账）与 `CommRecordView`（短信 / 电话 / 广播 / APP推送 / 对讲五个记录页共用）。

## 目标

- 契约真源 `docs/api/device.openapi.json` / `communication.openapi.json` 补写端点与写请求 schema，完成跨库四同步第 2 步。
- 两个视图接入 `useDomainAutoRefresh`，订阅 `device` / `communication.record`，变更到达即只读重拉。

## 非目标

- 本批不落写 UI（无新增 / 编辑 / 删除弹窗与 `v-permission` 按钮），仅闭合「订阅 → 重拉」半环。
- 不改动 `src/services/device.ts` / `communication.ts` 的读函数签名。
- 剩余 3 个只读域（MonitorPointView / HazardMgmtView / SpecialOpsView）待后端 scope 枚举扩充后第 3 批处理。
