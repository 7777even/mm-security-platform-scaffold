# Tasks: 移动端消息中心已读项淡化后置、未读优先（mobile-message-center-read-sort）

**关联的提案**：[proposal.md](./proposal.md) ｜ **能力**：`message-center`（既有，行为与样式调整）

## 1. 排序：未读优先

- [x] 1.1 在 `useMessageCenter.ts` 的 `filtered` 中增加按 `read` 排序，未读在前、已读在后。

## 2. 已读项淡化

- [x] 2.1 在 `MessageItem.vue` 为已读卡片增加 `.is-read` 类与 `opacity: 0.6` 淡化样式。

## 3. 校验与收尾

- [x] 3.1 运行 `npm run lint` 验证（无 TDD 项），确认无新增告警。
- [x] 3.2 验证通过后将本 change 归档至 `openspec/archive/mobile-message-center-read-sort/`，并以 `fix(mobile):` 提交。
