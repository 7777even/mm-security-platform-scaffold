# Spec Delta: mobile-msds-wiring（移动端化学品 MSDS 域接后端）

## ADDED Requirements

### Requirement: 移动端 MSDS 取数后端化

移动端化学品知识 SHALL 经 `@/services/msds` 从后端 `/api/v1/msds` 取数，不再使用本地静态数据。

#### Scenario: 化学品列表

- **WHEN** 打开 `/msds`
- **THEN** 展示后端返回的化学品（名称 / CAS / 分类标签），支持按名称或 CAS 前端检索

#### Scenario: MSDS 详情

- **WHEN** 打开 `/msds/:cas`
- **THEN** 展示后端该 CAS 的 MSDS 详情（分类/状态/沸点/闪点/爆炸极限/储存/安全/应急处置）；未命中显示空态

### Requirement: 离线不造假

未连后端时 SHALL 显示空态并触达全局离线告警，不得回灌本地假数据。
