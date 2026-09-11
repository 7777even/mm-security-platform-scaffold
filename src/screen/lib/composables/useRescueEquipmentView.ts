import { computed, ref } from 'vue';
import {
  fetchRescueEquipment,
  fetchRescueEquipmentDetail,
  type RescueEquipmentItem,
  type RescueEquipmentList,
} from '@/services/rescueResource';
import { backendUnavailableWarn, resolveOfflineFetch } from '@/services/backendFallback';
import { usePlantArea } from './usePlantArea';

const { filterByPlantArea } = usePlantArea();
import { coordsForSquadronPaged } from '../data/rescueMapCoords';
import { restoreRescueMapView, runRescueMapFocus } from './useRescueMapFocus';

export const RESCUE_EQUIPMENT_PAGE_SIZE = 7;

export const rescueEquipmentViewActive = ref(false);
export const selectedRescueEquipmentId = ref<number | null>(null);
export const rescueEquipmentCurrentPage = ref(1);
export const rescueEquipmentKeyword = ref('');
export const rescueEquipmentSquadronFilter = ref('全部中队');

const rescueEquipmentData = ref<RescueEquipmentList>({ squadrons: [], totalSets: 0, items: [] });
const rescueEquipmentItems = computed<RescueEquipmentItem[]>(() => rescueEquipmentData.value.items);

/** 筛选下拉选项（含“全部”哨兵值），由后端返回的中队列表派生。 */
export const rescueEquipmentSquadrons = computed(() => [
  '全部中队',
  ...rescueEquipmentData.value.squadrons,
]);
/** 业务总量（套），由后端台账总数派生。 */
export const rescueEquipmentTotalSets = computed(() => rescueEquipmentData.value.totalSets);

const selectedRescueEquipmentDetail = ref<RescueEquipmentItem | null>(null);
export const selectedRescueEquipment = computed<RescueEquipmentItem | null>(
  () => selectedRescueEquipmentDetail.value,
);

export const rescueEquipmentLoading = ref(false);
export const rescueEquipmentError = ref<string | null>(null);

function findRescueEquipment(id: number | null | undefined): RescueEquipmentItem | null {
  if (!id) return null;
  return rescueEquipmentItems.value.find((item) => item.id === id) ?? null;
}

export const rescueEquipmentFilteredItems = computed(() => {
  const kw = rescueEquipmentKeyword.value.trim();
  return filterByPlantArea(rescueEquipmentItems.value).filter((item) => {
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

/** 空态：未连后端 / 契约不符 / 请求异常时使用，绝不回灌假数据。 */
const EMPTY_RESCUE_EQUIPMENT_LIST: RescueEquipmentList = {
  squadrons: [],
  totalSets: 0,
  items: [],
};

async function loadRescueEquipment() {
  rescueEquipmentLoading.value = true;
  rescueEquipmentError.value = null;
  // 三态：demo（无本地 fixture）→ 空态；未连后端 → 显式报错（全局横幅）+ 空态；live → 真实端点。
  const fb = resolveOfflineFetch<RescueEquipmentList>(
    'rescueResource',
    '/rescue-resources/equipment',
    EMPTY_RESCUE_EQUIPMENT_LIST,
    EMPTY_RESCUE_EQUIPMENT_LIST,
  );
  if (fb.mode !== 'live') {
    rescueEquipmentData.value = { squadrons: [], totalSets: 0, items: [] };
    rescueEquipmentLoading.value = false;
    return;
  }
  try {
    rescueEquipmentData.value = await fetchRescueEquipment();
  } catch (e) {
    rescueEquipmentError.value = e instanceof Error ? e.message : String(e);
    backendUnavailableWarn('rescueResource', '/rescue-resources/equipment');
    rescueEquipmentData.value = { squadrons: [], totalSets: 0, items: [] };
  } finally {
    rescueEquipmentLoading.value = false;
  }
}

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
  const item = findRescueEquipment(id);
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
    selectedRescueEquipmentDetail.value = null;
  }
  syncRescueEquipmentMapFocus();
}

export function searchRescueEquipment() {
  rescueEquipmentCurrentPage.value = 1;
  selectedRescueEquipmentId.value = null;
  selectedRescueEquipmentDetail.value = null;
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
  selectedRescueEquipmentDetail.value = null;
  void loadRescueEquipment().then(() => runRescueMapFocus(equipmentMarkers()));
}

export function closeRescueEquipmentView() {
  rescueEquipmentViewActive.value = false;
  rescueEquipmentCurrentPage.value = 1;
  selectedRescueEquipmentId.value = null;
  selectedRescueEquipmentDetail.value = null;
  restoreRescueMapView();
}

export function selectRescueEquipment(id: number) {
  selectedRescueEquipmentId.value = id;
  // 先用列表项即时回填（列表项已含完整字段），再由详情接口刷新，保证子集合最新。
  selectedRescueEquipmentDetail.value = findRescueEquipment(id);
  syncRescueEquipmentMapFocus();
  if (id != null) {
    fetchRescueEquipmentDetail(id)
      .then((detail) => {
        if (selectedRescueEquipmentId.value === id) selectedRescueEquipmentDetail.value = detail;
      })
      .catch(() => {});
  }
}
