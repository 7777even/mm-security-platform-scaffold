<script setup lang="ts">
import PanelCard from '../../common/PanelCard.vue';
import VideoOverviewPanel from './VideoOverviewPanel.vue';
import VideoAnalysisPanel from './VideoAnalysisPanel.vue';
import MaintenanceOrderPanel from './MaintenanceOrderPanel.vue';
</script>

<template>
  <PanelCard title="视频监控管理" variant="videoOverview" module="tv" :show-more="false">
    <div class="video-monitoring-management">
      <VideoOverviewPanel />
      <VideoAnalysisPanel />
      <MaintenanceOrderPanel />
    </div>
  </PanelCard>
</template>

<style scoped>
:deep(.panel-card__content) {
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 4px 10px 12px;
  overflow: hidden;
}

.video-monitoring-management {
  display: grid;
  grid-template-rows: 202px 166px 132px;
  gap: 7px;
  height: 100%;
  min-height: 0;
}

/* 二级内容区：保留原内容，弱化重复的外框装饰。 */
:deep(.video-monitoring-management > .panel-card .panel-card__header) {
  height: 29px;
  padding: 0 4px;
  border-bottom: 1px solid rgb(0 156 230 / 20%);
}

:deep(.video-monitoring-management > .panel-card .panel-card__header-bg),
:deep(.video-monitoring-management > .panel-card .panel-card__body-bg),
:deep(.video-monitoring-management > .panel-card .panel-card__bottom),
:deep(.video-monitoring-management > .panel-card .panel-card__icon),
:deep(.video-monitoring-management > .panel-card .panel-card__more) {
  display: none;
}

:deep(.video-monitoring-management > .panel-card .panel-card__title) {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 14px;
  color: #7cdbff;
}

:deep(.video-monitoring-management > .panel-card .panel-card__title::before) {
  content: '';
  width: 3px;
  height: 12px;
  border-radius: 1px;
  background: #00b4ff;
  box-shadow: 0 0 7px rgb(0 180 255 / 70%);
}

:deep(.video-monitoring-management > .panel-card .panel-card__body) {
  margin-top: 0;
}

:deep(.video-monitoring-management > .panel-card .panel-card__content) {
  overflow: hidden;
}
</style>
