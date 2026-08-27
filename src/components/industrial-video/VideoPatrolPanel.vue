<!--
  VideoPatrolPanel — §工业电视「重要视频巡查」
  顶部视频库链接 + 2 列 × 3 行缩略图网格，每格：摄像头实景占位 + 标题 + 在线状态点。
-->
<script setup lang="ts">
import PanelCard from '@/components/common/PanelCard.vue';

interface Cam {
  id: string;
  title: string;
  online: boolean;
  hue: number;
}

const cams: Cam[] = [
  { id: '1', title: 'A1储罐区-1', online: true, hue: 200 },
  { id: '2', title: 'A1储罐区-2', online: true, hue: 210 },
  { id: '3', title: 'A1储罐区-3', online: true, hue: 195 },
  { id: '4', title: 'A1储罐区-4', online: true, hue: 205 },
  { id: '5', title: 'A1储罐区-5', online: true, hue: 215 },
  { id: '6', title: 'A1储罐区-6', online: false, hue: 190 },
];

function thumbBg(h: number): string {
  return `linear-gradient(135deg, hsl(${h} 60% 35%), hsl(${h + 15} 50% 22%))`;
}

function openCam(c: Cam): void {
  console.warn('[video-patrol]', c.id);
}

function openLibrary(): void {
  console.warn('[video-patrol] library');
}
</script>

<template>
  <PanelCard title="重要视频巡查" icon="VideoCamera" more="视频库" @more="openLibrary">
    <div class="grid">
      <button v-for="c in cams" :key="c.id" type="button" class="cam" @click="openCam(c)">
        <div class="cam__thumb" :style="{ background: thumbBg(c.hue) }">
          <span :class="['cam__status', c.online ? 'cam__status--on' : 'cam__status--off']">
            {{ c.online ? '在线' : '未连接' }}
          </span>
        </div>
        <div class="cam__title">{{ c.title }}</div>
      </button>
    </div>
  </PanelCard>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.cam {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
}

.cam__thumb {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: var(--radius-sm);
  border: 1px solid var(--panel-border, rgb(0 216 255 / 22%));
  overflow: hidden;
}

.cam__status {
  position: absolute;
  right: 4px;
  bottom: 4px;
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 8px;
  backdrop-filter: blur(4px);
}

.cam__status--on {
  color: #2ee6a8;
  background: rgb(46 230 168 / 18%);
  border: 1px solid rgb(46 230 168 / 50%);
}

.cam__status--off {
  color: #ff6b6b;
  background: rgb(255 107 107 / 18%);
  border: 1px solid rgb(255 107 107 / 50%);
}

.cam__title {
  font-size: 12px;
  color: var(--color-text);
}
</style>
