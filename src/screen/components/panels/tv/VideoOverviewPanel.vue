<script setup lang="ts">
import { computed } from 'vue';
import PanelCard from '../../common/PanelCard.vue';
import { fetchTvOverview } from '@/services/tv';
import { useScreenAsyncState } from '../../../lib/composables/useScreenAsyncState';
import { usePlantArea } from '../../../lib/composables/usePlantArea';

const { scaleAreaCount } = usePlantArea();
const { data: overview } = useScreenAsyncState('tv', '/tv/overview', fetchTvOverview);
const overviewItems = computed(() => overview.value?.overviewItems ?? []);
</script>

<template>
  <PanelCard title="视频监控概览" variant="videoOverview" module="tv">
    <div class="video-overview">
      <div v-for="item in overviewItems" :key="item.id" class="video-overview__cell">
        <div class="video-overview__icon-box">
          <i
            class="video-overview__icon"
            :class="`video-overview__icon--${item.iconIndex}`"
            aria-hidden="true"
          />
        </div>
        <div class="video-overview__info">
          <div class="video-overview__label">{{ item.label }}</div>
          <div class="video-overview__value">{{ scaleAreaCount(item.value) }}</div>
        </div>
      </div>
    </div>
  </PanelCard>
</template>

<style scoped>
:deep(.panel-card__content) {
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 6px 10px 12px;
}

.video-overview {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 6px;
  height: 100%;
}

.video-overview__cell {
  position: relative;
  display: flex;
  align-items: center;
  gap: 9px;
  min-height: 0;
  padding: 0 9px;
  box-sizing: border-box;
  background: linear-gradient(135deg, rgb(0 28 58 / 72%) 0%, rgb(0 14 32 / 55%) 100%);
  border: 1px solid rgb(0 130 210 / 28%);
  border-radius: 2px;
  overflow: hidden;
}

.video-overview__cell::before,
.video-overview__cell::after {
  content: '';
  position: absolute;
  width: 8px;
  height: 8px;
  border-color: rgb(0 200 255 / 45%);
  border-style: solid;
  pointer-events: none;
}

.video-overview__cell::before {
  top: 0;
  left: 0;
  border-width: 1px 0 0 1px;
}

.video-overview__cell::after {
  right: 0;
  bottom: 0;
  border-width: 0 1px 1px 0;
}

.video-overview__icon-box {
  position: relative;
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(0 55 110 / 35%);
  border: 1px solid rgb(0 160 255 / 22%);
  border-radius: 2px;
}

.video-overview__icon {
  position: relative;
  display: block;
  width: 24px;
  height: 24px;
  color: var(--color-accent);
}

.video-overview__icon::before,
.video-overview__icon::after {
  position: absolute;
  box-sizing: border-box;
  content: '';
}

/* 重大危险源 — 警告三角 */
.video-overview__icon--0::before {
  left: 50%;
  top: 2px;
  width: 0;
  height: 0;
  border-left: 11px solid transparent;
  border-right: 11px solid transparent;
  border-bottom: 19px solid currentcolor;
  transform: translateX(-50%);
}

.video-overview__icon--0::after {
  left: 50%;
  top: 10px;
  width: 2px;
  height: 7px;
  background: var(--color-bg);
  border-radius: 1px;
  transform: translateX(-50%);
  box-shadow: 0 9px 0 var(--color-bg);
}

/* 生产设施 — 厂房 */
.video-overview__icon--1::before {
  left: 3px;
  bottom: 2px;
  width: 18px;
  height: 12px;
  border: 2px solid currentcolor;
  border-top: none;
}

.video-overview__icon--1::after {
  left: 50%;
  top: 2px;
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 8px solid currentcolor;
  transform: translateX(-50%);
}

/* 厂界 — 围栏框 */
.video-overview__icon--2::before {
  inset: 3px;
  border: 2px dashed currentcolor;
  border-radius: 1px;
  opacity: 0.85;
}

.video-overview__icon--2::after {
  left: 50%;
  top: 50%;
  width: 8px;
  height: 8px;
  border: 2px solid currentcolor;
  transform: translate(-50%, -50%);
}

/* 封闭入口 — 闸门 */
.video-overview__icon--3::before {
  left: 4px;
  top: 4px;
  width: 16px;
  height: 16px;
  border: 2px solid currentcolor;
  border-radius: 1px;
}

.video-overview__icon--3::after {
  left: 9px;
  top: 6px;
  width: 2px;
  height: 12px;
  background: currentcolor;
  box-shadow: 4px 0 0 currentcolor;
}

/* 其他入口 — 箭头入门 */
.video-overview__icon--4::before {
  left: 4px;
  bottom: 3px;
  width: 12px;
  height: 14px;
  border: 2px solid currentcolor;
  border-top: none;
}

.video-overview__icon--4::after {
  right: 2px;
  top: 8px;
  width: 8px;
  height: 8px;
  border-top: 2px solid currentcolor;
  border-right: 2px solid currentcolor;
  transform: rotate(45deg);
}

/* 其它 — 监控点 */
.video-overview__icon--5::before {
  left: 50%;
  top: 4px;
  width: 12px;
  height: 8px;
  border: 2px solid currentcolor;
  border-radius: 2px 2px 0 0;
  transform: translateX(-50%);
}

.video-overview__icon--5::after {
  left: 50%;
  bottom: 3px;
  width: 6px;
  height: 6px;
  background: currentcolor;
  border-radius: 50%;
  transform: translateX(-50%);
  box-shadow: 0 -10px 0 -1px currentcolor;
}

.video-overview__info {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.video-overview__label {
  font-size: 12px;
  color: #7cdbff;
  line-height: 1.3;
  white-space: nowrap;
  overflow: visible;
}

.video-overview__value {
  margin-top: 4px;
  font-size: 22px;
  font-weight: 700;
  color: #7cdbff;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
</style>
