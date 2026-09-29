# Proposal: production-plan-oneclick（域内核预案浏览与一键调用面板）

## 背景

生产应急二级功能此前仅能在 `ProductionPlanPanel` 浏览预案列表，点击「调用」只是前端本地置位，**未写回后端、不广播、不跨端同步**。同时面板不订阅预案域变更，别处更新预案后本面板不会自动刷新。

本变更补齐：①`ProductionPlanPanel` 订阅 `emergency.plan` 域实时刷新；②`EmergencyPlanSwitchDialog` 支持 `domain` 入参（域内核预案浏览，越过通用事故类型/装置筛选）；③「一键调用」由本地置位改为调用后端 `invokeEmergencyPlan` 持久化（激活+广播+留痕），契合「零下行控制」红线——只激活预案、绝不触达物理设备。

## 分级：L3（前端行为 + 后端既有写端点复用）

- 后端 `invokeEmergencyPlan`（`emergency-plan` 域）已存在并带 `@RealtimeSync`，本变更仅前端改调用、不改后端契约。
- 属 L3（前端交互闭环 + 实时订阅），无新增权限码（沿用既有预案调用权限）。

## 范围

1. 前端 `src/screen/components/panels/production/ProductionPlanPanel.vue`：`onMounted` 加载后 `subscribeDomainChange('emergency.plan', reload)`，`onUnmounted` 退订；`handlePlanSelect` 改为 `async` 调 `invokeEmergencyPlan(plan.id, { note })` 写回，成功后 toast + 关闭面板。
2. 前端 `src/screen/components/panels/accident-rescue/EmergencyPlanSwitchDialog.vue`：新增 `domain?` prop；`domain` 非空时从后端取该域预案（绕过通用事故类型/装置筛选），模板隐藏 tabs/accidentType/facility 筛选。
3. 实时刷新范式对齐 `ProductionAlarmPanel.vue`（`subscribeDomainChange` 范本）。

## 人工确认关卡

- [x] **零下行控制**：一键调用=激活预案+广播+留痕，不触达物理设备，与既有 `invokeEmergencyPlan` 行为一致。
- [x] **域内核**：`domain='production'` 时仅列生产域预案，不再套用通用事故类型/装置维度。
- [x] **实时订阅**：面板订阅 `emergency.plan`，任一端更新预案后自动重拉；`onUnmounted` 退订防泄漏。
- [ ] `vue-tsc` 类型检查通过；新增/补 `EmergencyPlanControllerTest` 后端单测覆盖调用链路。
- [ ] 按 scope 拆分提交（frontend: screen / docs(openspec)）+ 推送。

## 不在范围

- 不改后端契约/权限（复用既有 `emergency-plan` 调用端点）。
- 预案内容编辑（本期仅「浏览 + 一键调用」）。
