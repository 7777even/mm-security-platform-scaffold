# Proposal: 工业电视采集按钮细粒度权限门控

## 背景

后端已将 `POST /tv/snapshots` 收紧为 `video:snapshot:create` 细粒度权限（V80），但前端
`TvSnapshotFeedPanel` 的「模拟设备抓拍」按钮仍无任何权限门控（任何登录用户均可见可点），
与后端细粒度 RBAC 不一致。

## 方案

- `TvSnapshotFeedPanel` 采集按钮加 `hasPerm('video:snapshot:create')` 门控、确认按钮加
  `hasPerm('video:snapshot:ack')` 门控（大屏 `useScreenPermission`）。
- 契约 `docs/api/tv.openapi.json` 的 `POST /tv/snapshots` description 注明 `video:snapshot:create`
  （schema 不变，无需重生成类型）。
- 实时订阅（`tv.snapshot.changed`）已就位，本 change 仅补齐权限门控这一环。
