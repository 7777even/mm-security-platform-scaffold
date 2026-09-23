# Tasks: perimeter-alarm-create（前端）

- [ ] 扩展 docs/api/security.openapi.json：POST /security/perimeter-alarms + PerimeterAlarmCreateRequest（四条铁律）
- [ ] npm run gen:api-types 重新生成 src/types/generated/security.ts（0 漂移）
- [ ] services/security.ts 新增 PerimeterAlarmCreatePayload + createPerimeterAlarm（范式对齐 updatePerimeterAlarm）
- [ ] SecurityStatusPanel.vue 加「新增治安报警」按钮（v-permission=security:perimeter-create）+ 最小可用表单 Dialog；提交成功 touchPerimeterAlarmChanged()
- [ ] validate-api-contracts.mjs 通过 + vue-tsc 零错误 + vitest 全绿 + gate:screen 通过
- [ ] 按 scope 拆分提交（frontend: contract / screen / docs）+ 推送
- [ ] 归档至 openspec/archive/（全勾后 git mv + 卫生检查）
