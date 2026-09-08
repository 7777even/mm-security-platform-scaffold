# Change: 移动端消息中心已读项淡化后置、未读优先

## Why

用户要求消息列表中**未读项优先显示**，**已读项淡化并排在最下面**，以提升未读消息的视觉层级与处理效率。

## What Changes

- `apps/mobile/composables/useMessageCenter.ts`：
  - `filtered` 计算属性在分类筛选后，再按 `read` 排序，未读项（`read=false`）前置、已读项（`read=true`）后置；同组内保持原序。
- `apps/mobile/components/MessageItem.vue`：
  - 为已读卡片增加 `.is-read` 类与 `opacity: 0.6` 淡化样式；未读卡片保持正常。
- 不新增 / 删除 token 或服务契约。

## Capabilities

- message-center（既有）：消息列表按已读状态排序与视觉分层。

## Impact

- 仅 `apps/mobile/composables/useMessageCenter.ts` 与 `apps/mobile/components/MessageItem.vue`（scope=mobile）。
- 排序行为变更：未读项始终优先；已读项视觉淡化。无破坏性契约变更；不涉及写控接口、设备编码、权限、路由变更。

## 验证结论（2026-08-29）

- `npm run lint`：通过（exit 0），无新增告警。
- 改动包括 `useMessageCenter.ts` 的未读优先排序与 `MessageItem.vue` 的已读淡化；scope=mobile，未触碰 token/服务/路由。
- 结论：本变更范围内已完成已读项淡化后置与未读优先，可归档。
