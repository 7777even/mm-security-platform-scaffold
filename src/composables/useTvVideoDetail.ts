import { ref } from 'vue';
import { resolveTvVideoMonitorDetail, type TvVideoMonitorDetail } from '@/services/map-data/tvMock';

export const tvVideoDetailOpen = ref(false);
export const tvVideoDetailMonitor = ref<TvVideoMonitorDetail | null>(null);

export function openTvVideoDetail(payload: { id: string; label: string }) {
  tvVideoDetailMonitor.value = resolveTvVideoMonitorDetail(payload.label, payload.id);
  tvVideoDetailOpen.value = true;
}

export function closeTvVideoDetail() {
  tvVideoDetailOpen.value = false;
  tvVideoDetailMonitor.value = null;
}
