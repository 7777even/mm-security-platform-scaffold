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
import { fetchEmergencyStrength, type EmergencyResource } from '@/services/emergency';
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
const resources = ref<EmergencyResource[]>([]);

const stats = computed<RescueStat[]>(() =>
  resources.value.map((r, i) => ({ label: r.kind, value: r.count, iconIndex: i })),
);

// 点击应急力量统计卡弹详情（与系统「更多=弹对话框」先例一致）；
// 明细来自后端 items（应急专家/物资/车辆/救援队伍 4 类有真实台账项，其余类别为统计口径）。
const selected = ref<EmergencyResource | null>(null);
const detailOpen = ref(false);

function openStat(stat: RescueStat) {
  selected.value = resources.value.find((r) => r.kind === stat.label) ?? null;
  detailOpen.value = true;
}

const statFields = computed(() => {
  const r = selected.value;
  if (!r) return [];
  const fields = [
    { label: '资源类别', value: r.kind },
    { label: '资源数量', value: `${r.count} 项` },
  ];
  if (!r.items || r.items.length === 0) {
    fields.push({ label: '明细', value: '该类别为统计口径，暂无逐项明细台账。' });
  }
  return fields;
});

const statItems = computed(() =>
  (selected.value?.items ?? []).map((it) => ({ primary: it.name, secondary: it.meta ?? null })),
);

onMounted(async () => {
  try {
    const strength = await fetchEmergencyStrength();
    resources.value = strength.resources;
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
      :items="statItems"
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
