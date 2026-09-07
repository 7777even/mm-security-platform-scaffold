import { computed, ref } from 'vue';
import { bollards, type BollardItem } from '@/services/security';

export const bollardDetailOpen = ref(false);
export const bollardDetailId = ref<number | null>(null);

export const bollardDetailItem = computed<BollardItem | null>(() => {
  const id = bollardDetailId.value;
  if (id == null) return null;
  return bollards.find((b) => b.id === id) ?? null;
});

export function openBollardDetail(id: number) {
  bollardDetailId.value = id;
  bollardDetailOpen.value = true;
}

export function closeBollardDetail() {
  bollardDetailOpen.value = false;
  bollardDetailId.value = null;
}

export function useBollardDetailDialog() {
  return {
    bollardDetailOpen,
    bollardDetailId,
    bollardDetailItem,
    openBollardDetail,
    closeBollardDetail,
  };
}
