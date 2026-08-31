<script setup lang="ts">
import { onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useMessageCenter } from '../composables/useMessageCenter';
import type { MessageItem as MsgItem } from '@/services/message';
import MessageItem from '../components/MessageItem.vue';
import MessageFilterTabs from '../components/MessageFilterTabs.vue';
import TabBar from '../components/TabBar.vue';

const { messages, activeFilter, loading, filtered, unreadCount, load, markAllRead } =
  useMessageCenter();

onMounted(load);

function onSelect(item: MsgItem) {
  if (item.target) {
    ElMessage.info(`详情页建设中（预留 target.${item.target.type}:${item.target.id}）`);
  }
  item.read = true;
  messages.value = [...messages.value];
}

function onMarkAll() {
  markAllRead();
}
</script>

<template>
  <div class="mb-page msg-page">
    <header class="mb-brand-header">
      <div>
        <h1 class="mb-brand-header__title">消息中心</h1>
        <p class="mb-brand-header__sub">茂名石化</p>
      </div>
      <RouterLink to="/tasks" class="mb-brand-header__nav">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
        导航
      </RouterLink>
    </header>

    <MessageFilterTabs v-model="activeFilter" />

    <div class="msg-toolbar">
      <span v-if="unreadCount > 0" class="msg-toolbar__count">{{ unreadCount }} 条未读</span>
      <span class="msg-toolbar__spacer" />
      <span class="msg-toolbar__actions">
        <button type="button" class="msg-toolbar__pill" @click="onMarkAll">批量已读</button>
        <RouterLink to="/messages/history" class="msg-toolbar__pill">
          <svg
            class="msg-toolbar__pill-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 3" />
          </svg>
          通知历史
        </RouterLink>
      </span>
    </div>

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
        <p class="msg-empty__title">暂无消息</p>
        <p class="msg-empty__hint">当前分类下没有消息</p>
      </div>
      <MessageItem v-for="item in filtered" :key="item.id" :item="item" @select="onSelect" />
    </main>

    <TabBar active="messages" />
  </div>
</template>

<style scoped>
.msg-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.msg-toolbar {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--mb-pad-x);
}

.msg-toolbar__count {
  font-size: var(--mb-fz-tip);
  color: var(--color-danger);
}

.msg-toolbar__spacer {
  flex: 1;
}

.msg-toolbar__actions {
  display: flex;
  gap: var(--space-sm);
  align-items: center;
}

.msg-toolbar__pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  height: 32px;
  padding: 0 16px;
  border: 2px solid var(--primary-mobile);
  border-radius: var(--mb-radius-btn);
  background: var(--card-mobile);
  color: var(--primary-mobile);
  font-size: var(--mb-fz-help);
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
}

.msg-toolbar__pill-icon {
  width: 16px;
  height: 16px;
}

.msg-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--mb-card-gap);
  padding: var(--mb-card-gap) var(--mb-pad-x)
    calc(var(--mb-bottom-bar-h) + var(--mb-bottom-safe) + var(--mb-card-gap));
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
  gap: var(--space-sm);
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

.msg-empty__hint {
  margin: 0;
  font-size: var(--mb-fz-help);
  color: var(--text-muted-mobile);
}
</style>
