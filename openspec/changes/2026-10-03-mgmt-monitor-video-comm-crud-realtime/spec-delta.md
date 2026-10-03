# Spec Delta: realtime-channel（新增 video.camera / communication.device 订阅）

## 新增订阅

- `video.camera`：`VideoMgmtView`、`VideoHealthView` 订阅，变更到达重拉 `fetchVideoCameras`。
- `communication.device`：`BroadcastDeviceView`、`PhoneMgmtView`、`RadioMgmtView` 订阅，变更到达重拉 `fetchCommunicationDevices`。

## 契约变更（docs/api 真源）

- `video.openapi.json`：新增 `/video/cameras` POST、`/video/cameras/{id}` PUT / DELETE；新增 `VideoCameraWriteRequest` schema。
- `communication.openapi.json`：新增 `/communication/devices` POST、`/communication/devices/{id}` PUT / DELETE；新增 `CommDeviceWriteRequest` 与本地 `DeleteResult` schema。
- 读端点响应 schema 不变，生成类型新增两个写请求类型（`src/types/generated/video.ts`、`communication.ts`）。

## 不变

- 既有的 11+ 个订阅域与 `useDomainAutoRefresh` 语义不变；`src/services/realtime.ts` 的去抖（400ms）与 `.changed` 后缀约定不变。
