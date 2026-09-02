<script setup lang="ts">
import { computed } from 'vue';
import PanelCard from '../../common/PanelCard.vue';
import TvSemiGauge from '../../common/TvSemiGauge.vue';
import { videoOperationStats } from '../../../lib/data/tvMock';
import { usePlantArea } from '../../../lib/composables/usePlantArea';

const { scaleAreaCount } = usePlantArea();
const stats = computed(() => ({
  ...videoOperationStats,
  total: scaleAreaCount(videoOperationStats.total),
  offline: scaleAreaCount(videoOperationStats.offline),
  fault: scaleAreaCount(videoOperationStats.fault),
}));
</script>

<template>
  <PanelCard title="视频运行分析" variant="videoAnalysis" module="tv">
    <div class="video-analysis">
      <div class="video-analysis__stats">
        <div class="video-analysis__row video-analysis__row--total">
          <span class="video-analysis__label">视频总数</span>
          <span class="video-analysis__value">{{ stats.total }}</span>
        </div>
        <div class="video-analysis__row">
          <span class="video-analysis__dot video-analysis__dot--offline" />
          <span class="video-analysis__label">离线</span>
          <span class="video-analysis__value video-analysis__value--sm">{{ stats.offline }}</span>
        </div>
        <div class="video-analysis__row">
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
