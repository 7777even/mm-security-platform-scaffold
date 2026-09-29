# Design: 工业电视防区联动与设备/历史回放（前端 tv-zone-linkage）

## 目标与约束

- 目标：消费后端 L4 `zone_code` 防区归属 + 设备/历史回放端点，提供「设备/防区筛选 + 真实历史回放」二级页。
- 硬约束：零下行控制红线（仅只读查询）；契约四铁律（按域分组 / 接口注释 / 字段中文 description / example）；`gen:api-types` 由契约真源生成，禁止手写偏离契约的类型。

## 架构与方案

### 1. 契约同步

- `tv.openapi.json` 为机器可读契约唯一真源；本变更只增不改既有字段（向后兼容）。
- 新增 `TvMonitorSummary` schema（code/name/online/department/zoneCode/zoneName）；`TvSnapshotItem`/`TvMonitorDetail` 增 `zoneCode`/`zoneName`（+ 快照 `alarmId`/`alarmType`）；`TvSnapshotIngestRequest` 增 `alarmId`/`alarmType`。
- 路径：新增 `/tv/monitors`、`/tv/monitors/{code}/snapshots`；`/tv/snapshots` GET 增 `monitorCode`/`zone`/`startTime`/`endTime`。

### 2. 服务层（手写 interface，与生成类型两套并存）

- `src/services/tv.ts` 扩展 `TvSnapshotItem`/`TvMonitorDetail`，新增 `TvMonitorSummary`/`TvSnapshotQuery`，`fetchTvSnapshots` 透传过滤；新增 `fetchTvMonitors` / `fetchTvMonitorSnapshots`。

### 3. 二级回放页

- `views/tv/playback.vue`：左栏防区 `<select>` 复用 `fetchSystemZones()`、设备检索/列表复用 `fetchTvMonitors()`、采集时间区间 `datetime-local`；右栏快照网格复用 `fetchTvSnapshotUrl(id)` 取 blob + `URL.createObjectURL`，分页。
- `onMounted` 读 `route.query.monitor` 预选设备后 `loadSnapshots()`。
- `back()` 返回 `/tv`。

### 4. 路由与入口

- `router/index.ts` `SECONDARY_ROUTES` 增 `/tv/playback`（`fm-tv-playback`，`meta.perm=video:view`，`hidden:true`）。
- `src/shell/fmRouteNameMap.ts` 增 `tvPlayback: '/tv/playback'`。
- `VideoMonitorBrowserPanel.vue` 头部「历史回放 ›」→ `router.push('/tv/playback')`；每设备「回放」角标 `@click.stop="goPlayback(m.id)"` 带 `query.monitor` 预选。

## 决策记录（ADR）

- ADR-1 防区下拉复用 `fetchSystemZones`：避免新建防区端点，复用既有主数据，保证单一真源。
- ADR-2 快照取 blob + ObjectURL：回放页直接展示设备上报/采集的真实截图字节，非缩略图 URL。

## 风险与缓解

| 风险                   | 影响        | 缓解                                                  |
| ---------------------- | ----------- | ----------------------------------------------------- |
| 契约与服务层类型不一致 | 编译/运行错 | `gen:api-types` + `type-check` 双门禁；契约四铁律校验 |
| 回放页快照量大卡顿     | 体验差      | 分页（默认 12/页）+ 时间区间过滤                      |

## 依赖

- 上游：后端 `tv-zone-linkage`（V86 + 端点）。
- 下游：大屏 `VideoMonitorBrowserPanel` 入口跳转。
