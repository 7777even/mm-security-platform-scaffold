# Spec: perimeter-alarm（治安报警）

> 大屏「治安报警」面板的查询展示与手工创建能力。来源 Change：`openspec/changes/2026-09-23-perimeter-alarm-create/`（已归档）。

## 职责边界

- 数据真源为后端 `GET /security/perimeter-alarms/latest` 与 `POST /security/perimeter-alarms`（契约见 `docs/api/security.openapi.json`）。
- 前端 `src/services/security.ts` 提供 `fetchLatestPerimeterAlarm` / `createPerimeterAlarm` / `updatePerimeterAlarm`，并导出 `touchPerimeterAlarmChanged` 触发订阅刷新。
- 「新增治安报警」按钮在 `SecurityStatusPanel` 常驻渲染；创建权限由后端 `security:perimeter-create` 服务端强控（无权限提交返回 403 + B3 包络 `code!=0`）。

## Requirements

### Requirement: 面板展示最新治安报警

`SecurityStatusPanel` SHALL 调用 `fetchLatestPerimeterAlarm` 拉取并展示当前厂区治安态势（待处置/平稳），并通过 `subscribeDomainChange('security.perimeter-alarm')` 在广播后自动重拉。

#### Scenario: 面板进入加载

- **WHEN** 面板挂载
- **THEN** 调用 `fetchLatestPerimeterAlarm`，存在告警时显示「存在待处置治安报警」，否则显示「厂区治安态势平稳」

#### Scenario: 实时刷新

- **WHEN** 收到 `security.perimeter-alarm.changed` 广播
- **THEN** 面板重新拉取最新告警并刷新展示

### Requirement: 前端手工创建周界入侵告警入口

`SecurityStatusPanel` SHALL 提供「新增治安报警」按钮与最小可用字段表单（`PerimeterAlarmCreateDialog`），提交 `POST /security/perimeter-alarms` 后即时刷新面板。

#### Scenario: 操作员填写并提交

- **WHEN** 操作员点击「新增治安报警」并填写标题等字段提交
- **THEN** 调用 `createPerimeterAlarm` 提交，成功后 `touchPerimeterAlarmChanged()` 重拉最新告警，面板显示新录入记录，并 `showToast('周界入侵告警已创建')`

#### Scenario: 提交失败提示

- **WHEN** 提交接口失败（含无权限 403）
- **THEN** 前端 `showToast('创建失败：…')`，SHALL NOT 回退任何演示/假数据

#### Scenario: 无创建权限

- **WHEN** 操作员不持有 `security:perimeter-create` 仍提交创建
- **THEN** 后端返回 403（B3 包络 `code!=0`），前端 `showToast` 提示「创建失败：…」，不落本地假数据（权限服务端强控，按钮本身不做前端隐藏）

## 约束

- 创建表单最小字段：`title`（必填）、`alarmType`（默认「周界入侵告警」）、`levelCode`、`location`、`alarmTime`、`description`、`objectName`、`objectType`、`intrusionPosition`、`intrusionMethod`、`relatedCamera`。
- `alarmTime` 由 `datetime-local` 经 `toBackendDatetime` 转为 `yyyy-MM-dd HH:mm:ss` 后提交。
- 弹窗为自研 Teleport 浮层（非 el-dialog），视觉对齐 `EmergencyEventCreateModal`。
