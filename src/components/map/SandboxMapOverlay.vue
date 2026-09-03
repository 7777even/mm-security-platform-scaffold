<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import {
  getSharedMap,
  onSharedMapReady,
  sharedMapReady,
  type SharedCesiumMapExpose,
} from '@/composables/sharedCesiumBridge';
import {
  SANDBOX_TOOLS,
  useSandboxScene,
  type SandboxCircleItem,
  type SandboxLineItem,
  type SandboxPointItem,
} from '@/composables/useSandboxScene';

const props = defineProps<{
  center: { longitude: number; latitude: number };
}>();

const sandbox = useSandboxScene();

interface ProjectedPos {
  x: number;
  y: number;
  scale: number;
}

const positions = ref<Record<string, ProjectedPos | null>>({});
const linePoints = ref<Record<string, string>>({});
const circlePoints = ref<Record<string, string>>({});
const plumePoints = ref('');

let removeRenderListener: (() => void) | null = null;
let offReady: (() => void) | null = null;

function offsetMeters(
  longitude: number,
  latitude: number,
  eastMeters: number,
  northMeters: number,
) {
  const latRad = (latitude * Math.PI) / 180;
  const dLat = northMeters / 110540;
  const dLon = eastMeters / (111320 * Math.cos(latRad));
  return { longitude: longitude + dLon, latitude: latitude + dLat };
}

function project(map: SharedCesiumMapExpose, longitude: number, latitude: number, height = 0) {
  const pos = map.worldToScreen?.(longitude, latitude, height);
  if (!pos) return null;
  const scale = map.getMarkerUiScale?.(longitude, latitude, height) ?? 1;
  return { x: pos.x, y: pos.y, scale };
}

function buildCircleGroundPoints(item: SandboxCircleItem) {
  const count = 48;
  const points: Array<{ longitude: number; latitude: number }> = [];
  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * Math.PI * 2;
    const east = Math.sin(angle) * item.radiusMeters;
    const north = Math.cos(angle) * item.radiusMeters;
    points.push(offsetMeters(item.longitude, item.latitude, east, north));
  }
  return points;
}

function buildPlumeGroundPoints() {
  const { plumeParams, plumeRunning } = sandbox;
  if (!plumeRunning.value) return [];
  const { center } = props;
  const bearing = plumeParams.windDirectionDeg + 180;
  const dirRad = (bearing * Math.PI) / 180;
  const perpEast = Math.cos(dirRad);
  const perpNorth = -Math.sin(dirRad);
  const forwardEast = Math.sin(dirRad);
  const forwardNorth = Math.cos(dirRad);
  const length = 700 + plumeParams.leakRate * 45 + plumeParams.windSpeed * 90;
  const width = 220 + plumeParams.windSpeed * 55;
  const srcWidth = 120 + plumeParams.windSpeed * 20;

  const at = (forwardRatio: number, perpRatio: number) =>
    offsetMeters(
      center.longitude,
      center.latitude,
      forwardEast * length * forwardRatio + perpEast * width * perpRatio,
      forwardNorth * length * forwardRatio + perpNorth * width * perpRatio,
    );

  return [
    at(0, -srcWidth / 2 / width),
    at(0.35, -0.5),
    at(0.75, -0.9),
    at(1, 0),
    at(0.75, 0.9),
    at(0.35, 0.5),
    at(0, srcWidth / 2 / width),
  ];
}

function estimateMetersPerPixel(map: SharedCesiumMapExpose): number | null {
  const { center } = props;
  const a = map.worldToScreen?.(center.longitude, center.latitude, 0);
  const b = map.worldToScreen?.(center.longitude + 0.001, center.latitude, 0);
  if (!a || !b) return null;
  const px = Math.hypot(b.x - a.x, b.y - a.y);
  if (px < 1) return null;
  const meters = 0.001 * 111320 * Math.cos((center.latitude * Math.PI) / 180);
  return meters / px;
}

function updateAll(map: SharedCesiumMapExpose) {
  const next: Record<string, ProjectedPos | null> = {};
  const nextLines: Record<string, string> = {};
  const nextCircles: Record<string, string> = {};

  for (const item of sandbox.items.value) {
    if (item.kind === 'cmd-node' || item.kind === 'fire-truck' || item.kind === 'medical-point') {
      next[item.id] = project(map, item.longitude, item.latitude);
    } else if (item.kind === 'evac-route' || item.kind === 'water-curtain') {
      const line = item as SandboxLineItem;
      const parts: string[] = [];
      for (const point of line.points) {
        const pos = project(map, point.longitude, point.latitude);
        if (pos) parts.push(`${pos.x.toFixed(1)},${pos.y.toFixed(1)}`);
      }
      nextLines[item.id] = parts.join(' ');
    } else {
      const circle = item as SandboxCircleItem;
      const parts: string[] = [];
      for (const point of buildCircleGroundPoints(circle)) {
        const pos = project(map, point.longitude, point.latitude);
        if (pos) parts.push(`${pos.x.toFixed(1)},${pos.y.toFixed(1)}`);
      }
      nextCircles[item.id] = parts.join(' ');
    }
  }

  const plumeGround = buildPlumeGroundPoints();
  const plumeParts: string[] = [];
  for (const point of plumeGround) {
    const pos = project(map, point.longitude, point.latitude);
    if (pos) plumeParts.push(`${pos.x.toFixed(1)},${pos.y.toFixed(1)}`);
  }
  plumePoints.value = plumeParts.join(' ');

  positions.value = next;
  linePoints.value = nextLines;
  circlePoints.value = nextCircles;
}

function attach(map: SharedCesiumMapExpose | null = getSharedMap()) {
  removeRenderListener?.();
  removeRenderListener = map?.addRenderListener?.(() => updateAll(map)) ?? null;
  if (map) updateAll(map);
}

function detach() {
  removeRenderListener?.();
  removeRenderListener = null;
  positions.value = {};
  linePoints.value = {};
  circlePoints.value = {};
  plumePoints.value = '';
}

onMounted(() => {
  if (sharedMapReady.value) {
    attach(getSharedMap());
  }
  offReady = onSharedMapReady((map) => attach(map));
});

onUnmounted(() => {
  offReady?.();
  offReady = null;
  detach();
});

const visiblePointItems = computed(
  () =>
    sandbox.items.value.filter(
      (item) =>
        item.kind === 'cmd-node' || item.kind === 'fire-truck' || item.kind === 'medical-point',
    ) as SandboxPointItem[],
);

const visibleLineItems = computed(() => {
  const items = sandbox.items.value.filter(
    (item) => item.kind === 'evac-route' || item.kind === 'water-curtain',
  ) as SandboxLineItem[];
  return items.filter((item) => {
    if (item.kind === 'evac-route') return sandbox.layerToggles.evacuationRoutes;
    return true;
  });
});

const visibleCircleItems = computed(
  () =>
    sandbox.items.value.filter(
      (item) => item.kind === 'isolation-circle' && sandbox.layerToggles.isolationCircle,
    ) as SandboxCircleItem[],
);

const showPlume = computed(() => sandbox.plumeRunning.value && sandbox.layerToggles.plumeModel);

const activeToolMeta = computed(() =>
  sandbox.activeTool.value
    ? SANDBOX_TOOLS.find((tool) => tool.kind === sandbox.activeTool.value)
    : null,
);

function pointIcon(kind: SandboxPointItem['kind']): string {
  if (kind === 'cmd-node') return '⌘';
  if (kind === 'fire-truck') return '🚒';
  return '🚑';
}

function handleOverlayClick(event: MouseEvent) {
  const map = getSharedMap();
  const tool = sandbox.activeTool.value;
  if (!map || !tool) return;
  const mpp = estimateMetersPerPixel(map);
  const centerScreen = map.worldToScreen?.(props.center.longitude, props.center.latitude, 0);
  if (mpp === null || !centerScreen) return;

  const dx = event.clientX - centerScreen.x;
  const dy = event.clientY - centerScreen.y;
  const eastMeters = dx * mpp;
  const northMeters = -dy * mpp;
  const target = offsetMeters(
    props.center.longitude,
    props.center.latitude,
    eastMeters,
    northMeters,
  );

  const { addSandboxItem } = sandbox;
  if (tool === 'cmd-node') {
    addSandboxItem({
      kind: 'cmd-node',
      label: '现场指挥部',
      longitude: target.longitude,
      latitude: target.latitude,
    });
  } else if (tool === 'fire-truck') {
    addSandboxItem({
      kind: 'fire-truck',
      label: '消防车/水炮',
      longitude: target.longitude,
      latitude: target.latitude,
    });
  } else if (tool === 'medical-point') {
    addSandboxItem({
      kind: 'medical-point',
      label: '医疗救护点',
      longitude: target.longitude,
      latitude: target.latitude,
    });
  } else if (tool === 'isolation-circle') {
    addSandboxItem({
      kind: 'isolation-circle',
      label: '防爆警戒圈',
      longitude: target.longitude,
      latitude: target.latitude,
      radiusMeters: 220,
    });
  } else if (tool === 'evac-route') {
    addSandboxItem({
      kind: 'evac-route',
      label: '疏散避险路线',
      points: [
        { longitude: props.center.longitude, latitude: props.center.latitude },
        { longitude: target.longitude, latitude: target.latitude },
      ],
    });
  } else if (tool === 'water-curtain') {
    const angle = Math.atan2(dy, dx);
    const perpAngle = angle + Math.PI / 2;
    const a = offsetMeters(
      target.longitude,
      target.latitude,
      Math.cos(perpAngle) * 140,
      -Math.sin(perpAngle) * 140,
    );
    const b = offsetMeters(
      target.longitude,
      target.latitude,
      -Math.cos(perpAngle) * 140,
      Math.sin(perpAngle) * 140,
    );
    addSandboxItem({
      kind: 'water-curtain',
      label: '水幕隔离带',
      points: [a, b],
    });
  }
}
</script>

<template>
  <div
    class="sandbox-overlay"
    :class="{ 'sandbox-overlay--drawing': sandbox.activeTool.value }"
    @click="handleOverlayClick"
  >
    <svg class="sandbox-overlay__svg">
      <defs>
        <linearGradient id="sandbox-plume-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color: var(--accent-gold)" stop-opacity="0.08" />
          <stop offset="55%" style="stop-color: var(--accent-gold)" stop-opacity="0.5" />
          <stop offset="100%" style="stop-color: var(--map-plume)" stop-opacity="0.08" />
        </linearGradient>
      </defs>

      <g v-if="showPlume && plumePoints" class="sandbox-plume">
        <polygon
          :points="plumePoints"
          fill="url(#sandbox-plume-grad)"
          style="stroke: color-mix(in srgb, var(--map-plume) 85%, white)"
          stroke-width="1.4"
          stroke-dasharray="7 4"
        />
        <circle
          :cx="plumePoints.split(' ')[0]?.split(',')[0]"
          :cy="plumePoints.split(' ')[0]?.split(',')[1]"
          r="5"
          style="fill: var(--map-plume)"
          opacity="0.9"
        />
      </g>

      <g v-for="item in visibleCircleItems" :key="item.id" class="sandbox-circle">
        <polygon
          v-if="circlePoints[item.id]"
          :points="circlePoints[item.id]"
          style="
            fill: color-mix(in srgb, var(--map-danger-deep) 16%, transparent);
            stroke: var(--map-danger-deep);
          "
          stroke-width="1.6"
          stroke-dasharray="10 6"
        />
      </g>

      <g v-for="item in visibleLineItems" :key="item.id" class="sandbox-line">
        <polyline
          v-if="linePoints[item.id]"
          :points="linePoints[item.id]"
          fill="none"
          :style="
            item.kind === 'water-curtain'
              ? 'stroke: var(--accent-cyan)'
              : 'stroke: var(--color-success)'
          "
          stroke-width="3"
          stroke-dasharray="12 6"
          stroke-linecap="round"
          opacity="0.95"
        />
      </g>
    </svg>

    <button
      v-for="item in visiblePointItems"
      :key="item.id"
      type="button"
      class="sandbox-marker"
      :class="`sandbox-marker--${item.kind}`"
      :style="
        positions[item.id]
          ? {
              left: `${positions[item.id]!.x}px`,
              top: `${positions[item.id]!.y}px`,
              transform: `translate(-50%, -100%) scale(${positions[item.id]!.scale})`,
            }
          : undefined
      "
      @click.stop
    >
      <span class="sandbox-marker__icon">{{ pointIcon(item.kind) }}</span>
      <span class="sandbox-marker__label">{{ item.label }}</span>
    </button>

    <div v-if="activeToolMeta" class="sandbox-hint">
      <span class="sandbox-hint__dot" />
      <span>
        当前标绘工具：<strong>{{ activeToolMeta.label }}</strong> —— 点击地图放置
      </span>
    </div>
  </div>
</template>

<style scoped>
.sandbox-overlay {
  position: absolute;
  inset: 0;
  z-index: var(--z-local-4);
  pointer-events: auto;
  cursor: default;
}

.sandbox-overlay--drawing {
  cursor: crosshair;
}

.sandbox-overlay__svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
}

.sandbox-plume {
  animation: sandbox-plume-pulse 2.6s ease-in-out infinite;
}

.sandbox-circle polygon {
  animation: sandbox-circle-pulse 2s ease-in-out infinite;
}

.sandbox-line polyline {
  filter: drop-shadow(0 0 5px color-mix(in srgb, var(--color-accent) 55%, transparent));
}

.sandbox-marker {
  position: absolute;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-height: 26px;
  padding: 3px 9px 3px 6px;
  border: 1px solid color-mix(in srgb, var(--map-border) 50%, transparent);
  border-radius: 4px;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--color-panel) 94%, transparent),
    color-mix(in srgb, var(--color-panel) 94%, transparent)
  );
  color: var(--color-text);
  font-size: 11px;
  font-family: var(--font-body);
  white-space: nowrap;
  box-shadow: 0 4px 12px rgb(0 0 0 / 42%);
  transform-origin: 50% 100%;
  cursor: grab;
  z-index: var(--z-local-3);
}

.sandbox-marker__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 3px;
  background: color-mix(in srgb, var(--map-border) 30%, transparent);
  font-size: 11px;
  line-height: 1;
}

.sandbox-marker--cmd-node .sandbox-marker__icon {
  color: color-mix(in srgb, var(--map-marker-cyan) 70%, white);
}

.sandbox-marker--fire-truck .sandbox-marker__icon {
  color: color-mix(in srgb, var(--color-danger) 70%, white);
}

.sandbox-marker--medical-point .sandbox-marker__icon {
  color: var(--color-success);
}

.sandbox-hint {
  position: absolute;
  top: 18px;
  left: 50%;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 34px;
  padding: 0 16px;
  border: 1px solid color-mix(in srgb, var(--map-border) 45%, transparent);
  border-radius: 6px;
  background: color-mix(in srgb, var(--color-bg) 92%, transparent);
  color: var(--color-text);
  font-size: 12px;
  box-shadow: 0 8px 24px rgb(0 0 0 / 40%);
  pointer-events: none;
  z-index: var(--z-marker);
}

.sandbox-hint__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-accent);
  box-shadow: 0 0 8px color-mix(in srgb, var(--color-accent) 85%, transparent);
  animation: sandbox-circle-pulse 1.5s ease-in-out infinite;
}

@keyframes sandbox-plume-pulse {
  0%,
  100% {
    opacity: 0.72;
  }

  50% {
    opacity: 1;
  }
}

@keyframes sandbox-circle-pulse {
  0%,
  100% {
    opacity: 0.75;
  }

  50% {
    opacity: 1;
  }
}
</style>
