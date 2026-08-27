<!--
  VideoAnalysisPanel — §工业电视「视频运行分析」
  顶部视频总量 + 两个并排环形进度：离线 / 故障，各显占比与预设值。
-->
<script setup lang="ts">
import PanelCard from '@/components/common/PanelCard.vue';

interface Ring {
  key: string;
  label: string;
  count: number;
  percent: number;
  preset: number;
}

const total = 1233;

const rings: Ring[] = [
  { key: 'offline', label: '离线', count: 23, percent: 98, preset: 90 },
  { key: 'fault', label: '故障', count: 23, percent: 98, preset: 90 },
];

function ringBg(r: Ring): string {
  return `conic-gradient(#ff6b6b 0% ${r.percent}%, rgba(255, 107, 107, 0.18) ${r.percent}% 100%)`;
}
</script>

<template>
  <PanelCard title="视频运行分析" icon="DataAnalysis">
    <div class="total">
      <span class="total__label">视频总量</span>
      <span class="total__value">{{ total }}</span>
    </div>

    <div class="rings">
      <div v-for="r in rings" :key="r.key" class="ring">
        <div class="ring__donut" :style="{ background: ringBg(r) }">
          <div class="ring__center">
            <div class="ring__count">{{ r.count }}</div>
            <div class="ring__unit">{{ r.label }}</div>
          </div>
        </div>
        <div class="ring__meta">
          <div class="ring__row">
            <span class="ring__row-label">占比</span>
            <span class="ring__row-value">{{ r.percent }}%</span>
          </div>
          <div class="ring__row ring__row--muted">
            <span class="ring__row-label">预设值</span>
            <span class="ring__row-value">{{ r.preset }}%</span>
          </div>
        </div>
      </div>
    </div>
  </PanelCard>
</template>

<style scoped>
.total {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--panel-border, rgb(0 216 255 / 18%));
}

.total__label {
  font-size: 12px;
  color: var(--color-text-muted);
}

.total__value {
  font-family: var(--font-number);
  font-size: 24px;
  font-weight: 700;
  color: var(--color-accent);
}

.rings {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
}

.ring {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ring__donut {
  position: relative;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  flex-shrink: 0;
  mask: radial-gradient(circle, transparent 52%, black 53%);
}

.ring__center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.ring__count {
  font-family: var(--font-number);
  font-size: 18px;
  font-weight: 700;
  color: #ff6b6b;
  line-height: 1.1;
}

.ring__unit {
  font-size: 11px;
  color: var(--color-text-muted);
}

.ring__meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.ring__row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.ring__row-label {
  color: var(--color-text-muted);
}

.ring__row-value {
  font-family: var(--font-number);
  font-weight: 600;
  color: #ff6b6b;
}

.ring__row--muted .ring__row-value {
  color: var(--color-text-strong);
}
</style>
