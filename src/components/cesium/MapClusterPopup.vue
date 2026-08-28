<script setup lang="ts">
import type { ClusterPickInfo } from '@/services/cesium-cluster';

const props = defineProps<{ info: ClusterPickInfo }>();
const emit = defineEmits<{ close: [] }>();

const isCluster = props.info.kind === 'cluster';
</script>

<template>
  <div class="cluster-popup" data-test="cluster-popup">
    <button class="cluster-popup__close" title="关闭" @click="emit('close')">×</button>
    <div class="cluster-popup__title">
      {{ isCluster ? `聚合点位 (${info.items.length})` : (info.items[0]?.name ?? '点位') }}
    </div>
    <ul v-if="isCluster" class="cluster-popup__list">
      <li v-for="(it, i) in info.items" :key="i" class="cluster-popup__item">
        <span class="cluster-popup__dot" />
        <span class="cluster-popup__name">{{ it.name }}</span>
      </li>
    </ul>
    <div v-else class="cluster-popup__rows">
      <div class="cluster-popup__row">ID：{{ info.items[0]?.id }}</div>
      <div class="cluster-popup__row">类型：{{ info.items[0]?.type ?? '点位' }}</div>
    </div>
  </div>
</template>

<style scoped>
.cluster-popup {
  position: absolute;
  z-index: var(--z-overlay);
  min-width: 180px;
  max-width: 260px;
  padding: 10px 12px;
  background: color-mix(in srgb, var(--color-panel) 92%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-accent) 55%, transparent);
  border-radius: 8px;
  color: var(--color-text);
  font-size: var(--font-size-helper);
  box-shadow: 0 8px 24px rgb(0 0 0 / 40%);
  transform: translate(-50%, calc(-100% - 16px));
}

.cluster-popup__close {
  position: absolute;
  top: 4px;
  right: 6px;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: var(--font-size-h2);
  line-height: 1;
  cursor: pointer;
}

.cluster-popup__title {
  font-size: var(--font-size-stat-label);
  font-weight: 600;
  margin-bottom: 6px;
  padding-right: 14px;
  color: var(--color-text-strong);
}

.cluster-popup__list {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 200px;
  overflow: auto;
}

.cluster-popup__item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 0;
  line-height: 1.6;
}

.cluster-popup__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-accent);
  flex: none;
}

.cluster-popup__name {
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cluster-popup__rows {
  line-height: 1.8;
  color: var(--color-text-muted);
}
</style>
