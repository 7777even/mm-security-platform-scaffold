# Tasks: 消防设施报警列表接入处置闭环（前端）

- [x] 契约 `docs/api/fire-facility.openapi.json` 新增 `/fire-facility/alarms/{alarmId}` 的 `put`
      （复用既有 schema，四铁律齐全；顺带修正 GET 示例里 `id` 的整数漂移）
- [x] `npm run gen:api-types` 重新生成 `src/types/generated/`
- [x] `src/services/fireFacility.ts` 新增 `updateFireFacilityAlarm(alarmId, payload)`（三态对齐）
- [x] 修正手写 `FireFacilityAlarmItem.id` 类型漂移 `number → string`
- [x] 新增 `apps/mgmt/components/FireFacilityAlarmHandleDialog.vue`（按动作显隐字段 + 必填处理意见写时间线）
- [x] `FireFacilityAlarmView.vue` 加「处置」操作列：5 动作按钮按状态机门控 + `v-permission`
- [x] 处置成功复用既有 `useDomainAutoRefresh('fire-facility.fault')` 自动刷新，并兜底 `load()`
- [x] `validate-api-contracts.mjs`（本域零违规）、`vue-tsc` type-check、eslint 全绿
