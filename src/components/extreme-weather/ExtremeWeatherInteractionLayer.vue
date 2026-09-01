<!--
  ExtremeWeatherInteractionLayer — 极端天气模块二级界面分发层
  悬挂于 src/views/extreme-weather/index.vue。按 useExtremeWeatherInteraction 的 openKind 分发渲染对应二级界面，
  关闭即交还调度层（ia.close）卸载本层内容，不离开当前模块。自身不渲染任何 UI 框架，仅做分发。
    - riskPointDetail → RiskPointDetailDialog
    - satelliteCloud  → SatelliteCloudDialog
    - videoWall       → 复用通用 VideoWallDialog
    - alertList       → AlertListDialog
    - dispatch        → 复用通用 OneKeyDispatchDialog（一键应急调度）
-->
<script setup lang="ts">
import { computed } from 'vue';
import { useExtremeWeatherInteraction } from '@/composables/useExtremeWeatherInteraction';
import {
  weatherDispatchTargets,
  type WeatherRiskPoint,
} from '@/services/map-data/extremeWeatherPanelMock';
import RiskPointDetailDialog from './RiskPointDetailDialog.vue';
import SatelliteCloudDialog from './SatelliteCloudDialog.vue';
import AlertListDialog from './AlertListDialog.vue';
import VideoWallDialog from '@/components/common/VideoWallDialog.vue';
import OneKeyDispatchDialog from '@/components/common/OneKeyDispatchDialog.vue';

const ia = useExtremeWeatherInteraction();
const payload = computed(() => ia.current.value?.payload as WeatherRiskPoint | undefined);
</script>

<template>
  <RiskPointDetailDialog v-if="ia.isOpen('riskPointDetail')" :point="payload" @close="ia.close()" />
  <SatelliteCloudDialog v-else-if="ia.isOpen('satelliteCloud')" @close="ia.close()" />
  <VideoWallDialog
    v-else-if="ia.isOpen('videoWall')"
    title="现场监控墙"
    icon="bell-ringing"
    hint="低洼点位与防洪排涝力量现场视频轮巡"
    @close="ia.close()"
  />
  <AlertListDialog v-else-if="ia.isOpen('alertList')" @close="ia.close()" />
  <OneKeyDispatchDialog
    v-else-if="ia.isOpen('dispatch')"
    kind="broadcast"
    title="一键应急调度"
    :targets="weatherDispatchTargets"
    @close="ia.close()"
  />
</template>
