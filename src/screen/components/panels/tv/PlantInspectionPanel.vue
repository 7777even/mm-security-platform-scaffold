<script setup lang="ts">
import { computed, ref } from 'vue';
import PanelCard from '../../common/PanelCard.vue';
import { vehicleThumbStyle } from '../../../utils/tvSpriteConfig';
import { inspectionPersons, inspectionVehicles } from '../../../lib/data/tvMock';
import { usePlantArea } from '../../../lib/composables/usePlantArea';
import personCaptureScene from '../../../assets/semantic-scenes/production-person-gathering.png';

const activeTab = ref<'vehicle' | 'person'>('vehicle');
const keyword = ref('');
const direction = ref<'all' | '入厂' | '出厂'>('all');
const { areaScopedItems } = usePlantArea();
const visibleInspectionVehicles = areaScopedItems(inspectionVehicles);
const visibleInspectionPersons = areaScopedItems(inspectionPersons);

const filteredVehicles = computed(() => {
  const value = keyword.value.trim().toLowerCase();
  return visibleInspectionVehicles.value.filter(
    (item) =>
      (direction.value === 'all' || item.badge === direction.value) &&
      (!value || `${item.plate}${item.gate}`.toLowerCase().includes(value)),
  );
});

const filteredPersons = computed(() => {
  const value = keyword.value.trim().toLowerCase();
  return visibleInspectionPersons.value.filter(
    (item) =>
      (direction.value === 'all' || item.gate.includes(direction.value === '入厂' ? '入' : '出')) &&
      (!value || `${item.name}${item.department}${item.gate}`.toLowerCase().includes(value)),
  );
});

function setTab(tab: 'vehicle' | 'person') {
  activeTab.value = tab;
  keyword.value = '';
  direction.value = 'all';
}

function personThumbStyle(index: number) {
  const positions = ['42% 40%', '52% 42%', '61% 44%', '69% 40%'];
  return {
    backgroundImage: `url(${personCaptureScene})`,
    backgroundSize: '230% auto',
    backgroundPosition: positions[index % positions.length],
  };
}
</script>

<template>
  <PanelCard title="人车抓拍" variant="plantInspection" module="tv" :show-more="false">
    <div class="plant-inspection">
      <div class="plant-inspection__tabs">
        <button
          type="button"
          class="plant-inspection__tab"
          :class="{ 'plant-inspection__tab--active': activeTab === 'vehicle' }"
          @click="setTab('vehicle')"
        >
          车辆
        </button>
        <button
          type="button"
          class="plant-inspection__tab"
          :class="{ 'plant-inspection__tab--active': activeTab === 'person' }"
          @click="setTab('person')"
        >
          人员
        </button>
      </div>

      <div class="plant-inspection__filters">
        <label>
          <span aria-hidden="true">⌕</span>
          <input
            v-model="keyword"
            type="search"
            :placeholder="activeTab === 'vehicle' ? '搜索车牌/卡口' : '搜索姓名/部门'"
          />
        </label>
        <select v-model="direction" aria-label="进出方向筛选">
          <option value="all">全部方向</option>
          <option value="入厂">入厂</option>
          <option value="出厂">出厂</option>
        </select>
      </div>

      <div v-if="activeTab === 'vehicle'" class="plant-inspection__list">
        <article v-for="(item, index) in filteredVehicles" :key="item.id" class="capture-row">
          <div class="capture-row__thumb" :style="vehicleThumbStyle(index % 5)" />
          <div class="capture-row__body">
            <div class="capture-row__title">
              <strong>{{ item.plate }}</strong>
              <span>{{ item.badge }}</span>
            </div>
            <div class="capture-row__meta">
              <span>{{ item.gate }}</span>
              <span>{{ item.time }}</span>
            </div>
          </div>
        </article>
      </div>

      <div v-else class="plant-inspection__list">
        <article v-for="(item, index) in filteredPersons" :key="item.id" class="capture-row">
          <div
            class="capture-row__thumb capture-row__thumb--person"
            :style="personThumbStyle(index)"
          />
          <div class="capture-row__body">
            <div class="capture-row__title">
              <strong>{{ item.name }}</strong>
              <span>{{ item.badge }}</span>
              <em>{{ item.time }}</em>
            </div>
            <div class="capture-row__meta">
              <span>{{ item.department }}</span>
              <span>{{ item.gate }}</span>
            </div>
          </div>
        </article>
      </div>
    </div>
  </PanelCard>
</template>

<style scoped>
:deep(.panel-card__content) {
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 6px 10px 16px;
}

.plant-inspection {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.plant-inspection__tabs {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
  flex-shrink: 0;
  margin-bottom: 7px;
}

.plant-inspection__tab {
  height: 32px;
  padding: 0;
  border: 1px solid rgb(0 127 204 / 38%);
  border-radius: 2px;
  background: rgb(0 55 91 / 44%);
  font-size: 13px;
  color: #2fbaff;
  cursor: pointer;
  font-family: var(--font-body);
}

.plant-inspection__tab--active {
  color: #dff8ff;
  border-color: rgb(0 190 255 / 82%);
  background: linear-gradient(180deg, rgb(0 132 202 / 50%), rgb(0 67 113 / 58%));
  box-shadow: inset 0 -2px 0 #1bc8ff;
}

.plant-inspection__filters {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 100px;
  gap: 7px;
  flex-shrink: 0;
  margin-bottom: 7px;
}

.plant-inspection__filters label {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 30px;
  padding: 0 9px;
  border: 1px solid rgb(0 124 190 / 35%);
  border-radius: 2px;
  background: rgb(0 30 53 / 72%);
  color: #47cfff;
}

.plant-inspection__filters input,
.plant-inspection__filters select {
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  color: #cfefff;
  font: 12px var(--font-body);
}

.plant-inspection__filters input {
  width: 100%;
}

.plant-inspection__filters input::placeholder {
  color: #62839c;
}

.plant-inspection__filters select {
  width: 100%;
  padding: 0 7px;
  border: 1px solid rgb(0 124 190 / 35%);
  border-radius: 2px;
  background: #06233a;
}

.plant-inspection__list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.plant-inspection__list::-webkit-scrollbar {
  width: 4px;
}

.plant-inspection__list::-webkit-scrollbar-thumb {
  background: rgb(0 140 220 / 30%);
  border-radius: 2px;
}

.capture-row {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 62px;
  padding: 4px 0;
  flex-shrink: 0;
  border-bottom: 1px solid rgb(0 100 180 / 18%);
}

.capture-row__thumb {
  flex-shrink: 0;
  border-radius: 2px;
  border: 1px solid rgb(0 110 190 / 25%);
  background-repeat: no-repeat;
}

.capture-row__thumb--person {
  width: 88px;
  height: 58px;
  background-color: #051b2c;
}

.capture-row__body {
  min-width: 0;
  flex: 1;
}

.capture-row__title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.capture-row__title strong {
  font-size: 15px;
  font-weight: 600;
  color: #fff;
}

.capture-row__title span {
  display: inline-flex;
  align-items: center;
  padding: 1px 8px;
  border-radius: 2px;
  font-size: 11px;
  color: #fff;
  background: rgb(0 120 220 / 85%);
}

.capture-row__title em {
  margin-left: auto;
  color: #7897ae;
  font-size: 11px;
  font-style: normal;
}

.capture-row__meta {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: 6px;
  font-size: 12px;
  color: #8795b0;
}

.plant-inspection__empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8795b0;
  font-size: 14px;
}
</style>
