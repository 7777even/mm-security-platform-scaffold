<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import PanelCard from '../common/PanelCard.vue';
import StatCard from '../common/StatCard.vue';
import { UserFilled } from '@element-plus/icons-vue';
import { dutyPersons, rescueStats, type DutyPerson } from '../../lib/data/mock';
import { usePlantArea } from '../../lib/composables/usePlantArea';
import { fetchDutyRoster } from '@/services/duty';
import {
  openFireBrigadeView,
  closeFireBrigadeView,
} from '../../lib/composables/useFireBrigadeView';
import {
  openRescueEquipmentView,
  closeRescueEquipmentView,
} from '../../lib/composables/useRescueEquipmentView';
import {
  openRescuePersonnelView,
  closeRescuePersonnelView,
} from '../../lib/composables/useRescuePersonnelView';
import {
  openRescueVehicleView,
  closeRescueVehicleView,
} from '../../lib/composables/useRescueVehicleView';
import { closeSpecialOperationView } from '../../lib/composables/useSpecialOperationView';

const shift = ref<'day' | 'night'>('day');
const { filterByPlantArea, scaleAreaCount } = usePlantArea();
// 值班人员：直连真后端 /emergency/duty（services 缺 VITE_API_BASE 时回落 dev mock）。
// 厂区过滤沿用既有 filterByPlantArea；真实数据未加载时回退到内置 mock 不空屏。
const realDutyPersons = ref<DutyPerson[]>([]);
const dutySource = computed(() =>
  realDutyPersons.value.length ? realDutyPersons.value : dutyPersons,
);
const scopedDutyPersons = computed(() => filterByPlantArea(dutySource.value));
const visibleDutyPersons = computed(() => {
  const leader = dutySource.value.find((person) => person.role === '值班领导');
  const staff = scopedDutyPersons.value.find((person) => person.role !== '值班领导');
  return [leader, staff].filter((person): person is DutyPerson => Boolean(person));
});

onMounted(async () => {
  try {
    const roster = await fetchDutyRoster();
    realDutyPersons.value = roster.members.map((m, i) => ({
      id: i + 1,
      name: m.name,
      phone: m.phone,
      role: m.role,
    }));
  } catch {
    // 真实接口异常时保留内置 mock 兜底
  }
});

function handleStatClick(label: string) {
  closeSpecialOperationView();
  closeFireBrigadeView();
  closeRescueEquipmentView();
  closeRescuePersonnelView();
  closeRescueVehicleView();
  if (label === '消防队伍') openFireBrigadeView();
  if (label === '救援装备') openRescueEquipmentView();
  if (label === '救援人员') openRescuePersonnelView();
  if (label === '救援车辆') openRescueVehicleView();
}
</script>

<template>
  <PanelCard title="" variant="duty" :show-more="false">
    <template #title>
      <div class="duty-header">
        <h3 class="duty-header__title">值班与消防救援力量</h3>
      </div>
    </template>

    <div class="duty-controls">
      <div class="duty-header__dept">
        <span class="duty-header__dept-label">部门</span>
        <select class="duty-header__select">
          <option>全部</option>
          <option>消防支队</option>
          <option>安全保卫部</option>
        </select>
      </div>
      <div class="duty-shift">
        <button
          type="button"
          class="duty-shift__btn"
          :class="{ 'duty-shift__btn--active': shift === 'day' }"
          @click="shift = 'day'"
        >
          白班
        </button>
        <button
          type="button"
          class="duty-shift__btn"
          :class="{ 'duty-shift__btn--active': shift === 'night' }"
          @click="shift = 'night'"
        >
          夜班
        </button>
      </div>
    </div>

    <div class="duty-list">
      <div v-for="person in visibleDutyPersons" :key="person.id" class="duty-card">
        <div class="duty-card__icon-wrap" aria-hidden="true">
          <span class="duty-card__avatar"><UserFilled /></span>
        </div>
        <div class="duty-card__info">
          <div class="duty-card__head">
            <span class="duty-card__name" :title="person.name">{{ person.name }}</span>
            <span class="duty-card__role" :title="person.role">{{ person.role }}</span>
          </div>
          <div class="duty-card__phone">
            <svg class="duty-card__phone-icon" viewBox="0 0 16 16" aria-hidden="true">
              <path
                d="M3.2 1.5c-.4 0-.8.3-.9.7L1.6 5.2c-.1.5.1 1 .5 1.3l2.2 1.7c1.2 2.4 3.1 4.3 5.5 5.5l1.7 2.2c.3.4.8.6 1.3.5l2.9-.7c.4-.1.7-.5.7-.9V12c0-.6-.5-1.1-1.1-1.1-1.4 0-3.5-.4-5.2-1.3-.9-.5-1.7-1.1-2.4-1.8-.7-.7-1.3-1.5-1.8-2.4-.9-1.7-1.3-3.8-1.3-5.2 0-.6-.5-1.1-1.1-1.1H3.2z"
                fill="currentColor"
              />
            </svg>
            <span class="duty-card__phone-text" :title="person.phone">{{ person.phone }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="rescue-divider"><span>消防救援力量</span></div>
    <div class="rescue-grid">
      <StatCard
        v-for="stat in rescueStats"
        :key="stat.label"
        :icon-type="stat.iconType"
        :value="scaleAreaCount(stat.value)"
        :unit="stat.unit"
        :label="stat.label"
        clickable
        @click="handleStatClick(stat.label)"
      />
    </div>
  </PanelCard>
</template>

<style scoped>
.duty-header {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.duty-header__title {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: var(--color-text-strong);
  white-space: nowrap;
}

.duty-header__dept {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
}

.duty-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  height: 28px;
  flex-shrink: 0;
}

.duty-header__dept-label {
  font-size: 13px;
  color: #b8c8dc;
  white-space: nowrap;
}

.duty-header__select {
  width: 108px;
  height: 24px;
  padding: 0 18px 0 6px;
  border: 1px solid rgb(0 120 200 / 35%);
  border-radius: 2px;
  background: var(--btn-bg);
  color: var(--color-text-strong);
  font-size: 12px;
  font-family: var(--font-body);
  outline: none;
  appearance: none;
}

.duty-shift {
  display: flex;
  width: 96px;
  height: 26px;
  border: 1px solid rgb(0 120 200 / 35%);
  border-radius: 2px;
  overflow: hidden;
  flex-shrink: 0;
}

.duty-shift__btn {
  flex: 1;
  padding: 0;
  border: none;
  background: var(--alarm-card-bg);
  color: var(--map-device-offline);
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
}

.duty-shift__btn--active {
  background: linear-gradient(180deg, rgb(0 130 220 / 90%), rgb(0 90 175 / 90%));
  color: var(--color-text-strong);
}

.duty-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-auto-rows: 1fr;
  gap: 8px;
  height: 72px;
  min-height: 0;
  align-content: start;
}

:deep(.panel-card__content) {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
}

.rescue-divider {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #88a8c8;
  font-size: 12px;
  flex-shrink: 0;
}

.rescue-divider::after {
  content: '';
  height: 1px;
  flex: 1;
  background: rgb(0 145 220 / 22%);
}

.rescue-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-template-rows: repeat(2, minmax(0, 1fr));
  gap: 6px;
  flex: 1;
  min-height: 0;
}

.rescue-grid :deep(.stat-card) {
  padding: 6px 8px;
}

.rescue-grid :deep(.stat-card__icon-wrap) {
  width: 36px;
  height: 36px;
}

.duty-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: linear-gradient(180deg, rgb(0 34 66 / 55%), rgb(0 20 42 / 42%));
  border: 1px solid var(--stat-card-border);
  border-radius: 2px;
  box-shadow: inset 0 0 10px rgb(0 170 255 / 8%);
  box-sizing: border-box;
  overflow: hidden;
  min-height: 64px;
}

.duty-card__icon-wrap {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
  background: var(--stat-card-icon-bg);
  border: 1px solid var(--stat-card-border);
  overflow: hidden;
}

.duty-card__avatar {
  flex-shrink: 0;
  display: inline-flex;
  width: 24px;
  height: 24px;
  color: var(--color-accent);
}

.duty-card__avatar :deep(svg) {
  width: 100%;
  height: 100%;
  fill: currentcolor;
}

.duty-card__info {
  min-width: 0;
  flex: 1;
}

.duty-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.duty-card__name {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-strong);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.duty-card__role {
  font-size: 12px;
  color: var(--color-success);
  white-space: nowrap;
  flex-shrink: 0;
}

.duty-card__phone {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 4px;
  font-size: 12px;
  color: var(--color-accent-2);
  line-height: 1.2;
}

.duty-card__phone-icon {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
}

.duty-card__phone-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
