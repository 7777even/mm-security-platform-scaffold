import { ref, computed } from 'vue';

// 视频监控墙模块「点击 → 二级界面」统一调度（模块级单例）。
// 由 src/views/video-wall/index.vue 挂载的 VideoWallInteractionLayer 按 openKind 分发渲染。
// 本调度只持有「当前二级界面」状态，自身不渲染任何 UI（对齐 useFireAlarmInteraction，见 AGENTS.md §5 优先复用）。
//
// 二级界面承载方式（全部为深蓝 Dialog，复用 @/components/fire/ScreenDialog.vue）：
//   - cameraDetail    摄像头详情（信息 + 位图缩略图 + 状态徽标）
//   - eventVideoWall  事件视频墙（复用 @/components/common/VideoWallDialog.vue）
//   - linkageConfig   监控联动配置（复用既有 VideoLinkageConfigDialog 组件）

export type VideoWallSecondaryKind = 'cameraDetail' | 'eventVideoWall' | 'linkageConfig';

/** 摄像头详情二级界面的入参（网格分屏 / 目录树节点 / 事件分组摄像头通用） */
export interface VideoWallCameraTarget {
  id: string;
  name: string;
  /** 来源描述：所在分屏、目录分组或事件分组名 */
  source?: string;
  /** 所属区域 / 位置 */
  location?: string;
  /** 通道状态，缺省按在线直播处理 */
  status?: 'live' | 'loading' | 'ai' | 'offline';
}

/** 事件视频墙二级界面的入参，hint 缺省时由分发层按当前事件上下文推导 */
export interface VideoWallEventTarget {
  hint?: string;
}

export interface VideoWallInteractionState {
  kind: VideoWallSecondaryKind;
  /** 透传给二级界面的业务数据（摄像头 / 事件上下文等），无则为 undefined */
  payload?: unknown;
}

// 模块级单例：所有调用方共享同一份「当前二级界面」状态。
const state = ref<VideoWallInteractionState | null>(null);

export function useVideoWallInteraction() {
  const current = computed(() => state.value);
  const openKind = computed<VideoWallSecondaryKind | null>(() => state.value?.kind ?? null);

  function isOpen(kind: VideoWallSecondaryKind): boolean {
    return state.value?.kind === kind;
  }

  function open(kind: VideoWallSecondaryKind, payload?: unknown): void {
    state.value = { kind, payload };
  }

  // —— 各二级界面入口（语义化，便于面板 / 网格 / 侧栏调用） ——
  function openCameraDetail(payload?: VideoWallCameraTarget): void {
    open('cameraDetail', payload);
  }
  function openEventVideoWall(payload?: VideoWallEventTarget): void {
    open('eventVideoWall', payload);
  }
  function openLinkageConfig(): void {
    open('linkageConfig');
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
    openEventVideoWall,
    openLinkageConfig,
    close,
  };
}
