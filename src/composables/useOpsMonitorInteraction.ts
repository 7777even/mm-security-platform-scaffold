import { ref, computed } from 'vue';

// 生产应急模块「点击 → 二级界面」统一调度（模块级单例）。
// 挂载于 src/views/ops-monitor/index.vue 的 OpsMonitorInteractionLayer 按 openKind 分发渲染。
// 视频墙复用共享 VideoWallDialog；一键调度复用共享 OneKeyDispatchDialog。

export type OpsMonitorKind = 'majorRisk' | 'prodAlarmList' | 'video' | 'broadcast' | 'control';

export interface OpsMonitorContact {
  name: string;
  phone: string;
}

export interface OpsMonitorState {
  kind: OpsMonitorKind;
  payload?: unknown;
}

const state = ref<OpsMonitorState | null>(null);

export function useOpsMonitorInteraction() {
  const current = computed(() => state.value);
  const openKind = computed<OpsMonitorKind | null>(() => state.value?.kind ?? null);

  function isOpen(kind: OpsMonitorKind): boolean {
    return state.value?.kind === kind;
  }

  function open(kind: OpsMonitorKind, payload?: unknown): void {
    state.value = { kind, payload };
  }

  function openMajorRisk(): void {
    open('majorRisk');
  }
  function openProdAlarmList(): void {
    open('prodAlarmList');
  }
  function openVideo(hint?: string): void {
    open('video', { hint });
  }
  function openBroadcast(payload?: OpsMonitorContact): void {
    open('broadcast', payload);
  }
  function openControl(payload?: OpsMonitorContact): void {
    open('control', payload);
  }

  function close(): void {
    state.value = null;
  }

  return {
    current,
    openKind,
    isOpen,
    open,
    openMajorRisk,
    openProdAlarmList,
    openVideo,
    openBroadcast,
    openControl,
    close,
  };
}
