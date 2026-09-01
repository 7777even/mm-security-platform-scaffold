import { ref, computed } from 'vue';

// 重大危险源模块「点击 → 二级界面」统一调度（模块级单例）。
// 由 src/views/major-hazard/* 挂载的 MajorHazardInteractionLayer 按 openKind 分发渲染。
// 自身不渲染任何 UI，仅持有「当前二级界面」状态，避免重复造轮子（见 AGENTS.md §5 优先复用）。
//
// 二级界面承载方式（对标消防报警 inline-closed-loop）：
//   - hazardDetail / monitoring / chemicals / evacuation / emergencyOp 由 ScreenDialog 渲染（--z-overlay）。
//   - video 复用通用 VideoWallDialog（监控墙）。

export type MajorHazardSecondaryKind =
  'hazardDetail' | 'monitoring' | 'video' | 'chemicals' | 'evacuation' | 'emergencyOp';

export interface MajorHazardInteractionState {
  kind: MajorHazardSecondaryKind;
  /** 透传给二级界面的业务数据（危险源项 / 详情等），无则为 undefined */
  payload?: unknown;
}

// 模块级单例：所有调用方共享同一份「当前二级界面」状态。
const state = ref<MajorHazardInteractionState | null>(null);

export function useMajorHazardInteraction() {
  const current = computed(() => state.value);
  const openKind = computed<MajorHazardSecondaryKind | null>(() => state.value?.kind ?? null);

  function isOpen(kind: MajorHazardSecondaryKind): boolean {
    return state.value?.kind === kind;
  }

  function open(kind: MajorHazardSecondaryKind, payload?: unknown): void {
    state.value = { kind, payload };
  }

  // —— 各二级界面入口（语义化，便于面板 / 视图调用） ——
  function openHazardDetail(payload?: unknown): void {
    open('hazardDetail', payload);
  }
  function openMonitoring(payload?: unknown): void {
    open('monitoring', payload);
  }
  function openVideo(payload?: unknown): void {
    open('video', payload);
  }
  function openChemicals(payload?: unknown): void {
    open('chemicals', payload);
  }
  function openEvacuation(payload?: unknown): void {
    open('evacuation', payload);
  }
  function openEmergencyOp(payload?: unknown): void {
    open('emergencyOp', payload);
  }

  function close(): void {
    state.value = null;
  }

  return {
    current,
    openKind,
    isOpen,
    open,
    openHazardDetail,
    openMonitoring,
    openVideo,
    openChemicals,
    openEvacuation,
    openEmergencyOp,
    close,
  };
}
