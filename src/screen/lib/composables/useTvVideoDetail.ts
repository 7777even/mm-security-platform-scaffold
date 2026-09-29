import { ref } from 'vue';
// 仅「离线演示」（VITE_USE_DEV_MOCK=true）回落用；live/offline 均不使用。
// live 模式走真实 TvMonitorDetail（fetchTvMonitor），与详情面板 prop 类型对齐。
import { resolveTvVideoMonitorDetail } from '../data/tvMock';
import { fetchTvMonitor, type TvMonitorDetail } from '@/services/tv';
import { backendUnavailableWarn, resolveOfflineFetch } from '@/services/backendFallback';

export const tvVideoDetailOpen = ref(false);
export const tvVideoDetailMonitor = ref<TvMonitorDetail | null>(null);

export async function openTvVideoDetail(payload: { id: string; label: string }) {
  tvVideoDetailOpen.value = true;
  // 三态：demo 回落本地预设档案；offline 显式报错（全局横幅）+ 空态；live 拉后端，
  // 失败仅告警并置空，不再静默回灌本地假数据。
  const fb = resolveOfflineFetch<TvMonitorDetail | null>(
    'tv',
    '/tv/monitors/{code}',
    // 预设档案结构与真实 TvMonitorDetail 一致，仅作 demo/offline 回落。
    resolveTvVideoMonitorDetail(payload.label, payload.id) as TvMonitorDetail,
    null,
  );
  if (fb.mode !== 'live') {
    tvVideoDetailMonitor.value = fb.value;
    return;
  }
  try {
    tvVideoDetailMonitor.value = await fetchTvMonitor(payload.id);
  } catch {
    backendUnavailableWarn('tv', '/tv/monitors/{code}');
    tvVideoDetailMonitor.value = null;
  }
}

export function closeTvVideoDetail() {
  tvVideoDetailOpen.value = false;
  tvVideoDetailMonitor.value = null;
}
