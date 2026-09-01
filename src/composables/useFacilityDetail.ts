import { ref } from 'vue';

export const facilityDetailOpen = ref(false);

export function openFacilityDetail() {
  facilityDetailOpen.value = true;
}

export function closeFacilityDetail() {
  facilityDetailOpen.value = false;
}

export function toggleFacilityDetail() {
  facilityDetailOpen.value = !facilityDetailOpen.value;
}
