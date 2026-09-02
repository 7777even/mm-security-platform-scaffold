import { onMounted, onUnmounted, ref } from 'vue';
import {
  getSharedMap,
  onSharedMapReady,
  sharedMapReady,
  tvInspectionScanState,
} from './sharedCesiumBridge';

function screenPosChanged(
  prev: { x: number; y: number } | null | undefined,
  next: { x: number; y: number } | null | undefined,
  threshold = 0.5,
) {
  if (!prev && !next) return false;
  if (!prev || !next) return true;
  return Math.abs(prev.x - next.x) > threshold || Math.abs(prev.y - next.y) > threshold;
}

export function useTvInspectionScanResults() {
  const screenPositions = ref<Record<string, { x: number; y: number } | null>>({});

  let removeListener: (() => void) | null = null;
  let offReady: (() => void) | null = null;

  function refresh(map = getSharedMap()) {
    const height = map?.getBoundaryModelTopHeight?.() ?? 72.25;
    const points = tvInspectionScanState.value.resultPoints;
    const next: Record<string, { x: number; y: number } | null> = {};

    for (const point of points) {
      next[point.id] = map?.worldToScreen?.(point.longitude, point.latitude, height) ?? null;
    }

    let changed = points.length !== Object.keys(screenPositions.value).length;
    if (!changed) {
      for (const point of points) {
        if (screenPosChanged(screenPositions.value[point.id], next[point.id])) {
          changed = true;
          break;
        }
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
    screenPositions.value = {};
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

  return { scanState: tvInspectionScanState, styleFor };
}
