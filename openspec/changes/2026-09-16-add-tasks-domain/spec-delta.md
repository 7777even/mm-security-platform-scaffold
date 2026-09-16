# Spec Delta: mobile-tasks-wiring（移动端处置任务域接后端）

## ADDED Requirements

### Requirement: 移动端处置任务取数后端化

移动端任务中心 SHALL 经 `@/services/task` 从后端 `/api/v1/tasks` 取数，不再使用本地静态数据。

#### Scenario: 任务列表

- **WHEN** 打开 `/tasks`
- **THEN** 展示后端返回的任务（标题 / 编号 / 区域与时限 / 状态标签）

#### Scenario: 任务详情

- **WHEN** 打开 `/tasks/:id`
- **THEN** 展示后端任务详情（来源 / 位置 / 时限 / 内容）；未命中显示空态

#### Scenario: 路径规划

- **WHEN** 打开 `/path`
- **THEN** 任务抬头取自后端首条任务；地图几何仍为本地 `data/geo.ts`

### Requirement: 离线不造假

未连后端时 SHALL 显示空态并触达全局离线告警，不得回灌本地假数据。
