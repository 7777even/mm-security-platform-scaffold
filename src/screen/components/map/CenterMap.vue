<script setup lang="ts">
import SpriteImage from '../common/SpriteImage.vue';
import MapLayerPanel from '../common/MapLayerPanel.vue';
import MapCleanModeButton from './MapCleanModeButton.vue';
import FireSituationMarker from './FireSituationMarker.vue';
import { sprites } from '../../utils/spriteConfig';
import { fireAlarmMarker, mapControls } from '../../lib/data/mock';
import { useMapControls } from '../../lib/composables/useMapControls';
import { getSharedMap } from '../../lib/composables/sharedCesiumBridge';
import { findScreenAlarm, refreshScreenAlarms } from '../../lib/composables/useScreenAlarmFeed';
import { rescueDrawerActive } from '../../lib/composables/useRescueDrawerActive';
import { useAlarmDetailPanel } from '../../lib/composables/useAlarmDetailPanel';
import { computed, onMounted } from 'vue';
import { usePlantArea } from '../../lib/composables/usePlantArea';
import { getPlantAreaDefinition } from '../../lib/data/plantAreas';
import { fireSituationMarkers } from '../../lib/data/fireSituationMapMock';
import type { FireSituationMarkerItem } from '../../lib/data/fireSituationMapMock';
import { useRouter } from 'vue-router';
import { fireAlarmToDetail } from '../../lib/data/alarmDetailMock';
import {
  openSpecialOperationView,
  selectSpecialOperation,
} from '../../lib/composables/useSpecialOperationView';

const { onMapControl } = useMapControls();
const { alarmDetailOpen, openAlarmDetail } = useAlarmDetailPanel();
const { selectedPlantArea } = usePlantArea();
const router = useRouter();

const alarmWorldPosition = computed(() => {
  if (selectedPlantArea.value === 'all' || selectedPlantArea.value === 'refinery') {
    return { longitude: fireAlarmMarker.longitude, latitude: fireAlarmMarker.latitude };
  }
  return getPlantAreaDefinition(selectedPlantArea.value).centers[0];
});
const emit = defineEmits<{
  'trigger-sound-light-alarm': [];
}>();

function triggerSoundLightAlarm() {
  // 弹窗出现时同步拉近视角，保证用户能立刻看到厂区内的报警点。
  getSharedMap()?.flyToWorldPositions?.({
    positions: [alarmWorldPosition.value],
    duration: 1.1,
    pitchDeg: -48,
    rangeMultiplier: 1.8,
  });
  emit('trigger-sound-light-alarm');
}

function openSituationDetail(item: FireSituationMarkerItem) {
  if (item.kind === 'event') {
    void router.push({ name: 'fireAccidentRescue', query: { eventId: String(item.targetId) } });
    return;
  }
  if (item.kind === 'operation') {
    openSpecialOperationView(item.title.replace(/^(特级|一级)/, ''));
    selectSpecialOperation(item.targetId);
    return;
  }
  const alarm = findScreenAlarm(item.targetId);
  if (alarm) openAlarmDetail(fireAlarmToDetail(alarm));
}

// 挂载即拉取真实后端 /alarms，供上方点位反查；失败时 findScreenAlarm 命中不到，静默不弹详情。
onMounted(() => void refreshScreenAlarms());
</script>

<template>
  <div class="center-map">
    <div class="center-map__depth" />

    <div v-if="!rescueDrawerActive && !alarmDetailOpen" class="fire-situation-layer">
      <FireSituationMarker
        v-for="item in fireSituationMarkers"
        :key="item.id"
        :item="item"
        @activate="openSituationDetail"
      />
    </div>

    <button
      type="button"
      class="sound-light-trigger"
      title="手动触发消防声光告警弹窗"
      @click="triggerSoundLightAlarm"
    >
      <span class="sound-light-trigger__dot" aria-hidden="true" />
      手动触发告警
    </button>

    <div class="map-controls">
      <MapLayerPanel />
      <button
        v-for="(ctrl, index) in mapControls"
        :key="ctrl.key"
        type="button"
        class="map-control-btn"
        :title="ctrl.label"
        :aria-label="ctrl.label"
        @click="onMapControl(ctrl.key)"
      >
        <SpriteImage :sprite="sprites.mapControlButtons[index]" />
      </button>
      <MapCleanModeButton />
    </div>
  </div>
</template>

<style scoped>
.center-map {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.center-map__depth {
  position: absolute;
  inset: 0;
  z-index: var(--z-base);
  pointer-events: none;
  background:
    radial-gradient(
      ellipse 90% 80% at 50% 42%,
      transparent 0%,
      rgb(0 18 40 / 15%) 50%,
      rgb(0 12 28 / 50%) 100%
    ),
    linear-gradient(
      180deg,
      rgb(0 22 48 / 75%) 0%,
      transparent 14%,
      transparent 78%,
      rgb(0 18 40 / 80%) 100%
    ),
    linear-gradient(
      90deg,
      rgb(0 22 48 / 80%) 0%,
      transparent 22%,
      transparent 78%,
      rgb(0 22 48 / 80%) 100%
    );
}

.alarm-marker {
  position: absolute;
  z-index: var(--z-marker);

  /* 锚点对齐标点落地点（line 末端圆点） */
  transform: translate(-48px, -97px);
  pointer-events: none;
}

.alarm-marker__body {
  position: relative;
  width: 99px;
  height: 124px;
}

.alarm-marker__shadow2,
.alarm-marker__shadow1,
.alarm-marker__base,
.alarm-marker__outer,
.alarm-marker__inner,
.alarm-marker__icon {
  position: absolute;
  object-fit: contain;
}

.alarm-marker__shadow2 {
  left: 0;
  top: 84px;
  width: 99px;
  opacity: 0.6;
}

.alarm-marker__shadow1 {
  left: 17px;
  top: 87px;
  width: 64px;
  opacity: 0.6;
}

.alarm-marker__base {
  left: 31px;
  top: 91px;
  width: 38px;
}

.alarm-marker__outer {
  left: 24px;
  top: 0;
  width: 50px;
}

.alarm-marker__inner {
  left: 28px;
  top: 4px;
  width: 42px;
}

.alarm-marker__icon {
  left: 39px;
  top: 11px;
  width: 21px;
}

.alarm-marker__line-wrap {
  position: absolute;
  left: 48px;
  top: 72px;
  width: 3px;
  height: 25px;
}

.alarm-marker__line {
  width: 1px;
  height: 23px;
  margin-left: 1px;
}

.alarm-marker__dot {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 3px;
}

.alarm-marker__popup {
  position: absolute;
  left: 81px;
  top: -13px;
  width: 138px;
  height: 67px;
}

.alarm-marker__popup-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.alarm-marker__popup-text {
  position: relative;
  padding: 11px;
  font-size: 12px;
  color: var(--map-popup-red-text);
  line-height: 1.4;
}

.alarm-marker__status {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
}

.alarm-marker__status img {
  width: 5px;
  height: 5px;
}

.alarm-marker__status-text {
  color: var(--map-danger-deep);
}

.map-controls {
  position: absolute;
  right: var(--map-controls-right, calc(var(--sidebar-width) + 28px));
  top: calc(var(--header-height) + 24px);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
  z-index: var(--z-marker);
  pointer-events: auto;
}

.map-control-btn {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  line-height: 0;
  opacity: 0.95;
  transition:
    opacity 0.2s,
    filter 0.2s;
}

.map-control-btn:hover {
  opacity: 1;
  filter: brightness(1.12);
}

.fire-situation-layer {
  position: absolute;
  inset: 0;
  z-index: var(--z-base);
  pointer-events: none;
}

.sound-light-trigger {
  position: absolute;
  top: calc(var(--header-height) + 24px);

  /* 左侧面板右侧：位于地图可视区域左上角，不被侧栏遮挡 */
  left: calc(var(--sidebar-width) + 28px);
  z-index: var(--z-marker);
  pointer-events: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  width: 126px;
  height: 32px;
  border: 1px solid rgb(255 77 70 / 70%);
  border-radius: 2px;
  background: linear-gradient(180deg, rgb(132 30 36 / 90%), rgb(64 18 29 / 92%));
  color: #ffd6d3;
  font-family: var(--font-body);
  font-size: 13px;
  cursor: pointer;
  box-shadow: 0 0 12px rgb(255 48 42 / 18%);
  transition:
    filter 0.2s,
    border-color 0.2s,
    box-shadow 0.2s;
}

.sound-light-trigger:hover {
  filter: brightness(1.18);
  border-color: var(--color-danger);
  box-shadow: 0 0 16px rgb(255 48 42 / 32%);
}

.sound-light-trigger__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-danger);
  box-shadow: 0 0 8px var(--color-danger);
  animation: sound-light-trigger-blink 0.8s ease-in-out infinite alternate;
}

@keyframes sound-light-trigger-blink {
  from {
    opacity: 0.4;
  }

  to {
    opacity: 1;
  }
}
</style>
