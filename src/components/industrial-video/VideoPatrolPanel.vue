<!--
  VideoPatrolPanel — §工业电视「重要视频巡查」
  顶部视频库链接 + 2 列 × 3 行缩略图网格，每格摄像头实景（压缩包 mock-cameras 监控抓拍图占位）+ 标题 + 在线状态。
  点击缩略图进入监控点详情；点击「视频库」打开视频库列表。
  图标：压缩包 fire-situation 图标（PkgIcon）。
-->
<script setup lang="ts">
import PanelCard from '@/components/common/PanelCard.vue';
import { useIndustrialVideoInteraction } from '@/composables/useIndustrialVideoInteraction';
import { cameraThumbByIndex } from '@/services/map-data/fireImages';

interface Cam {
  id: string;
  title: string;
  online: boolean;
  hue: number;
}

const ia = useIndustrialVideoInteraction();

const cams: Cam[] = [
  { id: '1', title: 'A1储罐区-1', online: true, hue: 200 },
  { id: '2', title: 'A1储罐区-2', online: true, hue: 210 },
  { id: '3', title: 'A1储罐区-3', online: true, hue: 195 },
  { id: '4', title: 'A1储罐区-4', online: true, hue: 205 },
  { id: '5', title: 'A1储罐区-5', online: true, hue: 215 },
  { id: '6', title: 'A1储罐区-6', online: false, hue: 190 },
];

function openCam(c: Cam): void {
  ia.openVideoMonitor({ label: c.title, id: c.id });
}

function openLibrary(): void {
  ia.openVideoLibrary();
}
</script>

<template>
  <PanelCard title="重要视频巡查" icon="ladder" more="视频库" @more="openLibrary">
    <div class="grid">
      <button v-for="(c, i) in cams" :key="c.id" type="button" class="cam" @click="openCam(c)">
        <div class="cam__thumb" :style="{ backgroundImage: `url(${cameraThumbByIndex(i)})` }">
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
  border: 1px solid var(--panel-border);
  overflow: hidden;
  background-color: color-mix(in srgb, var(--color-panel) 70%, transparent);
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  transition: border-color var(--transition-fast);
}

.cam:hover .cam__thumb {
  border-color: var(--color-accent);
}

.cam__status {
  position: absolute;
  right: 4px;
  bottom: 4px;
  font-size: var(--font-size-caption);
  padding: 1px 6px;
  border-radius: 8px;
  backdrop-filter: blur(4px);
}

.cam__status--on {
  color: var(--color-success);
  background: color-mix(in srgb, var(--color-success) 18%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-success) 50%, transparent);
}

.cam__status--off {
  color: var(--color-alarm-1);
  background: color-mix(in srgb, var(--color-alarm-1) 18%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-alarm-1) 50%, transparent);
}

.cam__title {
  font-size: var(--font-size-helper);
  color: var(--color-text);
}
</style>
