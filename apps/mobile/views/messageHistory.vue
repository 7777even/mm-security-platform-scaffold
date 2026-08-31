<script setup lang="ts">
import { onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useMessageCenter } from '../composables/useMessageCenter';
import type { MessageItem as MsgItem } from '@/services/message';
import MessageItem from '../components/MessageItem.vue';
import MobileHeader from '../components/MobileHeader.vue';

const { messages, loading, filtered, load } = useMessageCenter();

onMounted(load);

function onSelect(item: MsgItem) {
  if (item.target) {
    ElMessage.info(`详情页建设中（预留 target.${item.target.type}:${item.target.id}）`);
  }
  item.read = true;
  messages.value = [...messages.value];
}
</script>

<template>
  <div class="mb-page hist-page">
    <MobileHeader variant="back" title="通知历史" back-to="/messages" />

    <main class="msg-list">
      <p v-if="loading" class="msg-list__loading">加载中…</p>
      <div v-else-if="filtered.length === 0" class="msg-empty">
        <svg
          class="msg-empty__icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          aria-hidden="true"
        >
          <path d="M4 6h16v9H8l-4 4V6z" />
        </svg>
        <p class="msg-empty__title">暂无历史消息</p>
      </div>
      <MessageItem v-for="item in filtered" :key="item.id" :item="item" @select="onSelect" />
    </main>
  </div>
</template>

<style scoped>
.hist-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.msg-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--mb-card-gap);
  padding: var(--mb-card-gap) var(--mb-pad-x) calc(var(--mb-card-gap) + env(safe-area-inset-bottom));
}

.msg-list__loading {
  font-size: var(--mb-fz-help);
  color: var(--text-muted-mobile);
  text-align: center;
  padding: var(--space-lg) 0;
}

.msg-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 56px 0;
}

.msg-empty__icon {
  width: 48px;
  height: 48px;
  color: var(--text-muted-mobile);
}

.msg-empty__title {
  margin: 0;
  font-size: var(--mb-fz-section);
  color: var(--text-title-mobile);
}
</style>
