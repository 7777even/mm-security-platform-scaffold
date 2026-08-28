# 实施计划：移动端消息中心

> 来源设计：`docs/superpowers/specs/2026-08-28-mobile-message-center-design.md`
> 流程：brainstorming(已批准) → writing-plans(本文件) → TDD 实现 → verification
> 端：移动端 `apps/mobile`（`data-theme='mobile'`）；严守 `docs/UI规范-移动端.md` §9

## 关键约束（贯穿所有任务）

- 所有色/字/距/圆/尺寸引用 `var(--token)`，禁止硬编码（红线 1）。
- 状态/等级着色只用规范映射表（红线 2）；本页未用报警等级色阶，分类图标用浅底圆承载。
- z-index 只用五层 token（本页不需自定义层）。
- 触控热区 48–56px；底栏保留 + `var(--mb-bottom-safe)` 安全区；同屏字号 ≤4 档。
- TS strict，禁用 `any`。
- 提交：`type(scope): 描述`，scope 用 `mobile`（端内）与 `shared`（改 `src/services/message.ts` 公共服务时双 scope：`feat(mobile,shared):`）。

## Task 1 — [TDD] 扩展服务层 `src/services/message.ts` 并迁移测试

**测试先行**：改写 `src/services/message.spec.ts` 为以下失败用例，再实现。

```ts
import { describe, it, expect } from 'vitest';
import { CATEGORY_LABELS, MESSAGE_CATEGORIES, fetchMessages } from './message';

describe('message service', () => {
  it('exposes 4 categories with labels', () => {
    expect(MESSAGE_CATEGORIES).toHaveLength(4);
    expect(CATEGORY_LABELS.alarm).toBe('报警通知');
    expect(CATEGORY_LABELS.event).toBe('事件通知');
    expect(CATEGORY_LABELS.task).toBe('任务通知');
    expect(CATEGORY_LABELS.system).toBe('系统通知');
  });
  it('fetchMessages returns items with required fields', async () => {
    const list = await fetchMessages();
    expect(list.length).toBeGreaterThan(0);
    for (const m of list)
      expect(['id', 'category', 'title', 'summary', 'time', 'read'].every((k) => k in m)).toBe(
        true,
      );
  });
  it('includes unread items', async () => {
    expect((await fetchMessages()).some((m) => !m.read)).toBe(true);
  });
});
```

**实现** `src/services/message.ts`：

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
export const CATEGORY_LABELS: Record<MessageCategory, string> = {
  alarm: '报警通知',
  event: '事件通知',
  task: '任务通知',
  system: '系统通知',
};
export const MESSAGE_CATEGORIES: MessageCategory[] = ['alarm', 'event', 'task', 'system'];
// MOCK 数据覆盖四类，含原型图实例（烟感报警/温度超阈值/平台升级/演练公告/巡检任务），部分 read:false
export function fetchMessages(): Promise<MessageItem[]> {
  return Promise.resolve(structuredClone(MOCK_MESSAGES));
}
```

**提交**：`feat(mobile,shared): 扩展消息数据模型支持分类与未读` + 测试 `test(shared): 迁移 message.spec 至分类契约`

## Task 2 — [TDD] 新增 `useMessageCenter` composable + 测试

**测试先行** `apps/mobile/composables/useMessageCenter.spec.ts`：

```ts
import { describe, it, expect } from 'vitest';
import { useMessageCenter } from './useMessageCenter';
describe('useMessageCenter', () => {
  it('filters by category', async () => {
    const c = useMessageCenter();
    await c.load();
    c.setFilter('alarm');
    expect(c.filtered.value.every((m) => m.category === 'alarm')).toBe(true);
  });
  it('counts unread', async () => {
    const c = useMessageCenter();
    await c.load();
    expect(c.unreadCount.value).toBeGreaterThan(0);
  });
  it('markAllRead clears unread in current filter', async () => {
    const c = useMessageCenter();
    await c.load();
    c.setFilter('alarm');
    c.markAllRead();
    expect(c.filtered.value.every((m) => m.read)).toBe(true);
  });
});
```

**实现** `apps/mobile/composables/useMessageCenter.ts`：

```ts
import { computed, ref } from 'vue';
import {
  fetchMessages,
  MESSAGE_CATEGORIES,
  type MessageCategory,
  type MessageItem,
} from '@/services/message';
export type MsgFilter = 'all' | MessageCategory;
export function useMessageCenter() {
  const messages = ref<MessageItem[]>([]);
  const activeFilter = ref<MsgFilter>('all');
  const loading = ref(false);
  const filtered = computed(() =>
    activeFilter.value === 'all'
      ? messages.value
      : messages.value.filter((m) => m.category === activeFilter.value),
  );
  const unreadCount = computed(() => messages.value.filter((m) => !m.read).length);
  async function load() {
    loading.value = true;
    try {
      messages.value = await fetchMessages();
    } finally {
      loading.value = false;
    }
  }
  function setFilter(f: MsgFilter) {
    activeFilter.value = f;
  }
  function markAllRead() {
    filtered.value.forEach((m) => (m.read = true));
    messages.value = [...messages.value];
  }
  return { messages, activeFilter, loading, filtered, unreadCount, load, setFilter, markAllRead };
}
```

**提交**：`feat(mobile): 新增 useMessageCenter 管理筛选与已读` + `test(mobile): 覆盖筛选/未读/批量已读`

## Task 3 — 新增 `MessageItem.vue`

- props：`item: MessageItem`；emit `'select'`。
- 结构：左分类图标（浅底圆，按 category 选色 token）/ 中列（标题 `var(--text-strong)` + 副标题 `CATEGORY_LABELS[category] · time` `@var(--text-muted)`）/ 右上未读红点（`v-if !item.read`，`.mb-dot`）/ 右箭头（chevron，灰）。
- 点击 `@click="$emit('select', item)"`。热区 ≥48px。
- **提交**：`feat(mobile): 新增 MessageItem 消息条目组件`

## Task 4 — 新增 `MessageFilterTabs.vue`

- props：`modelValue: MsgFilter`；emit `update:modelValue`。
- 渲染 `全部` + `MESSAGE_CATEGORIES` 标签，横向滚动（`overflow-x:auto`，pills）。选中态主色背景/文字（token）。
- 用 `v-model` 风格。
- **提交**：`feat(mobile): 新增 MessageFilterTabs 横向筛选条`

## Task 5 — 重写 `messages.vue`

- 顶栏（白底 48px）：中标题“消息中心”，右“导航”文字按钮（占位 `console`/轻提示）。
- `MessageFilterTabs`（`v-model="activeFilter"`）。
- 操作行（右对齐）：`批量已读`（调 `markAllRead`）、`通知历史`（`<router-link to="/messages/history">`）。
- 列表：`filtered.map` 渲染 `MessageItem`，`@select` 处理：有 `target` 暂 `ElMessage` 轻提示“详情页建设中（预留 target.type:id）”，并标记已读；否则标记已读。
- 空状态：插画位 + 文案 + 引导。
- 保留底栏 TabBar；底部预留 `var(--mb-bottom-safe)`。
- **提交**：`feat(mobile): 重写消息中心主页面`

## Task 6 — 新增 `messageHistory.vue` + 路由

- `messageHistory.vue`：白底顶栏（返回 + 标题“通知历史”），复用 `useMessageCenter` 加载并展示全部 `messages`（列表复用 `MessageItem`），空状态同样的插画位。
- `router.ts`：新增 `{ path: '/messages/history', component: () => import('@/views/messageHistory.vue') }`（沿用现有 mobile 路由 import 约定）。
- **提交**：`feat(mobile): 新增通知历史页与路由`

## Task 7 — 验证

- `npm run lint` / `npm run type-check` / `npm run test` / `npm run build` 全绿。
- 启动 `npm run dev` 访问 `/apps/mobile/` → 消息标签，走查：筛选切换、未读红点、批量已读、进历史页、点击占位提示、规范 §9 自检。
- 修复并补提交（如需要）。
- 全部通过后：openspec proposal 归档至 `openspec/archive/`。

## NEXT STEP

请确认本计划。批准后我将按 Task 1→7 顺序实施（先红后绿），每任务独立提交。
