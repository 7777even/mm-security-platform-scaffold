# Tasks: 移动端消息中心隐藏筛选页签滚动条（mobile-message-center-scrollbar）

**关联的提案**：[proposal.md](./proposal.md) ｜ **能力**：`message-center`（既有，样式微调）

## 1. 隐藏滚动条

- [x] 1.1 在 `apps/mobile/components/MessageFilterTabs.vue` 的 `.filter-tabs` 增加 `scrollbar-width: none` 与 `::-webkit-scrollbar { display: none; }`，保留 `overflow-x: auto` 滑动能力。

## 2. 校验与收尾

- [x] 2.1 运行 `npm run lint` 验证（纯 scoped 样式变更，无 TDD 项），确认无新增告警。
- [x] 2.2 验证通过后将本 change 归档至 `openspec/archive/mobile-message-center-scrollbar/`，并以 `fix(mobile):` 提交。
