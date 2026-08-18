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
客户端须按 topic 分发消息，并对非法 JSON 做容错。

#### Scenario: 消息分发
- **WHEN** 收到 `{topic, payload}` JSON 消息
- **THEN** 触发 onMessage 回调并透传 topic/payload；非法 JSON 仅告警不抛异常。

### Requirement: 零下行控制红线
实时通道仅消费只读监视数据，不得提供任何硬控下行写接口。

#### Scenario: 只监不控
- **WHEN** 检视 services 层实时通道代码
- **THEN** 不存在消防泵/应急广播/逃生门禁等生命安全类硬控的写操作端点。
