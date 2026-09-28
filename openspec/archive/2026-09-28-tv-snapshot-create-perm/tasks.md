# Tasks: tv-snapshot-create-perm（前端）

- [x] `TvSnapshotFeedPanel` 采集按钮加 `hasPerm('video:snapshot:create')` 门控
- [x] 确认按钮加 `hasPerm('video:snapshot:ack')` 门控（无权限显示占位）
- [x] `docs/api/tv.openapi.json` 的 POST /tv/snapshots 注明 `video:snapshot:create`
- [x] `vue-tsc` / `build:subapps(fm-tv)` 构建验证
- [x] 前端按 scope 拆分提交并推送，openspec 归档
