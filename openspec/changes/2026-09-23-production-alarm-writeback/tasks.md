# Tasks: production-alarm-writeback（前端）

- [x] 起草 proposal / design（对齐后端 L4 写回）
- [x] 契约 docs/api/production.openapi.json 增 PUT 路径 + 已确认状态 + ProductionAlarmUpdateRequest schema + ProductionAlarmItem 5 个回填字段
- [x] npm run gen:api-types 重新生成 src/types/generated/production.ts（0 漂移）
- [x] services/production.ts 增 ProductionAlarmUpdatePayload + updateProductionAlarm（镜像 updateFireAlarm）+ productionAlarmChanged / touchProductionAlarmChanged
- [x] alarmDetailMock.ts 的 AlarmDetailItem 增 productionAlarmId?: number；productionAlarmToDetail 写入该 id 并回填真实处置字段；状态双向映射
- [x] AlarmDetailPanel.vue 新增 mapDetailStatusToProduction + persistProductionAlarm，persistAlarm 增加 productionAlarmId 分支
- [x] ProductionAlarmPanel.vue 订阅 subscribeDomainChange('production.alarm') + watch(productionAlarmChanged)，onUnmounted 退订
- [x] ProductionAreaView.vue 订阅 subscribeDomainChange('production.alarm') + watch(productionAlarmChanged)，onUnmounted 退订
- [x] npm run type-check 通过（修复 ProductionAlarmItem 缺失字段 / FalseAlarmStatus 类型 / onUnmounted 导入等）
- [ ] npm run test 回归（vitest run 全绿）
- [ ] 按 scope 拆分双仓提交（frontend: screen/production/shared）
- [ ] 归档至 openspec/archive/（全勾后按纪律归档，补 spec-delta 并回填 openspec/specs/）
