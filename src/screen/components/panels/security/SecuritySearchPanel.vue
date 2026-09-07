<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import PanelCard from '../../common/PanelCard.vue';
import SecuritySearchResultCard from './SecuritySearchResultCard.vue';
import { personSearchResults, vehicleSearchResults } from '@/services/security';
import {
  closeSearchPanel,
  securitySearchPanelMode,
  type SecuritySearchPanelMode,
} from '../../../lib/composables/useSecuritySearchPanel';

const props = defineProps<{
  mode: SecuritySearchPanelMode;
}>();

const plateKeyword = ref('');
const nameKeyword = ref('');
const timeStart = ref('');
const timeEnd = ref('');

const isVehicle = computed(() => props.mode === 'vehicle');
const title = computed(() => (isVehicle.value ? '车辆搜索' : '人员搜索'));

const vehicleResults = computed(() => {
  const q = plateKeyword.value.trim().toLowerCase();
  if (!q) return vehicleSearchResults;
  return vehicleSearchResults.filter((item) => item.plate.toLowerCase().includes(q));
});

const personResults = computed(() => {
  const q = nameKeyword.value.trim();
  if (!q) return personSearchResults;
  return personSearchResults.filter((item) => item.name.includes(q));
});

const resultCount = computed(() =>
  isVehicle.value ? vehicleResults.value.length : personResults.value.length,
);

watch(
  () => securitySearchPanelMode.value,
  (mode) => {
    if (mode !== props.mode) return;
    plateKeyword.value = '';
    nameKeyword.value = '';
    timeStart.value = '';
    timeEnd.value = '';
  },
);

function handleSearch() {
  // 占位：后续对接检索接口
}

function handleReset() {
  plateKeyword.value = '';
  nameKeyword.value = '';
  timeStart.value = '';
  timeEnd.value = '';
}

function onUploadClick() {
  // 占位：以图搜图
}
</script>

<template>
  <PanelCard title="" variant="rescue" :show-more="false">
    <template #title>
      <div class="search-panel__title">
        <h3 class="search-panel__heading">{{ title }}</h3>
        <span class="search-panel__count">共 {{ resultCount }} 条</span>
      </div>
    </template>

    <template #header-extra>
      <button type="button" class="search-panel__back" @click="closeSearchPanel">返回</button>
    </template>

    <div class="search-panel">
      <div class="search-panel__filters">
        <button type="button" class="search-panel__upload" @click="onUploadClick">
          <svg class="search-panel__upload-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 16V8M9 11l3-3 3 3"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
          <span>以图搜图</span>
          <span class="search-panel__upload-hint">拖拽上传或点击选择图片</span>
        </button>

        <label v-if="isVehicle" class="search-panel__field">
          <span class="search-panel__label">车牌号</span>
          <input
            v-model="plateKeyword"
            class="search-panel__input"
            type="text"
            placeholder="请输入车牌号"
          />
        </label>

        <label v-else class="search-panel__field">
          <span class="search-panel__label">姓名</span>
          <input
            v-model="nameKeyword"
            class="search-panel__input"
            type="text"
            placeholder="请输入姓名"
          />
        </label>

        <div class="search-panel__field">
          <span class="search-panel__label">时间</span>
          <div class="search-panel__time-row">
            <input
              v-model="timeStart"
              class="search-panel__input"
              type="text"
              placeholder="开始时间"
            />
            <span class="search-panel__time-sep">—</span>
            <input
              v-model="timeEnd"
              class="search-panel__input"
              type="text"
              placeholder="结束时间"
            />
          </div>
        </div>

        <div class="search-panel__actions">
          <button
            type="button"
            class="search-panel__btn search-panel__btn--primary"
            @click="handleSearch"
          >
            查询
          </button>
          <button type="button" class="search-panel__btn" @click="handleReset">重置</button>
        </div>
      </div>

      <div class="search-panel__list">
        <template v-if="isVehicle">
          <SecuritySearchResultCard
            v-for="item in vehicleResults"
            :key="item.id"
            mode="vehicle"
            :vehicle="item"
          />
        </template>
        <template v-else>
          <SecuritySearchResultCard
            v-for="item in personResults"
            :key="item.id"
            mode="person"
            :person="item"
          />
        </template>
      </div>
    </div>
  </PanelCard>
</template>

<style scoped>
.search-panel__title {
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
}

.search-panel__heading {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: var(--color-text-strong);
  white-space: nowrap;
}

.search-panel__count {
  font-size: 13px;
  color: var(--map-device-offline);
  white-space: nowrap;
}

.search-panel__back {
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

.search-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  gap: 10px;
}

.search-panel__filters {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}

.search-panel__upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 100%;
  min-height: 64px;
  padding: 8px;
  border: 1px dashed rgb(0 140 220 / 45%);
  border-radius: 4px;
  background: rgb(0 28 58 / 45%);
  color: var(--map-device-offline);
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
  transition:
    border-color 0.2s,
    background 0.2s;
}

.search-panel__upload:hover {
  border-color: rgb(0 180 255 / 55%);
  background: rgb(0 40 78 / 50%);
}

.search-panel__upload-icon {
  width: 20px;
  height: 20px;
  color: var(--map-marker-cyan);
}

.search-panel__upload-hint {
  font-size: 11px;
  color: #6a84a4;
}

.search-panel__field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.search-panel__label {
  font-size: 12px;
  color: var(--map-device-offline);
}

.search-panel__input {
  height: 32px;
  padding: 0 10px;
  border: 1px solid var(--btn-border);
  border-radius: 2px;
  background: var(--btn-bg);
  color: var(--color-text-strong);
  font-size: 12px;
  font-family: var(--font-body);
  outline: none;
  min-width: 0;
}

.search-panel__input::placeholder {
  color: #6a84a4;
}

.search-panel__time-row {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 6px;
}

.search-panel__time-sep {
  color: #6a84a4;
  font-size: 12px;
}

.search-panel__actions {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
}

.search-panel__btn {
  height: 32px;
  padding: 0 12px;
  border: 1px solid var(--btn-border);
  border-radius: 2px;
  background: var(--btn-bg);
  color: #c8d8ec;
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
  white-space: nowrap;
}

.search-panel__btn--primary {
  color: var(--color-text-strong);
  border-color: var(--border-glow);
  background: rgb(0 90 160 / 45%);
}

.search-panel__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 4px;
  scrollbar-width: thin;
  scrollbar-color: rgb(0 160 255 / 45%) rgb(0 25 55 / 50%);
}

.search-panel__list::-webkit-scrollbar {
  width: 4px;
}

.search-panel__list::-webkit-scrollbar-track {
  background: rgb(0 25 55 / 50%);
  border-radius: 2px;
}

.search-panel__list::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, rgb(0 180 255 / 55%), rgb(0 120 200 / 45%));
  border-radius: 2px;
}
</style>
