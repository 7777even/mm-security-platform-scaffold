<script setup lang="ts">
import { ref } from 'vue';
import { videoControlPages, type GridLayout } from '@/services/map-data/videoControlMock';
import { showToast } from '@/composables/useToast';
import { useVideoControlInteraction } from '@/composables/useVideoControlInteraction';

defineProps<{
  page: number;
  layout: GridLayout;
}>();

const emit = defineEmits<{
  'update:page': [page: number];
  'update:layout': [layout: GridLayout];
}>();

const ia = useVideoControlInteraction();
const muted = ref(false);

const layouts: { key: GridLayout; label: string; cols: number }[] = [
  { key: '1x1', label: '1×1', cols: 1 },
  { key: '2x2', label: '2×2', cols: 2 },
  { key: '3x3', label: '3×3', cols: 3 },
];

function toggleFullscreen(): void {
  if (document.fullscreenElement) {
    void document.exitFullscreen();
    showToast('已退出全屏');
  } else {
    const el = document.documentElement;
    const p = el.requestFullscreen?.();
    if (p && typeof p.catch === 'function') {
      p.catch(() => showToast('当前环境不支持全屏'));
    } else {
      showToast('已请求全屏（前端 mock）');
    }
  }
}

function openControlPage(): void {
  ia.openControlPage();
}

function toggleVolume(): void {
  muted.value = !muted.value;
  showToast(muted.value ? '已静音' : '已取消静音');
}

function openDeviceList(): void {
  ia.openDeviceList();
}
</script>

<template>
  <footer class="vc-bottom">
    <div class="vc-bottom__layouts">
      <button
        v-for="item in layouts"
        :key="item.key"
        type="button"
        class="vc-layout-btn"
        :class="{ 'vc-layout-btn--active': layout === item.key }"
        :aria-label="item.label"
        @click="emit('update:layout', item.key)"
      >
        <i class="vc-layout-btn__icon" :style="{ '--cols': item.cols }" aria-hidden="true" />
        <span class="vc-layout-btn__label">{{ item.label }}</span>
      </button>
    </div>

    <div class="vc-bottom__pager">
      <button
        type="button"
        class="vc-pager-btn"
        :disabled="page <= 1"
        aria-label="上一页"
        @click="emit('update:page', page - 1)"
      >
        <i class="vc-pager-btn__arrow vc-pager-btn__arrow--left" aria-hidden="true" />
      </button>

      <button
        v-for="p in videoControlPages"
        :key="p"
        type="button"
        class="vc-pager-num"
        :class="{ 'vc-pager-num--active': page === p }"
        @click="emit('update:page', p)"
      >
        {{ p }}
      </button>

      <button
        type="button"
        class="vc-pager-btn"
        :disabled="page >= videoControlPages.length"
        aria-label="下一页"
        @click="emit('update:page', page + 1)"
      >
        <i class="vc-pager-btn__arrow vc-pager-btn__arrow--right" aria-hidden="true" />
      </button>
    </div>

    <div class="vc-bottom__actions">
      <button type="button" class="vc-action-btn" aria-label="全屏" @click="toggleFullscreen">
        <i class="vc-action-btn__icon vc-action-btn__icon--fullscreen" aria-hidden="true" />
      </button>
      <button type="button" class="vc-action-btn" aria-label="布局" @click="openControlPage">
        <i class="vc-action-btn__icon vc-action-btn__icon--layout" aria-hidden="true" />
      </button>
      <button type="button" class="vc-action-btn" aria-label="音量" @click="toggleVolume">
        <i class="vc-action-btn__icon vc-action-btn__icon--volume" aria-hidden="true" />
      </button>
      <button type="button" class="vc-action-btn" aria-label="菜单" @click="openDeviceList">
        <i class="vc-action-btn__icon vc-action-btn__icon--menu" aria-hidden="true" />
      </button>
    </div>
  </footer>
</template>

<style scoped>
.vc-bottom {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
  height: 77px;
  padding: 0 38px;
  background: linear-gradient(180deg, rgb(0 24 52 / 95%) 0%, rgb(0 12 28 / 98%) 100%);
  border-top: 1px solid rgb(0 130 210 / 35%);
  box-sizing: border-box;
}

.vc-bottom__layouts {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-self: start;
}

.vc-layout-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border: 1px solid rgb(0 120 200 / 30%);
  border-radius: 2px;
  background: rgb(0 30 60 / 50%);
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    background 0.2s ease;
}

.vc-layout-btn:hover,
.vc-layout-btn--active {
  border-color: rgb(0 180 255 / 55%);
  background: rgb(0 70 140 / 45%);
}

.vc-layout-btn__icon {
  --cell: rgb(0 200 255 / 85%);

  width: 17px;
  height: 14px;
}

.vc-layout-btn:nth-child(1) .vc-layout-btn__icon {
  background: linear-gradient(var(--cell), var(--cell)) center / 11px 11px;
}

.vc-layout-btn:nth-child(2) .vc-layout-btn__icon {
  background:
    linear-gradient(var(--cell), var(--cell)) 0 0 / 5px 5px,
    linear-gradient(var(--cell), var(--cell)) 7px 0 / 5px 5px,
    linear-gradient(var(--cell), var(--cell)) 0 7px / 5px 5px,
    linear-gradient(var(--cell), var(--cell)) 7px 7px / 5px 5px;
}

.vc-layout-btn:nth-child(3) .vc-layout-btn__icon {
  background:
    linear-gradient(var(--cell), var(--cell)) 0 0 / 5px 5px,
    linear-gradient(var(--cell), var(--cell)) 7px 0 / 5px 5px,
    linear-gradient(var(--cell), var(--cell)) 14px 0 / 5px 5px,
    linear-gradient(var(--cell), var(--cell)) 0 7px / 5px 5px,
    linear-gradient(var(--cell), var(--cell)) 7px 7px / 5px 5px,
    linear-gradient(var(--cell), var(--cell)) 14px 7px / 5px 5px;
}

.vc-layout-btn__label {
  font-size: 11px;
  color: #9ed8ff;
  line-height: 1;
}

.vc-bottom__pager {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-self: center;
}

.vc-pager-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid rgb(0 120 200 / 35%);
  border-radius: 50%;
  background: rgb(0 30 60 / 55%);
  cursor: pointer;
}

.vc-pager-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.vc-pager-btn__arrow {
  display: block;
  width: 8px;
  height: 8px;
  margin: 0 auto;
  border-top: 2px solid #7cdbff;
  border-right: 2px solid #7cdbff;
}

.vc-pager-btn__arrow--left {
  transform: rotate(-135deg) translate(1px, -1px);
}

.vc-pager-btn__arrow--right {
  transform: rotate(45deg) translate(-1px, 1px);
}

.vc-pager-num {
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid rgb(0 120 200 / 35%);
  border-radius: 50%;
  background: rgb(0 30 60 / 55%);
  font-size: 14px;
  color: #9ed8ff;
  cursor: pointer;
}

.vc-pager-num--active {
  border-color: rgb(0 200 255 / 65%);
  background: rgb(0 90 180 / 65%);
  color: #fff;
  font-weight: 600;
}

.vc-bottom__actions {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-self: end;
}

.vc-action-btn {
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid rgb(0 120 200 / 35%);
  border-radius: 2px;
  background: rgb(0 30 60 / 55%);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vc-action-btn:hover {
  border-color: rgb(0 180 255 / 50%);
  background: rgb(0 60 120 / 50%);
}

.vc-action-btn__icon {
  display: block;
  color: #7cdbff;
  position: relative;
}

.vc-action-btn__icon--fullscreen {
  width: 14px;
  height: 14px;
  border: 2px solid currentcolor;
}

.vc-action-btn__icon--fullscreen::before,
.vc-action-btn__icon--fullscreen::after {
  content: '';
  position: absolute;
  width: 4px;
  height: 4px;
  border: 2px solid currentcolor;
}

.vc-action-btn__icon--fullscreen::before {
  left: -3px;
  top: -3px;
  border-right: none;
  border-bottom: none;
}

.vc-action-btn__icon--fullscreen::after {
  right: -3px;
  bottom: -3px;
  border-left: none;
  border-top: none;
}

.vc-action-btn__icon--layout {
  width: 14px;
  height: 12px;
  border: 2px solid currentcolor;
  border-radius: 1px;
}

.vc-action-btn__icon--volume {
  width: 6px;
  height: 10px;
  border: 2px solid currentcolor;
  border-right: none;
  margin-right: 6px;
}

.vc-action-btn__icon--volume::after {
  content: '';
  position: absolute;
  left: 8px;
  top: 2px;
  width: 0;
  height: 0;
  border-top: 4px solid transparent;
  border-bottom: 4px solid transparent;
  border-left: 6px solid currentcolor;
}

.vc-action-btn__icon--menu {
  width: 14px;
  height: 2px;
  background: currentcolor;
  box-shadow:
    0 -5px 0 currentcolor,
    0 5px 0 currentcolor;
}
</style>
