# 报警记录页支持删除操作（ADMIN 角色门禁 + 审计留痕）

## 背景

报警记录页（`/alarm-record`，`apps/mgmt/views/alarm/AlarmRecordView.vue`）已接入后端
`GET /api/v1/alarms` 分页查询，但此前仅有只读列表。后端 `AlarmController` 早已提供
`DELETE /api/v1/alarms/{alarmId}`（`@RequireAuth(role = "ADMIN")`），前端 `services/alarm.ts`
亦已存在 `deleteEmergencyEvent`。本次补齐行级删除写操作，闭合报警域首页面基础 CRUD。

## 目标

- 报警记录列表新增「操作」列，提供删除按钮。
- 删除按钮按当前用户 `ADMIN` 角色显隐（与后端角色门禁一致）。
- 删除前二次确认，删除成功后 `reportAudit` 安全审计留痕并刷新列表。

## 范围

- 仅前端 UI 改动（`apps/mgmt/views/alarm/AlarmRecordView.vue`）。
- 不改动后端接口、不改动前端契约（`DELETE` 端点与 `deleteEmergencyEvent` 均已存在）。
- 不涉及契约四同步（无接口 / schema 变更）。
