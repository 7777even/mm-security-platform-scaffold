<script setup lang="ts">
import { onMounted, ref } from 'vue';
import PanelCard from '@/components/common/PanelCard.vue';
import { fetchEmergencyStrength } from '@/services/emergency';
import type { EmergencyResource } from '@/services/emergency';

const resources = ref<EmergencyResource[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const r = await fetchEmergencyStrength();
    resources.value = r?.resources ?? [];
  } catch {
    resources.value = [];
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <PanelCard title="应急力量数据" icon="DataAnalysis">
    <ul v-if="!loading && resources.length > 0" class="strength-grid" data-test="emergency-strength-grid">
      <li v-for="r in resources" :key="r.kind" class="strength-cell">
        <span class="strength-cell__num font-number">{{ r.total }}</span>
        <span class="strength-cell__label">{{ r.kind }}</span>
      </li>
    </ul>
    <p v-else-if="loading" class="strength-empty">力量数据加载中…</p>
    <p v-else class="strength-empty">暂无应急力量数据</p>
  </PanelCard>
</template>

<style scoped>
.strength-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.strength-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 4px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 6px;
  text-align: center;
  transition: border-color 0.15s, background 0.15s;
}

.strength-cell:hover {
  border-color: rgba(0, 212, 255, 0.5);
  background: rgba(0, 212, 255, 0.06);
}

.strength-cell__num {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-accent);
  line-height: 1.1;
}

.strength-cell__label {
  font-size: 11px;
  color: var(--color-text-secondary, #cbd5e1);
  margin-top: 4px;
}

.strength-empty {
  text-align: center;
  color: var(--color-text-muted, #94a3b8);
  font-size: 12px;
  padding: 16px 0;
}
</style>