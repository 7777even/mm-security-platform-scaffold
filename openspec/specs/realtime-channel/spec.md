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
