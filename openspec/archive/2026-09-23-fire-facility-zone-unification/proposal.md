# Proposal: 消防监测数据真源归一（前端契约同步）

## 背景

后端 `2026-09-23-fire-facility-zone-unification` 将 `fac_fire_facility_monitor` 改为 (装置区 × 设施类型) 矩阵，并使 `GET /api/v1/fire-situation/areas` 返回的各区 `equipment`（消防设备数）按区聚合自监测表，与监测总数 983 自洽（取代原 `fac_fire_monitor_area.equipment` 的 1399 口径）。

## 前端影响

- **TS 类型 `FireMonitorArea.equipment:number` 形态不变**，SafetyAlarmPanel 直接展示 `area.equipment`，无需改代码。
- **契约示例更新**：`docs/api/fire-situation.openapi.json` 中 `FireMonitorArea.equipment` 示例由 128/96 改为 92/68（炼油一部装置区=92、储运罐区=68），与真源归一后的真实返回值一致；schema 描述补充「按区聚合自监测表」说明。

## 验证

- `npm run gen:api-types`（如有）无变化（字段未变）；`vue-tsc` 通过。
- 大屏 SafetyAlarmPanel 装置区卡片数值随后端变为新分区值（Σ=983）。
