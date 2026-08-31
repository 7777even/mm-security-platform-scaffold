# Tasks: 移动端消息中心工具栏胶囊加粗（mobile-message-center-pill-bold）

**关联的提案**：[proposal.md](./proposal.md) ｜ **能力**：`message-center`（既有，样式微调）

## 1. 胶囊加粗

- [x] 1.1 在 `messages.vue` 的 `.msg-toolbar__pill` 增加 `border-width: 2px` 与 `font-weight: 600`。

## 2. 校验与收尾

- [x] 2.1 运行 `npm run lint` 验证（纯 scoped 样式变更，无 TDD 项），确认无新增告警。
- [x] 2.2 验证通过后将本 change 归档至 `openspec/archive/mobile-message-center-pill-bold/`，并以 `fix(mobile):` 提交。
