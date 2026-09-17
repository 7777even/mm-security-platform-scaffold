# Capability: Realtime Channel

## ADDED Requirements

### Requirement: WebSocket 可靠连接

系统须提供 WebSocket 实时通道客户端，支持心跳保活与断线指数退避重连。

#### Scenario: 断线重连

- **WHEN** 连接异常断开且非主动关闭
- **THEN** 按 1s·2^n（上限 30s）退避自动重连，重连成功后重置计数并恢复心跳。

#### Scenario: 心跳保活

- **WHEN** 连接建立
- **THEN** 按配置间隔（默认 15s）周期性发送 ping，断开时停止心跳。

### Requirement: 消息订阅与解析

客户端须按 topic 分发消息，并对非法 JSON 做容错，并在既有 `alarm.push` 基础上支持 `<domain>.changed` 路由。

#### Scenario: 消息分发

- **WHEN** 收到 `{topic, payload}` JSON 消息
- **THEN** 触发 onMessage 回调并透传 topic/payload；非法 JSON 仅告警不抛异常。

#### Scenario: 未知 topic 容错

- **WHEN** 收到未知 topic 或非法 JSON
- **THEN** 仅告警不抛异常，不影响既有 alarm.push 消费。

### Requirement: 多域变更订阅与刷新

客户端 SHALL 按 `<domain>.changed` topic 路由消息，触发对应域数据刷新，实现三端写后实时刷新。

#### Scenario: 域变更刷新

- **WHEN** 收到 `{topic:"<domain>.changed", payload:{domain, action, id?, data?}}`
- **THEN** 调用该域注册的刷新钩子，重新拉取该域只读数据；非法 / 未注册域静默忽略

#### Scenario: 多端共用

- **WHEN** 管理端 / 大屏 / 移动端任一端写入数据并经后端广播
- **THEN** 三端订阅该域的客户端均在秒级内自动刷新，无需手动刷新或重进页面

### Requirement: 零下行控制红线

实时通道仅消费只读监视数据，不得提供任何硬控下行写接口。

#### Scenario: 只监不控

- **WHEN** 检视 services 层实时通道代码
- **THEN** 不存在消防泵/应急广播/逃生门禁等生命安全类硬控的写操作端点。

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
