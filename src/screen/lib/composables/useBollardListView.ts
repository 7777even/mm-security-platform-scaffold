import { computed, ref, watch } from 'vue';
import { bollardPageSize, bollards } from '@/services/security';
import { usePlantArea } from './usePlantArea';

const { filterByPlantArea } = usePlantArea();

export const bollardListOpen = ref(false);
export const bollardCurrentPage = ref(1);
export const bollardSearchKeyword = ref('');

export const bollardDrawerActive = computed(() => bollardListOpen.value);

export const bollardFilteredItems = computed(() => {
  const keyword = bollardSearchKeyword.value.trim().toLowerCase();
  const base = filterByPlantArea(bollards);
  if (!keyword) return base;
  return base.filter(
    (item) =>
      item.name.toLowerCase().includes(keyword) || item.zone.toLowerCase().includes(keyword),
  );
});

export const bollardTotalPages = computed(() =>
  Math.max(1, Math.ceil(bollardFilteredItems.value.length / bollardPageSize)),
);

export const bollardPagedItems = computed(() => {
  const start = (bollardCurrentPage.value - 1) * bollardPageSize;
  return bollardFilteredItems.value.slice(start, start + bollardPageSize);
});

export const bollardVisiblePages = computed(() => {
  const pages: number[] = [];
  for (let i = 1; i <= bollardTotalPages.value; i += 1) pages.push(i);
  return pages;
});

watch(bollardTotalPages, (total) => {
  if (bollardCurrentPage.value > total) bollardCurrentPage.value = total;
});

export function openBollardList() {
  bollardCurrentPage.value = 1;
  bollardSearchKeyword.value = '';
  bollardListOpen.value = true;
}

export function closeBollardList() {
  bollardListOpen.value = false;
  bollardCurrentPage.value = 1;
  bollardSearchKeyword.value = '';
}

export function goToBollardPage(page: number) {
  if (page < 1 || page > bollardTotalPages.value) return;
  bollardCurrentPage.value = page;
}

export function setBollardSearchKeyword(keyword: string) {
  bollardSearchKeyword.value = keyword;
  bollardCurrentPage.value = 1;
}

export function resetBollardSearch() {
  bollardSearchKeyword.value = '';
  bollardCurrentPage.value = 1;
}

export function useBollardListView() {
  return {
    bollardListOpen,
    bollardCurrentPage,
    bollardDrawerActive,
    bollardPagedItems,
    bollardTotalPages,
    bollardVisiblePages,
    bollardSearchKeyword,
    bollardFilteredItems,
    setBollardSearchKeyword,
    resetBollardSearch,
    openBollardList,
    closeBollardList,
    goToBollardPage,
  };
}
