# Tasks: 移动端消息中心胶囊样式对齐图片稿（mobile-message-center-pill-styling）

**关联的提案**：[proposal.md](./proposal.md) ｜ **能力**：`message-center`（既有，样式微调）

## 1. 筛选页签样式

- [x] 1.1 调整 `MessageFilterTabs.vue` 的 `.filter-tabs__item`：未选项边框/文字使用 `var(--primary-mobile)`；选中态背景使用 `var(--primary-mobile)`、文字使用 `var(--color-on-primary)`。

## 2. 工具栏按钮改为胶囊

- [x] 2.1 调整 `messages.vue` 的「批量已读」按钮为蓝边蓝字胶囊样式。
- [x] 2.2 调整「通知历史」为蓝边蓝字胶囊，去掉 `→`，左侧增加时钟图标。

## 3. 校验与收尾

- [x] 3.1 运行 `npm run lint` 验证（纯 scoped 样式变更，无 TDD 项），确认无新增告警。
- [x] 3.2 验证通过后将本 change 归档至 `openspec/archive/mobile-message-center-pill-styling/`，并以 `fix(mobile):` 提交。
