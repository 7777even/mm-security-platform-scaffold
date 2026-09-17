# 设计文档：实时通道 WS 握手带令牌 + 鉴权失败刷新（realtime-channel-scope）

## 目标与约束

- 目标：三端实时通道在 `/ws/alarm` 握手时注入访问令牌，配合后端 `realtime-ws-scope` 关闭免鉴权广播暴露面；令牌失效导致握手被拒时，尝试刷新一次再重建，防无限重连锤击。
- 硬约束：零下行控制红线（公开面仅 `connect`/`close`）；令牌纯内存态（token.ts）；`getToken` / `refreshToken` 只能作为**构造参数**或模块级私有状态，绝不能成为 `RealtimeClient` 的公开原型方法；避免 `realtime ↔ auth` 循环依赖。

## 架构与方案

### 握手令牌注入

- `RealtimeClientOptions` 新增两个可选构造参数：`getToken?: () => string | null`（读纯内存态令牌）与 `refreshToken?: () => Promise<boolean>`（续期回调）。
- `_buildUrl()`：若 `getToken()` 返回非空，向连接 URL 追加 `?token=<encodeURIComponent(token)>`（URL 已带查询参数则用 `&`）。`connect()` 用 `_buildUrl()` 建连，每次重连重新取令牌（令牌可能已刷新）。
- `realtime.ts` 的 `startRealtime` 注入 `getToken: () => getAccessToken()`；wujie 子应用经 `token.ts` 的 `hostGetAccessToken` 桥接主壳令牌（子应用不独立登录）。

### 鉴权失败刷新重连（防无限锤击）

- 新增实例状态：`openedEver`（本客户端是否曾成功打开）、`refreshTried`（是否已尝试过一次刷新）。
- `_onClosed()` 分流：
  - 若 `!openedEver && refreshToken && !refreshTried` → `refreshTried = true`，调 `_tryRefreshThenReconnect()`：await `refreshToken()`，成功且未关闭则 `reconnectAttempts = 0` 后 `connect()`（立即重建，无退避）；失败/异常退回 `_scheduleReconnect()`。
  - 否则直接 `_scheduleReconnect()`（指数退避）。
- 关键不变量：**已成功打开后掉线不再触发刷新**（防瞬时网络抖动刷爆续期接口）；刷新仅一次，成功后若仍被拒（服务器异常）不再刷新，退回退避重连。

### 依赖解耦

- `realtime.ts` 导出 `setRealtimeTokenRefresher(fn)` 与模块级 `tokenRefresher`；`auth.ts` 单向 `import { setRealtimeTokenRefresher }`，在 store setup 内注册 `refreshRealtimeToken`（调 `/auth/refresh` → `setAccessToken` + 更新 store `accessToken`）。`realtime.ts` 不 import `auth`，规避循环依赖。

## 决策记录（ADR）

- ADR-1 令牌走 `?token=` 而非自定义头：浏览器 WS 升级无法设置 `Authorization` / 自定义请求头；查询参数是唯一可行通道；令牌连接级一次性使用，与 REST 同源 XSS 暴露面。
- ADR-2 刷新仅一次 + 仅从未连上时触发：避免对已失效令牌无限重连锤击，也避免瞬时抖动刷爆续期接口；与后端握手 401 语义对齐。
- ADR-3 公开面零新增：`getToken` / `refreshToken` 为构造参数而非原型方法，红线测试（仅 `connect`/`close`）不受影响。
- ADR-4 单向注册解耦：`auth → realtime` 单向，realtime 持有 `tokenRefresher` 引用，避免 `realtime ↔ auth` 循环依赖。

## 风险与缓解

| 风险                 | 影响               | 缓解                                                                            |
| -------------------- | ------------------ | ------------------------------------------------------------------------------- |
| 子应用未桥接主壳令牌 | 子应用 WS 握手 401 | `token.ts` 已桥接主壳 `getAccessToken`；`realtime.ts` 统一走 `getAccessToken()` |
| 刷新接口异常         | 实时连接无法恢复   | 刷新异常退回退避重连；退避上限 30s，不无限锤击                                  |
| 误加公开方法破坏红线 | 引入下行控制面     | `getToken`/`refreshToken` 为构造参数；红线单测断言仅 `connect`/`close`          |
| 循环依赖             | 模块加载失败       | `auth → realtime` 单向注册，realtime 不 import auth                             |

## 依赖

- 上游：后端 Change `realtime-ws-scope`（握手 `?token=` 鉴权）；`docs/api/realtime.openapi.json` 契约扩展。
- 下游：三端入口 `startRealtime` 接线（主壳 / mgmt / 各 fm-* 子应用均已有）。
