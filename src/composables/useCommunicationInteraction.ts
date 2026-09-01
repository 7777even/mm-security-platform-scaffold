import { ref, computed } from 'vue';
import type { CommunicationDevice } from '@/services/map-data/communicationDeviceMock';

// 生产通信模块「点击 → 二级界面」统一调度（模块级单例）。
// 由 src/views/production-communication/index.vue 挂载的 CommunicationInteractionLayer
// 按 openKind 分发渲染对应二级界面，关闭即交还调度层（ia.close）卸载本层内容，不离开模块。
// 自身不渲染任何 UI，仅持有「当前二级界面」状态（对齐 useFireAlarmInteraction 模式）。
//
// 二级界面承载方式：全部复用深蓝 ScreenDialog（--map-dialog-bg / --map-mask-bg / --map-dialog-border + --z-overlay）。

export type CommunicationSecondaryKind = 'oneKeyBroadcast' | 'singleBroadcast' | 'deviceDetail';

export interface CommunicationInteractionState {
  kind: CommunicationSecondaryKind;
  /** 透传给二级界面的业务数据（设备项等），无则为 undefined */
  payload?: unknown;
}

// 模块级单例：所有调用方共享同一份「当前二级界面」状态。
const state = ref<CommunicationInteractionState | null>(null);

export function useCommunicationInteraction() {
  const current = computed(() => state.value);
  const openKind = computed<CommunicationSecondaryKind | null>(() => state.value?.kind ?? null);

  function isOpen(kind: CommunicationSecondaryKind): boolean {
    return state.value?.kind === kind;
  }

  function open(kind: CommunicationSecondaryKind, payload?: unknown): void {
    state.value = { kind, payload };
  }

  // —— 各二级界面入口（语义化，便于面板调用） ——
  function openOneKeyBroadcast(payload?: unknown): void {
    open('oneKeyBroadcast', payload);
  }
  function openSingleBroadcast(payload?: unknown): void {
    open('singleBroadcast', payload);
  }
  function openDeviceDetail(device: CommunicationDevice): void {
    open('deviceDetail', device);
  }

  function close(): void {
    state.value = null;
  }

  return {
    current,
    openKind,
    isOpen,
    open,
    openOneKeyBroadcast,
    openSingleBroadcast,
    openDeviceDetail,
    close,
  };
}
