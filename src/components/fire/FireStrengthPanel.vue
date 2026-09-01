<!--
  FireStrengthPanel — §消防报警「消防数据力量」
  指标名称 + 大数字（StatCard ×4），绿色玻璃卡。
  交互：点击任一指标卡 → 消防力量二级界面（替代原静态展示）。
  图标：压缩包 fire-situation 图标（经 StatCard 的 PkgIcon 分支渲染），不用脚手架图标库。
-->
<script setup lang="ts">
import PanelCard from '@/components/common/PanelCard.vue';
import StatCard from '@/components/common/StatCard.vue';
import { useFireAlarmInteraction } from '@/composables/useFireAlarmInteraction';

const ia = useFireAlarmInteraction();

const stats = [
  { title: '消防站', value: 10, icon: 'flame' },
  { title: '救援人员', value: 398, icon: 'helmet' },
  { title: '救援设备', value: 123, icon: 'ladder' },
  { title: '救援车辆', value: 83, icon: 'crane' },
];
</script>

<template>
  <PanelCard title="消防数据力量" icon="helmet">
    <div class="strength-grid">
      <div
        v-for="s in stats"
        :key="s.title"
        class="strength-cell"
        role="button"
        tabindex="0"
        @click="ia.openStrength()"
        @keyup.enter="ia.openStrength()"
      >
        <StatCard :title="s.title" :value="s.value" :icon="s.icon" />
      </div>
    </div>
  </PanelCard>
</template>

<style scoped>
.strength-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-sm);
}

.strength-cell {
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: transform 0.15s ease;
}

.strength-cell:hover {
  transform: translateY(-2px);
}
</style>
