# Design: 消防设施报警列表接入处置闭环

## 1. 状态机门控（决定按钮可用性）

复用后端故障状态枚举 `待确认→已确认→已派单→维修中→待验收→已闭环`，
每个处置按钮仅在**当前状态等于其前驱**时可用（已闭环为终态，全部禁用）：

| 动作 | 前驱状态（可点击） | 目标 faultStatus | 对话框额外字段     |
| ---- | ------------------ | ---------------- | ------------------ |
| 确认 | 待确认             | 已确认           | —                  |
| 派单 | 已确认             | 已派单           | 派单人、工单号     |
| 维修 | 已派单             | 维修中           | 维修措施、预计完成 |
| 验收 | 维修中             | 待验收           | 验收人、验收结论   |
| 闭环 | 待验收             | 已闭环           | 实际完成           |

「处理意见」为所有动作**必填**，提交时连同 `time/operator/action` 一起作为一条故障时间线追加，
满足处置过程可追溯。`operator` 取 `useAuthStore().realName || username`。

## 2. 组件划分

- `FireFacilityAlarmHandleDialog.vue`（新增）：按 `action` 显隐字段的专用处置对话框，
  `v-model` 控制显隐，提交成功后 `emit('saved')`。
- `FireFacilityAlarmView.vue`：持有 `dialogVisible / activeAction / activeAlarm`，
  操作列按钮调用 `openHandle(row, action)` 打开对话框。

## 3. 类型漂移修正（顺带）

手写 `src/services/fireFacility.ts` 的 `FireFacilityAlarmItem.id` 原为 `number`，
但后端实体是 `private String id`、契约 `type: string`、实际下发 `AL-<故障号>`。
改为 `id: string`，与后端/契约/生成类型三方对齐，避免新端点传参时报类型错。

## 4. 实时刷新

处置写回触发后端 `fire-facility.fault` 广播；报警视图**已订阅**该域并绑定 `load()`，
故无需新增订阅；`onSaved` 再兜底 `void load()` 一次，保证离线/广播丢失时也能刷新。

## 5. 守门

- `scripts/validate-api-contracts.mjs`：本次 fire-facility 新增零违规
  （脚本当前报的 9 处违规全在 `emergency.openapi.json`，为既有问题、不在本变更范围）。
- `vue-tsc` type-check 与 eslint 对本变更文件全绿。
