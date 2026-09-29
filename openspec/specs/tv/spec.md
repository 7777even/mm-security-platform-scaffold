# tv Specification (frontend)

## Purpose

工业电视大屏（fm-tv）前端能力。覆盖「录像截图采集」面板（`TvSnapshotFeedPanel`）的采集/确认
按钮细粒度权限门控，以及后端 `@RealtimeSync` 广播 `tv.snapshot.changed` 的实时订阅刷新。

## Requirements

### Requirement: 录像截图采集按钮权限门控

前端 `TvSnapshotFeedPanel` 的「模拟设备抓拍」（采集）按钮 SHALL 仅在当前用户持有
`video:snapshot:create` 时可见；「确认」按钮 SHALL 仅在持有 `video:snapshot:ack` 时可见。
权限判定使用大屏 `useScreenPermission().hasPerm`（取自 `window.$wujie.props.perms`，回退主壳
`useAuthStore`），对齐后端 `@RequireAuth(perm=...)`。

#### Scenario: 无采集权限

- **WHEN** 当前用户不持有 `video:snapshot:create`
- **THEN** 「模拟设备抓拍」按钮从 DOM 移除，用户无法发起采集入库

#### Scenario: 无确认权限

- **WHEN** 当前用户不持有 `video:snapshot:ack`
- **THEN** 待确认截图行的「确认」按钮不渲染，仅显示「无权限」占位

### Requirement: 录像截图实时刷新

面板 SHALL 在挂载时订阅后端 `@RealtimeSync` 广播的 `tv.snapshot.changed`
（`subscribeDomainChange('tv.snapshot', ...)`），写回成功后 `touchTvSnapshotChanged()` 即时重拉，
确保多端 / 多标签页一致，无需手动刷新。

#### Scenario: 跨端采集触发刷新

- **WHEN** 任一端经 POST /tv/snapshots 入库（广播 tv.snapshot.changed）
- **THEN** 本面板自动重拉列表并刷新缩略图

### Requirement: 设备/防区筛选与历史回放页

系统 SHALL 提供工业电视「设备/防区筛选 + 历史回放」二级页（`/tv/playback`，`fm-tv-playback`）：左侧按防区（`fetchSystemZones`）+ 设备（`fetchTvMonitors`）+ 采集时间区间筛选，右侧以真实截图字节（`fetchTvSnapshotUrl`）网格展示该设备/防区在时段内的历史抓拍，支持分页；支持从 `VideoMonitorBrowserPanel` 的「历史回放 ›」或单设备「回放」角标进入并预选设备。

#### Scenario: 防区 + 设备 + 时间筛选回放

- **WHEN** 用户在回放页选择防区、设备并设定时间区间后加载
- **THEN** 系统经 `GET /tv/monitors/{code}/snapshots` 或 `GET /tv/snapshots?zone=&monitorCode=&startTime=&endTime=` 拉取真实截图并分页渲染

#### Scenario: 从监控面板预选设备进入

- **WHEN** 用户在 `VideoMonitorBrowserPanel` 点击单设备「回放」角标
- **THEN** 跳转 `/tv/playback?monitor=<code>`，回放页 `onMounted` 预选该设备并加载其历史快照

### Requirement: 契约与类型同步（四同步）

系统 SHALL 保持 `docs/api/tv.openapi.json` 为机器可读契约唯一真源，新增 `TvMonitorSummary`、补齐防区/告警字段、新增 `/tv/monitors` 与 `/tv/monitors/{code}/snapshots` 路径、扩展 `/tv/snapshots` 过滤参数，并据此 `gen:api-types` 生成 TS 类型，使后端 `check-api-contract.mjs --strict` 路由差异与 schema 漂移均为 0。

#### Scenario: 契约守门归零

- **WHEN** 后端运行 `node scripts/check-api-contract.mjs --strict`
- **THEN** 路由差异 0 / schema 漂移 0（EXIT=0）
