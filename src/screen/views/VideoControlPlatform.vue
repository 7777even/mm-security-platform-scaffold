<script setup lang="ts">
import { ref } from 'vue';
import VideoControlSidebar from '../components/video-control/VideoControlSidebar.vue';
import VideoControlGrid from '../components/video-control/VideoControlGrid.vue';
import VideoControlBottomBar from '../components/video-control/VideoControlBottomBar.vue';
import type { GridLayout } from '@/services/video';

const page = ref(1);
const layout = ref<GridLayout>('3x3');
</script>

<template>
  <div class="video-control-page">
    <div class="video-control-page__body">
      <VideoControlSidebar />

      <main class="video-control-page__main">
        <VideoControlGrid :page="page" :layout="layout" />
      </main>
    </div>

    <VideoControlBottomBar
      :page="page"
      :layout="layout"
      @update:page="page = $event"
      @update:layout="layout = $event"
    />
  </div>
</template>

<style scoped>
.video-control-page {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 1920px;
  height: 100%;
  min-height: 1080px;
  background: var(--map-video-page-bg);
  pointer-events: auto;
}

.video-control-page__body {
  flex: 1;
  display: flex;
  gap: 5px;
  min-height: 0;
  padding: 13px 36px 0 37px;
  box-sizing: border-box;
}

.video-control-page__main {
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
