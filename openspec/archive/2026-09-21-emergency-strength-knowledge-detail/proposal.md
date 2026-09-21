# Proposal: 应急指挥首页面板明细接入真实数据

## Why

大屏「应急指挥首页」（fm-emergency）右侧「应急力量救援」「应急生产安全知识」两个面板点击卡片弹详情，
此前详情内只有聚合数字 + 组件内写死的说明文案，属于「纯展示死数据」。后端已富化
`GET /api/v1/emergency/strength`（`items`）与 `GET /api/v1/emergency/knowledge`（`description`），
前端需接线展示真实明细。

## What Changes

- `npm run gen:api-types` 重生成类型（含 `StrengthItem` / `EmergencyResource.items` / `KnowledgeItem.description`）。
- `src/services/emergency.ts`、`src/services/knowledge.ts` 手写接口对齐契约。
- `EmergencyRescuePanel.vue`：弹窗展示真实 `items`（前 20 项），移除写死 `RESCUE_DESC`；无明细源类别给统一说明。
- `SafetyKnowledgePanel.vue`：弹窗「说明」改为真实 `description`。
- `InfoDetailDialog.vue`：新增可选 `items` 明细列表区。

## Capabilities

- 大屏应急概览面板点击即见后端真实明细，替代写死文案。

## Impact

- 仅前端展示接线 + 类型同步，无新增路由/权限。契约真源见后端同 Change。
