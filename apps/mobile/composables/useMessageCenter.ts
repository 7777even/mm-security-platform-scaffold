import { computed, ref } from 'vue';
import { fetchMessages, type MessageCategory, type MessageItem } from '@/services/message';

export type MsgFilter = 'all' | MessageCategory;

/**
 * 消息中心状态管理：加载、分类筛选、未读计数、批量已读。
 * 纯前端状态，数据来自 fetchMessages（当前 mock）。
 */
export function useMessageCenter() {
  const messages = ref<MessageItem[]>([]);
  const activeFilter = ref<MsgFilter>('all');
  const loading = ref(false);

  const filtered = computed(() => {
    const list =
      activeFilter.value === 'all'
        ? messages.value
        : messages.value.filter((m) => m.category === activeFilter.value);
    return [...list].sort((a, b) => Number(a.read) - Number(b.read));
  });

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
    filtered.value.forEach((m) => {
      m.read = true;
    });
    // 重建引用以触发响应式更新
    messages.value = [...messages.value];
  }

  return { messages, activeFilter, loading, filtered, unreadCount, load, setFilter, markAllRead };
}
