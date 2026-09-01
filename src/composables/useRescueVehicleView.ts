import { computed, ref } from 'vue';
import {
  getRescueVehicleItem,
  rescueVehicleItems,
  type RescueVehicleItem,
} from '@/services/map-data/rescueVehicleMock';
import { usePlantArea } from './usePlantArea';

const { filterByPlantArea } = usePlantArea();
import { coordsForSquadronPaged } from '@/services/map-data/rescueMapCoords';
import { restoreRescueMapView, runRescueMapFocus } from './useRescueMapFocus';

export const RESCUE_VEHICLE_PAGE_SIZE = 10;

export const rescueVehicleViewActive = ref(false);
export const selectedRescueVehicleId = ref<number | null>(null);
export const rescueVehicleCurrentPage = ref(1);
export const rescueVehiclePlateKeyword = ref('');
export const rescueVehicleTypeFilter = ref('全部类型');
export const rescueVehicleSquadronFilter = ref('全部中队');

export const selectedRescueVehicle = computed<RescueVehicleItem | null>(() =>
  getRescueVehicleItem(selectedRescueVehicleId.value),
);

export const rescueVehicleFilteredItems = computed(() => {
  const kw = rescueVehiclePlateKeyword.value.trim();
  return filterByPlantArea(rescueVehicleItems).filter((item) => {
    const matchPlate = !kw || item.plate.includes(kw);
    const matchType =
      rescueVehicleTypeFilter.value === '全部类型' || item.type === rescueVehicleTypeFilter.value;
    const matchSquadron =
      rescueVehicleSquadronFilter.value === '全部中队' ||
      item.squadron === rescueVehicleSquadronFilter.value;
    return matchPlate && matchType && matchSquadron;
  });
});

export const rescueVehicleTotalPages = computed(() =>
  Math.max(1, Math.ceil(rescueVehicleFilteredItems.value.length / RESCUE_VEHICLE_PAGE_SIZE)),
);

export const rescueVehiclePagedItems = computed(() => {
  const start = (rescueVehicleCurrentPage.value - 1) * RESCUE_VEHICLE_PAGE_SIZE;
  return rescueVehicleFilteredItems.value.slice(start, start + RESCUE_VEHICLE_PAGE_SIZE);
});

function vehicleMarkers() {
  const page = rescueVehicleCurrentPage.value;
  const items = rescueVehiclePagedItems.value;
  return items.map((item, index) =>
    coordsForSquadronPaged(item.squadron, item.id, index, items.length, page),
  );
}

function focusForVehicle(id: number | null) {
  const items = rescueVehiclePagedItems.value;
  const index = items.findIndex((item) => item.id === id);
  const item = getRescueVehicleItem(id);
  if (!item || index < 0) return null;
  return coordsForSquadronPaged(
    item.squadron,
    item.id,
    index,
    items.length,
    rescueVehicleCurrentPage.value,
  );
}

function syncRescueVehicleMapFocus() {
  runRescueMapFocus(vehicleMarkers(), focusForVehicle(selectedRescueVehicleId.value));
}

export function goToRescueVehiclePage(page: number) {
  if (page < 1 || page > rescueVehicleTotalPages.value) return;
  rescueVehicleCurrentPage.value = page;
  if (
    selectedRescueVehicleId.value != null &&
    !rescueVehiclePagedItems.value.some((item) => item.id === selectedRescueVehicleId.value)
  ) {
    selectedRescueVehicleId.value = null;
  }
  syncRescueVehicleMapFocus();
}

export function searchRescueVehicle() {
  rescueVehicleCurrentPage.value = 1;
  selectedRescueVehicleId.value = null;
  syncRescueVehicleMapFocus();
}

export function resetRescueVehicleSearch() {
  rescueVehiclePlateKeyword.value = '';
  rescueVehicleTypeFilter.value = '全部类型';
  rescueVehicleSquadronFilter.value = '全部中队';
  searchRescueVehicle();
}

export function openRescueVehicleView() {
  rescueVehicleViewActive.value = true;
  rescueVehicleCurrentPage.value = 1;
  rescueVehiclePlateKeyword.value = '';
  rescueVehicleTypeFilter.value = '全部类型';
  rescueVehicleSquadronFilter.value = '全部中队';
  selectedRescueVehicleId.value = null;
  runRescueMapFocus(vehicleMarkers());
}

export function closeRescueVehicleView() {
  rescueVehicleViewActive.value = false;
  rescueVehicleCurrentPage.value = 1;
  selectedRescueVehicleId.value = null;
  restoreRescueMapView();
}

export function selectRescueVehicle(id: number) {
  selectedRescueVehicleId.value = id;
  syncRescueVehicleMapFocus();
}
