import { ref, computed } from 'vue';

// 消防报警模块「点击 → 二级界面」统一调度（模块级单例）。
// 由 src/views/fire-alarm/index.vue 挂载的 FireAlarmInteractionLayer 按 openKind 分发渲染。
// 告警详情复用既有 AlarmDetailView / records.vue 能力，本调度只持有「当前二级界面」状态，
// 自身不渲染任何 UI，避免重复造轮子（见 AGENTS.md §5 优先复用）。
//
// 二级界面承载方式（见 openspec/changes/fire-alarm-interactions）：
//   - 抽屉类（alarmDetail / alarmList / facility / patrol / video / strength / specialWork / oneKeyBroadcast）
//     由 FireAlarmInteractionLayer 统一裹 SecondaryPageOverlay（模块内覆盖层，不离开模块）。
//   - 弹窗按深蓝 Dialog 规范渲染（--map-dialog-bg / --map-mask-bg / --map-dialog-border + --z-overlay）。

export type FireSecondaryKind =
  | 'alarmDetail'
  | 'alarmList'
  | 'facility'
  | 'patrol'
  | 'video'
  | 'strength'
  | 'specialWork'
  | 'oneKeyBroadcast';

export interface FireAlarmInteractionState {
  kind: FireSecondaryKind;
  /** 透传给二级界面的业务数据（告警项 / 联络人等），无则为 undefined */
  payload?: unknown;
}

// 模块级单例：所有调用方共享同一份「当前二级界面」状态。
const state = ref<FireAlarmInteractionState | null>(null);

export function useFireAlarmInteraction() {
  const current = computed(() => state.value);
  const openKind = computed<FireSecondaryKind | null>(() => state.value?.kind ?? null);

  function isOpen(kind: FireSecondaryKind): boolean {
    return state.value?.kind === kind;
  }

  function open(kind: FireSecondaryKind, payload?: unknown): void {
    state.value = { kind, payload };
  }

  // —— 各二级界面入口（语义化，便于面板调用） ——
  function openAlarmDetail(payload?: unknown): void {
    open('alarmDetail', payload);
  }
  function openAlarmList(): void {
    open('alarmList');
  }
  function openFacility(): void {
    open('facility');
  }
  function openPatrol(): void {
    open('patrol');
  }
  function openVideo(payload?: unknown): void {
    open('video', payload);
  }
  function openStrength(): void {
    open('strength');
  }
  function openSpecialWork(): void {
    open('specialWork');
  }
  function openOneKeyBroadcast(payload?: unknown): void {
    open('oneKeyBroadcast', payload);
  }

  function close(): void {
    state.value = null;
  }

  return {
    current,
    openKind,
    isOpen,
    open,
    openAlarmDetail,
    openAlarmList,
    openFacility,
    openPatrol,
    openVideo,
    openStrength,
    openSpecialWork,
    openOneKeyBroadcast,
    close,
  };
}
