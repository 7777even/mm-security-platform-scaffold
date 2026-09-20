# Proposal: 大屏应急事件新增落库接线（emergency-event create）

## Why

大屏应急指挥页（`/emergency`，fm-emergency 子应用）的「新增事件 / 新增演练 / 新增极端天气」此前仅写前端内存 +
`sessionStorage` 草稿（跨子应用共享层），后端无记录：刷新即丢失；点「去处置」跳到 fm-rescue 子应用后
按 `event_id` 拉不到该事件，回退默认事件（表现为「总跳到乙烯裂解装置区火灾」）。

## What Changes

- `src/services/emergencyEvent.ts` 新增 `createEmergencyEvent`（`POST /emergency-events`，类型取契约生成）。
- `src/screen/lib/composables/useFireEmergencyEventList.ts` 的 `createFireEmergencyEventFromForm` 改为
  **POST-first**：先落库拿回真实 `id`，再写入本地 store 供列表即时展示；**成功后不写 sessionStorage 草稿**，
  使「去处置」（fm-rescue）自然回落到后端 `/accident/rescue-incident` 聚合。
- **弱网/离线兜底**：POST 失败时回落 `sessionStorage` 草稿 + 本地自增 id（原行为），保证处置页仍可前端闭环展示。
- `EmergencyEventListPanel.handleCreateSubmit` 改 `await`，并提前占位 `createSubmitInFlight` 防异步期间误清 `?create` 参数。
- 按契约 `gen:api-types` 再生成 `src/types/generated/emergency-event.ts`。

## Capabilities

- 大屏「新增事件」从「前端内存/草稿」升级为「后端落库 + 本地乐观展示」。
- 不可映射字段（上报人/电话/伤亡数/事件类型细分）由前端并入 `description`。

## Impact

- 依赖后端 `POST /api/v1/emergency-events`（跨库四同步，契约真源 `docs/api/emergency-event.openapi.json`）。
- 改 `src/screen` 共享代码后须重建子应用产物（`fm-emergency` + `fm-rescue`）。
