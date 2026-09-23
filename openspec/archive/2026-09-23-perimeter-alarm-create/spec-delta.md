# Spec Delta: perimeter-alarm-create（前端）

## Capability: perimeter-alarm

### ADDED

#### Requirement: 前端手工创建周界入侵告警入口

前端 `SecurityStatusPanel` SHALL 提供「新增治安报警」按钮（按 `security:perimeter-create` 权限显隐）与最小可用字段表单，提交 `POST /security/perimeter-alarms` 后即时刷新面板。

##### Scenario: 操作员填写并提交

- **WHEN** 持有 `security:perimeter-create` 的操作员点击「新增治安报警」并填写标题等字段提交
- **THEN** 调用 `createPerimeterAlarm` 提交，成功后 `touchPerimeterAlarmChanged()` 重拉最新告警，面板显示新录入记录

##### Scenario: 无创建权限

- **WHEN** 操作员不持有 `security:perimeter-create` 仍提交创建
- **THEN** 后端返回 403（B3 包络 `code!=0`），前端 `showToast` 提示「创建失败：…」，不落本地假数据（权限服务端强控，按钮本身不做前端隐藏）
