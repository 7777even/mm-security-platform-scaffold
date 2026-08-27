<!--
  FireStrengthPanel — §消防救援「消防数据力量」
  指标名称 + 大数字（StatCard ×4），绿色玻璃卡。
-->
<script setup lang="ts">
import PanelCard from '@/components/common/PanelCard.vue';
import StatCard from '@/components/common/StatCard.vue';

const stats = [
  { title: '消防站', value: 10, icon: 'OfficeBuilding' },
  { title: '救援人员', value: 398, icon: 'User' },
  { title: '救援设备', value: 123, icon: 'Tools' },
  { title: '救援车辆', value: 83, icon: 'Truck' },
];
</script>

<template>
  <PanelCard title="消防数据力量" icon="DataBoard">
    <div class="strength-grid">
      <StatCard
        v-for="s in stats"
        :key="s.title"
        :title="s.title"
        :value="s.value"
        :icon="s.icon"
      />
    </div>
  </PanelCard>
</template>

<style scoped>
.strength-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-sm);
}
</style>
