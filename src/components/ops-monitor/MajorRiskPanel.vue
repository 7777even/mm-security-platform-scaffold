<!--
  MajorRiskPanel — §生产应急「重大风险管控」
  顶部 3 色预警计数（红 / 橙 / 黄）+ 底部二维码健康证（占位）。
-->
<script setup lang="ts">
import PanelCard from '@/components/common/PanelCard.vue';

interface Risk {
  key: 'red' | 'orange' | 'yellow';
  label: string;
  count: number;
  color: string;
}

const risks: Risk[] = [
  { key: 'red', label: '红点预警', count: 0, color: '#ff4d4f' },
  { key: 'orange', label: '橙色预警', count: 0, color: '#ff8a4c' },
  { key: 'yellow', label: '黄色预警', count: 1, color: '#ffc24b' },
];

function view(): void {
  console.warn('[major-risk] view');
}
</script>

<template>
  <PanelCard title="重大风险管控" icon="WarningFilled" more="查看详情" @more="view">
    <div class="stats">
      <div v-for="r in risks" :key="r.key" class="stat">
        <span class="stat__dot" :style="{ background: r.color }" />
        <span class="stat__label">{{ r.label }}</span>
        <span class="stat__count">{{ r.count }}</span>
      </div>
    </div>

    <div class="qr">
      <div class="qr__box">
        <span class="qr__hint">二维码占位</span>
      </div>
      <div class="qr__main">
        <div class="qr__head">
          <span class="qr__title">二维码健康证</span>
          <span class="qr__badge">J42</span>
        </div>
        <div class="qr__row">
          <span class="qr__label">负责人</span>
          <span class="qr__value">J42</span>
        </div>
        <div class="qr__row">
          <span class="qr__label">时间</span>
          <span class="qr__value">2026-03-17 10:00:46</span>
        </div>
        <div class="qr__row">
          <span class="qr__label">联系方式</span>
          <span class="qr__value">6234123456</span>
        </div>
      </div>
    </div>
  </PanelCard>
</template>

<style scoped>
.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: var(--radius-sm);
  background: rgb(255 255 255 / 3%);
  border: 1px solid var(--panel-border, rgb(0 216 255 / 15%));
}

.stat__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.stat__label {
  flex: 1;
  font-size: 12px;
  color: var(--color-text-muted);
}

.stat__count {
  font-family: var(--font-number);
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-strong);
}

.qr {
  display: flex;
  gap: 12px;
  padding: 10px;
  border-radius: var(--radius-sm);
  background: rgb(255 255 255 / 3%);
  border: 1px solid var(--panel-border, rgb(0 216 255 / 15%));
}

.qr__box {
  width: 88px;
  height: 88px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background: repeating-conic-gradient(#fff 0% 25%, #2c3e50 0% 50%) 50% / 8px 8px;
  border: 1px solid var(--panel-border, rgb(0 216 255 / 30%));
}

.qr__hint {
  font-size: 10px;
  color: #fff;
  background: rgb(0 0 0 / 60%);
  padding: 1px 4px;
  border-radius: 4px;
}

.qr__main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.qr__head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.qr__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-strong);
}

.qr__badge {
  font-family: var(--font-number);
  font-size: 11px;
  padding: 1px 8px;
  border-radius: 8px;
  color: #fff;
  background: #ffc24b;
  border: 1px solid rgb(255 194 75 / 55%);
}

.qr__row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.qr__label {
  color: var(--color-text-muted);
}

.qr__value {
  color: var(--color-text-strong);
  font-family: var(--font-number);
}
</style>
