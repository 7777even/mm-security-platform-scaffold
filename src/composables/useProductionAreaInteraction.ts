import { ref, computed } from 'vue';

// 生产区域模块「点击 → 二级界面」统一调度（模块级单例）。
// 由 src/views/production-area/index.vue 挂载的 ProductionAreaInteractionLayer 按 openKind 分发渲染。
// 自身不渲染任何 UI，仅持有「当前二级界面」状态（对齐 useFireAlarmInteraction 模式）。
//
// 二级界面承载方式（深蓝 Dialog 规范，复用 ScreenDialog）：
//   - facilityDetail / personnel / alarmList 由 ProductionAreaInteractionLayer 统一裹 ScreenDialog。
//   - video 直接复用通用 VideoWallDialog（现场监控墙）。

export type ProductionAreaKind = 'facilityDetail' | 'personnel' | 'alarmList' | 'video';

export interface ProductionAreaPersonnelSlice {
  name: string;
  value: number;
  color: string;
}

export interface ProductionPersonnelPayload {
  total: number;
  slices: ProductionAreaPersonnelSlice[];
}

export interface ProductionAreaInteractionState {
  kind: ProductionAreaKind;
  /** 透传给二级界面的业务数据（facilityId / personnel payload / video hint），无则为 undefined */
  payload?: unknown;
}

// 模块级单例：所有调用方共享同一份「当前二级界面」状态。
const state = ref<ProductionAreaInteractionState | null>(null);

export function useProductionAreaInteraction() {
  const current = computed(() => state.value);
  const openKind = computed<ProductionAreaKind | null>(() => state.value?.kind ?? null);

  function isOpen(kind: ProductionAreaKind): boolean {
    return state.value?.kind === kind;
  }

  function open(kind: ProductionAreaKind, payload?: unknown): void {
    state.value = { kind, payload };
  }

  // —— 各二级界面入口（语义化，便于面板调用） ——
  function openFacilityDetail(facilityId?: number | string): void {
    open('facilityDetail', facilityId);
  }
  function openPersonnel(payload?: ProductionPersonnelPayload): void {
    open('personnel', payload);
  }
  function openAlarmList(facilityId?: number | string): void {
    open('alarmList', facilityId);
  }
  function openVideo(hint?: string): void {
    open('video', hint);
  }

  function close(): void {
    state.value = null;
  }

  return {
    current,
    openKind,
    isOpen,
    open,
    openFacilityDetail,
    openPersonnel,
    openAlarmList,
    openVideo,
    close,
  };
}
