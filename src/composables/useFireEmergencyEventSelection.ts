import { ref } from 'vue';

export const selectedFireEmergencyEventId = ref<number | null>(null);

export function selectFireEmergencyEvent(id: number | null) {
  selectedFireEmergencyEventId.value = id;
}
