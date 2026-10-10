<script setup lang="ts">
import type { MessageFilter } from '@/composables/useMessageCenter';

defineProps<{ modelValue: MessageFilter }>();
const emit = defineEmits<{ (e: 'update:modelValue', v: MessageFilter): void }>();

const tabs: { key: MessageFilter; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'unread', label: '未读' },
  { key: 'alarm', label: '告警' },
  { key: 'event', label: '事件' },
  { key: 'task', label: '任务' },
  { key: 'system', label: '系统' },
];

function onTap(k: MessageFilter): void {
  emit('update:modelValue', k);
}
</script>

<template>
  <view class="msg-tabs">
    <view
      v-for="t in tabs"
      :key="t.key"
      class="msg-tabs__item"
      :class="{ active: modelValue === t.key }"
      @click="onTap(t.key)"
    >
      {{ t.label }}
    </view>
  </view>
</template>

<style scoped>
.msg-tabs {
  display: flex;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--mb-pad-x);
}

.msg-tabs__item {
  padding: 6rpx 24rpx;
  font-size: var(--mb-fz-tip);
  color: var(--text-muted-mobile);
  background: #eef1f6;
  border-radius: 999rpx;
}

.msg-tabs__item.active {
  color: #fff;
  background: var(--primary-mobile);
}
</style>
