<script setup lang="ts">
import { computed } from 'vue';
import PanelCard from '../common/PanelCard.vue';
import {
  rescueStrengthCategory,
  selectedRescueStrengthItem,
} from '../../lib/composables/useRescueStrengthView';

const item = computed(() => selectedRescueStrengthItem.value);

const rows = computed(() => {
  const it = item.value;
  if (!it) return [];
  return [
    { label: '资源类别', value: rescueStrengthCategory.value },
    { label: '名称', value: it.name },
    { label: '说明', value: it.meta || '—' },
  ];
});
</script>

<template>
  <PanelCard :title="item?.name ?? rescueStrengthCategory" variant="rescue" :show-more="false">
    <div v-if="item" class="strength-detail">
      <div v-for="row in rows" :key="row.label" class="detail-row">
        <span class="detail-row__label">{{ row.label }}</span>
        <span class="detail-row__value">{{ row.value }}</span>
      </div>
    </div>
    <div v-else class="strength-detail__empty">请选择左侧列表中的一项查看详情。</div>
  </PanelCard>
</template>

<style scoped>
.strength-detail {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  gap: 6px;
  overflow-y: auto;
}

.strength-detail__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 13px;
  color: var(--map-device-offline);
}

.detail-row {
  display: grid;
  grid-template-columns: 88px 1fr;
  gap: 8px;
  padding: 4px 0;
  border-bottom: 1px solid rgb(0 130 210 / 12%);
}

.detail-row__label {
  font-size: 12px;
  color: var(--map-device-offline);
}

.detail-row__value {
  font-size: 13px;
  color: var(--color-text-strong);
  line-height: 1.4;
  word-break: break-word;
}
</style>
