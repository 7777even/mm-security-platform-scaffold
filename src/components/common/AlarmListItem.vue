<!--
  AlarmListItem — §12.1 报警列表卡片（设计稿图 5-10 右上消防告警列表）

  视觉构成（自左向右）：
    1) 3px 等级色边（alarm-1..4，对齐 §13.1）
    2) 缩略图区 96×72，左上角类型图标 + mock 监控抓拍现场图（cameraThumbByIndex 缺省填充）
    3) 内容区：
       - 标题 + 状态标签（待处理/已确认/已派单/已闭环）
       - 位置 · 时间
       - 描述（单行省略）
       - 快捷操作链接：现场监控 / 音视频通话 / 一键应急
-->
<script setup lang="ts">
import { computed } from 'vue';
import type { AlarmItem, AlarmStatus, AlarmType } from '@/services/alarm';
import { cameraThumbByIndex } from '@/services/map-data/fireImages';

const props = withDefaults(
  defineProps<{
    alarm: AlarmItem;
    /** 自定义缩略图 URL；缺省时按告警编号稳定取 mock 监控抓拍图 */
    thumbnail?: string;
    /** 是否渲染底部快捷操作行 */
    showActions?: boolean;
  }>(),
  { thumbnail: '', showActions: true },
);

const emit = defineEmits<{
  (e: 'view', alarm: AlarmItem): void;
  (e: 'call', alarm: AlarmItem): void;
  (e: 'dispatch', alarm: AlarmItem): void;
  (e: 'open', alarm: AlarmItem): void;
}>();

const rootClass = computed(() => `alarm-list-item alarm-list-item--l${props.alarm.level}`);

const STATUS_TEXT: Record<AlarmStatus, string> = {
  ACTIVE: '未处置',
  ACKED: '已确认',
  DISPATCHED: '已派单',
  CLOSED: '已闭环',
};

const TYPE_ICON: Record<AlarmType, string> = {
  FIRE: '🔥',
  GAS: '☁',
  TEMP: '🌡',
  CCTV: '🎥',
  SOS: '🆘',
};

const TYPE_LABEL: Record<AlarmType, string> = {
  FIRE: '火灾',
  GAS: '可燃气体',
  TEMP: '温度',
  CCTV: '视频',
  SOS: '紧急呼叫',
};

const status = computed(() => props.alarm.status);
const typeIcon = computed(() => TYPE_ICON[props.alarm.type] ?? '⚠');
const typeLabel = computed(() => TYPE_LABEL[props.alarm.type] ?? '报警');
const title = computed(() => `${typeLabel.value}报警 · ${props.alarm.deviceCode}`);

/** 缩略图：外部传入优先；缺省按告警编号稳定取 mock 监控抓拍图（cameraThumbByIndex），不留文字占位 */
const thumbSrc = computed(() => {
  if (props.thumbnail) return props.thumbnail;
  const seed = Array.from(props.alarm.alarmId).reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return cameraThumbByIndex(seed);
});
const tsText = computed(() => formatTs(props.alarm.ts));
const canDispatch = computed(() => status.value === 'ACTIVE' || status.value === 'ACKED');
const canCall = computed(() => status.value !== 'CLOSED');

function formatTs(ts: string): string {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return ts;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
</script>

<template>
  <article :class="rootClass" :aria-label="`${typeLabel}报警 ${alarm.alarmId}`">
    <div class="alarm-list-item__thumb" aria-hidden="true">
      <img
        :src="thumbSrc"
        :alt="`${title} 现场图`"
        class="alarm-list-item__thumb-img"
        loading="lazy"
      />
      <span class="alarm-list-item__thumb-icon">{{ typeIcon }}</span>
    </div>

    <div class="alarm-list-item__body">
      <header class="alarm-list-item__head">
        <span class="alarm-list-item__title">{{ title }}</span>
        <span :class="['alarm-list-item__status', `alarm-list-item__status--${status}`]">
          {{ STATUS_TEXT[status] }}
        </span>
      </header>

      <div class="alarm-list-item__meta">
        <span>{{ alarm.location }}</span>
        <span class="alarm-list-item__meta-sep">·</span>
        <span>{{ tsText }}</span>
        <span class="alarm-list-item__meta-sep">·</span>
        <span>编号 {{ alarm.alarmId }}</span>
      </div>

      <p v-if="alarm.description" class="alarm-list-item__desc">{{ alarm.description }}</p>

      <div v-if="showActions" class="alarm-list-item__actions">
        <button class="alarm-list-item__action" type="button" @click="emit('view', alarm)">
          现场监控
        </button>
        <button
          class="alarm-list-item__action"
          type="button"
          :disabled="!canCall"
          @click="emit('call', alarm)"
        >
          音视频通话
        </button>
        <button
          class="alarm-list-item__action"
          type="button"
          :disabled="!canDispatch"
          @click="emit('dispatch', alarm)"
        >
          一键应急
        </button>
        <button class="alarm-list-item__action" type="button" @click="emit('open', alarm)">
          详情
        </button>
      </div>
    </div>
  </article>
</template>

<style scoped>
.alarm-list-item__thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
</style>
