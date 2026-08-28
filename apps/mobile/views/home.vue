<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { locationBridge } from '../bridges';

// 首页：问候语 + 今日概览状态卡 + 单主行动「立即上报」（一屏一个实心胶囊主按钮）
// 状态卡数值为 mock；接入后由 /mobile/workbench 概要接口驱动
const stats = [
  { label: '今日任务', value: '6', tag: '' },
  { label: '待处理告警', value: '2', tag: 'tag--danger' },
  { label: '离线待补发', value: '0', tag: 'tag--success' },
];

const userName = ref('张巡检');
const positionText = ref('定位中…');

const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 6) return '凌晨好';
  if (hour < 12) return '上午好';
  if (hour < 18) return '下午好';
  return '晚上好';
});

// 演示 bridges 用法：经桥接层取位，页面不直调 navigator.geolocation
onMounted(async () => {
  try {
    const pos = await locationBridge.getPosition();
    positionText.value = `E ${pos.lng.toFixed(4)} · N ${pos.lat.toFixed(4)}`;
  } catch {
    positionText.value = '定位不可用（H5 降级环境）';
  }
});
</script>

<template>
  <div class="mb-page">
    <header class="home-hero">
      <h1 class="home-hero__title">{{ greeting }}，{{ userName }}</h1>
      <p class="home-hero__position">{{ positionText }}</p>
    </header>

    <div class="home-stats">
      <div v-for="stat in stats" :key="stat.label" class="mb-card home-stat">
        <span class="home-stat__value">{{ stat.value }}</span>
        <span class="home-stat__label">{{ stat.label }}</span>
        <span v-if="stat.tag" class="tag" :class="stat.tag">待跟进</span>
      </div>
    </div>

    <button type="button" class="mb-btn-primary home-report">立即上报</button>
  </div>
</template>

<style scoped>
.home-hero {
  padding: var(--space-md) 0 var(--space-sm);
}

.home-hero__title {
  margin: 0;
  font-size: var(--mb-fz-hero);
  font-weight: 700;
  color: var(--text-title-mobile);
}

.home-hero__position {
  margin: var(--space-xs) 0 0;
  font-size: var(--mb-fz-help);
  color: var(--text-muted-mobile);
}

.home-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--mb-card-gap);
}

.home-stat {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  align-items: flex-start;
}

.home-stat__value {
  font-size: var(--mb-fz-page);
  font-weight: 700;
  color: var(--text-title-mobile);
}

.home-stat__label {
  font-size: var(--mb-fz-help);
  color: var(--text-muted-mobile);
}

.home-report {
  margin-top: var(--space-md);
}
</style>
