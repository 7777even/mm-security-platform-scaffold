import { computed, onMounted, onUnmounted, ref, watchEffect } from 'vue';
import {
  onSharedMapReady,
  sharedMapReady,
  getSharedMap,
  type SharedCesiumMapExpose,
  type BoundaryEdgePositions,
  type BoundaryEdgeSide,
  type WorldPosition,
} from './sharedCesiumBridge';

export type { WorldPosition, BoundaryEdgeSide, BoundaryEdgePositions };

interface CesiumMapMarkerApi extends SharedCesiumMapExpose {
  getPlantZoneKeys?: () => string[];
  getPlantZoneWorldPosition?: (zoneKey: string) => WorldPosition | null;
  getBoundaryModelCenter?: () => WorldPosition | null;
  getBoundaryEdgePositions?: () => BoundaryEdgePositions | null;
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

export function useCesiumScreenAnchor(resolveWorld: () => WorldPosition | null) {
  const screenPos = ref<{ x: number; y: number } | null>(null);
  let removeListener: (() => void) | null = null;
  let offReady: (() => void) | null = null;

  function updatePosition(
    map: CesiumMapMarkerApi | null = getSharedMap() as CesiumMapMarkerApi | null,
  ) {
    const world = resolveWorld();
    if (!world || !map?.worldToScreen) {
      if (screenPos.value !== null) screenPos.value = null;
      return;
    }
    const next = map.worldToScreen(world.longitude, world.latitude, world.height);
    if (screenPosChanged(screenPos.value, next)) {
      screenPos.value = next;
    }
  }

  function attach(map: CesiumMapMarkerApi) {
    removeListener?.();
    removeListener = map.addRenderListener?.(() => updatePosition(map)) ?? null;
    updatePosition(map);
  }

  function detach() {
    removeListener?.();
    removeListener = null;
    screenPos.value = null;
  }

  onMounted(() => {
    if (sharedMapReady.value) {
      attach(getSharedMap() as CesiumMapMarkerApi);
    }
    offReady = onSharedMapReady((map) => attach(map as CesiumMapMarkerApi));
  });

  onUnmounted(() => {
    offReady?.();
    offReady = null;
    detach();
  });

  const anchorStyle = computed(() => {
    const pos = screenPos.value;
    if (!pos) {
      return { visibility: 'hidden' as const };
    }
    return {
      visibility: 'visible' as const,
      left: `${pos.x}px`,
      top: `${pos.y}px`,
    };
  });

  return { screenPos, anchorStyle, updatePosition };
}

export function resolvePlantZoneOrFixed(
  map: CesiumMapMarkerApi | null,
  zoneIndex: number,
  fallback: WorldPosition,
): WorldPosition {
  const keys = map?.getPlantZoneKeys?.() ?? [];
  const zoneKey = keys[zoneIndex] ?? keys[0];
  if (zoneKey) {
    const world = map?.getPlantZoneWorldPosition?.(zoneKey);
    if (world) return world;
  }
  return fallback;
}

export function resolveBoundaryCenterOrFixed(
  map: CesiumMapMarkerApi | null,
  fallback: WorldPosition,
): WorldPosition {
  return map?.getBoundaryModelCenter?.() ?? fallback;
}

export interface BoundaryGateMarker {
  name: string;
  edge: BoundaryEdgeSide;
}

export function useBoundaryGateScreenPositions(
  gates: BoundaryGateMarker[],
  fallback: BoundaryEdgePositions,
) {
  const positions = ref<Record<string, { x: number; y: number } | null>>({});

  let removeListener: (() => void) | null = null;
  let offReady: (() => void) | null = null;

  function updatePositions(
    map: CesiumMapMarkerApi | null = getSharedMap() as CesiumMapMarkerApi | null,
  ) {
    const edges = map?.getBoundaryEdgePositions?.();
    const next: Record<string, { x: number; y: number } | null> = {};

    for (const gate of gates) {
      const world = edges?.[gate.edge] ?? fallback[gate.edge];
      if (!world || !map?.worldToScreen) {
        next[gate.name] = null;
        continue;
      }
      next[gate.name] = map.worldToScreen(world.longitude, world.latitude, world.height);
    }

    let changed = false;
    for (const gate of gates) {
      if (screenPosChanged(positions.value[gate.name], next[gate.name])) {
        changed = true;
        break;
      }
    }
    if (changed) positions.value = next;
  }

  function attach(map: CesiumMapMarkerApi) {
    removeListener?.();
    removeListener = map.addRenderListener?.(() => updatePositions(map)) ?? null;
    updatePositions(map);
  }

  function detach() {
    removeListener?.();
    removeListener = null;
    positions.value = {};
  }

  onMounted(() => {
    if (sharedMapReady.value) {
      attach(getSharedMap() as CesiumMapMarkerApi);
    }
    offReady = onSharedMapReady((map) => attach(map as CesiumMapMarkerApi));
  });

  onUnmounted(() => {
    offReady?.();
    offReady = null;
    detach();
  });

  function styleFor(name: string) {
    const pos = positions.value[name];
    if (!pos) {
      return { visibility: 'hidden' as const };
    }
    return {
      visibility: 'visible' as const,
      left: `${pos.x}px`,
      top: `${pos.y}px`,
    };
  }

  return { positions, styleFor };
}

export interface WorldMarkerAnchor {
  key: string;
  longitude: number;
  latitude: number;
  height?: number;
}

export interface WorldMarkerScreenPosition {
  x: number;
  y: number;
  scale: number;
}

function markerScreenChanged(
  prev: WorldMarkerScreenPosition | null | undefined,
  next: WorldMarkerScreenPosition | null | undefined,
  threshold = 0.5,
  compareScale = true,
) {
  if (!prev && !next) return false;
  if (!prev || !next) return true;
  return (
    Math.abs(prev.x - next.x) > threshold ||
    Math.abs(prev.y - next.y) > threshold ||
    (compareScale && Math.abs(prev.scale - next.scale) > 0.001)
  );
}

export interface WorldMarkerScreenOptions {
  /** 标记是否随地图缩放改变 UI 尺寸，默认 true */
  scaleWithZoom?: boolean;
}

export function useWorldMarkerScreenPositions(
  markersOrResolver: WorldMarkerAnchor[] | (() => WorldMarkerAnchor[]),
  options: WorldMarkerScreenOptions = {},
) {
  const scaleWithZoom = options.scaleWithZoom ?? true;
  const positions = ref<Record<string, WorldMarkerScreenPosition | null>>({});

  let removeListener: (() => void) | null = null;
  let offReady: (() => void) | null = null;

  function resolveMarkers() {
    return typeof markersOrResolver === 'function' ? markersOrResolver() : markersOrResolver;
  }

  function updatePositions(
    map: CesiumMapMarkerApi | null = getSharedMap() as CesiumMapMarkerApi | null,
  ) {
    const markerList = resolveMarkers();
    const next: Record<string, WorldMarkerScreenPosition | null> = {};

    for (const marker of markerList) {
      if (!map?.worldToScreen) {
        next[marker.key] = null;
        continue;
      }
      const screen = map.worldToScreen(marker.longitude, marker.latitude, marker.height);
      if (!screen) {
        next[marker.key] = null;
        continue;
      }
      const scale = scaleWithZoom
        ? (map.getMarkerUiScale?.(marker.longitude, marker.latitude, marker.height) ?? 1)
        : 1;
      next[marker.key] = { x: screen.x, y: screen.y, scale };
    }

    let changed = markerList.length !== Object.keys(positions.value).length;
    if (!changed) {
      for (const marker of markerList) {
        if (
          markerScreenChanged(positions.value[marker.key], next[marker.key], 0.5, scaleWithZoom)
        ) {
          changed = true;
          break;
        }
      }
    }
    if (changed) positions.value = next;
  }

  function attach(map: CesiumMapMarkerApi) {
    removeListener?.();
    removeListener = map.addRenderListener?.(() => updatePositions(map)) ?? null;
    updatePositions(map);
  }

  function detach() {
    removeListener?.();
    removeListener = null;
    positions.value = {};
  }

  let stopMarkerWatch: (() => void) | null = null;

  onMounted(() => {
    if (sharedMapReady.value) {
      attach(getSharedMap() as CesiumMapMarkerApi);
    }
    offReady = onSharedMapReady((map) => attach(map as CesiumMapMarkerApi));

    stopMarkerWatch = watchEffect(() => {
      resolveMarkers();
      updatePositions(getSharedMap() as CesiumMapMarkerApi | null);
    });
  });

  onUnmounted(() => {
    stopMarkerWatch?.();
    stopMarkerWatch = null;
    offReady?.();
    offReady = null;
    detach();
  });

  function styleFor(key: string) {
    const pos = positions.value[key];
    if (!pos) {
      return { visibility: 'hidden' as const };
    }
    return {
      visibility: 'visible' as const,
      left: `${pos.x}px`,
      top: `${pos.y}px`,
      ...(scaleWithZoom ? { '--marker-scale': String(pos.scale) } : {}),
    };
  }

  function refreshPositions() {
    updatePositions(getSharedMap() as CesiumMapMarkerApi | null);
  }

  return { positions, styleFor, refreshPositions };
}
