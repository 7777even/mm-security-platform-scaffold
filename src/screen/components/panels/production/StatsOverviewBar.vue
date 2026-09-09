<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import ProductionStatCard from '../../common/ProductionStatCard.vue';
import { fetchProductionOverview, type StatOverviewItem } from '@/services/production';

const stats = ref<StatOverviewItem[]>([]);

onMounted(async () => {
  try {
    const overview = await fetchProductionOverview();
    stats.value = overview.stats;
  } catch {
    // 暴露式降级：后端不可用保持空列表，不静默回落硬编码假数据
    stats.value = [];
  }
});

const visibleStats = computed(() => stats.value);
</script>

<template>
  <section class="stats-bar">
    <div class="stats-bar__items">
      <ProductionStatCard v-for="item in visibleStats" :key="item.id" :stat="item" />
    </div>
  </section>
</template>

<style scoped>
.stats-bar {
  height: 117px;
  pointer-events: auto;
  background: rgb(0 16 36 / 88%);
  border: 1px solid rgb(0 150 230 / 35%);
  border-radius: 2px;
  box-shadow:
    inset 0 1px 0 rgb(0 200 255 / 12%),
    inset 0 -1px 0 rgb(0 80 160 / 20%);
}

.stats-bar__items {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  height: 100%;
  padding: 12px 8px 10px;
}

.stats-bar__items > :deep(*:not(:last-child)) {
  border-right: 1px solid rgb(0 140 220 / 18%);
}
</style>
