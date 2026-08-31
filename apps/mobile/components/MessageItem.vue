<script setup lang="ts">
import { computed } from 'vue';
import type { Component } from 'vue';
import { Warning, InfoFilled, List, Bell } from '@element-plus/icons-vue';
import { CATEGORY_LABELS, type MessageItem } from '@/services/message';

const props = defineProps<{ item: MessageItem }>();
defineEmits<{ (e: 'select', item: MessageItem): void }>();

const META: Record<MessageItem['category'], { icon: Component; color: string; soft: string }> = {
  alarm: { icon: Warning, color: 'var(--mb-msg-alarm)', soft: 'var(--mb-msg-alarm-soft)' },
  event: { icon: InfoFilled, color: 'var(--mb-msg-event)', soft: 'var(--mb-msg-event-soft)' },
  task: { icon: List, color: 'var(--mb-msg-task)', soft: 'var(--mb-msg-task-soft)' },
  system: { icon: Bell, color: 'var(--mb-msg-system)', soft: 'var(--mb-msg-system-soft)' },
};

const meta = computed(() => META[props.item.category]);
const subTitle = computed(() => `${CATEGORY_LABELS[props.item.category]} · ${props.item.time}`);
</script>

<template>
  <button
    type="button"
    class="msg-card"
    :class="{ 'is-unread': !item.read, 'is-read': item.read }"
    @click="$emit('select', item)"
  >
    <span class="msg-card__icon" :style="{ background: meta.soft }">
      <component :is="meta.icon" class="msg-card__icon-svg" :style="{ color: meta.color }" />
    </span>
    <span class="msg-card__body">
      <span class="msg-card__title">{{ item.title }}</span>
      <span class="msg-card__sub">{{ subTitle }}</span>
    </span>
    <span v-if="!item.read" class="msg-card__dot" aria-label="未读" />
    <span class="msg-card__arrow" aria-hidden="true">›</span>
  </button>
</template>

<style scoped>
.msg-card {
  display: flex;
  align-items: center;
  gap: var(--mb-pad-x);
  width: 100%;
  min-height: var(--mb-row-h); /* 触控热区 48 */
  padding: 12px var(--mb-pad-x);
  background: var(--card-mobile);
  border: 1px solid var(--color-border);
  border-radius: var(--mb-radius-card);
  text-align: left;
  cursor: pointer;
  position: relative;
}

.msg-card.is-read {
  opacity: 0.6;
}

.msg-card__icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: var(--mb-radius-card);
  display: flex;
  align-items: center;
  justify-content: center;
}

.msg-card__icon-svg {
  width: 20px;
  height: 20px;
}

.msg-card__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.msg-card__title {
  font-size: var(--mb-fz-section);
  font-weight: 600;
  color: var(--text-title-mobile);
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.msg-card__sub {
  font-size: var(--mb-fz-tip);
  color: var(--text-muted-mobile);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.msg-card__dot {
  flex-shrink: 0;
  align-self: flex-start;
  margin-top: 6px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-danger);
}

.msg-card__arrow {
  flex-shrink: 0;
  color: var(--text-muted-mobile);
  font-size: 22px;
  line-height: 1;
}
</style>
