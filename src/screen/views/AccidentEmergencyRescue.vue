<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import {
  setCesiumMapModeOverride,
  flyToSharedAccidentRescueIncident,
  clearAccidentRescueFlyTarget,
} from '../lib/composables/sharedCesiumBridge';
import MapPageShell from '../components/map/MapPageShell.vue';
import AccidentRescueMap from '../components/map/AccidentRescueMap.vue';
import AccidentRescueMarkersOverlay from '../components/map/AccidentRescueMarkersOverlay.vue';
import AccidentRescueHeader from '../components/layout/AccidentRescueHeader.vue';
import EvacuationPeoplePanel from '../components/panels/accident-rescue/EvacuationPeoplePanel.vue';
import MonitoringPointsScenePanel from '../components/panels/accident-rescue/MonitoringPointsScenePanel.vue';
import RescueRouteScenePanel from '../components/panels/accident-rescue/RescueRouteScenePanel.vue';
import IncidentDetailPanel from '../components/panels/accident-rescue/IncidentDetailPanel.vue';
import EmergencyResponseCommandPanel from '../components/panels/accident-rescue/EmergencyResponseCommandPanel.vue';
import EmergencyResourceDispatchPanel from '../components/panels/accident-rescue/EmergencyResourceDispatchPanel.vue';
import EmergencyPlanPanel from '../components/panels/accident-rescue/EmergencyPlanPanel.vue';
import AccidentInfoPanel from '../components/panels/accident-rescue/AccidentInfoPanel.vue';
import PlanPanoramaModule from '../components/panels/accident-rescue/PlanPanoramaModule.vue';
import RescueDutyPanel from '../components/panels/accident-rescue/RescueDutyPanel.vue';
import RescueAuxiliaryPanel from '../components/panels/accident-rescue/RescueAuxiliaryPanel.vue';
import RescueDynamicsPanel from '../components/panels/accident-rescue/RescueDynamicsPanel.vue';
import RescueBottomToolbar from '../components/panels/accident-rescue/RescueBottomToolbar.vue';
import FacilityDetailPanel from '../components/panels/accident-rescue/FacilityDetailPanel.vue';
import CommandActionDetailPanel from '../components/panels/accident-rescue/CommandActionDetailPanel.vue';
import EmergencyAddressBookDialog from '../components/panels/accident-rescue/EmergencyAddressBookDialog.vue';
import SandboxPanel from '../components/panels/accident-rescue/SandboxPanel.vue';
import SandboxMapOverlay from '../components/map/SandboxMapOverlay.vue';
import {
  resolveAccidentRescueIncident,
  eventCommandDetailTabs,
  accidentRescueRouteWaypoints,
} from '../lib/data/accidentRescueMock';
import { resolveDrillRescueIncident } from '../lib/data/drillRescueMock';
import {
  fetchAccidentIncident,
  type AccidentRescuePayload,
  type EmergencyDispatchResource,
} from '@/services/accidentRescue';
import { getSharedMap } from '../lib/composables/sharedCesiumBridge';
import {
  buildEvacuationRouteFromGeoJson,
  extractEvacuationLinesFromGeoJson,
} from '../lib/geo/evacuationRoute';
import { pickPointAlongRoute, type EvacuationPerson } from '../lib/data/evacuationPeopleMock';
import { fetchEvacuationPeople } from '@/services/emergencyEvent';
import {
  fetchMonitoringPoints,
  fetchMonitoringAlarms,
  type MonitoringPoint,
  type MonitoringAlarm,
} from '@/services/hazard';
import { useMapControls } from '../lib/composables/useMapControls';
import { fetchFacilityDetail, type FacilityDetailInfo } from '@/services/hazard';
import { fetchEmergencyCommandDetail, type CommandActionDetail } from '@/services/emergency';
import { facilityDetailOpen, closeFacilityDetail } from '../lib/composables/useFacilityDetail';
import {
  commandDrawerVisible,
  selectedCommandActionId,
  closeCommandActionDetail,
} from '../lib/composables/useCommandActionDetail';
import { useSandboxScene } from '../lib/composables/useSandboxScene';
import { useShellRoute } from '../lib/composables/useShellRoute';
import { prepareEventVideoWall } from '../components/video-wall/videoWallStore';
import '../styles/accidentRescueScroll.css';

const router = useRouter();
const sandbox = useSandboxScene();
const shellRoute = useShellRoute();

// wujie 沙箱内 vue-router 仅余 catch-all，比较应基于主壳下传的源项目语义名
// （fm-drill → drillEmergencyDetail / fm-fire-rescue → fireAccidentRescue / fm-typhoon → typhoonEmergencyDetail）。
const isDrillMode = computed(() => shellRoute.name.value === 'drillEmergencyDetail');
const pageTheme = computed(() => (isDrillMode.value ? 'drill' : 'event'));
const panelTheme = computed(() => (isDrillMode.value ? 'drill' : 'accident'));
const actionKind = computed(() => (isDrillMode.value ? 'drill' : 'event'));

// 事件聚合：演练模式（仿真，by-design 本地）走本地 drill 解析；事件模式走真实后端
// /accident/rescue-incident（后端失败/缺数据时 service 暴露式降级为空数据并告警，绝不冒充真实数据）。
// 仅离线演示（显式 VITE_USE_DEV_MOCK=true）才回落本地 fixture；未连后端则显式报错 + 空态。
const isDemo = import.meta.env.VITE_USE_DEV_MOCK === 'true';

const EMPTY_INCIDENT = (): AccidentRescuePayload => ({
  eventId: 0,
  title: '',
  location: '',
  longitude: 0,
  latitude: 0,
  mapStatus: '',
  status: 'pending',
  reported: false,
  facilityName: '',
  detailFields: [],
  dispatchResources: [],
  dutyPersons: [],
  auxiliaryStats: [],
  dynamics: [],
});

const incident = ref<AccidentRescuePayload>(
  isDemo ? (resolveAccidentRescueIncident() as unknown as AccidentRescuePayload) : EMPTY_INCIDENT(),
);

async function loadIncident(): Promise<void> {
  const eid = Number(shellRoute.query.value.eventId) || undefined;
  if (isDrillMode.value) {
    // 演练为仿真内容，by-design 本地解析
    incident.value = resolveDrillRescueIncident(eid) as unknown as AccidentRescuePayload;
    return;
  }
  if (!import.meta.env.VITE_API_BASE) {
    if (isDemo) {
      incident.value = resolveAccidentRescueIncident(eid) as unknown as AccidentRescuePayload;
      return;
    }
    // 未连后端且未开演示：走 service，由其显式报错并返回空态
  }
  incident.value = await fetchAccidentIncident(eid);
}

onMounted(loadIncident);
watch(
  () => [shellRoute.query.value.eventId, isDrillMode.value],
  () => {
    void loadIncident();
  },
);

// 设施详情：生产模式走真实后端 /facilities/detail（services 内 dev 回落 fixture），不再用 mock 解析器
const facilityDetail = ref<FacilityDetailInfo>({} as FacilityDetailInfo);
async function loadFacilityDetail(): Promise<void> {
  facilityDetail.value = await fetchFacilityDetail(incident.value.facilityName);
}

const showFacilityDetail = facilityDetailOpen;
// B4 去 mock：指令详情改由后端服务拉取（原 resolveEmergencyCommandDetail 已删除）；
// selectedCommandActionId 变化时重新加载，未知 id 后端返回空包络归并为 null。
const commandDetail = ref<CommandActionDetail | null>(null);
watch(
  selectedCommandActionId,
  async (id) => {
    if (!id) {
      commandDetail.value = null;
      return;
    }
    commandDetail.value = await fetchEmergencyCommandDetail(id);
  },
  { immediate: true },
);
const responseStarted = ref(false);
const activeLeftTab = ref<'info' | 'response' | 'dispatch'>('info');
const focusedDispatchResource = ref<EmergencyDispatchResource | null>(null);
const responseStartedAt = ref<string | undefined>(undefined);
const { onMapControl } = useMapControls();
const rightToolMenuOpen = ref(false);
const rightQuickActive = ref<'toolbar' | 'layers' | null>(null);
const activeToolItem = ref<string | null>(null);
const addressBookOpen = ref(false);
const sceneMode = ref<'default' | 'evacuation' | 'monitoring' | 'rescueRoute' | 'sandbox'>(
  'default',
);
const leftCollapsed = ref(false);
const rightCollapsed = ref(false);
const dutyPanelCollapsed = ref(false);
const auxiliaryPanelCollapsed = ref(false);
const evacuationStats = ref<{ lengthMeters: number } | null>(null);
const evacuationPeople = ref<EvacuationPerson[]>([]);
const routeStartPoint = ref<{ longitude: number; latitude: number } | null>(null);
const routeEndPoint = ref<{ longitude: number; latitude: number } | null>(null);
const focusedPeopleId = ref<string | null>(null);
const monitoringPoints = ref<MonitoringPoint[]>([]);
const mapMonitoringPoints = computed(() => {
  const abnormal = monitoringPoints.value.filter((point) => point.status !== 'normal');
  const normal = monitoringPoints.value.filter((point) => point.status === 'normal');
  return [...abnormal, ...normal.filter((_, index) => index % 3 === 0)].slice(0, 7);
});
const focusedMonitoringId = ref<string | null>(null);
const monitoringAlarms = ref<MonitoringAlarm[]>([]);
const rescueRouteVehiclePlate = ref('粤PV1527');
const rescueRouteTimeRange = ref('2026-03-22 11:37:29 - 2026-03-22 14:08:14');
const rescueRouteVehicleType = ref('消防救援车');
const rescueRoutePlaying = ref(true);
const rescueRouteSpeed = ref(1);
const rescueRouteProgress = ref(0);

/** 须在 script 中保持 ref 引用，模板对象字面量会解包 ref 导致进度无法回写 */
const rescueRoutePlayback = {
  playing: rescueRoutePlaying,
  speed: rescueRouteSpeed,
  progress: rescueRouteProgress,
};

function setRescueRoutePlaying(value: boolean) {
  rescueRoutePlaying.value = value;
}

function setRescueRouteSpeed(value: number) {
  rescueRouteSpeed.value = value;
}
import evacuationGeoJsonUrl from '../../mapdata/疏散路径.geojson?url';
const rightToolbarSections = [
  {
    title: '应急响应',
    items: ['救援路线', '应急疏散', '融合通讯会议', '通讯设备', '通讯录'],
  },
  {
    title: '态势感知',
    items: ['视频监控墙', '监测点位'],
  },
  {
    title: '研判分析',
    items: ['事故风险分析', '沙盘推演', '救援力量分布'],
  },
] as const;

const displayIncidentStatus = computed<'processing' | 'pending' | 'done'>(() => {
  if (incident.value.status === 'done') return 'done';
  return responseStarted.value ? 'processing' : 'pending';
});

const headerStartedAt = computed(() =>
  responseStarted.value ? responseStartedAt.value : undefined,
);

async function flyToIncident() {
  const { longitude, latitude } = incident.value;
  await flyToSharedAccidentRescueIncident(longitude, latitude);
}

onMounted(() => {
  setCesiumMapModeOverride('accident-rescue');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => void flyToIncident());
  });
});

watch(
  () => incident.value.eventId,
  () => {
    responseStarted.value = false;
    responseStartedAt.value = undefined;
    closeCommandActionDetail();
    void flyToIncident();
  },
);

watch(selectedCommandActionId, (id) => {
  if (id) closeFacilityDetail();
});

watch(activeLeftTab, (tab) => {
  if (tab !== 'dispatch') focusedDispatchResource.value = null;
});

watch(showFacilityDetail, (open) => {
  if (open) {
    closeCommandActionDetail();
    void loadFacilityDetail();
  }
});

onMounted(() => {
  responseStarted.value = false;
  responseStartedAt.value = undefined;
});

function handleStartEmergencyResponse() {
  if (responseStarted.value) return;
  responseStarted.value = true;
  responseStartedAt.value = new Date().toISOString();
}

watch(
  () => shellRoute.query.value.autostart,
  (value) => {
    if (value === '1' && !isDrillMode.value && !responseStarted.value) {
      handleStartEmergencyResponse();
    }
  },
  { immediate: true },
);

function handleToolbarToggle() {
  rightToolMenuOpen.value = !rightToolMenuOpen.value;
  rightQuickActive.value = rightToolMenuOpen.value ? 'toolbar' : null;
}

async function handleLayerQuickClick() {
  rightToolMenuOpen.value = false;
  rightQuickActive.value = rightQuickActive.value === 'layers' ? null : 'layers';
  await onMapControl('layers');
}

function handleBottomToolbarAction(id: string) {
  if (id === 'comm') {
    closeToolMenu();
    addressBookOpen.value = true;
    return;
  }
  if (id === 'points') {
    closeToolMenu();
    void enterMonitoringScene();
  }
}

function handleToolAction(item: string) {
  activeToolItem.value = item;
  if (item === '视频监控墙') {
    closeToolMenu();
    // 携带源项目语义名（drillEmergencyDetail / fireAccidentRescue / typhoonEmergencyDetail）
    // 作为 video wall 返回来源，由 VideoWallView 的 from query 收回后 push 同名回到此页
    const sourceRoute = shellRoute.name.value || 'fireAccidentRescue';
    prepareEventVideoWall({
      eventId: incident.value.eventId,
      eventTitle: incident.value.title,
      kind: 'accident',
      sourceRoute,
    });
    void router.push({
      name: 'tvVideoWall',
      query: {
        from: sourceRoute,
        eventId: String(incident.value.eventId),
        eventType: 'accident',
        eventTitle: incident.value.title,
      },
    });
    return;
  }
  if (item === '通讯录') {
    closeToolMenu();
    addressBookOpen.value = true;
    return;
  }
  if (item === '应急疏散') {
    closeToolMenu();
    void enterEvacuationScene();
    return;
  }
  if (item === '救援路线') {
    closeToolMenu();
    enterRescueRouteScene();
    return;
  }
  if (item === '监测点位') {
    closeToolMenu();
    enterMonitoringScene();
    return;
  }
  if (item === '沙盘推演') {
    closeToolMenu();
    enterSandboxScene();
  }
}

function closeAddressBook() {
  addressBookOpen.value = false;
}

function closeToolMenu() {
  rightToolMenuOpen.value = false;
  rightQuickActive.value = null;
}

async function enterEvacuationScene() {
  sceneMode.value = 'evacuation';
  focusedPeopleId.value = null;
  // 取消尚未执行的事件视角飞行，避免排队任务覆盖疏散路线框选
  clearAccidentRescueFlyTarget();
  setCesiumMapModeOverride('evacuation');
  closeFacilityDetail();
  closeCommandActionDetail();
  try {
    const res = await fetch(evacuationGeoJsonUrl);
    const geo = await res.json();
    const primary = buildEvacuationRouteFromGeoJson(geo);
    const lines = extractEvacuationLinesFromGeoJson(geo);
    evacuationStats.value = { lengthMeters: primary.lengthMeters };
    const pts = primary.positions;
    routeStartPoint.value = pts.length
      ? { longitude: pts[0].longitude, latitude: pts[0].latitude }
      : null;
    routeEndPoint.value = pts.length
      ? { longitude: pts[pts.length - 1].longitude, latitude: pts[pts.length - 1].latitude }
      : null;
    await getSharedMap()?.showEvacuationRoute?.({
      lines: lines.map((l) => ({ id: l.id, positions: l.positions })),
      focus: true,
    });
    const roster = await fetchEvacuationPeople(20);
    evacuationPeople.value = roster.map((person) => {
      const pos = pickPointAlongRoute(primary.positions, person.routeProgress);
      return {
        id: person.id,
        name: person.name,
        org: person.org,
        job: person.job,
        longitude: pos.longitude,
        latitude: pos.latitude,
      } satisfies EvacuationPerson;
    });
    frameWorldPositions(primary.positions, {
      duration: 0.9,
      pitchDeg: -38,
      rangeMultiplier: 2.2,
    });
  } catch {
    evacuationStats.value = { lengthMeters: 0 };
    evacuationPeople.value = [];
    routeStartPoint.value = null;
    routeEndPoint.value = null;
  }
}

function exitEvacuationScene() {
  sceneMode.value = 'default';
  evacuationStats.value = null;
  evacuationPeople.value = [];
  routeStartPoint.value = null;
  routeEndPoint.value = null;
  focusedPeopleId.value = null;
  getSharedMap()?.clearEvacuationRoute?.();
  setCesiumMapModeOverride('accident-rescue');
  void flyToIncident();
}

async function enterMonitoringScene() {
  sceneMode.value = 'monitoring';
  focusedMonitoringId.value = null;
  // 取消尚未执行的事件视角飞行，避免排队任务覆盖监测点框选
  clearAccidentRescueFlyTarget();
  closeFacilityDetail();
  closeCommandActionDetail();
  closeToolMenu();
  monitoringPoints.value = await fetchMonitoringPoints();
  monitoringAlarms.value = await fetchMonitoringAlarms();
  const focusPoints = mapMonitoringPoints.value;
  const focusCenter = focusPoints.reduce(
    (sum, point) => ({
      longitude: sum.longitude + point.longitude / focusPoints.length,
      latitude: sum.latitude + point.latitude / focusPoints.length,
    }),
    { longitude: 0, latitude: 0 },
  );
  getSharedMap()?.setMonitoringFocusArea?.(true, focusCenter);
  frameWorldPositions(
    focusPoints.map((p) => ({
      longitude: p.longitude,
      latitude: p.latitude,
    })),
    {
      duration: 0.9,
      pitchDeg: -48,
      rangeMultiplier: 1.9,
    },
  );
}

/**
 * 将相机框选到指定坐标集合。
 * 立即执行一次保证快速反馈；再等地图任务队列（退出场景后排队的事件视角飞行）
 * 稳定后补一次框选，确保最终视角落在目标范围。
 */
function frameWorldPositions(
  positions: Array<{ longitude: number; latitude: number }>,
  options: { duration?: number; pitchDeg?: number; rangeMultiplier?: number } = {},
) {
  const map = getSharedMap();
  if (!map?.flyToWorldPositions || !positions.length) return;
  const payload = { positions, ...options };
  const fly = () => map.flyToWorldPositions?.(payload);
  fly();
  window.setTimeout(() => {
    void map.waitForIdle?.().then(fly);
    window.setTimeout(() => {
      void map.waitForIdle?.().then(fly);
    }, 900);
  }, 500);
}

function exitMonitoringScene() {
  getSharedMap()?.setMonitoringFocusArea?.(false);
  sceneMode.value = 'default';
  monitoringPoints.value = [];
  focusedMonitoringId.value = null;
  void flyToIncident();
}

function enterRescueRouteScene() {
  sceneMode.value = 'rescueRoute';
  closeFacilityDetail();
  closeCommandActionDetail();
  closeToolMenu();
  rescueRoutePlaying.value = true;
  rescueRouteSpeed.value = 1;
  rescueRouteProgress.value = 0;
  getSharedMap()?.ensureUserInputsEnabled?.();
  requestAnimationFrame(() => {
    void getSharedMap()?.flyToWorldPositions?.({
      positions: accidentRescueRouteWaypoints.points,
      duration: 1.05,
      pitchDeg: -45,
      rangeMultiplier: 2.6,
    });
  });
}

function exitRescueRouteScene() {
  sceneMode.value = 'default';
  void flyToIncident();
}

function enterSandboxScene() {
  sceneMode.value = 'sandbox';
  closeFacilityDetail();
  closeCommandActionDetail();
  sandbox.enterSandbox();
  getSharedMap()?.ensureUserInputsEnabled?.();
}

function exitSandboxScene() {
  sceneMode.value = 'default';
  sandbox.exitSandbox();
  void flyToIncident();
}

async function focusMonitoringPoint(p: MonitoringPoint) {
  focusedMonitoringId.value = p.id;
  await getSharedMap()?.focusMonitoringPoint?.({ longitude: p.longitude, latitude: p.latitude });
}

async function focusPerson(p: EvacuationPerson) {
  focusedPeopleId.value = p.id;
  await getSharedMap()?.focusEvacuationPerson?.({ longitude: p.longitude, latitude: p.latitude });
}

async function focusDispatchResource(resource: EmergencyDispatchResource) {
  focusedDispatchResource.value = resource;
  clearAccidentRescueFlyTarget();
  await getSharedMap()?.flyToWorldPositions?.({
    positions: [{ longitude: resource.longitude, latitude: resource.latitude }],
    duration: 0.9,
    pitchDeg: -48,
    rangeMultiplier: 1.2,
  });
}

onUnmounted(() => {
  setCesiumMapModeOverride(null);
  clearAccidentRescueFlyTarget();
  closeFacilityDetail();
  closeCommandActionDetail();
  getSharedMap()?.clearEvacuationRoute?.();
  getSharedMap()?.setMonitoringFocusArea?.(false);
  sandbox.exitSandbox();
});
</script>

<template>
  <MapPageShell min-width="1920px">
    <template #map>
      <AccidentRescueMap
        v-if="sceneMode === 'default'"
        marker-kind="event"
        :incident-title="incident.title"
        :hazard-source-level="incident.hazardSourceLevel"
        :incident-longitude="incident.longitude"
        :incident-latitude="incident.latitude"
        :fire-location="incident.location"
        :fire-status="incident.mapStatus"
        :incident-status="displayIncidentStatus"
      />

      <AccidentRescueMap
        v-else-if="sceneMode === 'rescueRoute'"
        marker-kind="drill"
        :hide-controls="true"
        :pass-through="true"
        :route-playback="rescueRoutePlayback"
        :incident-title="incident.title"
        :hazard-source-level="incident.hazardSourceLevel"
        :incident-longitude="incident.longitude"
        :incident-latitude="incident.latitude"
        :fire-location="incident.location"
        :fire-status="incident.mapStatus"
        :incident-status="displayIncidentStatus"
      />

      <AccidentRescueMarkersOverlay
        v-if="
          sceneMode === 'evacuation' ||
          sceneMode === 'monitoring' ||
          (sceneMode === 'default' && activeLeftTab === 'dispatch' && focusedDispatchResource)
        "
        :monitoring-points="sceneMode === 'monitoring' ? mapMonitoringPoints : []"
        :evacuation-people="sceneMode === 'evacuation' ? evacuationPeople : []"
        :route-start="sceneMode === 'evacuation' ? routeStartPoint : null"
        :route-end="sceneMode === 'evacuation' ? routeEndPoint : null"
        :focused-monitoring-id="focusedMonitoringId"
        :focused-people-id="focusedPeopleId"
        :dispatch-resource="sceneMode === 'default' ? focusedDispatchResource : null"
        @focus-monitoring="focusMonitoringPoint"
        @focus-person="focusPerson"
      />
    </template>

    <div class="accident-rescue-page__ui">
      <AccidentRescueHeader
        :theme="pageTheme"
        :event-id="incident.eventId"
        :incident-title="incident.title"
        :started-at="headerStartedAt"
        :ended-at="incident.endedAt"
      />

      <button
        v-if="sceneMode === 'default'"
        type="button"
        class="accident-rescue-page__side-toggle accident-rescue-page__side-toggle--left"
        :title="leftCollapsed ? '展开左栏' : '收起左栏'"
        @click="leftCollapsed = !leftCollapsed"
      >
        {{ leftCollapsed ? '›' : '‹' }}
      </button>
      <button
        v-if="sceneMode === 'default'"
        type="button"
        class="accident-rescue-page__side-toggle accident-rescue-page__side-toggle--right"
        :title="rightCollapsed ? '展开右栏' : '收起右栏'"
        @click="rightCollapsed = !rightCollapsed"
      >
        {{ rightCollapsed ? '‹' : '›' }}
      </button>

      <main
        v-if="sceneMode === 'default'"
        class="accident-rescue-page__main"
        :style="{
          gridTemplateColumns: `${leftCollapsed ? 0 : 419}px minmax(0, 1fr) ${rightCollapsed ? 0 : 419}px`,
        }"
      >
        <div class="accident-rescue-page__left-slot" :class="{ 'is-collapsed': leftCollapsed }">
          <aside class="accident-rescue-page__left">
            <template v-if="!isDrillMode">
              <nav class="accident-rescue-page__left-tabs" aria-label="事件处置左栏导航">
                <button
                  v-for="tab in eventCommandDetailTabs"
                  :key="tab.key"
                  type="button"
                  :class="{ 'is-active': activeLeftTab === tab.key }"
                  @click="activeLeftTab = tab.key"
                >
                  {{ tab.label }}
                </button>
              </nav>
              <div class="accident-rescue-page__left-content">
                <div v-if="activeLeftTab === 'info'" class="accident-rescue-page__info-stack">
                  <IncidentDetailPanel
                    :action-kind="actionKind"
                    :fields="incident.detailFields"
                    :incident-status="displayIncidentStatus"
                    :reported="incident.reported"
                    :response-started="responseStarted"
                    :show-tabs="false"
                    hide-header
                    @start-emergency-response="handleStartEmergencyResponse"
                  />
                  <EmergencyPlanPanel
                    :incident-fields="incident.detailFields"
                    :event-title="incident.title"
                    mode="event"
                  />
                  <AccidentInfoPanel />
                </div>
                <div
                  v-else-if="activeLeftTab === 'response'"
                  class="accident-rescue-page__tab-panel"
                >
                  <EmergencyResponseCommandPanel embedded />
                </div>
                <div
                  v-else
                  class="accident-rescue-page__tab-panel accident-rescue-page__tab-panel--resource"
                >
                  <EmergencyResourceDispatchPanel
                    :resources="incident.dispatchResources"
                    @focus="focusDispatchResource"
                  />
                </div>
              </div>
            </template>
            <template v-else>
              <IncidentDetailPanel
                :action-kind="actionKind"
                :panel-title="incident.title"
                :fields="incident.detailFields"
                :incident-status="displayIncidentStatus"
                :reported="incident.reported"
                :response-started="responseStarted"
                @start-emergency-response="handleStartEmergencyResponse"
              />
              <EmergencyPlanPanel
                :incident-fields="incident.detailFields"
                :event-title="incident.title"
                mode="drill"
              />
              <AccidentInfoPanel />
            </template>
          </aside>

          <aside
            class="accident-rescue-page__command-drawer"
            :class="{ 'accident-rescue-page__command-drawer--open': commandDrawerVisible }"
          >
            <CommandActionDetailPanel
              v-if="commandDetail"
              :key="commandDetail.id"
              :detail="commandDetail"
            />
          </aside>
        </div>

        <div class="accident-rescue-page__panorama-cell">
          <PlanPanoramaModule
            :event-title="incident.title"
            :mode="isDrillMode ? 'drill' : 'event'"
            :center="{ longitude: incident.longitude, latitude: incident.latitude }"
          />
        </div>

        <div class="accident-rescue-page__right-slot" :class="{ 'is-collapsed': rightCollapsed }">
          <aside
            class="accident-rescue-page__right"
            :class="{
              'accident-rescue-page__right--duty-collapsed': dutyPanelCollapsed,
              'accident-rescue-page__right--aux-collapsed': auxiliaryPanelCollapsed,
              'accident-rescue-page__right--both-collapsed':
                dutyPanelCollapsed && auxiliaryPanelCollapsed,
              'accident-rescue-page__right--hidden': showFacilityDetail || rightCollapsed,
            }"
          >
            <RescueDutyPanel v-model:collapsed="dutyPanelCollapsed" :theme="panelTheme" />
            <RescueAuxiliaryPanel
              v-model:collapsed="auxiliaryPanelCollapsed"
              layout="eventCommand"
              :theme="panelTheme"
            />
            <RescueDynamicsPanel
              layout="eventCommand"
              :theme="panelTheme"
              :panel-title="isDrillMode ? '演练响应动态' : '应急响应动态'"
            />
          </aside>

          <aside
            class="accident-rescue-page__facility-drawer"
            :class="{ 'accident-rescue-page__facility-drawer--open': showFacilityDetail }"
          >
            <FacilityDetailPanel v-if="showFacilityDetail" :detail="facilityDetail" />
          </aside>
        </div>
      </main>

      <div v-if="sceneMode === 'default'" class="accident-rescue-page__map-controls-column">
        <div class="accident-rescue-page__map-quick-controls">
          <button
            type="button"
            class="accident-rescue-page__map-quick-btn"
            :class="{
              'accident-rescue-page__map-quick-btn--active': rightQuickActive === 'toolbar',
            }"
            @click.stop="handleToolbarToggle"
          >
            工具栏
          </button>
          <button
            type="button"
            class="accident-rescue-page__map-quick-btn"
            :class="{
              'accident-rescue-page__map-quick-btn--active': rightQuickActive === 'layers',
            }"
            @click.stop="handleLayerQuickClick"
          >
            图层
          </button>

          <div v-show="rightToolMenuOpen" class="accident-rescue-page__map-menu" @click.stop>
            <div class="accident-rescue-page__map-menu-head">
              <h4 class="accident-rescue-page__map-menu-title">工具栏</h4>
              <button
                type="button"
                class="accident-rescue-page__map-menu-close"
                aria-label="关闭工具栏菜单"
                @click.stop="closeToolMenu"
              >
                ×
              </button>
            </div>

            <section
              v-for="section in rightToolbarSections"
              :key="section.title"
              class="accident-rescue-page__map-menu-section"
            >
              <h4 class="accident-rescue-page__map-menu-subtitle">{{ section.title }}</h4>
              <div class="accident-rescue-page__map-menu-items">
                <button
                  v-for="item in section.items"
                  :key="item"
                  type="button"
                  class="accident-rescue-page__map-menu-item"
                  :class="{
                    'accident-rescue-page__map-menu-item--active': activeToolItem === item,
                  }"
                  @click.stop="handleToolAction(item)"
                >
                  {{ item }}
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>

      <div v-if="sceneMode === 'default'" class="accident-rescue-page__bottom">
        <RescueBottomToolbar
          layout="eventCommand"
          :theme="panelTheme"
          @action="handleBottomToolbarAction"
        />
      </div>

      <EmergencyAddressBookDialog :open="addressBookOpen" @close="closeAddressBook" />

      <EvacuationPeoplePanel
        :open="sceneMode === 'evacuation'"
        :people="evacuationPeople"
        @close="exitEvacuationScene"
        @focus="focusPerson"
      />

      <MonitoringPointsScenePanel
        :open="sceneMode === 'monitoring'"
        :points="monitoringPoints"
        :alarms="monitoringAlarms"
        @close="exitMonitoringScene"
        @focus="focusMonitoringPoint"
      />

      <RescueRouteScenePanel
        :open="sceneMode === 'rescueRoute'"
        :vehicle-plate="rescueRouteVehiclePlate"
        :vehicle-type="rescueRouteVehicleType"
        :time-range="rescueRouteTimeRange"
        :playing="rescueRoutePlaying"
        :speed="rescueRouteSpeed"
        :progress="rescueRouteProgress"
        @update:playing="setRescueRoutePlaying"
        @update:speed="setRescueRouteSpeed"
        @close="exitRescueRouteScene"
      />

      <SandboxMapOverlay
        v-if="sceneMode === 'sandbox'"
        :center="{ longitude: incident.longitude, latitude: incident.latitude }"
      />

      <SandboxPanel v-if="sceneMode === 'sandbox'" @close="exitSandboxScene" />
    </div>
  </MapPageShell>
</template>

<style scoped>
.accident-rescue-page__ui {
  position: relative;
  z-index: var(--z-chrome);
  display: flex;
  flex-direction: column;
  height: 100%;
  pointer-events: none;
}

.accident-rescue-page__ui > * {
  pointer-events: auto;
}

/* 全屏场景层仅面板/控件可点，中间地图区域事件穿透到底层 Cesium */
.accident-rescue-page__ui > :deep(.rr-scene),
.accident-rescue-page__ui > :deep(.mp-scene) {
  pointer-events: none;
}

.accident-rescue-page__main {
  position: relative;
  flex: 1;
  display: grid;
  grid-template-columns: 419px minmax(0, 1fr) 419px;
  grid-template-rows: auto;
  align-items: start;
  gap: 7px 0;
  min-height: 0;
  padding: 18px 39px 110px 20px;
  box-sizing: border-box;
  pointer-events: none;

  --accident-rescue-side-stack-height: calc(681px + 7px + 283px);
  --accident-rescue-right-stack-height: calc(283px + 7px + 318px + 7px + 374px);
}

.accident-rescue-page__left-slot.is-collapsed {
  width: 0;
  opacity: 0;
  pointer-events: none;
  overflow: hidden;
}

.accident-rescue-page__right-slot.is-collapsed {
  width: 0;
  opacity: 0;
  pointer-events: none;
  overflow: hidden;
}

.accident-rescue-page__side-toggle {
  position: absolute;
  top: 50%;
  z-index: var(--z-overlay);
  width: 22px;
  height: 64px;
  padding: 0;
  border: 1px solid rgb(56 189 248 / 50%);
  border-radius: 6px;
  background: rgb(15 23 42 / 92%);
  color: var(--map-sky-soft);
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  transition: all 0.18s ease;
}

.accident-rescue-page__side-toggle:hover {
  border-color: var(--map-sky);
  background: rgb(30 41 59 / 95%);
  color: var(--color-text-strong);
}

.accident-rescue-page__side-toggle--left {
  left: 0;
  border-left: none;
  border-radius: 0 6px 6px 0;
}

.accident-rescue-page__side-toggle--right {
  right: 0;
  border-right: none;
  border-radius: 6px 0 0 6px;
}

.accident-rescue-page__left-slot,
.accident-rescue-page__right-slot,
.accident-rescue-page__panorama-cell {
  pointer-events: auto;
}

.accident-rescue-page__left-slot {
  grid-column: 1;
  grid-row: 1;
  position: relative;
  width: 419px;
  height: var(--accident-rescue-side-stack-height);
}

.accident-rescue-page__left {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  gap: 7px;
}

.accident-rescue-page__left-tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  height: 38px;
  flex: 0 0 38px;
  border: 1px solid rgb(0 136 220 / 48%);
  border-radius: 3px;
  overflow: hidden;
  background: rgb(3 24 49 / 94%);
}

.accident-rescue-page__left-tabs button {
  border: 0;
  border-right: 1px solid rgb(0 110 190 / 30%);
  background: transparent;
  color: #9cb2ca;
  font: 13px var(--font-body);
  cursor: pointer;
}

.accident-rescue-page__left-tabs button:last-child {
  border-right: 0;
}

.accident-rescue-page__left-tabs button.is-active {
  color: var(--color-text-strong);
  background: linear-gradient(180deg, rgb(0 130 220 / 96%), rgb(0 82 166 / 96%));
  box-shadow: inset 0 -2px #39d4ff;
}

.accident-rescue-page__left-content {
  flex: 1;
  min-height: 0;
}

.accident-rescue-page__info-stack {
  display: grid;
  height: 100%;
  grid-template-rows: 492px 160px 267px;
  gap: 7px;
}

.accident-rescue-page__tab-panel {
  height: 100%;
  min-height: 0;
  border: 1px solid rgb(0 136 220 / 42%);
  border-radius: 3px;
  background: linear-gradient(180deg, rgb(3 30 59 / 96%), rgb(2 18 38 / 96%));
  padding: 12px;
  box-sizing: border-box;
  overflow: hidden;
}

.accident-rescue-page__tab-panel--resource {
  padding: 11px;
}

.accident-rescue-page__left > :deep(.incident-detail-wrap:first-child) {
  height: 530px;
}

.accident-rescue-page__left > :deep(.accident-rescue-panel:nth-child(2)) {
  height: 160px;
}

.accident-rescue-page__left > :deep(.accident-rescue-panel:nth-child(3)) {
  height: 267px;
}

.accident-rescue-page__command-drawer {
  position: absolute;
  left: calc(100% + 7px);
  top: 0;
  z-index: var(--z-overlay);
  width: 419px;
  height: 100%;
  transform: translateX(-24px);
  opacity: 0;
  pointer-events: none;
  transition:
    transform 0.38s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.32s ease;
}

.accident-rescue-page__command-drawer--open {
  transform: translateX(0);
  opacity: 1;
  pointer-events: auto;
}

.accident-rescue-page__panorama-cell {
  grid-column: 2;
  grid-row: 1;
  display: flex;
  justify-content: center;
  padding: 0 80px 0 24px;
  box-sizing: border-box;
}

.accident-rescue-page__right-slot {
  grid-column: 3;
  grid-row: 1;
  position: relative;
  width: 419px;
  height: var(--accident-rescue-side-stack-height);
}

.accident-rescue-page__right {
  display: grid;
  width: 100%;
  height: 100%;
  grid-template-rows: 283px 318px 374px;
  gap: 7px;
  transition:
    transform 0.38s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.28s ease;
}

.accident-rescue-page__right--hidden {
  transform: translateX(calc(100% + 24px));
  opacity: 0;
  pointer-events: none;
}

.accident-rescue-page__facility-drawer {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  z-index: var(--z-overlay);
  width: 100%;
  height: var(--accident-rescue-right-stack-height);
  transform: translateX(calc(100% + 24px));
  opacity: 0;
  pointer-events: none;
  transition:
    transform 0.42s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.32s ease;
}

.accident-rescue-page__facility-drawer--open {
  transform: translateX(0);
  opacity: 1;
  pointer-events: auto;
}

.accident-rescue-page__bottom {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 12px;
  z-index: var(--z-marker);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0 20px;
  box-sizing: border-box;
  pointer-events: none;
}

.accident-rescue-page__map-controls-column {
  position: absolute;
  right: 465px;
  top: calc(var(--header-height, 105px) + 18px);
  bottom: 12px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
  z-index: var(--z-chrome);
  pointer-events: auto;
}

.accident-rescue-page__map-quick-controls {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.accident-rescue-page__map-quick-btn {
  min-width: 86px;
  height: 36px;
  padding: 0 14px;
  border: 1px solid rgb(0 136 220 / 45%);
  border-radius: 4px;
  background: linear-gradient(180deg, rgb(8 40 74 / 92%), rgb(4 24 46 / 95%));
  color: #d8e8f8;
  font-size: 14px;
  font-family: var(--font-body);
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    filter 0.2s ease;
}

.accident-rescue-page__map-quick-btn:hover,
.accident-rescue-page__map-quick-btn--active {
  border-color: rgb(0 166 244 / 65%);
  filter: brightness(1.08);
}

.accident-rescue-page__map-menu {
  position: absolute;
  left: calc(100% + 10px);
  top: 0;
  z-index: var(--z-overlay);
  width: 318px;
  max-height: 420px;
  overflow-y: auto;
  padding: 12px;
  box-sizing: border-box;
  border: 1px solid rgb(0 148 236 / 45%);
  border-radius: 10px;
  background: linear-gradient(180deg, rgb(8 32 62 / 97%), rgb(4 18 40 / 97%));
  box-shadow: 0 10px 30px rgb(0 0 0 / 36%);
}

.accident-rescue-page__map-menu-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}

.accident-rescue-page__map-menu-title {
  margin: 0;
  font-size: 15px;
  color: #dce9f8;
  line-height: 1.3;
}

.accident-rescue-page__map-menu-close {
  width: 18px;
  height: 18px;
  padding: 0;
  border: 1px solid rgb(0 136 220 / 45%);
  border-radius: 2px;
  background: rgb(0 22 48 / 86%);
  color: #a8d6ff;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
}

.accident-rescue-page__map-menu-close:hover {
  border-color: rgb(0 166 244 / 66%);
  color: var(--color-text-strong);
}

.accident-rescue-page__map-menu-section + .accident-rescue-page__map-menu-section {
  margin-top: 10px;
}

.accident-rescue-page__map-menu-subtitle {
  margin: 0 0 6px;
  font-size: 13px;
  color: #dce9f8;
  line-height: 1.3;
}

.accident-rescue-page__map-menu-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.accident-rescue-page__map-menu-item {
  min-height: 32px;
  padding: 4px 10px;
  border: 1px solid rgb(0 124 206 / 34%);
  border-radius: 4px;
  background: rgb(0 20 42 / 82%);
  color: #d8e8f8;
  font-size: 12px;
  font-family: var(--font-body);
  line-height: 1.25;
  cursor: pointer;
}

.accident-rescue-page__map-menu-item:hover,
.accident-rescue-page__map-menu-item--active {
  border-color: rgb(0 166 244 / 58%);
  color: var(--color-text-strong);
}

.accident-rescue-page__right--duty-collapsed {
  grid-template-rows: 86px 318px minmax(374px, 1fr);
}

.accident-rescue-page__right--aux-collapsed {
  grid-template-rows: 283px 86px minmax(374px, 1fr);
}

.accident-rescue-page__right--both-collapsed {
  grid-template-rows: 86px 86px minmax(374px, 1fr);
}

.accident-rescue-page__bottom > * {
  pointer-events: auto;
}

.accident-rescue-page__bottom :deep(.rescue-bottom-toolbar) {
  position: relative;
  left: auto;
  bottom: auto;
  transform: none;
}

.accident-rescue-page__left > :deep(.incident-detail-wrap),
.accident-rescue-page__left > :deep(.accident-rescue-panel),
.accident-rescue-page__left-slot > :deep(.command-detail-wrap),
.accident-rescue-page__right > :deep(.accident-rescue-panel),
.accident-rescue-page__right-slot > :deep(.facility-detail-wrap),
.accident-rescue-page__right-slot > :deep(.accident-rescue-panel) {
  height: 100%;
  min-height: 0;
}
</style>
