<!--
  FireFacilityPanel — §消防救援「消防设施运行监测」
  双仪表盘（在线率 / 故障率）+ 设备总数/离线/故障 概览数字。
-->
<script setup lang="ts">
import PanelCard from '@/components/common/PanelCard.vue';
import GaugeChart from '@/components/charts/GaugeChart.vue';

const gauges = [
  { key: 'online', label: '在线率', value: 98, color: '#2ee6a8' },
  { key: 'fault', label: '故障率', value: 98, color: '#00e1ff' },
];

const summary = [
  { label: '设备总数', value: 1233 },
  { label: '离线设备', value: 23 },
  { label: '故障设备', value: 23 },
];
</script>

<template>
  <PanelCard title="消防设施运行监测" icon="Odometer">
    <div class="gauge-row">
      <div v-for="g in gauges" :key="g.key" class="gauge-cell">
        <div class="gauge-cell__chart">
          <GaugeChart :value="g.value" :label="'%'" :color="g.color" />
        </div>
        <div class="gauge-cell__label">{{ g.label }}</div>
      </div>
    </div>
    <div class="summary-row">
      <div v-for="s in summary" :key="s.label" class="summary-item">
        <span class="summary-item__value">{{ s.value }}</span>
        <span class="summary-item__label">{{ s.label }}</span>
      </div>
    </div>
  </PanelCard>
</template>

<style scoped>
.gauge-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
}

.gauge-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.gauge-cell__chart {
  width: 100%;
  height: 110px;
}

.gauge-cell__label {
  margin-top: 2px;
  font-size: 13px;
  color: var(--color-text-muted);
  letter-spacing: 1px;
}

.summary-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-sm);
  margin-top: var(--space-md);
  padding-top: var(--space-sm);
  border-top: 1px solid var(--panel-border, rgb(0 216 255 / 18%));
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.summary-item__value {
  font-family: var(--font-number);
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-strong);
}

.summary-item__label {
  font-size: 12px;
  color: var(--color-text-muted);
}
</style>
