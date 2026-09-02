<script setup lang="ts">
import { computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppHeader from '../components/layout/AppHeader.vue';
import VideoWallSidebar from '../components/video-wall/VideoWallSidebar.vue';
import VideoWallGrid from '../components/video-wall/VideoWallGrid.vue';
import VideoLinkageConfigDialog from '../components/video-wall/VideoLinkageConfigDialog.vue';
import {
  activeEventVideoContext,
  clearEventVideoContext,
  ensureEventVideoWall,
  prepareDefaultHighAltitudeWall,
  showAllEventVideosOnWall,
  type EventVideoKind,
} from '../components/video-wall/videoWallStore';

const router = useRouter();
const route = useRoute();
const eventContext = computed(() => activeEventVideoContext.value);

watch(
  () => route.fullPath,
  () => {
    const eventType = route.query.eventType;
    const eventId = route.query.eventId;
    const eventTitle = route.query.eventTitle;
    const from = route.query.from;
    if (
      (eventType === 'accident' || eventType === 'weather') &&
      eventId &&
      typeof eventTitle === 'string' &&
      typeof from === 'string'
    ) {
      ensureEventVideoWall({
        eventId: String(eventId),
        eventTitle,
        kind: eventType as EventVideoKind,
        sourceRoute: from,
      });
      return;
    }
    clearEventVideoContext();
    prepareDefaultHighAltitudeWall();
  },
  { immediate: true },
);

function goBack() {
  const from = typeof route.query.from === 'string' ? route.query.from : '';
  if (from) {
    const eventId = typeof route.query.eventId === 'string' ? route.query.eventId : undefined;
    void router.push({ name: from, query: eventId ? { eventId } : undefined });
    return;
  }
  void router.push({ name: 'tv' });
}
</script>

<template>
  <div class="video-wall-page">
    <AppHeader module="tv" active-nav="tv" />

    <div class="video-wall-page__title-bar">
      <div class="video-wall-page__heading">
        <h2 class="video-wall-page__title">视频墙</h2>
        <div v-if="eventContext" class="video-wall-page__event-context">
          <span>{{ eventContext.kind === 'weather' ? '极端天气' : '应急事件' }}</span>
          <strong>{{ eventContext.eventTitle }}</strong>
          <em
            >{{ eventContext.groups.length }} 个分组 ·
            {{ eventContext.groups.reduce((total, group) => total + group.cameras.length, 0) }}
            路视频</em
          >
          <button type="button" @click="showAllEventVideosOnWall">全部上墙</button>
        </div>
      </div>
      <button type="button" class="video-wall-page__back" @click="goBack">
        {{ eventContext ? '返回事件' : '返回' }}
      </button>
    </div>

    <div class="video-wall-page__body">
      <aside class="video-wall-page__sidebar">
        <VideoWallSidebar />
      </aside>

      <main class="video-wall-page__main">
        <VideoWallGrid />
      </main>
    </div>

    <VideoLinkageConfigDialog />
  </div>
</template>

<style scoped>
.video-wall-page {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 1920px;
  height: 100%;
  min-height: 1080px;
  background: var(--map-video-page-bg);
  font-family: var(--font-body);
  pointer-events: auto;
}

.video-wall-page__title-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  padding: 8px 36px 0 37px;
  box-sizing: border-box;
}

.video-wall-page__title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #7cdbff;
  letter-spacing: 1px;
}

.video-wall-page__heading {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 18px;
}

.video-wall-page__event-context {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 9px;
}

.video-wall-page__event-context > span {
  height: 22px;
  padding: 0 8px;
  border: 1px solid rgb(255 163 57 / 52%);
  background: rgb(112 56 8 / 44%);
  color: var(--map-event-badge-fg);
  font-size: 11px;
  line-height: 20px;
}

.video-wall-page__event-context > strong {
  max-width: 420px;
  overflow: hidden;
  color: #eef8ff;
  font-size: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.video-wall-page__event-context > em {
  color: #789bb4;
  font-size: 11px;
  font-style: normal;
}

.video-wall-page__event-context > button {
  height: 24px;
  border: 1px solid rgb(0 161 229 / 42%);
  background: rgb(0 72 120 / 42%);
  color: #83dfff;
  font-size: 11px;
  cursor: pointer;
}

.video-wall-page__back {
  height: 28px;
  padding: 0 14px;
  border: 1px solid rgb(0 130 210 / 35%);
  border-radius: 2px;
  background: rgb(0 20 45 / 85%);
  color: #7cdbff;
  font-family: var(--font-body);
  font-size: 13px;
  cursor: pointer;
  transition:
    background 0.2s,
    border-color 0.2s;
}

.video-wall-page__back:hover {
  background: rgb(0 180 255 / 15%);
  border-color: var(--color-accent);
  color: var(--color-text-strong);
}

.video-wall-page__body {
  flex: 1;
  display: flex;
  gap: 5px;
  min-height: 0;
  padding: 10px 36px 16px 37px;
  box-sizing: border-box;
}

.video-wall-page__sidebar {
  width: 420px;
  flex-shrink: 0;
  min-height: 0;
  border: 1px solid rgb(0 130 210 / 35%);
  border-radius: 2px;
  overflow: hidden;
}

.video-wall-page__main {
  flex: 1;
  min-width: 0;
  min-height: 0;
  padding: 0;
  background: linear-gradient(180deg, rgb(0 20 44 / 65%) 0%, rgb(0 8 20 / 55%) 100%);
  border: 1px solid rgb(0 130 210 / 32%);
  border-radius: 2px;
  overflow: hidden;
}
</style>
