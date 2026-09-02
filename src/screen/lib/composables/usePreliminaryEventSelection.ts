import { ref } from 'vue';

export const selectedPreliminaryEventId = ref<number | null>(null);

export function selectPreliminaryEvent(id: number | null) {
  selectedPreliminaryEventId.value = id;
}
