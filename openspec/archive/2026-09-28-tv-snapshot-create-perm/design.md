# Design: 工业电视采集按钮细粒度权限门控

- 引入 `useScreenPermission()` 取 `hasPerm`，在模板对采集 / 确认按钮加 `v-if` 门控
  （大屏子应用沙箱不能用主壳 `usePermission`，必须用 `useScreenPermission`）。
- 确认按钮原 `v-if="reviewStatus==='PENDING'"` 合并为
  `v-if="reviewStatus==='PENDING' && hasPerm('video:snapshot:ack')"`；无权限时显示「无权限」占位。
- `docs/api/tv.openapi.json` 的 `POST /tv/snapshots` 仅更新 description（标注 `video:snapshot:create`），
  不改动 request/response schema，故 `npm run gen:api-types` 无需重跑、契约守门零漂移。
