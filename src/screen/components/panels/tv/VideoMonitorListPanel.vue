<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { tvAssets } from '@/utils/designAssets';
import { TV_VIDEO_DETAIL_LAYOUT } from '../../../utils/tvVideoDetailLayout';
import { openTvVideoDetail } from '../../../lib/composables/useTvVideoDetail';
import { fetchTvMonitors } from '@/services/tv';
import type { TvMonitorSummary } from '@/services/tv';

const props = defineProps<{
  view: {
    type: 'list';
    title: string;
    kind: 'all' | 'offline' | 'fault';
    monitors: TvMonitorSummary[];
    category?: string;
  };
}>();

const emit = defineEmits<{
  back: [];
}>();

// 当调用方未预传点位（如概览「查看全部真实监控点位」传空数组）时，本面板自行拉取真实设备档案。
const loadedMonitors = ref<TvMonitorSummary[]>([]);
const loading = ref(false);
onMounted(async () => {
  if (props.view.monitors.length) return;
  loading.value = true;
  try {
    loadedMonitors.value = await fetchTvMonitors();
  } catch {
    loadedMonitors.value = [];
  } finally {
    loading.value = false;
  }
});

const monitors = computed(() => {
  const source = props.view.monitors.length ? props.view.monitors : loadedMonitors.value;
  const cat = props.view.category;
  if (!cat) return source;
  return source.filter((m) => m.monitorCategory === cat);
});

const kindKey = computed<'offline' | 'fault' | ''>(() => {
  if (props.view.kind === 'offline') return 'offline';
  if (props.view.kind === 'fault') return 'fault';
  return '';
});

const kindText = computed(() => {
  if (kindKey.value === 'offline') return '离线';
  if (kindKey.value === 'fault') return '故障';
  return '';
});

function pick(m: TvMonitorSummary) {
  void openTvVideoDetail({ id: m.code, label: m.name });
}

function onBack() {
  emit('back');
}
</script>

<template>
  <section
    class="video-monitor-list"
    :style="{
      width: `${TV_VIDEO_DETAIL_LAYOUT.panelWidth}px`,
      height: `${TV_VIDEO_DETAIL_LAYOUT.panelHeight}px`,
    }"
  >
    <header class="video-monitor-list__header">
      <img class="video-monitor-list__header-icon" :src="tvAssets.videoMonitorDetail.icon" alt="" />
      <h3 class="video-monitor-list__title">{{ view.title }}</h3>
      <button
        type="button"
        class="video-monitor-list__back"
        aria-label="返回"
        title="返回"
        @click="onBack"
      >
        <span class="video-monitor-list__back-arrow" aria-hidden="true" />
        <span>返回</span>
      </button>
    </header>

    <div
      class="video-monitor-list__content"
      :style="{
        left: `${TV_VIDEO_DETAIL_LAYOUT.contentLeft}px`,
        top: `${TV_VIDEO_DETAIL_LAYOUT.contentTop}px`,
        width: `${TV_VIDEO_DETAIL_LAYOUT.contentWidth}px`,
        minHeight: `${TV_VIDEO_DETAIL_LAYOUT.contentHeight}px`,
      }"
    >
      <p v-if="loading" class="video-monitor-list__empty">加载真实监控点位中…</p>
      <p v-else-if="!monitors.length" class="video-monitor-list__empty">该筛选条件下暂无监控点位</p>

      <button
        v-for="m in monitors"
        :key="m.code"
        type="button"
        class="list-item"
        :class="{ 'list-item--offline': !m.online }"
        :title="`查看 ${m.name} 详情与抓拍回放`"
        @click="pick(m)"
      >
        <span class="list-item__dot" :class="{ 'list-item__dot--off': !m.online }" />
        <span class="list-item__main">
          <span class="list-item__name">{{ m.name }}</span>
          <span class="list-item__meta">{{ m.zoneName || m.department || '未分防区' }}</span>
        </span>
        <span v-if="kindKey" class="list-item__tag" :class="`list-item__tag--${kindKey}`">{{
          kindText
        }}</span>
        <span v-else class="list-item__state" :class="{ 'list-item__state--off': !m.online }">
          {{ m.online ? '在线' : '离线' }}
        </span>
        <span class="list-item__code">{{ m.code }}</span>
      </button>
    </div>
  </section>
</template>

<style scoped>
@import url('../../../styles/tvPanelButtons.css');

.video-monitor-list {
  position: relative;
  flex-shrink: 0;
  overflow: hidden;
  box-sizing: border-box;
  background: linear-gradient(180deg, rgb(0 28 58 / 92%) 0%, rgb(0 14 32 / 96%) 100%);
  border: 1px solid rgb(0 130 210 / 32%);
  border-radius: 0;
  box-shadow: inset 0 0 0 1px rgb(0 60 120 / 18%);
}

.video-monitor-list::before,
.video-monitor-list::after {
  content: '';
  position: absolute;
  width: 10px;
  height: 10px;
  border-color: rgb(0 200 255 / 45%);
  border-style: solid;
  pointer-events: none;
  z-index: var(--z-chrome);
}

.video-monitor-list::before {
  top: 0;
  left: 0;
  border-width: 1px 0 0 1px;
}

.video-monitor-list::after {
  right: 0;
  bottom: 0;
  border-width: 0 1px 1px 0;
}

.video-monitor-list__header {
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

.video-monitor-list__header-icon {
  width: 16px;
  height: 15px;
  margin-right: 8px;
  flex-shrink: 0;
}

.video-monitor-list__title {
  margin: 0;
  padding-top: 1px;
  font-size: 18px;
  font-weight: 500;
  line-height: 1.2;
  color: var(--color-text-strong);
  font-family: var(--font-body);
}

.video-monitor-list__back {
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

.video-monitor-list__back:hover,
.video-monitor-list__back:focus-visible {
  border-color: rgb(0 200 255 / 72%);
  background: rgb(0 120 210 / 32%);
  color: var(--color-text-strong);
  box-shadow: 0 0 8px rgb(0 174 255 / 20%);
  outline: none;
}

.video-monitor-list__back-arrow {
  width: 7px;
  height: 7px;
  border-left: 1.5px solid currentcolor;
  border-bottom: 1.5px solid currentcolor;
  transform: rotate(45deg);
}

.video-monitor-list__content {
  position: absolute;
  z-index: var(--z-chrome);
  display: flex;
  flex-direction: column;
  gap: 7px;
  box-sizing: border-box;
  padding: 10px 2px 10px 0;
  overflow-y: auto;
}

.video-monitor-list__empty {
  margin: 0;
  padding: 24px 0;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 13px;
}

.list-item {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 46px;
  padding: 6px 10px;
  border: 1px solid rgb(0 110 190 / 22%);
  border-radius: 3px;
  background: linear-gradient(180deg, rgb(0 44 80 / 55%), rgb(0 26 54 / 50%));
  color: var(--color-text-strong);
  font-family: var(--font-body);
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.18s,
    background 0.18s;
}

.list-item:hover {
  border-color: rgb(0 200 255 / 60%);
  background: linear-gradient(180deg, rgb(0 60 110 / 70%), rgb(0 34 70 / 60%));
}

.list-item--offline {
  opacity: 0.74;
}

.list-item__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-success);
  box-shadow: 0 0 6px rgb(61 214 140 / 60%);
  flex-shrink: 0;
}

.list-item__dot--off {
  background: var(--color-text-muted);
  box-shadow: none;
}

.list-item__main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.list-item__name {
  font-size: 13px;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.list-item__meta {
  font-size: 11px;
  color: #8eb6e8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.list-item__tag {
  flex-shrink: 0;
  padding: 1px 7px;
  border-radius: 2px;
  font-size: 11px;
  line-height: 1.5;
}

.list-item__tag--offline {
  color: #c8d8ec;
  border: 1px solid rgb(135 149 176 / 40%);
  background: rgb(80 88 104 / 24%);
}

.list-item__tag--fault {
  color: #ffd2d2;
  border: 1px solid rgb(255 120 120 / 45%);
  background: rgb(180 60 60 / 22%);
}

.list-item__state {
  flex-shrink: 0;
  font-size: 11px;
  color: var(--color-success);
}

.list-item__state--off {
  color: var(--color-text-muted);
}

.list-item__code {
  flex-shrink: 0;
  color: var(--color-text-muted);
  font-size: 11px;
}
</style>
