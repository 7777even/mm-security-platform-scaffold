<!--
  FireVideoDialog — 视频监控 / 现场监控（二级界面 video）
  对标参考视频监控弹窗：区域分类 + 视频墙网格（LIVE / 加载 / AI 识别）。
  数据消费 videoControlMock（videoControlCategories / videoControlPages / getVideoControlPage）。
  视频画面占位：压缩包 mock-cameras 监控抓拍图（按 thumbIndex 取图，cover 底图），不用脚手架图标。
  点击单元格为前端 mock（toast），无真实码流。
-->
<script setup lang="ts">
import { computed, ref } from 'vue';
import ScreenDialog from './ScreenDialog.vue';
import { showToast } from '@/composables/useToast';
import {
  videoControlCategories,
  videoControlPages,
  getVideoControlPage,
} from '@/services/map-data/videoControlMock';
import { cameraThumbByIndex } from '@/services/map-data/fireImages';
import type { FireAlarmListItem } from '@/services/map-data/fireAlarmListMock';

const props = defineProps<{ alarm?: FireAlarmListItem }>();
const emit = defineEmits<{ close: [] }>();

const cat = ref<string>(videoControlCategories[0]?.id ?? '');
const page = ref(1);
const cells = computed(() => getVideoControlPage(page.value));

function thumbOf(cell: { thumbIndex: number }): string {
  return cameraThumbByIndex(cell.thumbIndex);
}
function statusLabel(s: string): string {
  return s === 'live' ? 'LIVE' : s === 'loading' ? '加载中' : 'AI 识别';
}
function statusTone(s: string): 'live' | 'loading' | 'ai' {
  return s === 'live' ? 'live' : s === 'loading' ? 'loading' : 'ai';
}
function openCell(name: string): void {
  showToast(`正在打开监控：${name}`);
}
</script>

<template>
  <ScreenDialog :open="true" title="视频监控" icon="flame" @close="emit('close')">
    <div v-if="props.alarm" class="video__hint">
      关联告警：{{ props.alarm.title }} · {{ props.alarm.location }}
    </div>
    <div class="video">
      <aside class="video__cats">
        <button
          v-for="c in videoControlCategories"
          :key="c.id"
          type="button"
          :class="['video__cat', { 'video__cat--active': cat === c.id }]"
          @click="cat = c.id"
        >
          {{ c.label }}
        </button>
      </aside>

      <section class="video__main">
        <div class="video__grid">
          <button
            v-for="cell in cells"
            :key="cell.id"
            type="button"
            class="cell"
            @click="openCell(cell.name)"
          >
            <div class="cell__screen" :style="{ backgroundImage: `url(${thumbOf(cell)})` }">
              <span class="cell__badge" :class="`is-${statusTone(cell.status)}`">{{
                statusLabel(cell.status)
              }}</span>
              <span class="cell__scan" />
            </div>
            <div class="cell__meta">
              <span class="cell__name">{{ cell.name }}</span>
              <span class="cell__loc">{{ cell.location }}</span>
            </div>
          </button>
        </div>

        <div class="video__pager">
          <span class="video__total">共 {{ videoControlPages.length }} 页</span>
          <div class="pager">
            <button type="button" :disabled="page <= 1" @click="page = Math.max(1, page - 1)">
              上一页
            </button>
            <span class="pager__cur">{{ page }} / {{ videoControlPages.length }}</span>
            <button
              type="button"
              :disabled="page >= videoControlPages.length"
              @click="page = Math.min(videoControlPages.length, page + 1)"
            >
              下一页
            </button>
          </div>
        </div>
      </section>
    </div>
  </ScreenDialog>
</template>

<style scoped>
.video__hint {
  margin-bottom: var(--space-sm);
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--color-accent) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-accent) 40%, transparent);
  color: var(--color-text);
  font-size: var(--font-size-helper);
}

.video {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: var(--space-md);
  height: 100%;
}

.video__cats {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  overflow: auto;
}

.video__cat {
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--panel-border);
  background: color-mix(in srgb, var(--color-accent) 6%, transparent);
  color: var(--color-text-muted);
  font-size: var(--font-size-biz);
  cursor: pointer;
  text-align: left;
}

.video__cat--active {
  color: var(--color-accent);
  border-color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 14%, transparent);
}

.video__main {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  min-height: 0;
}

.video__grid {
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--space-sm);
  align-content: start;
}

.cell {
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-sm);
  background: var(--panel-inner-bg);
  overflow: hidden;
  cursor: pointer;
  padding: 0;
  color: var(--color-text);
}

.cell:hover {
  border-color: var(--color-accent);
}

.cell__screen {
  position: relative;
  height: 110px;
  background-color: color-mix(in srgb, var(--color-panel) 70%, transparent);
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  border-bottom: 1px solid var(--panel-border);
}

/* 监控画面扫描线（纯 CSS，强化"实时画面"观感，不引入额外图片） */
.cell__scan {
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

.cell__badge {
  position: absolute;
  top: 6px;
  left: 6px;
  font-size: var(--font-size-caption);
  padding: 1px 6px;
  border-radius: 3px;
  font-weight: 600;
}

.cell__badge.is-live {
  color: var(--color-danger);
  background: color-mix(in srgb, var(--color-danger) 16%, transparent);
}

.cell__badge.is-loading {
  color: var(--color-warning);
  background: color-mix(in srgb, var(--color-warning) 16%, transparent);
}

.cell__badge.is-ai {
  color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 16%, transparent);
}

.cell__meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 6px 8px;
  text-align: left;
}

.cell__name {
  font-size: var(--font-size-helper);
  color: var(--color-text-strong);
}

.cell__loc {
  font-size: var(--font-size-caption);
  color: var(--color-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.video__pager {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.video__total {
  font-size: var(--font-size-helper);
  color: var(--color-text-muted);
}

.pager {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.pager button {
  height: 30px;
  padding: 0 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--panel-border);
  background: color-mix(in srgb, var(--color-accent) 8%, transparent);
  color: var(--color-text);
  font-size: var(--font-size-helper);
  cursor: pointer;
}

.pager button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pager__cur {
  font-family: var(--font-number);
  font-size: var(--font-size-helper);
  color: var(--color-text-muted);
}
</style>
