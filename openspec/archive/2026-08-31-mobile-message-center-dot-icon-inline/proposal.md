# Change: 移动端消息卡片红点前置 + 图标内联字号对齐

## Why

用户在「未读红点前置」基础上进一步要求：红点置于最前，紧接其后是分类图标；且分类图标改为与标题字号一致的内联小图标，不再独占 40×40 色块。

## What Changes

- `apps/mobile/components/MessageItem.vue`：
  - 将分类图标从独立的 `.msg-card__icon`（40×40 色块）移入标题行 `.msg-card__title-row`，顺序为「红点 → 图标 → 标题」。
  - 新增 `.msg-card__title-icon`：尺寸对齐 `--mb-fz-section`（1em），保留分类色 `meta.color`，去除色块背景。
  - 删除原 `.msg-card__icon` / `.msg-card__icon-svg` 样式。
- 不新增 / 删除 token 或服务契约。

## Capabilities

- message-center（既有）：消息卡片标题行内联图标与未读标记布局。

## Impact

- 仅 `apps/mobile/components/MessageItem.vue`（scope=mobile）。
- 纯视觉 / 布局调整，无破坏性契约变更；不涉及写控接口、设备编码、权限、路由变更。

## 验证结论（2026-08-29）

- `npm run lint`：通过（exit 0），无新增告警。
- 改动为纯 scoped CSS / 模板调整（`MessageItem.vue`：红点前置、分类图标内联并字号对齐 `--mb-fz-section`）；scope=mobile，未触碰 token/服务/路由。
- 结论：本变更范围内已完成红点前置与图标内联，可归档。
