# Proposal: 消防设施报警列表接入处置闭环

## 背景

管理端「消防设施报警」视图（`apps/mgmt/views/fire/FireFacilityAlarmView.vue`）此前是**纯只读列表**：
报警是故障工单的派生命名视图，后端无独立写端点，处置必须跳转到「消防故障」台账定位对应故障才能推进状态。
值班员在报警列表上无法直接完成「确认 / 派单 / 维修 / 验收 / 闭环」。

后端本轮新增 `PUT /fire-facility/alarms/{alarmId}`（按报警 id 复用故障处置能力，权限 `fire-facility:handle`）。

## 目标

- **契约**（唯一真源）：`docs/api/fire-facility.openapi.json` 新增 `/fire-facility/alarms/{alarmId}` 的 `put`，
  复用既有 `FireFacilityFaultUpdateRequest` / `FireFacilityFaultItem` schema。
- **service**：`fireFacility.ts` 新增 `updateFireFacilityAlarm(alarmId, payload)`，三态（离线演示/未连后端/真实 PUT）
  与既有 `updateFireFacilityFault` 对齐。
- **UI**：报警列表加「处置」操作列，5 个动作按钮按状态机门控（仅当前状态的前驱匹配才可点），
  点击弹出专用处理对话框（按动作显隐字段 + 必填「处理意见」写入故障时间线）。
- **权限**：操作列挂 `v-permission="'fire-facility:handle'"`，无权限角色不显示。
- **实时**：复用视图既有的 `useDomainAutoRefresh('fire-facility.fault', load)`，
  处置成功后广播触发自动重拉（不新增订阅域），并额外兜底调用一次 `load()`。

## 非目标

- 不改报警列表的读 schema（`FireFacilityAlarmItem` 字段集合不变，仅修正手写接口 `id` 的类型漂移）。
- 不做批量处置、不做处置流转图/统计。
- 不改动「消防故障」台账既有编辑弹窗与流程。

## 分级

**L3** —— 新增业务写端点契约 + 管理端写 UI，不触及鉴权/权限模型/数据库结构。
处理动作范围（完整流程）与交互形式（弹「处理」对话框）已与需求方确认。
