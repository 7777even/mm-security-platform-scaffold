<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { getVideoControlPage, type GridLayout } from '../../lib/data/videoControlMock';
import { videoControlFrameStyle } from '../../utils/tvSpriteConfig';

const props = defineProps<{
  page: number;
  layout: GridLayout;
}>();

const nowText = ref('');

function formatNow() {
  const now = new Date();
  nowText.value = now
    .toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
    .replace(/\//g, '-');
}

let timer: ReturnType<typeof setInterval>;

onMounted(() => {
  formatNow();
  timer = setInterval(formatNow, 1000);
});

onUnmounted(() => {
  clearInterval(timer);
});

const cells = computed(() => getVideoControlPage(props.page));

const visibleCells = computed(() => {
  const count = props.layout === '1x1' ? 1 : props.layout === '2x2' ? 4 : 9;
  return cells.value.slice(0, count);
});

const gridClass = computed(() => `vc-grid--${props.layout}`);

function cellIndex(index: number) {
  return String((props.page - 1) * 9 + index + 1).padStart(2, '0');
}
</script>

<template>
  <div class="vc-grid" :class="gridClass">
    <article v-for="(cell, index) in visibleCells" :key="cell.id" class="vc-cell">
      <header class="vc-cell__header">
        <span class="vc-cell__index">{{ cellIndex(index) }}</span>
        <span class="vc-cell__name">{{ cell.name }}</span>
        <span class="vc-cell__type">{{ cell.cameraType }}</span>
        <span v-if="cell.hd" class="vc-cell__hd">高清</span>
        <time class="vc-cell__time">{{ nowText }}</time>
      </header>

      <div class="vc-cell__video">
        <div
          v-if="cell.status !== 'loading'"
          class="vc-cell__frame"
          :style="videoControlFrameStyle(cell.thumbIndex)"
        />
        <div v-if="cell.status === 'loading'" class="vc-cell__loading">
          <i class="vc-cell__spinner" aria-hidden="true" />
          <span>正在打开视频流，请稍候...</span>
        </div>
        <div v-else-if="cell.status === 'ai'" class="vc-cell__ai-boxes">
          <span class="vc-cell__ai-box vc-cell__ai-box--1" />
          <span class="vc-cell__ai-box vc-cell__ai-box--2" />
          <span class="vc-cell__ai-box vc-cell__ai-box--3" />
        </div>
      </div>

      <footer class="vc-cell__footer">
        {{ cell.location }}
      </footer>
    </article>
  </div>
</template>

<style scoped>
.vc-grid {
  display: grid;
  gap: 6px;
  width: 100%;
  height: 100%;
  min-height: 0;
}

.vc-grid--3x3 {
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
}

.vc-grid--2x2 {
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
}

.vc-grid--1x1 {
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
}

.vc-cell {
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: rgb(0 10 24 / 75%);
  border: 1px solid rgb(0 120 200 / 35%);
  border-radius: 2px;
  overflow: hidden;
}

.vc-cell__header {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  height: 30px;
  padding: 0 10px;
  background: rgb(0 0 0 / 55%);
  border-bottom: 1px solid rgb(0 100 180 / 25%);
  font-size: 12px;
  color: #c4dcff;
}

.vc-cell__index {
  min-width: 22px;
  font-weight: 600;
  color: #00d4ff;
  font-variant-numeric: tabular-nums;
}

.vc-cell__name {
  font-weight: 500;
  color: #fff;
  white-space: nowrap;
}

.vc-cell__type {
  color: #8795b0;
  white-space: nowrap;
}

.vc-cell__hd {
  padding: 1px 5px;
  border: 1px solid rgb(0 180 255 / 50%);
  border-radius: 2px;
  background: rgb(0 80 160 / 45%);
  font-size: 10px;
  color: #7cdbff;
  line-height: 1.4;
}

.vc-cell__time {
  margin-left: auto;
  font-size: 11px;
  color: #8795b0;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.vc-cell__video {
  position: relative;
  flex: 1;
  min-height: 0;
  background: #020810;
  overflow: hidden;
}

.vc-cell__frame {
  width: 100%;
  height: 100%;
}

.vc-cell__loading {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: rgb(0 8 20 / 82%);
  font-size: 14px;
  color: #9ed8ff;
}

.vc-cell__spinner {
  width: 28px;
  height: 28px;
  border: 2px solid rgb(0 180 255 / 25%);
  border-top-color: #00d4ff;
  border-radius: 50%;
  animation: vc-spin 0.9s linear infinite;
}

@keyframes vc-spin {
  to {
    transform: rotate(360deg);
  }
}

.vc-cell__ai-boxes {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.vc-cell__ai-box {
  position: absolute;
  border: 2px solid #3dd68c;
  border-radius: 1px;
  box-shadow: 0 0 6px rgb(61 214 140 / 35%);
}

.vc-cell__ai-box--1 {
  left: 18%;
  top: 22%;
  width: 22%;
  height: 28%;
}

.vc-cell__ai-box--2 {
  left: 52%;
  top: 38%;
  width: 18%;
  height: 24%;
}

.vc-cell__ai-box--3 {
  left: 30%;
  top: 58%;
  width: 26%;
  height: 20%;
}

.vc-cell__footer {
  flex-shrink: 0;
  height: 26px;
  padding: 0 10px;
  background: rgb(0 18 40 / 88%);
  border-top: 1px solid rgb(0 100 180 / 22%);
  font-size: 12px;
  color: #9ed8ff;
  line-height: 24px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
