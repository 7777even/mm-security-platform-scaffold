<template>
  <div class="maoming-petro-cesium-map">
    <div ref="containerEl" class="cesium-container"></div>
    <p v-if="props.showStatus && capLoadStatus" class="cesium-status">{{ capLoadStatus }}</p>
    <p v-if="loadError" class="cesium-error">{{ loadError }}</p>
  </div>
</template>

<script setup lang="ts">
// eslint-disable-next-line @typescript-eslint/ban-ts-comment -- 源项目迁移遗留类型债（全文件 @ts-nocheck），本次迁移不改写源类型风格
// @ts-nocheck
import { onMounted, onUnmounted, ref, watch } from 'vue';
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

import plantAreaUrl from '../../../mapdata/装置区.geojson?url';
import boundaryUrl from '../../../mapdata/边界.geojson?url';
import mapPgwText from '../../../mapdata/map.preview.pgw?raw';
import mapImageUrl from '../../../mapdata/map.preview.jpg?url';
import { accidentRescueFlyTarget } from '../../lib/composables/sharedCesiumBridge';
import { plantAreaBoundaryRings, plantAreaDefinitions } from '../../lib/data/plantAreas.ts';
import {
  PLANT_TAG_BILLBOARD_HEIGHT as _PLANT_TAG_BILLBOARD_HEIGHT,
  PLANT_TAG_BILLBOARD_WIDTH,
  PLANT_TAG_COMBINED_HEIGHT,
  createAiDiagnosisAlarmTagCanvas,
  createPlantZoneTagCombinedCanvas,
  drawPlantZoneAlarmTagCombinedFrame,
  drawPlantZoneTagCombinedFrame,
  getPlantZoneTagThemeRgb,
} from '../../utils/plantZoneTagBillboard.ts';
import { resolveCesiumMapModeConfig } from '../../config/cesiumMapModes.ts';
import { tvInspectionScanPointsByCircle } from '../../lib/data/tvMock.ts';
import {
  patchTvInspectionScanState,
  resetTvInspectionScanState,
} from '../../lib/composables/sharedCesiumBridge.ts';
import { setAccidentRescueFlatViewActive } from '../../utils/accidentRescueFlatViewState.ts';
import { fetchMapZoneSigns } from '../../../services/map';
import {
  ACCIDENT_RESCUE_FLAT,
  CINEMATIC_DOF_SHADER,
  MAOMING_PETRO,
  MAP_DOF,
  MAP_THEME,
  PLANT_MARKER_SCALE_MAX,
  PLANT_MARKER_SCALE_MIN,
  PLANT_MARKER_SCALE_MIN_DISTANCE,
  PLANT_MARKER_SCALE_REF_DISTANCE,
  TV_INSPECTION_CENTER_GRID_STEPS,
  TV_INSPECTION_CENTER_POINT_SIZE,
  TV_INSPECTION_CIRCLE_COLOR,
  TV_INSPECTION_CIRCLE_FILL_ALPHA,
  TV_INSPECTION_CIRCLE_LINE_WIDTH,
  TV_INSPECTION_CIRCLE_SEGMENTS,
  TV_INSPECTION_CIRCLE_SEPARATION_GAP,
  TV_INSPECTION_FALLBACK_CIRCLES,
  TV_INSPECTION_HEIGHT_OFFSET,
  TV_INSPECTION_LINE_COMMON,
  TV_INSPECTION_RADIAL_ANGLES,
  TV_INSPECTION_RADIAL_LINE_WIDTH,
  TV_INSPECTION_RING_SAMPLES,
  TV_INSPECTION_SCAN_CAMERA_FLY_SEC,
  TV_INSPECTION_SCAN_DURATION_MS,
  TV_INSPECTION_SCAN_TOP_DOWN_PADDING,
} from './maomingPetroMapConstants';

const props = defineProps({
  /** 是否显示顶面加载等状态条（测试页开启，大屏嵌入默认关闭） */
  showStatus: { type: Boolean, default: false },
  /**
   * 页面地图业务模式（与园区概况 / 运行监控 / 测试页隔离）
   * @type {'fire'|'fire-emergency'|'accident-rescue'|'production'|'preliminary'|'security'|'tv'|'park-overview'|'operation-monitoring'|'ai-diagnosis'|'cesium-test'|'evacuation'}
   */
  mapMode: {
    type: String,
    default: 'fire',
    validator: (value) =>
      [
        'fire',
        'fire-emergency',
        'accident-rescue',
        'production',
        'preliminary',
        'security',
        'tv',
        'park-overview',
        'operation-monitoring',
        'ai-diagnosis',
        'cesium-test',
        'evacuation',
      ].includes(value),
  },
  /** 右侧详情面板占用宽度（px）；>0 时飞入后将区块居中于左侧可视区 */
  focusRightInsetPx: { type: Number, default: 0 },
  /** 左侧详情面板占用宽度（px）；与 focusRightInsetPx 共同决定可视区水平中心 */
  focusLeftInsetPx: { type: Number, default: 0 },
  /** 顶部导航占用高度（px）；>0 时飞入注视点沿纬度（北向）偏移，避免区块偏下 */
  focusTopInsetPx: { type: Number, default: 0 },
  /** 底部工具栏等占用高度（px）；与 focusTopInsetPx 共同决定可视区垂直中心 */
  focusBottomInsetPx: { type: Number, default: 0 },
  /** 额外上移量（px），叠加在纬度偏移上，使区块在左侧视区更靠上 */
  focusVerticalExtraPx: { type: Number, default: 0 },
  /** 经度（东向）偏移系数，0~1；越小区块越靠右（经度偏移越少） */
  focusHorizontalScale: { type: Number, default: 0.75 },
  /** 边界总览 flyToBoundingSphere 距离 = 包围球半径 × 此系数 */
  boundaryOverviewRangeMultiplier: { type: Number, default: 2.05 },
});

function getMapModeConfig() {
  return resolveCesiumMapModeConfig(props.mapMode);
}

/**
 * 地图模式切换 / 视角恢复的异步队列（避免外部飞行与 restoreModuleDefaultView 冲突）
 * - applyMapModeConfig 会把“恢复默认视角”放进队列
 * - 外部（AI诊断）飞行动画也应等待队列空闲后再执行
 */
let mapAsyncChain = Promise.resolve();
function enqueueMapTask(task) {
  mapAsyncChain = mapAsyncChain.then(task).catch((err) => {
    console.error('[MaomingPetroCesiumMap] map task failed', err);
  });
  return mapAsyncChain;
}

/** 路由/页面切换时热更新地图业务配置，不销毁 Viewer */
async function applyMapModeConfig() {
  if (!viewer) return;

  const prevMode = lastAppliedMapMode;
  const nextMode = props.mapMode;
  const config = getMapModeConfig();
  const modeChanged = prevMode != null && prevMode !== nextMode;

  if (prevMode === 'ai-diagnosis' && nextMode !== 'ai-diagnosis') {
    endAiDiagnosisScan();
  }

  if (config.showPlantZoneTags) {
    initPlantBillboardMarkers(viewer);
  } else {
    destroyPlantBillboardMarkers(viewer);
  }

  setupPlantHoverInteraction(viewer);
  lastAppliedMapMode = nextMode;

  if (nextMode === 'evacuation') {
    applyEvacuationPresentation(true);
    return;
  }
  if (prevMode === 'evacuation' && nextMode !== 'evacuation') {
    applyEvacuationPresentation(false);
  }

  if (nextMode === 'accident-rescue') {
    if (prevMode === 'fire-emergency') {
      fireEmergencyListCameraPose = cloneCameraPose(viewer);
    }
    await applyAccidentRescueDisplayMode(false, { instantCamera: true, skipCamera: true });
    const flyTarget = accidentRescueFlyTarget.value;
    if (flyTarget) {
      await runFlyToAccidentRescueIncidentDirect(flyTarget.longitude, flyTarget.latitude);
      accidentRescueFlyTarget.value = null;
    }
  } else {
    const restoringFireEmergencyList =
      modeChanged && prevMode === 'accident-rescue' && nextMode === 'fire-emergency';
    if (restoringFireEmergencyList && fireEmergencyListCameraPose) {
      await restoreCameraPose(fireEmergencyListCameraPose);
      teardownAccidentRescueFlatView();
    } else {
      teardownAccidentRescueFlatView();
      if (modeChanged && nextMode !== 'cesium-test') {
        await restoreModuleDefaultView();
      }
    }
  }

  viewer.scene.requestRender();
}

const emit = defineEmits(['zone-select', 'zone-deselect', 'ready']);

/** 中国石化茂名石化厂区中心（WGS84） */

const containerEl = ref(null);
const loadError = ref('');
const capLoadStatus = ref('');
/** 装置区标签 Billboard 实体 id（用于销毁） */
const plantTagBillboardIds = [];
/** 外部强制隐藏装置区标签（如消防救援列表抽屉打开时） */
let plantZoneTagsExternallyVisible = true;
/** 标签+标点合并贴图：zoneKey -> canvas（上标签下标点） */
const plantTagCanvasByZone = new Map();
let plantTagPinAnimRaf = null;
let plantTagPinPreRenderRemover = null;
let zoneFocusFlyRemover = null;
/** 调试：关闭后隐藏顶/底/竖棱 Entity 与 Model silhouette */
const plantWireframeEnabled = ref(MAP_THEME.plantWireframe.enabled);
/** 事故救援页：顶视平面模式；默认关闭，进入救援页后再开启 */
let accidentRescueFlatViewActive = false;

function isAccidentRescueMode() {
  return props.mapMode === 'accident-rescue';
}

function _isEvacuationMode() {
  return props.mapMode === 'evacuation';
}

function isAccidentRescueFlatOverview() {
  return isAccidentRescueMode() && accidentRescueFlatViewActive;
}

function isPlantWireframeEnabled() {
  return plantWireframeEnabled.value;
}

function shouldShowPlantWireframe(_state) {
  if (isAccidentRescueFlatOverview()) return false;
  return isPlantWireframeEnabled();
}

function shouldShowPlantBlockModel(state) {
  if (isAccidentRescueFlatOverview()) return false;
  return !!state.blockModelUri;
}

function isPlantWireframeEmphasized(state) {
  return !!state.selected;
}

function getPlantWireframeLineWidth(state) {
  const { lineWidth, selectedLineWidth } = MAP_THEME.plantWireframe;
  return isPlantWireframeEmphasized(state) ? selectedLineWidth : lineWidth;
}

function getPlantWireframeSilhouetteSize(state) {
  const { silhouetteSize, selectedSilhouetteSize } = MAP_THEME.plantWireframe;
  return isPlantWireframeEmphasized(state) ? selectedSilhouetteSize : silhouetteSize;
}

let viewer = null;
let renderingPaused = false;
let resizeObserver = null;
const factoryAreaEntityIds = [];
let activeFactoryAreaCode = 'all';
let renderErrorRemover = null;
let destroyElevatedCap = null;
let elevatedCapPrimitive = null;
/** 边界环地形采样，顶视模式下用于贴地边界线 */
let boundaryFlatEdgeCartographics = null;
/** 站点参考地形高程（边界环均值） */
let overviewSiteReferenceTerrainHeight = 0;
/** 事故救援 2D 边界实体是否已创建（仅救援页隐藏模式，离开即销毁） */
let accidentRescueFlatBoundaryReady = false;
let lastPlantFlatPresentation = null;
const ACCIDENT_RESCUE_FLAT_ENTITY_IDS = {
  fill: 'accident-rescue-flat-fill',
  dash: 'accident-rescue-flat-dash-edge',
} as const;

const EVACUATION_FLAT_ENTITY_ID = 'evacuation-flat-dash-edge';
let depthOfFieldStage = null;
let depthOfFieldBlurStage = null;
let depthOfFieldCompositeStage = null;
let depthOfFieldCameraListener = null;

let plantHoverHandler = null;
let plantHoverRafId = null;
let plantHoverReconcileRaf = null;
let plantHoverLeaveTimer = null;
let plantHoverSettleTimer = null;
let lastPlantHoverWindowPosition = null;
/** 拾取短暂为空时延迟离区，避免快速划过误取消生长 */
const PLANT_HOVER_LEAVE_DEBOUNCE_MS = 56;
/** 鼠标停住后补检拾取（模型可能晚一拍才可命中） */
const PLANT_HOVER_SETTLE_MS = 72;
let hoveredPlantEntityId = null;
let selectedPlantEntityId = null;
/** AI 诊断扫描：禁用鼠标悬停/选中，由脚本驱动飞入与生长 */
let plantInteractionSuspended = false;
let aiScanActiveZoneKey = null;
/** 扫描完成后展示标签的装置区 */
let _aiScanResultZoneKey = null;
/** 是否已进入详情视角（总览→详情仅首次飞入放大；切换区块只平移） */
let zoneDetailViewActive = false;
/** 进入详情后锁定的视距，总览→详情首次飞入时使用；切换区块改读当前相机视距 */
let zoneDetailLockedRange = null;
/** 详情内上一区块中心，切换时用于按当前视角平移 */
let zoneDetailLastCenter = null;
/** 上次已应用的 mapMode（用于切换页面时做差异更新） */
let lastAppliedMapMode = null;
/** 总览初始相机位姿 / 边界数据（关闭详情时飞回） */
let overviewCameraPose = null;
/** 进入应急事件详情前保存的列表页相机位姿（返回列表时恢复） */
let fireEmergencyListCameraPose = null;
let overviewBoundaryDataSource = null;
let overviewPlantDataSource = null;
let overviewBoundaryLonLatRing = null;
let overviewCameraOffset = null;
/** 页面 HTML 标记随相机刷新时的回调 */
const renderListeners = new Set();
let postRenderNotifyRemover = null;
const plantHoverStates = new Map();
const plantZoneEntityById = new Map();
const dofFocusScratch = new Cesium.Cartesian3();
const dofPickCenter = new Cesium.Cartesian2();

let evacuationRouteDataSource = null;
let evacuationRouteMaterialRegistered = false;
const EVACUATION_ROUTE_ENTITY_IDS = {
  base: 'evacuation-route-base',
  flow: 'evacuation-route-flow',
} as const;

let evacuationOutlineDataSource = null;
let monitoringFocusDataSource = null;

/** GeoJSON 中 id 为 null 时会导致 flyTo / zoomTo 崩溃 */
function ensureEntityIds(dataSource, prefix) {
  dataSource.entities.values.forEach((entity, index) => {
    const id = entity.id;
    if (id == null || (typeof id !== 'string' && typeof id !== 'number')) {
      entity.id = `${prefix}-${index}`;
    }
  });
}

function getPlantAreaStyle(index) {
  const palette = MAP_THEME.colors.plantPalette;
  return palette[index % palette.length];
}

function toPlantZoneKey(entityId) {
  return String(entityId ?? '');
}

function getPlantHoverState(entityId) {
  return plantHoverStates.get(toPlantZoneKey(entityId));
}

/** 装置区信息牌文案：GET /map/zone-signs 下发（V42），挂载时加载；空数组时不绘制（不回灌假文案）。 */
let plantZonePopupPresets = [];
let plantZoneTealTagPresets = [];

async function loadPlantZoneSignPresets() {
  const signs = await fetchMapZoneSigns();
  plantZonePopupPresets = signs.popups;
  plantZoneTealTagPresets = signs.tealTags;
}

function getPlantZonePopupPreset(index) {
  const presets = plantZonePopupPresets;
  return presets.length ? presets[index % presets.length] : null;
}

function getPlantZoneTealTagPreset(index) {
  const presets = plantZoneTealTagPresets;
  return presets.length ? presets[index % presets.length] : null;
}

function isPlantRedZone(state) {
  return state.colorIndex % MAP_THEME.colors.plantPalette.length === 0;
}

function getPlantZoneTagThemeFromState(state) {
  const { fill } = getPlantAreaStyle(state.colorIndex);
  return getPlantZoneTagThemeRgb(fill);
}

function buildPlantZoneTagMeta(state) {
  if (isPlantRedZone(state)) {
    const preset = state.popupMeta ?? getPlantZonePopupPreset(state.colorIndex);
    if (!preset) return null;
    return {
      title: preset.title,
      status: `位置：${preset.location}`,
      value: preset.status,
      valueLevel: preset.statusLevel === 'alert' ? 'alert' : 'normal',
    };
  }
  const preset = state.tealMarkerMeta ?? getPlantZoneTealTagPreset(state.colorIndex);
  if (!preset) return null;
  return {
    title: preset.title,
    status: preset.status,
    value: preset.value,
    valueLevel: 'normal',
  };
}

function computePlantMarkerUiScale(world) {
  if (!viewer) return 1;
  const distance = Cesium.Cartesian3.distance(viewer.camera.positionWC, world);
  const ref = PLANT_MARKER_SCALE_REF_DISTANCE;
  if (distance <= ref) return PLANT_MARKER_SCALE_MAX;
  const d = Math.max(distance, PLANT_MARKER_SCALE_MIN_DISTANCE);
  const ratio = ref / d;
  return Cesium.Math.clamp(ratio, PLANT_MARKER_SCALE_MIN, PLANT_MARKER_SCALE_MAX);
}

function getPlantZoneMarkerWorldPosition(state) {
  const cartographics = state.cartographics;
  if (!cartographics?.length) return null;

  let lon = 0;
  let lat = 0;
  let terrainSum = 0;
  for (const carto of cartographics) {
    lon += carto.longitude;
    lat += carto.latitude;
    terrainSum += carto.height ?? 0;
  }
  const n = cartographics.length;
  const top = getPlantBlockTop(state) + 2;
  return Cesium.Cartesian3.fromRadians(lon / n, lat / n, terrainSum / n + top);
}

function getPlantTagBillboardScale(state) {
  const world = getPlantZoneMarkerWorldPosition(state);
  if (!world || !viewer) return 1;
  return computePlantMarkerUiScale(world);
}

function createPlantTagBillboardScaleProperty(state) {
  return new Cesium.CallbackProperty(() => getPlantTagBillboardScale(state), false);
}

function createPlantTagBillboardPositionProperty(state) {
  return new Cesium.CallbackProperty(() => {
    const world = getPlantZoneMarkerWorldPosition(state);
    return world ?? Cesium.Cartesian3.ZERO;
  }, false);
}

function stopPlantTagPinAnimation() {
  if (plantTagPinAnimRaf != null) {
    cancelAnimationFrame(plantTagPinAnimRaf);
    plantTagPinAnimRaf = null;
  }
  if (plantTagPinPreRenderRemover) {
    plantTagPinPreRenderRemover();
    plantTagPinPreRenderRemover = null;
  }
}

function shouldShowPlantZoneTagBillboards() {
  return getMapModeConfig().showPlantZoneTags && plantZoneTagsExternallyVisible;
}

/**
 * 重大危险源信息牌仅在鼠标悬浮所在分区时显示；分区颜色和边界始终保留。
 */
function shouldShowPlantZoneTagForState(state) {
  return shouldShowPlantZoneTagBillboards() && Boolean(state?.hovered);
}

function applyPlantZoneTagBillboardVisibility() {
  for (const state of plantHoverStates.values()) {
    if (state.tagBillboardEntity) {
      state.tagBillboardEntity.show = shouldShowPlantZoneTagForState(state);
    }
  }
  viewer?.scene?.requestRender();
}

function setPlantZoneTagsVisible(visible: boolean) {
  plantZoneTagsExternallyVisible = visible;
  applyPlantZoneTagBillboardVisibility();
}

function refreshPlantTagBillboardGraphics() {
  for (const state of plantHoverStates.values()) {
    const billboard = state.tagBillboardEntity?.billboard;
    if (billboard?._definitionChanged) {
      billboard._definitionChanged.raiseEvent(billboard);
    }
  }
}

function tickPlantTagAnimationFrame() {
  const animMs = performance.now();
  for (const [zoneKey, tagCanvas] of plantTagCanvasByZone) {
    const state = getPlantHoverState(zoneKey);
    if (!state?.tagMeta) continue;
    const ctx = tagCanvas.getContext('2d');
    if (!ctx) continue;
    const dpr = tagCanvas.width / PLANT_TAG_BILLBOARD_WIDTH;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, tagCanvas.width, tagCanvas.height);
    ctx.scale(dpr, dpr);
    if (state.tagVariant === 'ai-diagnosis-alarm') {
      drawPlantZoneAlarmTagCombinedFrame(ctx, state.tagMeta, animMs);
    } else {
      drawPlantZoneTagCombinedFrame(
        ctx,
        state.tagMeta,
        getPlantZoneTagThemeFromState(state),
        animMs,
      );
    }
  }
  refreshPlantTagBillboardGraphics();
}

function startPlantTagPinAnimation(activeViewer) {
  stopPlantTagPinAnimation();
  if (!activeViewer?.scene || !plantTagCanvasByZone.size) return;

  tickPlantTagAnimationFrame();
  plantTagPinPreRenderRemover = activeViewer.scene.preRender.addEventListener(() => {
    tickPlantTagAnimationFrame();
  });

  const loop = () => {
    if (!viewer || !plantTagCanvasByZone.size) {
      plantTagPinAnimRaf = null;
      return;
    }
    activeViewer.scene.requestRender();
    plantTagPinAnimRaf = requestAnimationFrame(loop);
  };
  plantTagPinAnimRaf = requestAnimationFrame(loop);
}

function destroyPlantBillboardMarkers(activeViewer) {
  stopPlantTagPinAnimation();
  plantTagCanvasByZone.clear();
  if (activeViewer) {
    for (const id of plantTagBillboardIds) {
      activeViewer.entities.removeById(id);
    }
  }
  plantTagBillboardIds.length = 0;
  for (const state of plantHoverStates.values()) {
    state.tagBillboardEntity = null;
    state.tagMeta = null;
    state.tagVariant = null;
    state.autoMarkerMode = null;
  }
}

function createPlantBillboardForZone(activeViewer, zoneKey) {
  const state = plantHoverStates.get(zoneKey);
  if (!activeViewer || !state) return;

  if (state.tagBillboardEntity) {
    activeViewer.entities.remove(state.tagBillboardEntity);
    state.tagBillboardEntity = null;
  }

  state.autoMarkerMode = 'billboard';
  if (!state.popupMeta) {
    state.popupMeta = getPlantZonePopupPreset(state.colorIndex);
  }
  if (!state.tealMarkerMeta) {
    state.tealMarkerMeta = getPlantZoneTealTagPreset(state.colorIndex);
  }

  const meta = buildPlantZoneTagMeta(state);
  // 信息牌文案未就绪（后端未返回）时跳过绘制，不回灌本地假文案
  if (!meta) return;
  state.tagMeta = meta;
  const theme = getPlantZoneTagThemeFromState(state);
  const tagCanvas = createPlantZoneTagCombinedCanvas(meta, theme, 0);
  plantTagCanvasByZone.set(zoneKey, tagCanvas);

  const tagId = `${zoneKey}-plant-tag`;
  plantTagBillboardIds.push(tagId);

  const tagEntity = activeViewer.entities.add({
    id: tagId,
    show: shouldShowPlantZoneTagForState(state),
    position: createPlantTagBillboardPositionProperty(state),
    billboard: {
      image: tagCanvas,
      width: PLANT_TAG_BILLBOARD_WIDTH,
      height: PLANT_TAG_COMBINED_HEIGHT,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      sizeInMeters: false,
      scale: createPlantTagBillboardScaleProperty(state),
    },
  });
  state.tagBillboardEntity = tagEntity;
}

/** AI 诊断完成：在最后飞入区块显示检查结果异常告警标签 */
function _createAiDiagnosisAlarmBillboardForZone(activeViewer, zoneKey) {
  const state = plantHoverStates.get(zoneKey);
  if (!activeViewer || !state) return;

  if (state.tagBillboardEntity) {
    activeViewer.entities.remove(state.tagBillboardEntity);
    state.tagBillboardEntity = null;
  }

  const preset = getPlantZonePopupPreset(state.colorIndex);
  // 信息牌文案未就绪（后端未返回）时跳过绘制，不回灌本地假文案
  if (!preset) return;
  const meta = {
    title: '反应器',
    location: preset.location,
    status: '异常',
  };

  state.autoMarkerMode = 'billboard';
  state.tagVariant = 'ai-diagnosis-alarm';
  state.tagMeta = meta;
  const tagCanvas = createAiDiagnosisAlarmTagCanvas(meta, 0);
  plantTagCanvasByZone.set(zoneKey, tagCanvas);

  const tagId = `${zoneKey}-plant-tag`;
  plantTagBillboardIds.push(tagId);

  const tagEntity = activeViewer.entities.add({
    id: tagId,
    show: shouldShowPlantZoneTagForState(state),
    position: createPlantTagBillboardPositionProperty(state),
    billboard: {
      image: tagCanvas,
      width: PLANT_TAG_BILLBOARD_WIDTH,
      height: PLANT_TAG_COMBINED_HEIGHT,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      sizeInMeters: false,
      scale: createPlantTagBillboardScaleProperty(state),
    },
  });
  state.tagBillboardEntity = tagEntity;
}

/** 方案 C：单 Billboard，贴图上方信息牌、下方标点（锚点=地面标点） */
function initPlantBillboardMarkers(activeViewer) {
  if (!activeViewer) return;
  destroyPlantBillboardMarkers(activeViewer);

  for (const zoneKey of plantHoverStates.keys()) {
    createPlantBillboardForZone(activeViewer, zoneKey);
  }

  startPlantTagPinAnimation(activeViewer);
  activeViewer.scene.requestRender();
}

function isPlantWireframeDecorationId(id) {
  const s = String(id ?? '');
  return s.endsWith('-wire-top') || s.endsWith('-wire-bottom') || s.includes('-wire-vert-');
}

function isPlantFrameDecorationId(id) {
  const s = String(id ?? '');
  return s.endsWith('-silhouette-model') || isPlantWireframeDecorationId(s);
}

function getPlantElevatedMix(state) {
  if (!state.hoverExpanded) return 0;
  return Cesium.Math.clamp(state.liftProgress, 0, 1);
}

function isPlantTagEntityId(entityId) {
  return String(entityId ?? '').endsWith('-plant-tag');
}

function isPlantZoneEntity(entity) {
  const id = String(entity.id ?? '');
  if (
    isPlantTagEntityId(id) ||
    id.endsWith('-side-wall') ||
    id.endsWith('-line-glow') ||
    id.endsWith('-rim-line') ||
    isPlantFrameDecorationId(id)
  ) {
    return false;
  }
  return plantZoneEntityById.has(id) || !!entity.polygon;
}

function getPlantZoneEntities(dataSource) {
  return [...dataSource.entities.values].filter(isPlantZoneEntity);
}

/** 仅 rest / expanded 两档 glTF，生长过程只改 position 不重建模型 */
function getPlantBlockGltfMode(state) {
  if (state.hoverExpanded || state.liftAnimating || state.liftProgress > 0.001) {
    return 'expanded';
  }
  return 'rest';
}

const glbScratchWorld = new Cesium.Cartesian3();
const glbScratchLocal = new Cesium.Cartesian3();
const glbInvEnu = new Cesium.Matrix4();

/** 轮廓整体上移量 = 当前体块高度（与填色挤出厚度一致） */
function getPlantSilhouetteVerticalOffset(state) {
  return getPlantBlockTop(state) - getPlantBlockBottom(state);
}

/** 与填色相同的地形高度 + bottom/top，再整体上移一个体块高度 */
function buildPlantExtrudedWorldRings(state) {
  const bottom = getPlantBlockBottom(state);
  const top = getPlantBlockTop(state);
  const extraUp = getPlantSilhouetteVerticalOffset(state);
  const bottomRing = state.cartographics.map((carto) =>
    Cesium.Cartesian3.fromRadians(
      carto.longitude,
      carto.latitude,
      (carto.height ?? 0) + bottom + extraUp,
    ),
  );
  const topRing = state.cartographics.map((carto) =>
    Cesium.Cartesian3.fromRadians(
      carto.longitude,
      carto.latitude,
      (carto.height ?? 0) + top + extraUp,
    ),
  );
  return { bottomRing, topRing };
}

function averageCartesian3(points) {
  let x = 0;
  let y = 0;
  let z = 0;
  for (const p of points) {
    x += p.x;
    y += p.y;
    z += p.z;
  }
  const n = points.length;
  return new Cesium.Cartesian3(x / n, y / n, z / n);
}

function computePlantSilhouetteRtcCenter(state) {
  const cartographics = state.cartographics;
  if (!cartographics?.length) return undefined;
  const { bottomRing } = buildPlantExtrudedWorldRings(state);
  return averageCartesian3(bottomRing);
}

function buildPlantSilhouetteGeometry(state) {
  const cartographics = state.cartographics;
  if (!cartographics?.length || cartographics.length < 3) return undefined;

  const { bottomRing, topRing } = buildPlantExtrudedWorldRings(state);
  const rtcCenter = averageCartesian3(bottomRing);
  const enu = Cesium.Transforms.eastNorthUpToFixedFrame(rtcCenter);
  const invEnu = Cesium.Matrix4.inverse(enu, glbInvEnu);
  const ring2d = bottomRing.map((p) => {
    const local = Cesium.Matrix4.multiplyByPoint(invEnu, p, new Cesium.Cartesian3());
    return new Cesium.Cartesian2(local.x, local.y);
  });
  const tri2d = Cesium.PolygonPipeline.triangulate(ring2d);
  if (!tri2d?.length) return undefined;

  const n = bottomRing.length;
  const values = new Float64Array(n * 2 * 3);
  for (let i = 0; i < n; i++) {
    values[i * 3] = bottomRing[i].x;
    values[i * 3 + 1] = bottomRing[i].y;
    values[i * 3 + 2] = bottomRing[i].z;
    values[(n + i) * 3] = topRing[i].x;
    values[(n + i) * 3 + 1] = topRing[i].y;
    values[(n + i) * 3 + 2] = topRing[i].z;
  }

  const indices = [];
  for (let i = 0; i < tri2d.length; i += 3) {
    indices.push(tri2d[i] + n, tri2d[i + 1] + n, tri2d[i + 2] + n);
  }
  for (let i = 0; i < tri2d.length; i += 3) {
    indices.push(tri2d[i + 2], tri2d[i + 1], tri2d[i]);
  }
  for (let i = 0; i < n; i++) {
    const next = (i + 1) % n;
    indices.push(i, n + i, n + next, i, n + next, next);
  }

  const geometry = new Cesium.Geometry({
    attributes: {
      position: new Cesium.GeometryAttribute({
        componentDatatype: Cesium.ComponentDatatype.DOUBLE,
        componentsPerAttribute: 3,
        values,
      }),
    },
    indices: indices.length > 65535 ? new Uint32Array(indices) : new Uint16Array(indices),
    primitiveType: Cesium.PrimitiveType.TRIANGLES,
    boundingSphere: Cesium.BoundingSphere.fromVertices(values),
  });

  return {
    geometry: Cesium.GeometryPipeline.computeNormal(geometry),
    rtcCenter,
  };
}

/**
 * ENU 米制 (east,north,up) -> glTF 坐标。
 * Cesium 对 glTF2 依次做 Y_UP_TO_Z_UP 与 Z_UP_TO_X_UP，合成后 (gx,gy,gz) 满足 (-gz,gx,-gy)=(e,n,u)。
 */
function enuToGltfVertex(east, north, up) {
  // 沿 ENU 东向（X）翻转
  return { x: north, y: -up, z: east };
}

function encodeWorldGeometryAsGlb(geometry, rtcCenter) {
  const ecefPositions = geometry.attributes.position.values;
  const ecefNormals = geometry.attributes.normal?.values;
  const indices = geometry.indices;
  const vertexCount = ecefPositions.length / 3;
  if (!ecefNormals) {
    throw new Error('轮廓网格缺少法线');
  }

  const enu = Cesium.Transforms.eastNorthUpToFixedFrame(rtcCenter);
  const invEnu = Cesium.Matrix4.inverse(enu, glbInvEnu);

  const verts = new Float32Array(vertexCount * 3);
  const norms = new Float32Array(vertexCount * 3);
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];

  for (let i = 0; i < vertexCount; i++) {
    glbScratchWorld.x = ecefPositions[i * 3];
    glbScratchWorld.y = ecefPositions[i * 3 + 1];
    glbScratchWorld.z = ecefPositions[i * 3 + 2];
    Cesium.Matrix4.multiplyByPoint(invEnu, glbScratchWorld, glbScratchLocal);
    const g = enuToGltfVertex(glbScratchLocal.x, glbScratchLocal.y, glbScratchLocal.z);
    verts[i * 3] = g.x;
    verts[i * 3 + 1] = g.y;
    verts[i * 3 + 2] = g.z;

    glbScratchWorld.x = ecefNormals[i * 3];
    glbScratchWorld.y = ecefNormals[i * 3 + 1];
    glbScratchWorld.z = ecefNormals[i * 3 + 2];
    const nlen = Cesium.Cartesian3.magnitude(glbScratchWorld);
    if (nlen > 1e-6) {
      Cesium.Cartesian3.divideByScalar(glbScratchWorld, nlen, glbScratchWorld);
    }
    Cesium.Matrix4.multiplyByPointAsVector(invEnu, glbScratchWorld, glbScratchLocal);
    const nLocalLen = Cesium.Cartesian3.magnitude(glbScratchLocal);
    if (nLocalLen > 1e-6) {
      Cesium.Cartesian3.divideByScalar(glbScratchLocal, nLocalLen, glbScratchLocal);
    }
    const gn = enuToGltfVertex(glbScratchLocal.x, glbScratchLocal.y, glbScratchLocal.z);
    norms[i * 3] = gn.x;
    norms[i * 3 + 1] = gn.y;
    norms[i * 3 + 2] = gn.z;

    for (let j = 0; j < 3; j++) {
      min[j] = Math.min(min[j], verts[i * 3 + j]);
      max[j] = Math.max(max[j], verts[i * 3 + j]);
    }
  }

  const indexComponentType = vertexCount > 65535 ? 5125 : 5123;
  const indicesArray = vertexCount > 65535 ? new Uint32Array(indices) : new Uint16Array(indices);
  const vertexByteLength = verts.byteLength;
  const normalByteLength = norms.byteLength;
  const indexByteLength = indicesArray.byteLength;
  const bufferLength = vertexByteLength + normalByteLength + indexByteLength;
  const paddedBufferLength = (bufferLength + 3) & ~3;

  const gltf = {
    asset: { version: '2.0' },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0 }],
    meshes: [
      {
        primitives: [
          {
            attributes: { POSITION: 0, NORMAL: 1 },
            indices: 2,
            mode: 4,
          },
        ],
      },
    ],
    accessors: [
      {
        bufferView: 0,
        componentType: 5126,
        count: vertexCount,
        type: 'VEC3',
        min,
        max,
      },
      {
        bufferView: 1,
        componentType: 5126,
        count: vertexCount,
        type: 'VEC3',
      },
      {
        bufferView: 2,
        componentType: indexComponentType,
        count: indices.length,
        type: 'SCALAR',
      },
    ],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: vertexByteLength, target: 34962 },
      { buffer: 0, byteOffset: vertexByteLength, byteLength: normalByteLength, target: 34962 },
      {
        buffer: 0,
        byteOffset: vertexByteLength + normalByteLength,
        byteLength: indexByteLength,
        target: 34963,
      },
    ],
    buffers: [{ byteLength: paddedBufferLength }],
  };

  const jsonText = JSON.stringify(gltf);
  const jsonBytes = new TextEncoder().encode(jsonText);
  const jsonChunkLength = (jsonBytes.length + 3) & ~3;
  const jsonChunk = new Uint8Array(jsonChunkLength);
  jsonChunk.set(jsonBytes);
  for (let i = jsonBytes.length; i < jsonChunkLength; i++) {
    jsonChunk[i] = 0x20;
  }

  const binChunk = new Uint8Array(paddedBufferLength);
  binChunk.set(new Uint8Array(verts.buffer), 0);
  binChunk.set(new Uint8Array(norms.buffer), vertexByteLength);
  binChunk.set(new Uint8Array(indicesArray.buffer), vertexByteLength + normalByteLength);

  const totalLength = 12 + 8 + jsonChunkLength + 8 + paddedBufferLength;
  const glb = new ArrayBuffer(totalLength);
  const view = new DataView(glb);
  view.setUint32(0, 0x46546c67, true);
  view.setUint32(4, 2, true);
  view.setUint32(8, totalLength, true);

  let offset = 12;
  view.setUint32(offset, jsonChunkLength, true);
  offset += 4;
  view.setUint32(offset, 0x4e4f534a, true);
  offset += 4;
  new Uint8Array(glb, offset, jsonChunkLength).set(jsonChunk);
  offset += jsonChunkLength;

  view.setUint32(offset, paddedBufferLength, true);
  offset += 4;
  view.setUint32(offset, 0x004e4942, true);
  offset += 4;
  new Uint8Array(glb, offset, paddedBufferLength).set(binChunk);

  return glb;
}

function applyPlantBlockModelUri(state, uri) {
  const modelGraphics = state.blockModelEntity?.model;
  if (!modelGraphics) return;
  modelGraphics.uri = new Cesium.ConstantProperty(uri);
  modelGraphics._definitionChanged.raiseEvent(modelGraphics);
}

function revokePlantBlockGltf(state) {
  if (state.blockModelBlobUrl) {
    URL.revokeObjectURL(state.blockModelBlobUrl);
    state.blockModelBlobUrl = undefined;
  }
  state.blockModelUri = undefined;
  state.blockModelGltfKey = undefined;
  state.blockModelRtcCenter = undefined;
  state.blockModelPrimitive = undefined;
  applyPlantBlockModelUri(state, undefined);
}

async function resamplePlantTerrain(state) {
  if (!viewer || !state.openRing?.length) return;
  state.cartographics = await sampleOpenRingTerrain(viewer, state.openRing);
}

/** 按 rest/expanded 生成 glTF；变高动画仅更新 Entity.position */
async function ensurePlantBlockGltf(state, options = {}) {
  if (!viewer || !state.blockModelEntity) return;

  const mode = getPlantBlockGltfMode(state);
  if (!options.force && state.blockModelGltfKey === mode && state.blockModelUri) return;

  if (state.blockModelGltfPending) {
    state.blockModelGltfDirty = true;
    return;
  }

  state.blockModelGltfPending = true;
  state.blockModelGltfDirty = false;
  try {
    if (options.resampleTerrain !== false) {
      await resamplePlantTerrain(state);
    }
    const built = buildPlantSilhouetteGeometry(state);
    if (!built) return;

    const glb = encodeWorldGeometryAsGlb(built.geometry, built.rtcCenter);

    if (state.blockModelBlobUrl) {
      URL.revokeObjectURL(state.blockModelBlobUrl);
    }
    state.blockModelRtcCenter = Cesium.Cartesian3.clone(built.rtcCenter);
    state.blockModelBlobUrl = URL.createObjectURL(new Blob([glb], { type: 'model/gltf-binary' }));
    state.blockModelUri = state.blockModelBlobUrl;
    state.blockModelGltfKey = mode;
    state.blockModelPrimitive = undefined;
    applyPlantBlockModelUri(state, state.blockModelUri);
    viewer.scene.requestRender();
  } catch (err) {
    console.warn('装置区 glTF 体块生成失败', state.entity?.id, err);
  } finally {
    state.blockModelGltfPending = false;
    if (state.blockModelGltfDirty) {
      state.blockModelGltfDirty = false;
      void ensurePlantBlockGltf(state, { resampleTerrain: false, force: true });
    }
  }
}

function createPlantWireframeRingPositionsProperty(state, getHeight) {
  return new Cesium.CallbackProperty(() => {
    if (!shouldShowPlantWireframe(state) || !state.cartographics?.length) {
      return [];
    }
    const height = getHeight(state);
    const positions = state.cartographics.map((carto) =>
      Cesium.Cartesian3.fromRadians(carto.longitude, carto.latitude, height),
    );
    if (!positions.length) return positions;
    positions.push(Cesium.Cartesian3.clone(positions[0]));
    return positions;
  }, false);
}

function createPlantWireframeVerticalPositionsProperty(state, vertexIndex) {
  return new Cesium.CallbackProperty(() => {
    if (!shouldShowPlantWireframe(state) || !state.cartographics?.length) {
      return [];
    }
    const carto = state.cartographics[vertexIndex];
    if (!carto) return [];
    const bottom = getPlantBlockBottom(state);
    const top = getPlantBlockTop(state);
    return [
      Cesium.Cartesian3.fromRadians(carto.longitude, carto.latitude, bottom),
      Cesium.Cartesian3.fromRadians(carto.longitude, carto.latitude, top),
    ];
  }, false);
}

function createPlantWireframeLineMaterialProperty(state) {
  return new Cesium.ColorMaterialProperty(
    new Cesium.CallbackProperty(() => getPlantWireframeLineColor(state), false),
  );
}

function attachPlantWireframeEntities(dataSource, state) {
  if (!state.cartographics?.length) return;

  const { showBottomRing } = MAP_THEME.plantWireframe;
  const lineCommon = {
    width: new Cesium.CallbackProperty(() => getPlantWireframeLineWidth(state), false),
    show: new Cesium.CallbackProperty(() => shouldShowPlantWireframe(state), false),
    material: createPlantWireframeLineMaterialProperty(state),
    clampToGround: false,
    arcType: Cesium.ArcType.NONE,
  };

  state.wireframeTopEntity = dataSource.entities.add({
    id: `${state.entity.id}-wire-top`,
    polyline: {
      positions: createPlantWireframeRingPositionsProperty(state, getPlantBlockTop),
      ...lineCommon,
    },
  });

  state.wireframeBottomEntity = null;
  if (showBottomRing) {
    state.wireframeBottomEntity = dataSource.entities.add({
      id: `${state.entity.id}-wire-bottom`,
      polyline: {
        positions: createPlantWireframeRingPositionsProperty(state, getPlantBlockBottom),
        ...lineCommon,
      },
    });
  }

  state.wireframeVertEntities = [];
  for (let i = 0; i < state.cartographics.length; i++) {
    const vertEntity = dataSource.entities.add({
      id: `${state.entity.id}-wire-vert-${i}`,
      polyline: {
        positions: createPlantWireframeVerticalPositionsProperty(state, i),
        ...lineCommon,
      },
    });
    state.wireframeVertEntities.push(vertEntity);
  }
}

function attachPlantBlockModel(dataSource, state) {
  const { colorBlendAmount } = MAP_THEME.plantModelSilhouette;

  state.blockModelUri = undefined;
  state.blockModelGltfKey = undefined;
  state.blockModelBlobUrl = undefined;
  state.blockModelRtcCenter = undefined;
  state.blockModelGltfPending = false;
  state.blockModelPrimitive = undefined;

  state.blockModelEntity = dataSource.entities.add({
    id: `${state.entity.id}-silhouette-model`,
    position: new Cesium.CallbackProperty(
      () => computePlantSilhouetteRtcCenter(state) ?? state.blockModelRtcCenter,
      false,
    ),
    model: new Cesium.ModelGraphics({
      uri: new Cesium.CallbackProperty(() => state.blockModelUri, false),
      heightReference: Cesium.HeightReference.NONE,
      scale: 1,
      show: new Cesium.CallbackProperty(() => shouldShowPlantBlockModel(state), false),
      color: new Cesium.CallbackProperty(() => {
        return new Cesium.Color(state.baseRed, state.baseGreen, state.baseBlue, state.alpha);
      }, false),
      silhouetteColor: new Cesium.CallbackProperty(() => {
        if (!shouldShowPlantWireframe(state)) {
          return Cesium.Color.TRANSPARENT;
        }
        return getPlantWireframeLineColor(state);
      }, false),
      silhouetteSize: new Cesium.CallbackProperty(() => {
        if (!shouldShowPlantWireframe(state)) return 0;
        return getPlantWireframeSilhouetteSize(state);
      }, false),
      colorBlendMode: Cesium.ColorBlendMode.MIX,
      colorBlendAmount,
    }),
  });
}

function destroyAllPlantBlockGltfs() {
  for (const state of plantHoverStates.values()) {
    revokePlantBlockGltf(state);
    state.blockModelGltfPending = false;
  }
}

function getPlantExpandedHeight(state) {
  return state.frameHeight * MAP_THEME.plantHoverHeightMultiplier;
}

function getPlantLiftOffset(state) {
  if (!state.hoverExpanded) return 0;
  const expandedH = getPlantExpandedHeight(state);
  return state.liftProgress * (expandedH - state.frameHeight);
}

/** 体块底面高度（相对地形采样） */
function getPlantBlockBottom(state) {
  if (!state.hoverExpanded) {
    return state.anchorBottom;
  }
  const expandedH = getPlantExpandedHeight(state);
  return state.restingTop - expandedH + getPlantLiftOffset(state);
}

/** 体块顶面高度（相对地形采样） */
function getPlantBlockTop(state) {
  if (!state.hoverExpanded) {
    return state.restingTop;
  }
  return state.restingTop + getPlantLiftOffset(state);
}

function _createPlantBlockHeightProperty(state, getHeight) {
  return new Cesium.CallbackProperty(() => getHeight(state), false);
}

function _createPlantBlockHierarchyProperty(state) {
  return new Cesium.CallbackProperty(() => {
    if (!state.cartographics?.length) return new Cesium.PolygonHierarchy([]);
    const positions = state.cartographics.map((carto) =>
      Cesium.Cartesian3.fromRadians(carto.longitude, carto.latitude, 0),
    );
    return new Cesium.PolygonHierarchy(positions);
  }, false);
}

function buildPlantFlatSurfaceHierarchy(state) {
  if (!state.cartographics?.length) return new Cesium.PolygonHierarchy([]);
  const stagger = (state.colorIndex ?? 0) * ACCIDENT_RESCUE_FLAT.zoneSurfaceStagger;
  const positions = state.cartographics.map((carto) =>
    Cesium.Cartesian3.fromRadians(
      carto.longitude,
      carto.latitude,
      (carto.height ?? 0) + ACCIDENT_RESCUE_FLAT.zoneSurfaceOffset + stagger,
    ),
  );
  return new Cesium.PolygonHierarchy(positions);
}

function buildBoundaryFlatEdgePositions(cartographics) {
  const edge = positionsFromCartographics(cartographics, ACCIDENT_RESCUE_FLAT.boundaryEdgeOffset);
  return [...edge, Cesium.Cartesian3.clone(edge[0])];
}

function buildBoundaryFlatFillHierarchy(cartographics) {
  const positions = positionsFromCartographics(
    cartographics,
    ACCIDENT_RESCUE_FLAT.enterpriseFillOffset,
  );
  return new Cesium.PolygonHierarchy(positions);
}

function registerAccidentRescueBoundaryFillMaterial() {
  if (accidentRescueBoundaryFillMaterialRegistered) return;
  accidentRescueBoundaryFillMaterialRegistered = true;

  Cesium.Material._materialCache.addMaterial('AccidentRescueBoundaryFill', {
    fabric: {
      type: 'AccidentRescueBoundaryFill',
      uniforms: {
        fillColor: new Cesium.Color(0.161, 0.624, 1.0, 0.2),
        glowColor: new Cesium.Color(0.0, 0.933, 1.0, 0.62),
        glowWidth: 0.16,
        glowStrength: 0.78,
      },
      source: `
        czm_material czm_getMaterial(czm_materialInput materialInput)
        {
          czm_material material = czm_getDefaultMaterial(materialInput);
          vec2 st = materialInput.st;
          float edgeDist = min(min(st.s, 1.0 - st.s), min(st.t, 1.0 - st.t));
          float glow = 1.0 - smoothstep(0.0, glowWidth, edgeDist);
          vec3 rgb = mix(fillColor.rgb, glowColor.rgb, glow * glowStrength);
          float alpha = mix(fillColor.a, glowColor.a, glow * glowStrength);
          material.diffuse = rgb;
          material.alpha = clamp(alpha, 0.0, 1.0);
          material.emission = glowColor.rgb * glow * 0.42;
          return material;
        }
      `,
    },
    translucent: true,
  });
}

function registerEvacuationRouteFlowMaterial() {
  if (evacuationRouteMaterialRegistered) return;
  evacuationRouteMaterialRegistered = true;

  Cesium.Material._materialCache.addMaterial('EvacuationRouteFlow', {
    fabric: {
      type: 'EvacuationRouteFlow',
      uniforms: {
        color: new Cesium.Color(1.0, 0.85, 0.2, 1.0),
        speed: 0.9,
        repeat: 18.0,
        time: 0.0,
      },
      source: `
        czm_material czm_getMaterial(czm_materialInput materialInput)
        {
          czm_material material = czm_getDefaultMaterial(materialInput);
          vec2 st = materialInput.st;

          float x = fract(st.s * repeat - time * speed);
          float head = smoothstep(0.0, 0.08, x) * (1.0 - smoothstep(0.16, 0.26, x));
          float trail = (1.0 - smoothstep(0.18, 0.55, x)) * 0.35;
          float strength = clamp(head + trail, 0.0, 1.0);

          material.diffuse = mix(vec3(0.12, 0.12, 0.12), color.rgb, strength);
          material.alpha = clamp(0.35 + strength * 0.75, 0.0, 1.0) * color.a;
          material.emission = color.rgb * strength * 0.75;
          return material;
        }
      `,
    },
    translucent: true,
  });
}

function EvacuationRouteFlowMaterialProperty(options) {
  this._definitionChanged = new Cesium.Event();
  this._color = options?.color ?? Cesium.Color.fromCssColorString('#ffd54a').withAlpha(0.95);
  this._speed = options?.speed ?? 0.9;
  this._repeat = options?.repeat ?? 18.0;
  this._start = Cesium.JulianDate.now();
}

Object.defineProperties(EvacuationRouteFlowMaterialProperty.prototype, {
  isConstant: {
    get() {
      return false;
    },
  },
  definitionChanged: {
    get() {
      return this._definitionChanged;
    },
  },
});

EvacuationRouteFlowMaterialProperty.prototype.getType = function () {
  return 'EvacuationRouteFlow';
};

EvacuationRouteFlowMaterialProperty.prototype.getValue = function (time, result) {
  if (!result) result = {};
  const t = Cesium.JulianDate.secondsDifference(time, this._start);
  result.color = this._color;
  result.speed = this._speed;
  result.repeat = this._repeat;
  result.time = t;
  return result;
};

EvacuationRouteFlowMaterialProperty.prototype.equals = function (other) {
  return other instanceof EvacuationRouteFlowMaterialProperty;
};

function createEvacuationRouteFlowMaterial(options) {
  registerEvacuationRouteFlowMaterial();
  return new EvacuationRouteFlowMaterialProperty(options);
}

function createAccidentRescueBoundaryFillMaterial() {
  registerAccidentRescueBoundaryFillMaterial();
  return new AccidentRescueBoundaryFillMaterialProperty();
}

function AccidentRescueBoundaryFillMaterialProperty() {
  this._definitionChanged = new Cesium.Event();
}

Object.defineProperties(AccidentRescueBoundaryFillMaterialProperty.prototype, {
  isConstant: {
    get() {
      return true;
    },
  },
  definitionChanged: {
    get() {
      return this._definitionChanged;
    },
  },
});

AccidentRescueBoundaryFillMaterialProperty.prototype.getType = function () {
  return 'AccidentRescueBoundaryFill';
};

AccidentRescueBoundaryFillMaterialProperty.prototype.getValue = function (_time, result) {
  if (!result) result = {};
  result.fillColor = Cesium.Color.fromCssColorString(ACCIDENT_RESCUE_FLAT.boundaryFill).withAlpha(
    ACCIDENT_RESCUE_FLAT.boundaryFillAlpha,
  );
  result.glowColor = Cesium.Color.fromCssColorString(ACCIDENT_RESCUE_FLAT.boundaryStroke).withAlpha(
    0.62,
  );
  result.glowWidth = 0.16;
  result.glowStrength = 0.78;
  return result;
};

AccidentRescueBoundaryFillMaterialProperty.prototype.equals = function (other) {
  return other instanceof AccidentRescueBoundaryFillMaterialProperty;
};

function attachPlantFlatSurfaceEntity(dataSource, state) {
  const { line } = getPlantAreaStyle(state.colorIndex);
  const fillColor = new Cesium.Color(state.baseRed, state.baseGreen, state.baseBlue, 0.5);
  state.flatSurfaceEntity = dataSource.entities.add({
    id: `${state.entity.id}-flat-surface`,
    polygon: {
      hierarchy: buildPlantFlatSurfaceHierarchy(state),
      perPositionHeight: true,
      material: fillColor,
      outline: true,
      outlineColor: Cesium.Color.fromCssColorString(line),
      outlineWidth: 1.4,
      show: true,
    },
  });
}

/** 仅事故救援顶视模式懒创建，离开即销毁，避免拖慢其他页面 */
function ensurePlantFlatSurfaceEntities() {
  if (!overviewPlantDataSource) return;
  for (const state of plantHoverStates.values()) {
    if (state.flatSurfaceEntity) continue;
    attachPlantFlatSurfaceEntity(overviewPlantDataSource, state);
  }
}

function destroyPlantFlatSurfaceEntities() {
  if (!overviewPlantDataSource) return;
  for (const state of plantHoverStates.values()) {
    if (!state.flatSurfaceEntity) continue;
    overviewPlantDataSource.entities.remove(state.flatSurfaceEntity);
    state.flatSurfaceEntity = null;
  }
}

/** 内部分区：全程 glTF 体块；生长时随 bottom/top 拉高 */
async function stylePlantEntities(viewer, dataSource, prefix) {
  ensureEntityIds(dataSource, prefix);
  dataSource.name = '装置区';
  const { plantHeight, plantFrameHeight } = MAP_THEME;

  plantHoverStates.clear();
  plantZoneEntityById.clear();

  let plantIndex = 0;
  for (const entity of getPlantZoneEntities(dataSource)) {
    const { fill } = getPlantAreaStyle(plantIndex);
    plantIndex += 1;
    const hierarchy = entity.polygon.hierarchy.getValue(Cesium.JulianDate.now());
    if (!hierarchy) continue;

    const ring = hierarchy.positions;
    if (!ring?.length) continue;

    const openRing = ringWithoutDuplicateClose(ring);
    const cartographics = await sampleOpenRingTerrain(viewer, openRing);

    const baseColor = Cesium.Color.fromCssColorString(fill);
    baseColor.alpha = MAP_THEME.plantBaseAlpha;
    const anchorBottom = plantHeight;
    const frameHeight = plantFrameHeight;
    const restingTop = anchorBottom + frameHeight;
    const state = {
      entity,
      openRing,
      cartographics,
      colorIndex: (plantIndex - 1) % MAP_THEME.colors.plantPalette.length,
      popupMeta: getPlantZonePopupPreset(plantIndex - 1),
      tealMarkerMeta: getPlantZoneTealTagPreset(plantIndex - 1),
      autoMarkerMode: null,
      anchorBottom,
      frameHeight,
      restingTop,
      hovered: false,
      selected: false,
      plantElevatedActive: false,
      needsHoverGrow: false,
      hoverExpanded: false,
      visualEpoch: 0,
      collapseEpoch: 0,
      liftProgress: 0,
      liftAnimating: false,
      liftAnimStartMs: 0,
      liftAnimFrom: 0,
      liftAnimTo: 0,
      baseRed: baseColor.red,
      baseGreen: baseColor.green,
      baseBlue: baseColor.blue,
      alpha: MAP_THEME.plantBaseAlpha,
      targetAlpha: MAP_THEME.plantBaseAlpha,
    };
    plantHoverStates.set(toPlantZoneKey(entity.id), state);
    plantZoneEntityById.set(toPlantZoneKey(entity.id), entity);

    entity.polygon = undefined;
    entity.wall = undefined;
    entity.polyline = undefined;

    attachPlantBlockModel(dataSource, state);
    attachPlantWireframeEntities(dataSource, state);
    void ensurePlantBlockGltf(state);
  }
}

function normalizePlantZoneEntityId(entityId) {
  const id = String(entityId ?? '');
  if (id.endsWith('-silhouette-model')) {
    return id.slice(0, -'-silhouette-model'.length);
  }
  if (id.endsWith('-side-wall')) {
    return id.slice(0, -'-side-wall'.length);
  }
  return id;
}

function resolvePickedPlantEntity(picked) {
  if (!Cesium.defined(picked)) return null;

  const primitive = picked.primitive;
  if (primitive instanceof Cesium.Model) {
    const modelOwner = primitive.id;
    if (modelOwner instanceof Cesium.Entity) {
      const zoneId = normalizePlantZoneEntityId(modelOwner.id);
      const zoneEntity = plantZoneEntityById.get(zoneId);
      if (zoneEntity) return zoneEntity;
      if (isPlantZoneEntity(modelOwner)) return modelOwner;
    }
  }

  let entity = picked.id;
  if (!(entity instanceof Cesium.Entity)) {
    if (picked instanceof Cesium.Entity) {
      entity = picked;
    } else {
      return null;
    }
  }

  if (isPlantTagEntityId(entity.id)) {
    const zoneKey = String(entity.id).slice(0, -'-plant-tag'.length);
    return plantZoneEntityById.get(zoneKey) ?? null;
  }

  const zoneId = normalizePlantZoneEntityId(entity.id);
  const zoneEntity = plantZoneEntityById.get(zoneId);
  if (zoneEntity) return zoneEntity;
  return isPlantZoneEntity(entity) ? entity : null;
}

/** 是否射线命中装置区 glTF 体块（非地面投影外盒） */
function isPlantBlockModelPick(picked) {
  if (!Cesium.defined(picked)) return false;
  const primitive = picked.primitive;
  if (!(primitive instanceof Cesium.Model)) return false;
  const modelOwner = primitive.id;
  if (!(modelOwner instanceof Cesium.Entity)) return false;
  return String(modelOwner.id ?? '').endsWith('-silhouette-model');
}

function getPlantZoneLonLatRing(state) {
  if (!state.cartographics?.length) return null;
  return state.cartographics.map((carto) => ({
    lon: Cesium.Math.toDegrees(carto.longitude),
    lat: Cesium.Math.toDegrees(carto.latitude),
  }));
}

function pickPlantZoneByGlobePosition(viewer, windowPosition) {
  const ray = viewer.camera.getPickRay(windowPosition);
  if (!ray) return null;
  const cartesian =
    viewer.scene.globe.pick(ray, viewer.scene) ??
    viewer.camera.pickEllipsoid(windowPosition, viewer.scene.globe.ellipsoid);
  if (!cartesian) return null;

  const carto = Cesium.Cartographic.fromCartesian(cartesian);
  const lon = Cesium.Math.toDegrees(carto.longitude);
  const lat = Cesium.Math.toDegrees(carto.latitude);

  for (const state of plantHoverStates.values()) {
    const ring = getPlantZoneLonLatRing(state);
    if (ring && pointInLonLatRing(lon, lat, ring)) {
      return state.entity;
    }
  }
  return null;
}

function pickPlantZoneEntity(viewer, windowPosition, options = {}) {
  const requireModelHit = options.requireModelHit === true;

  const drillResults = viewer.scene.drillPick(windowPosition, 12);
  for (let i = 0; i < drillResults.length; i++) {
    const picked = drillResults[i];
    if (requireModelHit && !isPlantBlockModelPick(picked)) continue;
    const entity = resolvePickedPlantEntity(picked);
    if (entity) {
      cachePlantBlockModelPrimitive(entity, picked);
      return entity;
    }
  }

  const picked = viewer.scene.pick(windowPosition);
  if (!requireModelHit || isPlantBlockModelPick(picked)) {
    const entity = resolvePickedPlantEntity(picked);
    if (entity) {
      cachePlantBlockModelPrimitive(entity, picked);
      return entity;
    }
  }

  if (requireModelHit) return null;
  return pickPlantZoneByGlobePosition(viewer, windowPosition);
}

function isRenderablePlantBlockModel(model) {
  return (
    model instanceof Cesium.Model &&
    model.ready &&
    !model.isDestroyed() &&
    model.pickIds?.length > 0
  );
}

function cachePlantBlockModelPrimitive(zoneEntity, picked) {
  const state = plantHoverStates.get(String(zoneEntity.id ?? ''));
  if (!state?.blockModelEntity || !Cesium.defined(picked)) return;
  const primitive = picked.primitive;
  if (primitive instanceof Cesium.Model && primitive.id === state.blockModelEntity) {
    if (isRenderablePlantBlockModel(primitive)) {
      state.blockModelPrimitive = primitive;
    }
  }
}

function getPlantBlockModelOwnerId(model) {
  const owner = model?.id;
  if (owner instanceof Cesium.Entity) {
    return String(owner.id ?? '');
  }
  return String(owner ?? '');
}

function forEachViewerPrimitive(callback) {
  if (!viewer) return;
  const stack = [];
  if (viewer.scene?.primitives) {
    stack.push(viewer.scene.primitives);
  }
  const dataSourcePrimitives = viewer.dataSourceDisplay?._primitives;
  if (dataSourcePrimitives && !stack.includes(dataSourcePrimitives)) {
    stack.push(dataSourcePrimitives);
  }

  while (stack.length > 0) {
    const collection = stack.pop();
    if (!collection?.length) continue;
    for (let i = 0; i < collection.length; i++) {
      const primitive = collection.get(i);
      if (primitive instanceof Cesium.PrimitiveCollection) {
        stack.push(primitive);
        continue;
      }
      callback(primitive);
    }
  }
}

function _findPlantBlockModelPrimitive(state) {
  const blockEntity = state.blockModelEntity;
  if (!blockEntity || !viewer) return null;

  const targetId = String(blockEntity.id ?? '');

  const cached = state.blockModelPrimitive;
  if (isRenderablePlantBlockModel(cached) && getPlantBlockModelOwnerId(cached) === targetId) {
    return cached;
  }

  let found = null;
  forEachViewerPrimitive((primitive) => {
    if (found || !(primitive instanceof Cesium.Model)) return;
    if (getPlantBlockModelOwnerId(primitive) !== targetId) return;
    if (!primitive.ready || primitive.isDestroyed?.()) return;
    found = primitive;
  });

  if (isRenderablePlantBlockModel(found)) {
    state.blockModelPrimitive = found;
    return found;
  }

  state.blockModelPrimitive = undefined;
  return null;
}

/** 常驻棱线 / Model silhouette：随体块填色，透明度跟 state.alpha；选中时略提高不透明度 */
function getPlantWireframeLineColor(state) {
  const alphaScale = state.alpha / MAP_THEME.plantBaseAlpha;
  const edgeAlpha = isPlantWireframeEmphasized(state)
    ? MAP_THEME.plantWireframe.selectedEdgeColorAlpha
    : MAP_THEME.plantWireframe.edgeColorAlpha;
  const alpha = Cesium.Math.clamp(edgeAlpha * alphaScale, 0, 1);
  return new Cesium.Color(state.baseRed, state.baseGreen, state.baseBlue, alpha);
}

function applyPlantWireframeEnabled() {
  MAP_THEME.plantWireframe.enabled = plantWireframeEnabled.value;
  if (!viewer) return;
  for (const state of plantHoverStates.values()) {
    applyPlantZoneVisual(state);
  }
  viewer.scene.requestRender();
}

function stopPlantHoverAnimationLoop() {
  if (plantHoverRafId != null) {
    cancelAnimationFrame(plantHoverRafId);
    plantHoverRafId = null;
  }
}

function runPlantHoverAnimationLoop() {
  if (!viewer || plantHoverRafId != null) return;

  const step = () => {
    const animating = tickPlantHoverAnimation();
    viewer.scene.requestRender();
    if (animating) {
      plantHoverRafId = requestAnimationFrame(step);
    } else {
      plantHoverRafId = null;
    }
  };

  plantHoverRafId = requestAnimationFrame(step);
}

function startPlantLiftAnimation(state, targetProgress) {
  if (state.liftAnimating && state.liftAnimTo === targetProgress) {
    runPlantHoverAnimationLoop();
    return;
  }
  state.liftAnimFrom = state.liftProgress;
  state.liftAnimTo = targetProgress;
  state.liftAnimating = true;
  state.liftAnimStartMs = performance.now();
  runPlantHoverAnimationLoop();
}

function isPlantZoneElevated(state) {
  return state.hovered || state.selected;
}

/** 悬停生长：已选中分区不再重复触发拉高动画 */
function shouldTriggerPlantHoverGrow(state) {
  return state.hovered && !state.selected;
}

/** 选中时首次拉高（非悬停重复触发） */
function shouldTriggerPlantSelectGrow(state) {
  return state.selected && state.liftProgress < 0.999;
}

function syncPlantZoneVisual(state) {
  state.targetAlpha = isPlantZoneElevated(state)
    ? MAP_THEME.plantElevatedAlpha
    : MAP_THEME.plantBaseAlpha;
}

function applyPlantZoneVisual(state) {
  const modelGraphics = state.blockModelEntity?.model;
  if (modelGraphics?._definitionChanged) {
    modelGraphics._definitionChanged.raiseEvent(modelGraphics);
  }

  const refreshPolyline = (entity) => {
    const polyline = entity?.polyline;
    if (polyline?._definitionChanged) {
      polyline._definitionChanged.raiseEvent(polyline);
    }
  };
  refreshPolyline(state.wireframeTopEntity);
  refreshPolyline(state.wireframeBottomEntity);
  if (state.wireframeVertEntities?.length) {
    for (const vertEntity of state.wireframeVertEntities) {
      refreshPolyline(vertEntity);
    }
  }

  const mode = getPlantBlockGltfMode(state);
  if (mode !== state.blockModelGltfKey || !state.blockModelUri) {
    void ensurePlantBlockGltf(state, { resampleTerrain: mode === 'rest' });
  }
}

/** 等待 pending 结束，避免快速切区时 expanded glTF 被跳过 */
async function ensurePlantBlockGltfWhenReady(state, options, maxFrames = 90) {
  for (let i = 0; i < maxFrames; i++) {
    await ensurePlantBlockGltf(state, options);
    const mode = getPlantBlockGltfMode(state);
    if (!state.blockModelGltfPending && state.blockModelGltfKey === mode && state.blockModelUri) {
      return true;
    }
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }
  return false;
}

/** 异步换 expanded glTF；拉高动画在 syncPlantZoneElevated 里同步启动 */
async function ensurePlantBlockGltfForElevated(state, epoch) {
  await ensurePlantBlockGltfWhenReady(state, { resampleTerrain: false, force: true });
  if (epoch !== state.visualEpoch || !isPlantZoneElevated(state)) return;
  applyPlantZoneVisual(state);
  const mayGrow =
    shouldTriggerPlantHoverGrow(state) || (state.selected && shouldTriggerPlantSelectGrow(state));
  if (mayGrow && !state.liftAnimating && state.liftProgress < 0.999) {
    startPlantLiftAnimation(state, 1);
  }
  viewer?.scene?.requestRender();
}

async function finishPlantZoneCollapse(state, epoch) {
  if (epoch !== state.visualEpoch || isPlantZoneElevated(state)) return;

  state.hoverExpanded = false;
  state.liftProgress = 0;
  await ensurePlantBlockGltf(state, { resampleTerrain: false, force: true });
  if (epoch !== state.visualEpoch || isPlantZoneElevated(state)) {
    if (isPlantZoneElevated(state)) {
      state.hoverExpanded = true;
      startPlantLiftAnimation(state, 1);
      void ensurePlantBlockGltfForElevated(state, state.visualEpoch);
    }
    return;
  }

  syncPlantZoneVisual(state);
  applyPlantZoneVisual(state);
  viewer?.scene?.requestRender();
}

function tickPlantZoneAlphaAnimation(state, alphaEase) {
  const delta = state.targetAlpha - state.alpha;
  if (Math.abs(delta) <= 0.004) {
    if (state.alpha !== state.targetAlpha) {
      state.alpha = state.targetAlpha;
      return true;
    }
    return false;
  }
  state.alpha += delta * alphaEase;
  return true;
}

function syncPlantZoneElevated(state) {
  state.visualEpoch = (state.visualEpoch ?? 0) + 1;
  const epoch = state.visualEpoch;
  const elevated = isPlantZoneElevated(state);
  const enteringElevated = elevated && !state.plantElevatedActive;
  const triggerGrow =
    shouldTriggerPlantHoverGrow(state) || (state.selected && shouldTriggerPlantSelectGrow(state));
  state.plantElevatedActive = elevated;

  syncPlantZoneVisual(state);
  applyPlantZoneVisual(state);

  if (elevated) {
    state.hoverExpanded = true;
    if (triggerGrow) {
      if (enteringElevated && shouldTriggerPlantHoverGrow(state)) {
        state.liftProgress = 0;
        state.liftAnimating = false;
      }
      startPlantLiftAnimation(state, 1);
      void ensurePlantBlockGltfForElevated(state, epoch);
    }
    return;
  }

  if (state.hoverExpanded || state.liftProgress > 0 || state.liftAnimating) {
    state.collapseEpoch = state.visualEpoch;
    startPlantLiftAnimation(state, 0);
  }
}

function setPlantZoneHovered(entityId, hovered) {
  const zoneKey = toPlantZoneKey(entityId);
  const state = getPlantHoverState(zoneKey);
  if (!state) return;

  if (hovered) {
    for (const [id, other] of plantHoverStates) {
      if (id !== zoneKey) other.needsHoverGrow = true;
    }
  } else {
    state.needsHoverGrow = false;
  }

  if (state.selected) {
    if (state.hovered === hovered) return;
    state.hovered = hovered;
    applyPlantZoneTagBillboardVisibility();
    syncPlantZoneVisual(state);
    applyPlantZoneVisual(state);
    viewer?.scene?.requestRender();
    return;
  }

  const forceResync = hovered && state.needsHoverGrow;
  if (state.hovered === hovered && !forceResync) return;

  if (forceResync) {
    state.plantElevatedActive = false;
    state.needsHoverGrow = false;
  }

  state.hovered = hovered;
  applyPlantZoneTagBillboardVisibility();
  syncPlantZoneElevated(state);
  runPlantHoverAnimationLoop();
}

function setPlantZoneSelected(entityId, selected) {
  const state = getPlantHoverState(entityId);
  if (!state || state.selected === selected) return;
  state.selected = selected;
  syncPlantZoneElevated(state);
  applyPlantZoneVisual(state);
  runPlantHoverAnimationLoop();
}

function tickPlantHoverAnimation() {
  const alphaEase = MAP_THEME.plantAlphaEase;
  const liftDurationMs = MAP_THEME.plantHoverLiftDuration * 1000;
  let animating = false;

  for (const state of plantHoverStates.values()) {
    let changed = false;

    if (state.liftAnimating) {
      const elapsed = performance.now() - state.liftAnimStartMs;
      const t = Math.min(Math.max(elapsed / liftDurationMs, 0), 1);
      state.liftProgress = state.liftAnimFrom + (state.liftAnimTo - state.liftAnimFrom) * t;

      if (t >= 1) {
        state.liftProgress = state.liftAnimTo;
        state.liftAnimating = false;
        if (state.liftAnimTo === 0) {
          if (isPlantZoneElevated(state)) {
            state.hoverExpanded = true;
            startPlantLiftAnimation(state, 1);
            void ensurePlantBlockGltfForElevated(state, state.visualEpoch);
          } else {
            void finishPlantZoneCollapse(state, state.collapseEpoch ?? state.visualEpoch);
          }
        }
      }

      animating = true;
      changed = true;
    }

    if (tickPlantZoneAlphaAnimation(state, alphaEase)) {
      animating = true;
      changed = true;
    }

    if (changed) {
      applyPlantZoneVisual(state);
    } else if (state.liftAnimating || Math.abs(state.targetAlpha - state.alpha) > 0.004) {
      animating = true;
    }
  }

  return animating;
}

function cancelPlantHoverLeaveTimer() {
  if (plantHoverLeaveTimer != null) {
    clearTimeout(plantHoverLeaveTimer);
    plantHoverLeaveTimer = null;
  }
}

function cancelPlantHoverSettleTimer() {
  if (plantHoverSettleTimer != null) {
    clearTimeout(plantHoverSettleTimer);
    plantHoverSettleTimer = null;
  }
}

function healPlantHoverGrow(zoneKey) {
  const state = getPlantHoverState(zoneKey);
  if (!state || state.selected) return false;

  if (!state.hovered || state.needsHoverGrow) {
    setPlantZoneHovered(zoneKey, true);
    return true;
  }

  const stalled =
    isPlantZoneElevated(state) &&
    (!state.hoverExpanded || state.liftProgress < 0.999) &&
    !state.liftAnimating;
  if (!stalled) return false;

  state.plantElevatedActive = false;
  syncPlantZoneElevated(state);
  runPlantHoverAnimationLoop();
  return true;
}

function schedulePlantHoverLeave() {
  if (plantHoverLeaveTimer != null) return;
  plantHoverLeaveTimer = setTimeout(() => {
    plantHoverLeaveTimer = null;
    if (!viewer || !lastPlantHoverWindowPosition) return;

    const entity = pickPlantZoneEntity(viewer, lastPlantHoverWindowPosition, {
      requireModelHit: true,
    });
    const pickId = entity?.id != null ? toPlantZoneKey(entity.id) : null;
    if (pickId != null) {
      applyPlantHoverAtWindowPosition(lastPlantHoverWindowPosition);
      return;
    }

    if (hoveredPlantEntityId != null) {
      setPlantZoneHovered(hoveredPlantEntityId, false);
      hoveredPlantEntityId = null;
    }
    viewer.scene.requestRender();
  }, PLANT_HOVER_LEAVE_DEBOUNCE_MS);
}

function schedulePlantHoverSettleCheck() {
  cancelPlantHoverSettleTimer();
  plantHoverSettleTimer = setTimeout(() => {
    plantHoverSettleTimer = null;
    if (!viewer || !lastPlantHoverWindowPosition) return;
    applyPlantHoverAtWindowPosition(lastPlantHoverWindowPosition);
  }, PLANT_HOVER_SETTLE_MS);
}

function applyPlantHoverAtWindowPosition(windowPosition) {
  if (!viewer) return;
  if (plantInteractionSuspended || isAccidentRescueFlatOverview()) {
    viewer.canvas.style.cursor = 'default';
    return;
  }

  const entity = pickPlantZoneEntity(viewer, windowPosition, { requireModelHit: true });
  const nextHoverId = entity?.id != null ? toPlantZoneKey(entity.id) : null;

  viewer.canvas.style.cursor = nextHoverId ? 'pointer' : 'default';

  if (nextHoverId != null) {
    cancelPlantHoverLeaveTimer();
  }

  if (nextHoverId === hoveredPlantEntityId) {
    if (nextHoverId != null) {
      healPlantHoverGrow(nextHoverId);
    } else if (hoveredPlantEntityId != null) {
      schedulePlantHoverLeave();
    }
    viewer.scene.requestRender();
    return;
  }

  cancelPlantHoverLeaveTimer();

  if (nextHoverId == null) {
    schedulePlantHoverLeave();
    viewer.scene.requestRender();
    return;
  }

  if (hoveredPlantEntityId != null) {
    setPlantZoneHovered(hoveredPlantEntityId, false);
  }

  hoveredPlantEntityId = nextHoverId;
  setPlantZoneHovered(hoveredPlantEntityId, true);
  schedulePlantHoverSettleCheck();
  viewer.scene.requestRender();
}

function schedulePlantHoverReconcile() {
  if (plantHoverReconcileRaf != null) return;
  plantHoverReconcileRaf = requestAnimationFrame(() => {
    plantHoverReconcileRaf = null;
    if (!lastPlantHoverWindowPosition) return;
    applyPlantHoverAtWindowPosition(lastPlantHoverWindowPosition);
  });
}

function buildPlantZoneSelectPayload(zoneKey) {
  const state = plantHoverStates.get(zoneKey);
  if (!state) return null;
  const tagMeta = buildPlantZoneTagMeta(state);
  const codes = ['FCC-01', 'STR-02', 'HYD-03', 'UTL-04'];
  const code = codes[state.colorIndex % codes.length];
  return {
    zoneKey,
    colorIndex: state.colorIndex,
    title: tagMeta ? tagMeta.title : null,
    code,
    tagMeta,
    isAlert: isPlantRedZone(state),
  };
}

function captureOverviewCameraPose(activeViewer) {
  if (!activeViewer?.camera) return;
  overviewCameraPose = cloneCameraPose(activeViewer);
}

function cloneCameraPose(activeViewer) {
  if (!activeViewer?.camera) return null;
  return {
    destination: Cesium.Cartesian3.clone(activeViewer.camera.positionWC),
    orientation: {
      direction: Cesium.Cartesian3.clone(activeViewer.camera.directionWC),
      up: Cesium.Cartesian3.clone(activeViewer.camera.upWC),
    },
  };
}

function poseToHeadingPitchRoll(pose) {
  if (!viewer?.camera || !pose) return null;
  const saved = cloneCameraPose(viewer);
  viewer.camera.setView({
    destination: Cesium.Cartesian3.clone(pose.destination),
    orientation: {
      direction: Cesium.Cartesian3.clone(pose.orientation.direction),
      up: Cesium.Cartesian3.clone(pose.orientation.up),
    },
  });
  const hpr = {
    heading: viewer.camera.heading,
    pitch: viewer.camera.pitch,
    roll: viewer.camera.roll,
  };
  viewer.camera.setView({
    destination: saved.destination,
    orientation: saved.orientation,
  });
  return hpr;
}

async function flyCameraToPose(pose, durationSec) {
  if (!viewer || !pose) return;
  cancelZoneFocusFly();
  viewer.camera.cancelFlight();
  if (renderingPaused) {
    resumeRendering();
  }
  if (hasValidCanvasSize(viewer)) {
    viewer.resize();
  }

  const destination = Cesium.Cartesian3.clone(pose.destination);
  const orientation = poseToHeadingPitchRoll(pose);
  if (!orientation) return;

  viewer.useDefaultRenderLoop = true;
  viewer.scene.requestRender();

  const duration = Math.max(durationSec, 0.01);
  try {
    const flight = viewer.camera.flyTo({
      destination,
      orientation,
      duration,
      easingFunction: Cesium.EasingFunction.LINEAR,
    });
    if (flight && typeof flight.then === 'function') {
      await flight;
    } else {
      await new Promise((resolve) => setTimeout(resolve, duration * 1000));
    }
  } catch (err) {
    console.error('[MaomingPetroCesiumMap] camera.flyTo failed', err);
    viewer.camera.setView({
      destination,
      orientation: {
        direction: Cesium.Cartesian3.clone(pose.orientation.direction),
        up: Cesium.Cartesian3.clone(pose.orientation.up),
      },
    });
  }

  releaseCameraForUserInput(viewer);
  viewer.scene.requestRender();
}

function snapCameraToPose(pose) {
  if (!viewer || !pose) return;
  cancelZoneFocusFly();
  viewer.camera.cancelFlight();
  viewer.trackedEntity = undefined;
  if (renderingPaused) {
    resumeRendering();
  }
  viewer.useDefaultRenderLoop = true;
  viewer.camera.setView({
    destination: Cesium.Cartesian3.clone(pose.destination),
    orientation: {
      direction: Cesium.Cartesian3.clone(pose.orientation.direction),
      up: Cesium.Cartesian3.clone(pose.orientation.up),
    },
  });
  releaseCameraForUserInput(viewer);
  viewer.scene.requestRender();
}

async function restoreCameraPose(pose) {
  if (!viewer || !pose) return;
  viewer.trackedEntity = undefined;
  await flyCameraLookAtSpecLerp(pose, FIRE_EMERGENCY_LIST_RESTORE_DURATION_SEC, {
    zoomOnly: true,
  });
}

async function flyToOverviewView() {
  if (!viewer) return;
  cancelZoneFocusFly();
  viewer.trackedEntity = undefined;

  if (overviewBoundaryDataSource) {
    await flyToBoundaryModel(viewer, overviewBoundaryDataSource, overviewCameraOffset);
    captureOverviewCameraPose(viewer);
  } else if (overviewCameraPose) {
    await flyCameraLinear(viewer, overviewCameraPose, PLANT_ZONE_FOCUS_FLY_DURATION_SEC);
  }

  releaseCameraForUserInput(viewer);
  viewer.scene.requestRender();
}

/** 导航切换时飞回当前模块默认总览视角，并清理装置区选中/详情态 */
async function restoreModuleDefaultView() {
  if (!viewer) return;
  cancelZoneFocusFly();
  viewer.trackedEntity = undefined;

  const hadZoneState =
    selectedPlantEntityId != null ||
    zoneDetailViewActive ||
    zoneDetailLockedRange != null ||
    zoneDetailLastCenter != null;

  if (selectedPlantEntityId != null) {
    setPlantZoneSelected(selectedPlantEntityId, false);
    selectedPlantEntityId = null;
  }

  zoneDetailViewActive = false;
  zoneDetailLockedRange = null;
  zoneDetailLastCenter = null;

  if (hadZoneState) {
    emit('zone-deselect');
  }

  resetTvInspectionScan();

  if (isAccidentRescueMode()) {
    await applyAccidentRescueDisplayMode(false);
    return;
  }

  await flyToOverviewView();
}

/**
 * AI 诊断等“计算中”效果：在模块默认总览基础上轻微放大（rangeScale<1）。
 * 只做相机飞行，不改变业务模式与选中状态（需要清理状态请调用 restoreModuleDefaultView）。
 */
/**
 * 从当前视角沿视线方向放大（与园区概况 flyCameraLinear 同一路径）
 */
async function flyToModuleOverview(options = {}) {
  if (!viewer) return;
  const scale = Math.max(0.35, Math.min(1, Number(options?.rangeScale ?? 0.55)));
  const durationSec = Number.isFinite(options?.duration) ? Math.max(0.6, options.duration) : 1.6;

  cancelZoneFocusFly();
  viewer.trackedEntity = undefined;

  const camera = viewer.camera;
  const sphere = overviewBoundaryDataSource
    ? computeBoundaryModelBoundingSphere(overviewBoundaryDataSource)
    : null;
  const center =
    sphere?.center ??
    Cesium.Cartesian3.fromDegrees(MAOMING_PETRO.longitude, MAOMING_PETRO.latitude, 0);

  const offset = new Cesium.Cartesian3();
  Cesium.Cartesian3.subtract(camera.positionWC, center, offset);
  let currentRange = Cesium.Cartesian3.magnitude(offset);
  if (!Number.isFinite(currentRange) || currentRange <= 0) {
    currentRange = overviewCameraOffset?.range ?? MAOMING_PETRO.cameraRange;
    Cesium.Cartesian3.normalize(offset, offset);
    if (Cesium.Cartesian3.magnitudeSquared(offset) < 1e-6) {
      offset.x = 0.3;
      offset.y = 0.3;
      offset.z = 0.5;
      Cesium.Cartesian3.normalize(offset, offset);
    }
  } else {
    Cesium.Cartesian3.normalize(offset, offset);
  }

  const targetRange = Math.max(520, currentRange * scale);
  const destination = new Cesium.Cartesian3();
  Cesium.Cartesian3.multiplyByScalar(offset, targetRange, destination);
  Cesium.Cartesian3.add(center, destination, destination);

  const pose = {
    destination,
    orientation: {
      direction: Cesium.Cartesian3.clone(camera.directionWC),
      up: Cesium.Cartesian3.clone(camera.upWC),
    },
  };

  const prevLoop = viewer.useDefaultRenderLoop;
  viewer.useDefaultRenderLoop = true;
  try {
    await flyCameraLinear(viewer, pose, durationSec);
  } finally {
    viewer.useDefaultRenderLoop = prevLoop;
  }

  releaseCameraForUserInput(viewer);
  viewer.scene.requestRender();
}

/** 外部调用：等待地图完成模式切换/默认视角恢复 */
function waitForIdle() {
  return mapAsyncChain;
}

const PLANT_ZONE_CODES = ['FCC-01', 'STR-02', 'HYD-03', 'UTL-04'];

function getPlantZoneKeys() {
  return Array.from(plantHoverStates.keys());
}

function findZoneKeyByCode(code) {
  const idx = PLANT_ZONE_CODES.indexOf(code);
  if (idx < 0) return null;
  for (const [zoneKey, state] of plantHoverStates) {
    if ((state.colorIndex ?? 0) % PLANT_ZONE_CODES.length === idx) return zoneKey;
  }
  return null;
}

function getPlantZoneWorldPosition(zoneKey) {
  const state = plantHoverStates.get(zoneKey);
  if (!state) return null;
  const world = getPlantZoneMarkerWorldPosition(state);
  if (!world) return null;
  const carto = Cesium.Cartographic.fromCartesian(world);
  return {
    longitude: Cesium.Math.toDegrees(carto.longitude),
    latitude: Cesium.Math.toDegrees(carto.latitude),
    height: carto.height,
  };
}

function setAiScanZoneHighlighted(zoneKey, highlighted) {
  const state = getPlantHoverState(zoneKey);
  if (!state) return;
  state.selected = highlighted;
  state.hovered = false;
  syncPlantZoneElevated(state);
  applyPlantZoneVisual(state);
  runPlantHoverAnimationLoop();
  if (highlighted) {
    aiScanActiveZoneKey = zoneKey;
  } else if (aiScanActiveZoneKey === zoneKey) {
    aiScanActiveZoneKey = null;
  }
}

function collapseAiScanZone(zoneKey) {
  if (!zoneKey) return;
  setAiScanZoneHighlighted(zoneKey, false);
}

function activateAiScanZonePreview(zoneKey) {
  if (!plantInteractionSuspended || !zoneKey) return;
  if (aiScanActiveZoneKey && aiScanActiveZoneKey !== zoneKey) {
    collapseAiScanZone(aiScanActiveZoneKey);
  }
  if (aiScanActiveZoneKey === zoneKey) return;
  setAiScanZoneHighlighted(zoneKey, true);
}

/** AI 诊断开始：禁用鼠标交互，清理标签与选中态 */
function beginAiDiagnosisScan() {
  plantInteractionSuspended = true;
  aiScanActiveZoneKey = null;
  _aiScanResultZoneKey = null;
  hoveredPlantEntityId = null;

  if (selectedPlantEntityId != null) {
    setPlantZoneSelected(selectedPlantEntityId, false);
    selectedPlantEntityId = null;
  }

  for (const zoneKey of plantHoverStates.keys()) {
    const state = getPlantHoverState(zoneKey);
    if (!state) continue;
    if (state.selected || state.hovered || state.liftProgress > 0.001) {
      state.selected = false;
      state.hovered = false;
      syncPlantZoneElevated(state);
      applyPlantZoneVisual(state);
    }
  }

  destroyPlantBillboardMarkers(viewer);
  if (viewer?.canvas) viewer.canvas.style.cursor = 'default';
  viewer?.scene?.requestRender();
}

/** AI 诊断结束：恢复鼠标交互，收起预览生长 */
function endAiDiagnosisScan() {
  plantInteractionSuspended = false;
  if (aiScanActiveZoneKey) {
    const state = getPlantHoverState(aiScanActiveZoneKey);
    if (state) {
      state.selected = false;
      state.hovered = false;
      syncPlantZoneElevated(state);
      applyPlantZoneVisual(state);
    }
  }

  aiScanActiveZoneKey = null;
  _aiScanResultZoneKey = null;
  destroyPlantBillboardMarkers(viewer);
  runPlantHoverAnimationLoop();
  viewer?.scene?.requestRender();
}

/** 扫描完成：保持最后飞入区块生长态（HTML 标签由 AiDiagnosisPage 渲染） */
function showAiScanResultZoneTag(zoneKey) {
  if (!viewer || !zoneKey) return;
  if (!plantHoverStates.get(zoneKey)) return;

  _aiScanResultZoneKey = zoneKey;
  setAiScanZoneHighlighted(zoneKey, true);
  destroyPlantBillboardMarkers(viewer);
  viewer.scene.requestRender();
}

/**
 * AI 诊断：平行飞入装置区（不触发详情面板；扫描期自动生长/收起）
 */
async function flyToPlantZonePan(zoneKey, options = {}) {
  if (!viewer || !zoneKey) return;

  const state = plantHoverStates.get(zoneKey);
  if (!state) return;

  if (plantInteractionSuspended) {
    activateAiScanZonePreview(zoneKey);
  }

  const durationSec = Number.isFinite(options?.duration) ? Math.max(0.45, options.duration) : 0.85;
  const forceZoom = options?.forceZoom === true;
  const rightInsetPx = options?.centerView ? 0 : (props.focusRightInsetPx ?? 0);

  cancelZoneFocusFly();
  viewer.trackedEntity = undefined;

  const sphere = computePlantZoneBoundingSphere(state);
  const target = getPlantZoneMarkerWorldPosition(state) ?? sphere?.center;
  if (!target) return;

  let pose;
  if (!forceZoom && zoneDetailViewActive && zoneDetailLastCenter) {
    pose = computeZoneSwitchPanPose(viewer, zoneDetailLastCenter, target, rightInsetPx);
  } else {
    const rawRange = Cesium.Cartesian3.distance(viewer.camera.positionWC, target);
    const range = Math.max(rawRange * 0.78, PLANT_ZONE_FOCUS_MIN_RANGE);
    zoneDetailLockedRange = range;
    pose = computeZoneFocusCameraPose(viewer, target, range, rightInsetPx);
  }

  const prevLoop = viewer.useDefaultRenderLoop;
  viewer.useDefaultRenderLoop = true;
  try {
    await flyCameraLinear(viewer, pose, durationSec);
  } finally {
    viewer.useDefaultRenderLoop = prevLoop;
  }

  zoneDetailViewActive = true;
  zoneDetailLastCenter = Cesium.Cartesian3.clone(target);
  releaseCameraForUserInput(viewer);
  viewer.scene.requestRender();
}

async function exitZoneDetailView(restoreOverview) {
  zoneDetailViewActive = false;
  zoneDetailLockedRange = null;
  zoneDetailLastCenter = null;
  if (restoreOverview) {
    await flyToOverviewView();
  } else {
    releaseCameraForUserInput(viewer);
  }
  viewer?.scene.requestRender();
}

function emitPlantZoneSelectionChange() {
  if (selectedPlantEntityId == null) {
    void exitZoneDetailView(true).then(() => {
      emit('zone-deselect');
      viewer?.scene.requestRender();
    });
    return;
  }
  const payload = buildPlantZoneSelectPayload(selectedPlantEntityId);
  if (payload) {
    emit('zone-select', payload);
    void flyToPlantZoneFocus(selectedPlantEntityId);
  }
}

async function clearPlantZoneSelection() {
  if (selectedPlantEntityId != null) {
    setPlantZoneSelected(selectedPlantEntityId, false);
    selectedPlantEntityId = null;
  } else if (!zoneDetailViewActive) {
    return;
  }

  await exitZoneDetailView(true);
  viewer?.scene.requestRender();
}

function shouldSuppressBlankClickDeselect() {
  const { suppressBlankClickDeselectWhenSelected } = getMapModeConfig();
  return suppressBlankClickDeselectWhenSelected && selectedPlantEntityId != null;
}

function applyPlantClickAtWindowPosition(windowPosition) {
  if (
    !viewer ||
    plantInteractionSuspended ||
    isAccidentRescueFlatOverview() ||
    !getMapModeConfig().enablePlantZoneSelection
  ) {
    return;
  }

  viewer.selectedEntity = undefined;

  const tagPick = viewer.scene.pick(windowPosition);
  const entity =
    resolvePickedPlantEntity(tagPick) ??
    pickPlantZoneEntity(viewer, windowPosition, { requireModelHit: true });
  const zoneKey = entity?.id != null ? toPlantZoneKey(entity.id) : null;

  if (zoneKey == null) {
    if (selectedPlantEntityId != null && !shouldSuppressBlankClickDeselect()) {
      setPlantZoneSelected(selectedPlantEntityId, false);
      selectedPlantEntityId = null;
      emitPlantZoneSelectionChange();
    }
    viewer.scene.requestRender();
    return;
  }

  if (selectedPlantEntityId === zoneKey) {
    setPlantZoneSelected(zoneKey, false);
    selectedPlantEntityId = null;
  } else {
    if (selectedPlantEntityId != null) {
      setPlantZoneSelected(selectedPlantEntityId, false);
    }
    selectedPlantEntityId = zoneKey;
    setPlantZoneSelected(zoneKey, true);
  }
  emitPlantZoneSelectionChange();
  viewer.scene.requestRender();
}

function setupPlantHoverInteraction(viewer) {
  destroyPlantHoverInteraction(viewer);
  if (!plantHoverStates.size) return;
  if (!getMapModeConfig().enablePlantZoneHover) return;

  plantHoverHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

  plantHoverHandler.setInputAction((movement) => {
    lastPlantHoverWindowPosition = Cesium.Cartesian2.clone(movement.endPosition);
    schedulePlantHoverReconcile();
    schedulePlantHoverSettleCheck();
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

  if (getMapModeConfig().enablePlantZoneSelection) {
    plantHoverHandler.setInputAction((click) => {
      applyPlantClickAtWindowPosition(click.position);
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }
}

function destroyPlantHoverInteraction(activeViewer = viewer) {
  stopPlantHoverAnimationLoop();
  cancelPlantHoverLeaveTimer();
  cancelPlantHoverSettleTimer();
  if (plantHoverReconcileRaf != null) {
    cancelAnimationFrame(plantHoverReconcileRaf);
    plantHoverReconcileRaf = null;
  }
  lastPlantHoverWindowPosition = null;

  if (plantHoverHandler) {
    plantHoverHandler.destroy();
    plantHoverHandler = null;
  }

  hoveredPlantEntityId = null;
  selectedPlantEntityId = null;
  zoneDetailViewActive = false;
  zoneDetailLockedRange = null;
  zoneDetailLastCenter = null;

  if (activeViewer?.canvas) {
    activeViewer.canvas.style.cursor = 'default';
  }
}

function getPolygonRingPositions(entity) {
  if (!entity.polygon) return null;
  const hierarchy = entity.polygon.hierarchy.getValue(Cesium.JulianDate.now());
  if (!hierarchy) return null;
  const positions = hierarchy.positions;
  if (!positions?.length) return null;
  const ring = positions.map((p) => Cesium.Cartesian3.clone(p));
  const last = ring[ring.length - 1];
  const first = ring[0];
  if (!Cesium.Cartesian3.equalsEpsilon(first, last, Cesium.Math.EPSILON6)) {
    ring.push(Cesium.Cartesian3.clone(first));
  }
  return ring;
}

function ringWithoutDuplicateClose(ring) {
  if (ring.length < 2) return ring;
  const first = ring[0];
  const last = ring[ring.length - 1];
  if (Cesium.Cartesian3.equalsEpsilon(first, last, Cesium.Math.EPSILON6)) {
    return ring.slice(0, -1);
  }
  return ring;
}

async function sampleOpenRingTerrain(viewer, openRing) {
  const cartographics = openRing.map((cartesian) => Cesium.Cartographic.fromCartesian(cartesian));
  if (viewer.terrainProvider) {
    try {
      await Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, cartographics);
    } catch (err) {
      console.warn('边界地形采样失败', err);
    }
  }
  return cartographics;
}

function _positionsFromRelativeHeight(cartographics, heightAboveGround) {
  return cartographics.map((carto) =>
    Cesium.Cartesian3.fromRadians(carto.longitude, carto.latitude, heightAboveGround),
  );
}

function positionsFromCartographics(cartographics, heightAboveGround) {
  return cartographics.map((carto) =>
    Cesium.Cartesian3.fromRadians(
      carto.longitude,
      carto.latitude,
      (carto.height ?? 0) + heightAboveGround,
    ),
  );
}

function wallHeightsFromCartographics(cartographics, heightAboveGround) {
  return cartographics.map((carto) => (carto.height ?? 0) + heightAboveGround);
}

function getFirstBoundaryRing(boundaryDs) {
  for (const entity of boundaryDs.entities.values) {
    const ring = getPolygonRingPositions(entity);
    if (ring) return ring;
  }
  return null;
}

function boundaryRingToLonLat(ring) {
  return ringWithoutDuplicateClose(ring).map((cartesian) => {
    const carto = Cesium.Cartographic.fromCartesian(cartesian);
    return {
      lon: Cesium.Math.toDegrees(carto.longitude),
      lat: Cesium.Math.toDegrees(carto.latitude),
    };
  });
}

function pointInLonLatRing(lon, lat, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const { lon: xi, lat: yi } = ring[i];
    const { lon: xj, lat: yj } = ring[j];
    const crosses = yi > lat !== yj > lat;
    const xIntersect = ((xj - xi) * (lat - yi)) / (yj - yi + 0.0) + xi;
    if (crosses && lon < xIntersect) inside = !inside;
  }
  return inside;
}

function waitForImageryLayerReady(layer) {
  if (layer.ready && layer.imageryProvider) {
    return Promise.resolve(layer.imageryProvider);
  }
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('底图影像图层加载超时'));
    }, 30000);
    layer.readyEvent.addEventListener((provider) => {
      clearTimeout(timeout);
      resolve(provider);
    });
  });
}

function parsePgw(text) {
  const lines = text
    .trim()
    .split(/\r?\n/)
    .map((line) => parseFloat(line.trim()));
  if (lines.length < 6 || lines.some((value) => Number.isNaN(value))) {
    throw new Error('PGW 世界文件格式无效');
  }
  const [A, D, B, E, C, F] = lines;
  return { A, D, B, E, C, F };
}

function isWebMercatorPgw(pgw) {
  return Math.abs(pgw.C) > 180 || Math.abs(pgw.F) > 90;
}

function pgwPixelToCartographic(pgw, col, row) {
  const { A, B, D, E, C, F } = pgw;
  const x = C + col * A + row * B;
  const y = F + col * D + row * E;
  if (isWebMercatorPgw(pgw)) {
    const projection = new Cesium.WebMercatorProjection();
    return projection.unproject(new Cesium.Cartesian2(x, y));
  }
  return Cesium.Cartographic.fromDegrees(x, y);
}

function pgwToCesiumRectangle(pgw, width, height) {
  const { A, E, C, F } = pgw;
  const xMin = C - A / 2;
  const xMax = C + A * width - A / 2;
  const yNorth = F - E / 2;
  const ySouth = F + E * height - E / 2;

  if (isWebMercatorPgw(pgw)) {
    const projection = new Cesium.WebMercatorProjection();
    const southWest = projection.unproject(new Cesium.Cartesian2(xMin, ySouth));
    const northEast = projection.unproject(new Cesium.Cartesian2(xMax, yNorth));
    return new Cesium.Rectangle(
      southWest.longitude,
      southWest.latitude,
      northEast.longitude,
      northEast.latitude,
    );
  }

  return Cesium.Rectangle.fromDegrees(xMin, ySouth, xMax, yNorth);
}

function loadImageElement(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => {
      fetch(url)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          return response.blob();
        })
        .then((blob) => {
          if (!blob.type.startsWith('image/')) {
            throw new Error(`非图像类型: ${blob.type || 'unknown'}`);
          }
          const blobUrl = URL.createObjectURL(blob);
          const fallback = new Image();
          fallback.onload = () => {
            URL.revokeObjectURL(blobUrl);
            resolve(fallback);
          };
          fallback.onerror = () => {
            URL.revokeObjectURL(blobUrl);
            reject(new Error(`影像解码失败: ${url}`));
          };
          fallback.src = blobUrl;
        })
        .catch((err) => {
          reject(new Error(`影像加载失败: ${url} (${err.message})`));
        });
    };
    image.src = url;
  });
}

function maskExportedMapCanvas(canvas, pgw, boundaryLonLatRing, pixelScaleX = 1, pixelScaleY = 1) {
  const { width, height } = canvas;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return canvas;

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const carto = pgwPixelToCartographic(pgw, px * pixelScaleX, py * pixelScaleY);
      const lon = Cesium.Math.toDegrees(carto.longitude);
      const lat = Cesium.Math.toDegrees(carto.latitude);
      const idx = (py * width + px) * 4;
      if (!pointInLonLatRing(lon, lat, boundaryLonLatRing)) {
        data[idx] = 0;
        data[idx + 1] = 0;
        data[idx + 2] = 0;
        data[idx + 3] = 0;
      } else {
        data[idx + 3] = 255;
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/** PS 另存 PNG 时可能带透明通道或预乘 alpha，先铺底再绘制并统一 alpha */
function prepareExportedMapCanvas(image) {
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new Error('顶面影像画布创建失败');
  }

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];
    if (alpha > 0 && alpha < 255) {
      const scale = 255 / alpha;
      data[i] = Math.min(255, data[i] * scale);
      data[i + 1] = Math.min(255, data[i + 1] * scale);
      data[i + 2] = Math.min(255, data[i + 2] * scale);
    }
    if (data[i] + data[i + 1] + data[i + 2] > 0 || alpha > 0) {
      data[i + 3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

function countVisibleCapPixels(canvas) {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return 0;
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let count = 0;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] > 0) count++;
  }
  return count;
}

function warnIfBoundaryExceedsMap(canvasRectangle, boundaryLonLatRing) {
  if (!boundaryLonLatRing?.length) return;
  const { west, south, east, north } = canvasRectangle;
  const westDeg = Cesium.Math.toDegrees(west);
  const eastDeg = Cesium.Math.toDegrees(east);
  const southDeg = Cesium.Math.toDegrees(south);
  const northDeg = Cesium.Math.toDegrees(north);
  let minLon = Infinity;
  let maxLon = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;
  for (const point of boundaryLonLatRing) {
    minLon = Math.min(minLon, point.lon);
    maxLon = Math.max(maxLon, point.lon);
    minLat = Math.min(minLat, point.lat);
    maxLat = Math.max(maxLat, point.lat);
  }
  // 亚公里级偏差容差：QGIS 导出边缘与边界.geojson 的边角通常仅差数十米，
  // 且超出部分本就被 maskExportedMapCanvas 置为透明（无影像数据、无视觉影响）。
  // 仅当超出容差（≈550m）时才告警提示重新导出，避免常态化噪声。
  const EPS = 0.005;
  if (
    minLon < westDeg - EPS ||
    maxLon > eastDeg + EPS ||
    minLat < southDeg - EPS ||
    maxLat > northDeg + EPS
  ) {
    console.warn(
      '边界部分超出 map.png + map.pgw 范围，请在 QGIS 中扩大导出范围使影像完全覆盖边界',
      {
        map: { westDeg, eastDeg, southDeg, northDeg },
        boundary: { minLon, maxLon, minLat, maxLat },
        toleranceDeg: EPS,
      },
    );
  }
}

function downscaleCanvasIfNeeded(canvas, maxSize = 2048) {
  const { width, height } = canvas;
  const longest = Math.max(width, height);
  if (longest <= maxSize) return canvas;

  const scale = maxSize / longest;
  const scaled = document.createElement('canvas');
  scaled.width = Math.max(1, Math.round(width * scale));
  scaled.height = Math.max(1, Math.round(height * scale));
  const ctx = scaled.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(canvas, 0, 0, scaled.width, scaled.height);
  return scaled;
}

function canvasToCapImageUrl(canvas) {
  return new Promise((resolve, reject) => {
    const finish = (blob) => {
      if (!blob) {
        reject(new Error('顶面纹理编码失败'));
        return;
      }
      resolve(URL.createObjectURL(blob));
    };
    canvas.toBlob(
      (blob) => {
        if (blob) {
          finish(blob);
          return;
        }
        canvas.toBlob((pngBlob) => finish(pngBlob), 'image/png');
      },
      'image/webp',
      0.9,
    );
  });
}

async function waitForTerrainAtSite(viewer, center) {
  if (!viewer?.terrainProvider) return;
  const carto = Cesium.Cartographic.fromDegrees(center.longitude, center.latitude);
  try {
    await Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, [carto]);
  } catch (err) {
    console.warn('厂区地形采样失败', err);
  }
  await new Promise((resolve) => requestAnimationFrame(resolve));
}

let opaqueCapMaterialRegistered = false;
let sideWallGradientMaterialRegistered = false;
let plantZoneFillMaterialRegistered = false;
let accidentRescueBoundaryFillMaterialRegistered = false;

/**
 * 与顶点顺序 [SW, NW, NE, SE] 对应。
 */
function createCapTextureCoordinates(flipX = false, flipY = false) {
  const uv = {
    sw: { x: 0, y: 0 },
    nw: { x: 0, y: 1 },
    ne: { x: 1, y: 1 },
    se: { x: 1, y: 0 },
  };

  if (flipX) {
    for (const point of Object.values(uv)) {
      point.x = 1 - point.x;
    }
  }
  if (flipY) {
    for (const point of Object.values(uv)) {
      point.y = 1 - point.y;
    }
  }

  return new Cesium.PolygonHierarchy([
    new Cesium.Cartesian2(uv.sw.x, uv.sw.y),
    new Cesium.Cartesian2(uv.nw.x, uv.nw.y),
    new Cesium.Cartesian2(uv.ne.x, uv.ne.y),
    new Cesium.Cartesian2(uv.se.x, uv.se.y),
  ]);
}

async function rectangleToCapPositions(viewer, rectangle, capHeight) {
  const corners = [
    Cesium.Rectangle.southwest(rectangle),
    Cesium.Rectangle.southeast(rectangle),
    Cesium.Rectangle.northeast(rectangle),
    Cesium.Rectangle.northwest(rectangle),
  ];

  if (viewer.terrainProvider) {
    try {
      await Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, corners);
    } catch (err) {
      console.warn('顶面地形采样失败', err);
    }
  }

  const [sw, se, ne, nw] = corners.map((cartographic) =>
    Cesium.Cartesian3.fromRadians(
      cartographic.longitude,
      cartographic.latitude,
      (cartographic.height ?? 0) + capHeight,
    ),
  );

  /** 俯视 CCW（法线朝上）；原 SW→SE→NE→NW 为 CW，法线朝地心，俯视不可见 */
  return [sw, nw, ne, se];
}

function registerOpaqueCapMaterial() {
  if (opaqueCapMaterialRegistered) return;
  opaqueCapMaterialRegistered = true;

  Cesium.Material._materialCache.addMaterial('OpaqueCapImage', {
    fabric: {
      type: 'OpaqueCapImage',
      uniforms: {
        image: Cesium.Material.DefaultImageId,
      },
      source: `
        czm_material czm_getMaterial(czm_materialInput materialInput)
        {
          czm_material material = czm_getDefaultMaterial(materialInput);
          vec4 color = texture(image, materialInput.st);
          if (color.a < 0.01) {
            discard;
          }
          material.diffuse = color.rgb;
          material.alpha = 1.0;
          return material;
        }
      `,
    },
    translucent: false,
  });
}

function createCapImageMaterial(imageUrl) {
  registerOpaqueCapMaterial();
  return Cesium.Material.fromType('OpaqueCapImage', { image: imageUrl });
}

async function createElevatedCapPrimitive(
  viewer,
  imageUrl,
  canvasRectangle,
  capHeight,
  flipX,
  flipY,
) {
  const positions = await rectangleToCapPositions(viewer, canvasRectangle, capHeight);
  const geometry = Cesium.PolygonGeometry.createGeometry(
    new Cesium.PolygonGeometry({
      polygonHierarchy: new Cesium.PolygonHierarchy(positions),
      perPositionHeight: true,
      textureCoordinates: createCapTextureCoordinates(flipX, flipY),
      vertexFormat: Cesium.VertexFormat.POSITION_AND_ST,
    }),
  );

  if (!geometry) {
    throw new Error('顶面几何创建失败');
  }

  return new Cesium.Primitive({
    geometryInstances: new Cesium.GeometryInstance({
      geometry,
      id: 'boundary-elevated-imagery-cap',
    }),
    appearance: new Cesium.MaterialAppearance({
      material: createCapImageMaterial(imageUrl),
      flat: true,
      faceForward: false,
      closed: false,
      translucent: false,
      renderState: {
        cull: { enabled: true },
        depthTest: { enabled: true },
        depthMask: true,
      },
    }),
    asynchronous: false,
  });
}

function registerPlantZoneFillMaterial() {
  if (plantZoneFillMaterialRegistered) return;
  plantZoneFillMaterialRegistered = true;

  Cesium.Material._materialCache.addMaterial('PlantZoneFillV6', {
    fabric: {
      type: 'PlantZoneFillV6',
      uniforms: {
        baseColor: new Cesium.Color(1, 1, 1, 0.2),
        elevatedMix: 0,
        interiorDim: 0.52,
        interiorAlphaDim: 0.88,
      },
      source: `
        czm_material czm_getMaterial(czm_materialInput materialInput)
        {
          czm_material material = czm_getDefaultMaterial(materialInput);
          vec3 rgb = baseColor.rgb * mix(1.0, interiorDim, elevatedMix);
          float alpha = baseColor.a * mix(1.0, interiorAlphaDim, elevatedMix);
          material.diffuse = rgb;
          material.alpha = clamp(alpha, 0.0, 1.0);
          material.emission = vec3(0.0);
          return material;
        }
      `,
    },
    translucent: true,
  });
}

function PlantZoneFillMaterialProperty(state) {
  registerPlantZoneFillMaterial();
  this._definitionChanged = new Cesium.Event();
  this._state = state;
}

Object.defineProperties(PlantZoneFillMaterialProperty.prototype, {
  isConstant: {
    get() {
      return false;
    },
  },
  definitionChanged: {
    get() {
      return this._definitionChanged;
    },
  },
});

PlantZoneFillMaterialProperty.prototype.getType = function () {
  return 'PlantZoneFillV6';
};

PlantZoneFillMaterialProperty.prototype.getValue = function (_time, result) {
  if (!result) result = {};
  const state = this._state;
  const { interiorDim, interiorAlphaDim } = MAP_THEME.plantElevatedFill;
  const elevatedMix = getPlantElevatedMix(state);
  result.baseColor = new Cesium.Color(state.baseRed, state.baseGreen, state.baseBlue, state.alpha);
  result.elevatedMix = elevatedMix;
  result.interiorDim = interiorDim;
  result.interiorAlphaDim = interiorAlphaDim;
  return result;
};

PlantZoneFillMaterialProperty.prototype.equals = function (other) {
  return (
    this === other ||
    (other instanceof PlantZoneFillMaterialProperty && this._state === other._state)
  );
};

/**
 * WallGraphics 的 st.t 为墙高 0→1，适合竖向渐变。
 * ImageMaterialProperty 会同时用 st.s 采样，导致贴图横向拉伸；此 Shader 只按 st.t 采样。
 */
function registerSideWallVerticalGradientMaterial() {
  if (sideWallGradientMaterialRegistered) return;
  sideWallGradientMaterialRegistered = true;

  Cesium.Material._materialCache.addMaterial('SideWallVerticalGradient', {
    fabric: {
      type: 'SideWallVerticalGradient',
      uniforms: {
        image: Cesium.Material.DefaultImageId,
        colorBoost: 1.22,
      },
      source: `
        czm_material czm_getMaterial(czm_materialInput materialInput)
        {
          czm_material material = czm_getDefaultMaterial(materialInput);
          float t = clamp(materialInput.st.t, 0.0, 1.0);
          vec4 color = texture(image, vec2(0.5, t));
          color.rgb *= colorBoost;
          material.diffuse = color.rgb;
          material.alpha = color.a;
          return material;
        }
      `,
    },
    translucent: true,
  });
}

function createSideWallGradientMaterial(sideCanvas) {
  registerSideWallVerticalGradientMaterial();
  return new SideWallGradientMaterialProperty(sideCanvas, 1.22);
}

function SideWallGradientMaterialProperty(image, colorBoost = 1.22) {
  this._definitionChanged = new Cesium.Event();
  this._image = image;
  this._colorBoost = colorBoost;
}

Object.defineProperties(SideWallGradientMaterialProperty.prototype, {
  isConstant: {
    get() {
      return true;
    },
  },
  definitionChanged: {
    get() {
      return this._definitionChanged;
    },
  },
});

SideWallGradientMaterialProperty.prototype.getType = function () {
  return 'SideWallVerticalGradient';
};

SideWallGradientMaterialProperty.prototype.getValue = function (_time, result) {
  if (!result) result = {};
  result.image = this._image;
  result.colorBoost = this._colorBoost;
  return result;
};

SideWallGradientMaterialProperty.prototype.equals = function (other) {
  return (
    this === other ||
    (other instanceof SideWallGradientMaterialProperty &&
      this._image === other._image &&
      this._colorBoost === other._colorBoost)
  );
};

async function loadGeoreferencedMapImage() {
  const image = await loadImageElement(mapImageUrl);
  if (!image.naturalWidth || !image.naturalHeight) {
    throw new Error('顶面影像尺寸无效，请确认 map.png 与 map.pgw 来自同一次 QGIS 导出');
  }
  const pgw = parsePgw(mapPgwText);
  const canvasRectangle = pgwToCesiumRectangle(pgw, image.naturalWidth, image.naturalHeight);
  let canvas = prepareExportedMapCanvas(image);
  const sourceWidth = canvas.width;
  const sourceHeight = canvas.height;
  canvas = downscaleCanvasIfNeeded(canvas);
  return {
    canvas,
    canvasRectangle,
    pgw,
    pixelScaleX: sourceWidth / canvas.width,
    pixelScaleY: sourceHeight / canvas.height,
  };
}

async function createElevatedMapCap(viewer, boundaryLonLatRing, capHeight) {
  const { canvas, canvasRectangle, pgw, pixelScaleX, pixelScaleY } =
    await loadGeoreferencedMapImage();
  warnIfBoundaryExceedsMap(canvasRectangle, boundaryLonLatRing);
  maskExportedMapCanvas(canvas, pgw, boundaryLonLatRing, pixelScaleX, pixelScaleY);

  const visiblePixels = countVisibleCapPixels(canvas);
  if (visiblePixels === 0) {
    throw new Error('边界与 map.png 无重叠像素，请检查 QGIS 导出范围是否覆盖边界.geojson');
  }

  const capImageUrl = await canvasToCapImageUrl(canvas);
  const capPrimitive = await createElevatedCapPrimitive(
    viewer,
    capImageUrl,
    canvasRectangle,
    capHeight,
    MAP_THEME.capTextureFlipX,
    MAP_THEME.capTextureFlipY,
  );
  viewer.scene.primitives.add(capPrimitive);
  viewer.scene.primitives.raiseToTop(capPrimitive);
  elevatedCapPrimitive = capPrimitive;
  if (isAccidentRescueFlatOverview()) {
    capPrimitive.show = false;
  }
  viewer.scene.requestRender();

  return () => {
    URL.revokeObjectURL(capImageUrl);
    viewer.scene.primitives.remove(capPrimitive);
    if (elevatedCapPrimitive === capPrimitive) {
      elevatedCapPrimitive = null;
    }
  };
}

async function mountElevatedMapCap(viewer, boundaryLonLatRing) {
  destroyElevatedCapSurface();
  if (!boundaryLonLatRing?.length) return;

  capLoadStatus.value = '顶面影像加载中…';
  try {
    await waitForTerrainAtSite(viewer, MAOMING_PETRO);
    destroyElevatedCap = await createElevatedMapCap(
      viewer,
      boundaryLonLatRing,
      MAP_THEME.capHeight,
    );
    capLoadStatus.value = '';
    loadError.value = '';
  } catch (err) {
    console.error(err);
    capLoadStatus.value = '';
    loadError.value = `顶面影像加载失败：${err?.message || err}`;
  }
}

function destroyElevatedCapSurface() {
  if (destroyElevatedCap) {
    destroyElevatedCap();
    destroyElevatedCap = null;
  }
}

async function applyBaseImageryStyle(viewer) {
  if (viewer.imageryLayers.length === 0) return;
  try {
    const baseLayer = viewer.imageryLayers.get(0);
    await waitForImageryLayerReady(baseLayer);
    applyImageryPresentation('normal', baseLayer);
  } catch (err) {
    console.warn('底图样式调整失败', err);
  }
}

function applyImageryPresentation(mode, baseLayer = viewer?.imageryLayers?.get(0)) {
  if (!baseLayer) return;
  if (mode === 'normal') {
    baseLayer.brightness = 1;
    baseLayer.contrast = 1;
    baseLayer.saturation = 1;
    baseLayer.gamma = 1;
    baseLayer.hue = 0;
    return;
  }
  baseLayer.brightness = 0.4;
  baseLayer.contrast = 1.2;
  baseLayer.saturation = 0.32;
  baseLayer.gamma = 0.92;
  baseLayer.hue = 0.12;
}

function destroyAccidentRescueFlatBoundaryEntities() {
  if (!overviewBoundaryDataSource || !accidentRescueFlatBoundaryReady) return;
  for (const id of Object.values(ACCIDENT_RESCUE_FLAT_ENTITY_IDS)) {
    overviewBoundaryDataSource.entities.removeById(id);
  }
  accidentRescueFlatBoundaryReady = false;
}

function _destroyEvacuationBoundaryEntities() {
  if (!overviewBoundaryDataSource?.entities) return;
  overviewBoundaryDataSource.entities.removeById(EVACUATION_FLAT_ENTITY_ID);
}

function _ensureEvacuationBoundaryEntities() {
  if (!overviewBoundaryDataSource?.entities) return;
  if (overviewBoundaryDataSource.entities.getById(EVACUATION_FLAT_ENTITY_ID)) return;
  const cartographics = boundaryFlatEdgeCartographics;
  if (!cartographics?.length) return;
  const positions = buildBoundaryFlatEdgePositions(cartographics);
  const edgeLineCommon = { disableDepthTestDistance: Number.POSITIVE_INFINITY };
  const stroke = Cesium.Color.fromCssColorString('#00baff').withAlpha(0.9);
  overviewBoundaryDataSource.entities.add({
    id: EVACUATION_FLAT_ENTITY_ID,
    polyline: {
      positions,
      width: 3.5,
      clampToGround: false,
      ...edgeLineCommon,
      material: new Cesium.PolylineDashMaterialProperty({
        color: stroke,
        dashLength: 16,
      }),
    },
  });
}

function _setPlantDataVisible(visible) {
  if (!overviewPlantDataSource?.entities) return;
  for (const entity of overviewPlantDataSource.entities.values) {
    entity.show = visible;
  }
}

function setBoundaryEdgeVisible(visible) {
  if (!overviewBoundaryDataSource?.entities) return;
  for (const entity of overviewBoundaryDataSource.entities.values) {
    const id = String(entity.id ?? '');
    if (id.endsWith('-edge-glow')) {
      if (entity.polyline) entity.polyline.show = visible;
      continue;
    }
    if (entity.polyline && !id.endsWith('-edge-glow')) {
      entity.polyline.show = visible;
    }
  }
}

function applyEvacuationPresentation(enable) {
  if (!viewer) return;

  const hidePlant3d = (hide) => {
    for (const state of plantHoverStates.values()) {
      if (state.blockModelEntity) state.blockModelEntity.show = !hide;
      if (state.wireframeTopEntity) state.wireframeTopEntity.show = !hide;
      if (state.wireframeBottomEntity) state.wireframeBottomEntity.show = !hide;
      if (Array.isArray(state.verticalEntities)) {
        for (const e of state.verticalEntities) {
          if (e) e.show = !hide;
        }
      }
      if (state.flatSurfaceEntity) state.flatSurfaceEntity.show = !hide;
    }
  };

  const hidePlantDecorations = (hide) => {
    // hide billboards / pins / any wireframe decoration entities not tracked in state.verticalEntities
    if (hide) {
      destroyPlantBillboardMarkers(viewer);
    } else {
      if (getMapModeConfig().showPlantZoneTags) {
        initPlantBillboardMarkers(viewer);
      }
    }

    const ds = overviewPlantDataSource;
    if (!ds?.entities) return;
    for (const e of ds.entities.values) {
      const id = String(e.id ?? '');
      if (isPlantFrameDecorationId(id) || isPlantTagEntityId(id)) {
        e.show = !hide;
      }
    }
  };

  const ensureEvacuationOverlay = () => {
    if (!evacuationOutlineDataSource) {
      evacuationOutlineDataSource = new Cesium.CustomDataSource('evacuation-outline');
      viewer.dataSources.add(evacuationOutlineDataSource);
    }
    evacuationOutlineDataSource.entities.removeAll();

    // 厂区边界：用已采样的边界 cartographics 贴地画虚线轮廓
    if (boundaryFlatEdgeCartographics?.length) {
      const positions = boundaryFlatEdgeCartographics.map((c) =>
        Cesium.Cartesian3.fromRadians(c.longitude, c.latitude),
      );
      positions.push(Cesium.Cartesian3.clone(positions[0]));
      evacuationOutlineDataSource.entities.add({
        id: 'evac-boundary-outline',
        polyline: {
          positions,
          width: 10,
          clampToGround: true,
          material: new Cesium.PolylineDashMaterialProperty({
            color: Cesium.Color.fromCssColorString('#00baff').withAlpha(0.95),
            dashLength: 16,
          }),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
      });
      evacuationOutlineDataSource.entities.add({
        id: 'evac-boundary-glow',
        polyline: {
          positions,
          width: 22,
          clampToGround: true,
          material: new Cesium.PolylineGlowMaterialProperty({
            glowPower: 0.12,
            taperPower: 0.55,
            color: Cesium.Color.fromCssColorString('#00baff').withAlpha(0.35),
          }),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
      });
    }

    // 装置区：用 plantHoverStates 的 openRing 贴地画轮廓（可选轻填充）
    let i = 0;
    for (const state of plantHoverStates.values()) {
      const ring = state.openRing;
      if (!ring?.length) continue;
      const { fill, line } = getPlantAreaStyle(state.colorIndex);
      const plantOutline = Cesium.Color.fromCssColorString(line).withAlpha(0.72);
      const plantFill = Cesium.Color.fromCssColorString(fill).withAlpha(0.32);
      const coords = ring.map((p) => Cesium.Cartesian3.clone(p));
      coords.push(Cesium.Cartesian3.clone(coords[0]));
      evacuationOutlineDataSource.entities.add({
        id: `evac-plant-outline-${i++}`,
        polyline: {
          positions: coords,
          width: 2.2,
          clampToGround: true,
          material: plantOutline,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
      });
      evacuationOutlineDataSource.entities.add({
        id: `evac-plant-fill-${i++}`,
        polygon: {
          hierarchy: new Cesium.PolygonHierarchy(ring),
          material: plantFill,
          outline: false,
          perPositionHeight: false,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        },
      });
    }

    evacuationOutlineDataSource.show = true;
  };

  if (enable) {
    // 只隐藏：不销毁、不改写原数据源
    setBoundaryModelVisible(false);
    setBoundaryEdgeVisible(false);
    if (elevatedCapPrimitive) elevatedCapPrimitive.show = false;
    hidePlant3d(true);
    hidePlantDecorations(true);

    // 叠加绘制：用已加载的 GeoJSON/采样结果重绘边框/区块
    ensureEvacuationOverlay();

    // 仅在疏散模式改底图观感（退出后由原有 mapMode 流程恢复）
    destroyDepthOfField(viewer);
    applyImageryPresentation('normal');
  } else {
    if (evacuationOutlineDataSource) evacuationOutlineDataSource.show = false;
    hidePlant3d(false);
    hidePlantDecorations(false);
    if (elevatedCapPrimitive) elevatedCapPrimitive.show = true;
    setBoundaryModelVisible(true);
    setBoundaryEdgeVisible(true);
  }
  viewer.scene.requestRender();
}

function ensureAccidentRescueFlatBoundaryEntities() {
  if (accidentRescueFlatBoundaryReady || !overviewBoundaryDataSource) return;
  const cartographics = boundaryFlatEdgeCartographics;
  if (!cartographics?.length) return;

  const flatEdgePositions = buildBoundaryFlatEdgePositions(cartographics);
  const flatFillHierarchy = buildBoundaryFlatFillHierarchy(cartographics);
  const boundaryStrokeColor = Cesium.Color.fromCssColorString(ACCIDENT_RESCUE_FLAT.boundaryStroke);
  const edgeLineCommon = {
    disableDepthTestDistance: Number.POSITIVE_INFINITY,
  };

  overviewBoundaryDataSource.entities.add({
    id: ACCIDENT_RESCUE_FLAT_ENTITY_IDS.fill,
    polygon: {
      hierarchy: flatFillHierarchy,
      perPositionHeight: true,
      material: createAccidentRescueBoundaryFillMaterial(),
      outline: false,
      show: true,
    },
  });

  overviewBoundaryDataSource.entities.add({
    id: ACCIDENT_RESCUE_FLAT_ENTITY_IDS.dash,
    polyline: {
      positions: flatEdgePositions,
      width: 3.5,
      clampToGround: false,
      ...edgeLineCommon,
      material: new Cesium.PolylineDashMaterialProperty({
        color: boundaryStrokeColor,
        dashLength: 18,
      }),
    },
  });

  accidentRescueFlatBoundaryReady = true;
}

function isAccidentRescueFlatEntityId(id) {
  return Object.values(ACCIDENT_RESCUE_FLAT_ENTITY_IDS).includes(id);
}

function isAccidentRescueFlatActive() {
  return isAccidentRescueMode() && accidentRescueFlatViewActive;
}

function applyStandardBoundaryPresentation() {
  destroyAccidentRescueFlatBoundaryEntities();
  setBoundaryModelVisible(true);
}

function setBoundaryModelVisible(showModel) {
  if (!overviewBoundaryDataSource?.entities) return;
  for (const entity of overviewBoundaryDataSource.entities.values) {
    const id = String(entity.id ?? '');
    if (isAccidentRescueFlatEntityId(id)) continue;
    if (id.endsWith('-edge-glow')) {
      if (entity.polyline) entity.polyline.show = showModel;
      continue;
    }
    if (entity.wall) {
      entity.wall.show = showModel;
    }
    if (entity.polyline && !id.endsWith('-edge-glow')) {
      entity.polyline.show = showModel;
    }
  }
}

/** 离开事故救援页 / 关闭隐藏：销毁 2D 边界并恢复默认地图 */
function teardownAccidentRescueFlatView() {
  if (!viewer) return;

  const needsVisualRestore = accidentRescueFlatViewActive || accidentRescueFlatBoundaryReady;

  accidentRescueFlatViewActive = false;
  setAccidentRescueFlatViewActive(false);
  lastPlantFlatPresentation = null;

  applyAccidentRescuePlantPresentation(false);
  applyStandardBoundaryPresentation();
  applyAccidentRescueElevatedCapPresentation(false);

  if (needsVisualRestore) {
    applyImageryPresentation('normal');
    applyCinematicDepthOfField(viewer);
  }

  viewer.scene.requestRender();
}

function applyAccidentRescueElevatedCapPresentation(flat) {
  if (!elevatedCapPrimitive) return;
  const hideCap = isAccidentRescueMode() && flat;
  elevatedCapPrimitive.show = !hideCap;
}

/** 顶视隐藏：仅救援页 + flat 时调整底图/景深；其余页面不受影响 */
function applyAccidentRescueVisualPresentation(_flat) {
  if (!viewer || !isAccidentRescueMode()) return;
  const inFlatOverview = isAccidentRescueFlatActive();
  applyImageryPresentation('normal');
  if (inFlatOverview) {
    destroyDepthOfField(viewer);
  } else {
    applyCinematicDepthOfField(viewer);
  }
}

function getAccidentRescueOverlayHeight() {
  if (isAccidentRescueFlatOverview()) {
    return overviewSiteReferenceTerrainHeight + ACCIDENT_RESCUE_FLAT.markerOffset;
  }
  return getBoundaryModelTopHeight();
}

function applyAccidentRescuePlantPresentation(flat) {
  const showFlat = isAccidentRescueMode() && flat;
  if (showFlat === lastPlantFlatPresentation) return;
  lastPlantFlatPresentation = showFlat;

  if (showFlat) {
    ensurePlantFlatSurfaceEntities();
  } else {
    destroyPlantFlatSurfaceEntities();
  }

  for (const state of plantHoverStates.values()) {
    if (state.blockModelEntity?.model) {
      state.blockModelEntity.model._definitionChanged.raiseEvent(state.blockModelEntity.model);
    }
    if (showFlat && state.hovered) {
      setPlantZoneHovered(toPlantZoneKey(state.entity.id), false);
    }
  }
  if (showFlat) {
    hoveredPlantEntityId = null;
  }
}

function applyAccidentRescueBoundaryPresentation(_flat) {
  if (!overviewBoundaryDataSource?.entities) return;

  const showFlat = isAccidentRescueFlatActive();

  if (showFlat) {
    ensureAccidentRescueFlatBoundaryEntities();
    setBoundaryModelVisible(false);
  } else {
    destroyAccidentRescueFlatBoundaryEntities();
    setBoundaryModelVisible(true);
  }
}

/** 单点定位统一使用厂区级视距，兼顾目标识别与整体态势。 */
const MAP_POINT_OVERVIEW_FOCUS_RANGE = 2400;
const ACCIDENT_RESCUE_INCIDENT_FOCUS_RANGE = MAP_POINT_OVERVIEW_FOCUS_RANGE;
const ACCIDENT_RESCUE_INCIDENT_FOCUS_DURATION_SEC = 1.35;
/** 返回应急列表：围绕列表注视点同步缩放/旋转，不做先平移后缩放 */
const FIRE_EMERGENCY_LIST_RESTORE_DURATION_SEC = 1.35;

async function runFlyToAccidentRescueIncident(longitude, latitude) {
  if (!viewer) return;

  // 若飞行目标已被清除（如用户快速切换到监测/疏散场景），跳过本次排队的事件视角飞行，
  // 避免其覆盖后续场景自身的相机框选
  if (accidentRescueFlyTarget.value == null) return;
  if (
    accidentRescueFlyTarget.value.longitude !== longitude ||
    accidentRescueFlyTarget.value.latitude !== latitude
  ) {
    return;
  }

  if (renderingPaused) {
    resumeRendering();
  }

  viewer.trackedEntity = undefined;
  cancelZoneFocusFly();
  viewer.camera.cancelFlight();

  await new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  });

  if (accidentRescueFlyTarget.value == null) return;

  const height = getAccidentRescueOverlayHeight();
  const target = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
  const pitch = isAccidentRescueFlatActive() ? MAOMING_PETRO.topDownPitch : MAOMING_PETRO.pitch;
  const range = ACCIDENT_RESCUE_INCIDENT_FOCUS_RANGE;

  const pose = computeZoneFocusCameraPose(viewer, target, range, props.focusRightInsetPx ?? 0, {
    pitchDeg: pitch,
  });

  await flyCameraToPose(pose, ACCIDENT_RESCUE_INCIDENT_FOCUS_DURATION_SEC);
}

async function flyToAccidentRescueIncident(longitude, latitude) {
  return enqueueMapTask(() => runFlyToAccidentRescueIncident(longitude, latitude));
}

/** 已在地图任务队列内时直接飞入，避免嵌套入队死锁 */
async function runFlyToAccidentRescueIncidentDirect(longitude, latitude) {
  return runFlyToAccidentRescueIncident(longitude, latitude);
}

async function flyToAccidentRescueCamera(flat, options = {}) {
  if (!viewer || !overviewBoundaryDataSource) return;
  viewer.trackedEntity = undefined;
  const sphere = computeBoundaryModelBoundingSphere(overviewBoundaryDataSource);
  if (!sphere) return;

  const multiplier = Math.max(1.2, props.boundaryOverviewRangeMultiplier ?? 2.05);
  const range = Math.max(sphere.radius * multiplier, 600);
  const pitch = flat ? MAOMING_PETRO.topDownPitch : MAOMING_PETRO.pitch;

  await viewer.camera.flyToBoundingSphere(sphere, {
    duration: options.instant ? 0 : 0.85,
    offset: new Cesium.HeadingPitchRange(
      Cesium.Math.toRadians(MAOMING_PETRO.heading),
      Cesium.Math.toRadians(pitch),
      range,
    ),
  });
  captureOverviewCameraPose(viewer);
  releaseCameraForUserInput(viewer);
}

async function applyAccidentRescueDisplayMode(flat, options = {}) {
  if (!viewer) return;

  if (!isAccidentRescueMode()) {
    teardownAccidentRescueFlatView();
    return;
  }

  const skipCamera = options.skipCamera === true;
  const instantCamera = options.instantCamera === true;

  accidentRescueFlatViewActive = flat;
  setAccidentRescueFlatViewActive(flat);

  applyAccidentRescueVisualPresentation(flat);
  applyAccidentRescuePlantPresentation(flat);
  applyAccidentRescueBoundaryPresentation(flat);
  applyAccidentRescueElevatedCapPresentation(flat);

  if (!skipCamera && isAccidentRescueMode()) {
    await flyToAccidentRescueCamera(flat, { instant: instantCamera });
  }

  viewer?.scene.requestRender();
}

async function toggleAccidentRescueDisplayMode() {
  if (!isAccidentRescueMode()) return;
  await applyAccidentRescueDisplayMode(!accidentRescueFlatViewActive);
}

function createSideWallCanvas() {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const { sideWallTop, sideWallHighlight, sideWallMid, sideWallBottom } = MAP_THEME.colors;
  const grad = ctx.createLinearGradient(0, 256, 0, 0);
  grad.addColorStop(0, sideWallBottom);
  grad.addColorStop(0.32, sideWallMid);
  grad.addColorStop(0.68, sideWallHighlight);
  grad.addColorStop(1, sideWallTop);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1, 256);
  return canvas;
}

function applyTechSceneStyle(viewer) {
  const { scene } = viewer;
  scene.backgroundColor = Cesium.Color.fromCssColorString('#020810');
  scene.globe.baseColor = Cesium.Color.fromCssColorString('#061428');
  scene.globe.showGroundAtmosphere = false;
  scene.fog.enabled = false;

  const sky = scene.skyAtmosphere;
  if (sky) {
    sky.show = false;
  }

  const bloom = scene.postProcessStages.bloom;
  if (bloom) {
    bloom.enabled = false;
  }

  applyCinematicDepthOfField(viewer);
}

function _applyLightSceneStyle(viewer) {
  const { scene } = viewer;
  scene.backgroundColor = Cesium.Color.fromCssColorString('#0b1624');
  scene.globe.baseColor = Cesium.Color.fromCssColorString('#0b1624');
  scene.globe.showGroundAtmosphere = true;
  scene.fog.enabled = false;

  const sky = scene.skyAtmosphere;
  if (sky) {
    sky.show = true;
  }

  const bloom = scene.postProcessStages.bloom;
  if (bloom) {
    bloom.enabled = false;
  }

  destroyDepthOfField(viewer);
}

function computeEyeSpaceDepth(viewer, worldPosition, result) {
  Cesium.Matrix4.multiplyByPoint(viewer.camera.viewMatrix, worldPosition, result);
  return -result.z;
}

function resolveFocusWorldPosition(viewer) {
  if (isAccidentRescueFlatOverview()) {
    return Cesium.Cartesian3.fromDegrees(
      MAOMING_PETRO.longitude,
      MAOMING_PETRO.latitude,
      overviewSiteReferenceTerrainHeight + ACCIDENT_RESCUE_FLAT.zoneSurfaceOffset,
    );
  }

  const { scene, canvas } = viewer;
  dofPickCenter.x = canvas.clientWidth * 0.5;
  dofPickCenter.y = canvas.clientHeight * 0.5;

  let focusWorld = scene.pickPosition(dofPickCenter);
  if (Cesium.defined(focusWorld)) {
    return focusWorld;
  }

  const ray = viewer.camera.getPickRay(dofPickCenter);
  if (ray) {
    focusWorld = scene.globe.pick(ray, scene);
    if (Cesium.defined(focusWorld)) {
      return focusWorld;
    }
  }

  return Cesium.Cartesian3.fromDegrees(
    MAOMING_PETRO.longitude,
    MAOMING_PETRO.latitude,
    MAP_DOF.focusHeight,
  );
}

function updateDepthOfFieldFocus(viewer) {
  if (!depthOfFieldCompositeStage || !hasValidCanvasSize(viewer)) return;
  const focusWorld = resolveFocusWorldPosition(viewer);
  depthOfFieldCompositeStage.uniforms.focalDistance = computeEyeSpaceDepth(
    viewer,
    focusWorld,
    dofFocusScratch,
  );
}

function applyCinematicDepthOfField(viewer) {
  destroyDepthOfField(viewer);

  if (!MAP_DOF.enabled || !hasValidCanvasSize(viewer)) return;

  const { scene } = viewer;
  if (!Cesium.PostProcessStageLibrary.isDepthOfFieldSupported(scene)) {
    console.warn('当前环境不支持景深（需要 depth texture）');
    return;
  }

  depthOfFieldBlurStage = Cesium.PostProcessStageLibrary.createBlurStage();
  depthOfFieldBlurStage.uniforms.delta = MAP_DOF.delta;
  depthOfFieldBlurStage.uniforms.sigma = MAP_DOF.sigma;
  depthOfFieldBlurStage.uniforms.stepSize = MAP_DOF.stepSize;

  depthOfFieldCompositeStage = new Cesium.PostProcessStage({
    name: 'cinematic_dof_composite',
    fragmentShader: CINEMATIC_DOF_SHADER,
    uniforms: {
      focalDistance: 2000,
      focusRadius: MAP_DOF.focusRadius,
      radialStrength: MAP_DOF.radialStrength,
      depthStrength: MAP_DOF.depthStrength,
      farBlurStart: MAP_DOF.farBlurStart,
      blurTexture: depthOfFieldBlurStage.name,
    },
  });

  depthOfFieldStage = new Cesium.PostProcessStageComposite({
    name: 'cinematic_depth_of_field',
    stages: [depthOfFieldBlurStage, depthOfFieldCompositeStage],
    inputPreviousStageTexture: false,
  });

  scene.postProcessStages.add(depthOfFieldStage);
  updateDepthOfFieldFocus(viewer);
  depthOfFieldCameraListener = () => updateDepthOfFieldFocus(viewer);
  viewer.camera.changed.addEventListener(depthOfFieldCameraListener);
}

function scheduleDepthOfFieldFocusRefresh(activeViewer = viewer) {
  if (!activeViewer?.scene || !depthOfFieldCompositeStage) return;
  const { scene } = activeViewer;
  const refresh = () => {
    updateDepthOfFieldFocus(activeViewer);
    scene.requestRender();
  };
  scene.postRender.addEventListener(refresh);
  window.setTimeout(() => {
    scene.postRender.removeEventListener(refresh);
    refresh();
  }, 0);
}

function destroyDepthOfField(activeViewer = viewer) {
  if (depthOfFieldCameraListener && activeViewer?.camera?.changed) {
    activeViewer.camera.changed.removeEventListener(depthOfFieldCameraListener);
  }
  depthOfFieldCameraListener = null;

  if (depthOfFieldStage && activeViewer?.scene?.postProcessStages) {
    activeViewer.scene.postProcessStages.remove(depthOfFieldStage);
  }
  depthOfFieldStage = null;
  depthOfFieldBlurStage = null;
  depthOfFieldCompositeStage = null;
}

async function styleBoundaryEntities(viewer, dataSource, prefix, _boundaryLonLatRing) {
  ensureEntityIds(dataSource, prefix);
  dataSource.name = '边界';
  const sideCanvas = createSideWallCanvas();
  const { slabBase, wallTop, edgeHeight } = MAP_THEME;

  for (const entity of dataSource.entities.values) {
    const ring = getPolygonRingPositions(entity);
    if (!ring) continue;

    const openRing = ringWithoutDuplicateClose(ring);
    const wallRing = [...openRing].reverse();
    const cartographics = await sampleOpenRingTerrain(viewer, openRing);
    boundaryFlatEdgeCartographics = cartographics;
    overviewSiteReferenceTerrainHeight =
      cartographics.reduce((sum, carto) => sum + (carto.height ?? 0), 0) / cartographics.length;
    const minHeights = wallHeightsFromCartographics(cartographics, slabBase);
    const maxHeights = wallHeightsFromCartographics(cartographics, wallTop);

    entity.polygon.show = false;

    entity.wall = new Cesium.WallGraphics({
      positions: wallRing,
      minimumHeights: minHeights,
      maximumHeights: maxHeights,
      material: createSideWallGradientMaterial(sideCanvas),
    });

    const topEdge = positionsFromCartographics(cartographics, edgeHeight);
    topEdge.push(Cesium.Cartesian3.clone(topEdge[0]));

    const edgeLineCommon = {
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    };

    dataSource.entities.add({
      id: `${entity.id}-edge-glow`,
      polyline: {
        positions: topEdge,
        width: 18,
        ...edgeLineCommon,
        material: new Cesium.PolylineGlowMaterialProperty({
          glowPower: 0.1,
          taperPower: 0.42,
          color: Cesium.Color.fromCssColorString(MAP_THEME.colors.edgeGlow),
        }),
      },
    });

    entity.polyline = new Cesium.PolylineGraphics({
      positions: topEdge,
      width: 5,
      ...edgeLineCommon,
      material: Cesium.Color.fromCssColorString(MAP_THEME.colors.edgeHighlight),
    });
  }
}

async function loadGeoJsonLayer(viewer, url, options) {
  const dataSource = await Cesium.GeoJsonDataSource.load(url, {
    clampToGround: false,
    ...options,
  });
  viewer.dataSources.add(dataSource);
  return dataSource;
}

/** 从已生成的边界侧墙/顶边收集包围点（贴地 GeoJSON 勿直接 zoomTo） */
function computeBoundaryModelBoundingSphere(boundaryDataSource) {
  if (!boundaryDataSource?.entities) return null;

  const points = [];
  const time = Cesium.JulianDate.now();

  for (const entity of boundaryDataSource.entities.values) {
    const wall = entity.wall;
    if (wall) {
      const positions = wall.positions?.getValue(time);
      const minHeights = wall.minimumHeights?.getValue(time);
      const maxHeights = wall.maximumHeights?.getValue(time);
      if (positions?.length && minHeights?.length && maxHeights?.length) {
        const n = Math.min(positions.length, minHeights.length, maxHeights.length);
        for (let i = 0; i < n; i++) {
          const carto = Cesium.Cartographic.fromCartesian(positions[i]);
          points.push(
            Cesium.Cartesian3.fromRadians(carto.longitude, carto.latitude, minHeights[i]),
          );
          points.push(
            Cesium.Cartesian3.fromRadians(carto.longitude, carto.latitude, maxHeights[i]),
          );
        }
      }
    }

    const polyline = entity.polyline;
    if (polyline) {
      const positions = polyline.positions?.getValue(time);
      if (positions?.length) {
        for (const position of positions) {
          points.push(Cesium.Cartesian3.clone(position));
        }
      }
    }
  }

  if (points.length < 2) return null;
  const sphere = Cesium.BoundingSphere.fromPoints(points);
  if (!Number.isFinite(sphere.center.x) || !Number.isFinite(sphere.radius) || sphere.radius <= 0) {
    return null;
  }
  return sphere;
}

/**
 * 默认视角：以边界 3D 模型（侧墙 + 顶边）包围球为准
 */
/** 关闭 Cesium 自带 UI、版权条及默认点击/双击选中与跟踪 */
function disableCesiumDefaultUi(activeViewer) {
  if (!activeViewer) return;

  const defaultHandler = activeViewer.cesiumWidget?.screenSpaceEventHandler;
  if (defaultHandler?.removeInputAction) {
    defaultHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    defaultHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
  }

  activeViewer.selectedEntity = undefined;
  activeViewer.trackedEntity = undefined;

  const hideEl = (el) => {
    if (el) el.style.display = 'none';
  };
  hideEl(activeViewer.infoBox?.container);
  hideEl(activeViewer.selectionIndicator?.element);
  hideEl(activeViewer.cesiumWidget?.creditContainer);

  const root = activeViewer.container;
  if (!root?.querySelectorAll) return;
  const chromeSelectors = [
    '.cesium-viewer-toolbar',
    '.cesium-viewer-animationContainer',
    '.cesium-viewer-timelineContainer',
    '.cesium-viewer-bottom',
    '.cesium-viewer-fullscreenContainer',
    '.cesium-viewer-vrContainer',
    '.cesium-viewer-geocoderContainer',
    '.cesium-viewer-infoBoxContainer',
    '.cesium-viewer-selectionIndicatorContainer',
  ];
  for (const selector of chromeSelectors) {
    root.querySelectorAll(selector).forEach((node) => {
      node.style.display = 'none';
      node.style.pointerEvents = 'none';
    });
  }
}

/** 装置区包围球（含体块高度） */
function computePlantZoneBoundingSphere(state) {
  const cartographics = state?.cartographics;
  if (!cartographics?.length) return null;

  let bottom;
  let top;
  if (state.selected) {
    const expandedH = getPlantExpandedHeight(state);
    bottom = state.restingTop - expandedH;
    top = state.restingTop;
  } else {
    bottom = getPlantBlockBottom(state);
    top = getPlantBlockTop(state);
  }
  const points = [];
  for (const carto of cartographics) {
    const terrain = carto.height ?? 0;
    points.push(Cesium.Cartesian3.fromRadians(carto.longitude, carto.latitude, terrain + bottom));
    points.push(Cesium.Cartesian3.fromRadians(carto.longitude, carto.latitude, terrain + top));
  }

  if (points.length < 1) return null;
  const sphere = Cesium.BoundingSphere.fromPoints(points);
  if (!Number.isFinite(sphere.radius) || sphere.radius <= 0) {
    const fallback = getPlantZoneMarkerWorldPosition(state);
    return fallback ? new Cesium.BoundingSphere(fallback, 90) : null;
  }
  return sphere;
}

const zoneFocusScratch = {
  savedPos: new Cesium.Cartesian3(),
  savedDir: new Cesium.Cartesian3(),
  savedUp: new Cesium.Cartesian3(),
  dest: new Cesium.Cartesian3(),
  dir: new Cesium.Cartesian3(),
  right: new Cesium.Cartesian3(),
  up: new Cesium.Cartesian3(),
  east: new Cesium.Cartesian3(),
  north: new Cesium.Cartesian3(),
  flyStartPos: new Cesium.Cartesian3(),
  flyStartDir: new Cesium.Cartesian3(),
  flyStartUp: new Cesium.Cartesian3(),
};

function cancelZoneFocusFly() {
  if (zoneFocusFlyRemover) {
    zoneFocusFlyRemover();
    zoneFocusFlyRemover = null;
  }
}

let releasingCameraForUserInput = false;

/** 仅恢复相机控制器输入，不取消飞行动画（避免 flyTo cancel 回调递归） */
function enableCameraUserInputs(activeViewer) {
  const controller = activeViewer?.scene?.screenSpaceCameraController;
  if (!controller) return;
  controller.enableInputs = true;
  controller.enableLook = true;
  controller.enableRotate = true;
  controller.enableTranslate = true;
  controller.enableZoom = true;
  controller.enableTilt = true;
}

/** 解除 lookAt 锁定，恢复鼠标拖拽/缩放 */
function releaseCameraForUserInput(activeViewer) {
  if (!activeViewer?.camera || releasingCameraForUserInput) return;

  releasingCameraForUserInput = true;
  try {
    const camera = activeViewer.camera;
    const destination = Cesium.Cartesian3.clone(camera.positionWC);
    const direction = Cesium.Cartesian3.clone(camera.directionWC);
    const up = Cesium.Cartesian3.clone(camera.upWC);

    camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    camera.cancelFlight();
    camera.setView({
      destination,
      orientation: { direction, up },
    });
    camera.lookAtTransform(Cesium.Matrix4.IDENTITY);

    activeViewer.trackedEntity = undefined;
    activeViewer.selectedEntity = undefined;

    enableCameraUserInputs(activeViewer);
  } finally {
    releasingCameraForUserInput = false;
  }
}

/** 直线匀速平移相机（无 flyTo 弧线、无缓动弹跳） */
function flyCameraLinear(viewer, pose, durationSec = 1) {
  cancelZoneFocusFly();
  viewer.camera.cancelFlight();

  const camera = viewer.camera;
  Cesium.Cartesian3.clone(camera.positionWC, zoneFocusScratch.flyStartPos);
  Cesium.Cartesian3.clone(camera.directionWC, zoneFocusScratch.flyStartDir);
  Cesium.Cartesian3.clone(camera.upWC, zoneFocusScratch.flyStartUp);

  const endPos = pose.destination;
  const endDir = pose.orientation.direction;
  const endUp = pose.orientation.up;
  const startMs = performance.now();
  const durationMs = Math.max(durationSec * 1000, 1);

  return new Promise((resolve) => {
    zoneFocusFlyRemover = viewer.scene.preRender.addEventListener(() => {
      const t = Math.min(Math.max((performance.now() - startMs) / durationMs, 0), 1);

      Cesium.Cartesian3.lerp(zoneFocusScratch.flyStartPos, endPos, t, zoneFocusScratch.dest);
      Cesium.Cartesian3.lerp(zoneFocusScratch.flyStartDir, endDir, t, zoneFocusScratch.dir);
      Cesium.Cartesian3.normalize(zoneFocusScratch.dir, zoneFocusScratch.dir);
      Cesium.Cartesian3.lerp(zoneFocusScratch.flyStartUp, endUp, t, zoneFocusScratch.up);
      Cesium.Cartesian3.normalize(zoneFocusScratch.up, zoneFocusScratch.up);

      camera.setView({
        destination: Cesium.Cartesian3.clone(zoneFocusScratch.dest),
        orientation: {
          direction: Cesium.Cartesian3.clone(zoneFocusScratch.dir),
          up: Cesium.Cartesian3.clone(zoneFocusScratch.up),
        },
      });

      if (t >= 1) {
        cancelZoneFocusFly();
        const activeViewer = viewer;
        requestAnimationFrame(() => {
          releaseCameraForUserInput(activeViewer);
          activeViewer?.scene.requestRender();
          resolve();
        });
      }
    });
  });
}

function lerpAngleRadians(start, end, t) {
  return start + Cesium.Math.negativePiToPi(end - start) * t;
}

function applyLookAtHpr(activeViewer, lookAt, heading, pitch, range) {
  const enu = Cesium.Transforms.eastNorthUpToFixedFrame(lookAt);
  activeViewer.camera.lookAtTransform(enu, new Cesium.HeadingPitchRange(heading, pitch, range));
  activeViewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
}

function pickCameraCenterOnGlobe(activeViewer) {
  const canvas = activeViewer.scene.canvas;
  const ray = activeViewer.camera.getPickRay(
    new Cesium.Cartesian2(canvas.clientWidth * 0.5, canvas.clientHeight * 0.5),
  );
  if (!ray) return null;
  const picked = activeViewer.scene.globe.pick(ray, activeViewer.scene);
  if (picked) return Cesium.Cartesian3.clone(picked, new Cesium.Cartesian3());
  return Cesium.Ray.getPoint(
    ray,
    Math.max(activeViewer.camera.positionCartographic.height * 1.2, 600),
  );
}

function extractLookAtSpecForPose(pose) {
  const saved = cloneCameraPose(viewer);
  viewer.camera.setView({
    destination: Cesium.Cartesian3.clone(pose.destination),
    orientation: {
      direction: Cesium.Cartesian3.clone(pose.orientation.direction),
      up: Cesium.Cartesian3.clone(pose.orientation.up),
    },
  });
  const lookAt = pickCameraCenterOnGlobe(viewer);
  const spec = {
    lookAt,
    heading: viewer.camera.heading,
    pitch: viewer.camera.pitch,
    range: lookAt
      ? Cesium.Cartesian3.distance(viewer.camera.positionWC, lookAt)
      : MAOMING_PETRO.cameraRange,
  };
  viewer.camera.setView({
    destination: saved.destination,
    orientation: saved.orientation,
  });
  return spec;
}

/**
 * 围绕注视点插值：zoomOnly 时注视点固定，仅同步缩放/旋转；
 * 否则注视点与缩放/旋转同一进度变化（边平移边缩放）。
 */
async function flyCameraLookAtSpecLerp(endPose, durationSec, options = {}) {
  if (!viewer || !endPose) return;
  const zoomOnly = options.zoomOnly === true;

  cancelZoneFocusFly();
  viewer.camera.cancelFlight();
  if (renderingPaused) {
    resumeRendering();
  }
  if (hasValidCanvasSize(viewer)) {
    viewer.resize();
  }
  viewer.useDefaultRenderLoop = true;
  viewer.scene.requestRender();

  const end = extractLookAtSpecForPose(endPose);
  if (!end.lookAt) {
    snapCameraToPose(endPose);
    return;
  }

  const startLookAt = zoomOnly
    ? Cesium.Cartesian3.clone(end.lookAt, new Cesium.Cartesian3())
    : (pickCameraCenterOnGlobe(viewer) ??
      Cesium.Cartesian3.clone(end.lookAt, new Cesium.Cartesian3()));
  const start = {
    lookAt: startLookAt,
    heading: viewer.camera.heading,
    pitch: viewer.camera.pitch,
    range: Cesium.Cartesian3.distance(viewer.camera.positionWC, startLookAt),
  };

  const startMs = performance.now();
  const durationMs = Math.max(durationSec * 1000, 1);

  return new Promise((resolve) => {
    zoneFocusFlyRemover = viewer.scene.preRender.addEventListener(() => {
      const t = Math.min(Math.max((performance.now() - startMs) / durationMs, 0), 1);
      const lookAt = zoomOnly
        ? end.lookAt
        : Cesium.Cartesian3.lerp(start.lookAt, end.lookAt, t, zoneFocusScratch.dest);
      const range = start.range + (end.range - start.range) * t;
      const heading = lerpAngleRadians(start.heading, end.heading, t);
      const pitch = start.pitch + (end.pitch - start.pitch) * t;

      applyLookAtHpr(viewer, lookAt, heading, pitch, Math.max(range, 1));

      if (t >= 1) {
        cancelZoneFocusFly();
        snapCameraToPose(endPose);
        requestAnimationFrame(() => {
          releaseCameraForUserInput(viewer);
          viewer.scene.requestRender();
          resolve();
        });
      }
    });
  });
}

function getMetersPerPixelAtRange(range, canvas, frustum) {
  const w = Math.max(canvas.clientWidth, 1);
  const h = Math.max(canvas.clientHeight, 1);
  if (frustum instanceof Cesium.PerspectiveFrustum) {
    const tanHalfFovy = Math.tan(frustum.fovy * 0.5);
    const tanHalfFovx = tanHalfFovy * frustum.aspectRatio;
    return {
      x: (2 * range * tanHalfFovx) / w,
      y: (2 * range * tanHalfFovy) / h,
    };
  }
  const scale = Math.max(range * 0.002, 0.5);
  return { x: scale, y: scale };
}

/**
 * 飞入注视点：在区块真实中心沿东向（经度）、北向（纬度）偏移。
 * 相机仍对准屏幕几何中心，偏移后真实区块落在左侧空白区的中心。
 */
function computeZoneLookAtCenterForLeftView(
  zoneCenter,
  range,
  canvas,
  frustum,
  rightInsetPx,
  topInsetPx,
  verticalExtraPx,
  horizontalScale,
  leftInsetPx = 0,
  bottomInsetPx = 0,
) {
  const w = Math.max(canvas.clientWidth, 1);
  const h = Math.max(canvas.clientHeight, 1);
  const leftInset = Math.max(0, leftInsetPx ?? 0);
  const rightInset = Math.max(0, rightInsetPx ?? 0);
  const topInset = Math.max(0, topInsetPx ?? 0);
  const bottomInset = Math.max(0, bottomInsetPx ?? 0);
  const verticalExtra = Math.max(0, verticalExtraPx ?? 0);

  if (
    rightInset <= 0 &&
    leftInset <= 0 &&
    topInset <= 0 &&
    bottomInset <= 0 &&
    verticalExtra <= 0
  ) {
    return Cesium.Cartesian3.clone(zoneCenter, new Cesium.Cartesian3());
  }

  const mpp = getMetersPerPixelAtRange(range, canvas, frustum);
  const targetScreenX = leftInset + (w - leftInset - rightInset) * 0.5;
  const targetScreenY = topInset + (h - topInset - bottomInset) * 0.5;
  const hScale = Cesium.Math.clamp(Number(horizontalScale ?? 1), 0, 1);
  const pixelShiftX = (w * 0.5 - targetScreenX) * hScale;
  /** 负值越大 → 注视点越偏南 → 真实区块在屏幕上越靠上 */
  const pixelShiftY = h * 0.5 - targetScreenY - verticalExtra;

  const enu = Cesium.Transforms.eastNorthUpToFixedFrame(zoneCenter);
  Cesium.Matrix4.getColumn(enu, 0, zoneFocusScratch.east);
  Cesium.Matrix4.getColumn(enu, 1, zoneFocusScratch.north);

  Cesium.Cartesian3.clone(zoneCenter, zoneFocusScratch.dest);
  if (pixelShiftX !== 0) {
    Cesium.Cartesian3.add(
      zoneFocusScratch.dest,
      Cesium.Cartesian3.multiplyByScalar(
        zoneFocusScratch.east,
        pixelShiftX * mpp.x,
        zoneFocusScratch.flyStartDir,
      ),
      zoneFocusScratch.dest,
    );
  }
  if (pixelShiftY !== 0) {
    Cesium.Cartesian3.add(
      zoneFocusScratch.dest,
      Cesium.Cartesian3.multiplyByScalar(
        zoneFocusScratch.north,
        pixelShiftY * mpp.y,
        zoneFocusScratch.flyStartDir,
      ),
      zoneFocusScratch.dest,
    );
  }

  return Cesium.Cartesian3.clone(zoneFocusScratch.dest, new Cesium.Cartesian3());
}

/**
 * 详情内切换区块：保持当前缩放/旋转，仅平移使新区块落在相同屏幕位置
 */
function resolveZoneFocusInsets(focusOverrides = {}) {
  return {
    leftInsetPx: focusOverrides.leftInsetPx ?? props.focusLeftInsetPx ?? 0,
    bottomInsetPx: focusOverrides.bottomInsetPx ?? props.focusBottomInsetPx ?? 0,
    topInsetPx: focusOverrides.topInsetPx ?? props.focusTopInsetPx ?? 0,
    verticalExtraPx: focusOverrides.verticalExtraPx ?? props.focusVerticalExtraPx ?? 0,
    horizontalScale: focusOverrides.horizontalScale ?? props.focusHorizontalScale,
  };
}

function computeZoneSwitchPanPose(viewer, fromCenter, toCenter, rightInsetPx, focusOverrides = {}) {
  const camera = viewer.camera;
  const range = Cesium.Cartesian3.distance(camera.positionWC, fromCenter);
  if (!Number.isFinite(range) || range <= 0) {
    return computeZoneFocusCameraPose(
      viewer,
      toCenter,
      zoneDetailLockedRange ?? 800,
      rightInsetPx,
      focusOverrides,
    );
  }

  const canvas = viewer.scene.canvas;
  const frustum = camera.frustum;
  const {
    leftInsetPx: leftInset,
    bottomInsetPx: bottomInset,
    topInsetPx: topInset,
    verticalExtraPx: verticalExtra,
    horizontalScale,
  } = resolveZoneFocusInsets(focusOverrides);

  const fromLookAt = computeZoneLookAtCenterForLeftView(
    fromCenter,
    range,
    canvas,
    frustum,
    rightInsetPx,
    topInset,
    verticalExtra,
    horizontalScale,
    leftInset,
    bottomInset,
  );
  const toLookAt = computeZoneLookAtCenterForLeftView(
    toCenter,
    range,
    canvas,
    frustum,
    rightInsetPx,
    topInset,
    verticalExtra,
    horizontalScale,
    leftInset,
    bottomInset,
  );

  Cesium.Cartesian3.subtract(toLookAt, fromLookAt, zoneFocusScratch.dir);
  Cesium.Cartesian3.add(camera.positionWC, zoneFocusScratch.dir, zoneFocusScratch.dest);

  return {
    destination: Cesium.Cartesian3.clone(zoneFocusScratch.dest),
    orientation: {
      direction: Cesium.Cartesian3.clone(camera.directionWC),
      up: Cesium.Cartesian3.clone(camera.upWC),
    },
  };
}

/** 按当前视距 + 航向俯仰计算相机位姿（注视点为经东向偏移后的中心） */
function computeZoneFocusCameraPose(viewer, zoneCenter, range, rightInsetPx, focusOverrides = {}) {
  const camera = viewer.camera;
  const heading = Cesium.Math.toRadians(MAOMING_PETRO.heading);
  const pitchDeg = focusOverrides.pitchDeg != null ? focusOverrides.pitchDeg : MAOMING_PETRO.pitch;
  const pitch = Cesium.Math.toRadians(pitchDeg);
  const {
    leftInsetPx: leftInset,
    bottomInsetPx: bottomInset,
    topInsetPx,
    verticalExtraPx,
    horizontalScale,
  } = resolveZoneFocusInsets(focusOverrides);
  const lookAtCenter = computeZoneLookAtCenterForLeftView(
    zoneCenter,
    range,
    viewer.scene.canvas,
    camera.frustum,
    rightInsetPx,
    topInsetPx,
    verticalExtraPx,
    horizontalScale,
    leftInset,
    bottomInset,
  );
  const enu = Cesium.Transforms.eastNorthUpToFixedFrame(lookAtCenter);
  const hprOffset = new Cesium.HeadingPitchRange(heading, pitch, range);

  Cesium.Cartesian3.clone(camera.positionWC, zoneFocusScratch.savedPos);
  Cesium.Cartesian3.clone(camera.directionWC, zoneFocusScratch.savedDir);
  Cesium.Cartesian3.clone(camera.upWC, zoneFocusScratch.savedUp);

  camera.lookAtTransform(enu, hprOffset);

  Cesium.Cartesian3.clone(camera.positionWC, zoneFocusScratch.dest);
  Cesium.Cartesian3.clone(camera.directionWC, zoneFocusScratch.dir);
  Cesium.Cartesian3.clone(camera.upWC, zoneFocusScratch.up);

  camera.setView({
    destination: zoneFocusScratch.savedPos,
    orientation: {
      direction: zoneFocusScratch.savedDir,
      up: zoneFocusScratch.savedUp,
    },
  });
  camera.lookAtTransform(Cesium.Matrix4.IDENTITY);

  Cesium.Cartesian3.subtract(lookAtCenter, zoneFocusScratch.dest, zoneFocusScratch.dir);
  Cesium.Cartesian3.normalize(zoneFocusScratch.dir, zoneFocusScratch.dir);

  Cesium.Matrix4.getColumn(enu, 2, zoneFocusScratch.east);
  Cesium.Cartesian3.cross(zoneFocusScratch.dir, zoneFocusScratch.east, zoneFocusScratch.right);
  Cesium.Cartesian3.normalize(zoneFocusScratch.right, zoneFocusScratch.right);
  Cesium.Cartesian3.cross(zoneFocusScratch.right, zoneFocusScratch.dir, zoneFocusScratch.up);
  Cesium.Cartesian3.normalize(zoneFocusScratch.up, zoneFocusScratch.up);

  return {
    destination: Cesium.Cartesian3.clone(zoneFocusScratch.dest),
    orientation: {
      direction: Cesium.Cartesian3.clone(zoneFocusScratch.dir),
      up: Cesium.Cartesian3.clone(zoneFocusScratch.up),
    },
  };
}

/** 选中区块飞入：视距缩放（<1 略放大）、最短飞行时长（秒） */
const PLANT_ZONE_FOCUS_RANGE_SCALE = 0.82;
const PLANT_ZONE_FOCUS_MIN_RANGE = 480;
const PLANT_ZONE_FOCUS_FLY_DURATION_SEC = 0.65;

/**
 * 选中装置区：总览→详情首次略放大；详情内切换区块按当前视角平移
 */
async function flyToPlantZoneFocus(zoneKey) {
  if (!viewer || !zoneKey) return;

  const state = plantHoverStates.get(zoneKey);
  if (!state) return;

  const sphere = computePlantZoneBoundingSphere(state);
  const target = getPlantZoneMarkerWorldPosition(state) ?? sphere?.center;
  if (!target) return;

  const rawRange = Cesium.Cartesian3.distance(viewer.camera.positionWC, target);
  if (!Number.isFinite(rawRange) || rawRange <= 0) return;

  const zoomInFromOverview = !zoneDetailViewActive;
  let pose;
  if (zoomInFromOverview) {
    const range = Math.max(rawRange * PLANT_ZONE_FOCUS_RANGE_SCALE, PLANT_ZONE_FOCUS_MIN_RANGE);
    zoneDetailLockedRange = range;
    pose = computeZoneFocusCameraPose(viewer, target, range, props.focusRightInsetPx ?? 0);
  } else if (zoneDetailLastCenter) {
    pose = computeZoneSwitchPanPose(
      viewer,
      zoneDetailLastCenter,
      target,
      props.focusRightInsetPx ?? 0,
    );
  } else {
    const range = zoneDetailLockedRange ?? rawRange;
    pose = computeZoneFocusCameraPose(viewer, target, range, props.focusRightInsetPx ?? 0);
  }

  viewer.trackedEntity = undefined;
  await flyCameraLinear(viewer, pose, PLANT_ZONE_FOCUS_FLY_DURATION_SEC);
  zoneDetailViewActive = true;
  zoneDetailLastCenter = Cesium.Cartesian3.clone(target);
  releaseCameraForUserInput(viewer);
  viewer.scene.requestRender();
}

async function flyToBoundaryModel(viewer, boundaryDataSource, fallbackOffset) {
  viewer.trackedEntity = undefined;
  const sphere = computeBoundaryModelBoundingSphere(boundaryDataSource);
  if (!sphere) {
    flyToMaoming(viewer, MAOMING_PETRO, fallbackOffset);
    return;
  }

  const multiplier = Math.max(1.2, props.boundaryOverviewRangeMultiplier ?? 2.05);
  const range = Math.max(sphere.radius * multiplier, 600);
  await viewer.camera.flyToBoundingSphere(sphere, {
    duration: 0,
    offset: new Cesium.HeadingPitchRange(
      Cesium.Math.toRadians(MAOMING_PETRO.heading),
      Cesium.Math.toRadians(MAOMING_PETRO.pitch),
      range,
    ),
  });
}

/**
 * 以厂区中心为目标设置视角（边界模型不可用时的回退）
 */
function flyToMaoming(viewer, center, offset) {
  viewer.trackedEntity = undefined;

  const centerPosition = Cesium.Cartesian3.fromDegrees(center.longitude, center.latitude, 0);
  const enuFrame = Cesium.Transforms.eastNorthUpToFixedFrame(centerPosition);

  viewer.camera.lookAtTransform(enuFrame, offset);
  viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
}

function hasValidCanvasSize(activeViewer = viewer) {
  const canvas = activeViewer?.scene?.canvas;
  return !!canvas && canvas.clientWidth > 0 && canvas.clientHeight > 0;
}

function pauseRendering() {
  if (!viewer || renderingPaused) return;
  renderingPaused = true;
  viewer.useDefaultRenderLoop = false;
  stopPlantTagPinAnimation();
}

function resumeRendering() {
  if (!viewer) return;
  renderingPaused = false;
  if (!hasValidCanvasSize(viewer)) return;
  viewer.resize();
  viewer.useDefaultRenderLoop = true;
  viewer.scene.requestRender();
}

function attachRenderNotifier(activeViewer) {
  if (postRenderNotifyRemover) {
    postRenderNotifyRemover();
    postRenderNotifyRemover = null;
  }
  if (!activeViewer?.scene) return;
  postRenderNotifyRemover = activeViewer.scene.postRender.addEventListener(() => {
    if (renderingPaused || !hasValidCanvasSize(activeViewer)) return;
    for (const listener of renderListeners) {
      listener();
    }
  });
}

function attachRenderErrorRecovery(activeViewer) {
  if (renderErrorRemover) {
    renderErrorRemover();
    renderErrorRemover = null;
  }
  if (!activeViewer?.scene?.renderError) return;
  renderErrorRemover = activeViewer.scene.renderError.addEventListener((_scene, error) => {
    console.warn('[Cesium] render error, attempting recovery:', error);
    pauseRendering();
    window.requestAnimationFrame(() => {
      if (hasValidCanvasSize(activeViewer)) {
        resumeRendering();
      }
    });
  });
}

function attachResizeObserver() {
  resizeObserver?.disconnect();
  if (!containerEl.value || typeof ResizeObserver === 'undefined') return;
  resizeObserver = new ResizeObserver((entries) => {
    if (!viewer || renderingPaused) return;
    const rect = entries[0]?.contentRect;
    if (!rect || rect.width <= 0 || rect.height <= 0) return;
    viewer.resize();
    viewer.scene.requestRender();
  });
  resizeObserver.observe(containerEl.value);
}

function addRenderListener(listener) {
  if (typeof listener !== 'function') {
    return () => {};
  }
  renderListeners.add(listener);
  return () => {
    renderListeners.delete(listener);
  };
}

/** 将 WGS84 坐标投影到地图容器内的屏幕像素（与 Canvas client 尺寸一致） */
function worldToScreen(longitude, latitude, height = MAP_THEME.plantHeight) {
  if (!viewer?.scene) return null;

  const position = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
  const windowPosition = Cesium.SceneTransforms.worldToWindowCoordinates(viewer.scene, position);
  if (!windowPosition) return null;

  const canvas = viewer.scene.canvas;
  if (
    windowPosition.x < 0 ||
    windowPosition.y < 0 ||
    windowPosition.x > canvas.clientWidth ||
    windowPosition.y > canvas.clientHeight
  ) {
    return null;
  }

  return { x: windowPosition.x, y: windowPosition.y };
}

/** HTML 标记随相机距离缩放（与装置区标签同一套比例） */
function getMarkerUiScale(longitude, latitude, height = MAP_THEME.plantHeight) {
  if (!viewer) return 1;
  const position = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
  return computePlantMarkerUiScale(position);
}

/** HTML 覆盖层滚轮转发到底层 Cesium 画布 */
function relayWheelEvent(event) {
  const canvas = viewer?.scene?.canvas;
  if (!canvas) return;

  canvas.dispatchEvent(
    new WheelEvent('wheel', {
      bubbles: true,
      cancelable: true,
      clientX: event.clientX,
      clientY: event.clientY,
      deltaX: event.deltaX,
      deltaY: event.deltaY,
      deltaZ: event.deltaZ,
      deltaMode: event.deltaMode,
    }),
  );
}

/** 边界 3D 模型包围球中心（水平居中，高度取顶面 plantHeight） */
function getBoundaryModelCenter() {
  const sphere = computeBoundaryModelBoundingSphere(overviewBoundaryDataSource);
  if (!sphere) return null;
  const carto = Cesium.Cartographic.fromCartesian(sphere.center);
  return {
    longitude: Cesium.Math.toDegrees(carto.longitude),
    latitude: Cesium.Math.toDegrees(carto.latitude),
    height: MAP_THEME.plantHeight,
  };
}

/** 在边界环上取指定方位的代表点（优先极值且靠近对侧中心，避免聚在角点） */
function pickBoundaryRingEdgePoint(ring, edge) {
  if (!ring?.length) return null;

  let sumLon = 0;
  let sumLat = 0;
  for (const point of ring) {
    sumLon += point.lon;
    sumLat += point.lat;
  }
  const centerLon = sumLon / ring.length;
  const centerLat = sumLat / ring.length;

  let best = ring[0];
  let bestScore = -Infinity;

  for (const point of ring) {
    let score;
    switch (edge) {
      case 'north':
        score = point.lat - Math.abs(point.lon - centerLon) * 0.002;
        break;
      case 'south':
        score = -point.lat - Math.abs(point.lon - centerLon) * 0.002;
        break;
      case 'east':
        score = point.lon - Math.abs(point.lat - centerLat) * 0.002;
        break;
      case 'west':
        score = -point.lon - Math.abs(point.lat - centerLat) * 0.002;
        break;
      default:
        score = 0;
    }
    if (score > bestScore) {
      bestScore = score;
      best = point;
    }
  }

  return best;
}

/** 边界模型四向边缘锚点（北/南/东/西各一，用于安防门禁等 HTML 标注） */
function getBoundaryEdgePositions() {
  const ring = overviewBoundaryLonLatRing;
  if (!ring?.length) return null;

  const height = MAP_THEME.plantHeight;
  const sides = ['north', 'south', 'east', 'west'];
  const result = {};

  for (const edge of sides) {
    const point = pickBoundaryRingEdgePoint(ring, edge);
    if (point) {
      result[edge] = {
        longitude: point.lon,
        latitude: point.lat,
        height,
      };
    }
  }

  return result;
}

let tvInspectionCircleEntities = [];
/** @type {Map<string, { id: string, longitude: number, latitude: number, radiusMeters: number, height: number, variant: number, radialEntity: object, circleEntity: object }>} */
let tvInspectionCircleById = new Map();
/** @type {{ circleId: string, startedAt: number, progress: number, baseAngleRad: number } | null} */
let tvInspectionScanActive = null;
let tvInspectionScanPreRenderRemover = null;
let tvInspectionInteractionHandler = null;
let tvInspectionHoveredCircleId = null;
let tvInspectionHoverRafPending = false;
let tvInspectionHoverPendingPosition = null;
let tvInspectionLastPublishedScanProgress = -1;
let lastTvInspectionCirclesSignature = '';

function getBoundaryModelTopHeight() {
  return MAP_THEME.plantHeight + TV_INSPECTION_HEIGHT_OFFSET;
}

function ringBoundingBox(ring) {
  let minLon = Infinity;
  let maxLon = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;

  for (const point of ring) {
    minLon = Math.min(minLon, point.lon);
    maxLon = Math.max(maxLon, point.lon);
    minLat = Math.min(minLat, point.lat);
    maxLat = Math.max(maxLat, point.lat);
  }

  return {
    minLon,
    maxLon,
    minLat,
    maxLat,
    centerLon: (minLon + maxLon) / 2,
    centerLat: (minLat + maxLat) / 2,
  };
}

function metersPerDegreeAtLatitude(latitude) {
  const latRad = Cesium.Math.toRadians(latitude);
  const metersPerDegreeLat = 6378137 * (Math.PI / 180);
  return {
    lat: metersPerDegreeLat,
    lon: metersPerDegreeLat * Math.cos(latRad),
  };
}

function metersBetweenLatLon(lat1, lon1, lat2, lon2) {
  const scale = metersPerDegreeAtLatitude((lat1 + lat2) / 2);
  const dy = (lat2 - lat1) * scale.lat;
  const dx = (lon2 - lon1) * scale.lon;
  return Math.sqrt(dx * dx + dy * dy);
}

function lonLatAtRadius(centerLon, centerLat, radiusMeters, angleRad) {
  const scale = metersPerDegreeAtLatitude(centerLat);
  return {
    lon: centerLon + (Math.cos(angleRad) * radiusMeters) / scale.lon,
    lat: centerLat + (Math.sin(angleRad) * radiusMeters) / scale.lat,
  };
}

function isCircleInsideRing(
  centerLon,
  centerLat,
  radiusMeters,
  ring,
  sampleCount = TV_INSPECTION_RING_SAMPLES,
) {
  if (!pointInLonLatRing(centerLon, centerLat, ring)) return false;

  for (let i = 0; i < sampleCount; i++) {
    const angle = (i / sampleCount) * Math.PI * 2;
    const point = lonLatAtRadius(centerLon, centerLat, radiusMeters, angle);
    if (!pointInLonLatRing(point.lon, point.lat, ring)) return false;
  }

  return true;
}

function maxRadiusInsideRing(centerLon, centerLat, ring, upperBoundMeters) {
  if (!pointInLonLatRing(centerLon, centerLat, ring)) return 0;

  let lo = 10;
  let hi = Math.max(lo, upperBoundMeters);

  if (!isCircleInsideRing(centerLon, centerLat, lo, ring)) return 0;

  for (let iter = 0; iter < 22; iter++) {
    const mid = (lo + hi) / 2;
    if (isCircleInsideRing(centerLon, centerLat, mid, ring)) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  return lo;
}

/** 在边界北/南半区内网格搜索可容纳最大圆的圆心 */
function findLargestCircleCenterInHalf(ring, hemisphere, upperBoundMeters) {
  const bbox = ringBoundingBox(ring);
  const steps = TV_INSPECTION_CENTER_GRID_STEPS;
  let bestCenter = null;
  let bestRadius = 0;

  for (let i = 0; i <= steps; i++) {
    for (let j = 0; j <= steps; j++) {
      const lon = bbox.minLon + ((bbox.maxLon - bbox.minLon) * i) / steps;
      const lat = bbox.minLat + ((bbox.maxLat - bbox.minLat) * j) / steps;
      const isNorthHalf = lat >= bbox.centerLat;

      if (hemisphere === 'north' && !isNorthHalf) continue;
      if (hemisphere === 'south' && isNorthHalf) continue;
      if (!pointInLonLatRing(lon, lat, ring)) continue;

      const radius = maxRadiusInsideRing(lon, lat, ring, upperBoundMeters);
      if (radius > bestRadius) {
        bestRadius = radius;
        bestCenter = { lon, lat };
      }
    }
  }

  return bestCenter;
}

/** 从边界指定侧边缘向园区内部寻找可用圆心 */
function findInteriorCircleCenter(ring, edge) {
  const edgePoint = pickBoundaryRingEdgePoint(ring, edge);
  if (!edgePoint) return null;

  const bbox = ringBoundingBox(ring);
  for (let inset = 0.12; inset <= 0.5; inset += 0.04) {
    const lon = edgePoint.lon + (bbox.centerLon - edgePoint.lon) * inset;
    const lat = edgePoint.lat + (bbox.centerLat - edgePoint.lat) * inset;
    if (pointInLonLatRing(lon, lat, ring)) {
      return { lon, lat };
    }
  }

  if (pointInLonLatRing(bbox.centerLon, bbox.centerLat, ring)) {
    return { lon: bbox.centerLon, lat: bbox.centerLat };
  }

  return null;
}

/** 在边界内按纬度比例取圆心（偏北 / 偏南各一） */
function _findInteriorPointAtLatFraction(ring, latFraction) {
  const bbox = ringBoundingBox(ring);
  const targetLat = bbox.minLat + (bbox.maxLat - bbox.minLat) * latFraction;

  for (let i = 0; i <= 48; i++) {
    const t = i / 48;
    const lon = bbox.minLon + (bbox.maxLon - bbox.minLon) * t;
    if (pointInLonLatRing(lon, targetLat, ring)) {
      return { lon, lat: targetLat };
    }
  }

  return findInteriorCircleCenter(ring, latFraction >= 0.5 ? 'north' : 'south');
}

function buildCircleSpec(id, variant, center, ring, requestedRadiusMeters, halfBudget, height) {
  if (!center) return null;

  let radius = maxRadiusInsideRing(
    center.lon,
    center.lat,
    ring,
    Math.min(requestedRadiusMeters, halfBudget),
  );

  while (radius > 12 && !isCircleInsideRing(center.lon, center.lat, radius, ring)) {
    radius *= 0.9;
  }

  if (radius < 12) return null;

  return {
    id,
    variant,
    longitude: center.lon,
    latitude: center.lat,
    radiusMeters: radius,
    height,
  };
}

/** 基于边界环计算南北两个互不重叠、整圆落在园区内的巡检圆（固定两个） */
function computeTvInspectionCirclesFromBoundary(requestedRadiusMeters = 332) {
  const ring = overviewBoundaryLonLatRing;
  if (!ring?.length) return [];

  const height = getBoundaryModelTopHeight();
  const northCenter =
    findLargestCircleCenterInHalf(ring, 'north', requestedRadiusMeters) ??
    findInteriorCircleCenter(ring, 'north');
  const southCenter =
    findLargestCircleCenterInHalf(ring, 'south', requestedRadiusMeters) ??
    findInteriorCircleCenter(ring, 'south');

  if (!northCenter || !southCenter) return [];

  const centerDistance = metersBetweenLatLon(
    northCenter.lat,
    northCenter.lon,
    southCenter.lat,
    southCenter.lon,
  );
  const halfBudget = Math.max(20, (centerDistance - TV_INSPECTION_CIRCLE_SEPARATION_GAP) / 2);

  const circles = [
    buildCircleSpec(
      'inspection-north',
      0,
      northCenter,
      ring,
      requestedRadiusMeters,
      halfBudget,
      height,
    ),
    buildCircleSpec(
      'inspection-south',
      1,
      southCenter,
      ring,
      requestedRadiusMeters,
      halfBudget,
      height,
    ),
  ].filter(Boolean);

  return circles;
}

function getTvInspectionCircles(requestedRadiusMeters = 332) {
  const computed = computeTvInspectionCirclesFromBoundary(requestedRadiusMeters);
  if (computed.length >= 2) return computed;
  if (computed.length === 1) {
    const height = getBoundaryModelTopHeight();
    const missing = TV_INSPECTION_FALLBACK_CIRCLES.find(
      (item) => !computed.some((circle) => circle.id === item.id),
    );
    if (missing) {
      return [...computed, { ...missing, height }];
    }
    return computed;
  }

  const height = getBoundaryModelTopHeight();
  return TV_INSPECTION_FALLBACK_CIRCLES.map((item) => ({
    ...item,
    height,
  }));
}

function tryApplyTvInspectionCircles(requestedRadiusMeters = 332) {
  if (!viewer) return false;
  const circles = getTvInspectionCircles(requestedRadiusMeters);
  if (circles.length === 0) return false;
  setTvInspectionCircles(circles);
  return true;
}

function applyTvInspectionCircles(requestedRadiusMeters = 332) {
  return tryApplyTvInspectionCircles(requestedRadiusMeters);
}

function buildElevatedCirclePositions(
  centerLon,
  centerLat,
  radiusMeters,
  height,
  segments = TV_INSPECTION_CIRCLE_SEGMENTS,
) {
  const positions = [];
  const scale = metersPerDegreeAtLatitude(centerLat);

  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const lon = centerLon + (Math.cos(angle) * radiusMeters) / scale.lon;
    const lat = centerLat + (Math.sin(angle) * radiusMeters) / scale.lat;
    positions.push(Cesium.Cartesian3.fromDegrees(lon, lat, height));
  }

  return positions;
}

function buildRadialLinePositions(centerLon, centerLat, radiusMeters, height, variant = 0) {
  const angleRad = TV_INSPECTION_RADIAL_ANGLES[variant] ?? TV_INSPECTION_RADIAL_ANGLES[0];
  return buildRadialLinePositionsAtAngle(centerLon, centerLat, radiusMeters, height, angleRad);
}

function buildRadialLinePositionsAtAngle(centerLon, centerLat, radiusMeters, height, angleRad) {
  const edge = lonLatAtRadius(centerLon, centerLat, radiusMeters, angleRad);
  return [
    Cesium.Cartesian3.fromDegrees(centerLon, centerLat, height),
    Cesium.Cartesian3.fromDegrees(edge.lon, edge.lat, height),
  ];
}

function offsetMetersToLonLat(centerLon, centerLat, offsetEastMeters, offsetNorthMeters) {
  const scale = metersPerDegreeAtLatitude(centerLat);
  return {
    longitude: centerLon + offsetEastMeters / scale.lon,
    latitude: centerLat + offsetNorthMeters / scale.lat,
  };
}

function resolveTvInspectionCircleIdFromEntityId(entityId) {
  const id = String(entityId ?? '');
  const prefixes = [
    'tv-inspection-circle-',
    'tv-inspection-radial-',
    'tv-inspection-center-',
    'tv-inspection-fill-',
  ];
  for (const prefix of prefixes) {
    if (id.startsWith(prefix)) return id.slice(prefix.length);
  }
  return null;
}

function computeInspectionCircleTopDownRange(radiusMeters) {
  if (!viewer?.scene?.canvas || !viewer.camera?.frustum) {
    return Math.max(radiusMeters * 2.8, 220);
  }

  const diameter = radiusMeters * 2 * TV_INSPECTION_SCAN_TOP_DOWN_PADDING;
  const frustum = viewer.camera.frustum;
  if (frustum instanceof Cesium.PerspectiveFrustum) {
    const tanHalfFovy = Math.tan(frustum.fovy * 0.5);
    const tanHalfFovx = tanHalfFovy * frustum.aspectRatio;
    const rangeForHeight = diameter / (2 * tanHalfFovy);
    const rangeForWidth = diameter / (2 * tanHalfFovx);
    return Math.max(rangeForHeight, rangeForWidth, 120);
  }

  return Math.max(radiusMeters * 2.8, 220);
}

async function flyToInspectionCircleTopDown(circle) {
  if (!viewer || !circle) return;

  const center = Cesium.Cartesian3.fromDegrees(circle.longitude, circle.latitude, circle.height);
  const range = computeInspectionCircleTopDownRange(circle.radiusMeters);
  const enu = Cesium.Transforms.eastNorthUpToFixedFrame(center);
  const hpr = new Cesium.HeadingPitchRange(0, Cesium.Math.toRadians(-89.9), range);

  const camera = viewer.camera;
  Cesium.Cartesian3.clone(camera.positionWC, zoneFocusScratch.savedPos);
  Cesium.Cartesian3.clone(camera.directionWC, zoneFocusScratch.savedDir);
  Cesium.Cartesian3.clone(camera.upWC, zoneFocusScratch.savedUp);

  camera.lookAtTransform(enu, hpr);
  const pose = {
    destination: Cesium.Cartesian3.clone(camera.positionWC),
    orientation: {
      direction: Cesium.Cartesian3.clone(camera.directionWC),
      up: Cesium.Cartesian3.clone(camera.upWC),
    },
  };

  camera.setView({
    destination: zoneFocusScratch.savedPos,
    orientation: {
      direction: zoneFocusScratch.savedDir,
      up: zoneFocusScratch.savedUp,
    },
  });
  camera.lookAtTransform(Cesium.Matrix4.IDENTITY);

  await flyCameraLinear(viewer, pose, TV_INSPECTION_SCAN_CAMERA_FLY_SEC);
}

function setInspectionRadialStaticPositions(circleRecord) {
  if (!circleRecord?.radialEntity?.polyline) return;
  circleRecord.radialEntity.polyline.positions = buildRadialLinePositions(
    circleRecord.longitude,
    circleRecord.latitude,
    circleRecord.radiusMeters,
    circleRecord.height,
    circleRecord.variant,
  );
}

function setInspectionRadialScanningProperty(circleRecord) {
  if (!circleRecord?.radialEntity?.polyline) return;
  const circleId = circleRecord.id;
  circleRecord.radialEntity.polyline.positions = new Cesium.CallbackProperty(() => {
    const scan = tvInspectionScanActive;
    if (!scan || scan.circleId !== circleId) {
      return buildRadialLinePositions(
        circleRecord.longitude,
        circleRecord.latitude,
        circleRecord.radiusMeters,
        circleRecord.height,
        circleRecord.variant,
      );
    }

    const angle = scan.baseAngleRad + scan.progress * Math.PI * 2;
    return buildRadialLinePositionsAtAngle(
      circleRecord.longitude,
      circleRecord.latitude,
      circleRecord.radiusMeters,
      circleRecord.height,
      angle,
    );
  }, false);
}

function showTvInspectionScanPoints(circleRecord) {
  if (!circleRecord) return;

  const defs = tvInspectionScanPointsByCircle[circleRecord.id] ?? [];
  const resultPoints = [];

  for (const def of defs) {
    const world = offsetMetersToLonLat(
      circleRecord.longitude,
      circleRecord.latitude,
      def.offsetEastMeters,
      def.offsetNorthMeters,
    );
    resultPoints.push({
      id: def.id,
      label: def.label,
      labelBgIndex: def.labelBgIndex,
      outerIndex: def.outerIndex,
      iconIndex: def.iconIndex,
      longitude: world.longitude,
      latitude: world.latitude,
    });
  }

  patchTvInspectionScanState({
    active: false,
    progress: 1,
    circleId: circleRecord.id,
    resultPoints,
  });
  viewer?.scene.requestRender();
}

function stopTvInspectionScanAnimation() {
  if (tvInspectionScanPreRenderRemover) {
    tvInspectionScanPreRenderRemover();
    tvInspectionScanPreRenderRemover = null;
  }
}

function finishTvInspectionScan() {
  if (!tvInspectionScanActive) return;

  const circleRecord = tvInspectionCircleById.get(tvInspectionScanActive.circleId);
  stopTvInspectionScanAnimation();
  tvInspectionScanActive = null;

  if (circleRecord) {
    setInspectionRadialStaticPositions(circleRecord);
    showTvInspectionScanPoints(circleRecord);
  } else {
    patchTvInspectionScanState({ active: false, progress: 1 });
  }

  releaseCameraForUserInput(viewer);
  viewer?.scene.requestRender();
}

function ensureTvInspectionScanAnimationLoop() {
  if (!viewer || tvInspectionScanPreRenderRemover) return;

  tvInspectionScanPreRenderRemover = viewer.scene.preRender.addEventListener(() => {
    if (!tvInspectionScanActive) return;

    const elapsed = performance.now() - tvInspectionScanActive.startedAt;
    const progress = Math.min(Math.max(elapsed / TV_INSPECTION_SCAN_DURATION_MS, 0), 1);
    tvInspectionScanActive.progress = progress;

    if (Math.abs(progress - tvInspectionLastPublishedScanProgress) >= 0.02 || progress >= 1) {
      tvInspectionLastPublishedScanProgress = progress;
      patchTvInspectionScanState({
        active: true,
        progress,
        circleId: tvInspectionScanActive.circleId,
        resultPoints: [],
      });
    }

    if (progress >= 1) {
      finishTvInspectionScan();
    }
  });
}

async function runTvInspectionScan(circleId) {
  const circleRecord = tvInspectionCircleById.get(circleId);
  if (!viewer || !circleRecord) return;
  if (tvInspectionScanActive?.circleId === circleId) return;

  resetTvInspectionScan();
  tvInspectionHoveredCircleId = null;
  applyTvInspectionHoverVisuals();
  patchTvInspectionScanState({
    active: true,
    progress: 0,
    circleId,
    resultPoints: [],
  });

  const baseAngleRad =
    TV_INSPECTION_RADIAL_ANGLES[circleRecord.variant] ?? TV_INSPECTION_RADIAL_ANGLES[0];
  tvInspectionScanActive = {
    circleId,
    startedAt: performance.now(),
    progress: 0,
    baseAngleRad,
  };
  tvInspectionLastPublishedScanProgress = -1;

  setInspectionRadialScanningProperty(circleRecord);
  ensureTvInspectionScanAnimationLoop();

  const controller = viewer.scene.screenSpaceCameraController;
  controller.enableInputs = false;

  await flyToInspectionCircleTopDown(circleRecord);
  if (tvInspectionScanActive && viewer) {
    viewer.scene.screenSpaceCameraController.enableInputs = false;
  }
  viewer?.scene.requestRender();
}

function resetTvInspectionScan() {
  stopTvInspectionScanAnimation();

  if (tvInspectionScanActive) {
    const circleRecord = tvInspectionCircleById.get(tvInspectionScanActive.circleId);
    if (circleRecord) {
      setInspectionRadialStaticPositions(circleRecord);
    }
  }

  tvInspectionScanActive = null;
  resetTvInspectionScanState();
  releaseCameraForUserInput(viewer);
  viewer?.scene.requestRender();
}

function applyTvInspectionClick(windowPosition) {
  if (!viewer || props.mapMode !== 'tv' || tvInspectionScanActive) return;

  const picked = viewer.scene.pick(windowPosition);
  const entityId = picked?.id?.id ?? picked?.id;
  let circleId = resolveTvInspectionCircleIdFromEntityId(entityId);

  if (!circleId) {
    const lonLat = pickSurfaceLonLat(windowPosition);
    if (lonLat) {
      for (const [id, circle] of tvInspectionCircleById) {
        if (isPointInsideInspectionCircle(lonLat.longitude, lonLat.latitude, circle)) {
          circleId = id;
          break;
        }
      }
    }
  }

  if (!circleId) return;

  void runTvInspectionScan(circleId);
}

function setupTvInspectionInteraction() {
  destroyTvInspectionInteraction();
  if (!viewer || props.mapMode !== 'tv' || tvInspectionCircleById.size === 0) return;

  tvInspectionInteractionHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

  tvInspectionInteractionHandler.setInputAction((click) => {
    applyTvInspectionClick(click.position);
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  tvInspectionInteractionHandler.setInputAction((movement) => {
    if (tvInspectionScanActive) {
      viewer.canvas.style.cursor = 'progress';
      return;
    }
    tvInspectionHoverPendingPosition = movement.endPosition;
    if (tvInspectionHoverRafPending) return;
    tvInspectionHoverRafPending = true;
    requestAnimationFrame(() => {
      tvInspectionHoverRafPending = false;
      if (tvInspectionHoverPendingPosition) {
        reconcileTvInspectionHover(tvInspectionHoverPendingPosition);
      }
    });
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
}

function pickSurfaceLonLat(windowPosition) {
  if (!viewer?.scene) return null;

  let cartesian = viewer.scene.pickPosition(windowPosition);
  if (!cartesian) {
    const ray = viewer.camera.getPickRay(windowPosition);
    if (!ray) return null;
    cartesian =
      viewer.scene.globe.pick(ray, viewer.scene) ??
      viewer.camera.pickEllipsoid(windowPosition, viewer.scene.globe.ellipsoid);
  }
  if (!cartesian) return null;

  const carto = Cesium.Cartographic.fromCartesian(cartesian);
  return {
    longitude: Cesium.Math.toDegrees(carto.longitude),
    latitude: Cesium.Math.toDegrees(carto.latitude),
  };
}

function isPointInsideInspectionCircle(lon, lat, circle) {
  if (!circle) return false;
  const distance = metersBetweenLatLon(circle.latitude, circle.longitude, lat, lon);
  return distance <= circle.radiusMeters;
}

function reconcileTvInspectionHover(windowPosition) {
  if (!viewer || props.mapMode !== 'tv' || tvInspectionScanActive) {
    if (tvInspectionHoveredCircleId != null) {
      tvInspectionHoveredCircleId = null;
      applyTvInspectionHoverVisuals();
    }
    return;
  }

  let hoveredId = null;
  const picked = viewer.scene.pick(windowPosition);
  const entityId = picked?.id?.id ?? picked?.id;
  hoveredId = resolveTvInspectionCircleIdFromEntityId(entityId);

  if (!hoveredId) {
    const lonLat = pickSurfaceLonLat(windowPosition);
    if (lonLat) {
      for (const [id, circle] of tvInspectionCircleById) {
        if (isPointInsideInspectionCircle(lonLat.longitude, lonLat.latitude, circle)) {
          hoveredId = id;
          break;
        }
      }
    }
  }

  if (hoveredId !== tvInspectionHoveredCircleId) {
    tvInspectionHoveredCircleId = hoveredId;
    applyTvInspectionHoverVisuals();
  }

  viewer.canvas.style.cursor = hoveredId ? 'pointer' : 'default';
}

function applyTvInspectionHoverVisuals() {
  if (!viewer) return;

  for (const [id, record] of tvInspectionCircleById) {
    const hovered = id === tvInspectionHoveredCircleId && !tvInspectionScanActive;

    if (record.fillEntity) {
      record.fillEntity.show = hovered;
    }
  }

  viewer.scene.requestRender();
}

function createTvInspectionLineColor() {
  return Cesium.Color.fromCssColorString(TV_INSPECTION_CIRCLE_COLOR).withAlpha(1);
}

function createTvInspectionDashMaterial() {
  return new Cesium.PolylineDashMaterialProperty({
    color: createTvInspectionLineColor(),
    dashLength: 16,
  });
}

function createTvInspectionGlowMaterial() {
  return new Cesium.PolylineGlowMaterialProperty({
    glowPower: 0.18,
    taperPower: 1,
    color: createTvInspectionLineColor(),
  });
}

function createTvInspectionSolidMaterial() {
  return new Cesium.ColorMaterialProperty(createTvInspectionLineColor());
}

function clearEvacuationRoute() {
  if (!viewer) return;
  if (evacuationRouteDataSource) {
    try {
      viewer.dataSources.remove(evacuationRouteDataSource, true);
    } catch {
      // ignore
    }
    evacuationRouteDataSource = null;
  }
  viewer.scene.requestRender();
}

function showEvacuationRoute(route) {
  if (!viewer) return;
  const lines = route?.lines?.length ? route.lines : null;
  const positions = route?.positions ?? [];
  if ((!lines || lines.length === 0) && !positions.length) {
    clearEvacuationRoute();
    return;
  }

  clearEvacuationRoute();

  evacuationRouteDataSource = new Cesium.CustomDataSource('evacuation-route');
  viewer.dataSources.add(evacuationRouteDataSource);

  const glowColor = Cesium.Color.fromCssColorString('#ffd54a').withAlpha(0.55);

  const addLine = (id, pts) => {
    const cartesianPositions = pts.map((p) =>
      Cesium.Cartesian3.fromDegrees(p.longitude, p.latitude),
    );
    evacuationRouteDataSource.entities.add({
      id: `${id}-base`,
      polyline: {
        positions: cartesianPositions,
        width: 18,
        clampToGround: true,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        material: new Cesium.PolylineGlowMaterialProperty({
          glowPower: 0.18,
          taperPower: 0.8,
          color: glowColor,
        }),
      },
    });
    evacuationRouteDataSource.entities.add({
      id: `${id}-flow`,
      polyline: {
        positions: cartesianPositions,
        width: 10,
        clampToGround: true,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        material: createEvacuationRouteFlowMaterial({
          color: Cesium.Color.fromCssColorString('#ffd54a').withAlpha(0.95),
          speed: 0.9,
          repeat: 18.0,
        }),
      },
    });
    return cartesianPositions;
  };

  let focusPositions = null;
  if (lines) {
    for (const line of lines) {
      const pts = line?.positions ?? [];
      if (pts.length < 2) continue;
      const cartesian = addLine(`evac-line-${line.id}`, pts);
      if (!focusPositions) focusPositions = cartesian;
    }
  } else {
    focusPositions = addLine(EVACUATION_ROUTE_ENTITY_IDS.base, positions);
  }

  if (route?.focus) {
    try {
      const sphere = Cesium.BoundingSphere.fromPoints(focusPositions ?? []);
      viewer.camera.flyToBoundingSphere(sphere, {
        duration: 1.05,
        offset: new Cesium.HeadingPitchRange(
          viewer.camera.heading,
          Cesium.Math.toRadians(-35),
          sphere.radius * 2.4,
        ),
      });
    } catch {
      // ignore
    }
  }

  viewer.scene.requestRender();
}

function clearEvacuationPeople() {
  // 疏散人员撒点已由 DOM 覆盖层（AccidentRescueMarkersOverlay）渲染，此处无需清理实体
}

function focusEvacuationPerson(person) {
  if (!viewer || !person) return;
  void flyToMapPointOverview(person.longitude, person.latitude, person.height, {
    duration: 0.85,
  });
}

function showEvacuationPeople(_payload) {
  // 疏散人员撒点已由 DOM 覆盖层（AccidentRescueMarkersOverlay）渲染，此函数保留仅为兼容
}

function clearMonitoringPoints() {
  // 监测点位撒点已由 DOM 覆盖层（AccidentRescueMarkersOverlay）渲染，此处无需清理实体
}

function focusMonitoringPoint(point) {
  if (!viewer || !point) return;
  void flyToMapPointOverview(point.longitude, point.latitude, point.height, {
    duration: 0.85,
  });
}

function showMonitoringPoints(_payload) {
  // 监测点位撒点已由 DOM 覆盖层（AccidentRescueMarkersOverlay）渲染，此函数保留仅为兼容
}

/** 监测场景仅保留目标装置区虚线周界，隐藏总览遮罩与其他装置区色块。 */
function setMonitoringFocusArea(enable, target = null) {
  if (!viewer) return;

  if (!monitoringFocusDataSource) {
    monitoringFocusDataSource = new Cesium.CustomDataSource('monitoring-focus-boundary');
    viewer.dataSources.add(monitoringFocusDataSource);
  }
  monitoringFocusDataSource.entities.removeAll();

  for (const state of plantHoverStates.values()) {
    if (state.flatSurfaceEntity)
      state.flatSurfaceEntity.show = !enable && isAccidentRescueFlatActive();
  }
  for (const id of Object.values(ACCIDENT_RESCUE_FLAT_ENTITY_IDS)) {
    const entity = overviewBoundaryDataSource?.entities?.getById(id);
    if (entity) entity.show = !enable;
  }

  if (!enable || !target) {
    monitoringFocusDataSource.show = false;
    viewer.scene.requestRender();
    return;
  }

  const targetPosition = Cesium.Cartesian3.fromDegrees(target.longitude, target.latitude);
  let focusedState = null;
  let nearestDistance = Number.POSITIVE_INFINITY;
  for (const state of plantHoverStates.values()) {
    if (!state.openRing?.length) continue;
    const center = Cesium.BoundingSphere.fromPoints(state.openRing).center;
    const distance = Cesium.Cartesian3.distance(center, targetPosition);
    if (distance < nearestDistance) {
      focusedState = state;
      nearestDistance = distance;
    }
  }
  if (!focusedState?.cartographics?.length) return;

  const positions = focusedState.cartographics.map((carto) =>
    Cesium.Cartesian3.fromRadians(carto.longitude, carto.latitude, (carto.height ?? 0) + 3),
  );
  positions.push(Cesium.Cartesian3.clone(positions[0]));
  monitoringFocusDataSource.entities.add({
    id: 'monitoring-focus-boundary-base',
    polyline: {
      positions,
      width: 7,
      material: Cesium.Color.fromCssColorString('#001a2c').withAlpha(0.82),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
  });
  monitoringFocusDataSource.entities.add({
    id: 'monitoring-focus-boundary-dash',
    polyline: {
      positions,
      width: 3,
      material: new Cesium.PolylineDashMaterialProperty({
        color: Cesium.Color.fromCssColorString('#27d5ff').withAlpha(0.98),
        dashLength: 18,
      }),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
  });
  monitoringFocusDataSource.show = true;
  viewer.scene.requestRender();
}

/** 保持当前缩放/俯仰，仅平移到目标世界坐标（无 flyTo 上抛弧线） */
async function panCameraToWorldPosition(longitude, latitude, height, durationSec = 0.75) {
  if (!viewer) return;

  cancelZoneFocusFly();
  viewer.camera.cancelFlight();

  const surfaceHeight = height ?? getBoundaryModelTopHeight() ?? 72.05;
  const toCenter = Cesium.Cartesian3.fromDegrees(longitude, latitude, surfaceHeight);
  const fromCenter = pickCameraCenterOnGlobe(viewer);
  if (!fromCenter) return;

  const pose = computeZoneSwitchPanPose(viewer, fromCenter, toCenter, props.focusRightInsetPx ?? 0);
  await flyCameraLinear(viewer, pose, durationSec);
  releaseCameraForUserInput(viewer);
  viewer.scene.requestRender();
}

/** 厂区级单点聚焦：目标落在左右面板之间的可视地图正中央。 */
async function flyToMapPointOverview(longitude, latitude, height, options = {}) {
  if (!viewer) return;

  const surfaceHeight = height ?? getBoundaryModelTopHeight() ?? 72.05;
  const target = Cesium.Cartesian3.fromDegrees(longitude, latitude, surfaceHeight);
  const pitchDeg = Number.isFinite(options.pitchDeg) ? options.pitchDeg : MAOMING_PETRO.pitch;
  const duration = Number.isFinite(options.duration) ? Math.max(0.3, options.duration) : 1.05;
  const pose = computeZoneFocusCameraPose(
    viewer,
    target,
    MAP_POINT_OVERVIEW_FOCUS_RANGE,
    props.focusRightInsetPx ?? 0,
    { pitchDeg },
  );

  viewer.trackedEntity = undefined;
  await flyCameraToPose(pose, duration);
}

function flyToWorldPositions(payload) {
  if (!viewer) return;
  const pts = payload?.positions ?? [];
  if (!Array.isArray(pts) || pts.length < 1) return;
  const duration = Number.isFinite(payload?.duration) ? Math.max(0.3, payload.duration) : 1.05;
  const pitchDeg = Number.isFinite(payload?.pitchDeg) ? payload.pitchDeg : -40;
  const rangeMultiplier = Number.isFinite(payload?.rangeMultiplier)
    ? Math.max(0.6, payload.rangeMultiplier)
    : 2.4;

  if (pts.length === 1 && payload?.panOnly) {
    const p = pts[0];
    void panCameraToWorldPosition(p.longitude, p.latitude, p.height, duration);
    return;
  }

  if (pts.length === 1) {
    const p = pts[0];
    void flyToMapPointOverview(p.longitude, p.latitude, p.height, {
      duration,
      pitchDeg,
    });
    return;
  }

  const cartesian = pts.map((p) =>
    Cesium.Cartesian3.fromDegrees(p.longitude, p.latitude, p.height ?? 0),
  );
  const sphere = Cesium.BoundingSphere.fromPoints(cartesian);
  if (!Number.isFinite(sphere.radius) || sphere.radius <= 0) return;
  viewer.camera.flyToBoundingSphere(sphere, {
    duration,
    offset: new Cesium.HeadingPitchRange(
      viewer.camera.heading,
      Cesium.Math.toRadians(pitchDeg),
      sphere.radius * rangeMultiplier,
    ),
    complete: () => {
      enableCameraUserInputs(viewer);
    },
    cancel: () => {
      enableCameraUserInputs(viewer);
    },
  });
  enableCameraUserInputs(viewer);
  viewer.scene.requestRender();
}

function ensureUserInputsEnabled() {
  if (!viewer) return;
  releaseCameraForUserInput(viewer);
  enableCameraUserInputs(viewer);
  viewer.scene.requestRender();
}

function destroyTvInspectionInteraction() {
  if (tvInspectionInteractionHandler) {
    tvInspectionInteractionHandler.destroy();
    tvInspectionInteractionHandler = null;
  }
  if (viewer?.canvas) {
    viewer.canvas.style.cursor = 'default';
  }
  tvInspectionHoveredCircleId = null;
}

function tvInspectionCirclesSignature(circles) {
  if (!Array.isArray(circles)) return '';
  return circles
    .map(
      (circle) =>
        `${circle?.id}:${circle?.longitude}:${circle?.latitude}:${circle?.radiusMeters}:${circle?.height}`,
    )
    .join('|');
}

function clearTvInspectionCircles() {
  if (!viewer) return;
  lastTvInspectionCirclesSignature = '';
  resetTvInspectionScan();
  destroyTvInspectionInteraction();
  tvInspectionCircleById.clear();
  tvInspectionHoveredCircleId = null;
  for (const entity of tvInspectionCircleEntities) {
    viewer.entities.remove(entity);
  }
  tvInspectionCircleEntities = [];
  viewer.scene.requestRender();
}

function setTvInspectionCircles(circles) {
  const signature = tvInspectionCirclesSignature(circles);
  if (
    signature &&
    signature === lastTvInspectionCirclesSignature &&
    tvInspectionCircleById.size > 0
  ) {
    return;
  }

  clearTvInspectionCircles();
  if (!viewer || !Array.isArray(circles) || circles.length === 0) return;

  lastTvInspectionCirclesSignature = signature;
  const defaultHeight = getBoundaryModelTopHeight();

  for (const circle of circles) {
    const radiusMeters = Math.max(12, Number(circle?.radiusMeters ?? 332));
    const longitude = Number(circle?.longitude);
    const latitude = Number(circle?.latitude);
    if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) continue;

    const height = Number.isFinite(circle?.height) ? Number(circle.height) : defaultHeight;
    const variant = Number(circle?.variant ?? 0);
    const circleId = String(circle?.id ?? `circle-${tvInspectionCircleEntities.length}`);
    const ringPositions = buildElevatedCirclePositions(longitude, latitude, radiusMeters, height);

    const fillEntity = viewer.entities.add({
      id: `tv-inspection-fill-${circleId}`,
      show: false,
      polygon: {
        hierarchy: new Cesium.PolygonHierarchy(ringPositions.slice(0, -1)),
        material: Cesium.Color.fromCssColorString(TV_INSPECTION_CIRCLE_COLOR).withAlpha(
          TV_INSPECTION_CIRCLE_FILL_ALPHA,
        ),
        perPositionHeight: true,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
    });
    tvInspectionCircleEntities.push(fillEntity);

    const circleEntity = viewer.entities.add({
      id: `tv-inspection-circle-${circleId}`,
      polyline: {
        positions: ringPositions,
        width: TV_INSPECTION_CIRCLE_LINE_WIDTH,
        material: createTvInspectionDashMaterial(),
        depthFailMaterial: createTvInspectionGlowMaterial(),
        ...TV_INSPECTION_LINE_COMMON,
        arcType: Cesium.ArcType.GEODESIC,
      },
    });
    tvInspectionCircleEntities.push(circleEntity);

    const radialEntity = viewer.entities.add({
      id: `tv-inspection-radial-${circleId}`,
      polyline: {
        positions: buildRadialLinePositions(longitude, latitude, radiusMeters, height, variant),
        width: TV_INSPECTION_RADIAL_LINE_WIDTH,
        material: createTvInspectionSolidMaterial(),
        depthFailMaterial: createTvInspectionGlowMaterial(),
        ...TV_INSPECTION_LINE_COMMON,
        arcType: Cesium.ArcType.NONE,
      },
    });
    tvInspectionCircleEntities.push(radialEntity);

    const centerEntity = viewer.entities.add({
      id: `tv-inspection-center-${circleId}`,
      position: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
      point: {
        pixelSize: TV_INSPECTION_CENTER_POINT_SIZE,
        color: createTvInspectionLineColor(),
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
    });
    tvInspectionCircleEntities.push(centerEntity);

    tvInspectionCircleById.set(circleId, {
      id: circleId,
      longitude,
      latitude,
      radiusMeters,
      height,
      variant,
      fillEntity,
      circleEntity,
      radialEntity,
      centerEntity,
    });
  }

  setupTvInspectionInteraction();
  viewer.scene.requestRender();
}

function factoryAreaTheme(code, selected) {
  const colors = { chemical: '#15d7a8', port: '#42a5ff' };
  const base = Cesium.Color.fromCssColorString(colors[code] ?? '#00eeff');
  return {
    outline: base.withAlpha(selected ? 1 : 0.68),
    fill: base.withAlpha(selected ? 0.22 : 0.09),
    width: selected ? 4 : 2,
  };
}

/** 绘制公开资料与卫星影像勾画的化工区、港区演示边界。 */
function ensureFactoryAreaBoundaries() {
  if (!viewer || factoryAreaEntityIds.length) return;

  for (const code of ['chemical', 'port']) {
    const rings = plantAreaBoundaryRings[code] ?? [];
    rings.forEach((ring, ringIndex) => {
      const positions = ring.map(([longitude, latitude]) =>
        Cesium.Cartesian3.fromDegrees(longitude, latitude, 5),
      );
      const id = `factory-area-${code}-${ringIndex}`;
      const theme = factoryAreaTheme(code, false);
      viewer.entities.add({
        id,
        properties: { factoryAreaCode: code },
        polygon: {
          hierarchy: positions,
          material: theme.fill,
          outline: false,
          height: 5,
        },
        polyline: {
          positions,
          width: theme.width,
          material: theme.outline,
          clampToGround: true,
        },
      });
      factoryAreaEntityIds.push(id);
    });
  }

  const labelPoints = [
    {
      id: 'factory-area-label-chemical',
      text: '茂名石化 · 化工区',
      longitude: 110.9646,
      latitude: 21.5779,
      code: 'chemical',
    },
    {
      id: 'factory-area-label-port-water',
      text: '茂名石化 · 水东港区',
      longitude: 111.083,
      latitude: 21.474,
      code: 'port',
    },
    {
      id: 'factory-area-label-port-bohe',
      text: '茂名石化 · 博贺新港区',
      longitude: 111.302,
      latitude: 21.421,
      code: 'port',
    },
  ];
  labelPoints.forEach((item) => {
    viewer.entities.add({
      id: item.id,
      properties: { factoryAreaCode: item.code },
      position: Cesium.Cartesian3.fromDegrees(item.longitude, item.latitude, 18),
      label: {
        text: item.text,
        font: '600 15px Microsoft YaHei, sans-serif',
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.fromCssColorString('#00182e'),
        outlineWidth: 4,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        showBackground: true,
        backgroundColor: Cesium.Color.fromCssColorString('#032746').withAlpha(0.86),
        backgroundPadding: new Cesium.Cartesian2(10, 6),
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -10),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
    });
    factoryAreaEntityIds.push(item.id);
  });
}

function updateFactoryAreaBoundaryStyle(code) {
  if (!viewer) return;
  for (const id of factoryAreaEntityIds) {
    const entity = viewer.entities.getById(id);
    if (!entity) continue;
    const entityCode = entity.properties?.factoryAreaCode?.getValue?.(Cesium.JulianDate.now());
    const selected = code === 'all' || code === entityCode;
    entity.show = selected;
    if (entity.polygon) entity.polygon.material = factoryAreaTheme(entityCode, selected).fill;
    if (entity.polyline) {
      const theme = factoryAreaTheme(entityCode, selected);
      entity.polyline.material = theme.outline;
      entity.polyline.width = theme.width;
    }
  }
}

async function setPlantAreaSelection(code, options = {}) {
  if (!viewer) return;
  ensureFactoryAreaBoundaries();
  activeFactoryAreaCode = plantAreaDefinitions.some((item) => item.code === code) ? code : 'all';
  updateFactoryAreaBoundaryStyle(activeFactoryAreaCode);

  if (options.fly !== false) {
    const rings =
      activeFactoryAreaCode === 'all'
        ? Object.values(plantAreaBoundaryRings).flat()
        : plantAreaBoundaryRings[activeFactoryAreaCode];
    const positions = (rings ?? []).flatMap((ring) =>
      ring.map(([longitude, latitude]) => ({
        longitude,
        latitude,
        height: 0,
      })),
    );
    flyToWorldPositions({
      positions,
      duration: 1.35,
      pitchDeg: activeFactoryAreaCode === 'all' ? -72 : -48,
      rangeMultiplier:
        activeFactoryAreaCode === 'all' ? 3.2 : activeFactoryAreaCode === 'port' ? 4.5 : 1.72,
    });
  }
  viewer.scene.requestRender();
}

defineExpose({
  plantWireframeEnabled,
  applyPlantWireframeEnabled,
  setPlantZoneTagsVisible,
  clearPlantZoneSelection,
  addRenderListener,
  worldToScreen,
  getMarkerUiScale,
  relayWheelEvent,
  pauseRendering,
  resumeRendering,
  restoreModuleDefaultView,
  flyToModuleOverview,
  waitForIdle,
  toggleAccidentRescueDisplayMode,
  flyToAccidentRescueIncident,
  getPlantZoneKeys,
  findZoneKeyByCode,
  getPlantZoneWorldPosition,
  getBoundaryModelCenter,
  getBoundaryEdgePositions,
  getBoundaryModelTopHeight,
  getAccidentRescueOverlayHeight,
  getTvInspectionCircles,
  setTvInspectionCircles,
  applyTvInspectionCircles,
  clearTvInspectionCircles,
  resetTvInspectionScan,
  flyToPlantZonePan,
  beginAiDiagnosisScan,
  endAiDiagnosisScan,
  showAiScanResultZoneTag,
  showEvacuationRoute,
  clearEvacuationRoute,
  showEvacuationPeople,
  clearEvacuationPeople,
  focusEvacuationPerson,
  showMonitoringPoints,
  clearMonitoringPoints,
  focusMonitoringPoint,
  setMonitoringFocusArea,
  flyToWorldPositions,
  setPlantAreaSelection,
  ensureUserInputsEnabled,
});

async function waitForContainerSize(el, timeoutMs = 5000) {
  const start = performance.now();
  while (performance.now() - start < timeoutMs) {
    if (el?.clientWidth > 0 && el?.clientHeight > 0) return true;
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }
  return Boolean(el?.clientWidth > 0 && el?.clientHeight > 0);
}

onMounted(async () => {
  const token = import.meta.env.VITE_CESIUM_ION_TOKEN;
  if (!token) {
    loadError.value =
      '未配置 VITE_CESIUM_ION_TOKEN，请在项目根目录 .env.local 中设置 Cesium Ion 令牌。';
    return;
  }

  Cesium.Ion.defaultAccessToken = token;

  // 装置区信息牌文案异步预取（不阻塞 3D 初始化；未就绪时由各绘制入口的空态守卫跳过）
  loadPlantZoneSignPresets();

  try {
    const sized = await waitForContainerSize(containerEl.value);
    if (!sized) {
      loadError.value = '地图容器尺寸无效，请刷新页面后重试。';
      return;
    }

    const hiddenCreditHost = document.createElement('div');
    hiddenCreditHost.style.display = 'none';

    viewer = new Cesium.Viewer(containerEl.value, {
      // 性能优化：静止时不每帧渲染，仅在场景变化或显式 requestRender() 时重绘。
      // 组件既有相机/resize/动画更新点均已各自 requestRender()，理论兼容；
      // 但 6500 行组件对 preRender 监听依赖重，需真机验证，若有回归回退本行。
      requestRenderMode: true,
      animation: false,
      timeline: false,
      fullscreenButton: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      baseLayerPicker: false,
      baseLayer: new Cesium.ImageryLayer(
        new Cesium.UrlTemplateImageryProvider({
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          credit: 'Esri World Imagery',
        }),
      ),
      navigationHelpButton: false,
      navigationInstructionsInitiallyVisible: false,
      infoBox: false,
      selectionIndicator: false,
      vrButton: false,
      creditContainer: hiddenCreditHost,
      terrain: await Cesium.Terrain.fromWorldTerrain(),
    });

    disableCesiumDefaultUi(viewer);

    viewer.scene.globe.depthTestAgainstTerrain = false;
    if (viewer.scene.globe.enableLighting !== undefined) {
      viewer.scene.globe.enableLighting = false;
    }
    applyTechSceneStyle(viewer);
    await applyBaseImageryStyle(viewer);

    const { longitude, latitude } = MAOMING_PETRO;

    viewer.entities.add({
      id: 'site-center',
      name: '茂名石化',
      position: Cesium.Cartesian3.fromDegrees(longitude, latitude, MAP_THEME.capHeight + 8),
      point: {
        pixelSize: 8,
        color: Cesium.Color.fromCssColorString('#78dcff'),
        outlineColor: Cesium.Color.fromCssColorString('#143c64'),
        outlineWidth: 1,
      },
      label: {
        text: '茂名石化',
        font: '12px Microsoft YaHei, sans-serif',
        fillColor: Cesium.Color.fromCssColorString('#c8ebff'),
        outlineColor: Cesium.Color.fromCssColorString('#0a1e3c'),
        outlineWidth: 2,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -14),
      },
    });

    const boundaryDs = await loadGeoJsonLayer(viewer, boundaryUrl, {
      stroke: Cesium.Color.TRANSPARENT,
      fill: Cesium.Color.TRANSPARENT,
      strokeWidth: 1,
    });
    const boundaryRing = getFirstBoundaryRing(boundaryDs);
    const boundaryLonLatRing = boundaryRing ? boundaryRingToLonLat(boundaryRing) : null;

    const plantDs = await loadGeoJsonLayer(viewer, plantAreaUrl, {
      stroke: Cesium.Color.TRANSPARENT,
      fill: Cesium.Color.TRANSPARENT,
      strokeWidth: 1,
    });
    overviewPlantDataSource = plantDs;

    const cameraOffset = new Cesium.HeadingPitchRange(
      Cesium.Math.toRadians(MAOMING_PETRO.heading),
      Cesium.Math.toRadians(MAOMING_PETRO.pitch),
      MAOMING_PETRO.cameraRange,
    );

    overviewBoundaryDataSource = boundaryDs;
    overviewBoundaryLonLatRing = boundaryLonLatRing;
    overviewCameraOffset = cameraOffset;

    if (props.mapMode === 'tv') {
      tryApplyTvInspectionCircles();
    }

    await stylePlantEntities(viewer, plantDs, 'plant');
    setupPlantHoverInteraction(viewer);
    await styleBoundaryEntities(viewer, boundaryDs, 'boundary', boundaryLonLatRing);

    if (props.mapMode === 'accident-rescue') {
      await applyAccidentRescueDisplayMode(false, { instantCamera: true });
    } else {
      await flyToBoundaryModel(viewer, boundaryDs, cameraOffset);
      captureOverviewCameraPose(viewer);
    }
    if (getMapModeConfig().showPlantZoneTags) {
      initPlantBillboardMarkers(viewer);
    }
    scheduleDepthOfFieldFocusRefresh(viewer);
    viewer.scene.requestRender();

    // 顶面约 25MB，与相机定位解耦：先飞到厂区，再异步贴顶面纹理
    attachRenderNotifier(viewer);
    attachRenderErrorRecovery(viewer);
    attachResizeObserver();
    lastAppliedMapMode = props.mapMode;
    emit('ready');

    void mountElevatedMapCap(viewer, boundaryLonLatRing).then(() => {
      viewer?.scene.requestRender();
    });
  } catch (err) {
    console.error(err);
    loadError.value = `地图初始化失败：${err?.message || err}`;
    if (viewer) {
      const cameraOffset = new Cesium.HeadingPitchRange(
        Cesium.Math.toRadians(MAOMING_PETRO.heading),
        Cesium.Math.toRadians(MAOMING_PETRO.pitch),
        MAOMING_PETRO.cameraRange,
      );
      flyToMaoming(viewer, MAOMING_PETRO, cameraOffset);
      viewer.scene.requestRender();
    }
  }
});

onUnmounted(() => {
  resizeObserver?.disconnect();
  resizeObserver = null;
  if (renderErrorRemover) {
    renderErrorRemover();
    renderErrorRemover = null;
  }
  if (postRenderNotifyRemover) {
    postRenderNotifyRemover();
    postRenderNotifyRemover = null;
  }
  destroyPlantFlatSurfaceEntities();
  renderListeners.clear();
  cancelZoneFocusFly();
  destroyPlantHoverInteraction(viewer);
  destroyTvInspectionInteraction();
  resetTvInspectionScan();
  destroyPlantBillboardMarkers(viewer);
  destroyAllPlantBlockGltfs();
  destroyDepthOfField(viewer);
  destroyElevatedCapSurface();
  viewer?.destroy();
  viewer = null;
  lastAppliedMapMode = null;
});

watch(
  () => props.mapMode,
  (mode) => {
    if (mode === 'tv') {
      tryApplyTvInspectionCircles();
    } else {
      clearTvInspectionCircles();
      resetTvInspectionScanState();
    }
    void enqueueMapTask(async () => {
      await applyMapModeConfig();
    });
  },
);
</script>

<style scoped>
.maoming-petro-cesium-map {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #050814;
  font-family: 'Microsoft YaHei', 'Source Han Sans SC', sans-serif;
}

.cesium-container {
  position: relative;
  width: 100%;
  height: 100%;
}

/* 兜底隐藏 Cesium 自带 UI（工具栏、时间轴、版权、选中等） */
.cesium-container :deep(.cesium-viewer-toolbar),
.cesium-container :deep(.cesium-viewer-animationContainer),
.cesium-container :deep(.cesium-viewer-timelineContainer),
.cesium-container :deep(.cesium-viewer-bottom),
.cesium-container :deep(.cesium-viewer-fullscreenContainer),
.cesium-container :deep(.cesium-viewer-vrContainer),
.cesium-container :deep(.cesium-viewer-geocoderContainer),
.cesium-container :deep(.cesium-viewer-infoBoxContainer),
.cesium-container :deep(.cesium-viewer-selectionIndicatorContainer),
.cesium-container :deep(.cesium-widget-credits),
.cesium-container :deep(.cesium-credit-logoContainer),
.cesium-container :deep(.cesium-credit-expand-link) {
  display: none !important;
  visibility: hidden !important;
  pointer-events: none !important;
}

.cesium-status {
  position: absolute;
  left: 50%;
  bottom: 24px;
  transform: translateX(-50%);
  z-index: var(--z-overlay);
  margin: 0;
  padding: 8px 16px;
  border-radius: 6px;
  background: var(--map-status-bg);
  color: var(--map-status-fg);
  font-size: 13px;
}

.cesium-error {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: var(--z-overlay);
  margin: 0;
  padding: 12px 20px;
  border-radius: 6px;
  background: var(--map-error-bg);
  color: var(--map-error-fg);
  font-size: 14px;
  max-width: 80%;
  text-align: center;
}
</style>
