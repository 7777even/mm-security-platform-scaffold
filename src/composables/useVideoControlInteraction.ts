import { ref, computed } from 'vue';
import type { VideoControlCell } from '@/services/map-data/videoControlMock';

// 视频控制平台模块「点击 → 二级界面」统一调度（模块级单例）。
// 由 src/views/video-control/index.vue 挂载的 VideoControlInteractionLayer 按 openKind 分发渲染。
// 自身不渲染任何 UI，承载方式对齐消防报警模块：
//   - 弹窗类（cameraDetail / controlPage / deviceList）由 ScreenDialog 深蓝弹窗壳承载（--z-overlay）。
export type VideoControlKind = 'cameraDetail' | 'controlPage' | 'deviceList';

export interface VideoControlInteractionState {
  kind: VideoControlKind;
  /** 透传给二级界面的业务数据（摄像机单元），无则为 undefined */
  payload?: VideoControlCell;
}

// 模块级单例：所有调用方共享同一份「当前二级界面」状态。
const state = ref<VideoControlInteractionState | null>(null);

export function useVideoControlInteraction() {
  const current = computed(() => state.value);
  const openKind = computed<VideoControlKind | null>(() => state.value?.kind ?? null);

  function isOpen(kind: VideoControlKind): boolean {
    return state.value?.kind === kind;
  }

  function open(kind: VideoControlKind, payload?: VideoControlCell): void {
    state.value = { kind, payload };
  }

  // —— 各二级界面入口（语义化，便于面板调用） ——
  function openCameraDetail(cell: VideoControlCell): void {
    open('cameraDetail', cell);
  }
  function openControlPage(): void {
    open('controlPage');
  }
  function openDeviceList(): void {
    open('deviceList');
  }

  function close(): void {
    state.value = null;
  }

  return {
    current,
    openKind,
    isOpen,
    open,
    openCameraDetail,
    openControlPage,
    openDeviceList,
    close,
  };
}
