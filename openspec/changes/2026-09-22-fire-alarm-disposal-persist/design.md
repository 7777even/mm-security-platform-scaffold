# Design: fire-alarm-disposal-persist（前端）

## 字段形态转换（与后端约定一致）

- `dispatchPersonnel`（前端 `string[]`）→ 写：`join(',')`；读：`split(',').filter(Boolean)`。
- `notifyApp/notifySms`（前端 `boolean`）→ 写：`['APP'?, 'SMS'?].filter().join(',')`；读：`includes('APP'/'SMS')`。
- `handleResult` / `handleTime`（前端 `string`）→ 直通（可空）。

## 写回触发点（均在 `AlarmDetailPanel.vue`）

| 交互              | 写回字段                                   |
| ----------------- | ------------------------------------------ |
| 添加/移除派单人员 | `dispatchPersonnel`（新数组 join）         |
| 切换 APP/短信     | `notifyMethod`（按当前布尔重算）           |
| 处置文本失焦      | `handleResult`                             |
| 提交处置          | `handleTime` + `handleResult`（随 status） |

`persistFireAlarm` 统一组装 `FireAlarmUpdatePayload`：仅传入的非空/显式字段参与写回，
`notifyMethod` 始终按当前 `detail` 的 `notifyApp/notifySms` 计算（兜底默认 APP）。

</tool_calls:6124c78e>
