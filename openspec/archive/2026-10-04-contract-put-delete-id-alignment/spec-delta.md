# Spec Delta: 契约 PUT/DELETE 路由对齐至 /{id}

## Capability: fire-monitoring（防火巡查记录）

### MOVED — 编辑 / 删除路由

- 前端契约 `PUT /fire/patrols` 与 `DELETE /fire/patrols` SHALL 改为 `PUT /fire/patrols/{id}` 与 `DELETE /fire/patrols/{id}`，与后端 `FireMonitoringController` 实现及前端 `updateFirePatrol` / `deleteFirePatrol` 调用保持一致（均以 `id` 定位）。
- 路径参数 `id`（数据库主键，integer，必填）保留在 operation 内（`name=id`、`in=path`）。

## Capability: security（防恐柱 / 道闸）

### MOVED — 编辑 / 删除路由

- `PUT /security/bollards` / `DELETE /security/bollards` SHALL 改为 `/security/bollards/{id}`；`PUT /security/gate-controls` / `DELETE /security/gate-controls` SHALL 改为 `/security/gate-controls/{id}`，对齐后端 `SecurityController` 实现与前端 `updateBollard` / `deleteBollard` / `updateGateControl` / `deleteGateControl` 调用。
- 三态服务降级语义与权限码（`security:bollard-write` / `security:gate-control-write`）不变。

#### Scenario: 路由对齐验证

- **GIVEN** 后端实现 `PUT/DELETE .../{id}`，前端 service 已调 `/{id}`
- **WHEN** 重跑 `check-api-contract.mjs --strict`
- **THEN** 路由差异由 12 归 0，契约与实现逐字一致
