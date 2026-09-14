# 后台管理端消防设施故障管理页接后端

## 背景

后台管理端 `apps/mgmt` 下一主线是按菜单顺序将空壳静态页替换为真实后端领域页。报警管理域的「报警记录」已接后端并推送。按顺序进入消防设施管理域，其第一个有真实后端读接口的叶子为「设备故障管理」（菜单路径 `/fault-mgmt`），对应后端 `GET /api/v1/fire-facility/faults`。本页为只读，支持按故障级别与状态筛选。

## 目标

将 `/fault-mgmt` 从静态 `module-embed.vue` 兜底页替换为真实服务驱动视图：

1. 列表展示后端 `FireFacilityFaultItem` 真实数据。
2. 支持按 `faultLevel`（级别）与 `faultStatus`（状态）筛选，筛选项对齐后端真实枚举。
3. 级别与状态列按业务语义着色展示。
4. 后端不可用时显式报错 + 空态，不回灌 mock。

## 范围

- 前端 `apps/mgmt/views/fire/FaultMgmtView.vue`（新建）。
- 前端 `apps/mgmt/router.ts` 注册 `/fault-mgmt` 服务路由。
- 前端复用既有 `src/services/fireFacility.ts` 的 `fetchFireFacilityFaults` 与 `src/types/generated/fire-facility.ts` 类型。
- 无后端改动、无契约改动（`fire-facility.openapi.json` 已定义 `/faults`）。
