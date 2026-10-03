# Design: 写端点契约四同步与视图订阅接线

## 契约落点

- `device.openapi.json`：新增 `/devices` 的 POST、为 `/devices/{code}` 补 PUT / DELETE；新增 `DeviceWriteRequest`（7 字段）与本域本地 `DeleteResult`（各域契约各自本地定义，漏定义会让 `gen:api-types` 整域生成失败）。响应沿用本文件既有风格：`allOf` 组合 `_shared.json` 的 `ApiResponse` + `data`。
- `communication.openapi.json`：新增 `/communication/records` 的 POST，新增 `/communication/records/{recordNo}` 的 PUT / DELETE；新增 `CommRecordWriteRequest`（12 字段）。本域 `DeleteResult` 第 1 批已补，直接复用。
- 写端点路径须与后端逐字对齐：设备是 `/devices/{code}`（20 位 MDM 编码），记录是 `/communication/records/{recordNo}`（业务自然键），均非集合路径。

## 订阅接线

沿用 `useDomainAutoRefresh(domain, load)`：内部 `onMounted` 订阅 `<domain>.changed`、`onUnmounted` 退订，变更到达调用 `load` 只读重拉；各视图原有 `onMounted(load)` 负责首屏拉取，二者并存（`immediate` 保持默认 false，避免重复首拉）。

- `DeviceView` → `device`
- `CommRecordView` → `communication.record`（五页共用同一视图，一次订阅覆盖 `/comm-sms`、`/comm-call`、`/comm-broadcast`、`/comm-push`、`/comm-intercom` 五个路由）

## 零下行控制

订阅回调只做只读 refetch；本批前端无写入口。
