import { computed, ref } from 'vue';
import {
  fetchRescueVehicleDetail,
  fetchRescueVehicles,
  type RescueVehicleItem,
  type RescueVehicleList,
} from '@/services/rescueResource';
import { usePlantArea } from './usePlantArea';

const { filterByPlantArea } = usePlantArea();
import { coordsForSquadronPaged } from '../data/rescueMapCoords';
import { restoreRescueMapView, runRescueMapFocus } from './useRescueMapFocus';

export const RESCUE_VEHICLE_PAGE_SIZE = 10;

export const rescueVehicleViewActive = ref(false);
export const selectedRescueVehicleId = ref<number | null>(null);
export const rescueVehicleCurrentPage = ref(1);
export const rescueVehiclePlateKeyword = ref('');
export const rescueVehicleTypeFilter = ref('全部类型');
export const rescueVehicleSquadronFilter = ref('全部中队');

const rescueVehicleData = ref<RescueVehicleList>({ squadrons: [], types: [], items: [] });
const rescueVehicleItems = computed<RescueVehicleItem[]>(() => rescueVehicleData.value.items);

/** 筛选下拉选项（含“全部”哨兵值），由后端返回的中队/类型列表派生。 */
export const rescueVehicleSquadrons = computed(() => [
  '全部中队',
  ...rescueVehicleData.value.squadrons,
]);
export const rescueVehicleTypes = computed(() => ['全部类型', ...rescueVehicleData.value.types]);
/** 业务总量（辆），由后端返回列表长度派生（接口未单列总数）。 */
export const rescueVehicleTotalCount = computed(() => rescueVehicleData.value.items.length);

const selectedRescueVehicleDetail = ref<RescueVehicleItem | null>(null);
export const selectedRescueVehicle = computed<RescueVehicleItem | null>(
  () => selectedRescueVehicleDetail.value,
);

export const rescueVehicleLoading = ref(false);
export const rescueVehicleError = ref<string | null>(null);

/** 车辆状态徽标样式类（纯展示函数，与业务数据解耦）。 */
export function statusBadgeClass(status: string | null): string {
  if (status === '出动') return 'vehicle-status--dispatch';
  if (status === '维修中') return 'vehicle-status--repair';
  return 'vehicle-status--idle';
}

function findRescueVehicle(id: number | null | undefined): RescueVehicleItem | null {
  if (!id) return null;
  return rescueVehicleItems.value.find((item) => item.id === id) ?? null;
}

export const rescueVehicleFilteredItems = computed(() => {
  const kw = rescueVehiclePlateKeyword.value.trim();
  return filterByPlantArea(rescueVehicleItems.value).filter((item) => {
    const matchPlate = !kw || (item.plate ?? '').includes(kw);
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

async function loadRescueVehicles() {
  rescueVehicleLoading.value = true;
  rescueVehicleError.value = null;
  try {
    rescueVehicleData.value = await fetchRescueVehicles();
  } catch (e) {
    rescueVehicleError.value = e instanceof Error ? e.message : String(e);
  } finally {
    rescueVehicleLoading.value = false;
  }
}

function vehicleMarkers() {
  const page = rescueVehicleCurrentPage.value;
  const items = rescueVehiclePagedItems.value;
  return items.map((item, index) =>
    coordsForSquadronPaged(item.squadron ?? '', item.id, index, items.length, page),
  );
}

function focusForVehicle(id: number | null) {
  const items = rescueVehiclePagedItems.value;
  const index = items.findIndex((item) => item.id === id);
  const item = findRescueVehicle(id);
  if (!item || index < 0) return null;
  return coordsForSquadronPaged(
    item.squadron ?? '',
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
    selectedRescueVehicleDetail.value = null;
  }
  syncRescueVehicleMapFocus();
}

export function searchRescueVehicle() {
  rescueVehicleCurrentPage.value = 1;
  selectedRescueVehicleId.value = null;
  selectedRescueVehicleDetail.value = null;
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
  selectedRescueVehicleDetail.value = null;
  void loadRescueVehicles().then(() => runRescueMapFocus(vehicleMarkers()));
}

export function closeRescueVehicleView() {
  rescueVehicleViewActive.value = false;
  rescueVehicleCurrentPage.value = 1;
  selectedRescueVehicleId.value = null;
  selectedRescueVehicleDetail.value = null;
  restoreRescueMapView();
}

export function selectRescueVehicle(id: number) {
  selectedRescueVehicleId.value = id;
  // 先用列表项即时回填（列表项已含 crew/onboardEquipment/consumables/dispatchSummary 等字段），
  // 再由详情接口刷新，保证随车人员/装备等子集合为最新。
  selectedRescueVehicleDetail.value = findRescueVehicle(id);
  syncRescueVehicleMapFocus();
  if (id != null) {
    fetchRescueVehicleDetail(id)
      .then((detail) => {
        if (selectedRescueVehicleId.value === id) selectedRescueVehicleDetail.value = detail;
      })
      .catch(() => {});
  }
}
