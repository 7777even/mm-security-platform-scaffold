# Tasks: 移动端消息卡片未读红点移至标题最前（mobile-message-center-unread-dot-front）

**关联的提案**：[proposal.md](./proposal.md) ｜ **能力**：`message-center`（既有，样式微调）

## 1. 红点移至标题前

- [x] 1.1 在 `MessageItem.vue` 新增 `.msg-card__title-row` 包裹「红点 + 标题」，将未读红点移入标题行最前，并去除红点末尾定位样式。

## 2. 校验与收尾

- [x] 2.1 运行 `npm run lint` 验证（纯 scoped 样式 / 模板变更，无 TDD 项），确认无新增告警。
- [x] 2.2 验证通过后将本 change 归档至 `openspec/archive/mobile-message-center-unread-dot-front/`，并以 `fix(mobile):` 提交。
