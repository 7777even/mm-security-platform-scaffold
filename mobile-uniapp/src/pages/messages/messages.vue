<script setup lang="ts">
import { onMounted } from 'vue';
import MobileHeader from '@/components/MobileHeader.vue';
import MessageItem from '@/components/MessageItem.vue';
import MessageFilterTabs from '@/components/MessageFilterTabs.vue';
import { useMessageCenter } from '@/composables/useMessageCenter';
import type { MessageItem as MsgItem } from '@/platform/api';
import { go } from '@/platform/nav';

const { messages, activeFilter, loading, filtered, unreadCount, load, markAllRead, markRead } =
  useMessageCenter();

onMounted(load);

function onSelect(item: MsgItem): void {
  markRead(item.id);
  if (item.target) {
    // 详情页待建设（原逻辑：预留 target.type:id 深链）
    uni.showToast({ title: `详情页建设中（${item.target.type}:${item.target.id}）`, icon: 'none' });
  }
}

function onMarkAll(): void {
  markAllRead();
}
</script>

<template>
  <view class="mb-page msg-page">
    <MobileHeader variant="brand" title="消息中心" subtitle="茂名石化" />

    <MessageFilterTabs v-model="activeFilter" />

    <view class="msg-toolbar">
      <text v-if="unreadCount > 0" class="msg-toolbar__count">{{ unreadCount }} 条未读</text>
      <view class="msg-toolbar__spacer" />
      <view class="msg-toolbar__actions">
        <button type="button" class="mb-btn-ghost mb-btn-sm" @click="onMarkAll">批量已读</button>
        <view class="mb-btn-ghost mb-btn-sm" @click="go('/messages/history')"
          ><text>通知历史</text></view
        >
      </view>
    </view>

    <view class="msg-list">
      <text v-if="loading" class="msg-list__loading">加载中…</text>
      <view v-else-if="filtered.length === 0" class="msg-empty">
        <text class="msg-empty__title">暂无消息</text>
        <text class="msg-empty__hint">当前分类下没有消息</text>
      </view>
      <MessageItem v-for="item in filtered" :key="item.id" :item="item" @select="onSelect" />
    </view>
  </view>
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
  color: var(--danger-mobile);
}
.msg-toolbar__spacer {
  flex: 1;
}
.msg-toolbar__actions {
  display: flex;
  gap: var(--space-sm);
  align-items: center;
}
.mb-btn-ghost {
  font-size: var(--mb-fz-tip);
  color: var(--primary-mobile);
  background: transparent;
  border: none;
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
  padding: var(--mb-empty-pad) 0;
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
