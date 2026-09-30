<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue';
import SurveillanceVideoDialog from '../../common/SurveillanceVideoDialog.vue';
import { tvAssets } from '@/utils/designAssets';
import { TV_VIDEO_DETAIL_LAYOUT } from '../../../utils/tvVideoDetailLayout';
import {
  fetchTvSnapshots,
  fetchTvSnapshotUrl,
  type TvMonitorDetail,
  type TvSnapshotItem,
} from '@/services/tv';

const props = defineProps<{
  /** 单监控点模式（基础信息/告警信息/视频回放）。 */
  monitor: TvMonitorDetail;
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
const videoDialogOpen = ref(false);

/**
 * 真实抓拍：按本监控 monitorCode 服务端过滤（fac_tv_snapshot 真实表）。
 * 无真实媒体网关（NoOpTvSourceAdapter 返回空），故用真实抓拍帧时间轴替代视频流——
 * 不造假数据。同一份 monitorSnapshots 同时驱动「告警信息」(列表) 与「视频回放」(网格) 两个 Tab。
 */
const monitorSnapshots = ref<TvSnapshotItem[]>([]);
const snapshotUrls = ref<Record<number, string | null>>({});
const lightboxId = ref<number | null>(null);

const latestSnapshot = computed(
  () =>
    [...monitorSnapshots.value].sort((a, b) =>
      (b.captureTime ?? '').localeCompare(a.captureTime ?? ''),
    )[0] ?? null,
);

const lightboxItem = computed(
  () => monitorSnapshots.value.find((s) => s.id === lightboxId.value) ?? null,
);
const lightboxUrl = computed(() =>
  lightboxId.value != null ? (snapshotUrls.value[lightboxId.value] ?? null) : null,
);

const loadKey = computed(() => `m:${props.monitor.id}`);

watch(
  loadKey,
  () => {
    activeTab.value = 'basic';
    videoDialogOpen.value = false;
    lightboxId.value = null;
    void loadSnapshots();
  },
  { immediate: true },
);

async function loadSnapshots() {
  monitorSnapshots.value = [];
  snapshotUrls.value = {};
  try {
    const page = await fetchTvSnapshots(1, 200, { monitorCode: props.monitor.id });
    const list = page.list ?? [];
    monitorSnapshots.value = list;
    await Promise.all(
      list.map(async (s) => {
        snapshotUrls.value[s.id] = s.hasImage ? await fetchTvSnapshotUrl(s.id) : null;
      }),
    );
  } catch {
    monitorSnapshots.value = [];
  }
}

function openVideoDialog() {
  if (!props.monitor.online) return;
  if (!latestSnapshot.value) return;
  videoDialogOpen.value = true;
}

function openLightbox(id: number) {
  lightboxId.value = id;
}

function closeLightbox() {
  lightboxId.value = null;
}

const headerTitle = computed(() => props.monitor.name);

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

onUnmounted(() => {
  Object.values(snapshotUrls.value).forEach((u) => {
    if (u) URL.revokeObjectURL(u);
  });
});
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
      <h3 class="video-monitor-detail__title">{{ headerTitle }}</h3>
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

      <div v-else-if="activeTab === 'alarm'" class="detail-alarm">
        <ul v-if="monitorSnapshots.length" class="alarm-list">
          <li
            v-for="snap in monitorSnapshots"
            :key="snap.id"
            type="button"
            class="alarm-list__item"
            :title="`${snap.captureTime || snap.createdAt || ''} · ${snap.eventType || '抓拍'}`"
            @click="openLightbox(snap.id)"
          >
            <span
              class="alarm-list__dot"
              :class="{ 'alarm-list__dot--manual': snap.source === 'MANUAL' }"
            />
            <span class="alarm-list__event">{{ snap.eventType || '抓拍' }}</span>
            <span class="alarm-list__monitor">{{ snap.monitorName || '—' }}</span>
            <span class="alarm-list__time">{{ snap.captureTime || snap.createdAt || '—' }}</span>
          </li>
        </ul>
        <div v-else class="detail-placeholder">该监控暂无关联抓拍记录</div>
      </div>

      <div v-else class="detail-playback">
        <div v-if="monitorSnapshots.length" class="playback-grid">
          <button
            v-for="snap in monitorSnapshots"
            :key="snap.id"
            type="button"
            class="playback-thumb"
            :title="`${snap.captureTime || snap.createdAt || ''} · ${snap.eventType || '抓拍'}`"
            @click="openLightbox(snap.id)"
          >
            <img
              v-if="snapshotUrls[snap.id]"
              :src="snapshotUrls[snap.id] ?? undefined"
              :alt="snap.monitorName ?? '抓拍'"
            />
            <span v-else class="playback-thumb__placeholder">无图</span>
            <span class="playback-thumb__meta">{{
              snap.captureTime || snap.createdAt || '—'
            }}</span>
          </button>
        </div>
        <div v-else class="detail-placeholder">该监控暂无抓拍记录</div>
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
      :disabled="!monitor.online || !latestSnapshot"
      @click="openVideoDialog"
    >
      {{ !monitor.online ? '监控离线' : !latestSnapshot ? '暂无抓拍' : '播放最新抓拍' }}
    </button>

    <SurveillanceVideoDialog
      :open="videoDialogOpen"
      :title="`${headerTitle} · 最新抓拍`"
      :image-url="
        latestSnapshot && snapshotUrls[latestSnapshot.id]
          ? (snapshotUrls[latestSnapshot.id] as string)
          : ''
      "
      scene-mode="single"
      :online="monitor.online"
      @close="videoDialogOpen = false"
    />

    <Teleport to="#app">
      <Transition name="playback-lightbox-fade">
        <div v-if="lightboxItem" class="playback-lightbox" @click="closeLightbox">
          <figure class="playback-lightbox__dialog" role="dialog" aria-modal="true" @click.stop>
            <header class="playback-lightbox__header">
              <h3 class="playback-lightbox__title">
                {{ lightboxItem.monitorName || monitor.name || '抓拍' }} 抓拍详情
              </h3>
              <button type="button" class="playback-lightbox__close" @click="closeLightbox">
                ×
              </button>
            </header>
            <div class="playback-lightbox__body">
              <img
                v-if="lightboxUrl"
                :src="lightboxUrl"
                :alt="lightboxItem.monitorName ?? '抓拍'"
              />
              <span v-else class="playback-lightbox__placeholder">无图</span>
            </div>
            <footer class="playback-lightbox__meta">
              <span>时间：{{ lightboxItem.captureTime || lightboxItem.createdAt || '—' }}</span>
              <span>事件：{{ lightboxItem.eventType || '—' }}</span>
              <span>来源：{{ lightboxItem.source === 'MANUAL' ? '手工' : '设备' }}</span>
            </footer>
          </figure>
        </div>
      </Transition>
    </Teleport>
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
  z-index: var(--z-chrome);
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
  z-index: var(--z-chrome);
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
  z-index: var(--z-chrome);
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

.detail-alarm {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.alarm-list {
  flex: 1;
  min-height: 0;
  list-style: none;
  margin: 0;
  padding: 0 2px 0 0;
  overflow-y: auto;
}

.alarm-list__item {
  display: grid;
  grid-template-columns: auto 88px 1fr auto;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 4px 8px;
  border-bottom: 1px solid rgb(0 110 190 / 14%);
  cursor: pointer;
  transition: background 0.18s;
}

.alarm-list__item:hover {
  background: rgb(0 45 88 / 45%);
}

.alarm-list__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--color-danger);
  box-shadow: 0 0 6px rgb(255 90 90 / 55%);
  flex-shrink: 0;
}

.alarm-list__dot--manual {
  background: #7cdbff;
  box-shadow: 0 0 6px rgb(124 219 255 / 55%);
}

.alarm-list__event {
  font-size: 13px;
  color: var(--color-text-strong);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.alarm-list__monitor {
  font-size: 12px;
  color: #8eb6e8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.alarm-list__time {
  font-size: 11px;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.detail-playback {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.playback-grid {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: min-content;
  gap: 8px;
  overflow-y: auto;
  padding-right: 2px;
}

.playback-thumb {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 0;
  border: 1px solid rgb(0 130 210 / 30%);
  border-radius: 3px;
  background: #001b31;
  overflow: hidden;
  cursor: pointer;
  aspect-ratio: 16 / 10;
}

.playback-thumb:hover {
  border-color: rgb(0 200 255 / 70%);
  box-shadow: 0 0 8px rgb(0 174 255 / 25%);
}

.playback-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.playback-thumb__placeholder {
  flex: 1;
  display: grid;
  place-items: center;
  color: #6f91aa;
  font-size: 12px;
}

.playback-thumb__meta {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 2px 5px;
  font-size: 10px;
  line-height: 1.3;
  color: #dcefff;
  background: linear-gradient(180deg, transparent, rgb(0 12 28 / 82%));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.video-monitor-detail__play {
  position: absolute;
  left: 50%;
  z-index: var(--z-chrome);
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

:global(.playback-lightbox) {
  position: fixed;
  inset: 0;
  z-index: var(--z-toast);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
  background: rgb(0 12 28 / 74%);
}

:global(.playback-lightbox__dialog) {
  width: min(880px, 100%);
  display: flex;
  flex-direction: column;
  background:
    linear-gradient(180deg, rgb(5 36 62 / 96%) 0%, rgb(4 24 44 / 96%) 100%),
    radial-gradient(circle at 25% 20%, rgb(0 148 236 / 16%), transparent 52%);
  border: 1px solid rgb(0 148 236 / 45%);
  border-radius: 10px;
  box-shadow:
    0 16px 38px rgb(0 0 0 / 44%),
    inset 0 0 24px rgb(0 120 210 / 18%);
  overflow: hidden;
}

:global(.playback-lightbox__header) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 38px;
  padding: 0 14px;
  border-bottom: 1px solid rgb(0 120 210 / 36%);
  background: rgb(2 28 52 / 84%);
}

:global(.playback-lightbox__title) {
  margin: 0;
  color: #e6f3ff;
  font-size: 15px;
  font-weight: 500;
}

:global(.playback-lightbox__close) {
  width: 22px;
  height: 22px;
  padding: 0;
  border: none;
  border-radius: 2px;
  background: transparent;
  color: #a8b8cc;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
}

:global(.playback-lightbox__close:hover) {
  color: var(--color-text-strong);
  background: rgb(0 120 210 / 25%);
}

:global(.playback-lightbox__body) {
  flex: 1;
  min-height: 320px;
  max-height: calc(100vh - 200px);
  display: grid;
  place-items: center;
  background: #020810;
  overflow: hidden;
}

:global(.playback-lightbox__body img) {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

:global(.playback-lightbox__placeholder) {
  color: #6f91aa;
  font-size: 13px;
}

:global(.playback-lightbox__meta) {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
  padding: 10px 14px;
  border-top: 1px solid rgb(0 120 210 / 28%);
  color: #9fd6ff;
  font-size: 12px;
}

:global(.playback-lightbox-fade-enter-active),
:global(.playback-lightbox-fade-leave-active) {
  transition: opacity 0.22s ease;
}

:global(.playback-lightbox-fade-enter-from),
:global(.playback-lightbox-fade-leave-to) {
  opacity: 0;
}
</style>
