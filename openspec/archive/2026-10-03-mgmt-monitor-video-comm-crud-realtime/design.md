# Design: 写端点契约四同步与视图订阅接线

## 契约落点

- `video.openapi.json`：新增 `/video/cameras` 的 POST，新增 `/video/cameras/{id}` 的 PUT / DELETE；新增 `VideoCameraWriteRequest` schema（6 字段）。
- `communication.openapi.json`：新增 `/communication/devices` 的 POST，为既有 `/communication/devices/{id}` 补 PUT / DELETE；新增 `CommDeviceWriteRequest` schema（15 字段）与本域本地 `DeleteResult` schema（各域契约各自本地定义，与本仓既有约定一致）。
- 写端点路径须与后端 `@PutMapping("/cameras/{id}")` / `@PutMapping("/devices/{id}")` 逐字对齐：PUT / DELETE 挂在 `/{id}` 路径下而非集合路径，否则契约门禁会各记一条「契约有实现无 / 实现有契约无」差异。

## 订阅接线

5 个视图沿用 `useDomainAutoRefresh(domain, load)`：其内部 `onMounted` 订阅 `<domain>.changed`、`onUnmounted` 退订，变更到达即调用 `load` 只读重拉；各视图原有的 `onMounted(load)` 负责首屏拉取，二者并存互不冲突（composable 的 `immediate` 保持默认 false，避免重复首拉）。

- `VideoMgmtView` / `VideoHealthView` → `video.camera`
- `BroadcastDeviceView` / `PhoneMgmtView` / `RadioMgmtView` → `communication.device`

## 零下行控制

订阅回调只做只读 refetch，不携带也不执行任何硬控写指令；本批前端无写入口。
