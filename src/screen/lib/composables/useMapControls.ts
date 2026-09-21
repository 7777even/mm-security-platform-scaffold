import { ref, type Ref } from 'vue';
import { getSharedMap, restoreSharedMapModuleView } from './sharedCesiumBridge';
import { closeTvVideoDetail } from './useTvVideoDetail';
import { toggleMapLayerPanel, mapLayerPanelOpen } from './useMapLayerPanel';
import {
  toggleMapSearchPanel,
  mapSearchOpen,
  type SearchableMapMarker,
} from './useMapSearchRegistry';
import { fetchAlarmPoints, fetchDevicePoints, type MapPoint } from '@/services/map';

export type MapControlKey = 'layers' | 'areas' | 'search' | '3d' | 'heatmap' | 'labels' | 'toggle';

interface MapControlApi {
  plantWireframeEnabled?: Ref<boolean>;
  applyPlantWireframeEnabled?: () => void;
  restoreModuleDefaultView?: () => void | Promise<void>;
  toggleAccidentRescueDisplayMode?: () => void | Promise<void>;
  setPlantZoneTagsVisible?: (visible: boolean) => void;
  setHeatmapLayer?: (
    points: Array<{ longitude: number; latitude: number; weight: number }>,
  ) => void;
  clearHeatmapLayer?: () => void;
}

// —— 各按钮激活态（与工具栏高亮同步）——
export const mapLabelsVisible = ref(true);
export const plantAreaSelectorVisible = ref(true);
export const mapHeatmapActive = ref(false);

let heatmapPointsCache: Array<{ longitude: number; latitude: number; weight: number }> | null =
  null;

function weightForAlarm(p: MapPoint): number {
  if (p.level === 1) return 0.4;
  if (p.level === 2) return 0.7;
  if (p.level === 3) return 1;
  return 0.5;
}

function weightForDevice(p: MapPoint): number {
  if (p.status === 'FAULT') return 0.85;
  if (p.status === 'OFFLINE') return 0.45;
  return 0.3;
}

async function ensureHeatmapPoints(): Promise<
  Array<{ longitude: number; latitude: number; weight: number }>
> {
  if (heatmapPointsCache) return heatmapPointsCache;
  try {
    const [alarms, devices] = await Promise.all([fetchAlarmPoints(), fetchDevicePoints()]);
    heatmapPointsCache = [
      ...alarms
        .filter((p) => Number.isFinite(p.lng) && Number.isFinite(p.lat))
        .map((p) => ({ longitude: p.lng, latitude: p.lat, weight: weightForAlarm(p) })),
      ...devices
        .filter((p) => Number.isFinite(p.lng) && Number.isFinite(p.lat))
        .map((p) => ({ longitude: p.lng, latitude: p.lat, weight: weightForDevice(p) })),
    ];
  } catch {
    heatmapPointsCache = [];
  }
  return heatmapPointsCache;
}

async function toggleHeatmap(): Promise<void> {
  mapHeatmapActive.value = !mapHeatmapActive.value;
  const map = getSharedMap();
  if (!map) return;
  if (mapHeatmapActive.value) {
    const points = await ensureHeatmapPoints();
    if (!points.length) {
      mapHeatmapActive.value = false;
      return;
    }
    map.setHeatmapLayer?.(points);
  } else {
    map.clearHeatmapLayer?.();
  }
}

export function useMapControls() {
  function getMapApi(): MapControlApi | null {
    return getSharedMap() as MapControlApi | null;
  }

  async function onMapControl(key: MapControlKey | string) {
    const map = getMapApi();
    if (!map) return;

    switch (key) {
      case '3d':
        closeTvVideoDetail();
        await map.restoreModuleDefaultView?.();
        break;
      case 'toggle':
        closeTvVideoDetail();
        if (map.toggleAccidentRescueDisplayMode) {
          await map.toggleAccidentRescueDisplayMode();
          break;
        }
        await restoreSharedMapModuleView();
        break;
      case 'layers':
        toggleMapLayerPanel();
        break;
      case 'labels':
        // 标签默认：接 Cesium 已暴露的 setPlantZoneTagsVisible（厂区/装置区标签显隐）
        mapLabelsVisible.value = !mapLabelsVisible.value;
        getSharedMap()?.setPlantZoneTagsVisible?.(mapLabelsVisible.value);
        break;
      case 'areas':
        // 区域：切换已常驻于 MapPageShell 的厂区范围选择器显隐
        plantAreaSelectorVisible.value = !plantAreaSelectorVisible.value;
        break;
      case 'search':
        toggleMapSearchPanel();
        break;
      case 'heatmap':
        await toggleHeatmap();
        break;
      default:
        break;
    }
  }

  return { onMapControl };
}

/** 工具栏按钮激活态（与共享开关同步），供各页按钮 :class 绑定。 */
export function useMapControlActive() {
  const isActive = (key: string): boolean => {
    switch (key) {
      case 'layers':
        return mapLayerPanelOpen.value;
      case 'labels':
        return mapLabelsVisible.value;
      case 'areas':
        return plantAreaSelectorVisible.value;
      case 'search':
        return mapSearchOpen.value;
      case 'heatmap':
        return mapHeatmapActive.value;
      default:
        return false;
    }
  };
  return { isActive };
}

export type { SearchableMapMarker };
