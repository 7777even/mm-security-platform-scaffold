<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import PanelCard from '../../common/PanelCard.vue';
import {
  hazardEnterpriseOptions,
  hazardLevelOptions,
  majorHazards,
  type HazardLevel,
  type MajorHazardItem,
} from '@/services/map-data/majorHazardMock';
import { usePlantArea } from '@/composables/usePlantArea';

const router = useRouter();
const { filterByPlantArea } = usePlantArea();

const enterprise = ref<(typeof hazardEnterpriseOptions)[number]>('全部企业');
const level = ref<(typeof hazardLevelOptions)[number]>('全部等级');
const keyword = ref('');

const filtered = computed(() => {
  const key = keyword.value.trim();
  return filterByPlantArea(majorHazards).filter((item) => {
    if (enterprise.value !== '全部企业' && item.enterprise !== enterprise.value) return false;
    if (level.value !== '全部等级' && item.level !== level.value) return false;
    if (key && !item.name.includes(key)) return false;
    return true;
  });
});

function levelClass(lv: HazardLevel) {
  if (lv === '一级') return 'hazard-table__level--l1';
  if (lv === '二级') return 'hazard-table__level--l2';
  if (lv === '三级') return 'hazard-table__level--l3';
  return 'hazard-table__level--l4';
}

function openDetail(item: MajorHazardItem) {
  void router.push({ name: 'ops-monitor-hazard-detail', params: { hazardId: String(item.id) } });
}

function closeList() {
  void router.push({ name: 'ops-monitor' });
}
</script>

<template>
  <PanelCard title="" variant="facilities" module="production" :show-more="false">
    <template #title>
      <div class="hazard-list__title">
        <h3 class="hazard-list__heading">重大危险源</h3>
        <span class="hazard-list__count">共 {{ filtered.length }} 项</span>
      </div>
    </template>

    <template #header-extra>
      <button type="button" class="hazard-list__close" @click="closeList">关闭</button>
    </template>

    <div class="hazard-list">
      <div class="hazard-list__filters">
        <select v-model="enterprise" class="hazard-list__select">
          <option v-for="opt in hazardEnterpriseOptions" :key="opt" :value="opt">{{ opt }}</option>
        </select>
        <select v-model="level" class="hazard-list__select">
          <option v-for="opt in hazardLevelOptions" :key="opt" :value="opt">{{ opt }}</option>
        </select>
        <input v-model="keyword" class="hazard-list__input" type="text" placeholder="危险源名称" />
      </div>

      <div class="hazard-table">
        <div class="hazard-table__head">
          <span>序号</span>
          <span>危险源名称</span>
          <span>级别</span>
          <span>R值</span>
          <span>监测</span>
          <span>视频</span>
        </div>

        <button
          v-for="(item, index) in filtered"
          :key="item.id"
          type="button"
          class="hazard-table__row"
          @click="openDetail(item)"
        >
          <span>{{ index + 1 }}</span>
          <span class="hazard-table__name" :title="item.name">{{ item.name }}</span>
          <span class="hazard-table__level" :class="levelClass(item.level)">{{ item.level }}</span>
          <span>{{ item.rValue }}</span>
          <span>{{ item.monitorCount }}</span>
          <span>{{ item.videoCount }}</span>
        </button>

        <div v-if="!filtered.length" class="hazard-table__empty">暂无匹配数据</div>
      </div>
    </div>
  </PanelCard>
</template>

<style scoped>
.hazard-list__title {
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
}

.hazard-list__heading {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #fff;
}

.hazard-list__count {
  font-size: 13px;
  color: #8aa4c4;
}

.hazard-list__close {
  height: 26px;
  padding: 0 10px;
  border: 1px solid rgb(0 130 210 / 35%);
  border-radius: 2px;
  background: rgb(0 28 58 / 65%);
  color: #c8d8ec;
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
}

.hazard-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  gap: 10px;
}

.hazard-list__filters {
  display: grid;
  grid-template-columns: 1fr 1fr 1.2fr;
  gap: 6px;
  flex-shrink: 0;
}

.hazard-list__select,
.hazard-list__input {
  height: 30px;
  padding: 0 8px;
  border: 1px solid rgb(0 120 200 / 30%);
  border-radius: 2px;
  background: rgb(0 22 48 / 70%);
  color: #c8d8ec;
  font-size: 12px;
  font-family: var(--font-body);
  outline: none;
}

.hazard-list__input::placeholder {
  color: #6a829e;
}

.hazard-table {
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
  scrollbar-width: thin;
  scrollbar-color: rgb(0 160 255 / 45%) rgb(0 25 55 / 50%);
}

.hazard-table__head,
.hazard-table__row {
  display: grid;
  grid-template-columns: 36px 1.6fr 48px 40px 40px 40px;
  gap: 4px;
  align-items: center;
  padding: 0 8px;
  box-sizing: border-box;
}

.hazard-table__head {
  height: 32px;
  flex-shrink: 0;
  font-size: 12px;
  color: #8aa4c4;
  background: rgb(0 40 78 / 45%);
  border: 1px solid rgb(0 120 200 / 20%);
  border-radius: 2px;
}

.hazard-table__row {
  min-height: 40px;
  border: 1px solid rgb(0 100 180 / 16%);
  border-radius: 2px;
  background: rgb(0 24 50 / 40%);
  color: #e8f2fc;
  font-size: 12px;
  font-family: var(--font-body);
  text-align: left;
  cursor: pointer;
}

.hazard-table__row:hover {
  border-color: rgb(0 180 255 / 45%);
  background: rgb(0 40 78 / 55%);
}

.hazard-table__name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hazard-table__level--l1 {
  color: #ff6b5a;
}

.hazard-table__level--l2 {
  color: #ff9a3c;
}

.hazard-table__level--l3 {
  color: #f0c429;
}

.hazard-table__level--l4 {
  color: #4db8ff;
}

.hazard-table__empty {
  padding: 24px 0;
  text-align: center;
  color: #8aa4c4;
  font-size: 13px;
}
</style>
