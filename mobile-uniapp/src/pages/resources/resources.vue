<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import MobileHeader from '@/components/MobileHeader.vue';
import IconTile from '@/components/IconTile.vue';
import {
  fetchRescueVehicles,
  fetchRescueEquipment,
  fetchRescuePersonnel,
  fetchFireBrigades,
} from '@/platform/api';

interface Brigade {
  id?: string | number;
  name?: string;
  area?: string;
  [key: string]: unknown;
}

const loading = ref(true);
const vehicleCount = ref(0);
const equipmentCount = ref(0);
const personnelCount = ref(0);
const brigades = ref<Brigade[]>([]);

const groupedBrigades = computed<{ area: string; items: Brigade[] }[]>(() => {
  const map = new Map<string, Brigade[]>();
  for (const b of brigades.value) {
    const area = (b.area as string) || '未分区';
    if (!map.has(area)) map.set(area, []);
    map.get(area)!.push(b);
  }
  return Array.from(map.entries()).map(([area, items]) => ({ area, items }));
});

async function load(): Promise<void> {
  loading.value = true;
  try {
    const [vehicles, equipment, personnel, brigadeRes] = await Promise.all([
      fetchRescueVehicles(),
      fetchRescueEquipment(),
      fetchRescuePersonnel(),
      fetchFireBrigades(),
    ]);
    vehicleCount.value = (vehicles as unknown[]).length;
    equipmentCount.value = (equipment.totalSets as number) ?? (equipment.items as unknown[]).length;
    personnelCount.value =
      (personnel.totalCount as number) ?? (personnel.items as unknown[]).length;
    brigades.value = (brigadeRes.items as Brigade[]) ?? [];
  } catch (e: any) {
    uni.showToast({ title: e?.message ?? '加载失败', icon: 'none' });
    vehicleCount.value = 0;
    equipmentCount.value = 0;
    personnelCount.value = 0;
    brigades.value = [];
  } finally {
    loading.value = false;
  }
}

onLoad(load);
</script>

<template>
  <view class="mb-page">
    <MobileHeader variant="back" title="应急资源" subtitle="救援力量总览" />

    <text v-if="loading" class="mb-loading">加载中…</text>

    <view v-else class="mb-stack">
      <view class="stat-row">
        <view class="stat-card stat-card--blue">
          <IconTile name="vehicle" tone="blue" />
          <text class="stat-card__num">{{ vehicleCount }}</text>
          <text class="stat-card__label">车辆数</text>
        </view>
        <view class="stat-card stat-card--orange">
          <IconTile name="tool" tone="orange" />
          <text class="stat-card__num">{{ equipmentCount }}</text>
          <text class="stat-card__label">器材套数</text>
        </view>
      </view>
      <view class="stat-row">
        <view class="stat-card stat-card--green">
          <IconTile name="user" tone="green" />
          <text class="stat-card__num">{{ personnelCount }}</text>
          <text class="stat-card__label">人员数</text>
        </view>
        <view class="stat-card stat-card--red">
          <IconTile name="team" tone="red" />
          <text class="stat-card__num">{{ brigades.length }}</text>
          <text class="stat-card__label">队伍数</text>
        </view>
      </view>

      <text v-if="!groupedBrigades.length" class="mb-empty__text">暂无救援队伍</text>

      <view v-for="g in groupedBrigades" :key="g.area" class="mb-block">
        <text class="mb-block__title">{{ g.area }}</text>
        <view v-for="b in g.items" :key="(b.id as string | number) ?? b.name" class="mb-card">
          <text class="mb-card__title">{{ b.name || '未命名队伍' }}</text>
          <text class="mb-card__desc">{{ b.area || '—' }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.mb-loading {
  text-align: center;
  color: var(--text-muted-mobile);
  padding: var(--space-lg) 0;
}

.mb-stack {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding: var(--space-md) var(--mb-pad-x);
}

.stat-row {
  display: flex;
  gap: var(--space-md);
}

.stat-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-xs);
  padding: var(--space-md);
  background: var(--card-mobile);
  border: var(--mb-border-w) solid var(--mb-stroke);
  border-radius: var(--mb-radius-card);
}

.stat-card__num {
  font-size: var(--mb-fz-section);
  font-weight: 700;
  color: var(--text-title-mobile);
}

.stat-card__label {
  font-size: var(--mb-fz-help);
  color: var(--text-muted-mobile);
}

.mb-block {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.mb-block__title {
  font-size: var(--mb-fz-section);
  font-weight: 600;
  color: var(--text-title-mobile);
}

.mb-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  padding: var(--space-md);
  background: var(--card-mobile);
  border: var(--mb-border-w) solid var(--mb-stroke);
  border-radius: var(--mb-radius-card);
}

.mb-card__title {
  font-size: var(--mb-fz-form-label);
  font-weight: 600;
  color: var(--text-title-mobile);
}

.mb-card__desc {
  font-size: var(--mb-fz-tip);
  color: var(--text-muted-mobile);
}

.mb-empty__text {
  text-align: center;
  font-size: var(--mb-fz-help);
  color: var(--text-muted-mobile);
  padding: var(--space-lg) 0;
}
</style>
