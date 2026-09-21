<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import PreliminarySidePanel from '../../common/PreliminarySidePanel.vue';
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
import InfoDetailDialog from '../../common/InfoDetailDialog.vue';
import type { DesignModule } from '@/utils/designAssets';

interface RescueStat {
  label: string;
  value: number;
  iconIndex: number;
}

// module 仅用于面板配色/切图变体（PreliminarySidePanel），数据不再按模块分流
withDefaults(
  defineProps<{
    module?: Extract<DesignModule, 'preliminary' | 'fireEmergency'>;
  }>(),
  { module: 'preliminary' },
);

// 单一数据源：无论 preliminary / fireEmergency 模块，统一走 /emergency/strength
// （services/emergency.ts 内置无后端时的演示 fixture 与非法响应空态，见 backendFallback.ts）
const stats = ref<RescueStat[]>([]);

// 点击应急力量统计卡弹详情（与系统「更多=弹对话框」先例一致；后端仅返回聚合数，弹窗展示类别/数量/说明）
const RESCUE_DESC: Record<string, string> = {
  应急专家: '可调动的应急专家人数，由应急资源台账实时聚合。',
  应急物资: '库存应急物资总数，由应急资源台账实时聚合。',
  救援队伍: '在册救援队伍数量，由应急资源台账实时聚合。',
  装备车辆: '应急装备车辆数量，由应急资源台账实时聚合。',
  应急场所: '应急避难/集结点位数量，由应急资源台账实时聚合。',
  医疗机构: '协作医疗机构数量，由应急资源台账实时聚合。',
  应急车辆: '应急保障车辆数量，由应急资源台账实时聚合。',
  消防设施: '消防设施点位数量，由应急资源台账实时聚合。',
};

const selectedStat = ref<RescueStat | null>(null);
const detailOpen = ref(false);

function openStat(stat: RescueStat) {
  selectedStat.value = stat;
  detailOpen.value = true;
}

const statFields = computed(() =>
  selectedStat.value
    ? [
        { label: '资源类别', value: selectedStat.value.label },
        { label: '资源数量', value: `${selectedStat.value.value} 项` },
        {
          label: '说明',
          value: RESCUE_DESC[selectedStat.value.label] ?? '该维度应急资源实时汇总。',
        },
      ]
    : [],
);

onMounted(async () => {
  try {
    const strength = await fetchEmergencyStrength();
    stats.value = strength.resources.map((r, i) => ({
      label: r.kind,
      value: r.count,
      iconIndex: i,
    }));
  } catch {
    // 保留空，模板回退无卡片
  }
});

/* 与后端 sys_emergency_strength 种子顺序一一对应；iconIndex 0..7
   应急专家 / 应急物资 / 救援队伍 / 装备车辆 / 应急场所 / 医疗机构 / 应急车辆 / 消防设施 */
const RESCUE_ICONS = [UserFilled, Box, Avatar, Van, OfficeBuilding, FirstAidKit, Van, Warning];
</script>

<template>
  <PreliminarySidePanel title="应急力量救援" variant="rescue" :module="module">
    <div class="rescue-grid">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="rescue-item"
        role="button"
        tabindex="0"
        @click="openStat(stat)"
      >
        <span class="rescue-item__icon" aria-hidden="true">
          <component :is="RESCUE_ICONS[stat.iconIndex % RESCUE_ICONS.length]" />
        </span>
        <div class="rescue-item__text">
          <div class="rescue-item__value">{{ stat.value }}</div>
          <div class="rescue-item__label">{{ stat.label }}</div>
        </div>
      </div>
    </div>

    <InfoDetailDialog
      :open="detailOpen"
      title="应急力量详情"
      :fields="statFields"
      @close="detailOpen = false"
    />
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
  cursor: pointer;
  transition:
    background 0.2s ease,
    border-color 0.2s ease;
}

.rescue-item:hover {
  background: rgb(0 30 62 / 88%);
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
