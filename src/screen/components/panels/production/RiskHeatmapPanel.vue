<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import PanelCard from '../../common/PanelCard.vue';
import { fetchRiskZones, type RiskZone } from '@/services/map';

const zones = ref<RiskZone[]>([]);
const loading = ref(true);
const failed = ref(false);

const maxScore = computed(() => {
  const m = Math.max(0, ...zones.value.map((z) => z.score));
  return m > 0 ? m : 1;
});

const ranked = computed(() => [...zones.value].sort((a, b) => b.score - a.score));

function tierColor(score: number): string {
  if (score >= 4) return '#ff5a5a';
  if (score >= 3) return '#ff9f43';
  if (score >= 2) return '#ffd93b';
  return '#4db8ff';
}

function barWidth(score: number): string {
  return `${Math.min(100, (score / maxScore.value) * 100)}%`;
}

onMounted(async () => {
  loading.value = true;
  try {
    zones.value = await fetchRiskZones();
  } catch {
    failed.value = true;
    zones.value = [];
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <PanelCard title="区域风险热力" variant="facilities" module="production">
    <template #header-extra>
      <span v-if="!loading && ranked.length" class="risk-heat__peak">
        峰值 {{ maxScore.toFixed(1) }}
      </span>
    </template>

    <div class="risk-heat">
      <div v-if="loading" class="risk-heat__state">风险数据加载中…</div>
      <div v-else-if="failed || !ranked.length" class="risk-heat__state">暂无风险区域数据</div>

      <ul v-else class="risk-heat__list">
        <li v-for="z in ranked" :key="z.name" class="risk-heat__row">
          <span class="risk-heat__name" :title="z.name">{{ z.name }}</span>
          <span class="risk-heat__bar">
            <i
              class="risk-heat__bar-fill"
              :style="{ width: barWidth(z.score), background: tierColor(z.score) }"
            />
          </span>
          <span class="risk-heat__score" :style="{ color: tierColor(z.score) }">
            {{ z.score.toFixed(1) }}
          </span>
        </li>
      </ul>
    </div>
  </PanelCard>
</template>

<style scoped>
.risk-heat {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.risk-heat__peak {
  font-size: 12px;
  color: #9fc2e0;
  font-family: var(--font-body);
}

.risk-heat__state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6a829e;
  font-size: 13px;
  font-family: var(--font-body);
}

.risk-heat__list {
  flex: 1;
  min-height: 0;
  overflow: auto;
  margin: 0;
  padding: 4px 2px;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
  scrollbar-width: thin;
  scrollbar-color: rgb(0 160 255 / 45%) rgb(0 25 55 / 50%);
}

.risk-heat__row {
  display: grid;
  grid-template-columns: 96px 1fr 44px;
  align-items: center;
  gap: 10px;
}

.risk-heat__name {
  font-size: 13px;
  color: #e8f2fc;
  font-family: var(--font-body);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.risk-heat__bar {
  position: relative;
  height: 8px;
  border-radius: 4px;
  background: rgb(0 28 58 / 70%);
  overflow: hidden;
}

.risk-heat__bar-fill {
  position: absolute;
  inset: 0 auto 0 0;
  display: block;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.risk-heat__score {
  text-align: right;
  font-size: 14px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
</style>
