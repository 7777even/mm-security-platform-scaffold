import { computed, ref } from 'vue';
// 仅「离线演示」（VITE_USE_DEV_MOCK=true）回落用；live/offline 均不使用。
// live 模式走真实 TvMonitorDetail（fetchTvMonitor），与详情面板 prop 类型对齐。
import { resolveTvVideoMonitorDetail } from '../data/tvMock';
import { fetchTvMonitor, type TvMonitorDetail, type TvMonitorSummary } from '@/services/tv';
import { backendUnavailableWarn, resolveOfflineFetch } from '@/services/backendFallback';

/** 统一右抽屉视图：monitor 单监控点 / list 监控点列表。 */
export type TvVideoDetailView =
  | { type: 'monitor'; monitor: TvMonitorDetail }
  | {
      type: 'list';
      title: string;
      kind: 'all' | 'offline' | 'fault';
      monitors: TvMonitorSummary[];
      /** 可选：按监控分类 code 过滤真实点位（V87 概览下钻到具体分类） */
      category?: string;
    };

const FALLBACK_MONITOR: TvMonitorDetail = {
  id: '',
  name: '',
  online: false,
  integrity: '',
  monitorType: '',
  department: '',
  location: '',
  height: '',
  angle: '',
};

/** 视图栈：list → monitor 下钻时入栈，返回弹栈；空栈即关闭抽屉。 */
const tvVideoDetailStack = ref<TvVideoDetailView[]>([]);

export const tvVideoDetailView = computed(
  () => tvVideoDetailStack.value[tvVideoDetailStack.value.length - 1] ?? null,
);
export const tvVideoDetailOpen = computed(() => tvVideoDetailStack.value.length > 0);

/** 视图稳定 key（Transition 用），保证 list/monitor/alarm 切换时整体过渡而非就地复用。 */
export const tvVideoDetailKey = computed(() => {
  const v = tvVideoDetailView.value;
  if (!v) return 'empty';
  if (v.type === 'monitor') return `m-${v.monitor.id}`;
  return `l-${v.kind}`;
});

async function resolveMonitor(id: string, label: string): Promise<TvMonitorDetail> {
  // 三态：demo 回落本地预设档案；offline 显式报错（全局横幅）+ 空态；live 拉后端，
  // 失败仅告警并置空，不再静默回灌本地假数据。
  const fb = resolveOfflineFetch<TvMonitorDetail | null>(
    'tv',
    '/tv/monitors/{code}',
    // 预设档案结构与真实 TvMonitorDetail 一致，仅作 demo/offline 回落。
    resolveTvVideoMonitorDetail(label, id) as TvMonitorDetail,
    null,
  );
  if (fb.mode !== 'live') return (fb.value as TvMonitorDetail) ?? { ...FALLBACK_MONITOR, id };
  try {
    return await fetchTvMonitor(id);
  } catch {
    backendUnavailableWarn('tv', '/tv/monitors/{code}');
    return { ...FALLBACK_MONITOR, id };
  }
}

/** 打开单监控点详情（基础信息/告警信息/视频回放三 Tab）。 */
export async function openTvVideoDetail(payload: { id: string; label: string }) {
  const monitor = await resolveMonitor(payload.id, payload.label);
  tvVideoDetailStack.value.push({ type: 'monitor', monitor });
}

/** 打开监控点列表（按 kind/category 过滤的真实点位，点某项再下钻单监控点）。省掉中间统计弹窗。 */
export function openTvMonitorList(payload: {
  title: string;
  kind: 'all' | 'offline' | 'fault';
  monitors: TvMonitorSummary[];
  category?: string;
}) {
  tvVideoDetailStack.value.push({ type: 'list', ...payload });
}

/** 返回上一层（list → 由 monitor 弹回列表；其它弹空即关闭）。 */
export function backTvVideoDetail() {
  if (tvVideoDetailStack.value.length > 0) {
    tvVideoDetailStack.value = tvVideoDetailStack.value.slice(0, -1);
  }
}

/** 直接关闭抽屉（清空栈）。 */
export function closeTvVideoDetail() {
  tvVideoDetailStack.value = [];
}
