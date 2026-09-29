# Proposal: 工业电视防区联动与设备/历史回放（前端 tv-zone-linkage）

> 状态：`approved` —— L4 库结构变更的前端配套（契约同步 + 二级回放页）。与后端 Change `tv-zone-linkage` 同交付，落实跨库四同步。

## Why

后端新增 `zone_code` 库结构（L4，V86）与设备/历史回放端点（`GET /tv/monitors`、`GET /tv/monitors/{code}/snapshots`、扩展 `GET /tv/snapshots` 过滤）后，前端需：

1. 同步 `tv.openapi.json` 契约（新增 `TvMonitorSummary`、补齐防区/告警字段、新增两路径、扩展过滤参数），满足四铁律与 `check-api-contract.mjs --strict` 归零。
2. 新增「设备/防区筛选 + 历史回放」二级页（`views/tv/playback.vue`），并接入主壳路由与 fm 路由翻译，供 `VideoMonitorBrowserPanel` 的「历史回放 ›」入口跳转。

## What Changes

- 契约 `docs/api/tv.openapi.json`：`TvSnapshotIngestRequest` 补 `alarmId`/`alarmType`；`TvMonitorDetail`/`TvSnapshotItem` 补 `zoneCode`/`zoneName`（+ 快照 `alarmId`/`alarmType`）；新增 `TvMonitorSummary` schema；新增 `/tv/monitors`、`/tv/monitors/{code}/snapshots` 路径；`/tv/snapshots` 增 `monitorCode`/`zone`/`startTime`/`endTime` 参数与示例。
- 服务层 `src/services/tv.ts`：扩展 `TvSnapshotItem`/`TvMonitorDetail` interface；新增 `TvMonitorSummary`/`TvSnapshotQuery`；`fetchTvSnapshots` 透传过滤；新增 `fetchTvMonitors` / `fetchTvMonitorSnapshots`。
- 二级回放页 `src/views/tv/playback.vue`：左侧防区（复用 `fetchSystemZones`）+ 设备检索/列表（复用 `fetchTvMonitors`）+ 采集时间区间（datetime-local）；右侧快照网格（复用 `fetchTvSnapshotUrl(id)` 取 blob + `URL.createObjectURL`，分页）。`onMounted` 读 `route.query.monitor` 预选设备。
- 路由：`router/index.ts` `SECONDARY_ROUTES` 增 `/tv/playback`（`fm-tv-playback`，perm `video:view`）；`src/shell/fmRouteNameMap.ts` 增 `tvPlayback: '/tv/playback'`。
- 入口：`VideoMonitorBrowserPanel.vue` 头部「历史回放 ›」→ `router.push('/tv/playback')`；每设备「回放」角标带 `query.monitor` 预选。

## Capabilities

### Modified Capabilities

- `tv`（前端）：在既有「采集按钮权限门控」「实时刷新」基础上，扩展「设备/防区筛选与历史回放」能力，并消费后端 `zone_code` 防区归属与新增端点。

## Impact

- 受影响范围：契约文件、服务层、新增回放页、路由与入口；不改动既有采集/确认流程。
- 契约同步：与后端 `tv.openapi.json` 真源一致；`gen:api-types` 重生成；`validate-api-contracts` PASS；后端 `check-api-contract.mjs --strict` 归零。
- 数据影响：纯前端只读消费，无写操作，无下行控制（零下行控制红线不变）。
- 安全语义：不新增任何写端点调用；回放页为只读查询。

## 人工确认关卡（L4 须过）

- [x] 提案范围与后端一致：前端 Change 与后端 `tv-zone-linkage` 同交付，仅消费后端新增结构/端点。
- [x] API 契约未违反：四铁律满足；`check-api-contract.mjs --strict` 路由差异 0 / schema 漂移 0。
- [x] 跨库四同步已排定：契约 → 服务层 → 类型生成 → 回放页 一气呵成。
- [x] 数据变更影响已确认：前端无库结构/写操作变更。
- [x] 高风险项：未触及权限模型 / 安全过滤器；仅只读消费。
