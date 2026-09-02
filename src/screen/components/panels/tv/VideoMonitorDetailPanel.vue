<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import SurveillanceVideoDialog from '../../common/SurveillanceVideoDialog.vue';
import { tvAssets } from '../../../utils/designAssets';
import { TV_VIDEO_DETAIL_LAYOUT } from '../../../utils/tvVideoDetailLayout';
import type { TvVideoMonitorDetail } from '../../../lib/data/tvMock';

const props = defineProps<{
  monitor: TvVideoMonitorDetail;
}>();

const emit = defineEmits<{
  back: [];
}>();

const tabs = [
  { key: 'basic', label: '基础信息' },
  { key: 'alarm', label: '告警信息' },
  { key: 'playback', label: '视频回放' },
] as const;

const activeTab = ref<(typeof tabs)[number]['key']>('basic');
const isPlaying = ref(false);
const videoDialogOpen = ref(false);

const videoPreview = new URL(
  '../../../assets/mock-cameras/outdoor_storage_tanks_1782731405157.png',
  import.meta.url,
).href;

watch(
  () => props.monitor.id,
  () => {
    activeTab.value = 'basic';
    isPlaying.value = false;
    videoDialogOpen.value = false;
  },
);

function toggleVideoPlayback() {
  if (!props.monitor.online) return;
  activeTab.value = 'playback';
  isPlaying.value = !isPlaying.value;
}

function openVideoDialog() {
  if (!props.monitor.online) return;
  videoDialogOpen.value = true;
}

const infoRows = computed(() => [
  { label: '监控名称', value: props.monitor.name },
  {
    label: '在线状态',
    value: props.monitor.online ? '在线' : '离线',
    status: props.monitor.online ? 'online' : 'offline',
  },
  { label: '完好状态', value: props.monitor.integrity },
  { label: '监控类型', value: props.monitor.monitorType },
  { label: '建设部门', value: props.monitor.department },
  { label: '安装位置', value: props.monitor.location },
  { label: '安装高度', value: props.monitor.height },
  { label: '安装角度', value: props.monitor.angle },
]);
</script>

<template>
  <section
    class="video-monitor-detail"
    :style="{
      width: `${TV_VIDEO_DETAIL_LAYOUT.panelWidth}px`,
      height: `${TV_VIDEO_DETAIL_LAYOUT.panelHeight}px`,
    }"
  >
    <header class="video-monitor-detail__header">
      <img
        class="video-monitor-detail__header-icon"
        :src="tvAssets.videoMonitorDetail.icon"
        alt=""
      />
      <h3 class="video-monitor-detail__title">监控详情</h3>
      <button
        type="button"
        class="video-monitor-detail__back"
        aria-label="返回视频监控总览"
        title="返回"
        @click="emit('back')"
      >
        <span class="video-monitor-detail__back-arrow" aria-hidden="true" />
        <span>返回</span>
      </button>
    </header>

    <div
      class="video-monitor-detail__content"
      :style="{
        left: `${TV_VIDEO_DETAIL_LAYOUT.contentLeft}px`,
        top: `${TV_VIDEO_DETAIL_LAYOUT.contentTop}px`,
        width: `${TV_VIDEO_DETAIL_LAYOUT.contentWidth}px`,
        minHeight: `${TV_VIDEO_DETAIL_LAYOUT.contentHeight}px`,
      }"
    >
      <div class="detail-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="tv-panel-btn detail-tabs__btn"
          :class="{
            'tv-panel-btn--active': activeTab === tab.key,
            'tv-panel-btn--ghost': activeTab !== tab.key,
          }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <div v-if="activeTab === 'basic'" class="detail-info">
        <div v-for="row in infoRows" :key="row.label" class="detail-info__row">
          <span class="detail-info__label">{{ row.label }}</span>
          <span
            class="detail-info__value"
            :class="{
              'detail-info__value--online': row.status === 'online',
              'detail-info__value--offline': row.status === 'offline',
            }"
          >
            <i
              v-if="row.status"
              class="detail-info__dot"
              :class="{
                'detail-info__dot--online': row.status === 'online',
                'detail-info__dot--offline': row.status === 'offline',
              }"
            />
            {{ row.value }}
          </span>
        </div>
      </div>

      <div v-else-if="activeTab === 'alarm'" class="detail-placeholder">暂无告警记录</div>
      <div v-else class="detail-video">
        <img class="detail-video__preview" :src="videoPreview" :alt="`${monitor.name}监控画面`" />
        <div class="detail-video__overlay" :class="{ 'detail-video__overlay--paused': !isPlaying }">
          <span v-if="isPlaying" class="detail-video__live">实时预览（仿真）</span>
          <button
            v-else
            type="button"
            class="detail-video__resume"
            :disabled="!monitor.online"
            @click="toggleVideoPlayback"
          >
            {{ monitor.online ? '继续播放' : '当前监控离线' }}
          </button>
        </div>
        <footer class="detail-video__footer">{{ monitor.name }}</footer>
      </div>
    </div>

    <button
      type="button"
      class="tv-panel-btn tv-panel-btn--active tv-panel-btn--primary video-monitor-detail__play"
      :style="{
        width: `${TV_VIDEO_DETAIL_LAYOUT.playWidth}px`,
        height: `${TV_VIDEO_DETAIL_LAYOUT.playHeight}px`,
        bottom: `${TV_VIDEO_DETAIL_LAYOUT.playBottom}px`,
      }"
      :disabled="!monitor.online"
      @click="openVideoDialog"
    >
      {{ !monitor.online ? '监控离线' : '播放视频' }}
    </button>

    <SurveillanceVideoDialog
      :open="videoDialogOpen"
      :title="monitor.name"
      :image-url="videoPreview"
      scene-mode="single"
      :online="monitor.online"
      @close="videoDialogOpen = false"
    />
  </section>
</template>

<style scoped>
@import url('../../../styles/tvPanelButtons.css');

.video-monitor-detail {
  position: relative;
  flex-shrink: 0;
  overflow: hidden;
  box-sizing: border-box;
  background: linear-gradient(180deg, rgb(0 28 58 / 92%) 0%, rgb(0 14 32 / 96%) 100%);
  border: 1px solid rgb(0 130 210 / 32%);
  border-radius: 0;
  box-shadow: inset 0 0 0 1px rgb(0 60 120 / 18%);
}

.video-monitor-detail::before,
.video-monitor-detail::after {
  content: '';
  position: absolute;
  width: 10px;
  height: 10px;
  border-color: rgb(0 200 255 / 45%);
  border-style: solid;
  pointer-events: none;
  z-index: 1;
}

.video-monitor-detail::before {
  top: 0;
  left: 0;
  border-width: 1px 0 0 1px;
}

.video-monitor-detail::after {
  right: 0;
  bottom: 0;
  border-width: 0 1px 1px 0;
}

.video-monitor-detail__header {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  width: 100%;
  height: 42px;
  padding: 0 13px;
  box-sizing: border-box;
  border-bottom: 1px solid rgb(0 110 190 / 22%);
  background: linear-gradient(180deg, rgb(0 40 82 / 55%) 0%, rgb(0 24 52 / 20%) 100%);
}

.video-monitor-detail__header-icon {
  width: 16px;
  height: 15px;
  margin-right: 8px;
  flex-shrink: 0;
}

.video-monitor-detail__back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  margin-left: auto;
  padding: 0 9px;
  flex-shrink: 0;
  border: 1px solid rgb(0 170 255 / 38%);
  border-radius: 2px;
  background: rgb(0 90 170 / 18%);
  color: #a9d8ff;
  font-family: var(--font-body);
  font-size: 13px;
  cursor: pointer;
  transition:
    background 0.2s,
    border-color 0.2s,
    color 0.2s,
    box-shadow 0.2s;
}

.video-monitor-detail__back:hover,
.video-monitor-detail__back:focus-visible {
  border-color: rgb(0 200 255 / 72%);
  background: rgb(0 120 210 / 32%);
  color: var(--color-text-strong);
  box-shadow: 0 0 8px rgb(0 174 255 / 20%);
  outline: none;
}

.video-monitor-detail__back-arrow {
  width: 7px;
  height: 7px;
  border-left: 1.5px solid currentcolor;
  border-bottom: 1.5px solid currentcolor;
  transform: rotate(45deg);
}

.video-monitor-detail__title {
  margin: 0;
  padding-top: 1px;
  font-size: 18px;
  font-weight: 500;
  line-height: 1.2;
  color: var(--color-text-strong);
  font-family: var(--font-body);
}

.video-monitor-detail__content {
  position: absolute;
  z-index: 1;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.detail-tabs {
  display: flex;
  align-items: stretch;
  gap: 8px;
  flex-shrink: 0;
  margin-bottom: 18px;
}

.detail-tabs__btn {
  flex: 1;
  height: 36px;
  padding: 0 8px;
  font-size: 14px;
}

.detail-info {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.detail-info__row {
  display: grid;
  grid-template-columns: 88px 1fr;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  padding: 4px 0;
  border-bottom: 1px solid rgb(0 110 190 / 14%);
}

.detail-info__row:last-child {
  border-bottom: none;
}

.detail-info__label {
  font-size: 14px;
  line-height: 1.4;
  color: #8eb6e8;
  white-space: nowrap;
}

.detail-info__value {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  line-height: 1.4;
  color: var(--color-text-strong);
  word-break: break-all;
}

.detail-info__value--online {
  color: var(--color-success);
}

.detail-info__value--offline {
  color: var(--color-text-muted);
}

.detail-info__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.detail-info__dot--online {
  background: var(--color-success);
  box-shadow: 0 0 6px rgb(61 214 140 / 65%);
}

.detail-info__dot--offline {
  background: var(--color-text-muted);
}

.detail-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  font-size: 14px;
  color: #8eb6e8;
}

.detail-video {
  position: relative;
  flex: 1;
  min-height: 260px;
  overflow: hidden;
  border: 1px solid rgb(0 130 210 / 28%);
  background: #020810;
}

.detail-video__preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail-video__overlay {
  position: absolute;
  inset: 0 0 30px;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 10px;
  box-sizing: border-box;
}

.detail-video__overlay--paused {
  align-items: center;
  justify-content: center;
  background: rgb(0 8 20 / 62%);
}

.detail-video__live {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 24px;
  padding: 0 10px;
  border: 1px solid rgb(61 214 140 / 45%);
  background: rgb(0 10 24 / 58%);
  color: var(--color-success);
  font-size: 12px;
  font-weight: 600;
}

.detail-video__live::before {
  content: '';
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentcolor;
  box-shadow: 0 0 8px rgb(61 214 140 / 80%);
  animation: detail-video-live 1.2s ease-in-out infinite;
}

.detail-video__resume {
  height: 34px;
  padding: 0 18px;
  border: 1px solid rgb(0 180 255 / 55%);
  border-radius: 2px;
  background: rgb(0 70 145 / 72%);
  color: var(--color-text-strong);
  font-family: var(--font-body);
  cursor: pointer;
}

.detail-video__resume:disabled {
  border-color: rgb(135 149 176 / 35%);
  background: rgb(45 52 65 / 62%);
  color: var(--color-text-muted);
  cursor: not-allowed;
}

.detail-video__footer {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 30px;
  padding: 0 10px;
  box-sizing: border-box;
  border-top: 1px solid rgb(0 100 180 / 26%);
  background: rgb(0 18 40 / 88%);
  color: var(--map-popup-text-blue);
  font-size: 12px;
  line-height: 29px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@keyframes detail-video-live {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.35;
  }
}

.video-monitor-detail__play {
  position: absolute;
  left: 50%;
  z-index: 2;
  transform: translateX(-50%);
  padding: 0;
}

.video-monitor-detail__play:disabled {
  border-color: rgb(135 149 176 / 35%);
  background: linear-gradient(180deg, rgb(80 88 104 / 34%), rgb(40 46 58 / 58%));
  color: var(--color-text-muted);
  cursor: not-allowed;
  box-shadow: none;
}
</style>
