<script setup lang="ts">
import { computed } from 'vue';
import type { PickResult, ZonePick } from '@/services/cesium';

/** 地图拾取详情面板：统一展示报警/设备点位与风险分区信息，token 化样式。 */
const props = withDefaults(
  defineProps<{
    point: PickResult | ZonePick | null;
  }>(),
  { point: null },
);

const emit = defineEmits<{ close: [] }>();

const kindLabel = computed(() => {
  const p = props.point;
  if (!p) return '';
  if ('kind' in p) return p.kind === 'alarm' ? '报警点' : '设备点';
  return '风险分区';
});

const rows = computed<{ label: string; value: string }[]>(() => {
  const p = props.point;
  if (!p) return [];
  if ('kind' in p) {
    const rows: { label: string; value: string }[] = [];
    if (p.level !== undefined) rows.push({ label: '等级', value: String(p.level) });
    if (p.status) rows.push({ label: '状态', value: p.status });
    rows.push({ label: 'ID', value: p.id });
    return rows;
  }
  return [{ label: '风险评分', value: p.score.toFixed(1) }];
});
</script>

<template>
  <div v-if="point" class="map-detail" data-test="map-detail">
    <button class="map-detail__close" title="关闭" @click="emit('close')">×</button>
    <div class="map-detail__title">{{ point.name }}</div>
    <div class="map-detail__kind">{{ kindLabel }}</div>
    <div v-for="row in rows" :key="row.label" class="map-detail__row">
      <span class="map-detail__label">{{ row.label }}</span>
      <span class="map-detail__value">{{ row.value }}</span>
    </div>
  </div>
</template>

<style scoped>
.map-detail {
  position: absolute;
  left: var(--space-md);
  bottom: var(--space-md);
  z-index: 30;
  width: 248px;
  padding: var(--space-md);
  border-radius: var(--radius-md);
  background: rgb(19 35 60 / 88%);
  border: 1px solid var(--color-accent-faint);
  box-shadow: 0 6px 24px rgb(0 0 0 / 35%);
  color: var(--color-text-strong);
  backdrop-filter: blur(6px);
}

.map-detail__close {
  position: absolute;
  top: 6px;
  right: 8px;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 16px;
  cursor: pointer;
  line-height: 1;
}

.map-detail__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-strong);
  margin-bottom: 2px;
  padding-right: 16px;
}

.map-detail__kind {
  font-size: 12px;
  color: var(--color-accent);
  margin-bottom: var(--space-sm);
}

.map-detail__row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  padding: 3px 0;
  border-top: 1px solid rgb(255 255 255 / 6%);
}

.map-detail__label {
  color: var(--color-text-muted);
}

.map-detail__value {
  color: var(--color-text-strong);
}
</style>
