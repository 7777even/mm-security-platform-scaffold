# Spec Delta: realtime-channel（全量数据变更实时刷新）

## MODIFIED Requirements

### Requirement: 多域变更订阅与刷新

客户端 SHALL 按 `<domain>.changed` topic 路由消息，触发对应域数据刷新，实现三端写后实时刷新。

#### Scenario: 域变更刷新

- **WHEN** 收到 `{topic:"<domain>.changed", payload:{domain, action, id?, data?}}`
- **THEN** 调用该域注册的刷新钩子，重新拉取该域只读数据；非法 / 未注册域静默忽略

#### Scenario: 多端共用

- **WHEN** 管理端 / 大屏 / 移动端任一端写入数据并经后端广播
- **THEN** 三端订阅该域的客户端均在秒级内自动刷新，无需手动刷新或重进页面

### Requirement: 消息订阅与解析（扩展）

客户端 SHALL 在既有 `alarm.push` 解析基础上，支持 `<domain>.changed` topic 路由，并对非法 JSON / 未知 topic 容错。

#### Scenario: 未知 topic 容错

- **WHEN** 收到未知 topic 或非法 JSON
- **THEN** 仅告警不抛异常，不影响既有 alarm.push 消费

## 关联 Spec

- 目标 spec 文件：`openspec/specs/realtime-channel/spec.md`（修改既有 capability，新增「多域变更订阅与刷新」需求）。
