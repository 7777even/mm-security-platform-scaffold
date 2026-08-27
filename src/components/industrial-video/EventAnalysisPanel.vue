<!--
  EventAnalysisPanel — §工业电视「事件分析」
  顶部预警总数 / 7天；左侧大环形（总数事件）按 6 类分段，右侧分类图例。
-->
<script setup lang="ts">
import { computed } from 'vue';
import PanelCard from '@/components/common/PanelCard.vue';

interface Slice {
  label: string;
  value: number;
  color: string;
}

const total = 450;
const warnTotal = 110;

const slices: Slice[] = [
  { label: '人员闯入', value: 150, color: '#00e1ff' },
  { label: '烟火检测', value: 100, color: '#ffc24b' },
  { label: '生产安全帽', value: 100, color: '#2ee6a8' },
  { label: '区域入侵', value: 152, color: '#ff6b6b' },
  { label: '设备异常', value: 120, color: '#a78bfa' },
  { label: '其他', value: 48, color: '#9fb3c8' },
];

const ringBg = computed(() => {
  const t = slices.reduce((s, x) => s + x.value, 0) || 1;
  let acc = 0;
  const stops = slices.map((x) => {
    const start = (acc / t) * 100;
    acc += x.value;
    const end = (acc / t) * 100;
    return `${x.color} ${start}% ${end}%`;
  });
  return `conic-gradient(${stops.join(', ')})`;
});
</script>

<template>
  <PanelCard title="事件分析" icon="Warning">
    <div class="head">
      <div class="head__item">
        <span class="head__label">预警总数</span>
        <span class="head__value">{{ warnTotal }}</span>
      </div>
      <div class="head__period">/ 7天</div>
    </div>

    <div class="row">
      <div class="donut" :style="{ background: ringBg }">
        <div class="donut__center">
          <div class="donut__label">总数事件</div>
          <div class="donut__total">{{ total }}</div>
        </div>
      </div>
      <ul class="legend">
        <li v-for="s in slices" :key="s.label">
          <span class="legend__dot" :style="{ background: s.color }" />
          <span class="legend__label">{{ s.label }}</span>
          <span class="legend__value">{{ s.value }}</span>
        </li>
      </ul>
    </div>
  </PanelCard>
</template>

<style scoped>
.head {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 8px;
}

.head__item {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.head__label {
  font-size: 12px;
  color: var(--color-text-muted);
}

.head__value {
  font-family: var(--font-number);
  font-size: 18px;
  font-weight: 700;
  color: var(--color-accent);
}

.head__period {
  font-size: 12px;
  color: var(--color-text-muted);
}

.row {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.donut {
  position: relative;
  width: 116px;
  height: 116px;
  border-radius: 50%;
  flex-shrink: 0;
  mask: radial-gradient(circle, transparent 56%, black 57%);
}

.donut__center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.donut__label {
  font-size: 11px;
  color: var(--color-text-muted);
  letter-spacing: 1px;
}

.donut__total {
  font-family: var(--font-number);
  font-size: 26px;
  font-weight: 700;
  color: var(--color-text-strong);
  line-height: 1.1;
  margin-top: 2px;
}

.legend {
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.legend li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.legend__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend__label {
  flex: 1;
  color: var(--color-text);
}

.legend__value {
  font-family: var(--font-number);
  font-weight: 600;
  color: var(--color-text-strong);
}
</style>
