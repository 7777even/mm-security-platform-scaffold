<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import type {
  ProductionAreaMetric,
  ProductionAreaZone,
} from '../../../lib/data/productionAreaMock';

const props = defineProps<{
  zones: ProductionAreaZone[];
  activeZoneId: string;
  metrics: ProductionAreaMetric[];
}>();

const emit = defineEmits<{
  'update:activeZoneId': [id: string];
}>();

const open = ref(false);
const rootRef = ref<HTMLElement | null>(null);

const activeZone = computed(
  () => props.zones.find((z) => z.id === props.activeZoneId) ?? props.zones[0],
);

function selectZone(id: string) {
  emit('update:activeZoneId', id);
  open.value = false;
}

function onDocClick(event: MouseEvent) {
  if (!open.value) return;
  const target = event.target as Node;
  if (rootRef.value?.contains(target)) return;
  open.value = false;
}

onMounted(() => {
  document.addEventListener('click', onDocClick);
});

onUnmounted(() => {
  document.removeEventListener('click', onDocClick);
});
</script>

<template>
  <section class="area-top">
    <div ref="rootRef" class="area-top__zone">
      <button type="button" class="area-top__zone-btn" @click.stop="open = !open">
        <span class="area-top__zone-name">{{ activeZone?.name ?? '区域' }}</span>
        <span v-if="activeZone?.alarmCount" class="area-top__badge">{{
          activeZone.alarmCount
        }}</span>
        <span
          class="area-top__caret"
          :class="{ 'area-top__caret--open': open }"
          aria-hidden="true"
        />
      </button>

      <div v-if="open" class="area-top__menu">
        <button
          v-for="zone in zones"
          :key="zone.id"
          type="button"
          class="area-top__menu-item"
          :class="{ 'area-top__menu-item--active': zone.id === activeZoneId }"
          @click="selectZone(zone.id)"
        >
          <span>{{ zone.name }}</span>
          <span v-if="zone.alarmCount" class="area-top__badge">{{ zone.alarmCount }}</span>
        </button>
      </div>
    </div>

    <div class="area-top__metrics">
      <div v-for="metric in metrics" :key="metric.id" class="area-metric">
        <div class="area-metric__label">{{ metric.label }}</div>
        <div class="area-metric__value">{{ metric.value }}</div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.area-top {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  pointer-events: auto;
}

.area-top__zone {
  position: relative;
  flex-shrink: 0;
  padding-top: 6px;
}

.area-top__zone-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  padding: 0 12px;
  border: 1px solid rgb(0 150 230 / 40%);
  border-radius: 2px;
  background: rgb(0 22 48 / 72%);
  color: #e8f4ff;
  font-size: 16px;
  font-family: var(--font-body);
  cursor: pointer;
}

.area-top__zone-name {
  font-weight: 500;
  white-space: nowrap;
}

.area-top__badge {
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  background: var(--color-alarm-3);
  color: #1a1200;
  font-size: 11px;
  font-weight: 700;
  line-height: 18px;
  text-align: center;
}

.area-top__caret {
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 6px solid rgb(200 220 240 / 85%);
  transition: transform 0.18s ease;
}

.area-top__caret--open {
  transform: rotate(180deg);
}

.area-top__menu {
  position: absolute;
  left: 0;
  top: calc(100% + 6px);
  min-width: 160px;
  padding: 6px;
  border: 1px solid rgb(0 140 220 / 35%);
  border-radius: 2px;
  background: rgb(0 18 40 / 96%);
  box-shadow: 0 8px 24px rgb(0 0 0 / 35%);
  z-index: var(--z-overlay);
}

.area-top__menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  height: 32px;
  padding: 0 10px;
  border: none;
  border-radius: 2px;
  background: transparent;
  color: #c8d8ec;
  font-size: 13px;
  font-family: var(--font-body);
  cursor: pointer;
}

.area-top__menu-item:hover,
.area-top__menu-item--active {
  background: rgb(0 90 160 / 35%);
  color: var(--color-text-strong);
}

.area-top__metrics {
  flex: 1;
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  grid-template-rows: repeat(2, 54px);
  gap: 8px;
}

.area-metric {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  padding: 0 12px;
  border: 1px solid rgb(0 130 210 / 28%);
  border-radius: 2px;
  background: rgb(0 20 45 / 62%);
}

.area-metric__label {
  font-size: 12px;
  color: var(--map-device-offline);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.area-metric__value {
  font-size: 20px;
  font-weight: 700;
  color: #7cdbff;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
</style>
