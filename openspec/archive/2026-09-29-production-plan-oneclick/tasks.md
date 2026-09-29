# Tasks: production-plan-oneclick（前端）

- [x] ProductionPlanPanel 订阅 emergency.plan 实时刷新 + onUnmounted 退订（对齐 ProductionAlarmPanel 范本）
- [x] EmergencyPlanSwitchDialog 新增 domain prop + 域内核预案浏览（绕过通用事故类型/装置筛选）
- [x] handlePlanSelect 改为 async 调 invokeEmergencyPlan 写回 + toast + 关闭面板
- [x] vue-tsc 类型检查通过
- [x] 后端补 EmergencyPlanControllerTest 覆盖调用链路（见后端同名/相关 Change 或既有 emergency-plan 测试）
- [x] 按 scope 拆分提交（frontend: screen / docs(openspec)）+ 推送
