import { onMounted, onUnmounted, ref } from 'vue';
import { getSharedMap, onSharedMapReady, sharedMapReady } from './sharedCesiumBridge';

export interface TvInspectionCircleView {
  id: string;
  variant: number;
  longitude: number;
  latitude: number;
  radiusMeters: number;
  height: number;
}

function circlesSignature(items: TvInspectionCircleView[]) {
  return items
    .map((item) =>
      [item.id, item.longitude, item.latitude, item.radiusMeters, item.height].join(':'),
    )
    .join('|');
}

function screenPosChanged(
  prev: { x: number; y: number } | null | undefined,
  next: { x: number; y: number } | null | undefined,
  threshold = 0.5,
) {
  if (!prev && !next) return false;
  if (!prev || !next) return true;
  return Math.abs(prev.x - next.x) > threshold || Math.abs(prev.y - next.y) > threshold;
}

export function useTvInspectionCircles(requestedRadiusMeters = 332) {
  const circles = ref<TvInspectionCircleView[]>([]);
  const screenPositions = ref<Record<string, { x: number; y: number } | null>>({});

  let removeListener: (() => void) | null = null;
  let offReady: (() => void) | null = null;
  let lastAppliedSignature = '';

  /** 仅同步圆心与 HTML 锚点；Cesium 实体由地图 watch / tryApplyTvInspectionCircles 管理 */
  function refresh(map = getSharedMap()) {
    const computed = map?.getTvInspectionCircles?.(requestedRadiusMeters) ?? [];
    const nextCircles = computed.map((circle, index) => ({
      id: circle.id,
      variant: circle.variant ?? index,
      longitude: circle.longitude,
      latitude: circle.latitude,
      radiusMeters: circle.radiusMeters,
      height: circle.height,
    }));

    const signature = circlesSignature(nextCircles);
    if (signature !== lastAppliedSignature) {
      lastAppliedSignature = signature;
      circles.value = nextCircles;
    }

    if (nextCircles.length === 0) return;

    const next: Record<string, { x: number; y: number } | null> = {};
    for (const circle of circles.value) {
      next[circle.id] =
        map?.worldToScreen?.(circle.longitude, circle.latitude, circle.height) ?? null;
    }

    let changed = false;
    for (const circle of circles.value) {
      if (screenPosChanged(screenPositions.value[circle.id], next[circle.id])) {
        changed = true;
        break;
      }
    }
    if (changed) screenPositions.value = next;
  }

  function attach(map: NonNullable<ReturnType<typeof getSharedMap>>) {
    removeListener?.();
    removeListener = map.addRenderListener?.(() => refresh(map)) ?? null;
    refresh(map);
  }

  function detach() {
    removeListener?.();
    removeListener = null;
    circles.value = [];
    screenPositions.value = {};
    lastAppliedSignature = '';
  }

  onMounted(() => {
    if (sharedMapReady.value) {
      attach(getSharedMap()!);
    }
    offReady = onSharedMapReady((map) => attach(map));
  });

  onUnmounted(() => {
    offReady?.();
    offReady = null;
    detach();
  });

  function styleFor(id: string) {
    const pos = screenPositions.value[id];
    if (!pos) {
      return { visibility: 'hidden' as const };
    }
    return {
      visibility: 'visible' as const,
      left: `${pos.x}px`,
      top: `${pos.y}px`,
    };
  }

  return { circles, styleFor };
}
