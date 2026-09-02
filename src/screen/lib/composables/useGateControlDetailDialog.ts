import { computed, ref } from 'vue';
import { gateControls, type GateControlItem } from '../data/securityGateControlMock';

export const gateControlDetailOpen = ref(false);
export const gateControlDetailId = ref<number | null>(null);

export const gateControlDetailItem = computed<GateControlItem | null>(() => {
  const id = gateControlDetailId.value;
  if (id == null) return null;
  return gateControls.find((g) => g.id === id) ?? null;
});

export function openGateControlDetail(id: number) {
  gateControlDetailId.value = id;
  gateControlDetailOpen.value = true;
}

export function closeGateControlDetail() {
  gateControlDetailOpen.value = false;
  gateControlDetailId.value = null;
}

export function useGateControlDetailDialog() {
  return {
    gateControlDetailOpen,
    gateControlDetailId,
    gateControlDetailItem,
    openGateControlDetail,
    closeGateControlDetail,
  };
}
