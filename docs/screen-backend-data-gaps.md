# 大屏端「数据全部由后端提供」缺口盘点

> 盘点日期：2026-09-10
> 盘点方法：① 静态比对「前端实际调用 URL」vs「契约 openapi.json」；② 启动后端（8787）跑全量 GET 冒烟，统计真实返回数据量；③ 扫描 `src/screen` 仍直读本地常量的组件。
> 结论先行：**代码接线层面已基本完成**（前端调用 0 条超出契约、100 个 GET 端点 92 个 code=0），剩余缺口集中在「4 处前端直读常量 + 后端数据密度 + 通道验证 + 写侧与门禁」四类。

## 0. 已达成基线（不要重复劳动）

| 项                                        | 实测结果                                                                                                                               |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| 前端 service 调用 URL ⊄ 契约              | **0 条越界**                                                                                                                           |
| 契约 GET 端点冒烟                         | 92 / 100 `code=0`（8 条失败均为采样参数问题：`/ws/alarm` 是 WS 非 REST、track 缺 mode、dict-items 缺 dictCode、快照返回二进制非 JSON） |
| 服务层 fetch 函数                         | 102 个，覆盖 28 域                                                                                                                     |
| DEV 兜底（`!VITE_API_BASE` 回灌 fixture） | 联调环境已配 `VITE_API_BASE=8787`，兜底分支不生效，**不构成假象**                                                                      |
| 数据密度（抽样）                          | 多数端点 5–25 条：alarm-trend 24、production/alarms 20、monitoring/points 18、security/events 16、tv/map-points 15、hazards 12         |

## 1. A 类 · 前端仍直读本地常量（4 处，真缺口）

| #   | 位置                                                                             | 现状                                                                                                                                                      | 期望接口                                                                                  |
| --- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| A1  | `src/screen/lib/composables/usePatrolLinkage.ts`                                 | `patrolLinkagePointsForZone` 分区→点位+相机，全文件 **0 处 service 调用**                                                                                 | `GET /security/patrol-linkages?zone={zoneLabel}`（后端现仅有 `/security/patrol-cameras`） |
| A2  | `src/screen/components/video-wall/VideoLinkageConfigDialog.vue`                  | `monitorNameOptions` / `presetPointOptions` / `businessObjectCategoryOptions` / `businessObjectOptions` 四个本地数组                                      | `GET /video/linkage-options`（或并入 `/video/cameras`）                                   |
| A3  | `src/screen/components/common/AlarmDetailPanel.vue:377`                          | `alarmDetailPersonnelOptions = ['张三','王成','李四','赵五','高策']`；实测 `/security/perimeter-alarms/latest` 的 `dispatchPersonnel=0`（后端该字段为空） | 后端补 `dispatchPersonnel` 数据；或改接 `GET /system/dicts/{dictCode}`                    |
| A4  | `src/screen/components/panels/accident-rescue/EmergencyAddressBookDialog.vue:43` | 联系人已走 `/emergency/phones`（entries=5），但**组织树是组件内 computed 硬编码**                                                                         | 后端提供组织树，或并入 `/emergency/phones` 返回 `orgs`                                    |

> A3 优先级最高：它不是「前端没接」，而是「后端字段为空导致前端只能硬钉」。

## 2. B 类 · 后端数据稀疏（接口通，但撑不满大屏）

实测条数偏低的端点：

- `/emergency/duty` → `departments=1`
- `/emergency/closed-cases` → `cases=1`
- `/emergency/knowledge` → `items=3`
- `/monitoring/alarms` → `3`
- `/dashboard/messages` → `2`、`/dashboard/workstations` → `3`
- `/communication/devices` → `broadcast=3`
- `/production/personnel` → `3`、`/rescue-resources/equipment|personnel|vehicles` → `squadrons=9`

建议：按「大屏一屏可见条数」反推种子量级（列表类 ≥10、滚动消息类 ≥5），补一条 `V35__screen_dataset_enrich.sql`（只加不改，遵守已进共享环境 V-file 禁改删铁律）。

## 3. C 类 · 通道未闭环验证

- **`/ws/alarm` 实时推送**：大屏实时性依赖它。GET 冒烟必然 404，需用 WS 客户端单独验证 `alarm.push` topic 分发（单测 ws.spec 15 + realtime.spec 4 覆盖的是客户端逻辑，非端到端）。
- **二进制抓拍**：`/video/cameras/{id}/snapshot`、`/security/perimeter-alarms/{id}/snapshot` 需真实 blob 联调（前端 `http.get(url,{responseType:'blob'})` → `URL.createObjectURL`）。

## 4. D 类 · 写侧与防回归机制

- **写回后端仅 5 处**（不计 system/auth 域）：告警 CRUD、预案行动卡、黑名单删除、视频联动配置、应急流程节点配置。
  仍为纯前端的交互：应急指令下发 / 状态推进、台风应急资源调度、巡更记录、值班签到。
- **缺自动门禁**：目前「大屏是否还有本地业务数据」靠人工 grep。建议加一条脚本守门——扫描 `src/screen` 下对 `lib/data/*Mock*`、`*Options` 的模板直引用，白名单之外的报失败，进 CI。

## 5. 按设计保留本地（**不是缺口，勿动**）

- 几何：`plantAreas.ts`、`rescueMapCoords.ts`、`accidentRescueRouteWaypoints`、`tvInspectionScanPointsByCircle`
- 演示 / 演练：`drillRescueMock`、`drillGuidanceSteps`、`fireEmergencyDrillEventGroups`、卫星云图时间轴 `buildLocalTickTimes`
- UI 结构与控件：`mapControls`、`preliminaryMapControls`、`bottomToolbarItems`、`eventCommandDynamicsTabs`、`navItems`、表单 tab/字段定义（`accidentInfoTabs`、`accidentInfoFields` 等）
- DTO→视图适配器：`fireAlarmToDetail` / `patrolAlarmToDetail` / `perimeterAlarmToDetail` 等
- 静态图片资源：`SECURITY_IMAGES`、`cameraThumbByIndex`

## 6. 建议执行顺序

1. **A3 派单人员**（后端补数据即可，成本最低、收益最直观）
2. **A1 巡更联动点位**（需新建端点 + 契约 + 前端接线，四同步）
3. **A2 视频联动选项**（同上）
4. **B 类数据加厚**（一条 V35 迁移）
5. **C 类 WS 与抓拍端到端验证**
6. **D 类门禁脚本**（防回归）

改动后端接口时遵守四同步：openspec → 前端契约 `docs/api/*.openapi.json` → 后端实现（跑 `scripts/check-api-contract.mjs --strict`）→ 前端 `npm run gen:api-types`。
