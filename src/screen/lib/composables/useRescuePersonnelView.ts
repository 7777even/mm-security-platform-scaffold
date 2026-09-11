import { computed, ref } from 'vue';
import {
  fetchRescuePersonnel,
  fetchRescuePersonnelDetail,
  type RescuePersonnelItem,
  type RescuePersonnelList,
} from '@/services/rescueResource';
import { backendUnavailableWarn, resolveOfflineFetch } from '@/services/backendFallback';
import { usePlantArea } from './usePlantArea';

const { filterByPlantArea } = usePlantArea();
import { coordsForSquadronPaged } from '../data/rescueMapCoords';
import { restoreRescueMapView, runRescueMapFocus } from './useRescueMapFocus';

export const RESCUE_PERSONNEL_PAGE_SIZE = 10;

export const rescuePersonnelViewActive = ref(false);
export const selectedRescuePersonnelId = ref<number | null>(null);
export const rescuePersonnelCurrentPage = ref(1);
export const rescuePersonnelKeyword = ref('');
export const rescuePersonnelRoleFilter = ref('全部岗位');
export const rescuePersonnelSquadronFilter = ref('全部中队');

const rescuePersonnelData = ref<RescuePersonnelList>({
  squadrons: [],
  roles: [],
  totalCount: 0,
  items: [],
});
const rescuePersonnelItems = computed<RescuePersonnelItem[]>(() => rescuePersonnelData.value.items);

/** 筛选下拉选项（含“全部”哨兵值），由后端返回的角色/中队列表派生。 */
export const rescuePersonnelRoles = computed(() => [
  '全部岗位',
  ...rescuePersonnelData.value.roles,
]);
export const rescuePersonnelSquadrons = computed(() => [
  '全部中队',
  ...rescuePersonnelData.value.squadrons,
]);
/** 业务总量（人），由后端台账总数派生。 */
export const rescuePersonnelTotalCount = computed(() => rescuePersonnelData.value.totalCount);

const selectedRescuePersonnelDetail = ref<RescuePersonnelItem | null>(null);
export const selectedRescuePersonnel = computed<RescuePersonnelItem | null>(
  () => selectedRescuePersonnelDetail.value,
);

export const rescuePersonnelLoading = ref(false);
export const rescuePersonnelError = ref<string | null>(null);

function findRescuePersonnel(id: number | null | undefined): RescuePersonnelItem | null {
  if (!id) return null;
  return rescuePersonnelItems.value.find((item) => item.id === id) ?? null;
}

export const rescuePersonnelFilteredItems = computed(() => {
  const kw = rescuePersonnelKeyword.value.trim();
  return filterByPlantArea(rescuePersonnelItems.value).filter((item) => {
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

/** 空态：未连后端 / 契约不符 / 请求异常时使用，绝不回灌假数据。 */
const EMPTY_RESCUE_PERSONNEL_LIST: RescuePersonnelList = {
  squadrons: [],
  roles: [],
  totalCount: 0,
  items: [],
};

async function loadRescuePersonnel() {
  rescuePersonnelLoading.value = true;
  rescuePersonnelError.value = null;
  // 三态：demo（无本地 fixture）→ 空态；未连后端 → 显式报错（全局横幅）+ 空态；live → 真实端点。
  const fb = resolveOfflineFetch<RescuePersonnelList>(
    'rescueResource',
    '/rescue-resources/personnel',
    EMPTY_RESCUE_PERSONNEL_LIST,
    EMPTY_RESCUE_PERSONNEL_LIST,
  );
  if (fb.mode !== 'live') {
    rescuePersonnelData.value = { squadrons: [], roles: [], totalCount: 0, items: [] };
    rescuePersonnelLoading.value = false;
    return;
  }
  try {
    rescuePersonnelData.value = await fetchRescuePersonnel();
  } catch (e) {
    rescuePersonnelError.value = e instanceof Error ? e.message : String(e);
    backendUnavailableWarn('rescueResource', '/rescue-resources/personnel');
    rescuePersonnelData.value = { squadrons: [], roles: [], totalCount: 0, items: [] };
  } finally {
    rescuePersonnelLoading.value = false;
  }
}

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
  const item = findRescuePersonnel(id);
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
  selectedRescuePersonnelDetail.value = findRescuePersonnel(id);
  syncRescuePersonnelMapFocus();
  if (id != null) {
    fetchRescuePersonnelDetail(id)
      .then((detail) => {
        if (selectedRescuePersonnelId.value === id) selectedRescuePersonnelDetail.value = detail;
      })
      .catch(() => {});
  }
}

export function goToRescuePersonnelPage(page: number) {
  if (page < 1 || page > rescuePersonnelTotalPages.value) return;
  rescuePersonnelCurrentPage.value = page;
  if (
    selectedRescuePersonnelId.value != null &&
    !rescuePersonnelPagedItems.value.some((item) => item.id === selectedRescuePersonnelId.value)
  ) {
    selectedRescuePersonnelId.value = null;
    selectedRescuePersonnelDetail.value = null;
  }
  syncRescuePersonnelMapFocus();
}

export function searchRescuePersonnel() {
  rescuePersonnelCurrentPage.value = 1;
  selectedRescuePersonnelId.value = null;
  selectedRescuePersonnelDetail.value = null;
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
  selectedRescuePersonnelDetail.value = null;
  void loadRescuePersonnel().then(() => runRescueMapFocus(personnelMarkers()));
}

export function closeRescuePersonnelView() {
  rescuePersonnelViewActive.value = false;
  rescuePersonnelCurrentPage.value = 1;
  selectedRescuePersonnelId.value = null;
  selectedRescuePersonnelDetail.value = null;
  restoreRescueMapView();
}
