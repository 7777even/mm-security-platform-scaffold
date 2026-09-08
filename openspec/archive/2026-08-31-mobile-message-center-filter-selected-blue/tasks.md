# Tasks: 移动端消息中心筛选页签仅选中项蓝边蓝字（mobile-message-center-filter-selected-blue）

**关联的提案**：[proposal.md](./proposal.md) ｜ **能力**：`message-center`（既有，样式微调）

## 1. 选中项蓝边蓝字 / 未选默认

- [x] 1.1 调整 `MessageFilterTabs.vue`：未选项用默认灰边 + 辅文色 + 卡片白底；选中项蓝边 + 蓝字、背景恢复白色。

## 2. 校验与收尾

- [x] 2.1 运行 `npm run lint` 验证（纯 scoped 样式变更，无 TDD 项），确认无新增告警。
- [x] 2.2 验证通过后将本 change 归档至 `openspec/archive/mobile-message-center-filter-selected-blue/`，并以 `fix(mobile):` 提交。
