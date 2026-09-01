import { computed, ref } from 'vue';
import { rescuePersonnelItems } from '@/services/map-data/rescuePersonnelMock';
import { usePlantArea } from './usePlantArea';

const { filterByPlantArea } = usePlantArea();
import { coordsForSquadronPaged } from '@/services/map-data/rescueMapCoords';
import { restoreRescueMapView, runRescueMapFocus } from './useRescueMapFocus';

export const RESCUE_PERSONNEL_PAGE_SIZE = 10;

export const rescuePersonnelViewActive = ref(false);
export const selectedRescuePersonnelId = ref<number | null>(null);
export const rescuePersonnelCurrentPage = ref(1);
export const rescuePersonnelKeyword = ref('');
export const rescuePersonnelRoleFilter = ref('全部岗位');
export const rescuePersonnelSquadronFilter = ref('全部中队');

export const rescuePersonnelFilteredItems = computed(() => {
  const kw = rescuePersonnelKeyword.value.trim();
  return filterByPlantArea(rescuePersonnelItems).filter((item) => {
    const matchName = !kw || item.name.includes(kw);
    const matchRole =
      rescuePersonnelRoleFilter.value === '全部岗位' ||
      item.role === rescuePersonnelRoleFilter.value;
    const matchSquadron =
      rescuePersonnelSquadronFilter.value === '全部中队' ||
      item.squadron === rescuePersonnelSquadronFilter.value;
    return matchName && matchRole && matchSquadron;
  });
});

export const rescuePersonnelTotalPages = computed(() =>
  Math.max(1, Math.ceil(rescuePersonnelFilteredItems.value.length / RESCUE_PERSONNEL_PAGE_SIZE)),
);

export const rescuePersonnelPagedItems = computed(() => {
  const start = (rescuePersonnelCurrentPage.value - 1) * RESCUE_PERSONNEL_PAGE_SIZE;
  return rescuePersonnelFilteredItems.value.slice(start, start + RESCUE_PERSONNEL_PAGE_SIZE);
});

function personnelMarkers() {
  const page = rescuePersonnelCurrentPage.value;
  const items = rescuePersonnelPagedItems.value;
  return items.map((item, index) =>
    coordsForSquadronPaged(item.squadron, item.id, index, items.length, page),
  );
}

function focusForPersonnel(id: number | null) {
  const items = rescuePersonnelPagedItems.value;
  const index = items.findIndex((item) => item.id === id);
  const item = items[index];
  if (!item || index < 0) return null;
  return coordsForSquadronPaged(
    item.squadron,
    item.id,
    index,
    items.length,
    rescuePersonnelCurrentPage.value,
  );
}

function syncRescuePersonnelMapFocus() {
  runRescueMapFocus(personnelMarkers(), focusForPersonnel(selectedRescuePersonnelId.value));
}

export function selectRescuePersonnel(id: number) {
  selectedRescuePersonnelId.value = id;
  syncRescuePersonnelMapFocus();
}

export function goToRescuePersonnelPage(page: number) {
  if (page < 1 || page > rescuePersonnelTotalPages.value) return;
  rescuePersonnelCurrentPage.value = page;
  if (
    selectedRescuePersonnelId.value != null &&
    !rescuePersonnelPagedItems.value.some((item) => item.id === selectedRescuePersonnelId.value)
  ) {
    selectedRescuePersonnelId.value = null;
  }
  syncRescuePersonnelMapFocus();
}

export function searchRescuePersonnel() {
  rescuePersonnelCurrentPage.value = 1;
  selectedRescuePersonnelId.value = null;
  syncRescuePersonnelMapFocus();
}

export function resetRescuePersonnelSearch() {
  rescuePersonnelKeyword.value = '';
  rescuePersonnelRoleFilter.value = '全部岗位';
  rescuePersonnelSquadronFilter.value = '全部中队';
  searchRescuePersonnel();
}

export function openRescuePersonnelView() {
  rescuePersonnelViewActive.value = true;
  rescuePersonnelCurrentPage.value = 1;
  rescuePersonnelKeyword.value = '';
  rescuePersonnelRoleFilter.value = '全部岗位';
  rescuePersonnelSquadronFilter.value = '全部中队';
  selectedRescuePersonnelId.value = null;
  runRescueMapFocus(personnelMarkers());
}

export function closeRescuePersonnelView() {
  rescuePersonnelViewActive.value = false;
  rescuePersonnelCurrentPage.value = 1;
  selectedRescuePersonnelId.value = null;
  restoreRescueMapView();
}
