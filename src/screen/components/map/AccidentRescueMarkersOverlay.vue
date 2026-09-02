<script setup lang="ts">
import { computed } from 'vue';
import { useWorldMarkerScreenPositions } from '../../lib/composables/useCesiumScreenAnchor';
import { getSharedMap } from '../../lib/composables/sharedCesiumBridge';
import MapMarkerIcon, { type MapMarkerIconName } from './MapMarkerIcon.vue';
import type { MonitoringPoint } from '../../lib/data/monitoringPointsMock';
import type { EvacuationPerson } from '../../lib/data/evacuationPeopleMock';
import type { EmergencyDispatchResource } from '../../lib/data/accidentRescueMock';

interface LonLat {
  longitude: number;
  latitude: number;
}

const props = withDefaults(
  defineProps<{
    monitoringPoints?: MonitoringPoint[];
    evacuationPeople?: EvacuationPerson[];
    routeStart?: LonLat | null;
    routeEnd?: LonLat | null;
    focusedMonitoringId?: string | null;
    focusedPeopleId?: string | null;
    dispatchResource?: EmergencyDispatchResource | null;
  }>(),
  {
    monitoringPoints: () => [],
    evacuationPeople: () => [],
    routeStart: null,
    routeEnd: null,
    focusedMonitoringId: null,
    focusedPeopleId: null,
    dispatchResource: null,
  },
);

const emit = defineEmits<{
  'focus-monitoring': [point: MonitoringPoint];
  'focus-person': [person: EvacuationPerson];
}>();

function overlayHeight() {
  return getSharedMap()?.getBoundaryModelTopHeight?.() ?? 72.05;
}

const markerTargets = () => {
  const height = overlayHeight();
  const targets: Array<{
    key: string;
    longitude: number;
    latitude: number;
    height: number;
  }> = [];
  for (const p of props.monitoringPoints) {
    targets.push({ key: `mp-${p.id}`, longitude: p.longitude, latitude: p.latitude, height });
  }
  for (const p of props.evacuationPeople) {
    targets.push({ key: `evac-${p.id}`, longitude: p.longitude, latitude: p.latitude, height });
  }
  if (props.routeStart) {
    targets.push({
      key: 'route-start',
      longitude: props.routeStart.longitude,
      latitude: props.routeStart.latitude,
      height,
    });
  }
  if (props.routeEnd) {
    targets.push({
      key: 'route-end',
      longitude: props.routeEnd.longitude,
      latitude: props.routeEnd.latitude,
      height,
    });
  }
  if (props.dispatchResource) {
    targets.push({
      key: 'dispatch-resource',
      longitude: props.dispatchResource.longitude,
      latitude: props.dispatchResource.latitude,
      height,
    });
  }
  return targets;
};

const { styleFor } = useWorldMarkerScreenPositions(markerTargets, {
  scaleWithZoom: false,
});

const visibleMonitoringPoints = computed(() => props.monitoringPoints);
const visibleEvacuationPeople = computed(() => props.evacuationPeople);

function statusLabel(status: MonitoringPoint['status']) {
  if (status === 'alarm') return '告警';
  if (status === 'warning') return '预警';
  return '正常';
}

function statusTone(status: MonitoringPoint['status']) {
  if (status === 'alarm') return 'alarm';
  if (status === 'warning') return 'warning';
  return 'normal';
}

function monitoringIcon(category: string): MapMarkerIconName {
  const c = category.trim();
  if (c === 'DCS') return 'sensor-dcs';
  if (c === 'GDS') return 'sensor-gds';
  if (c === '气体检测') return 'sensor-gas';
  if (c === '压力') return 'sensor-pressure';
  if (c === '温度') return 'sensor-temperature';
  if (c === '液位') return 'sensor-liquid';
  return 'sensor-other';
}
</script>

<template>
  <div class="acc-markers">
    <div
      v-if="dispatchResource"
      class="acc-point-marker acc-point-marker--dispatch is-focused"
      :style="styleFor('dispatch-resource')"
      :title="dispatchResource.name"
    >
      <span class="acc-point-marker__label">
        <span class="acc-point-marker__status">资源</span>
        <span class="acc-point-marker__name">{{ dispatchResource.name }}</span>
      </span>
      <span class="acc-point-marker__pin" aria-hidden="true">◆</span>
      <span class="acc-point-marker__stem" aria-hidden="true" />
      <span class="acc-point-marker__breath" aria-hidden="true" />
    </div>
    <!-- 疏散路线：起点 / 终点 -->
    <div
      v-if="routeStart"
      class="acc-route-marker acc-route-marker--start"
      :style="styleFor('route-start')"
    >
      <span class="acc-route-marker__badge">起点</span>
      <span class="acc-route-marker__pin" aria-hidden="true" />
    </div>
    <div
      v-if="routeEnd"
      class="acc-route-marker acc-route-marker--end"
      :style="styleFor('route-end')"
    >
      <span class="acc-route-marker__badge">终点</span>
      <span class="acc-route-marker__pin" aria-hidden="true" />
    </div>

    <!-- 监测点位 -->
    <button
      v-for="p in visibleMonitoringPoints"
      :key="p.id"
      type="button"
      class="acc-point-marker acc-point-marker--monitoring"
      :class="[
        `acc-point-marker--${statusTone(p.status)}`,
        { 'is-focused': focusedMonitoringId === p.id },
      ]"
      :style="styleFor(`mp-${p.id}`)"
      :title="`${p.name} · ${statusLabel(p.status)}`"
      :aria-label="`${p.name} ${statusLabel(p.status)}`"
      @click="emit('focus-monitoring', p)"
    >
      <span class="acc-point-marker__label">
        <span class="acc-point-marker__status">{{ statusLabel(p.status) }}</span>
        <span class="acc-point-marker__name">{{ p.name }}</span>
      </span>
      <span class="acc-point-marker__pin" aria-hidden="true">
        <MapMarkerIcon :name="monitoringIcon(p.category)" />
      </span>
      <span class="acc-point-marker__stem" aria-hidden="true" />
      <span class="acc-point-marker__breath" aria-hidden="true" />
    </button>

    <!-- 疏散人员 -->
    <button
      v-for="p in visibleEvacuationPeople"
      :key="p.id"
      type="button"
      class="acc-point-marker acc-point-marker--person"
      :class="{ 'is-focused': focusedPeopleId === p.id }"
      :style="styleFor(`evac-${p.id}`)"
      :title="`${p.name} · ${p.org} ${p.job}`"
      :aria-label="p.name"
      @click="emit('focus-person', p)"
    >
      <span class="acc-point-marker__label">
        <span class="acc-point-marker__name">{{ p.name }}</span>
      </span>
      <span class="acc-point-marker__pin" aria-hidden="true">
        <MapMarkerIcon name="person" />
      </span>
      <span class="acc-point-marker__stem" aria-hidden="true" />
      <span class="acc-point-marker__breath" aria-hidden="true" />
    </button>
  </div>
</template>

<style scoped>
.acc-markers {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

/* ---------- 路线起终点 ---------- */
.acc-route-marker {
  position: absolute;
  z-index: var(--z-marker);
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: translate(-50%, -100%);
  pointer-events: none;
}

.acc-route-marker__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  height: 22px;
  padding: 0 8px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 2px;
  color: var(--color-text-strong);
  background: linear-gradient(180deg, rgb(10 44 80 / 96%), rgb(6 28 52 / 96%));
  border: 1px solid rgb(0 150 236 / 55%);
  box-shadow: 0 2px 10px rgb(0 0 0 / 35%);
}

.acc-route-marker--start .acc-route-marker__badge {
  border-color: rgb(72 199 142 / 75%);
  color: var(--map-route-green-light);
}

.acc-route-marker--end .acc-route-marker__badge {
  border-color: rgb(255 170 60 / 75%);
  color: var(--map-route-orange-light);
}

.acc-route-marker__pin {
  width: 14px;
  height: 14px;
  margin-top: 3px;
  border-radius: 50%;
  border: 2px solid rgb(255 255 255 / 92%);
  background: var(--map-marker-cyan);
  box-shadow: 0 0 10px rgb(55 207 255 / 50%);
}

.acc-route-marker--start .acc-route-marker__pin {
  background: var(--map-route-green);
  box-shadow: 0 0 10px rgb(71 199 142 / 50%);
}

.acc-route-marker--end .acc-route-marker__pin {
  background: var(--map-route-orange);
  box-shadow: 0 0 10px rgb(255 170 60 / 50%);
}

/* ---------- 监测点 / 疏散人员 ---------- */
.acc-point-marker {
  position: absolute;
  z-index: var(--z-marker);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  transform: translate(-50%, -100%);
  pointer-events: auto;
}

.acc-point-marker__label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  max-width: 180px;
  margin-bottom: 4px;
  padding: 2px 7px;
  border-radius: 2px;
  background: rgb(0 16 36 / 82%);
  border: 1px solid rgb(0 140 220 / 32%);
  box-shadow: 0 2px 8px rgb(0 0 0 / 30%);
  white-space: nowrap;
  overflow: hidden;
}

.acc-point-marker__status {
  flex-shrink: 0;
  padding: 0 5px;
  border-radius: 2px;
  font-size: 10px;
  line-height: 15px;
  color: var(--map-marker-ink);
  font-weight: 700;
}

.acc-point-marker__name {
  font-size: 11px;
  color: var(--map-layer-divider);
  overflow: hidden;
  text-overflow: ellipsis;
}

.acc-point-marker__pin {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid rgb(255 255 255 / 92%);
  color: var(--map-marker-ink);
  box-shadow: 0 0 12px rgb(55 207 255 / 40%);
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.acc-point-marker__pin :deep(.map-marker-icon) {
  width: 17px;
  height: 17px;
}

.acc-point-marker__stem {
  width: 2px;
  height: 16px;
  margin-top: -1px;
  background: linear-gradient(180deg, rgb(55 207 255 / 85%), rgb(55 207 255 / 0%));
}

.acc-point-marker__breath {
  width: 8px;
  height: 8px;
  margin-top: -2px;
  border-radius: 50%;
  background: rgb(55 207 255 / 95%);
  box-shadow: 0 0 10px rgb(55 207 255 / 45%);
  animation: acc-point-breath 1.9s ease-in-out infinite;
}

.acc-point-marker:hover .acc-point-marker__pin {
  transform: scale(1.1);
}

.acc-point-marker.is-focused .acc-point-marker__pin {
  transform: scale(1.18);
  box-shadow: 0 0 18px rgb(255 213 74 / 75%);
  border-color: #ffd54a;
}

.acc-point-marker.is-focused .acc-point-marker__label {
  border-color: rgb(255 213 74 / 65%);
}

/* 状态色 */
.acc-point-marker--normal .acc-point-marker__pin,
.acc-point-marker--person .acc-point-marker__pin {
  background: #33d6ff;
  box-shadow: 0 0 12px rgb(51 214 255 / 40%);
}

.acc-point-marker--normal .acc-point-marker__stem,
.acc-point-marker--person .acc-point-marker__stem {
  background: linear-gradient(180deg, rgb(51 214 255 / 85%), rgb(51 214 255 / 0%));
}

.acc-point-marker--normal .acc-point-marker__breath,
.acc-point-marker--person .acc-point-marker__breath {
  background: rgb(51 214 255 / 95%);
  box-shadow: 0 0 10px rgb(51 214 255 / 45%);
}

.acc-point-marker--normal .acc-point-marker__status {
  background: #33d6ff;
}

.acc-point-marker--dispatch {
  pointer-events: none;
}

.acc-point-marker--dispatch .acc-point-marker__pin {
  background: #16c7ff;
  color: var(--color-text-strong);
  font-size: 13px;
}

.acc-point-marker--dispatch .acc-point-marker__status {
  background: #16c7ff;
}

.acc-point-marker--dispatch .acc-point-marker__stem {
  background: linear-gradient(180deg, rgb(22 199 255 / 90%), rgb(22 199 255 / 0%));
}

.acc-point-marker--dispatch .acc-point-marker__breath {
  background: #16c7ff;
  box-shadow: 0 0 14px rgb(22 199 255 / 70%);
}

.acc-point-marker--warning .acc-point-marker__pin {
  background: var(--color-warning);
  box-shadow: 0 0 12px rgb(255 176 32 / 45%);
}

.acc-point-marker--warning .acc-point-marker__stem {
  background: linear-gradient(180deg, rgb(255 176 32 / 90%), rgb(255 176 32 / 0%));
}

.acc-point-marker--warning .acc-point-marker__breath {
  background: rgb(255 176 32 / 95%);
  box-shadow: 0 0 10px rgb(255 176 32 / 45%);
}

.acc-point-marker--warning .acc-point-marker__status {
  background: var(--color-warning);
}

.acc-point-marker--alarm .acc-point-marker__pin {
  background: var(--color-danger);
  box-shadow: 0 0 14px rgb(255 77 79 / 55%);
}

.acc-point-marker--alarm .acc-point-marker__stem {
  background: linear-gradient(180deg, rgb(255 77 79 / 90%), rgb(255 77 79 / 0%));
}

.acc-point-marker--alarm .acc-point-marker__breath {
  background: rgb(255 77 79 / 95%);
  box-shadow: 0 0 12px rgb(255 77 79 / 55%);
}

.acc-point-marker--alarm .acc-point-marker__status {
  background: var(--color-danger);
}

@keyframes acc-point-breath {
  0%,
  100% {
    transform: scale(0.9);
    opacity: 0.75;
  }

  50% {
    transform: scale(1.2);
    opacity: 1;
  }
}
</style>
