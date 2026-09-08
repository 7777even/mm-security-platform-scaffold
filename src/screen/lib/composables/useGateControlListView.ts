import { computed, ref, watch } from 'vue';
import { gateControlPageSize } from '@/services/security';
import { gateControlsData } from './useScreenSecurityData';
import { usePlantArea } from './usePlantArea';

const { filterByPlantArea } = usePlantArea();

export const gateControlListOpen = ref(false);
export const gateControlCurrentPage = ref(1);
export const gateControlSearchKeyword = ref('');

export const gateControlDrawerActive = computed(() => gateControlListOpen.value);

export const gateControlFilteredItems = computed(() => {
  const keyword = gateControlSearchKeyword.value.trim().toLowerCase();
  const base = filterByPlantArea(gateControlsData.value);
  if (!keyword) return base;
  return base.filter(
    (item) =>
      item.name.toLowerCase().includes(keyword) || item.location.toLowerCase().includes(keyword),
  );
});

export const gateControlTotalPages = computed(() =>
  Math.max(1, Math.ceil(gateControlFilteredItems.value.length / gateControlPageSize)),
);

export const gateControlPagedItems = computed(() => {
  const start = (gateControlCurrentPage.value - 1) * gateControlPageSize;
  return gateControlFilteredItems.value.slice(start, start + gateControlPageSize);
});

export const gateControlVisiblePages = computed(() => {
  const pages: number[] = [];
  for (let i = 1; i <= gateControlTotalPages.value; i += 1) pages.push(i);
  return pages;
});

watch(gateControlTotalPages, (total) => {
  if (gateControlCurrentPage.value > total) gateControlCurrentPage.value = total;
});

export function openGateControlList() {
  gateControlCurrentPage.value = 1;
  gateControlSearchKeyword.value = '';
  gateControlListOpen.value = true;
}

export function closeGateControlList() {
  gateControlListOpen.value = false;
  gateControlCurrentPage.value = 1;
  gateControlSearchKeyword.value = '';
}

export function goToGateControlPage(page: number) {
  if (page < 1 || page > gateControlTotalPages.value) return;
  gateControlCurrentPage.value = page;
}

export function setGateControlSearchKeyword(keyword: string) {
  gateControlSearchKeyword.value = keyword;
  gateControlCurrentPage.value = 1;
}

export function resetGateControlSearch() {
  gateControlSearchKeyword.value = '';
  gateControlCurrentPage.value = 1;
}

export function useGateControlListView() {
  return {
    gateControlListOpen,
    gateControlCurrentPage,
    gateControlDrawerActive,
    gateControlPagedItems,
    gateControlTotalPages,
    gateControlVisiblePages,
    gateControlSearchKeyword,
    gateControlFilteredItems,
    setGateControlSearchKeyword,
    resetGateControlSearch,
    openGateControlList,
    closeGateControlList,
    goToGateControlPage,
  };
}
