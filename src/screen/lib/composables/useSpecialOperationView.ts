import { computed, ref, watch } from 'vue';
import {
  fetchSpecialOperationDetail,
  fetchSpecialOperations,
  type SpecialOperationItem,
  type SpecialOperationRecord,
} from '@/services/specialOperation';
import { backendUnavailableWarn } from '@/services/backendFallback';
import { coordsForPagedSpread } from '../data/rescueMapCoords';
import {
  fireBrigadeViewActive,
  selectedFireBrigadeId,
  fireBrigadeCurrentPage,
} from './useFireBrigadeView';
import {
  rescueEquipmentViewActive,
  selectedRescueEquipmentId,
  rescueEquipmentCurrentPage,
} from './useRescueEquipmentView';
import { rescuePersonnelViewActive, rescuePersonnelCurrentPage } from './useRescuePersonnelView';
import {
  rescueVehicleViewActive,
  selectedRescueVehicleId,
  rescueVehicleCurrentPage,
} from './useRescueVehicleView';
import { restoreRescueMapView, runRescueMapFocus } from './useRescueMapFocus';

export const SPECIAL_OPERATION_PAGE_SIZE = 10;

/** 筛选下拉选项（UI 常量）；「全部xx」原样下传，由后端按不过滤处理 */
export const specialOperationTypes = [
  '全部类型',
  '动火作业',
  '盲板抽堵',
  '吊装作业',
  '动土作业',
  '受限空间',
  '高处作业',
  '临时用电',
  '断路作业',
] as const;

export const specialOperationAreas = [
  '全部区域',
  '重油加氢装置',
  '乙烯装置区',
  '芳烃装置区',
  '罐区',
  '公用工程区',
  '仓储区',
] as const;

export const specialOperationLevels = ['全部等级', '一级', '二级', '三级'] as const;

export const specialOperationStatuses = [
  '全部状态',
  '已签发',
  '进行中',
  '已完成',
  '已取消',
] as const;

export const specialOperationViewActive = ref(false);
export const selectedSpecialOperationId = ref<number | null>(null);
export const specialOperationCurrentPage = ref(1);
export const specialOperationAreaFilter = ref('全部区域');
export const specialOperationTypeFilter = ref('全部类型');
export const specialOperationLevelFilter = ref('全部等级');
export const specialOperationStatusFilter = ref('全部状态');
export const specialOperationTimeRange = ref('');

/** 当前页作业票（服务端分页 + type/area/level/status 筛选，「全部xx」由后端忽略） */
export const specialOperationItems = ref<SpecialOperationItem[]>([]);
export const specialOperationTotalCount = ref(0);

async function loadSpecialOperations() {
  try {
    const res = await fetchSpecialOperations({
      page: specialOperationCurrentPage.value,
      size: SPECIAL_OPERATION_PAGE_SIZE,
      type: specialOperationTypeFilter.value,
      area: specialOperationAreaFilter.value,
      level: specialOperationLevelFilter.value,
      status: specialOperationStatusFilter.value,
    });
    specialOperationItems.value = res.list;
    specialOperationTotalCount.value = res.total;
  } catch (error) {
    specialOperationItems.value = [];
    specialOperationTotalCount.value = 0;
    const message = error instanceof Error ? error.message : '请求失败';
    backendUnavailableWarn('special-operation', '/special-operations', message);
  }
}

/** 详情（列表项 + 现场视频/气体检测点/作业人员），选中后异步加载 */
export const selectedSpecialOperation = ref<SpecialOperationRecord | null>(null);

watch(selectedSpecialOperationId, async (id) => {
  if (id == null) {
    selectedSpecialOperation.value = null;
    return;
  }
  // 先用列表项标量字段占位，详情子表加载后整体替换
  const listItem = specialOperationItems.value.find((item) => item.id === id);
  selectedSpecialOperation.value = listItem
    ? { ...listItem, videos: [], gasPoints: [], personnel: [] }
    : null;
  try {
    selectedSpecialOperation.value = await fetchSpecialOperationDetail(id);
  } catch (error) {
    const message = error instanceof Error ? error.message : '请求失败';
    backendUnavailableWarn('special-operation', `/special-operations/${id}`, message);
  }
});

/** 作业时间关键词为前端演示过滤：后端契约未提供时间筛选，仅作用于当前页展示 */
export const specialOperationPagedItems = computed(() => {
  const timeKw = specialOperationTimeRange.value.trim();
  if (!timeKw) return specialOperationItems.value;
  return specialOperationItems.value.filter((item) => item.timeRange.includes(timeKw));
});

export const specialOperationTotalPages = computed(() =>
  Math.max(1, Math.ceil(specialOperationTotalCount.value / SPECIAL_OPERATION_PAGE_SIZE)),
);

function coordsForItem(item: SpecialOperationItem, indexInPage: number, itemsOnPage: number) {
  const page = specialOperationCurrentPage.value;
  return coordsForPagedSpread(indexInPage, itemsOnPage, page, item.id);
}

function operationMarkers() {
  const items = specialOperationPagedItems.value;
  return items.map((item, index) => coordsForItem(item, index, items.length));
}

function focusForOperation(id: number | null) {
  const items = specialOperationPagedItems.value;
  const index = items.findIndex((item) => item.id === id);
  const item = index >= 0 ? items[index] : null;
  if (!item || index < 0) return null;
  return coordsForItem(item, index, items.length);
}

function syncSpecialOperationMapFocus() {
  runRescueMapFocus(operationMarkers(), focusForOperation(selectedSpecialOperationId.value));
}

function closeAllRescueViews() {
  fireBrigadeViewActive.value = false;
  selectedFireBrigadeId.value = null;
  fireBrigadeCurrentPage.value = 1;
  rescueEquipmentViewActive.value = false;
  selectedRescueEquipmentId.value = null;
  rescueEquipmentCurrentPage.value = 1;
  rescuePersonnelViewActive.value = false;
  rescuePersonnelCurrentPage.value = 1;
  rescueVehicleViewActive.value = false;
  selectedRescueVehicleId.value = null;
  rescueVehicleCurrentPage.value = 1;
}

export async function openSpecialOperationView(typeLabel?: string) {
  closeAllRescueViews();
  specialOperationViewActive.value = true;
  specialOperationCurrentPage.value = 1;
  specialOperationAreaFilter.value = '全部区域';
  specialOperationTypeFilter.value = typeLabel ?? '全部类型';
  specialOperationLevelFilter.value = '全部等级';
  specialOperationStatusFilter.value = '全部状态';
  specialOperationTimeRange.value = '';
  selectedSpecialOperationId.value = null;
  await loadSpecialOperations();
  syncSpecialOperationMapFocus();
}

export function closeSpecialOperationView() {
  specialOperationViewActive.value = false;
  specialOperationCurrentPage.value = 1;
  selectedSpecialOperationId.value = null;
  restoreRescueMapView();
}

export async function goToSpecialOperationPage(page: number) {
  if (page < 1 || page > specialOperationTotalPages.value) return;
  specialOperationCurrentPage.value = page;
  if (
    selectedSpecialOperationId.value != null &&
    !specialOperationItems.value.some((item) => item.id === selectedSpecialOperationId.value)
  ) {
    selectedSpecialOperationId.value = null;
  }
  await loadSpecialOperations();
  syncSpecialOperationMapFocus();
}

export async function searchSpecialOperation() {
  specialOperationCurrentPage.value = 1;
  selectedSpecialOperationId.value = null;
  await loadSpecialOperations();
  syncSpecialOperationMapFocus();
}

export function resetSpecialOperationSearch() {
  specialOperationAreaFilter.value = '全部区域';
  specialOperationTypeFilter.value = '全部类型';
  specialOperationLevelFilter.value = '全部等级';
  specialOperationStatusFilter.value = '全部状态';
  specialOperationTimeRange.value = '';
  void searchSpecialOperation();
}

export function selectSpecialOperation(id: number) {
  selectedSpecialOperationId.value = id;
  syncSpecialOperationMapFocus();
}
