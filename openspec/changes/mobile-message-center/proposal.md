# Change: 移动端消息中心（列表 + 通知历史）

## Why

移动端 `/messages` 当前为占位页，缺乏与原型图一致的消息中心。需落地分类筛选、未读红点、批量已读、通知历史与点击跳转占位，补齐移动端核心信息入口。

## What Changes

- 扩展 `src/services/message.ts`：新 `MessageItem`（category/title/summary/read/target）、`CATEGORY_LABELS`、`MESSAGE_CATEGORIES`、`fetchMessages` mock。
- 新增 `useMessageCenter` composable（筛选/批量已读/未读计数）。
- 新增 `MessageItem` / `MessageFilterTabs` 组件；重写 `messages.vue`；新增 `messageHistory.vue` 与 `/messages/history` 路由。
- 同步更新/新增 Vitest 单测（TDD）。

## Capabilities

- message-center: 分类筛选、未读标记、批量已读、通知历史列表、点击跳转占位。

## Impact

- 仅移动端（apps/mobile + 共享 src/services/message.ts）。
- 破坏 `message.ts` 旧 `level/text` 契约，已同步迁移测试。
- 不涉及写控接口、设备编码、权限变更。
