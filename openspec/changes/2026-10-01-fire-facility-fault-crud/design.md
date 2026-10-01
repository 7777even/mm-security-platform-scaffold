# Design: mgmt 消防设施故障 CRUD 与实时联通

## 决策 1：新增/编辑共用弹窗，按 `id` 判定写接口

与消防报警 `FireAlarmEditDialog` 保持一致：`editRow` 为空走 `createFireFacilityFault`，
携带 `id` 走 `updateFireFacilityFault`。条目字段 `status` 与写回字段 `faultStatus` 名称不同，
在 `watch(editRow, immediate)` 预填时做一次映射，避免「编辑后状态被重置为默认」。

## 决策 2：编辑态禁用编号与设施编码

`faultCode` 全局唯一（后端重复即 409），`facilityCode` 是关联主键，编辑时改动语义歧义大，
故二者在编辑态 `disabled`，其余字段（含后端 V91 新支持的级别/类型/现象/原因等）均可改。

## 决策 3：下拉友好化按「是否有既定枚举」判定

- 故障级别（紧急/重要/一般）、故障类型（硬件故障/通信故障/误报/其他）、
  故障状态（六态）——后端有明确枚举校验，一律 `el-select`；
- 设施名称、设施类型、发现方式、故障现象、原因、维修措施、验收结论——无既定字典，
  保持自由文本 `el-input` / `el-textarea`，**不臆造下拉**。

## 决策 4：订阅复用 `useDomainAutoRefresh`

该 composable 内部已管理 `onMounted` 订阅与 `onUnmounted` 退订，
比手写 `subscribeDomainChange` 更安全；列表页与大屏弹窗均使用它，保证生命周期一致。

## 决策 5：大屏联动点选 `FireFacilityMonitoringDialog`

该组件是 `loadFireFacilityFaults` 的唯一大屏消费方，订阅挂在其
`loadFacilityData` 上即可实现「mgmt 改一条 → 大屏故障列表实时跟随」。

## 三态（live / demo / offline）

沿用 service 既有约定：demo 仅本地成功返回 `null`、offline 显式报错并抛异常、
live 真实请求——绝不伪造「保存成功」。
