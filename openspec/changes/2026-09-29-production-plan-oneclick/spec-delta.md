# Spec Delta: production-plan-oneclick

## Capability: production-plan（前端应急）

> 生产应急域核预案浏览与一键调用面板。既有 capability 仅支持本地浏览与本地置位；本变更补齐「写回后端 + 域实时刷新 + 域内核」闭环。

### ADDED

#### Requirement: 一键调用写回与域实时刷新

生产应急面板 SHALL 订阅 `emergency.plan` 域实时变更并自动重拉预案列表；`EmergencyPlanSwitchDialog` 接受 `domain` 入参以支持域内核预案浏览（越过通用事故类型/装置筛选）；「一键调用」SHALL 调用后端 `invokeEmergencyPlan` 持久化（激活+广播+留痕），而非仅本地置位。

##### Scenario: 一键调用写回成功

- **WHEN** 用户在「生产应急」域选中预案并点击调用
- **THEN** 前端调用 `invokeEmergencyPlan(plan.id, { note })`，成功后 toast 提示并关闭面板，后端广播使其他端同步

##### Scenario: 域内核预案浏览

- **WHEN** `EmergencyPlanSwitchDialog` 以 `domain='production'` 打开
- **THEN** 仅列生产域预案，隐藏通用事故类型/装置筛选

##### Scenario: 预案变更实时刷新

- **WHEN** 任一端更新 `emergency.plan` 域
- **THEN** `ProductionPlanPanel` 经 `subscribeDomainChange('emergency.plan')` 自动重拉列表

##### Scenario: 卸载退订

- **WHEN** 面板卸载
- **THEN** 取消 `emergency.plan` 订阅，避免泄漏
