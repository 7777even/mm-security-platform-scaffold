# Spec Delta: mobile-home-stats（移动端首页统计）

## ADDED Requirements

### Requirement: 首页统计取数后端化（复用大屏端点）

移动端首页 SHALL 经既有服务从真实后端取数，不使用页内硬编码统计；告警概览复用大屏同源 `/alarms`。

#### Scenario: 告警概览

- **WHEN** 打开 `/home` 且后端可用
- **THEN** 告警卡按 `/alarms` 的 `type` 聚合展示计数，总数取分页 `total`

#### Scenario: 待办 / 事件条 / 未读

- **WHEN** 打开 `/home`
- **THEN** 待办取自 `/tasks`、事件条取自 `/emergency-events`、未读取自 `/messages`

#### Scenario: 无数据

- **WHEN** 后端不可用或无对应数据
- **THEN** 展示空态，不渲染硬编码数字

### Requirement: 不新增接口

首页统计 SHALL 复用既有端点，不得为此新增后端接口或契约。
