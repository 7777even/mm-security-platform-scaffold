<!--
  FireDevicePanel — §消防报警「消防设备」
  4 个消防子系统（图标 + 名称 + 总数），2x2 卡片。
-->
<script setup lang="ts">
import { Bell, Odometer, Warning } from '@element-plus/icons-vue';
import PanelCard from '@/components/common/PanelCard.vue';

interface FireDevice {
  name: string;
  total: number;
  icon: unknown;
}

const devices: FireDevice[] = [
  { name: '火灾自动报警', total: 665, icon: Bell },
  { name: '室内消火栓', total: 665, icon: Odometer },
  { name: '室外消火栓', total: 665, icon: Odometer },
  { name: '气体灭火', total: 665, icon: Warning },
];
</script>

<template>
  <PanelCard title="消防设备" icon="Tools">
    <div class="device-grid">
      <div v-for="d in devices" :key="d.name" class="device-card">
        <div class="device-card__icon">
          <component :is="d.icon" />
        </div>
        <div class="device-card__name">{{ d.name }}</div>
        <div class="device-card__total">{{ d.total }}</div>
      </div>
    </div>
  </PanelCard>
</template>

<style scoped>
.device-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.device-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 12px 8px;
  border-radius: var(--radius-sm);
  background: var(--panel-inner-bg);
  border: 1px solid var(--panel-border);
}

.device-card__icon {
  color: var(--color-accent);
}

.device-card__icon :deep(svg) {
  width: 22px;
  height: 22px;
}

.device-card__name {
  font-size: var(--font-size-stat-label);
  color: var(--color-text);
}

.device-card__total {
  font-family: var(--font-number);
  font-size: var(--font-size-h1);
  font-weight: 700;
  color: var(--color-text-strong);
}
</style>
