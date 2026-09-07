<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import PreliminarySidePanel from '../../common/PreliminarySidePanel.vue';
import { rescueForceStats } from '../../../lib/data/preliminaryMock';
import { fireRescueForceStats } from '../../../lib/data/fireEmergencyMock';
import {
  UserFilled,
  Box,
  Avatar,
  Van,
  OfficeBuilding,
  FirstAidKit,
  Warning,
} from '@element-plus/icons-vue';
import { fetchEmergencyStrength } from '@/services/emergency';
import type { DesignModule } from '../../../utils/designAssets';

interface RescueStat {
  label: string;
  value: number;
  iconIndex: number;
}

const props = withDefaults(
  defineProps<{
    module?: Extract<DesignModule, 'preliminary' | 'fireEmergency'>;
  }>(),
  { module: 'preliminary' },
);

// 应急指挥屏（fireEmergency 模块）直连真后端 /emergency/strength；preliminary 模块保留内置 mock。
const realStats = ref<RescueStat[]>([]);
const stats = computed<RescueStat[]>(() =>
  props.module === 'fireEmergency'
    ? realStats.value
    : ((props.module === 'preliminary' ? rescueForceStats : fireRescueForceStats) as RescueStat[]),
);

onMounted(async () => {
  if (props.module !== 'fireEmergency') return;
  try {
    const strength = await fetchEmergencyStrength();
    realStats.value = strength.resources.map((r, i) => ({
      label: r.kind,
      value: r.count,
      iconIndex: i,
    }));
  } catch {
    // 保留空，模板回退无卡片
  }
});

/* 与 rescueForceStats.iconIndex 一一对应；iconIndex 0..7
   应急专家 / 应急物资 / 救援队伍 / 装备车辆 / 应急场所 / 医疗机构 / 应急车辆 / 消防设施 */
const RESCUE_ICONS = [UserFilled, Box, Avatar, Van, OfficeBuilding, FirstAidKit, Van, Warning];
</script>

<template>
  <PreliminarySidePanel title="应急力量救援" variant="rescue" :module="module">
    <div class="rescue-grid">
      <div v-for="stat in stats" :key="stat.label" class="rescue-item">
        <span class="rescue-item__icon" aria-hidden="true">
          <component :is="RESCUE_ICONS[stat.iconIndex]" />
        </span>
        <div class="rescue-item__text">
          <div class="rescue-item__value">{{ stat.value }}</div>
          <div class="rescue-item__label">{{ stat.label }}</div>
        </div>
      </div>
    </div>
  </PreliminarySidePanel>
</template>

<style scoped>
/* 设计切图 image_0011：398×259，2列×4行 */
.rescue-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: 1px;
  height: 259px;
  background: rgb(0 90 160 / 22%);
  border: 1px solid rgb(0 100 180 / 28%);
  border-radius: 2px;
  overflow: hidden;
}

.rescue-item {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 0;
  padding: 8px 10px 8px 18px;
  background: rgb(0 14 32 / 82%);
}

.rescue-item__icon {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  color: var(--color-accent);
}

.rescue-item__icon svg {
  width: 100%;
  height: 100%;
  fill: currentcolor;
}

.rescue-item__text {
  min-width: 0;
}

.rescue-item__value {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-accent-bright);
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.rescue-item__label {
  margin-top: 4px;
  font-size: 12px;
  color: #c4d4e8;
  line-height: 1.2;
  white-space: nowrap;
}
</style>
