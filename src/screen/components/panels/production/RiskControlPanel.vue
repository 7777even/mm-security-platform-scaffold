<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import PanelCard from '../../common/PanelCard.vue';
import { Warning } from '@element-plus/icons-vue';
import {
  fetchProductionOverview,
  fetchProductionRiskWarnings,
  type RiskSummary,
  type RiskWarningItem,
} from '@/services/production';
import { usePlantArea } from '../../../lib/composables/usePlantArea';

const { filterByPlantArea, scaleAreaCount } = usePlantArea();
const riskSummary = ref<RiskSummary>({ red: 0, orange: 0, yellow: 0 });
const riskWarnings = ref<RiskWarningItem[]>([]);

onMounted(async () => {
  try {
    const overview = await fetchProductionOverview();
    riskSummary.value = overview.riskSummary;
  } catch {
    // 暴露式降级：保持零值，不静默回落硬编码假数据
  }
  try {
    riskWarnings.value = await fetchProductionRiskWarnings();
  } catch {
    riskWarnings.value = [];
  }
});

const visibleRiskWarnings = computed(() => filterByPlantArea(riskWarnings.value));
</script>

<template>
  <PanelCard title="重大风险管控" variant="risk" module="production">
    <div class="risk-panel">
      <div class="risk-panel__summary">
        <div class="risk-summary-item risk-summary-item--red">
          <span class="risk-summary-item__icon" aria-hidden="true"><Warning /></span>
          <span class="risk-summary-item__label">红色预警</span>
          <span class="risk-summary-item__value">{{ scaleAreaCount(riskSummary.red) }}</span>
        </div>
        <div class="risk-summary-item risk-summary-item--orange">
          <span class="risk-summary-item__icon" aria-hidden="true"><Warning /></span>
          <span class="risk-summary-item__label">橙色预警</span>
          <span class="risk-summary-item__value">{{ scaleAreaCount(riskSummary.orange) }}</span>
        </div>
        <div class="risk-summary-item risk-summary-item--yellow">
          <span class="risk-summary-item__icon" aria-hidden="true"><Warning /></span>
          <span class="risk-summary-item__label">黄色预警</span>
          <span class="risk-summary-item__value">{{ scaleAreaCount(riskSummary.yellow) }}</span>
        </div>
      </div>

      <div class="risk-panel__list">
        <div v-for="item in visibleRiskWarnings" :key="item.id" class="risk-card">
          <div class="risk-card__head">
            <div class="risk-card__tag">
              <span class="risk-card__tag-icon" aria-hidden="true"><Warning /></span>
              <span class="risk-card__tag-text">{{ item.levelLabel }}</span>
            </div>
            <span class="risk-card__location">{{ item.location }}</span>
          </div>
          <div class="risk-card__body">
            <div class="risk-card__row">
              <span class="risk-card__label">{{ item.type }}：</span>
              <span class="risk-card__value">{{ item.time }}</span>
            </div>
            <div class="risk-card__footer">
              <span><span class="risk-card__label">责任人：</span>{{ item.person }}</span>
              <span
                ><span class="risk-card__label">联系方式：</span><em>{{ item.phone }}</em></span
              >
            </div>
          </div>
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
  padding: 6px 10px 10px;
}

.risk-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 100%;
  min-height: 0;
}

.risk-panel__summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  flex-shrink: 0;
}

.risk-summary-item {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 44px;
  padding: 0 8px;
  background: var(--btn-bg);
  border: 1px solid rgb(0 130 210 / 28%);
  border-radius: 2px;
  box-sizing: border-box;
}

.risk-summary-item__label {
  flex: 1;
  font-size: 12px;
  color: #c8d4e8;
  white-space: nowrap;
}

.risk-summary-item__icon {
  display: inline-flex;
  flex-shrink: 0;
  width: 22px;
  height: 22px;
}

.risk-summary-item__icon svg {
  width: 100%;
  height: 100%;
  fill: currentcolor;
}

.risk-summary-item--red .risk-summary-item__icon {
  color: var(--color-danger);
}

.risk-summary-item--orange .risk-summary-item__icon {
  color: var(--color-alarm-2);
}

.risk-summary-item--yellow .risk-summary-item__icon {
  color: var(--color-alarm-3);
}

.risk-summary-item__value {
  font-size: 26px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
  font-family: var(--font-display);
}

.risk-summary-item--red .risk-summary-item__value {
  color: var(--color-danger);
}

.risk-summary-item--orange .risk-summary-item__value {
  color: var(--color-alarm-2);
}

.risk-summary-item--yellow .risk-summary-item__value {
  color: var(--color-alarm-3);
}

.risk-panel__list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.risk-card {
  padding: 10px 12px;
  background: rgb(0 20 45 / 70%);
  border: 1px solid rgb(0 130 210 / 32%);
  border-radius: 2px;
  box-sizing: border-box;
}

.risk-card__head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.risk-card__tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  padding: 3px 10px 3px 6px;
  background: linear-gradient(180deg, var(--color-warning) 0%, #c88a10 100%);
  border-radius: 2px;
}

.risk-card__tag-icon {
  display: inline-flex;
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  color: var(--color-text-strong);
}

.risk-card__tag-icon svg {
  width: 100%;
  height: 100%;
  fill: currentcolor;
}

.risk-card__tag-text {
  font-size: 12px;
  color: var(--color-text-strong);
  white-space: nowrap;
  line-height: 1;
}

.risk-card__location {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-strong);
}

.risk-card__body {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.risk-card__row {
  font-size: 12px;
}

.risk-card__label {
  color: var(--color-text-muted);
}

.risk-card__value {
  color: #c8d4e8;
}

.risk-card__footer {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 12px;
  color: #c8d4e8;
}

.risk-card__footer em {
  font-style: normal;
  color: var(--color-alarm-2);
}
</style>
