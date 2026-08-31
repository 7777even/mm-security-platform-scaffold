# Tasks: 移动端消息卡片红点前置 + 图标内联字号对齐（mobile-message-center-dot-icon-inline）

**关联的提案**：[proposal.md](./proposal.md) ｜ **能力**：`message-center`（既有，样式微调）

## 1. 红点前置 + 图标内联

- [x] 1.1 在 `MessageItem.vue` 将分类图标移入标题行（红点 → 图标 → 标题），新增 `.msg-card__title-icon` 字号对齐 `--mb-fz-section`，删除原图标色块样式。

## 2. 校验与收尾

- [x] 2.1 运行 `npm run lint` 验证（纯 scoped 样式 / 模板变更，无 TDD 项），确认无新增告警。
- [x] 2.2 验证通过后将本 change 归档至 `openspec/archive/mobile-message-center-dot-icon-inline/`，并以 `fix(mobile):` 提交。
