# Spec Delta: fire-facility（前端契约与写 UI 增量）

## ADDED Requirements

### fire-facility.alarm-handle（契约）

- **SHALL** 在 `docs/api/fire-facility.openapi.json` 定义 `PUT /fire-facility/alarms/{alarmId}`，
  `alarmId` 为路径参数（`type: string`），请求体 `$ref` `FireFacilityFaultUpdateRequest`，
  2xx 响应 `$ref` `FireFacilityFaultItem` 且带 B3 包络示例。
- **SHALL** 满足契约四铁律：按域分组、`summary` + `description`、字段中文 `description`、2xx 有 `example`。

### fire-facility.alarm-handle-ui（管理端写 UI）

- **SHALL** 在消防设施报警列表提供「处置」操作列，含 确认 / 派单 / 维修 / 验收 / 闭环 五个动作。
- **SHALL** 按状态机门控：动作按钮仅在当前报警状态等于该动作前驱状态时可用（已闭环为终态，全禁用）。
- **SHALL** 以对话框收集该动作的补充字段，**且「处理意见」必填**，提交后连同操作人写入故障时间线。
- **SHALL** 操作列挂 `v-permission="'fire-facility:handle'"`，无该权限码的角色不可见。
- **SHALL** 处置成功后自动刷新列表（复用既有 `fire-facility.fault` 实时订阅，并兜底重拉）。

### fire-facility.alarm-item-typing（类型对齐）

- **SHALL** 将 `FireFacilityAlarmItem.id` 类型定为 `string`，与后端 `private String id`、
  契约 `type: string`、实际下发值 `AL-<故障号数字部分>` 三方一致。
