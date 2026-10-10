// 消息中心组合式（port of apps/mobile/composables/useMessageCenter，逻辑精简 + 对齐真实通知契约）。
import { ref, computed } from 'vue';
import {
  fetchMessages,
  markAllNotificationsRead,
  type MessageItem,
  type MessageCategory,
} from '@/platform/api';

export type MessageFilter = 'all' | 'unread' | MessageCategory;

const CATEGORY_FILTERS: MessageCategory[] = ['alarm', 'event', 'task', 'system'];

export function useMessageCenter() {
  const messages = ref<MessageItem[]>([]);
  const activeFilter = ref<MessageFilter>('all');
  const loading = ref(false);

  async function load(): Promise<void> {
    loading.value = true;
    try {
      messages.value = await fetchMessages(1, 50);
    } catch {
      messages.value = [];
    } finally {
      loading.value = false;
    }
  }

  const filtered = computed<MessageItem[]>(() => {
    const list = messages.value;
    if (activeFilter.value === 'unread') return list.filter((m) => !m.read);
    if (activeFilter.value === 'all') return list;
    if (CATEGORY_FILTERS.includes(activeFilter.value as MessageCategory)) {
      return list.filter((m) => m.category === activeFilter.value);
    }
    return list;
  });

  const unreadCount = computed(() => messages.value.filter((m) => !m.read).length);

  function markAllRead(): void {
    // 乐观更新 + 后端批量已读（失败不影响本地视图）
    messages.value = messages.value.map((m) => ({ ...m, read: true }));
    void markAllNotificationsRead().catch(() => undefined);
  }

  function markRead(id: string): void {
    const target = messages.value.find((m) => m.id === id);
    if (target && !target.read) {
      target.read = true;
      messages.value = [...messages.value];
    }
  }

  return { messages, activeFilter, loading, filtered, unreadCount, load, markAllRead, markRead };
}
