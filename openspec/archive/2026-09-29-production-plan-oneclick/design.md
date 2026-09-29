# Design: 生产应急域内核预案浏览与一键调用面板（production-plan-oneclick）

## 目标与约束

- 目标：① 生产应急面板订阅 `emergency.plan` 实时刷新；② `EmergencyPlanSwitchDialog` 支持 `domain` 入参实现域内核预览；③ 一键调用由本地置位改为写回后端 `invokeEmergencyPlan`（激活+广播+留痕）。
- 硬约束：零下行控制红线（仅激活预案，不触达物理设备）；复用既有 `emergency-plan` 调用端点与权限（无新权限码）。

## 架构与方案

### 1. 实时订阅（ProductionPlanPanel）

- `onMounted`：`subscribeDomainChange('emergency.plan', reload)`（对齐 `ProductionAlarmPanel` 范本）；`onUnmounted` 退订防泄漏。

### 2. 域内核浏览（EmergencyPlanSwitchDialog）

- 新增 `domain?` prop；`domain` 非空时从后端取该域预案，绕过通用 `accidentType/facility` 筛选；模板隐藏 tabs/accidentType/facility 筛选 UI。

### 3. 一键调用写回

- `handlePlanSelect` 改为 `async` 调 `invokeEmergencyPlan(plan.id, { note })` → 成功后 toast + 关闭面板；替代原本地置位。
- 后端 `invokeEmergencyPlan`（`@RealtimeSync`）持久化激活 + 广播 + 留痕，其余端同步。

## 决策记录（ADR）

- ADR-1 零下行：调用=激活+广播+留痕，与既有 `invokeEmergencyPlan` 一致。
- ADR-2 域内核：`domain='production'` 仅列生产域预案，不再套用通用维度。

## 风险与缓解

| 风险                 | 缓解                                            |
| -------------------- | ----------------------------------------------- |
| vue-tsc 未跑         | 本期补类型检查（随 build:subapps）              |
| 服务层激活逻辑无断言 | 本期补 `EmergencyPlanServiceTest`（见遗留收口） |

## 依赖

- 上游：后端 `invokeEmergencyPlan`（`emergency-plan` 域，已存在 `@RealtimeSync`）；`services/emergencyPlan.ts`。
- 下游：大屏其他端 `emergency.plan` 订阅同步。
