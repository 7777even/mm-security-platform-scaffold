import { computed, ref } from 'vue';
import {
  loadFireBrigades,
  fireBrigadeTeams,
  type FireBrigadeTeam,
} from '@/services/map-data/fireBrigadeMock';
import { usePlantArea } from './usePlantArea';

const { filterByPlantArea } = usePlantArea();

export const allFireBrigadeTeams = ref<FireBrigadeTeam[]>(fireBrigadeTeams);
import { coordsForFireBrigadeTeam } from '@/services/map-data/rescueMapCoords';
import { restoreRescueMapView, runRescueMapFocus } from './useRescueMapFocus';

export const FIRE_BRIGADE_PAGE_SIZE = 5;

export const fireBrigadeViewActive = ref(false);
export const selectedFireBrigadeId = ref<number | null>(null);
export const fireBrigadeCurrentPage = ref(1);
export const fireBrigadeKeyword = ref('');
export const fireBrigadeAreaFilter = ref('全部区域');

export const selectedFireBrigade = computed<FireBrigadeTeam | null>(
  () => allFireBrigadeTeams.value.find((t) => t.id === selectedFireBrigadeId.value) ?? null,
);

export const fireBrigadeFilteredTeams = computed(() => {
  const kw = fireBrigadeKeyword.value.trim().toLowerCase();
  return filterByPlantArea(allFireBrigadeTeams.value).filter((team) => {
    const matchKeyword =
      !kw || team.name.toLowerCase().includes(kw) || team.leaderName.toLowerCase().includes(kw);
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

function brigadeMarkers() {
  const page = fireBrigadeCurrentPage.value;
  const teams = fireBrigadePagedTeams.value;
  return teams.map((team, index) => coordsForFireBrigadeTeam(team, index, teams.length, page));
}

function focusForTeam(id: number | null) {
  if (!id) return null;
  const teams = fireBrigadePagedTeams.value;
  const index = teams.findIndex((team) => team.id === id);
  const team = allFireBrigadeTeams.value.find((t) => t.id === id) ?? null;
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
  runRescueMapFocus(brigadeMarkers());
  void loadFireBrigades().then((items) => {
    allFireBrigadeTeams.value = items;
    syncFireBrigadeMapFocus();
  });
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
