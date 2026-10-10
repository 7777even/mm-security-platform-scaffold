<script setup lang="ts">
import type { MessageItem } from '@/platform/api';

defineProps<{ item: MessageItem }>();
const emit = defineEmits<{ (e: 'select', item: MessageItem): void }>();
</script>

<template>
  <view class="msg-item" :class="{ 'msg-item--unread': !item.read }" @click="emit('select', item)">
    <view v-if="!item.read" class="msg-item__dot" />
    <view class="msg-item__body">
      <text class="msg-item__title">{{ item.title }}</text>
      <text v-if="item.summary" class="msg-item__content">{{ item.summary }}</text>
    </view>
  </view>
</template>

<style scoped>
.msg-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  padding: var(--space-md);
  background: var(--card-mobile);
  border: var(--mb-border-w) solid var(--mb-stroke);
  border-radius: var(--mb-radius-card);
}

.msg-item--unread {
  border-left: 6rpx solid var(--primary-mobile);
}

.msg-item__dot {
  width: 16rpx;
  height: 16rpx;
  margin-top: 12rpx;
  border-radius: 50%;
  background: var(--primary-mobile);
}

.msg-item__body {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.msg-item__title {
  font-size: var(--mb-fz-form-label);
  font-weight: 600;
  color: var(--text-title-mobile);
}

.msg-item__content {
  font-size: var(--mb-fz-tip);
  color: var(--text-muted-mobile);
}
</style>
