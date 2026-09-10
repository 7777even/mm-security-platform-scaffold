import { ref } from 'vue';
import { resolveTvVideoMonitorDetail, type TvVideoMonitorDetail } from '../data/tvMock';
import { fetchTvMonitor } from '@/services/tv';

export const tvVideoDetailOpen = ref(false);
export const tvVideoDetailMonitor = ref<TvVideoMonitorDetail | null>(null);

export async function openTvVideoDetail(payload: { id: string; label: string }) {
  tvVideoDetailOpen.value = true;
  try {
    tvVideoDetailMonitor.value = await fetchTvMonitor(payload.id);
  } catch {
    // 后端不可用或点位缺失时回退到本地预设档案，保证面板仍有内容
    tvVideoDetailMonitor.value = resolveTvVideoMonitorDetail(payload.label, payload.id);
  }
}

export function closeTvVideoDetail() {
  tvVideoDetailOpen.value = false;
  tvVideoDetailMonitor.value = null;
}
