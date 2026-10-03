# Spec Delta: realtime-channel（新增 device / communication.record 订阅）

## 新增订阅

- `device`：`DeviceView`（`/device-mgmt`）订阅，变更到达重拉 `fetchDevicePage`。
- `communication.record`：`CommRecordView` 订阅，变更到达重拉 `fetchCommunicationRecords`；因五页共用同一视图组件，一次订阅即覆盖 `/comm-sms`、`/comm-call`、`/comm-broadcast`、`/comm-push`、`/comm-intercom` 五个记录页。

## 契约变更（docs/api 真源）

- `device.openapi.json`：新增 `/devices` POST、`/devices/{code}` PUT / DELETE；新增 `DeviceWriteRequest` 与本地 `DeleteResult` schema。
- `communication.openapi.json`：新增 `/communication/records` POST、`/communication/records/{recordNo}` PUT / DELETE；新增 `CommRecordWriteRequest` schema。
- 读端点响应 schema 不变；生成类型新增两个写请求类型（`src/types/generated/device.ts`、`communication.ts`）。

## 不变

- 既有的 13+ 个订阅域与 `useDomainAutoRefresh` 语义不变；`src/services/realtime.ts` 的去抖（400ms）与 `.changed` 后缀约定不变。
