# Spec Delta: tv-zone-linkage（前端 · 工业电视防区联动与设备/历史回放）

> 本变更新建/扩展了前端 `tv` capability：在既有「采集按钮权限门控」「实时刷新」之上，新增「设备/防区筛选与历史回放页」能力，并消费后端 `zone_code` 防区归属与新增端点。

## ADDED Requirements

### Requirement: 设备/防区筛选与历史回放页

系统 SHALL 提供工业电视「设备/防区筛选 + 历史回放」二级页（`/tv/playback`），左侧按防区（`fetchSystemZones`）+ 设备（`fetchTvMonitors`）+ 采集时间区间筛选，右侧以真实截图字节（`fetchTvSnapshotUrl`）网格展示该设备/防区在时段内的历史抓拍，支持分页；支持从监控浏览面板「历史回放 ›」或单设备「回放」角标进入并预选设备。

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

## 关联 Spec

- 目标 spec 文件：`openspec/specs/tv/spec.md`（本变更 AMEND 该 capability，新增上述两条 Requirement）。
