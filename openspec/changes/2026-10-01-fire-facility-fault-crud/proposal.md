# Change: mgmt 消防设施故障页全量 CRUD 与三端实时联通

## 为什么

用户要求 mgmt 后台管理端全部模块实现 CRUD、实时更新、三端数据互通。
「消防设施故障管理」页此前为只读列表（后端无新增/删除端点），且 `fire-facility.fault` 域
广播在前端无人订阅。本 Change 完成该模块的前端闭环，作为 mgmt 全模块改造的首个样板。

## 变更内容

1. **契约**：`docs/api/fire-facility.openapi.json`
   - `/fire-facility/faults` 增加 `post`（与既有 `get` 合并同一 path key）；
   - `/fire-facility/faults/{faultId}` 增加 `delete`（与既有 `put` 合并）；
   - 新增 schema `FireFacilityFaultCreateRequest`；`FireFacilityFaultUpdateRequest` 追加 8 个基础字段。
2. **服务层** `src/services/fireFacility.ts`：新增
   `createFireFacilityFault` / `deleteFireFacilityFault` 与
   `FIRE_FAULT_LEVEL_OPTIONS` / `FIRE_FAULT_TYPE_OPTIONS` / `FIRE_FAULT_STATUS_OPTIONS` 选项常量；
   三态（live / demo / offline）语义与既有 `updateFireFacilityFault` 对齐。
3. **新增弹窗** `apps/mgmt/components/FireFacilityFaultEditDialog.vue`：新增/编辑共用，
   枚举字段用 `el-select`、时间用 `el-date-picker`；编号与设施编码编辑态禁用。
4. **列表页** `apps/mgmt/views/fire/FaultMgmtView.vue`：新增按钮 + 操作列（编辑 / 删除二次确认）。
5. **实时联通**：列表页与「大屏消防设施监测弹窗」均接入
   `useDomainAutoRefresh('fire-facility.fault', ...)`，任一端写入后双端自动重拉。
6. **单测**：弹窗 4 例、列表订阅与删除 3 例。

## 范围与非目标

- 移动端（`apps/mobile`）本轮按用户决定暂不纳入，后续排期。
- 不改故障状态机，不引入任何本地造假数据（离线态显式报错）。
