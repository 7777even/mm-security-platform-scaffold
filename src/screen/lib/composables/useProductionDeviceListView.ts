import { computed, ref } from 'vue';
import {
  getDevicesByCategory,
  productionDevicePageSize,
  type ProductionDeviceCategory,
  type ProductionDeviceItem,
  type ProductionDeviceStatus,
} from '../data/productionDeviceMock';
import { usePlantArea } from './usePlantArea';

const { filterByPlantArea } = usePlantArea();

export const productionDeviceListOpen = ref(false);
export const productionDeviceCategory = ref<ProductionDeviceCategory | null>(null);
export const productionDeviceCurrentPage = ref(1);
export const productionDeviceNameFilter = ref('');
export const productionDeviceTypeFilter = ref('全部类型');
export const productionDeviceStatusFilter = ref<'全部状态' | ProductionDeviceStatus>('全部状态');

export const productionDeviceDrawerActive = computed(() => productionDeviceListOpen.value);

export const productionDeviceFilteredItems = computed(() => {
  const base = filterByPlantArea(getDevicesByCategory(productionDeviceCategory.value));
  const nameKey = productionDeviceNameFilter.value.trim();
  return base.filter((item) => {
    if (nameKey && !item.name.includes(nameKey)) return false;
    if (
      productionDeviceTypeFilter.value !== '全部类型' &&
      item.type !== productionDeviceTypeFilter.value
    ) {
      return false;
    }
    if (
      productionDeviceStatusFilter.value !== '全部状态' &&
      item.status !== productionDeviceStatusFilter.value
    ) {
      return false;
    }
    return true;
  });
});

export const productionDeviceTypeOptions = computed(() => {
  const base = filterByPlantArea(getDevicesByCategory(productionDeviceCategory.value));
  const types = Array.from(new Set(base.map((d) => d.type)));
  return ['全部类型', ...types];
});

export const productionDeviceTotalPages = computed(() =>
  Math.max(1, Math.ceil(productionDeviceFilteredItems.value.length / productionDevicePageSize)),
);

export const productionDevicePagedItems = computed(() => {
  const start = (productionDeviceCurrentPage.value - 1) * productionDevicePageSize;
  return productionDeviceFilteredItems.value.slice(start, start + productionDevicePageSize);
});

export const productionDeviceVisiblePages = computed(() => {
  const total = productionDeviceTotalPages.value;
  const current = productionDeviceCurrentPage.value;
  const pages: number[] = [];
  const windowSize = 5;
  let start = Math.max(1, current - Math.floor(windowSize / 2));
  const end = Math.min(total, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  for (let i = start; i <= end; i += 1) pages.push(i);
  return pages;
});

function resetFilters() {
  productionDeviceNameFilter.value = '';
  productionDeviceTypeFilter.value = '全部类型';
  productionDeviceStatusFilter.value = '全部状态';
  productionDeviceCurrentPage.value = 1;
}

export function openProductionDeviceList(category: ProductionDeviceCategory) {
  productionDeviceCategory.value = category;
  resetFilters();
  productionDeviceListOpen.value = true;
}

export function closeProductionDeviceList() {
  productionDeviceListOpen.value = false;
  productionDeviceCategory.value = null;
  resetFilters();
}

export function applyProductionDeviceSearch() {
  productionDeviceCurrentPage.value = 1;
}

export function resetProductionDeviceSearch() {
  resetFilters();
}

export function goToProductionDevicePage(page: number) {
  if (page < 1 || page > productionDeviceTotalPages.value) return;
  productionDeviceCurrentPage.value = page;
}

export function useProductionDeviceListView() {
  return {
    productionDeviceListOpen,
    productionDeviceCategory,
    productionDeviceCurrentPage,
    productionDeviceNameFilter,
    productionDeviceTypeFilter,
    productionDeviceStatusFilter,
    productionDeviceDrawerActive,
    productionDeviceFilteredItems,
    productionDeviceTypeOptions,
    productionDevicePagedItems,
    productionDeviceTotalPages,
    productionDeviceVisiblePages,
    openProductionDeviceList,
    closeProductionDeviceList,
    applyProductionDeviceSearch,
    resetProductionDeviceSearch,
    goToProductionDevicePage,
  };
}

export type { ProductionDeviceItem, ProductionDeviceCategory };
