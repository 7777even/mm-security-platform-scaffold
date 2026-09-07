import { computed, ref, watch } from 'vue';
import { patrolCameraPageSize, patrolCameras } from '@/services/security';
import router from '../../../router';
import { prepareAutoFillCameras } from '../../components/video-wall/videoWallStore';
import { usePlantArea } from './usePlantArea';

const { filterByPlantArea } = usePlantArea();

export const patrolCameraListViewActive = ref(false);

export const patrolCameraDrawerActive = computed(() => patrolCameraListViewActive.value);

export const patrolCameraCurrentPage = ref(1);

export const patrolCameraSearchKeyword = ref('');

export const patrolCameraFilteredItems = computed(() => {
  const keyword = patrolCameraSearchKeyword.value.trim().toLowerCase();
  const base = filterByPlantArea(patrolCameras);
  if (!keyword) return base;
  return base.filter(
    (item) =>
      item.name.toLowerCase().includes(keyword) || item.zone.toLowerCase().includes(keyword),
  );
});

export const patrolCameraTotalPages = computed(() =>
  Math.max(1, Math.ceil(patrolCameraFilteredItems.value.length / patrolCameraPageSize)),
);

export const patrolCameraPagedItems = computed(() => {
  const start = (patrolCameraCurrentPage.value - 1) * patrolCameraPageSize;
  return patrolCameraFilteredItems.value.slice(start, start + patrolCameraPageSize);
});

export const patrolCameraVisiblePages = computed(() => {
  const pages: number[] = [];
  for (let i = 1; i <= patrolCameraTotalPages.value; i += 1) pages.push(i);
  return pages;
});

watch(patrolCameraTotalPages, (total) => {
  if (patrolCameraCurrentPage.value > total) patrolCameraCurrentPage.value = total;
});

export function openPatrolCameraListView() {
  patrolCameraListViewActive.value = true;
  patrolCameraCurrentPage.value = 1;
  patrolCameraSearchKeyword.value = '';
}

export function closePatrolCameraListView() {
  patrolCameraListViewActive.value = false;
  patrolCameraSearchKeyword.value = '';
  patrolCameraCurrentPage.value = 1;
}

export function goToPatrolCameraPage(page: number) {
  if (page < 1 || page > patrolCameraTotalPages.value) return;
  patrolCameraCurrentPage.value = page;
}

export function setPatrolCameraSearchKeyword(keyword: string) {
  patrolCameraSearchKeyword.value = keyword;
  patrolCameraCurrentPage.value = 1;
}

export function resetPatrolCameraSearch() {
  patrolCameraSearchKeyword.value = '';
  patrolCameraCurrentPage.value = 1;
}

/** 视频墙巡查：把可播放摄像头填入视频墙网格后跳转，返回时保留列表状态 */
export function openPatrolCameraListVideoWall() {
  const cameras = filterByPlantArea(patrolCameras).filter((item) => item.status === '正常');
  prepareAutoFillCameras(cameras);
  void router.push({ name: 'tvVideoWall', query: { from: 'security' } });
}

export function usePatrolCameraListView() {
  return {
    patrolCameraListViewActive,
    patrolCameraDrawerActive,
    openPatrolCameraListView,
    closePatrolCameraListView,
    patrolCameraCurrentPage,
    patrolCameraTotalPages,
    patrolCameraPagedItems,
    patrolCameraVisiblePages,
    patrolCameraSearchKeyword,
    patrolCameraFilteredItems,
    setPatrolCameraSearchKeyword,
    resetPatrolCameraSearch,
    goToPatrolCameraPage,
    openPatrolCameraListVideoWall,
  };
}
