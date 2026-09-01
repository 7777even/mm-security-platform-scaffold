import { ref, computed } from 'vue';

// 极端天气风险应急模块「点击 → 二级界面」统一调度（模块级单例）。
// 由 src/views/extreme-weather/index.vue 挂载的 ExtremeWeatherInteractionLayer 按 openKind 分发渲染。
// 自身不渲染任何 UI，仅持有「当前二级界面」状态（见 useFireAlarmInteraction 同构设计）。
//
// 二级界面承载方式：全部复用 ScreenDialog 深蓝弹窗壳（--map-dialog-bg 等 token，--z-overlay）。
//   - riskPointDetail：风险点详情（左列表 + 右详情，可联动视频墙/调度）
//   - satelliteCloud ：卫星云图 / 台风路径（typhoon-flood-cctv-grid 位图）
//   - videoWall      ：复用通用 VideoWallDialog（现场监控墙）
//   - alertList      ：预警信息发布列表（AlarmCard 列表，可联动调度/视频）
//   - dispatch       ：复用通用 OneKeyDispatchDialog（一键调度广播）

export type ExtremeWeatherSecondaryKind =
  'riskPointDetail' | 'satelliteCloud' | 'videoWall' | 'alertList' | 'dispatch';

export interface ExtremeWeatherInteractionState {
  kind: ExtremeWeatherSecondaryKind;
  /** 透传给二级界面的业务数据（风险点等），无则为 undefined */
  payload?: unknown;
}

// 模块级单例：所有调用方共享同一份「当前二级界面」状态。
const state = ref<ExtremeWeatherInteractionState | null>(null);

export function useExtremeWeatherInteraction() {
  const current = computed(() => state.value);
  const openKind = computed<ExtremeWeatherSecondaryKind | null>(() => state.value?.kind ?? null);

  function isOpen(kind: ExtremeWeatherSecondaryKind): boolean {
    return state.value?.kind === kind;
  }

  function open(kind: ExtremeWeatherSecondaryKind, payload?: unknown): void {
    state.value = { kind, payload };
  }

  // —— 各二级界面入口（语义化，便于面板调用） ——
  function openRiskPointDetail(payload?: unknown): void {
    open('riskPointDetail', payload);
  }
  function openSatelliteCloud(): void {
    open('satelliteCloud');
  }
  function openVideoWall(): void {
    open('videoWall');
  }
  function openAlertList(): void {
    open('alertList');
  }
  function openDispatch(payload?: unknown): void {
    open('dispatch', payload);
  }

  function close(): void {
    state.value = null;
  }

  return {
    current,
    openKind,
    isOpen,
    open,
    openRiskPointDetail,
    openSatelliteCloud,
    openVideoWall,
    openAlertList,
    openDispatch,
    close,
  };
}
