# Tasks: 移动端消息中心（mobile-message-center）

**关联的提案**：[proposal.md](./proposal.md) ｜ **能力**：`mobile-message-center`（新建）

## 1. 服务层与数据模型

- [x] 1.1 扩展 `src/services/message.ts`：新增 `MessageCategory`（`all|alarm|event|notice`）、`MessageSummary` 接口、`getMessages(params)` 分页拉取、`getUnreadSummary()`、`markRead(ids)`、`markAllRead()`。
- [x] 1.2 在 `src/services/message.ts` 内联补充 `GetMessagesParams { page, pageSize, category }` 入参类型。

## 2. 状态与逻辑 composable（TDD）

- [x] 2.1 新建 `apps/mobile/composables/useMessageCenter.ts` + `useMessageCenter.spec.ts`（TDD）。
- [x] 2.2 实现 `load(category)` 分页加载、互斥 loading、`unreadByCategory`、派生 `filtered` 列表、`markRead` / `markAllRead` 乐观更新。

## 3. 列表项组件

- [x] 3.1 新建 `apps/mobile/components/MessageItem.vue`：按 `level` 映射状态点（alarm=#fa5151 / event=#1677ff / notice=#52c41a），标题/摘要/时间三行布局，48–56px 触控热区，未读加粗。

## 4. 分类筛选页签

- [x] 4.1 新建 `apps/mobile/components/MessageFilterTabs.vue`：4 个分类（全部/告警/事件/通知），激活态下划线 + 未读计数徽标，48px 热区。

## 5. 消息中心页（重写）

- [x] 5.1 重写 `apps/mobile/views/messages.vue`：顶部标题栏 + `MessageFilterTabs` + 列表（骨架屏 + 空态 + 滚动到底加载更多）+ 底部「全部已读」操作条，遵循移动端 token。

## 6. 历史记录页（新增）

- [x] 6.1 新建 `apps/mobile/views/messageHistory.vue`：复用 `messages.vue` 的筛选/列表骨架，默认 `notice` 分类（历史只读，无「全部已读」条），并注册路由 `/apps/mobile/message-history`。

## 7. 校验与收尾

- [x] 7.1 运行 lint / type-check / test / build 验证并修复。

## 验证结论（2026-08-28）

- `npm run lint`：通过（exit 0），无新增告警。
- `npm run type-check`：通过（exit 0）。
- `npm run test`：移动端相关用例全部通过——`src/services/message.spec.ts`（4/4）、`apps/mobile/composables/useMessageCenter.spec.ts`（4/4）。
  全量共 8 例失败，全部位于大屏端 `src/views/{dashboard,ops-monitor,industrial-video,security-anti-terror}` 的既有用例（jsdom 下 ECharts canvas `clearRect` 空指针 / 网络请求 `Network Error`、`Invalid URL`），与本次移动端改动无关，属预存问题。
- `npm run build`：移动端相关文件零构建错误（`apps/mobile/*`、`src/services/message.ts`、`src/styles/tokens.css` 移动端主题块均编译通过）。
  全量构建报 TS 错误全部位于大屏端既有的 `src/services/cesium-cluster.ts`、`cesium-cluster.spec.ts`、`map.spec.ts`、`src/views/fire-alarm/records.vue`，非本次改动引入。
- 结论：本变更范围内（scope=mobile, shared 的 message 服务）功能完整、校验通过，可归档。大屏端预存失败项超出本变更范围，按纪律不纳入修复。
