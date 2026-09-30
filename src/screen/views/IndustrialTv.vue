<script setup lang="ts">
import { watch } from 'vue';
import { useRouter } from 'vue-router';
import DashboardLayout from '../components/layout/DashboardLayout.vue';
import MapPageShell from '../components/map/MapPageShell.vue';
import TvMap from '../components/map/TvMap.vue';
import VideoOverviewPanel from '../components/panels/tv/VideoOverviewPanel.vue';
import VideoAnalysisPanel from '../components/panels/tv/VideoAnalysisPanel.vue';
import MaintenanceOrderPanel from '../components/panels/tv/MaintenanceOrderPanel.vue';
import EventAnalysisPanel from '../components/panels/tv/EventAnalysisPanel.vue';
import VideoMonitorBrowserPanel from '../components/panels/tv/VideoMonitorBrowserPanel.vue';
import ImportantVideoPanel from '../components/panels/tv/ImportantVideoPanel.vue';
import TvSnapshotFeedPanel from '../components/panels/tv/TvSnapshotFeedPanel.vue';
import VideoMonitorDetailPanel from '../components/panels/tv/VideoMonitorDetailPanel.vue';
import VideoMonitorListPanel from '../components/panels/tv/VideoMonitorListPanel.vue';
import {
  openTvVideoDetail,
  backTvVideoDetail,
  tvVideoDetailView,
  tvVideoDetailOpen,
  tvVideoDetailKey,
} from '../lib/composables/useTvVideoDetail';
import { useShellRoute } from '../lib/composables/useShellRoute';

const router = useRouter();
const shellRoute = useShellRoute();
const view = tvVideoDetailView;
const showVideoDetail = tvVideoDetailOpen;

function handleVideoDetailBack() {
  backTvVideoDetail();
}

// 抽屉完全关闭（栈清空）时，若是由 shell `?monitor=` 直接进入的，清理 URL 上的监控查询参数。
watch(tvVideoDetailOpen, (open) => {
  if (open) return;
  const monitor = shellRoute.query.value.monitor;
  const monitorLabel = shellRoute.query.value.monitorLabel;
  if (monitor || monitorLabel) {
    const next = { ...shellRoute.query.value };
    delete next.monitor;
    delete next.monitorLabel;
    void router.replace({ query: next });
  }
});

watch(
  () =>
    [
      shellRoute.name.value,
      shellRoute.query.value.monitor,
      shellRoute.query.value.monitorLabel,
    ] as const,
  ([name, monitor, monitorLabel]) => {
    if (name !== 'tv' || typeof monitor !== 'string' || !monitor) return;
    void openTvVideoDetail({
      id: monitor,
      label: typeof monitorLabel === 'string' ? monitorLabel : '现场监控',
    });
  },
  { immediate: true },
);
</script>

<template>
  <MapPageShell min-width="1920px">
    <template #map>
      <TvMap />
    </template>

    <DashboardLayout module="tv" active-nav="tv" class="industrial-tv__layout">
      <aside class="sidebar sidebar--left">
        <VideoOverviewPanel />
        <VideoAnalysisPanel />
        <MaintenanceOrderPanel />
        <EventAnalysisPanel />
        <VideoMonitorBrowserPanel />
      </aside>

      <aside class="sidebar sidebar--right" :class="{ 'sidebar--right--hidden': showVideoDetail }">
        <ImportantVideoPanel />
        <TvSnapshotFeedPanel />
      </aside>

      <aside class="video-detail-drawer" :class="{ 'video-detail-drawer--open': showVideoDetail }">
        <Transition name="video-detail-switch" mode="out-in">
          <VideoMonitorListPanel
            v-if="view && view.type === 'list'"
            :key="tvVideoDetailKey"
            :view="view"
            @back="handleVideoDetailBack"
          />
          <VideoMonitorDetailPanel
            v-else-if="view && view.type === 'monitor'"
            :key="tvVideoDetailKey"
            :monitor="view.monitor"
            @back="handleVideoDetailBack"
          />
        </Transition>
      </aside>
    </DashboardLayout>
  </MapPageShell>
</template>

<style scoped>
.industrial-tv__layout :deep(.dashboard-layout__main) {
  position: relative;
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 14px 38px 13px 19px;
  min-height: 0;
  height: 0;
  pointer-events: none;
}

.sidebar {
  display: grid;
  min-height: 0;
  pointer-events: auto;
  flex-shrink: 0;
}

.sidebar--left {
  width: 419px;

  /* 确定高度：父级 main 为 align-items:flex-start，无高度时 fr 行退化为按内容取高，
     五面板总高会溢出视口（故障/离线行被压到页脚之下不可点）。 */
  height: 100%;

  /* 扁平五面板（与其他模块左栏「一摞标准 PanelCard」同构）：
     前三行权重沿用原「视频监控管理」包裹卡内三段的行高（202/166/132）+ 标准头 42.5px 的增量，
     后两行沿用原 0.9fr 折算高度（245）。矮视口下按比例压缩；不足时侧栏自身滚动兜底
     （同 SecurityAntiTerror 左栏先例）。 */
  grid-template-rows: minmax(0, 215fr) minmax(0, 180fr) minmax(0, 146fr) minmax(0, 245fr) minmax(
      0,
      245fr
    );
  gap: 7px;
  overflow: hidden auto;
}

.sidebar--right {
  width: 419px;
  grid-template-rows: minmax(0, 1.4fr) minmax(0, 1fr);
  height: 100%;
  transition:
    transform 0.38s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.28s ease;
}

.sidebar--right--hidden {
  transform: translateX(calc(100% + 24px));
  opacity: 0;
  pointer-events: none;
}

.video-detail-drawer {
  position: absolute;
  top: 14px;
  right: 38px;
  z-index: var(--z-chrome);
  transform: translateX(calc(100% + 40px));
  opacity: 0;
  pointer-events: none;
  transition:
    transform 0.42s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.32s ease;
}

.video-detail-drawer--open {
  transform: translateX(0);
  opacity: 1;
  pointer-events: auto;
}

.video-detail-switch-enter-active,
.video-detail-switch-leave-active {
  transition:
    opacity 0.32s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.36s cubic-bezier(0.22, 1, 0.36, 1);
}

.video-detail-switch-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.video-detail-switch-leave-to {
  opacity: 0;
  transform: translateX(-16px);
}

.sidebar > :deep(.panel-card) {
  height: 100%;
  min-height: 0;
}
</style>
