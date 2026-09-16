# Design: 移动端首页统计复用大屏既有端点

## 取数映射（全部复用既有服务，无新增接口）

| 首页区块               | 服务函数                 | 端点                    | 说明                                                   |
| ---------------------- | ------------------------ | ----------------------- | ------------------------------------------------------ |
| 告警概览（按类型计数） | `fetchAlarmPage(1,200)`  | `GET /alarms`           | 与大屏报警面板同源；按 `type` 分组计数，`total` 为总数 |
| 待办任务 / 待办数      | `fetchTasks()`           | `GET /tasks`            | 取前 2 条；`pendingCount` = 非「已完成」               |
| 应急事件条             | `fetchEmergencyEvents()` | `GET /emergency-events` | 分组拍平计数；0 则不渲染                               |
| 未读计数               | `fetchMessages()`        | `GET /messages`         | `read=false` 计数                                      |

## 类型映射

`TYPE_META[AlarmType]` → `{ label, icon, severity }`；未知类型回退 `{ label: 原值, icon: 'alarm', severity: 'info' }`
（**按数据自适应**，不写死 6 项，避免后端调整枚举后出现空卡）。

## 边界

- 复用大屏端点意味着**依赖既有契约**：不改 `alarm`/`tasks`/`emergency-event`/`message` 契约。
- 未连后端时各服务自带三态兜底 → 首页保持空态，不回灌假数据。
