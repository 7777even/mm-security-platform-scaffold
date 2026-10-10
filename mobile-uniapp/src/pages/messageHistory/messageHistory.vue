<script setup lang="ts">
import { onMounted, ref } from 'vue';
import MobileHeader from '@/components/MobileHeader.vue';
import MessageItem from '@/components/MessageItem.vue';
import { fetchNotifications, type MessageItem as MsgItem } from '@/platform/api';
import { useMessageCenter } from '@/composables/useMessageCenter';

// 通知历史（docs/UI规范-移动端.md §5）：拉取全量通知分页，复用消息卡片。
const { markRead } = useMessageCenter();
const items = ref<MsgItem[]>([]);
const loading = ref(false);

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetchNotifications({ page: 1, size: 100 });
    items.value = (res.list ?? []).map((n) => ({
      id: String(n.id),
      category: (n.category as MsgItem['category']) ?? 'system',
      title: n.title ?? '',
      summary: n.summary ?? '',
      time: n.createdAt ?? '',
      read: !!n.read,
      target: n.target ? { type: n.target.type, id: n.target.id ?? '' } : undefined,
    }));
  } catch {
    items.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(load);

function onSelect(item: MsgItem): void {
  markRead(item.id);
}
</script>

<template>
  <view class="mb-page">
    <MobileHeader variant="back" title="通知历史" />

    <text v-if="loading" class="mb-loading">加载中…</text>

    <view v-else-if="items.length === 0" class="mb-empty">
      <text class="mb-empty__text">暂无通知</text>
    </view>

    <view v-else class="msg-list">
      <MessageItem v-for="item in items" :key="item.id" :item="item" @select="onSelect" />
    </view>
  </view>
</template>

<style scoped>
.mb-loading {
  text-align: center;
  color: var(--text-muted-mobile);
  padding: var(--space-lg) 0;
}

.mb-empty {
  padding: var(--mb-empty-pad) var(--mb-pad-x);
  text-align: center;
}

.mb-empty__text {
  font-size: var(--mb-fz-help);
  color: var(--text-muted-mobile);
}

.msg-list {
  display: flex;
  flex-direction: column;
  gap: var(--mb-card-gap);
  padding: var(--mb-card-gap) var(--mb-pad-x);
}
</style>
