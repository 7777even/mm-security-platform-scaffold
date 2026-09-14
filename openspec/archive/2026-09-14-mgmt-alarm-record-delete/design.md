# 设计

## 复用既有范式

- 参照 `apps/mgmt/views/system/StaffView.vue` 的删除流程：
  `confirm`（`utils/feedback`）→ service 调用 → `reportAudit`（`services/audit`）→ `toastOk` → `load()` 刷新。
- 权限门禁：后端以 `@RequireAuth(role = "ADMIN")` 角色校验，**非 perm_code**；
  因此前端不依赖 `v-permission`，改用 `useAuthStore` 的 `role` / `roles` 判定 `isAdmin`
  （`computed`），与后端契约对齐。

## 字段与文案

- 确认弹窗文案：`确认删除报警记录「{title|alarmId}」？删除后不可恢复。`
- 审计事件：`{ action: 'alarm.record.delete', module: 'alarm', detail: { alarmId } }`。
- 非 `ADMIN` 用户操作列显示「—」。
