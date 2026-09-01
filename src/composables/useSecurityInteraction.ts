import { ref, computed } from 'vue';

// 安全防恐模块「点击 → 二级界面」统一调度（模块级单例）。
// 挂载于 src/views/security-anti-terror/index.vue 的 SecurityInteractionLayer 按 openKind 分发渲染。
// 危险源复用 majorHazardMock（majorHazards / resolveMajorHazardDetail）。

export type SecurityKind = 'hazardSource' | 'patrolDetail' | 'patrolList';

export interface PatrolItemPayload {
  key: string;
  label: string;
}

export interface SecurityState {
  kind: SecurityKind;
  payload?: unknown;
}

const state = ref<SecurityState | null>(null);

export function useSecurityInteraction() {
  const current = computed(() => state.value);
  const openKind = computed<SecurityKind | null>(() => state.value?.kind ?? null);

  function isOpen(kind: SecurityKind): boolean {
    return state.value?.kind === kind;
  }

  function open(kind: SecurityKind, payload?: unknown): void {
    state.value = { kind, payload };
  }

  function openHazardSource(): void {
    open('hazardSource');
  }
  function openPatrolDetail(payload: PatrolItemPayload): void {
    open('patrolDetail', payload);
  }
  function openPatrolList(): void {
    open('patrolList');
  }

  function close(): void {
    state.value = null;
  }

  return {
    current,
    openKind,
    isOpen,
    open,
    openHazardSource,
    openPatrolDetail,
    openPatrolList,
    close,
  };
}
