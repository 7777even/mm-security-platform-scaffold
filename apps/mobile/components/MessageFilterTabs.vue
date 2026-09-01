<script setup lang="ts">
import { CATEGORY_LABELS, MESSAGE_CATEGORIES } from '@/services/message';
import type { MsgFilter } from '../composables/useMessageCenter';

defineProps<{ modelValue: MsgFilter }>();
const emit = defineEmits<{ (e: 'update:modelValue', v: MsgFilter): void }>();

const TABS: { key: MsgFilter; label: string }[] = [
  { key: 'all', label: '全部' },
  ...MESSAGE_CATEGORIES.map((c) => ({ key: c as MsgFilter, label: CATEGORY_LABELS[c] })),
];

function select(key: MsgFilter) {
  emit('update:modelValue', key);
}
</script>

<template>
  <div class="filter-tabs">
    <button
      v-for="t in TABS"
      :key="t.key"
      type="button"
      class="mb-chip"
      :class="{ 'mb-chip--on': modelValue === t.key }"
      @click="select(t.key)"
    >
      {{ t.label }}
    </button>
  </div>
</template>

<style scoped>
.filter-tabs {
  display: flex;
  gap: var(--space-sm);
  overflow-x: auto;
  padding: 0 var(--mb-pad-x);
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Firefox 隐藏滚动条 */
}

.filter-tabs::-webkit-scrollbar {
  display: none; /* Chrome/Safari 隐藏滚动条 */
}
</style>
