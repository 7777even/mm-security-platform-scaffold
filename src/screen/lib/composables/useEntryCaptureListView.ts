import { computed, ref, watch } from 'vue';
import {
  ENTRY_CAPTURE_PAGE_SIZE,
  entryCaptureItems,
  type EntryCaptureMode,
} from '../data/entryCaptureMock';
import { usePlantArea } from './usePlantArea';

const { filterByPlantArea } = usePlantArea();

export const entryCaptureListOpen = ref(false);
export const entryCaptureMode = ref<EntryCaptureMode>('person');
export const entryCaptureCurrentPage = ref(1);
export const entryCaptureKeyword = ref('');
export const entryCaptureTimeRange = ref('');

export const entryCaptureDrawerActive = computed(() => entryCaptureListOpen.value);

export const entryCaptureFilteredItems = computed(() => {
  const keyword = entryCaptureKeyword.value.trim().toLowerCase();
  const timeRange = entryCaptureTimeRange.value.trim();
  return filterByPlantArea(entryCaptureItems).filter((item) => {
    if (item.mode !== entryCaptureMode.value) return false;
    if (keyword && !item.title.toLowerCase().includes(keyword)) return false;
    if (timeRange && !item.time.includes(timeRange)) return false;
    return true;
  });
});

export const entryCaptureTotalPages = computed(() =>
  Math.max(1, Math.ceil(entryCaptureFilteredItems.value.length / ENTRY_CAPTURE_PAGE_SIZE)),
);

export const entryCapturePagedItems = computed(() => {
  const start = (entryCaptureCurrentPage.value - 1) * ENTRY_CAPTURE_PAGE_SIZE;
  return entryCaptureFilteredItems.value.slice(start, start + ENTRY_CAPTURE_PAGE_SIZE);
});

export const entryCaptureVisiblePages = computed(() => {
  const pages: number[] = [];
  for (let i = 1; i <= entryCaptureTotalPages.value; i += 1) pages.push(i);
  return pages;
});

watch(entryCaptureTotalPages, (total) => {
  if (entryCaptureCurrentPage.value > total) entryCaptureCurrentPage.value = total;
});

export function openEntryCaptureList(mode: EntryCaptureMode) {
  entryCaptureMode.value = mode;
  entryCaptureCurrentPage.value = 1;
  entryCaptureKeyword.value = '';
  entryCaptureTimeRange.value = '';
  entryCaptureListOpen.value = true;
}

export function closeEntryCaptureList() {
  entryCaptureListOpen.value = false;
  entryCaptureCurrentPage.value = 1;
  entryCaptureKeyword.value = '';
  entryCaptureTimeRange.value = '';
}

export function goToEntryCapturePage(page: number) {
  if (page < 1 || page > entryCaptureTotalPages.value) return;
  entryCaptureCurrentPage.value = page;
}

export function searchEntryCapture() {
  entryCaptureCurrentPage.value = 1;
}

export function resetEntryCaptureSearch() {
  entryCaptureKeyword.value = '';
  entryCaptureTimeRange.value = '';
  entryCaptureCurrentPage.value = 1;
}

export function useEntryCaptureListView() {
  return {
    entryCaptureListOpen,
    entryCaptureMode,
    entryCaptureCurrentPage,
    entryCaptureDrawerActive,
    entryCapturePagedItems,
    entryCaptureVisiblePages,
    entryCaptureTotalPages,
    entryCaptureKeyword,
    entryCaptureTimeRange,
    searchEntryCapture,
    resetEntryCaptureSearch,
    openEntryCaptureList,
    closeEntryCaptureList,
    goToEntryCapturePage,
  };
}
