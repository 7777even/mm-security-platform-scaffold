# Tasks: 消防设施故障 CRUD（前端）

- [x] 契约扩展 `fire-facility.openapi.json`（post / delete / CreateRequest / UpdateRequest 扩字段）
- [x] `npm run gen:api-types` 重新生成 TS 类型
- [x] `src/services/fireFacility.ts`：create / delete + 三个枚举选项常量
- [x] `apps/mgmt/components/FireFacilityFaultEditDialog.vue`：新增/编辑共用弹窗
- [x] `apps/mgmt/views/fire/FaultMgmtView.vue`：新增按钮 + 操作列 + 删除二次确认
- [x] 列表页接入 `useDomainAutoRefresh('fire-facility.fault')`
- [x] 大屏 `FireFacilityMonitoringDialog.vue` 接入同域订阅
- [x] 单测：弹窗 4 例 + 列表 3 例（全绿）
- [x] `type-check` / `lint`（0 error）/ `gate:screen` PASS
- [x] 全量测试确认：`vitest run` 66 文件 435 例全过（⚠️ `test:coverage` 聚合报告因沙箱批量删除守卫未能实跑，仅确认测试全绿）
- [x] 双仓提交推送并归档
