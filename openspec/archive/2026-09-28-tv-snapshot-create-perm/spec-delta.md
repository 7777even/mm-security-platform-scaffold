# Spec Delta: tv-snapshot-create-perm

## Capability: tv

### ADDED

#### Requirement: 录像截图采集按钮权限门控

前端 `TvSnapshotFeedPanel` 的「模拟设备抓拍」（采集）按钮 SHALL 仅在当前用户持有
`video:snapshot:create` 时可见；「确认」按钮 SHALL 仅在持有 `video:snapshot:ack` 时可见
（大屏 `useScreenPermission`），对齐后端 `@RequireAuth(perm=...)`。

##### Scenario: 无采集权限

- **WHEN** 当前用户不持有 `video:snapshot:create`
- **THEN** 「模拟设备抓拍」按钮从 DOM 移除

##### Scenario: 无确认权限

- **WHEN** 当前用户不持有 `video:snapshot:ack`
- **THEN** 待确认截图行的「确认」按钮不渲染，仅显示「无权限」占位
