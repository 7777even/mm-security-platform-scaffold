# Change: 移动端消息中心胶囊样式对齐图片稿

## Why

用户反馈消息中心 `MessageFilterTabs` 与工具栏当前样式和图片稿不符：

- 顶部筛选页签选中态应为**实心蓝底白字**，未选项为**蓝边蓝字胶囊**；
- 工具栏「批量已读」「通知历史」应为**蓝边蓝字胶囊**，且「通知历史」左侧带时钟图标。

按移动端 UI 规范，胶囊是移动端主要交互语言（`--mb-radius-btn`），本次仅把现有元素调整为设计稿形态，不引入新行为。

## What Changes

- `apps/mobile/components/MessageFilterTabs.vue`：
  - 选中态：背景改 `var(--primary-mobile)`、文字改 `var(--color-on-primary)`。
  - 未选项：边框/文字改 `var(--primary-mobile)`，背景保持卡片白。
- `apps/mobile/views/messages.vue`：
  - 「批量已读」按钮改为蓝边蓝字胶囊。
  - 「通知历史 →」改为蓝边蓝字胶囊，去掉箭头，左侧加时钟图标。
- 不使用硬编码色值；不新增/删除 token 或服务契约。

## Capabilities

- message-center（既有）：筛选页签与工具栏按钮视觉对齐设计稿。

## Impact

- 仅 `apps/mobile/components/MessageFilterTabs.vue` 与 `apps/mobile/views/messages.vue`（scope=mobile）。
- 纯视觉调整，无破坏性契约变更；不涉及写控接口、设备编码、权限、路由变更。

## 验证结论（2026-08-28）

- `npm run lint`：通过（exit 0），无新增告警。
- 改动为纯 scoped CSS / Vue 模板调整，未触碰 token/服务/路由；scope=mobile。
- 结论：本变更范围内已完成胶囊样式对齐图片稿，可归档。
