# Spec Delta

## emergency-event（契约）

- 新增 `POST /emergency-events/{id}/report`：事件预警（报送）。参数 `id`(path)，返回 `EmergencyEventItem`。
  无新增 schema（复用 `EmergencyEventItem`）。

## accident-rescue（前端聚合）

- `AccidentRescuePayload.status` 联合类型加入 `warning`；`reported=true` 时处置页派生「已预警」状态。
- `IncidentDetailPanel` 新增 emit `report`；`AccidentEmergencyRescue` 监听并刷新聚合。
- `AccidentRescueMap.incidentStatus` 联合类型加入 `warning`（地图标记状态口径扩展）。
