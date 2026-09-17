# Spec Delta: realtime-channel（实时通道 WS 握手带令牌 + 鉴权失败刷新）

## ADDED Requirements

### Requirement: WS 握手令牌注入

实时通道客户端 SHALL 在建立 `/ws/alarm` 连接时，将访问令牌经 `?token=` 查询参数注入连接 URL（浏览器 WS 升级无法携带 `Authorization` 头），配合后端握手鉴权关闭免鉴权广播暴露面。

#### Scenario: 已登录注入令牌

- **WHEN** 内存态存在有效访问令牌且调用 `startRealtime`
- **THEN** 连接 URL 携带 `?token=<encodeURIComponent(accessToken)>`，握手通过并接收广播

#### Scenario: 未登录不注入

- **WHEN** 内存态无访问令牌
- **THEN** 连接 URL 不含 `token` 参数，握手返回 401（连接不建立）

#### Scenario: 红线不破

- **WHEN** 检视 `RealtimeClient` 公开原型方法
- **THEN** 仅暴露 `connect` / `close`，`getToken` / `refreshToken` 仅为构造参数，不成为公开方法

### Requirement: 鉴权失败刷新重连（防无限锤击）

实时通道客户端 SHALL 在连接**从未成功打开**且可能因令牌失效被握手拒绝（401）时，经 `refreshToken` 回调尝试刷新一次，成功则立即重建连接；已成功打开后的网络掉线不触发刷新。

#### Scenario: 从未连上且刷新成功

- **WHEN** 连接从未成功打开，握手因令牌失效被拒，且 `refreshToken` 返回成功
- **THEN** 客户端刷新令牌后立即重建连接（无退避），且刷新仅尝试一次

#### Scenario: 从未连上且刷新失败

- **WHEN** 连接从未成功打开，握手被拒，且 `refreshToken` 返回失败
- **THEN** 客户端不立即重建，退回指数退避重连，且刷新仅尝试一次（不无限锤击）

#### Scenario: 已连上后掉线不刷新

- **WHEN** 连接曾成功打开，之后因网络抖动断开
- **THEN** 客户端直接指数退避重连，不调用 `refreshToken`（避免瞬时抖动刷爆续期接口）

## 关联 Spec

- 目标 spec 文件：`openspec/specs/realtime-channel/spec.md`（修改既有 capability，新增「WS 握手令牌注入」「鉴权失败刷新重连」两项需求）。
