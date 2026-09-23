# Tasks: perimeter-alarm-writeback（前端）

- [x] 起草 proposal / design（与后端 PUT /security/perimeter-alarms/{id} 四同步）
- [x] 契约 security.openapi.json 增 PUT 路径 + PerimeterAlarmUpdateRequest schema
- [x] npm run gen:api-types 重新生成 security.ts 类型
- [x] services/security.ts 增 updatePerimeterAlarm / PerimeterAlarmUpdatePayload / perimeterAlarmChanged / touchPerimeterAlarmChanged
- [x] alarmDetailMock.ts：AlarmDetailItem 加 perimeterAlarmId；perimeterAlarmToDetail 写入；normalizePerimeterStatus 处理 已派单
- [x] AlarmDetailPanel.vue：persistPerimeterAlarm + persistAlarm 分发，9 个处置动作分支周界写回
- [x] SecurityStatusPanel.vue：订阅 security.perimeter-alarm.changed + watch(perimeterAlarmChanged) 实时刷新 + onUnmounted 退订
- [ ] 跑 vue-tsc 类型检查 + vitest run 单测全绿
- [ ] 跑 lint（全角空格/未用导入）
- [ ] 按 scope 拆分提交（shared + screen + contract + docs）并推送
