<script setup lang="ts">
import { computed } from 'vue';
import { useWorldMarkerScreenPositions } from '../../lib/composables/useCesiumScreenAnchor';
import { getSharedMap } from '../../lib/composables/sharedCesiumBridge';
import { type MapMarkerIconName } from '@/components/map/MapMarkerIcon.vue';
import MapPointMarker, { type MapPointTone } from '@/components/map/MapPointMarker.vue';
import type { MonitoringPoint } from '@/services/hazard';
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

/** 监测点状态 → 公共点位色调（色调 token 收口在 MapPointMarker） */
function toneOf(status: MonitoringPoint['status']): MapPointTone {
  if (status === 'alarm') return 'danger';
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
    <MapPointMarker
      v-if="dispatchResource"
      class="acc-point-marker acc-point-marker--dispatch"
      :style="styleFor('dispatch-resource')"
      pin-text="◆"
      tone="normal"
      status="资源"
      :name="dispatchResource.name"
      :title="dispatchResource.name"
      active
      :pin-size="28"
      :icon-size="17"
    />
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
    <MapPointMarker
      v-for="p in visibleMonitoringPoints"
      :key="p.id"
      class="acc-point-marker acc-point-marker--monitoring"
      :style="styleFor(`mp-${p.id}`)"
      :icon="monitoringIcon(p.category)"
      :tone="toneOf(p.status)"
      :status="statusLabel(p.status)"
      :name="p.name"
      :title="`${p.name} · ${statusLabel(p.status)}`"
      :aria-label="`${p.name} ${statusLabel(p.status)}`"
      :active="focusedMonitoringId === p.id"
      interactive
      :pin-size="28"
      :icon-size="17"
      @activate="emit('focus-monitoring', p)"
    />

    <!-- 疏散人员 -->
    <MapPointMarker
      v-for="p in visibleEvacuationPeople"
      :key="p.id"
      class="acc-point-marker acc-point-marker--person"
      :style="styleFor(`evac-${p.id}`)"
      icon="person"
      tone="normal"
      :name="p.name"
      :title="`${p.name} · ${p.org} ${p.job}`"
      :aria-label="p.name"
      :active="focusedPeopleId === p.id"
      interactive
      :pin-size="28"
      :icon-size="17"
      @activate="emit('focus-person', p)"
    />
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
</style>
