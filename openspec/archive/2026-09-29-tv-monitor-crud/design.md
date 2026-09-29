# Design: 工业电视监控点台账 CRUD 前端（tv-monitor-crud）

## 目标与约束

- 目标：扩展 `tv.openapi.json` 写侧契约 + 类型生成 + 管理后台台账 CRUD 页（设备/防区筛选 + 防区归属编辑），写按钮受 `v-permission` 控制。
- 硬约束：契约真源在本仓 `docs/api/tv.openapi.json`；四铁律（按域分组 / 接口注释 / 字段中文 description / example）；写按钮权限级显隐。

## 架构与方案

### 1. 契约与类型

- `tv.openapi.json` 新增 `post /tv/monitors`、`put/delete /tv/monitors/{code}`、`TvMonitorUpsertRequest` schema（`monitorCode` 必填，含 `online/integrity/monitorType/department/zoneCode/location/height/angle`）。
- `npm run gen:api-types` 重生成 `src/types/generated/tv.ts`。

### 2. 服务与页面

- `src/services/tv.ts` 新增 `createTvMonitor/updateTvMonitor/deleteTvMonitor`（内联 `TvMonitorUpsertRequest` 对齐生成类型）。
- `apps/mgmt/views/monitor/TvMonitorMgmtView.vue`：台账 CRUD（设备/防区筛选 + 防区归属编辑 Dialog）；新增/编辑/删除分别 `v-permission` `tv:monitor:create/update/delete`；删除 `ElMessageBox.confirm` 二次确认。
- `apps/mgmt/router.ts` 注册 `/tv-monitor-mgmt`（SERVICE_PATHS + serviceRoutes）。
- `src/data/mgmtMenus.ts`「设备管理」组加「工业电视监控点管理」叶子。

### 3. 实时刷新

- `useDomainAutoRefresh('tv.monitor', load)` 订阅后端 `@RealtimeSync` 广播。

## 决策记录（ADR）

- ADR-1 防区下拉复用 `GET /system/zones`（`fetchSystemZones`），留空即清除归属。
- ADR-2 列表客户端筛选：`GET /tv/monitors` 返回摘要列表，设备/防区在前端过滤，减少端点负担。

## 风险与缓解

| 风险              | 缓解                                |
| ----------------- | ----------------------------------- |
| vue-tsc/lint 未跑 | 本期补类型检查 + lint（见遗留收口） |
| 权限按钮误显      | `v-permission` 指令按钮级显隐       |

## 依赖

- 上游：后端 `tv-monitor-crud` Change 三写端点。
- 下游：大屏地图撒点（`tv.monitor` 广播）。
