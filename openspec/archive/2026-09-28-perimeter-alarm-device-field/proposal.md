# Proposal: perimeter-alarm-device-field（前端）

## 背景

`SecurityStatusPanel` 卡片「设备」原本取 `deviceId || relatedCamera` 回落；但新增弹窗从未采集 `deviceId`，人工录入告警恒为空，只能回退到关联摄像机，且「设备」语义与「关联摄像机」混同。

## 变更

- `PerimeterAlarmCreateDialog` 新增「设备编号」输入框（自由文本），映射到 `PerimeterAlarmCreatePayload.deviceId`。
- 卡片「设备」维持 `deviceId || relatedCamera || '—'` 优先级，录入设备编号后优先展示真实设备。

## 影响

仅新增可选字段，向后兼容（不传则回落关联摄像机）。
