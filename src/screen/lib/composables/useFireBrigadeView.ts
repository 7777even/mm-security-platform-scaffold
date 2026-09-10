import { computed, ref } from 'vue';
import {
  fetchFireBrigades,
  type FireBrigadeList,
  type FireBrigadeTeam,
} from '@/services/rescueResource';
import { usePlantArea } from './usePlantArea';

const { filterByPlantArea } = usePlantArea();
import { coordsForFireBrigadeTeam } from '../data/rescueMapCoords';
import { fireBrigadeTeams } from '../data/fireBrigadeMock';
import { restoreRescueMapView, runRescueMapFocus } from './useRescueMapFocus';

export const FIRE_BRIGADE_PAGE_SIZE = 5;

export const fireBrigadeViewActive = ref(false);
export const selectedFireBrigadeId = ref<number | null>(null);
export const fireBrigadeCurrentPage = ref(1);
export const fireBrigadeKeyword = ref('');
export const fireBrigadeAreaFilter = ref('全部区域');

// 初始态预填本地 fixture（fireBrigadeMock），避免空态；openFireBrigadeView 触发后端 load 后整体替换。
const fireBrigadeData = ref<FireBrigadeList>({ areas: [], items: fireBrigadeTeams });
export const fireBrigadeItems = computed<FireBrigadeTeam[]>(() => fireBrigadeData.value.items);

/** 筛选下拉选项（含“全部”哨兵值），由后端返回的区域列表派生。 */
export const fireBrigadeAreas = computed(() => ['全部区域', ...fireBrigadeData.value.areas]);

export const selectedFireBrigade = computed<FireBrigadeTeam | null>(() =>
  findFireBrigade(selectedFireBrigadeId.value),
);

export const fireBrigadeLoading = ref(false);
export const fireBrigadeError = ref<string | null>(null);

function findFireBrigade(id: number | null | undefined): FireBrigadeTeam | null {
  if (!id) return null;
  return fireBrigadeItems.value.find((team) => team.id === id) ?? null;
}

export const fireBrigadeFilteredTeams = computed(() => {
  const kw = fireBrigadeKeyword.value.trim().toLowerCase();
  return filterByPlantArea(fireBrigadeItems.value).filter((team) => {
    const matchKeyword =
      !kw ||
      team.name.toLowerCase().includes(kw) ||
      (team.leaderName ?? '').toLowerCase().includes(kw);
    const matchArea =
      fireBrigadeAreaFilter.value === '全部区域' || team.area === fireBrigadeAreaFilter.value;
    return matchKeyword && matchArea;
  });
});

export const fireBrigadeTotalPages = computed(() =>
  Math.max(1, Math.ceil(fireBrigadeFilteredTeams.value.length / FIRE_BRIGADE_PAGE_SIZE)),
);

export const fireBrigadePagedTeams = computed(() => {
  const start = (fireBrigadeCurrentPage.value - 1) * FIRE_BRIGADE_PAGE_SIZE;
  return fireBrigadeFilteredTeams.value.slice(start, start + FIRE_BRIGADE_PAGE_SIZE);
});

async function loadFireBrigades() {
  fireBrigadeLoading.value = true;
  fireBrigadeError.value = null;
  try {
    const raw = await fetchFireBrigades();
    const items = (raw as { items?: unknown }).items;
    if (!raw || !Array.isArray(items)) {
      // 后端返回结构异常：保留本地 fixture，绝不覆盖为清空状态。
      console.warn(
        '[useFireBrigadeView] /rescue-resources/brigades 返回结构异常，保留本地 fixture',
      );
      return;
    }
    fireBrigadeData.value = raw;
  } catch (e) {
    fireBrigadeError.value = e instanceof Error ? e.message : String(e);
  } finally {
    fireBrigadeLoading.value = false;
  }
}

function brigadeMarkers() {
  const page = fireBrigadeCurrentPage.value;
  const teams = fireBrigadePagedTeams.value;
  return teams.map((team, index) => coordsForFireBrigadeTeam(team, index, teams.length, page));
}

function focusForTeam(id: number | null) {
  if (!id) return null;
  const teams = fireBrigadePagedTeams.value;
  const index = teams.findIndex((team) => team.id === id);
  const team = findFireBrigade(id);
  if (!team || index < 0) return null;
  return coordsForFireBrigadeTeam(team, index, teams.length, fireBrigadeCurrentPage.value);
}

function syncFireBrigadeMapFocus() {
  runRescueMapFocus(brigadeMarkers(), focusForTeam(selectedFireBrigadeId.value));
}

export function goToFireBrigadePage(page: number) {
  if (page < 1 || page > fireBrigadeTotalPages.value) return;
  fireBrigadeCurrentPage.value = page;
  if (
    selectedFireBrigadeId.value != null &&
    !fireBrigadePagedTeams.value.some((team) => team.id === selectedFireBrigadeId.value)
  ) {
    selectedFireBrigadeId.value = null;
  }
  syncFireBrigadeMapFocus();
}

export function searchFireBrigade() {
  fireBrigadeCurrentPage.value = 1;
  selectedFireBrigadeId.value = null;
  syncFireBrigadeMapFocus();
}

export function resetFireBrigadeSearch() {
  fireBrigadeKeyword.value = '';
  fireBrigadeAreaFilter.value = '全部区域';
  searchFireBrigade();
}

export function openFireBrigadeView() {
  fireBrigadeViewActive.value = true;
  fireBrigadeCurrentPage.value = 1;
  fireBrigadeKeyword.value = '';
  fireBrigadeAreaFilter.value = '全部区域';
  selectedFireBrigadeId.value = null;
  void loadFireBrigades().then(() => runRescueMapFocus(brigadeMarkers()));
}

export function closeFireBrigadeView() {
  fireBrigadeViewActive.value = false;
  fireBrigadeCurrentPage.value = 1;
  selectedFireBrigadeId.value = null;
  restoreRescueMapView();
}

export function selectFireBrigade(id: number) {
  selectedFireBrigadeId.value = id;
  syncFireBrigadeMapFocus();
}
