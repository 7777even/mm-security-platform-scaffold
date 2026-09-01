<!--
  CameraDetailDialog — 摄像机详情（二级界面 cameraDetail）
  缩略图用压缩包 mock-cameras 监控抓拍图（cameraThumbByIndex），状态徽标 + 控制按钮（→ showToast）。
  无对应 PkgIcon 的摄像机图标，标题区用 CSS 绘制的摄像机字形占位（禁止 emoji）。
  控制指令为前端 mock，无真实码流。
-->
<script setup lang="ts">
import { computed } from 'vue';
import ScreenDialog from '@/components/fire/ScreenDialog.vue';
import { showToast } from '@/composables/useToast';
import { cameraThumbByIndex } from '@/services/map-data/fireImages';
import type { VideoControlCell, VideoCellStatus } from '@/services/map-data/videoControlMock';

const props = defineProps<{ cell: VideoControlCell }>();
const emit = defineEmits<{ close: [] }>();

const thumb = computed(() => cameraThumbByIndex(props.cell.thumbIndex));

function statusLabel(s: VideoCellStatus): string {
  return s === 'live' ? 'LIVE' : s === 'loading' ? '加载中' : 'AI 识别';
}
function statusTone(s: VideoCellStatus): 'live' | 'loading' | 'ai' {
  return s === 'live' ? 'live' : s === 'loading' ? 'loading' : 'ai';
}

const controls = [
  { key: 'preview', label: '实时预览' },
  { key: 'ptz', label: '云台控制' },
  { key: 'snapshot', label: '抓拍' },
  { key: 'replay', label: '录像回放' },
  { key: 'preset', label: '预置位' },
];

function runControl(label: string): void {
  showToast(`已向 ${props.cell.name} 下发「${label}」指令`);
}
</script>

<template>
  <ScreenDialog :open="true" :title="cell.name" @close="emit('close')">
    <div class="cam">
      <div class="cam__stage">
        <div class="cam__screen" :style="{ backgroundImage: `url(${thumb})` }">
          <span class="cam__badge" :class="`is-${statusTone(cell.status)}`">{{
            statusLabel(cell.status)
          }}</span>
          <span class="cam__scan" />
          <!-- 摄像机 CSS 字形：无对应 PkgIcon 名称，使用 token 着色绘制，禁止 emoji -->
          <span class="cam__glyph" aria-hidden="true" />
        </div>

        <div class="cam__meta">
          <div class="cam__row">
            <span class="cam__k">设备名称</span>
            <span class="cam__v">{{ cell.name }}</span>
          </div>
          <div class="cam__row">
            <span class="cam__k">摄像机类型</span>
            <span class="cam__v">{{ cell.cameraType }}</span>
          </div>
          <div class="cam__row">
            <span class="cam__k">清晰度</span>
            <span class="cam__v">{{ cell.hd ? '高清' : '标清' }}</span>
          </div>
          <div class="cam__row cam__row--wrap">
            <span class="cam__k">安装位置</span>
            <span class="cam__v">{{ cell.location }}</span>
          </div>
          <div class="cam__row">
            <span class="cam__k">运行状态</span>
            <span class="cam__v" :class="`is-${statusTone(cell.status)}`">{{
              statusLabel(cell.status)
            }}</span>
          </div>
        </div>
      </div>

      <div class="cam__controls">
        <button
          v-for="c in controls"
          :key="c.key"
          type="button"
          class="cam__btn"
          @click="runControl(c.label)"
        >
          {{ c.label }}
        </button>
      </div>
    </div>
  </ScreenDialog>
</template>

<style scoped>
.cam {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  height: 100%;
}

.cam__stage {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: var(--space-md);
  flex: 1;
  min-height: 0;
}

.cam__screen {
  position: relative;
  min-height: 320px;
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-sm);
  background-color: color-mix(in srgb, var(--color-panel) 70%, transparent);
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  overflow: hidden;
}

.cam__scan {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    color-mix(in srgb, var(--color-accent) 8%, transparent) 0,
    color-mix(in srgb, var(--color-accent) 8%, transparent) 1px,
    transparent 1px,
    transparent 4px
  );
  pointer-events: none;
}

.cam__badge {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 1;
  font-size: var(--font-size-caption);
  padding: 2px 8px;
  border-radius: 3px;
  font-weight: 600;
}

.cam__badge.is-live {
  color: var(--color-danger);
  background: color-mix(in srgb, var(--color-danger) 16%, transparent);
}

.cam__badge.is-loading {
  color: var(--color-warning);
  background: color-mix(in srgb, var(--color-warning) 16%, transparent);
}

.cam__badge.is-ai {
  color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 16%, transparent);
}

/* 摄像机 CSS 字形（纯 CSS，覆盖在画面右下角，提示为摄像机预览） */
.cam__glyph {
  position: absolute;
  right: 10px;
  bottom: 10px;
  width: 22px;
  height: 16px;
  border: 2px solid var(--color-accent);
  border-radius: 3px;
  background: color-mix(in srgb, var(--color-accent) 18%, transparent);
}

.cam__glyph::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 7px;
  height: 7px;
  border: 2px solid var(--color-accent);
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.cam__glyph::after {
  content: '';
  position: absolute;
  top: -6px;
  left: 4px;
  width: 6px;
  height: 4px;
  border: 2px solid var(--color-accent);
  border-bottom: none;
  border-radius: 2px 2px 0 0;
}

.cam__meta {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding: var(--space-md);
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-sm);
  background: var(--panel-inner-bg);
}

.cam__row {
  display: flex;
  align-items: baseline;
  gap: var(--space-sm);
  font-size: var(--font-size-biz);
}

.cam__row--wrap {
  align-items: flex-start;
}

.cam__k {
  flex: none;
  width: 72px;
  color: var(--color-text-muted);
}

.cam__v {
  color: var(--color-text-strong);
}

.cam__v.is-live {
  color: var(--color-danger);
}

.cam__v.is-loading {
  color: var(--color-warning);
}

.cam__v.is-ai {
  color: var(--color-accent);
}

.cam__controls {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  flex-shrink: 0;
}

.cam__btn {
  height: 36px;
  padding: 0 18px;
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--color-accent) 8%, transparent);
  color: var(--color-text);
  font-size: var(--font-size-biz);
  cursor: pointer;
}

.cam__btn:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}
</style>
