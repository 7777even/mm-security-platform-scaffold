import { ref, shallowRef, type Ref, type ShallowRef } from 'vue';
import type { CesiumMapMode } from '@/config/cesiumMapModes';
import type { PlantAreaCode } from '@/services/map-data/plantAreas';
import type { SceneModeName } from '@/composables/mapCameraControls';

export interface WorldPosition {
  longitude: number;
  latitude: number;
  height?: number;
}

export type BoundaryEdgeSide = 'north' | 'south' | 'east' | 'west';

export type BoundaryEdgePositions = Partial<Record<BoundaryEdgeSide, WorldPosition>>;

export interface TvInspectionScanPoint {
  id: string;
  label: string;
  labelBgIndex: number;
  outerIndex: number;
  iconIndex: number;
  longitude: number;
  latitude: number;
}

export interface TvInspectionScanState {
  active: boolean;
  progress: number;
  circleId: string | null;
  resultPoints: TvInspectionScanPoint[];
}

export const tvInspectionScanState = ref<TvInspectionScanState>({
  active: false,
  progress: 0,
  circleId: null,
  resultPoints: [],
});

export function patchTvInspectionScanState(partial: Partial<TvInspectionScanState>) {
  tvInspectionScanState.value = { ...tvInspectionScanState.value, ...partial };
}

export function resetTvInspectionScanState() {
  tvInspectionScanState.value = {
    active: false,
    progress: 0,
    circleId: null,
    resultPoints: [],
  };
}

export interface SharedCesiumMapExpose {
  plantWireframeEnabled?: Ref<boolean>;
  applyPlantWireframeEnabled?: () => void;
  pauseRendering?: () => void;
  resumeRendering?: () => void;
  restoreModuleDefaultView?: () => void | Promise<void>;
  toggleAccidentRescueDisplayMode?: () => void | Promise<void>;
  flyToAccidentRescueIncident?: (longitude: number, latitude: number) => void | Promise<void>;
  waitForIdle?: () => Promise<void>;
  worldToScreen?: (
    longitude: number,
    latitude: number,
    height?: number,
  ) => { x: number; y: number } | null;
  getMarkerUiScale?: (longitude: number, latitude: number, height?: number) => number;
  relayWheelEvent?: (event: WheelEvent) => void;
  addRenderListener?: (fn: () => void) => () => void;
  getPlantZoneKeys?: () => string[];
  setPlantZoneTagsVisible?: (visible: boolean) => void;
  getPlantZoneWorldPosition?: (zoneKey: string) => WorldPosition | null;
  getBoundaryModelCenter?: () => WorldPosition | null;
  getBoundaryEdgePositions?: () => BoundaryEdgePositions | null;
  getBoundaryModelTopHeight?: () => number;
  getAccidentRescueOverlayHeight?: () => number;
  getTvInspectionCircles?: (requestedRadiusMeters?: number) => Array<{
    id: string;
    variant?: number;
    longitude: number;
    latitude: number;
    radiusMeters: number;
    height: number;
  }>;
  setTvInspectionCircles?: (
    circles: Array<{ longitude: number; latitude: number; radiusMeters?: number; height?: number }>,
  ) => void;
  clearTvInspectionCircles?: () => void;
  applyTvInspectionCircles?: (requestedRadiusMeters?: number) => boolean;
  resetTvInspectionScan?: () => void;
  showEvacuationRoute?: (route: {
    lines?: Array<{
      id: string;
      positions: Array<{ longitude: number; latitude: number }>;
    }>;
    positions?: Array<{ longitude: number; latitude: number }>;
    focus?: boolean;
  }) => void | Promise<void>;
  clearEvacuationRoute?: () => void;
  showEvacuationPeople?: (payload: {
    people: Array<{ id: string; name: string; longitude: number; latitude: number }>;
    focusId?: string | null;
  }) => void | Promise<void>;
  clearEvacuationPeople?: () => void;
  focusEvacuationPerson?: (person: {
    longitude: number;
    latitude: number;
    height?: number;
  }) => void | Promise<void>;
  showMonitoringPoints?: (payload: {
    points: Array<{
      id: string;
      name: string;
      status: 'normal' | 'warning' | 'alarm';
      longitude: number;
      latitude: number;
    }>;
    focusId?: string | null;
  }) => void | Promise<void>;
  clearMonitoringPoints?: () => void;
  focusMonitoringPoint?: (point: { longitude: number; latitude: number }) => void | Promise<void>;
  setMonitoringFocusArea?: (
    enable: boolean,
    target?: { longitude: number; latitude: number } | null,
  ) => void;
  flyToWorldPositions?: (payload: {
    positions: Array<{ longitude: number; latitude: number; height?: number }>;
    duration?: number;
    pitchDeg?: number;
    rangeMultiplier?: number;
    /** 单点聚焦时保持当前高度/俯仰，仅平移视角 */
    panOnly?: boolean;
  }) => void | Promise<void>;
  setPlantAreaSelection?: (
    code: PlantAreaCode,
    options?: { fly?: boolean },
  ) => void | Promise<void>;
  ensureUserInputsEnabled?: () => void;
  /** 沿当前视线放大 */
  zoomIn?: () => void;
  /** 沿当前视线缩小 */
  zoomOut?: () => void;
  /** 在 2D / 3D 场景模式间切换 */
  toggleSceneMode?: () => void;
  /** 当前场景模式 */
  getSceneMode?: () => SceneModeName;
}

export const sharedMapRef: ShallowRef<SharedCesiumMapExpose | null> = shallowRef(null);
export const sharedMapReady = ref(false);

/** 页面内子模式覆盖路由默认 mapMode（如生产页切换前序应急） */
export const cesiumMapModeOverride: Ref<CesiumMapMode | null> = ref(null);

/** 事故救援详情：待飞向的事件坐标（模式切换完成后消费） */
export const accidentRescueFlyTarget = ref<{ longitude: number; latitude: number } | null>(null);

export function setCesiumMapModeOverride(mode: CesiumMapMode | null) {
  cesiumMapModeOverride.value = mode;
}

const readyHandlers = new Set<(map: SharedCesiumMapExpose) => void>();

export function bindSharedMap(mapComponent: SharedCesiumMapExpose | null) {
  sharedMapRef.value = mapComponent;
}

export function setSharedMapReady(ready = true) {
  sharedMapReady.value = ready;
  if (ready && sharedMapRef.value) {
    for (const fn of readyHandlers) {
      fn(sharedMapRef.value);
    }
  }
}

export function onSharedMapReady(fn: (map: SharedCesiumMapExpose) => void) {
  if (sharedMapReady.value && sharedMapRef.value) {
    fn(sharedMapRef.value);
  }
  readyHandlers.add(fn);
  return () => readyHandlers.delete(fn);
}

export function getSharedMap() {
  return sharedMapRef.value;
}

export function pauseSharedMapRendering() {
  sharedMapRef.value?.pauseRendering?.();
}

export function resumeSharedMapRendering() {
  sharedMapRef.value?.resumeRendering?.();
}

export function restoreSharedMapModuleView() {
  return sharedMapRef.value?.restoreModuleDefaultView?.();
}

export function zoomInSharedMap() {
  sharedMapRef.value?.zoomIn?.();
}

export function zoomOutSharedMap() {
  sharedMapRef.value?.zoomOut?.();
}

export function toggleSharedMapSceneMode() {
  sharedMapRef.value?.toggleSceneMode?.();
}

export function getSharedMapSceneMode(): SceneModeName | null {
  return sharedMapRef.value?.getSceneMode?.() ?? null;
}

async function runAccidentRescueIncidentFly(
  map: SharedCesiumMapExpose,
  longitude: number,
  latitude: number,
) {
  if (map.waitForIdle) {
    await map.waitForIdle();
  }
  await map.flyToAccidentRescueIncident?.(longitude, latitude);
}

export async function flyToSharedAccidentRescueIncident(longitude: number, latitude: number) {
  accidentRescueFlyTarget.value = { longitude, latitude };

  const map = getSharedMap();
  if (!map?.flyToAccidentRescueIncident) {
    return new Promise<void>((resolve) => {
      onSharedMapReady((readyMap) => {
        void runAccidentRescueIncidentFly(readyMap, longitude, latitude).finally(() => resolve());
      });
    });
  }

  await runAccidentRescueIncidentFly(map, longitude, latitude);
  if (
    accidentRescueFlyTarget.value?.longitude === longitude &&
    accidentRescueFlyTarget.value?.latitude === latitude
  ) {
    accidentRescueFlyTarget.value = null;
  }
}

export function clearAccidentRescueFlyTarget() {
  accidentRescueFlyTarget.value = null;
}
