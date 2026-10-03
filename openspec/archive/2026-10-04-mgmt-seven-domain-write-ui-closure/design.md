# Design: 写 UI 范型与定位键保护

## 决策

### 1. 统一照 GateView 范型

`apps/mgmt/views/security/GateView.vue` 是本仓「清单页全量 CRUD」的标准写法：
`dialogVisible` + `editRow` + `FIELDS` + `openCreate/openEdit/onSave/onDelete`，
删除走 `ElMessageBox.confirm` 二次确认，操作列 `fixed="right"`，按钮挂 `v-permission`。

### 2. 字符串定位键不改组件签名

`MgmtRecordEditDialog` 的 save 回调是 `(payload, id: number | null)`。
CommRecordView（`recordNo`）/ DeviceView（`deviceCode`）/ MonitorPointView（点位 `id`）的定位键是字符串，
故由页面自持 `editKey = ref<string | null>(null)` 判定新增 / 更新，忽略回调第二参，
**不改动共用组件**，避免影响 FireFacilityLedgerView 等既有使用方。

### 3. 定位键编辑态禁用

后端已修复「PUT 不以请求体覆盖路径定位键」（deviceCode / recordNo / 监测点位 id）。
前端相应把这些字段设 `disabledOnEdit: true`，从表单层就避免用户改掉编码导致资源从原 URL 消失。
数字自增 id 域（hazard / special-operation / video.camera）无此约束。

### 4. service 方法沿用同文件既有风格

video / communication / device / hazard / specialOperation 都是较简单的 `request<T>({ url, method, data })`
风格（没有 isDemoMode 那套判断），新增方法保持同文件一致，不引入别的范式。
路径参数一律 `encodeURIComponent`，避免编码含特殊字符时打错端点。

### 5. 权限码与视图对应

| 视图                                                | 权限码                       |
| --------------------------------------------------- | ---------------------------- |
| VideoMgmtView                                       | `video:camera-write`         |
| BroadcastDeviceView / PhoneMgmtView / RadioMgmtView | `communication:device-write` |
| CommRecordView                                      | `communication:record-write` |
| DeviceView                                          | `device:write`               |
| HazardMgmtView                                      | `hazard:write`               |
| MonitorPointView                                    | `hazard:point-write`         |
| SpecialOpsView                                      | `special-operation:write`    |
