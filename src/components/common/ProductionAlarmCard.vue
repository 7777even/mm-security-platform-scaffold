<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import type { ProductionAlarmItem } from '@/services/map-data/productionMock';
import { User, Warning, UserFilled } from '@element-plus/icons-vue';
import ClipImage from './ClipImage.vue';
import OneKeyBroadcastDialog from '../panels/production/OneKeyBroadcastDialog.vue';
import { alarmThumbClips } from '@/utils/productionClipConfig';
import { showToast } from '@/composables/useToast';
import { productionAlarmToDetail } from '@/services/map-data/alarmDetailMock';
import { useAlarmDetailPanel } from '@/composables/useAlarmDetailPanel';

const props = defineProps<{
  alarm: ProductionAlarmItem;
}>();

const router = useRouter();
const { openAlarmDetail } = useAlarmDetailPanel();
const broadcastOpen = ref(false);

/* 与 productionAlarms.iconIndex 一一对应：
   0 人员跌倒 → User / 1 违规进入 → Warning / 2 人员聚集 → UserFilled / 3 有毒气体超标 → Warning */
const ALARM_ICONS = [User, Warning, UserFilled, Warning];

function openDetail() {
  openAlarmDetail(productionAlarmToDetail(props.alarm));
}

function openMonitor() {
  void router.push({
    name: 'industrial-video-control',
    query: {
      monitor: `prod-${props.alarm.id}`,
      monitorLabel: props.alarm.title,
    },
  });
}

function openControl() {
  showToast('一键控制已触发（联动控制待接入）');
}
</script>

<template>
  <article class="alarm-card" @click="openDetail">
    <span
      class="alarm-card__icon"
      :class="`alarm-card__icon--${alarm.titleColor}`"
      aria-hidden="true"
      @click.stop="openDetail"
    >
      <component :is="ALARM_ICONS[alarm.iconIndex] ?? User" />
    </span>

    <div class="alarm-card__body">
      <div class="alarm-card__head">
        <h4 class="alarm-card__title" :class="`alarm-card__title--${alarm.titleColor}`">
          {{ alarm.title }}
        </h4>
        <span class="alarm-card__divider">|</span>
        <span class="alarm-card__status">{{ alarm.status }}</span>
      </div>
      <div class="alarm-card__meta">{{ alarm.location }}</div>
      <div class="alarm-card__meta">{{ alarm.time }}</div>
      <p class="alarm-card__desc">{{ alarm.description }}</p>
    </div>

    <div class="alarm-card__thumb" @click.stop="openDetail">
      <img
        v-if="alarm.thumb"
        :src="alarm.thumb"
        alt="告警图片"
        @error="($event.target as HTMLImageElement).style.display = 'none'"
      />
      <ClipImage v-bind="alarmThumbClips[alarm.iconIndex]" class="alarm-card__thumb-fallback" />
    </div>

    <div class="alarm-card__actions">
      <button type="button" class="alarm-card__action" @click.stop="openMonitor">
        &gt; 现场监控
      </button>
      <button type="button" class="alarm-card__action" @click.stop="broadcastOpen = true">
        &gt; 一键广播
      </button>
      <button type="button" class="alarm-card__action" @click.stop="openControl">
        &gt; 一键控制
      </button>
    </div>
  </article>

  <OneKeyBroadcastDialog :open="broadcastOpen" @close="broadcastOpen = false" />
</template>

<style scoped>
.alarm-card {
  display: grid;
  grid-template-columns: 52px 1fr 83px 88px;
  gap: 8px;
  align-items: start;
  padding: 8px 10px;
  flex-shrink: 0;
  min-height: 120px;
  background: color-mix(in srgb, var(--color-panel) 45%, transparent);
  border: 1px solid color-mix(in srgb, var(--map-border) 20%, transparent);
  border-radius: 2px;
  box-sizing: border-box;
  cursor: pointer;
}

.alarm-card:hover {
  border-color: var(--border-glow);
  background: color-mix(in srgb, var(--color-panel) 55%, transparent);
}

.alarm-card__icon {
  flex-shrink: 0;
  width: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: zoom-in;
}

.alarm-card__icon svg {
  width: 26px;
  height: 26px;
  fill: currentcolor;
}

.alarm-card__icon--warning {
  color: var(--color-alarm-3);
}

.alarm-card__icon--danger {
  color: var(--color-alarm-1);
}

.alarm-card__icon--orange {
  color: var(--color-alarm-2);
}

.alarm-card__icon--purple {
  color: var(--color-alarm-4);
}

.alarm-card__body {
  min-width: 0;
  padding-top: 2px;
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

.alarm-card__title--warning {
  color: var(--color-alarm-3);
}

.alarm-card__title--danger {
  color: var(--color-alarm-1);
}

.alarm-card__title--orange {
  color: var(--color-alarm-2);
}

.alarm-card__title--purple {
  color: var(--color-alarm-4);
}

.alarm-card__divider {
  color: color-mix(in srgb, var(--color-text-strong) 35%, transparent);
  font-size: 12px;
}

.alarm-card__status {
  font-size: 12px;
  color: var(--color-text-strong);
}

.alarm-card__meta {
  font-size: 12px;
  color: var(--color-text);
}

.alarm-card__desc {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--color-text-muted);
  line-height: 1.5;
}

.alarm-card__thumb {
  width: 83px;
  height: 76px;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--map-border) 28%, transparent);
  border-radius: 2px;
  background: color-mix(in srgb, var(--color-panel) 72%, transparent);
  cursor: zoom-in;
}

.alarm-card__thumb > img,
.alarm-card__thumb :deep(.clip-image) {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.alarm-card__actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.alarm-card__action {
  padding: 0;
  border: none;
  background: transparent;
  color: var(--color-accent-2);
  font-size: 12px;
  font-family: var(--font-body);
  text-align: left;
  cursor: pointer;
  white-space: nowrap;
}

.alarm-card__action:hover {
  color: var(--color-accent-bright);
}
</style>
