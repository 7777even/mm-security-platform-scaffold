# Design: perimeter-alarm-device-field（前端）

复用既有 `pac-field` 文本输入范式，deviceId 作为自由文本（与关联摄像机解耦，避免两个同源下拉混淆）；卡片展示优先级 `deviceId || relatedCamera` 不变。
