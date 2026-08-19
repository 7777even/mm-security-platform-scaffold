> 状态：进行中（2026-08-19）。P2 第一块功能模块（监测预警），TDD 推进。

## 实时接入与状态

- [ ] 1.1 [TDD] `stores/alarm.ts`：`ingestAlarm(msg)` 纯函数（去重入列表）、分页/等级/状态筛选派生状态、ack 状态流转（ACTIVE→ACKED→DISPATCHED→CLOSED）。
- [ ] 1.2 [TDD] `stores/alarm.spec.ts`：入流追加与去重、分页切片、筛选过滤、ack 状态机流转。
- [ ] 1.3 [TDD] 实时流接线：启动 `RealtimeClient` 并按 `alarm.push` topic 分发至 alarm store；`services/realtime.spec.ts` 或 store spec 覆盖 topic 分发与非法消息容错。

## 报警列表与处置视图

- [ ] 2.1 [TDD] `views/fire-alarm/index.vue`：报警列表（分页 + 等级/状态筛选）、详情抽屉、`ack` 按钮。
- [ ] 2.2 [TDD] `views/fire-alarm/index.spec.ts`（或 composable spec）：筛选交互、空态、`fire-alarm:ack` 无权限时按钮禁用。
- [ ] 2.3 `ack` 动作接 `reportAudit({ action: 'alarm-ack', module: 'fire-alarm' })`。

## 性能与合规打点

- [ ] 3.1 列表查询接 `recordPerf`/`markOnce` 触发 P10 打点（查询组件内调用）。
- [ ] 3.2 确认本 change 不新增任何硬控写端点（复用 `hardControlGuard`，仅软件协同 ack/dispatch 预案）。

## 验收

- [ ] 4.1 `vitest run` 全绿；`eslint` 0 error；`npm run build` 通过。
- [ ] 4.2 回写 `D1验收标准_脚手架差距清单与整改建议.md` 中「监测预警」P2 状态为已闭环，并归档并入 `scaffold-foundation/spec.md`。
