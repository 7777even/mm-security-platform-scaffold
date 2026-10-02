# Tasks: 应急事件与流程填报管理页 CRUD（前端）

- [x] `emergencyEvent.ts` 增 `updateEmergencyEvent` / `deleteEmergencyEvent` / `EMERGENCY_EVENT_STATUS_OPTIONS`
- [x] `formRecords.ts` 增 `deleteFormRecord`
- [x] `EmergencyEventView` 重写：新增 / 编辑 / 删除 + 操作列 + 订阅 `emergency.event`
- [x] `form-wizard.vue` 增删除按钮（ADMIN）+ 订阅 `form.record`
- [x] 契约两域补 put / delete（同一 path key）并 `gen:api-types`
- [x] 后端契约守门 `--strict`：路由差异 0 / schema 漂移 0
- [x] 单测：应急事件页 CRUD 链路 5 例（订阅 / 退订 / 删除 / 编辑提交体不含 create 字段 / 新增事件类型展开）
- [x] `type-check` / `lint`（0 error）通过
- [x] 全量 `vitest run`：72 文件 459 例通过
- [x] 后端真机对拍 18/18（含流程填报新增，后端已修主键分配后通过）
- [x] 双仓提交推送并归档
