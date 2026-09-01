<script setup lang="ts">
import { computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import PkgIcon from '@/components/common/PkgIcon.vue';
import VideoWallSidebar from '@/components/video-wall/VideoWallSidebar.vue';
import VideoWallGrid from '@/components/video-wall/VideoWallGrid.vue';
import VideoWallInteractionLayer from '@/components/video-wall/VideoWallInteractionLayer.vue';
import {
  activeEventVideoContext,
  clearEventVideoContext,
  ensureEventVideoWall,
  prepareDefaultHighAltitudeWall,
  type EventVideoKind,
} from '@/components/video-wall/videoWallStore';
import { useVideoWallInteraction } from '@/composables/useVideoWallInteraction';

const ia = useVideoWallInteraction();
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
  void router.push({ name: 'industrial-video' });
}
</script>

<template>
  <div class="video-wall-page">
    <div class="video-wall-page__title-bar">
      <div class="video-wall-page__heading">
        <h2 class="video-wall-page__title">
          <PkgIcon name="crane" size="18px" class="video-wall-page__title-icon" />视频墙
        </h2>
        <div v-if="eventContext" class="video-wall-page__event-context">
          <span>{{ eventContext.kind === 'weather' ? '极端天气' : '应急事件' }}</span>
          <strong>{{ eventContext.eventTitle }}</strong>
          <em
            >{{ eventContext.groups.length }} 个分组 ·
            {{ eventContext.groups.reduce((total, group) => total + group.cameras.length, 0) }}
            路视频</em
          >
          <button type="button" @click="ia.openEventVideoWall()">全部上墙</button>
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

    <!-- 视频监控墙模块二级界面分发层（点击 → 二级界面，不离开模块） -->
    <VideoWallInteractionLayer />
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
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--map-accent-soft-text);
  letter-spacing: 1px;
}

.video-wall-page__title-icon {
  color: var(--color-accent);
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
  border: 1px solid var(--map-event-badge-border);
  background: var(--map-event-badge-bg);
  color: var(--map-event-badge-fg);
  font-size: 11px;
  line-height: 20px;
}

.video-wall-page__event-context > strong {
  max-width: 420px;
  overflow: hidden;
  color: var(--color-text);
  font-size: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.video-wall-page__event-context > em {
  color: var(--color-text-muted);
  font-size: 11px;
  font-style: normal;
}

.video-wall-page__event-context > button {
  height: 24px;
  border: 1px solid color-mix(in srgb, var(--map-border) 42%, transparent);
  background: var(--map-ctrl-veil-strong);
  color: var(--map-accent-soft-text);
  font-size: 11px;
  cursor: pointer;
}

.video-wall-page__back {
  height: 28px;
  padding: 0 14px;
  border: 1px solid color-mix(in srgb, var(--map-border) 35%, transparent);
  border-radius: 2px;
  background: color-mix(in srgb, var(--color-panel) 85%, transparent);
  color: var(--map-accent-soft-text);
  font-family: var(--font-body);
  font-size: 13px;
  cursor: pointer;
  transition:
    background 0.2s,
    border-color 0.2s;
}

.video-wall-page__back:hover {
  background: color-mix(in srgb, var(--color-accent) 15%, transparent);
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
  border: 1px solid color-mix(in srgb, var(--map-border) 35%, transparent);
  border-radius: 2px;
  overflow: hidden;
}

.video-wall-page__main {
  flex: 1;
  min-width: 0;
  min-height: 0;
  padding: 0;
  background: var(--map-video-main-bg);
  border: 1px solid color-mix(in srgb, var(--map-border) 32%, transparent);
  border-radius: 2px;
  overflow: hidden;
}
</style>
