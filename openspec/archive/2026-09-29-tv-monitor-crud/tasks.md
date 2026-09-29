# Tasks: tv-monitor-crud（前端）

- [x] docs/api/tv.openapi.json 新增 post /tv/monitors 与 put/delete /tv/monitors/{code} + TvMonitorUpsertRequest schema
- [x] npm run gen:api-types 重生成 src/types/generated/tv.ts
- [x] src/services/tv.ts 新增 createTvMonitor/updateTvMonitor/deleteTvMonitor + 内联 TvMonitorUpsertRequest
- [x] apps/mgmt/views/monitor/TvMonitorMgmtView.vue 台账 CRUD 页（设备/防区筛选 + 防区归属编辑 + v-permission）
- [x] apps/mgmt/router.ts 注册 /tv-monitor-mgmt（SERVICE_PATHS + serviceRoutes）
- [x] src/data/mgmtMenus.ts 设备管理组加「工业电视监控点管理」叶子
- [x] useDomainAutoRefresh('tv.monitor', load) 实时刷新
- [x] vue-tsc 类型检查通过
- [x] npm run lint 通过
- [x] 按 scope 拆分提交（frontend: contract / mgmt / docs(openspec)）+ 推送
