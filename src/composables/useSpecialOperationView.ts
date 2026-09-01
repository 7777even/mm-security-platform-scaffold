import { computed, ref } from 'vue';
import {
  getSpecialOperationItem,
  specialOperationItems,
  type SpecialOperationRecord,
} from '@/services/map-data/specialOperationMock';
import { usePlantArea } from './usePlantArea';

const { filterByPlantArea } = usePlantArea();
import { coordsForPagedSpread } from '@/services/map-data/rescueMapCoords';
import {
  fireBrigadeViewActive,
  selectedFireBrigadeId,
  fireBrigadeCurrentPage,
} from './useFireBrigadeView';
import {
  rescueEquipmentViewActive,
  selectedRescueEquipmentId,
  rescueEquipmentCurrentPage,
} from './useRescueEquipmentView';
import { rescuePersonnelViewActive, rescuePersonnelCurrentPage } from './useRescuePersonnelView';
import {
  rescueVehicleViewActive,
  selectedRescueVehicleId,
  rescueVehicleCurrentPage,
} from './useRescueVehicleView';
import { restoreRescueMapView, runRescueMapFocus } from './useRescueMapFocus';

export const SPECIAL_OPERATION_PAGE_SIZE = 10;

export const specialOperationViewActive = ref(false);
export const selectedSpecialOperationId = ref<number | null>(null);
export const specialOperationCurrentPage = ref(1);
export const specialOperationAreaFilter = ref('全部区域');
export const specialOperationTypeFilter = ref('全部类型');
export const specialOperationLevelFilter = ref('全部等级');
export const specialOperationStatusFilter = ref('全部状态');
export const specialOperationTimeRange = ref('');

export const selectedSpecialOperation = computed<SpecialOperationRecord | null>(() =>
  getSpecialOperationItem(selectedSpecialOperationId.value),
);

export const specialOperationFilteredItems = computed(() => {
  const timeKw = specialOperationTimeRange.value.trim();
  return filterByPlantArea(specialOperationItems).filter((item) => {
    const matchArea =
      specialOperationAreaFilter.value === '全部区域' ||
      item.area === specialOperationAreaFilter.value;
    const matchType =
      specialOperationTypeFilter.value === '全部类型' ||
      item.type === specialOperationTypeFilter.value;
    const matchLevel =
      specialOperationLevelFilter.value === '全部等级' ||
      item.level === specialOperationLevelFilter.value;
    const matchStatus =
      specialOperationStatusFilter.value === '全部状态' ||
      item.status === specialOperationStatusFilter.value;
    const matchTime = !timeKw || item.timeRange.includes(timeKw);
    return matchArea && matchType && matchLevel && matchStatus && matchTime;
  });
});

export const specialOperationTotalPages = computed(() =>
  Math.max(1, Math.ceil(specialOperationFilteredItems.value.length / SPECIAL_OPERATION_PAGE_SIZE)),
);

export const specialOperationPagedItems = computed(() => {
  const start = (specialOperationCurrentPage.value - 1) * SPECIAL_OPERATION_PAGE_SIZE;
  return specialOperationFilteredItems.value.slice(start, start + SPECIAL_OPERATION_PAGE_SIZE);
});

function coordsForItem(item: SpecialOperationRecord, indexInPage: number, itemsOnPage: number) {
  const page = specialOperationCurrentPage.value;
  return coordsForPagedSpread(indexInPage, itemsOnPage, page, item.id);
}

function operationMarkers() {
  const items = specialOperationPagedItems.value;
  return items.map((item, index) => coordsForItem(item, index, items.length));
}

function focusForOperation(id: number | null) {
  const items = specialOperationPagedItems.value;
  const index = items.findIndex((item) => item.id === id);
  const item = getSpecialOperationItem(id);
  if (!item || index < 0) return null;
  return coordsForItem(item, index, items.length);
}

function syncSpecialOperationMapFocus() {
  runRescueMapFocus(operationMarkers(), focusForOperation(selectedSpecialOperationId.value));
}

function closeAllRescueViews() {
  fireBrigadeViewActive.value = false;
  selectedFireBrigadeId.value = null;
  fireBrigadeCurrentPage.value = 1;
  rescueEquipmentViewActive.value = false;
  selectedRescueEquipmentId.value = null;
  rescueEquipmentCurrentPage.value = 1;
  rescuePersonnelViewActive.value = false;
  rescuePersonnelCurrentPage.value = 1;
  rescueVehicleViewActive.value = false;
  selectedRescueVehicleId.value = null;
  rescueVehicleCurrentPage.value = 1;
}

export function openSpecialOperationView(typeLabel?: string) {
  closeAllRescueViews();
  specialOperationViewActive.value = true;
  specialOperationCurrentPage.value = 1;
  specialOperationAreaFilter.value = '全部区域';
  specialOperationTypeFilter.value = typeLabel ?? '全部类型';
  specialOperationLevelFilter.value = '全部等级';
  specialOperationStatusFilter.value = '全部状态';
  specialOperationTimeRange.value = '';
  selectedSpecialOperationId.value = null;
  runRescueMapFocus(operationMarkers());
}

export function closeSpecialOperationView() {
  specialOperationViewActive.value = false;
  specialOperationCurrentPage.value = 1;
  selectedSpecialOperationId.value = null;
  restoreRescueMapView();
}

export function goToSpecialOperationPage(page: number) {
  if (page < 1 || page > specialOperationTotalPages.value) return;
  specialOperationCurrentPage.value = page;
  if (
    selectedSpecialOperationId.value != null &&
    !specialOperationPagedItems.value.some((item) => item.id === selectedSpecialOperationId.value)
  ) {
    selectedSpecialOperationId.value = null;
  }
  syncSpecialOperationMapFocus();
}

export function searchSpecialOperation() {
  specialOperationCurrentPage.value = 1;
  selectedSpecialOperationId.value = null;
  syncSpecialOperationMapFocus();
}

export function resetSpecialOperationSearch() {
  specialOperationAreaFilter.value = '全部区域';
  specialOperationTypeFilter.value = '全部类型';
  specialOperationLevelFilter.value = '全部等级';
  specialOperationStatusFilter.value = '全部状态';
  specialOperationTimeRange.value = '';
  searchSpecialOperation();
}

export function selectSpecialOperation(id: number) {
  selectedSpecialOperationId.value = id;
  syncSpecialOperationMapFocus();
}
