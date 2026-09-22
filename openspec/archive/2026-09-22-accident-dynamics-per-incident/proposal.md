# Proposal: 事故救援契约 description 同步「动态快讯按事件隔离」

## 为什么（Why）

- 后端 Change `accident-dynamics-per-incident`（同日期）将 `GET /api/v1/accident/rescue-incident` 的「动态快讯」改为按事件隔离（演练/真实事件各自独立、空兜底默认事件）。
- 前端契约 `docs/api/accident-rescue.openapi.json` 的端点与 `dynamics` 字段 description 仍写着「全量全局参考动态」，需同步说明，使契约真源与实现一致、且前端开发者读本文件即知隔离语义。

## 目标（What Changes）

- `docs/api/accident-rescue.openapi.json`：端点 description 追加「动态快讯按事件隔离：eventId 命中演练事件时返回该演练事件的专属动态，命中真实事件时返回该事件动态，二者各自独立、不共用同一份全局参考。」；`dynamics` 字段 description 改为「动态快讯（按事件隔离，演练/真实事件各自独立；含救援/指令/简报/态势四类）」。
- **无 schema / 字段新增**：`incident_id` 不对外暴露，前端生成类型仅 JSDoc 文字变更，无结构变化。

## 能力（Capabilities）

- `screen-data-wiring`：`RescueDynamicsPanel` 消费 `dto.dynamics`（按 `eventId` 拉取），后端已按事件隔离；本 Change 仅契约文字同步，无前端代码/类型结构变更。

## 影响（Impact）

- 仅文档（契约 description）同步；`npm run gen:api-types` 重生成后 `src/types/generated/accident-rescue.ts` 仅有 `@description` JSDoc 文字差异（git diff 已确认，无 `interface` 结构变化）。
- 无新增路由 / 权限 / 组件改动。
- 真源实现见后端同 Change `openspec/changes/accident-dynamics-per-incident/`。
