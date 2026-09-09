import { computed, ref } from 'vue';
import {
  loadRescueEquipment,
  rescueEquipmentItems,
  type RescueEquipmentItem,
} from '@/services/map-data/rescueEquipmentMock';
import { usePlantArea } from './usePlantArea';

const { filterByPlantArea } = usePlantArea();

const equipmentItems = ref<RescueEquipmentItem[]>(rescueEquipmentItems);
import { coordsForSquadronPaged } from '@/services/map-data/rescueMapCoords';
import { restoreRescueMapView, runRescueMapFocus } from './useRescueMapFocus';

export const RESCUE_EQUIPMENT_PAGE_SIZE = 7;

export const rescueEquipmentViewActive = ref(false);
export const selectedRescueEquipmentId = ref<number | null>(null);
export const rescueEquipmentCurrentPage = ref(1);
export const rescueEquipmentKeyword = ref('');
export const rescueEquipmentSquadronFilter = ref('全部中队');

export const selectedRescueEquipment = computed<RescueEquipmentItem | null>(
  () => equipmentItems.value.find((i) => i.id === selectedRescueEquipmentId.value) ?? null,
);

export const rescueEquipmentFilteredItems = computed(() => {
  const kw = rescueEquipmentKeyword.value.trim();
  return filterByPlantArea(equipmentItems.value).filter((item) => {
    const matchKw = !kw || item.name.includes(kw);
    const matchSquadron =
      rescueEquipmentSquadronFilter.value === '全部中队' ||
      item.squadron === rescueEquipmentSquadronFilter.value;
    return matchKw && matchSquadron;
  });
});

export const rescueEquipmentTotalPages = computed(() =>
  Math.max(1, Math.ceil(rescueEquipmentFilteredItems.value.length / RESCUE_EQUIPMENT_PAGE_SIZE)),
);

export const rescueEquipmentPagedItems = computed(() => {
  const start = (rescueEquipmentCurrentPage.value - 1) * RESCUE_EQUIPMENT_PAGE_SIZE;
  return rescueEquipmentFilteredItems.value.slice(start, start + RESCUE_EQUIPMENT_PAGE_SIZE);
});

function equipmentMarkers() {
  const page = rescueEquipmentCurrentPage.value;
  const items = rescueEquipmentPagedItems.value;
  return items.map((item, index) =>
    coordsForSquadronPaged(item.squadron, item.id, index, items.length, page),
  );
}

function focusForEquipment(id: number | null) {
  const items = rescueEquipmentPagedItems.value;
  const index = items.findIndex((item) => item.id === id);
  const item = equipmentItems.value.find((i) => i.id === id) ?? null;
  if (!item || index < 0) return null;
  return coordsForSquadronPaged(
    item.squadron,
    item.id,
    index,
    items.length,
    rescueEquipmentCurrentPage.value,
  );
}

function syncRescueEquipmentMapFocus() {
  runRescueMapFocus(equipmentMarkers(), focusForEquipment(selectedRescueEquipmentId.value));
}

export function goToRescueEquipmentPage(page: number) {
  if (page < 1 || page > rescueEquipmentTotalPages.value) return;
  rescueEquipmentCurrentPage.value = page;
  if (
    selectedRescueEquipmentId.value != null &&
    !rescueEquipmentPagedItems.value.some((item) => item.id === selectedRescueEquipmentId.value)
  ) {
    selectedRescueEquipmentId.value = null;
  }
  syncRescueEquipmentMapFocus();
}

export function searchRescueEquipment() {
  rescueEquipmentCurrentPage.value = 1;
  selectedRescueEquipmentId.value = null;
  syncRescueEquipmentMapFocus();
}

export function resetRescueEquipmentSearch() {
  rescueEquipmentKeyword.value = '';
  rescueEquipmentSquadronFilter.value = '全部中队';
  searchRescueEquipment();
}

export function openRescueEquipmentView() {
  rescueEquipmentViewActive.value = true;
  rescueEquipmentCurrentPage.value = 1;
  rescueEquipmentKeyword.value = '';
  rescueEquipmentSquadronFilter.value = '全部中队';
  selectedRescueEquipmentId.value = null;
  runRescueMapFocus(equipmentMarkers());
  void loadRescueEquipment().then((items) => {
    equipmentItems.value = items;
    syncRescueEquipmentMapFocus();
  });
}

export function closeRescueEquipmentView() {
  rescueEquipmentViewActive.value = false;
  rescueEquipmentCurrentPage.value = 1;
  selectedRescueEquipmentId.value = null;
  restoreRescueMapView();
}

export function selectRescueEquipment(id: number) {
  selectedRescueEquipmentId.value = id;
  syncRescueEquipmentMapFocus();
}
