# Design: 消防监测数据真源归一（前端契约同步）

## 契约真源

`docs/api/fire-situation.openapi.json` 为机器可读契约真源（前端 TS 类型由此生成）。本变更仅更新示例与描述，未改动 `FireMonitorArea` 结构（仍是 id/scope/name/status/statusLabel/equipment/cameras/personnel）。

## 更新点

1. `FireMonitorArea.equipment` schema 描述追加「按区聚合自监测表 fac_fire_facility_monitor，与监测总数 983 真源归一」，`example` 由 128 → 92。
2. `/fire-situation/areas` 响应 `example.data.items[0].equipment` 由 128 → 92、`[1].equipment` 由 96 → 68，与后端新分区值对齐。

## 代码层

- `src/services/fireSituation.ts` 的 `FireMonitorArea.equipment:number` 不变。
- `src/screen/components/panels/SafetyAlarmPanel.vue` 仍 `area.equipment` 直读，无需改动。

## 同步纪律

后端变更：`backend-scaffold/openspec/changes/2026-09-23-fire-facility-zone-unification`
本前端变更与之四同步：openspec 变更 + 契约文件更新 + （无 TS 类型变更，故 gen:api-types 无新产出）+ 通知已隐式完成。
