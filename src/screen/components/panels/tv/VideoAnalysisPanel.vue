<script setup lang="ts">
import { computed, ref } from 'vue';
import PanelCard from '../../common/PanelCard.vue';
import TvSemiGauge from '../../common/TvSemiGauge.vue';
import {
  fetchTvOverview,
  fetchTvMonitors,
  fetchTvMonitor,
  type TvMonitorSummary,
  type TvMonitorDetail,
} from '@/services/tv';
import { openTvMonitorList } from '../../../lib/composables/useTvVideoDetail';
import { useScreenAsyncState } from '../../../lib/composables/useScreenAsyncState';
import { usePlantArea } from '../../../lib/composables/usePlantArea';

const { scaleAreaCount, filterByPlantArea } = usePlantArea();
const { data: overview } = useScreenAsyncState('tv', '/tv/overview', fetchTvOverview);
const stats = computed(() => {
  const operationStats = overview.value?.operationStats;
  return {
    total: scaleAreaCount(operationStats?.total ?? 0),
    offline: scaleAreaCount(operationStats?.offline ?? 0),
    fault: scaleAreaCount(operationStats?.fault ?? 0),
    integrityRate: operationStats?.integrityRate ?? 0,
    onlineRate: operationStats?.onlineRate ?? 0,
  };
});

/* 运行分析：点击「视频总数/离线/故障」行或「更多 ›」→ 直接开右侧抽屉「监控点列表」
   （真实点位，GET /tv/monitors）：
   - 总数/更多 → 全部点位；离线 → online=false（与后端 computeOperationStats 同口径）；
   - 故障 → 逐点取档案（GET /tv/monitors/{code}）后按 integrity≠「良好」过滤（摘要接口无该字段）。
   列表内点某点位再下钻单监控点三 Tab（基础信息/告警信息/视频回放）。省掉中间统计弹窗。 */
type StatKind = 'all' | 'offline' | 'fault';

const monitors = ref<TvMonitorSummary[]>([]);
const detailCache = ref<TvMonitorDetail[] | null>(null);

async function loadMonitors(): Promise<TvMonitorSummary[]> {
  if (monitors.value.length) return monitors.value;
  monitors.value = filterByPlantArea(await fetchTvMonitors());
  return monitors.value;
}

async function loadDetails(list: TvMonitorSummary[]): Promise<TvMonitorDetail[]> {
  if (detailCache.value && detailCache.value.length >= list.length) return detailCache.value;
  detailCache.value = await Promise.all(list.map((m) => fetchTvMonitor(m.code)));
  return detailCache.value;
}

async function openDetail(kind: StatKind) {
  try {
    const list = await loadMonitors();
    if (kind === 'offline') {
      openTvMonitorList({
        title: '离线监控点位',
        kind: 'offline',
        monitors: list.filter((m) => !m.online),
      });
      return;
    }
    if (kind === 'fault') {
      const details = await loadDetails(list);
      openTvMonitorList({
        title: '故障监控点位',
        kind: 'fault',
        monitors: list.filter((m) => {
          const d = details.find((x) => x.id === m.code);
          return d?.integrity != null && d.integrity !== '良好';
        }),
      });
      return;
    }
    openTvMonitorList({ title: '全部监控点位', kind: 'all', monitors: list });
  } catch {
    openTvMonitorList({ title: '全部监控点位', kind: 'all', monitors: [] });
  }
}
</script>

<template>
  <PanelCard
    title="视频运行分析"
    variant="videoAnalysis"
    module="tv"
    show-more
    @more="openDetail('all')"
  >
    <div class="video-analysis">
      <div class="video-analysis__stats">
        <div
          class="video-analysis__row video-analysis__row--total video-analysis__row--clickable"
          role="button"
          tabindex="0"
          @click="openDetail('all')"
          @keydown.enter="openDetail('all')"
        >
          <span class="video-analysis__label">视频总数</span>
          <span class="video-analysis__value">{{ stats.total }}</span>
        </div>
        <div
          class="video-analysis__row video-analysis__row--clickable"
          role="button"
          tabindex="0"
          @click="openDetail('offline')"
          @keydown.enter="openDetail('offline')"
        >
          <span class="video-analysis__dot video-analysis__dot--offline" />
          <span class="video-analysis__label">离线</span>
          <span class="video-analysis__value video-analysis__value--sm">{{ stats.offline }}</span>
        </div>
        <div
          class="video-analysis__row video-analysis__row--clickable"
          role="button"
          tabindex="0"
          @click="openDetail('fault')"
          @keydown.enter="openDetail('fault')"
        >
          <span class="video-analysis__dot video-analysis__dot--fault" />
          <span class="video-analysis__label">故障</span>
          <span class="video-analysis__value video-analysis__value--sm">{{ stats.fault }}</span>
        </div>
      </div>
      <div class="video-analysis__gauges">
        <TvSemiGauge :value="stats.integrityRate" label="完好率" color="#00b4ff" />
        <TvSemiGauge :value="stats.onlineRate" label="在线率" color="#3a9eff" />
      </div>
    </div>
  </PanelCard>
</template>

<style scoped>
:deep(.panel-card__content) {
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 8px 12px 12px;
}

.video-analysis {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  height: 100%;
  align-items: center;
}

.video-analysis__stats {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.video-analysis__row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.video-analysis__row--total .video-analysis__value {
  font-size: 28px;
}

.video-analysis__row--clickable {
  cursor: pointer;
  border-radius: 2px;
  transition: background 0.2s ease;
}

.video-analysis__row--clickable:hover,
.video-analysis__row--clickable:focus-visible {
  background: rgb(0 45 88 / 55%);
  outline: none;
}

.video-analysis__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.video-analysis__dot--offline {
  background: var(--color-text-muted);
}

.video-analysis__dot--fault {
  background: var(--color-danger);
}

.video-analysis__label {
  font-size: 14px;
  color: var(--color-text-strong);
}

.video-analysis__value {
  margin-left: auto;
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-strong);
  font-variant-numeric: tabular-nums;
}

.video-analysis__value--sm {
  font-size: 18px;
}

.video-analysis__gauges {
  display: flex;
  justify-content: center;
  gap: 4px;
  padding-right: 4px;
}
</style>
