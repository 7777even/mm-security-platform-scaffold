import { computed, ref } from 'vue';
import {
  getPersonSearchDetail,
  getVehicleSearchDetail,
  type PersonSearchDetail,
  type VehicleSearchDetail,
} from '../data/securitySearchMock';

export const selectedVehicleSearchId = ref<number | null>(null);
export const selectedPersonSearchId = ref<number | null>(null);

export const securitySearchDetailOpen = computed(
  () => selectedVehicleSearchId.value != null || selectedPersonSearchId.value != null,
);

export const selectedVehicleDetail = computed<VehicleSearchDetail | null>(() =>
  getVehicleSearchDetail(selectedVehicleSearchId.value),
);

export const selectedPersonDetail = computed<PersonSearchDetail | null>(() =>
  getPersonSearchDetail(selectedPersonSearchId.value),
);

export function selectVehicleSearchResult(id: number) {
  selectedPersonSearchId.value = null;
  selectedVehicleSearchId.value = selectedVehicleSearchId.value === id ? null : id;
}

export function selectPersonSearchResult(id: number) {
  selectedVehicleSearchId.value = null;
  selectedPersonSearchId.value = selectedPersonSearchId.value === id ? null : id;
}

export function openSecuritySearchDetail(mode: 'vehicle' | 'person', id: number) {
  if (mode === 'vehicle') {
    selectedPersonSearchId.value = null;
    selectedVehicleSearchId.value = id;
    return;
  }
  selectedVehicleSearchId.value = null;
  selectedPersonSearchId.value = id;
}

export function closeSecuritySearchDetail() {
  selectedVehicleSearchId.value = null;
  selectedPersonSearchId.value = null;
}
