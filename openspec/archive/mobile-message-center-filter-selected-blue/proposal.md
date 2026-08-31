# Change: 移动端消息中心筛选页签仅选中项蓝边蓝字

## Why

用户调整筛选页签视觉规则：仅**被选中**的页签以蓝边蓝字突出；**未选中**项统一使用默认中性样式（灰边、辅文色、卡片白底），不再使用蓝边蓝字，也不再对选中项使用实心蓝底。

## What Changes

- `apps/mobile/components/MessageFilterTabs.vue`：
  - 未选项恢复默认：`border: 1px solid var(--color-border)`、`color: var(--text-muted-mobile)`、`background: var(--card-mobile)`。
  - 选中项：`border-color: var(--primary-mobile)`、`color: var(--primary-mobile)`，背景恢复 `var(--card-mobile)`（不再实心蓝底）。
- 不使用硬编码色值；不新增 / 删除 token 或服务契约。

## Capabilities

- message-center（既有）：筛选页签选中态视觉调整。

## Impact

- 仅 `apps/mobile/components/MessageFilterTabs.vue`（scope=mobile）。
- 纯视觉调整，无破坏性契约变更；不涉及写控接口、设备编码、权限、路由变更。

## 验证结论（2026-08-29）

- `npm run lint`：通过（exit 0），无新增告警。
- 改动为纯 scoped CSS（`MessageFilterTabs.vue` 选中态蓝边蓝字、未选恢复默认）；scope=mobile，未触碰 token/服务/路由。
- 结论：本变更范围内已完成筛选页签选中态调整，可归档。
