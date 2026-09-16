# Spec Delta: mobile-drills-wiring（移动端应急演练域接后端）

## ADDED Requirements

### Requirement: 移动端演练取数后端化

移动端演练信息 SHALL 经 `@/services/drill` 从后端 `/api/v1/drills` 取数，不再使用本地静态数据。

#### Scenario: 演练列表

- **WHEN** 打开 `/drills`
- **THEN** 展示后端返回的演练（名称 / 编号 / 时间 / 地点 / 任务数 / 状态标签），筛选 chip 由状态派生

#### Scenario: 演练详情

- **WHEN** 打开 `/drills/:id`
- **THEN** 展示后端演练详情与任务子项；未命中显示空态

### Requirement: 离线不造假

未连后端时 SHALL 显示空态并触达全局离线告警，不得回灌本地假数据。
