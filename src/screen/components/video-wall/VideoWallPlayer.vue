<script setup lang="ts">
import { ref, shallowRef, onMounted, onUnmounted, watch, computed } from 'vue';
import { videoMode, playbackTimeRange } from './videoWallStore';
import { videoWallBus, type VideoWallPlaybackCommand } from './videoWallBus';

const props = defineProps<{
  videoId?: string;
  videoName: string;
}>();

const defaultBgImage = new URL(
  '../../assets/mock-cameras/outdoor_storage_tanks_1782731405157.png',
  import.meta.url,
).href;

const highAltitudeImage = new URL(
  '../../assets/mock-cameras/high-altitude-ar-petrochemical.png',
  import.meta.url,
).href;
const storageTankImage = new URL(
  '../../assets/mock-cameras/outdoor_storage_tanks_1782731405157.png',
  import.meta.url,
).href;
const reactorImage = new URL(
  '../../assets/mock-cameras/chemical_plant_reactor_1782731378222.png',
  import.meta.url,
).href;
const pipeRackImage = new URL(
  '../../assets/mock-cameras/chemical_factory_pipes_1782731393637.png',
  import.meta.url,
).href;
const fireSceneImage = new URL(
  '../../assets/semantic-scenes/fire-alarm-pipe-rack.png',
  import.meta.url,
).href;
const weatherSceneGrid = new URL(
  '../../assets/semantic-scenes/typhoon-flood-cctv-grid.png',
  import.meta.url,
).href;
const accidentSceneGrid = new URL(
  '../../assets/semantic-scenes/accident-emergency-cctv-grid.png',
  import.meta.url,
).href;

interface CameraScene {
  image: string;
  size?: string;
  position?: string;
}

// 3×2 场景图采用背景定位模拟独立监控机位，避免演示时所有窗口重复同一画面。
const spritePositions = ['0% 22%', '50% 22%', '100% 22%', '0% 78%', '50% 78%', '100% 78%'];
const spriteScene = (image: string, index: number): CameraScene => ({
  image,
  size: '300% auto',
  position: spritePositions[index] ?? 'center',
});

const eventCameraScenes: Record<string, CameraScene> = {
  // 普通视频墙默认高空AR四视角。
  'high-ar-1': { image: highAltitudeImage, position: '12% center' },
  'high-ar-2': { image: highAltitudeImage, position: '36% center' },
  'high-ar-3': { image: highAltitudeImage, position: '64% center' },
  'high-ar-4': { image: highAltitudeImage, position: '88% center' },

  // 极端天气：高空全景、积水点、排水设施、危险源和厂区道路。
  'v-1-1': { image: highAltitudeImage },
  'v-1-2': { image: highAltitudeImage, position: '38% center' },
  'v-1-3': { image: highAltitudeImage, position: '72% center' },
  'v-2-1': spriteScene(weatherSceneGrid, 2),
  'v-2-2': spriteScene(weatherSceneGrid, 4),
  'v-2-3': spriteScene(weatherSceneGrid, 5),
  'v-3-1': spriteScene(weatherSceneGrid, 0),
  'v-3-2': spriteScene(weatherSceneGrid, 3),
  'v-3-3': spriteScene(weatherSceneGrid, 1),
  'v-4-1': { image: storageTankImage },
  'v-4-2': { image: reactorImage },
  'v-4-3': { image: storageTankImage, position: '72% center' },
  'v-4-4': { image: pipeRackImage },
  'v-5-1': spriteScene(weatherSceneGrid, 2),
  'v-5-2': spriteScene(weatherSceneGrid, 4),
  'v-5-3': spriteScene(weatherSceneGrid, 5),

  // 事故应急：事故核心、周边危险源、救援道路、疏散和移动视频。
  'v-21-1': spriteScene(accidentSceneGrid, 0),
  'v-21-2': { image: fireSceneImage },
  'v-21-3': spriteScene(accidentSceneGrid, 0),
  'v-22-1': spriteScene(accidentSceneGrid, 1),
  'v-22-2': { image: reactorImage },
  'v-22-3': { image: storageTankImage },
  'v-23-1': spriteScene(accidentSceneGrid, 2),
  'v-23-2': spriteScene(accidentSceneGrid, 3),
  'v-23-3': spriteScene(accidentSceneGrid, 5),
  'v-23-4': spriteScene(accidentSceneGrid, 3),
  'v-24-1': spriteScene(accidentSceneGrid, 4),
  'v-24-2': spriteScene(accidentSceneGrid, 3),
  'v-24-3': spriteScene(accidentSceneGrid, 4),
  'v-25-1': { image: highAltitudeImage },
  'v-25-2': spriteScene(accidentSceneGrid, 5),
  'v-25-3': spriteScene(accidentSceneGrid, 4),
};

const cameraScene = computed<CameraScene>(
  () => (props.videoId && eventCameraScenes[props.videoId]) || { image: defaultBgImage },
);

const isLoading = ref(true);
const isPaused = ref(false);
const timeStr = ref('');
const playbackOffsetSec = ref(0);
let clockTimer: ReturnType<typeof setInterval> | null = null;
let aiTimer: ReturnType<typeof setInterval> | null = null;

// AI detection box simulation
interface AiBox {
  id: number;
  top: string;
  left: string;
  width: string;
  height: string;
  label: string;
  color: string;
}
const aiBoxes = shallowRef<AiBox[]>([]);

const generateAiBoxes = () => {
  // Only sometimes render AI detection targets
  if (Math.random() > 0.4) {
    const list = [
      { label: 'Reactor B02: NORMAL', color: '#3dd68c' },
      { label: 'Vessel Valve: CLOSED', color: '#3dd68c' },
      { label: 'Temp Sensor: 41.8°C', color: '#3dd68c' },
      { label: 'Flow Rate: 120L/s', color: '#3dd68c' },
      { label: 'Warning: High Temp (Sim)', color: '#ff5a4a' },
      { label: 'Worker Detected', color: '#00b4ff' },
    ];

    const count = Math.floor(Math.random() * 2) + 1; // 1 or 2 boxes
    const newBoxes: AiBox[] = [];

    for (let k = 0; k < count; k++) {
      const item = list[Math.floor(Math.random() * list.length)];
      const top = 10 + Math.random() * 45;
      const left = 10 + Math.random() * 50;
      const width = 20 + Math.random() * 25;
      const height = 15 + Math.random() * 20;
      newBoxes.push({
        id: Math.random(),
        top: `${top}%`,
        left: `${left}%`,
        width: `${width}%`,
        height: `${height}%`,
        label: item.label,
        color: item.color,
      });
    }
    aiBoxes.value = newBoxes;
  } else {
    aiBoxes.value = [];
  }
};

const startLoading = () => {
  isLoading.value = true;
  setTimeout(
    () => {
      isLoading.value = false;
    },
    1000 + Math.random() * 800,
  ); // random 1~1.8s
};

const formatStamp = (date: Date): string => {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())} ${p(
    date.getHours(),
  )}:${p(date.getMinutes())}:${p(date.getSeconds())}`;
};

// 仅负责 OSD 时钟（便宜的字符串更新）。与 AI 检测框刷新解耦，避免逐秒重渲染抖动。
const updateClock = () => {
  if (videoMode.value === 'realtime') {
    timeStr.value = formatStamp(new Date());
  } else {
    // Playback mode: based on start time + offset
    const startStr = playbackTimeRange.value.start;
    if (!startStr) {
      timeStr.value = 'NO SIGNAL';
      return;
    }
    const startDate = new Date(startStr);
    if (isNaN(startDate.getTime())) {
      timeStr.value = 'ERROR';
      return;
    }
    startDate.setSeconds(startDate.getSeconds() + playbackOffsetSec.value);
    timeStr.value = formatStamp(startDate);

    if (!isPaused.value) {
      playbackOffsetSec.value++;
    }
  }
};

// 模拟 AI 检测框刷新：独立于 1s 时钟，慢节奏运行，降低整组件重渲染频率。
const updateAiBoxes = () => {
  if (isPaused.value) return; // 回放暂停时不刷新模拟框
  generateAiBoxes();
};

const handlePlaybackCommand = (cmd: VideoWallPlaybackCommand) => {
  if (videoMode.value !== 'playback') return;

  // 检查是不是“仅选中摄像头”控制，如果是，检查是否是本科室的 ID
  if (cmd.scope === 'selected' && cmd.targetId !== props.videoId) {
    return;
  }

  if (cmd.action === 'play') {
    isPaused.value = false;
  } else if (cmd.action === 'pause') {
    isPaused.value = true;
  } else if (cmd.action === 'seek' && typeof cmd.percent === 'number') {
    const start = new Date(playbackTimeRange.value.start).getTime();
    const end = new Date(playbackTimeRange.value.end).getTime();
    if (!isNaN(start) && !isNaN(end) && end > start) {
      const totalSec = (end - start) / 1000;
      playbackOffsetSec.value = Math.floor(totalSec * (cmd.percent / 100));
      updateClock();
    }
  }
};

watch(videoMode, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    if (newVal === 'playback') {
      playbackOffsetSec.value = 0;
      isPaused.value = false;
    }
    startLoading();
  }
});

watch(
  () => playbackTimeRange.value.start,
  () => {
    if (videoMode.value === 'playback') {
      playbackOffsetSec.value = 0;
      isPaused.value = false;
      startLoading();
    }
  },
);

onMounted(() => {
  startLoading();
  generateAiBoxes();
  clockTimer = setInterval(updateClock, 1000);
  aiTimer = setInterval(updateAiBoxes, 3000);
  updateClock();
  videoWallBus.$on('playback-command', handlePlaybackCommand);
});

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer);
  if (aiTimer) clearInterval(aiTimer);
  videoWallBus.$off('playback-command', handlePlaybackCommand);
});
</script>

<template>
  <div class="mock-player-container" :class="{ 'playback-mode': videoMode === 'playback' }">
    <!-- Buffer State -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="spinner"></div>
      <span>正在建立安全视频链接...</span>
    </div>

    <!-- Video Content -->
    <div v-else class="video-feed">
      <!-- Simulated Camera View Background -->
      <div
        class="camera-bg"
        :style="{
          backgroundImage: `url(${cameraScene.image})`,
          backgroundSize: cameraScene.size || 'cover',
          backgroundPosition: cameraScene.position || 'center',
        }"
      >
        <div class="scanlines"></div>
        <div class="noise-overlay"></div>
      </div>

      <!-- Simulated AI Detection Box Layer -->
      <div
        v-for="box in aiBoxes"
        :key="box.id"
        class="simulated-ai-box"
        :style="{
          top: box.top,
          left: box.left,
          width: box.width,
          height: box.height,
          borderColor: box.color,
        }"
      >
        <span class="ai-box-label" :style="{ backgroundColor: box.color }">
          {{ box.label }}
        </span>
      </div>

      <!-- OSD (On-Screen Display) Layers -->
      <div class="osd-top-left">
        <div class="camera-name">{{ props.videoName }}</div>
      </div>

      <div class="osd-top-right">
        <div class="time-stamp">{{ timeStr }}</div>
        <div class="status-indicator">
          <span class="dot" :class="videoMode === 'realtime' ? 'blink-red' : 'solid-yellow'"></span>
          <span class="status-text">{{ videoMode === 'realtime' ? 'LIVE' : 'PLAYBACK' }}</span>
        </div>
      </div>

      <div class="corner-brackets top-left"></div>
      <div class="corner-brackets top-right"></div>
      <div class="corner-brackets bottom-left"></div>
      <div class="corner-brackets bottom-right"></div>
    </div>
  </div>
</template>

<style scoped>
.mock-player-container {
  position: absolute;
  inset: 0;
  background: #000;
  overflow: hidden;
  user-select: none;
  font-family: var(--font-body);
}

.playback-mode .camera-bg {
  filter: sepia(0.4) contrast(1.1) brightness(0.7) hue-rotate(-10deg);
}

.loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #0a0a0a;
  color: #7cdbff;
  font-size: 13px;
  z-index: var(--z-chrome);
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgb(0 130 210 / 35%);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 8px;
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}

.video-feed {
  width: 100%;
  height: 100%;
  position: relative;
}

.camera-bg {
  position: absolute;
  inset: 0;
  width: 100% !important;
  height: 100% !important;
  background-color: #112240;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.scanlines {
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    transparent,
    transparent 2px,
    rgb(0 0 0 / 15%) 3px,
    rgb(0 0 0 / 15%) 4px
  );
  pointer-events: none;
  opacity: 0.8;
  z-index: var(--z-chrome);
  position: absolute;
}

/* Digital flicker overlay */
.noise-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgb(0 0 0 / 0%) 60%, rgb(0 0 0 / 40%) 100%);
  pointer-events: none;
  z-index: var(--z-chrome);
}

/* AI detection target styles */
.simulated-ai-box {
  position: absolute;
  border: 1px solid var(--color-success);
  pointer-events: none;
  box-shadow:
    0 0 6px rgb(0 255 102 / 20%),
    inset 0 0 6px rgb(0 255 102 / 20%);
  z-index: var(--z-chrome);
  transition: all 0.5s ease-in-out;
}

.ai-box-label {
  position: absolute;
  top: -18px;
  left: -1px;
  font-size: 9px;
  color: #000;
  font-weight: bold;
  padding: 1px 4px;
  white-space: nowrap;
  border-radius: 1px;
  font-family: monospace;
}

.osd-top-left {
  position: absolute;
  top: 8px;
  left: 12px;
  z-index: var(--z-marker);
}

.camera-name {
  color: var(--color-text-strong);
  font-size: 13px;
  font-weight: bold;
  text-shadow:
    1px 1px 2px #000,
    -1px -1px 2px #000;
  margin-bottom: 2px;
}

.osd-top-right {
  position: absolute;
  top: 8px;
  right: 12px;
  z-index: var(--z-marker);
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.time-stamp {
  color: var(--color-text-strong);
  font-size: 13px;
  font-family: 'Courier New', Courier, monospace;
  font-weight: bold;
  text-shadow: 1px 1px 2px #000;
  margin-bottom: 2px;
}

.status-indicator {
  display: flex;
  align-items: center;
  background: rgb(0 0 0 / 50%);
  padding: 1px 5px;
  border-radius: 2px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 4px;
}

.blink-red {
  background-color: var(--color-danger);
  box-shadow: 0 0 5px var(--color-danger);
  animation: blink 1.5s infinite;
}

.solid-yellow {
  background-color: #fc0;
  box-shadow: 0 0 5px #fc0;
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.3;
  }
}

.status-text {
  color: var(--color-text-strong);
  font-size: 10px;
  font-weight: bold;
  letter-spacing: 0.5px;
}

/* Corner Brackets */
.corner-brackets {
  position: absolute;
  width: 10px;
  height: 10px;
  border: 1.5px solid var(--color-accent);
  opacity: 0.4;
  pointer-events: none;
  z-index: var(--z-chrome);
}

.top-left {
  top: 4px;
  left: 4px;
  border-right: none;
  border-bottom: none;
}

.top-right {
  top: 4px;
  right: 4px;
  border-left: none;
  border-bottom: none;
}

.bottom-left {
  bottom: 4px;
  left: 4px;
  border-right: none;
  border-top: none;
}

.bottom-right {
  bottom: 4px;
  right: 4px;
  border-left: none;
  border-top: none;
}
</style>
