import { ref, computed } from 'vue';

// 工业电视模块「点击 → 二级界面」统一调度（模块级单例）。
// 挂载于 src/views/industrial-video/index.vue 的 IndustrialVideoInteractionLayer 按 openKind 分发渲染。
// 视频墙复用共享 VideoWallDialog；监控详情复用 tvMock.resolveTvVideoMonitorDetail。

export type IndustrialVideoKind = 'videoCategory' | 'videoMonitor' | 'videoLibrary' | 'noticeList';

export interface VideoCategoryPayload {
  label: string;
}
export interface VideoMonitorPayload {
  label: string;
  id?: string;
}

export interface IndustrialVideoState {
  kind: IndustrialVideoKind;
  payload?: unknown;
}

const state = ref<IndustrialVideoState | null>(null);

export function useIndustrialVideoInteraction() {
  const current = computed(() => state.value);
  const openKind = computed<IndustrialVideoKind | null>(() => state.value?.kind ?? null);

  function isOpen(kind: IndustrialVideoKind): boolean {
    return state.value?.kind === kind;
  }

  function open(kind: IndustrialVideoKind, payload?: unknown): void {
    state.value = { kind, payload };
  }

  function openVideoCategory(payload: VideoCategoryPayload): void {
    open('videoCategory', payload);
  }
  function openVideoMonitor(payload: VideoMonitorPayload): void {
    open('videoMonitor', payload);
  }
  function openVideoLibrary(): void {
    open('videoLibrary');
  }
  function openNoticeList(): void {
    open('noticeList');
  }

  function close(): void {
    state.value = null;
  }

  return {
    current,
    openKind,
    isOpen,
    open,
    openVideoCategory,
    openVideoMonitor,
    openVideoLibrary,
    openNoticeList,
    close,
  };
}
