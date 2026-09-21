import { computed, ref } from 'vue';
import type { StrengthItem } from '@/services/emergency';

// 「应急救援力量」面板中无专属救援资源浮层的类别（应急专家 / 应急物资 / 应急场所 /
// 医疗机构 / 消防设施）共用一套轻量浮层：左列表（name+meta）+ 右详情 + 地图散点。
// 数据直接由 /emergency/strength 的 items 传入，无需再发请求（与救援资源浮层不同，
// 后者走 /rescue-resources/* 端点）。点位坐标按序号在厂区边界内确定性散布。

export const rescueStrengthViewActive = ref(false);
export const rescueStrengthCategory = ref<string>('');
export const rescueStrengthItems = ref<StrengthItem[]>([]);
export const selectedRescueStrengthIndex = ref<number | null>(null);

export const rescueStrengthTotal = computed(() => rescueStrengthItems.value.length);

export const RESCUE_STRENGTH_PAGE_SIZE = 20;
export const rescueStrengthCurrentPage = ref(1);

export const rescueStrengthTotalPages = computed(() =>
  Math.max(1, Math.ceil(rescueStrengthItems.value.length / RESCUE_STRENGTH_PAGE_SIZE)),
);

export interface PagedStrengthItem {
  item: StrengthItem;
  /** 全局序号（同时作为地图点位的稳定 id） */
  index: number;
}

export const rescueStrengthPagedItems = computed<PagedStrengthItem[]>(() => {
  const start = (rescueStrengthCurrentPage.value - 1) * RESCUE_STRENGTH_PAGE_SIZE;
  return rescueStrengthItems.value
    .slice(start, start + RESCUE_STRENGTH_PAGE_SIZE)
    .map((item, i) => ({ item, index: start + i }));
});

export const selectedRescueStrengthItem = computed<StrengthItem | null>(() => {
  if (selectedRescueStrengthIndex.value == null) return null;
  return rescueStrengthItems.value[selectedRescueStrengthIndex.value] ?? null;
});

export function openRescueStrengthView(category: string, items: StrengthItem[] | null) {
  rescueStrengthViewActive.value = true;
  rescueStrengthCategory.value = category;
  rescueStrengthItems.value = items ?? [];
  rescueStrengthCurrentPage.value = 1;
  selectedRescueStrengthIndex.value = null;
}

export function closeRescueStrengthView() {
  rescueStrengthViewActive.value = false;
  rescueStrengthCategory.value = '';
  rescueStrengthItems.value = [];
  selectedRescueStrengthIndex.value = null;
  rescueStrengthCurrentPage.value = 1;
}

export function selectRescueStrength(index: number) {
  selectedRescueStrengthIndex.value = index;
}

export function goToRescueStrengthPage(page: number) {
  if (page < 1 || page > rescueStrengthTotalPages.value) return;
  rescueStrengthCurrentPage.value = page;
  const sel = selectedRescueStrengthIndex.value;
  if (sel != null && Math.floor(sel / RESCUE_STRENGTH_PAGE_SIZE) + 1 !== page) {
    selectedRescueStrengthIndex.value = null;
  }
}
