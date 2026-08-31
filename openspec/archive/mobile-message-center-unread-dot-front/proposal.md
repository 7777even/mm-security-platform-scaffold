# Change: 移动端消息卡片未读红点移至标题最前

## Why

用户要求未读红点放在**标题最前面**（当前位于卡片末尾、正文之后），以更直观标示未读项，符合常见列表未读标记的位置习惯。

## What Changes

- `apps/mobile/components/MessageItem.vue`：将 `.msg-card__dot` 从卡片末尾（`msg-card__body` 之后、`›` 箭头之前）移至标题行最前，与标题同行显示。
  - 新增 `.msg-card__title-row`（`display: flex; align-items: center; gap`）包裹「红点 + 标题」。
  - 去除 `.msg-card__dot` 原末尾定位样式（`align-self: flex-start; margin-top: 6px`）。
- 不新增 / 删除 token 或服务契约。

## Capabilities

- message-center（既有）：消息卡片未读标记位置调整。

## Impact

- 仅 `apps/mobile/components/MessageItem.vue`（scope=mobile）。
- 纯视觉 / 布局调整，无破坏性契约变更；不涉及写控接口、设备编码、权限、路由变更。

## 验证结论（2026-08-29）

- `npm run lint`：通过（exit 0），无新增告警。
- 改动为纯 scoped CSS / 模板调整（`MessageItem.vue` 未读红点移入标题行最前）；scope=mobile，未触碰 token/服务/路由。
- 结论：本变更范围内已完成未读红点位置调整，可归档。
