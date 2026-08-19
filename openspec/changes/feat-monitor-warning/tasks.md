> 状态：已完成（2026-08-19）。P2 第一块功能模块（监测预警），TDD 推进，全量测试 98 例绿。

## 实时接入与状态

- [x] 1.1 [TDD] `stores/alarm.ts`：`ingestAlarm(msg)` 纯函数（去重入列表）、分页/等级/状态筛选派生状态、ack 状态流转（ACTIVE→ACKED→DISPATCHED→CLOSED）。
- [x] 1.2 [TDD] `stores/alarm.spec.ts`：入流追加与去重、分页切片、筛选过滤、ack 状态机流转。
- [x] 1.3 [TDD] 实时流接线：新增 `services/realtime.ts` 启动 `RealtimeClient` 并按 `alarm.push` topic 分发至 alarm store；`services/realtime.spec.ts` 覆盖 topic 分发与非法消息容错；`main.ts` 引导启动时 `startRealtime()`。

## 报警列表与处置视图

- [x] 2.1 [TDD] `views/fire-alarm/index.vue`：报警列表（分页 + 等级/状态筛选）、详情抽屉、`ack` 按钮。
- [x] 2.2 [TDD] `composables/useAlarmView.spec.ts`：筛选/分页、空态、`fire-alarm:ack` 无权限时 ack 返回 false 且不改状态/不上报。
- [x] 2.3 `ack` 动作接 `reportAudit({ action: 'alarm-ack', module: 'fire-alarm' })`。

## 性能与合规打点

- [x] 3.1 dashboard 首屏补 P9（baseMapMs）/ P10（componentQueryMs）D1 预算打点：`perf-budget.recordPerfAsync` 包裹 `fetchAlarmPage` 与地图渲染。
- [x] 3.2 确认本 change 不新增任何硬控写端点（复用 `hardControlGuard`，仅软件协同 ack）。

## 验收

- [x] 4.1 `vitest run` 全绿（21 文件 / 98 例）；`eslint` 0 error；`npm run build` 通过。
- [x] 4.2 回写 `D1验收标准_脚手架差距清单与整改建议.md` 中「监测预警」P2 状态为已闭环，并归档并入 `scaffold-foundation/spec.md`。
