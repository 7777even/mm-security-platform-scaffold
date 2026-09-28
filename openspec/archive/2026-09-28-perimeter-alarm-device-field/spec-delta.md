# Spec Delta: perimeter-alarm-device-field（前端）

## Capability: perimeter-alarm

### MODIFIED

#### Requirement: 前端手工创建周界入侵告警入口

前端 `PerimeterAlarmCreateDialog` SHALL 在表单中提供「设备编号」字段（可选），提交 `POST /security/perimeter-alarms` 时随 `deviceId` 一并发送，使卡片「设备」展示真实录入设备。

##### Scenario: 录入时填写设备编号

- **WHEN** 操作员在新增弹窗填写「设备编号」并提交
- **THEN** `createPerimeterAlarm` 发送 `deviceId`，成功后面板卡片「设备」优先展示该设备编号

##### Scenario: 不填写设备编号

- **WHEN** 操作员留空「设备编号」提交
- **THEN** 卡片「设备」回落展示关联摄像机（若存在），与既有行为一致
