# 变更提案：全量数据变更实时刷新（realtime-data-sync）

> 状态：`draft` —— L3 业务能力变更。用户于 2026-09-17 确认「任何数据改动 → 三端实时刷新」，并要求按 openspec 四同步顺序落地。本变更修改既有 `realtime-channel` capability。

## Why

前端 `realtime.ts` 的 `dispatch` 仅处理 `alarm.push`，其余域（设备 / 工作站 / RBAC / 台账 / R1–R4 等）的写结果大屏与移动端只能靠「进入页面或按需拉取」才刷新，不能实时。后端将新增通用 `<domain>.changed` 广播（后端 Change `realtime-broadcast`），前端须把 `dispatch` 从「只处理 alarm」改成「按 topic 路由到各域 store 的刷新钩子」，实现三端写后秒级刷新。

## What Changes

- 改造 `src/services/realtime.ts`：`dispatch` 按 `topic` 路由——`alarm.push` 保持原行为；`<domain>.changed` 触发该域注册的刷新钩子（新增 `subscribeDomainChange(domain, handler)`）。
- 新增「域变更订阅」机制：各域 store（设备 / 工作站 / 系统管理 / R1–R4 / 台账等）在挂载 / 激活时 `subscribeDomainChange`，收到 `<domain>.changed` 即 `invalidate()` / 重新拉取，实现自动刷新。
- 扩展契约 `docs/api/realtime.openapi.json`：新增 `<domain>.changed` 通用消息与 `RealtimeDataChange` schema（与后端 Change 同步）。

## Capabilities

### Modified Capabilities

- `realtime-channel`：在既有「WebSocket 可靠连接 / 消息订阅与解析 / 零下行控制红线」基础上，新增「多域变更订阅与刷新」能力——客户端按 `<domain>.changed` topic 路由，触发对应域数据刷新。

## Impact

- 受影响范围：`src/services/realtime.ts`（dispatch 路由 + 订阅注册）、各域 Pinia store（新增 `subscribeRealtime` 钩子）、`src/services/realtime.spec.ts` / `ws.spec.ts` 补测。
- 契约与权限语义：扩展 `realtime.openapi.json`（新增消息，不删不改既有 alarm.push）；零下行控制红线不变——`<domain>.changed` 仅触发客户端重新拉取只读数据，不下发任何控制指令。
- 不触碰的边界：WS 端点仍 `/ws/alarm`、心跳 / 重连逻辑不变；`subscribeAlarmPush` 公开 API 保持向后兼容；不改任何 REST 端点或权限码。
- 依赖与回归面：依赖后端 Change `realtime-broadcast` 的 `<domain>.changed` 广播；回归 `useScreenAlarmFeed` 等既有 alarm 消费路径（须不受影响）。

## 人工确认关卡（L3 须过）

- [x] 提案范围与用户确认一致：用户于 2026-09-17 明确「任何数据改动 → 三端实时刷新」「全部数据改动都要实时刷新」，并指示按 openspec 四同步顺序落地（「按顺序做」）。无需求扩散、无自造平行任务。
- [x] 目标端 UI 规范已对齐：本变更仅改 services 层与 store 订阅，不触及三端视觉 token / 布局，UI 规范无冲突。
- [x] API 契约未违反：零下行控制红线保持（`*.changed` 仅刷新通知，不下发控制）；复用既有 `/ws/alarm`，不新增下行端点。
- [x] 高风险项：未触及 Cesium 内核 / wujie 壳 / token 体系 / 构建部署链路 / 权限模型；本变更为 L3，不需要 L4 人工确认。
