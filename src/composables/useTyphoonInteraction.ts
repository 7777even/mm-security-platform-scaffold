import { ref, computed } from 'vue';
import type { TyphoonMapRiskPoint } from '@/services/map-data/typhoonEmergencyMock';

// 台风应急模块「点击 → 二级界面」统一调度（模块级单例）。
// 由 src/views/typhoon-emergency/index.vue 挂载的 TyphoonInteractionLayer 按 openKind 分发渲染。
// 本调度只持有「当前二级界面」状态，自身不渲染任何 UI，避免重复造轮子（见 AGENTS.md §5 优先复用）。
//
// 二级界面承载方式（全部复用深蓝 ScreenDialog 规范 / 既有弹窗组件）：
//   - satelliteCloud：卫星云图（既有 SatelliteCloudMapDialog）
//   - riskVideo：风险点关联视频墙（既有 TyphoonRiskVideoWallDialog）
//   - riskPointDetail：风险点详情（新增，ScreenDialog + 语义位图）
//   - resourceDispatch：资源一键调度（复用 OneKeyDispatchDialog，kind 决定广播/控制）
//   - incidentList：事件清单（新增，resolveTyphoonEmergencyIncident 列表）

export type TyphoonSecondaryKind =
  'satelliteCloud' | 'riskVideo' | 'riskPointDetail' | 'resourceDispatch' | 'incidentList';

export type TyphoonDispatchKind = 'control' | 'broadcast';

export interface TyphoonInteractionState {
  kind: TyphoonSecondaryKind;
  /** 透传给二级界面的业务数据，无则为 undefined */
  payload?: unknown;
}

// 模块级单例：所有调用方共享同一份「当前二级界面」状态。
const state = ref<TyphoonInteractionState | null>(null);

export function useTyphoonInteraction() {
  const current = computed(() => state.value);
  const openKind = computed<TyphoonSecondaryKind | null>(() => state.value?.kind ?? null);

  function isOpen(kind: TyphoonSecondaryKind): boolean {
    return state.value?.kind === kind;
  }

  function open(kind: TyphoonSecondaryKind, payload?: unknown): void {
    state.value = { kind, payload };
  }

  // —— 各二级界面入口（语义化，便于面板/覆盖层调用） ——
  function openSatelliteCloud(typhoonCode?: string): void {
    open('satelliteCloud', typhoonCode);
  }
  function openRiskVideo(point: TyphoonMapRiskPoint): void {
    open('riskVideo', point);
  }
  function openRiskPointDetail(point: TyphoonMapRiskPoint): void {
    open('riskPointDetail', point);
  }
  function openResourceDispatch(kind: TyphoonDispatchKind = 'control'): void {
    open('resourceDispatch', kind);
  }
  function openIncidentList(eventId?: number): void {
    open('incidentList', eventId);
  }

  function close(): void {
    state.value = null;
  }

  return {
    current,
    openKind,
    isOpen,
    open,
    openSatelliteCloud,
    openRiskVideo,
    openRiskPointDetail,
    openResourceDispatch,
    openIncidentList,
    close,
  };
}
