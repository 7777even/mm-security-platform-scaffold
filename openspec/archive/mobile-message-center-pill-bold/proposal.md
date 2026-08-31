# Change: 移动端消息中心工具栏胶囊加粗（边框 / 文字）

## Why

用户要求「批量已读」「通知历史」两个胶囊按钮的**边框、文字内容、字体**均加粗，以增强户外 / 强光环境下的可辨识度与操作引导。

## What Changes

- `apps/mobile/views/messages.vue` 的 `.msg-toolbar__pill`：边框 `1px` → `2px`，文字 `font-weight: 600`（加粗）。
- token 体系当前未覆盖字重 / 边框宽度，沿用字面量；不新增 / 删除 token，不触碰其它文件或服务契约。

## Capabilities

- message-center（既有）：工具栏胶囊视觉加粗。

## Impact

- 仅 `apps/mobile/views/messages.vue`（scope=mobile）。
- 纯视觉调整，无破坏性契约变更；不涉及写控接口、设备编码、权限、路由变更。

## 验证结论（2026-08-29）

- `npm run lint`：通过（exit 0），无新增告警。
- 改动为纯 scoped CSS（`.msg-toolbar__pill` 边框 2px + `font-weight: 600`）；scope=mobile，未触碰 token/服务/路由。
- 结论：本变更范围内已完成工具栏胶囊加粗，可归档。
