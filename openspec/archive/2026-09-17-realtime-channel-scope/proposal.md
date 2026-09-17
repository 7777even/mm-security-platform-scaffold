# 变更提案：实时通道 WS 握手带令牌 + 鉴权失败刷新（realtime-channel-scope）

> 状态：`draft` —— L3 安全加固变更。承接后端 Change `realtime-ws-scope`：后端已在 `/ws/alarm` 握手阶段要求 `?token=` 鉴权（关闭免鉴权广播暴露面）。本变更让三端实时通道在握手时注入访问令牌，并在连接从未成功打开（可能因令牌失效被 401 拒绝）时尝试刷新一次，防无限重连锤击。修改既有 `realtime-channel` capability。

## Why

后端 `realtime-ws-scope` 落地后，`/ws/alarm` 握手必须携带有效 `?token=`，否则返回 401 拒绝升级。浏览器 WebSocket 升级请求无法设置 `Authorization` 头，令牌只能经查询参数注入。同时，三端实时连接为长连接，一旦 access 令牌过期（刷新令牌经 HttpOnly Cookie 可续期），需在握手失败时尝试续期一次再重建，避免对已失效令牌无限重连锤击。

用户于 2026-09-17 确认：直接实现（后端 + 前端 + 测试 + openspec 本轮一次性落地）。

## What Changes

- 改造 `src/services/ws.ts`：`RealtimeClientOptions` 新增 `getToken?: () => string | null` 与 `refreshToken?: () => Promise<boolean>`（均为**构造参数**，不暴露为公开方法，保持零下行控制红线仅 `connect`/`close` 公开）；`_buildUrl()` 在有令牌时追加 `?token=<encodeURIComponent(token)>`；`_onClosed()` 在「连接从未成功打开且未尝试过刷新」时调用 `refreshToken()` 一次，成功则立即重建连接，失败/异常退回指数退避重连（不重复刷新）。
- 改造 `src/services/realtime.ts`：`startRealtime` 注入 `getToken: () => getAccessToken()`（wujie 子应用经 `token.ts` 桥接主壳令牌）与 `refreshToken: tokenRefresher ?? undefined`；新增导出 `setRealtimeTokenRefresher(fn)` 供 `auth` 单向注册，规避 `realtime ↔ auth` 循环依赖。
- 改造 `src/stores/auth.ts`：注册 `refreshRealtimeToken`（调 `/auth/refresh` 取得新令牌写入内存态），经 `setRealtimeTokenRefresher` 注入实时层。
- 扩展契约 `docs/api/realtime.openapi.json`：新增 `?token=` 握手鉴权说明，`info.version` 升 1.2.0，`x-websocket.connection` 与 401 响应描述更新。
- 补测：`ws.spec.ts`（token 注入 URL + 鉴权失败刷新一次 + 已连上掉线不刷新）/`realtime.spec.ts`（token 注入不破坏既有用例）。

## Capabilities

### Modified Capabilities

- `realtime-channel`：在既有「WebSocket 可靠连接 / 消息订阅与解析 / 多域变更订阅与刷新 / 零下行控制红线」基础上，新增「WS 握手令牌注入」与「鉴权失败刷新重连」两项能力——配合后端 `realtime-ws-scope` 关闭免鉴权广播暴露面。

## Impact

- 受影响范围：`src/services/ws.ts` / `src/services/realtime.ts` / `src/stores/auth.ts` / `docs/api/realtime.openapi.json` / 相关 spec。
- 契约与权限语义：令牌纯内存态（token.ts 红线，防 XSS）；刷新依赖 HttpOnly Cookie（rt），前端 JS 不可读；零下行控制红线不变——公开面仍仅 `connect`/`close`。
- 不触碰的边界：不改 WS 端点（仍 `/ws/alarm`）/ 心跳 / 退避重连节奏；不改任何 REST 端点或权限码；不改三端视觉。
- 依赖与回归面：依赖后端 Change `realtime-ws-scope` 的握手鉴权；回归既有 `alarm.push` / `<domain>.changed` 消费路径（单测已覆盖）。

## 人工确认关卡（L3 须过）

- [x] 提案范围与用户确认一致：用户明确「直接实现（后端+前端+测试+openspec）」，且未映射域 fail-open 决策已在后端 Change 记录，无需求扩散。
- [x] 目标端 UI 规范已对齐：本变更仅改 services / store / 契约，不触及三端视觉 token / 布局，UI 规范无冲突。
- [x] API 契约未违反：零下行控制红线保持（公开面仍仅 `connect`/`close`）；令牌经 `?token=` 查询参数注入属 WS 升级鉴权，不新增下行端点；复用既有 `/ws/alarm`。
- [x] 高风险项：未触及 Cesium 内核 / wujie 壳 / 构建部署链路；`realtime ↔ auth` 改为单向注册规避循环依赖；本变更为 L3，不需要 L4 人工确认。
