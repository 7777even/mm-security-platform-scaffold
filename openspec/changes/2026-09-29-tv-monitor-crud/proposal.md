# Proposal: tv-monitor-crud（工业电视监控点台账 CRUD 前端）

## 背景

`frontend-scaffold/docs/api/tv.openapi.json` 此前只有 `GET /tv/monitors`、`GET /tv/monitors/{code}` 等只读契约。本变更作为后端同名 Change 的前端侧，补齐 `POST /tv/monitors`、`PUT /tv/monitors/{code}`、`DELETE /tv/monitors/{code}` 契约与类型，并在管理后台「设备管理」域新增可写的监控点台账管理页（设备/防区筛选 + 防区归属编辑）。

## 分级：L3（契约 + 页面层）

- 契约真源在本仓 `docs/api/tv.openapi.json`；本变更扩展 post + `/{code}` put/delete + `TvMonitorUpsertRequest` schema（按四铁律：按域分组 / 接口注释 / 字段中文 description / example）。
- 管理页 `apps/mgmt/views/monitor/TvMonitorMgmtView.vue` 接 `GET /tv/monitors`（摘要列表，客户端按关键词/防区筛选）+ 三写端点，写按钮受 `v-permission` 控制。

## 范围

1. 契约：`docs/api/tv.openapi.json` 新增 `post /tv/monitors`、`put/delete /tv/monitors/{code}`、`TvMonitorUpsertRequest` schema；`npm run gen:api-types` 重生成 `src/types/generated/tv.ts`（paths 部分）。
2. 类型/调用：`src/services/tv.ts` 新增 `createTvMonitor/updateTvMonitor/deleteTvMonitor`（及内联 `TvMonitorUpsertRequest` 接口，与生成契约对齐）。
3. 页面：`apps/mgmt/views/monitor/TvMonitorMgmtView.vue` 台账 CRUD（设备/防区筛选 + 防区归属编辑），含新增/编辑 Dialog；路由 `apps/mgmt/router.ts` 注册 `/tv-monitor-mgmt`（SERVICE_PATHS + serviceRoutes）；菜单 `src/data/mgmtMenus.ts` 在「设备管理」组加「工业电视监控点管理」叶子。
4. 实时刷新：页面 `useDomainAutoRefresh('tv.monitor', load)` 订阅后端 `@RealtimeSync(domain="tv.monitor")` 广播。

## 人工确认关卡

- [x] **防区下拉**：复用 `GET /system/zones`（`fetchSystemZones`）出 `zoneCode→zoneName`，编辑时可选归属防区，留空即清除归属。
- [x] **写按钮权限**：新增/编辑/删除分别受 `tv:monitor:create/update/delete` 控制（`v-permission` 按钮级显隐），无权限不渲染按钮。
- [x] **删除确认**：`ElMessageBox.confirm` 二次确认，避免误删。
- [ ] `vue-tsc` 类型检查通过；`npm run lint` 通过。
- [ ] 按 scope 拆分提交（frontend: contract / mgmt / docs(openspec)）+ 推送。

## 不在范围

- 真实录像流回放（本期不做，抓拍快照时间轴已满足）。
- 大屏侧监控点新增入口（本期仅管理后台写侧，大屏仍只读展示）。
