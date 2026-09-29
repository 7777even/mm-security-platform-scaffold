# Spec Delta: tv-monitor-crud

## Capability: tv-monitor（前端契约）

> 工业电视监控点台账的前端契约与页面能力。契约真源 `docs/api/tv.openapi.json` 既有只读端点；本变更补齐写侧契约与可写管理页。

### ADDED

#### Requirement: 监控点台账写侧契约与页面

契约 SHALL 在 `tv.openapi.json` 提供 `POST /tv/monitors`、`PUT /tv/monitors/{code}`、`DELETE /tv/monitors/{code}` 及 `TvMonitorUpsertRequest` schema（monitorCode 必填，含 online/integrity/monitorType/department/zoneCode/location/height/angle）；前端管理页 `TvMonitorMgmtView.vue` 据此提供台账 CRUD + 防区归属编辑。

##### Scenario: 前端新增监控点

- **WHEN** 持有 `tv:monitor:create` 的用户在管理页提交表单
- **THEN** 调用 `POST /tv/monitors`，成功后列表经 `tv.monitor` 实时刷新重拉

##### Scenario: 前端编辑防区归属

- **WHEN** 持有 `tv:monitor:update` 的用户修改某点 `zoneCode` 并提交
- **THEN** 调用 `PUT /tv/monitors/{code}`，仅覆盖非空字段（含 `online=false` 置离线）

##### Scenario: 前端删除监控点

- **WHEN** 持有 `tv:monitor:delete` 的用户确认删除
- **THEN** 调用 `DELETE /tv/monitors/{code}`，成功后列表刷新

##### Scenario: 无权限

- **WHEN** 用户不持有对应权限码
- **THEN** 对应写按钮不渲染（`v-permission`）
