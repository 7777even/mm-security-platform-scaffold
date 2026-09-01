<!--
  FireDevicePanel — §消防报警「消防设备」
  4 个消防子系统（图标 + 名称 + 总数），2x2 卡片。
  交互：点击任一设备卡 → 消防设施监测二级界面（替代原静态展示）。
  图标：压缩包 fire-situation 图标（PkgIcon，mask + currentColor），不用脚手架图标库。
-->
<script setup lang="ts">
import PanelCard from '@/components/common/PanelCard.vue';
import PkgIcon from '@/components/common/PkgIcon.vue';
import { useFireAlarmInteraction } from '@/composables/useFireAlarmInteraction';

const ia = useFireAlarmInteraction();

interface FireDevice {
  name: string;
  total: number;
  icon: string;
}

const devices: FireDevice[] = [
  { name: '火灾自动报警', total: 665, icon: 'bell-ringing' },
  { name: '室内消火栓', total: 665, icon: 'ladder' },
  { name: '室外消火栓', total: 665, icon: 'ladder' },
  { name: '气体灭火', total: 665, icon: 'gas' },
];
</script>

<template>
  <PanelCard title="消防设备" icon="crane">
    <div class="device-grid">
      <div
        v-for="d in devices"
        :key="d.name"
        class="device-card"
        role="button"
        tabindex="0"
        @click="ia.openFacility()"
        @keyup.enter="ia.openFacility()"
      >
        <PkgIcon :name="d.icon" size="22px" class="device-card__icon" />
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
  cursor: pointer;
  transition: border-color 0.15s ease;
}

.device-card:hover {
  border-color: var(--color-accent);
}

.device-card__icon {
  color: var(--color-accent);
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
