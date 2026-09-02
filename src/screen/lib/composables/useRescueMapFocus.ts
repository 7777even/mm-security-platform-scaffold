import { getSharedMap, onSharedMapReady, restoreSharedMapModuleView } from './sharedCesiumBridge';

/** 当前列表会话内，下一次选中条目是否先缩放到点位（翻页/总览后重置） */
let rescueItemZoomPending = true;

export function resetRescueItemZoomState() {
  rescueItemZoomPending = true;
}

function hideDefaultMapLabels() {
  getSharedMap()?.setPlantZoneTagsVisible?.(false);
}

function showDefaultMapLabels() {
  getSharedMap()?.setPlantZoneTagsVisible?.(true);
}

export async function flyToRescueMarkers(
  markers: Array<{ longitude: number; latitude: number }>,
  focus?: { longitude: number; latitude: number } | null,
) {
  const map = getSharedMap();
  if (!map?.flyToWorldPositions) return;

  const height = map.getBoundaryModelTopHeight?.() ?? 72.05;

  if (focus) {
    const zoomIn = rescueItemZoomPending;
    if (zoomIn) rescueItemZoomPending = false;

    await map.flyToWorldPositions({
      positions: [{ longitude: focus.longitude, latitude: focus.latitude, height }],
      duration: zoomIn ? 1.0 : 0.75,
      panOnly: !zoomIn,
      pitchDeg: -44,
      rangeMultiplier: 1.2,
    });
    return;
  }

  if (markers.length === 0) return;

  await map.flyToWorldPositions({
    positions: markers.map((m) => ({
      longitude: m.longitude,
      latitude: m.latitude,
      height,
    })),
    duration: 1.1,
    pitchDeg: -38,
    rangeMultiplier: 3.2,
  });
}

export function runRescueMapFocus(
  markers: Array<{ longitude: number; latitude: number }>,
  focus?: { longitude: number; latitude: number } | null,
) {
  if (!focus) {
    resetRescueItemZoomState();
  }

  const runner = () => {
    hideDefaultMapLabels();
    void flyToRescueMarkers(markers, focus);
  };
  const map = getSharedMap();
  if (map?.flyToWorldPositions) {
    runner();
    return;
  }
  onSharedMapReady(() => runner());
}

export function restoreRescueMapView() {
  resetRescueItemZoomState();
  showDefaultMapLabels();
  void restoreSharedMapModuleView();
}
