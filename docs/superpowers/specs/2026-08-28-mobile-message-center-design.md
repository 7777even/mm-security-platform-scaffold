# 移动端消息中心 — 设计文档

- 日期：2026-08-28
- 端：移动端（`apps/mobile`，`data-theme='mobile'`）
- 依据：原型图（消息中心视图级）、`docs/UI规范-移动端.md` §4/§5.1/§9、现有 `src/services/message.ts`
- 关联流程：superpowers(brainstorming → writing-plans) + openspec(spec-driven)

## 1. 目标

替换 `apps/mobile/views/messages.vue` 占位页，实现与原型图一致的**消息中心**列表页，并新增**通知历史**内页。列表采用“独立浅底条目”呈现标题、副标题（类型·时间）、未读红点。分类筛选、批量已读、通知历史、点击跳转均按原型图落地。

## 2. 范围与决策（已与用户确认）

- 入口：替换现有 `/messages`（与底栏“消息”标签对应）。
- 分类筛选：五类 `全部 / 报警通知 / 事件通知 / 任务通知 / 系统通知`，列表实例中“演练公告”归入系统通知。
- 通知历史：独立内页 `/messages/history`，复用消息列表组件。
- 点击跳转：条目保留 `target` 字段与点击逻辑；脚手架期详情页（报警/事件/任务）未实现，走“轻提示占位 + 预留路由钩子”。
- 下拉刷新/上拉加载：脚手架期不实现，预留 hook 位。
- 数据：当前为 mock，扩展 `MessageItem` 字段，契约到位后仅改 `fetchMessages` 实现。

## 3. 架构与组件拆分

| 文件                                               | 动作 | 职责                                                                          |
| -------------------------------------------------- | ---- | ----------------------------------------------------------------------------- |
| `src/services/message.ts`                          | 改写 | 重定义 `MessageItem`；`levelLabel`→`categoryLabel`（4 类）；mock 数据覆盖四类 |
| `apps/mobile/composables/useMessageCenter.ts`      | 新增 | 列表、当前筛选分类、批量已读、未读计数（响应式）                              |
| `apps/mobile/components/MessageItem.vue`           | 新增 | 单条消息：分类图标(浅底圆)+标题+副标题(类型·时间)+未读红点+右箭头             |
| `apps/mobile/components/MessageFilterTabs.vue`     | 新增 | 横向滚动筛选 pill，选中态主色                                                 |
| `apps/mobile/views/messages.vue`                   | 重写 | 顶栏+筛选条+操作行(批量已读/通知历史)+列表+底栏                               |
| `apps/mobile/views/messageHistory.vue`             | 新增 | 历史页，复用 `MessageItem`                                                    |
| `apps/mobile/router.ts`                            | 改   | 新增 `/messages/history` 路由                                                 |
| `src/services/message.spec.ts`                     | 改   | 改为 `category` 断言 + 字段非空 + `categoryLabel` 映射                        |
| `apps/mobile/composables/useMessageCenter.spec.ts` | 新增 | 筛选/批量已读/未读计数（TDD 先红后绿）                                        |

## 4. 数据模型

```ts
export type MessageCategory = 'alarm' | 'event' | 'task' | 'system';
export interface MessageTarget {
  type: 'alarm' | 'event' | 'task';
  id: string;
}
export interface MessageItem {
  id: string;
  category: MessageCategory;
  title: string;
  summary: string;
  time: string;
  read: boolean;
  target?: MessageTarget;
}
// categoryLabel: alarm→报警通知, event→事件通知, task→任务通知, system→系统通知
// 分类图标浅底圆：报警(红)/事件(橙)/任务(蓝)/系统(灰)
```

Mock 数据覆盖四类，含原型图实例：B3 区烟感报警、C1 区电气柜温度超阈值、平台升级公告、全员演练公告、巡检任务等，部分 `read:false`（带未读红点）。

## 5. UI 实现要点（严守 `docs/UI规范-移动端.md` §9）

- 顶栏白底 48px，中标题“消息中心”，右“导航”文字按钮。
- 筛选 pill 横向滚动，选中态主色 `#1677ff`；操作行右对齐“批量已读 / 通知历史”文字链接。
- 消息条目白卡纵向堆叠（独立浅底条目）；未读用小红点角标（不改图标色相）。
- 全量 `var(--token)` 引用，无硬编码色/字号/尺寸；同屏字号 ≤4 档；触控热区 48–56px；保留底栏 + 预留 `var(--mb-bottom-safe)`。
- 空状态：插画位 + 文案 + 引导按钮。
- 适老/户外皮肤：仅用 token 即自动适配，不写端特异分支。

## 6. 交互

- 筛选切换：前端按 `category` 过滤（“全部”不滤）。
- 批量已读：标记当前筛选集合全部 `read`，红点消失、未读计数归零。
- 通知历史：路由跳 `/messages/history`。
- 点击条目：有 `target` 时预留 `router.push`；脚手架期详情页未实现 → 轻提示占位 + 标记已读。
- 数据权限：当前 mock 不涉及，结构预留权限过滤位。

## 7. 测试与验收

- `message.spec.ts`：改为 `category` 断言（4 类齐备）+ 新字段非空 + `categoryLabel` 映射正确。
- `useMessageCenter.spec.ts`：筛选、批量已读、未读计数（先写失败用例再实现）。
- 完成后逐条过 `docs/UI规范-移动端.md` §9 自检清单。

## 8. 不在本次范围

- 真实 WS 推送订阅（`src/services/ws.ts` 接入）。
- 报警/事件/任务详情页（仅预留跳转钩子）。
- 下拉刷新 / 上拉加载（预留 hook 位）。
