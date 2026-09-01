import type { Ref } from 'vue';
import { getSharedMap, restoreSharedMapModuleView } from './sharedCesiumBridge';
import { closeTvVideoDetail } from './useTvVideoDetail';
import { toggleMapLayerPanel } from './useMapLayerPanel';

export type MapControlKey = 'layers' | 'areas' | 'search' | '3d' | 'heatmap' | 'labels' | 'toggle';

interface MapControlApi {
  plantWireframeEnabled?: Ref<boolean>;
  applyPlantWireframeEnabled?: () => void;
  restoreModuleDefaultView?: () => void | Promise<void>;
  toggleAccidentRescueDisplayMode?: () => void | Promise<void>;
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
      default:
        break;
    }
  }

  return { onMapControl };
}
