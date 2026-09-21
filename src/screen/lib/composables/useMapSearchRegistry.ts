import { computed, ref } from 'vue';
import { getSharedMap } from './sharedCesiumBridge';
import { useShellRoute } from './useShellRoute';

/** 可被地图搜索浮层检索的归一化点位（各页自行把本页已渲染的点位规整成此形状后注册）。 */
export interface SearchableMapMarker {
  id: string;
  name: string;
  /** 中文分类，如「应急事件」「消防态势」「报警」「设备」「通讯设备」「视频点」。 */
  type: string;
  longitude: number;
  latitude: number;
  height?: number;
}

/**
 * 当前页已渲染点位的共享注册表（按 shell 路由名分桶）。
 * 仅当前挂载的地图页会写入自己的点位，故天然只含「当前页」数据，符合工具栏搜索语义。
 */
const registry = new Map<string, SearchableMapMarker[]>();

export function registerMapSearchMarkers(pageKey: string, markers: SearchableMapMarker[]): void {
  registry.set(pageKey, markers);
}

export function unregisterMapSearchMarkers(pageKey: string): void {
  registry.delete(pageKey);
}

// —— 搜索面板开关（共享，跨页一致）——
export const mapSearchOpen = ref(false);

export function toggleMapSearchPanel(): void {
  mapSearchOpen.value = !mapSearchOpen.value;
}

export function closeMapSearchPanel(): void {
  mapSearchOpen.value = false;
}

/**
 * 地图搜索：仅检索当前页已渲染点位（与工具栏「搜索」按钮语义一致）。
 * 命中后调用 bridge 已暴露的 flyToWorldPositions 飞向该点。
 */
export function useMapSearch() {
  const shellRoute = useShellRoute();
  const markers = computed<SearchableMapMarker[]>(() => registry.get(shellRoute.name.value) ?? []);
  const query = ref('');
  const results = computed<SearchableMapMarker[]>(() => {
    const raw = markers.value;
    const q = query.value.trim().toLowerCase();
    if (!q) return raw;
    return raw.filter((m) => m.name.toLowerCase().includes(q) || m.type.toLowerCase().includes(q));
  });

  function select(marker: SearchableMapMarker): void {
    closeMapSearchPanel();
    void getSharedMap()?.flyToWorldPositions?.({
      positions: [
        {
          longitude: marker.longitude,
          latitude: marker.latitude,
          height: marker.height ?? 0,
        },
      ],
      duration: 0.9,
      pitchDeg: -45,
      rangeMultiplier: 1.6,
    });
  }

  return {
    markers,
    query,
    results,
    select,
    mapSearchOpen,
    toggleMapSearchPanel,
    closeMapSearchPanel,
  };
}
