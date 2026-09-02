<script setup lang="ts">
import { useRouter } from 'vue-router';
import type { AlarmItem } from '../../lib/data/mock';
import { fireAlarmToDetail } from '../../lib/data/alarmDetailMock';
import { useAlarmDetailPanel } from '../../lib/composables/useAlarmDetailPanel';
import { openAlarmVideoPopups } from '../../lib/composables/useAlarmVideoPopups';
import fireAlarmPipeRack from '../../assets/semantic-scenes/fire-alarm-pipe-rack.png';
import securityPerimeterIntrusion from '../../assets/semantic-scenes/security-perimeter-intrusion.png';
import productionGasLeak from '../../assets/semantic-scenes/production-gas-leak.png';

const props = defineProps<{
  alarm: AlarmItem;
}>();

const router = useRouter();
const { openAlarmDetail } = useAlarmDetailPanel();

const actionItems = [
  { key: 'monitor', label: '现场监控' },
  { key: 'dispatch', label: '处置调度' },
  { key: 'emergency', label: '一键应急', primary: true },
];

function handleAction(key: string) {
  if (key === 'monitor') {
    openAlarmVideoPopups(props.alarm);
    return;
  }
  if (key === 'dispatch') {
    openAlarmDetail(fireAlarmToDetail(props.alarm), 'disposal');
    return;
  }
  void router.push({ name: 'emergency', query: { create: 'event' } });
}

function openImage() {
  openAlarmDetail(fireAlarmToDetail(props.alarm));
}

function alarmThumbnail() {
  if (/GDS|气体|浓度/i.test(props.alarm.alarmType)) return productionGasLeak;
  if (/视频|AI/i.test(props.alarm.alarmType)) return securityPerimeterIntrusion;
  return fireAlarmPipeRack;
}
</script>

<template>
  <article class="alarm-card" @click="openImage">
    <div class="alarm-card__thumb" @click.stop="handleAction('monitor')">
      <img :src="alarmThumbnail()" :alt="`${alarm.title}现场画面`" />
      <span class="alarm-card__play">▶ 告警视频</span>
    </div>

    <div class="alarm-card__body">
      <div class="alarm-card__head">
        <h4 class="alarm-card__title" :class="`alarm-card__title--${alarm.titleColor}`">
          {{ alarm.title }}
        </h4>
        <span class="alarm-card__tag">{{ alarm.source }}</span>
        <span class="alarm-card__status">{{ alarm.status }}</span>
      </div>

      <div class="alarm-card__meta">{{ alarm.location }}</div>
      <div class="alarm-card__meta">{{ alarm.time }}</div>
      <p class="alarm-card__desc">{{ alarm.description }}</p>

      <div class="alarm-card__actions">
        <button
          v-for="item in actionItems"
          :key="item.key + item.label"
          type="button"
          class="alarm-card__action"
          :class="{ 'alarm-card__action--primary': item.primary }"
          @click.stop="handleAction(item.key)"
        >
          {{ item.label }}
        </button>
      </div>
    </div>
  </article>
</template>

<style scoped>
.alarm-card {
  display: grid;
  grid-template-columns: 106px 1fr;
  gap: 10px;
  padding: 8px 10px;
  flex-shrink: 0;
  background: var(--alarm-card-bg);
  border: 1px solid var(--alarm-card-border);
  border-radius: 2px;
  cursor: pointer;
}

.alarm-card:hover {
  border-color: var(--border-glow);
  background: var(--alarm-card-bg-hover);
}

.alarm-card__thumb {
  position: relative;
  width: 106px;
  height: 106px;
  overflow: hidden;
  border-radius: 2px;
  border: 1px solid rgb(255 100 60 / 25%);
  align-self: start;
  cursor: pointer;
}

.alarm-card__thumb img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.alarm-card__play {
  position: absolute;
  right: 6px;
  bottom: 6px;
  padding: 3px 6px;
  border: 1px solid rgb(66 207 255 / 45%);
  border-radius: 3px;
  background: rgb(0 12 25 / 78%);
  color: #7be0ff;
  font-size: 10px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 35%);
}

.alarm-card__body {
  min-width: 0;
}

.alarm-card__head {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 4px;
}

.alarm-card__title {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
}

.alarm-card__title--danger {
  color: var(--color-danger);
}

.alarm-card__title--warning {
  color: var(--color-warning);
}

.alarm-card__tag,
.alarm-card__status {
  font-size: 12px;
  color: var(--map-device-offline);
}

.alarm-card__meta {
  font-size: 12px;
  color: #c8d8ec;
}

.alarm-card__desc {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--map-device-offline);
  line-height: 1.5;
}

.alarm-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 12px;
  margin-top: 6px;
}

.alarm-card__action {
  padding: 0;
  border: none;
  background: transparent;
  color: var(--color-accent-2);
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
}

.alarm-card__action:hover {
  color: #6cf;
}

.alarm-card__action--primary {
  color: #ff7a6a;
}

.alarm-card__action--primary:hover {
  color: #ff9a8e;
}
</style>
