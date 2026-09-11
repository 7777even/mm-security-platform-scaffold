import { computed, ref } from 'vue';
import {
  fetchFireBrigades,
  type FireBrigadeList,
  type FireBrigadeTeam,
} from '@/services/rescueResource';
import {
  REASON_CONTRACT_MISMATCH,
  backendUnavailableWarn,
  resolveOfflineFetch,
} from '@/services/backendFallback';
import { usePlantArea } from './usePlantArea';

const { filterByPlantArea } = usePlantArea();
import { coordsForFireBrigadeTeam } from '../data/rescueMapCoords';
// 仅「离线演示」（VITE_USE_DEV_MOCK=true）回落用；live/offline 均不使用。
import { fireBrigadeTeams } from '../data/fireBrigadeMock';
import { restoreRescueMapView, runRescueMapFocus } from './useRescueMapFocus';

export const FIRE_BRIGADE_PAGE_SIZE = 5;

export const fireBrigadeViewActive = ref(false);
export const selectedFireBrigadeId = ref<number | null>(null);
export const fireBrigadeCurrentPage = ref(1);
export const fireBrigadeKeyword = ref('');
export const fireBrigadeAreaFilter = ref('全部区域');

/** 空态：未连后端（offline）或后端结构异常时使用，绝不回灌假数据。 */
const EMPTY_FIRE_BRIGADE_LIST: FireBrigadeList = { areas: [], items: [] };

// 初始态为空：连后端时 openFireBrigadeView 触发 load 拉取；离线演示（VITE_USE_DEV_MOCK=true）才回落
// 本地 fixture；未连后端则显式报错（全局横幅）+ 空态，不回灌假数据。
const fireBrigadeData = ref<FireBrigadeList>({ areas: [], items: [] });
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
  const fb = resolveOfflineFetch<FireBrigadeList>(
    'rescueResource',
    '/rescue-resources/brigades',
    { areas: [], items: fireBrigadeTeams },
    EMPTY_FIRE_BRIGADE_LIST,
  );
  if (fb.mode !== 'live') {
    fireBrigadeData.value = { areas: [...fb.value.areas], items: [...fb.value.items] };
    fireBrigadeLoading.value = false;
    return;
  }
  try {
    const raw = await fetchFireBrigades();
    if (!raw || !Array.isArray(raw.items)) {
      // 后端结构异常：显式报错 + 空态，不再回灌本地数据。
      backendUnavailableWarn(
        'rescueResource',
        '/rescue-resources/brigades',
        REASON_CONTRACT_MISMATCH,
      );
      fireBrigadeData.value = EMPTY_FIRE_BRIGADE_LIST;
      return;
    }
    fireBrigadeData.value = raw;
  } catch (e) {
    fireBrigadeError.value = e instanceof Error ? e.message : String(e);
    backendUnavailableWarn('rescueResource', '/rescue-resources/brigades');
    fireBrigadeData.value = EMPTY_FIRE_BRIGADE_LIST;
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
