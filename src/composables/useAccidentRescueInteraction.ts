import { ref, computed } from 'vue';

// 事故应急救援模块「点击 → 二级界面」统一调度（模块级单例）。
// 由 src/views/accident-rescue/index.vue 挂载的 AccidentRescueInteractionLayer 按 openKind 分发渲染。
// 自身不渲染任何 UI，仅持有「当前二级界面」状态，避免重复造轮子（见 AGENTS.md §5 优先复用）。
//
// 二级界面承载方式（与消防报警模块对齐）：
//   - 弹窗类（addressBook 等）由 AccidentRescueInteractionLayer 裹对应 Dialog 组件（深蓝 Dialog 规范），
//     显示由父 v-if 控制挂载；关闭 emit('close') 交由调度层卸载。
//   - 场景类（应急疏散 / 监测点位 / 救援路线 / 沙盘推演）仍由 index.vue 的 sceneMode 本地状态驱动，
//     其 @close 直接回到 default 场景，属于页面内场景切换而非悬浮二级界面，故不纳入本调度，
//     以保守保留既有可用行为（见任务约束：不拆除可用状态）。
//   - 视频监控墙 / 融合通讯类为跨路由跳转或外部能力，保持既有 router.push / 占位反馈。

export type AccidentRescueKind = 'addressBook';

export interface AccidentRescueInteractionState {
  kind: AccidentRescueKind;
  /** 透传给二级界面的业务数据，无则为 undefined */
  payload?: unknown;
}

// 模块级单例：所有调用方共享同一份「当前二级界面」状态。
const state = ref<AccidentRescueInteractionState | null>(null);

export function useAccidentRescueInteraction() {
  const current = computed(() => state.value);
  const openKind = computed<AccidentRescueKind | null>(() => state.value?.kind ?? null);

  function isOpen(kind: AccidentRescueKind): boolean {
    return state.value?.kind === kind;
  }

  function open(kind: AccidentRescueKind, payload?: unknown): void {
    state.value = { kind, payload };
  }

  // —— 各二级界面入口（语义化，便于面板调用） ——
  function openAddressBook(payload?: unknown): void {
    open('addressBook', payload);
  }

  function close(): void {
    state.value = null;
  }

  return {
    current,
    openKind,
    isOpen,
    open,
    openAddressBook,
    close,
  };
}
