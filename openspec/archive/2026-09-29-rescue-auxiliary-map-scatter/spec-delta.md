# Spec Delta: 应急辅助信息地图落图浮层

> 纯前端 UI 增强，不新增/修改对外 capability Requirement，无契约变更。

## ADDED Evidence

### Scenario: 点击类别在地图撒点浮层

- **WHEN** 用户在应急事件页点击「应急辅助信息」某类别
- **THEN** Cesium 地图出现该类别的位置示意散布浮层（与救援力量浮层体验一致），关闭/切换事件时复位
