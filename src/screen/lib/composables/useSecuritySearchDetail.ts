import { computed, ref, watch } from 'vue';
import {
  fetchPersonSearchDetail,
  fetchVehicleSearchDetail,
  type PersonSearchDetail,
  type VehicleSearchDetail,
} from '@/services/security';

export const selectedVehicleSearchId = ref<number | null>(null);
export const selectedPersonSearchId = ref<number | null>(null);

export const securitySearchDetailOpen = computed(
  () => selectedVehicleSearchId.value != null || selectedPersonSearchId.value != null,
);

// B5 去 mock：详情由后端 /security/search/{vehicle|person}/{id} 拉取（原 getVehicleSearchDetail/
// getPersonSearchDetail 假数据解析器已删除）；选中 id 变化时异步加载，未选中为空。
const selectedVehicleDetail = ref<VehicleSearchDetail | null>(null);
const selectedPersonDetail = ref<PersonSearchDetail | null>(null);

watch(selectedVehicleSearchId, async (id) => {
  selectedVehicleDetail.value = id == null ? null : await fetchVehicleSearchDetail(id);
});

watch(selectedPersonSearchId, async (id) => {
  selectedPersonDetail.value = id == null ? null : await fetchPersonSearchDetail(id);
});

export { selectedVehicleDetail, selectedPersonDetail };

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
