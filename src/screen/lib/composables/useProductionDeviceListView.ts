import { computed, ref } from 'vue';
import {
  fetchProductionDevices,
  getDevicesByCategory,
  productionDevicePageSize,
  type ProductionDeviceItem,
  type ProductionDeviceStatus,
} from '@/services/production';
import { usePlantArea } from './usePlantArea';

const { filterByPlantArea } = usePlantArea();

export const productionDeviceListOpen = ref(false);
export const productionDeviceCategory = ref<string | null>(null);
export const productionDeviceCurrentPage = ref(1);
export const productionDeviceNameFilter = ref('');
export const productionDeviceTypeFilter = ref('全部类型');
export const productionDeviceStatusFilter = ref<'全部状态' | ProductionDeviceStatus>('全部状态');

// 设备清单来自真实后端（/production/devices），客户端仅做展示收窄，不再持有静态副本。
export const productionDeviceAll = ref<ProductionDeviceItem[]>([]);
let loadToken = 0;
export function loadProductionDevices() {
  const token = ++loadToken;
  return fetchProductionDevices({ page: 1, size: 999 })
    .then((page) => {
      if (token === loadToken) productionDeviceAll.value = page.items;
    })
    .catch(() => {
      if (token === loadToken) productionDeviceAll.value = [];
    });
}

const baseItems = computed(() => {
  const cat = productionDeviceCategory.value;
  return filterByPlantArea(getDevicesByCategory(productionDeviceAll.value, cat));
});

export const productionDeviceDrawerActive = computed(() => productionDeviceListOpen.value);

export const productionDeviceFilteredItems = computed(() => {
  const nameKey = productionDeviceNameFilter.value.trim();
  return baseItems.value.filter((item) => {
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
  const types = Array.from(new Set(baseItems.value.map((d) => d.type)));
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

export function openProductionDeviceList(category: string) {
  productionDeviceCategory.value = category;
  resetFilters();
  productionDeviceListOpen.value = true;
  void loadProductionDevices();
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

export type { ProductionDeviceItem };
