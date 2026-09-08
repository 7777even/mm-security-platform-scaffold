# Change: 移动端消息中心隐藏筛选页签滚动条

## Why

`MessageFilterTabs` 的 `.filter-tabs` 使用 `overflow-x: auto` 以支持分类过多时横向滑动，但同时渲染出横向滚动条，与移动端浅底卡片语言的简洁视觉不符，户外强光下也更易干扰。用户要求隐藏该滚动条，同时保留触摸横向滑动能力。

## What Changes

- `apps/mobile/components/MessageFilterTabs.vue` 的 `.filter-tabs`：补充 `scrollbar-width: none`（Firefox）与 `::-webkit-scrollbar { display: none }`（Chromium/WebKit），隐藏滚动条视觉，但保留 `overflow-x: auto` 的滑动能力。
- 不涉及 token、路由、服务或契约变更，不新增/删除文件。

## Capabilities

- message-center（既有）：筛选页签交互与布局保持不变，仅隐藏滚动条视觉。

## Impact

- 仅 `apps/mobile/components/MessageFilterTabs.vue`（scope=mobile）。
- 纯 scoped 样式隐藏滚动条，不改变热区、布局或行为；无破坏性契约变更。
- 不涉及写控接口、设备编码、权限、路由变更。

## 验证结论（2026-08-28）

- `npm run lint`：通过（exit 0），无新增告警。
- 改动为纯 scoped CSS 隐藏滚动条（`scrollbar-width: none` + `::-webkit-scrollbar { display: none }`），保留 `overflow-x: auto` 触摸滑动；scope=mobile，未触碰 token/服务/路由。
- 结论：本变更范围内（scope=mobile 的 MessageFilterTabs 组件）已完成滚动条隐藏，可归档。
