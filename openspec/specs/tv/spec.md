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
