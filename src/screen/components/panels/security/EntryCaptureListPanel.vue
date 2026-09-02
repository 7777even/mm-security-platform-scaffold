<script setup lang="ts">
import { computed } from 'vue';
import PanelCard from '../../common/PanelCard.vue';
import {
  closeEntryCaptureList,
  entryCaptureCurrentPage,
  entryCaptureKeyword,
  entryCaptureMode,
  entryCapturePagedItems,
  entryCaptureTimeRange,
  entryCaptureTotalPages,
  entryCaptureVisiblePages,
  goToEntryCapturePage,
  openEntryCaptureList,
  resetEntryCaptureSearch,
  searchEntryCapture,
} from '../../../lib/composables/useEntryCaptureListView';

const title = computed(() => {
  if (entryCaptureMode.value === 'person') return '人员抓拍';
  if (entryCaptureMode.value === 'hazmat') return '危化车抓拍';
  return '车辆抓拍';
});

const tabs = [
  { key: 'person', label: '人员' },
  { key: 'vehicle', label: '普通车' },
  { key: 'hazmat', label: '危化车' },
] as const;

function toneClass(value?: number) {
  if (value == null) return '';
  if (value >= 80) return 'capture-card__title--safe';
  if (value >= 50) return 'capture-card__title--warning';
  return 'capture-card__title--danger';
}
</script>

<template>
  <PanelCard title="" variant="rescue" :show-more="false">
    <template #title>
      <div class="capture-list__title">
        <h3 class="capture-list__heading">进出厂抓拍记录</h3>
        <span class="capture-list__sub">{{ title }}</span>
      </div>
    </template>

    <template #header-extra>
      <button type="button" class="capture-list__back" @click="closeEntryCaptureList">返回</button>
    </template>

    <div class="capture-list">
      <div class="capture-list__tabs">
        <button
          v-for="t in tabs"
          :key="t.key"
          type="button"
          class="capture-list__tab"
          :class="{ 'capture-list__tab--active': entryCaptureMode === t.key }"
          @click="openEntryCaptureList(t.key)"
        >
          {{ t.label }}
        </button>
      </div>

      <div class="capture-list__filters">
        <input
          v-model="entryCaptureTimeRange"
          class="capture-list__input"
          type="text"
          placeholder="请输入日期，如 2026-01-20"
        />
        <input
          v-if="entryCaptureMode !== 'person'"
          v-model="entryCaptureKeyword"
          class="capture-list__input"
          type="text"
          placeholder="请输入车牌号"
        />
        <input
          v-else
          v-model="entryCaptureKeyword"
          class="capture-list__input"
          type="text"
          placeholder="请输入姓名"
        />
        <button
          type="button"
          class="capture-list__btn capture-list__btn--primary"
          @click="searchEntryCapture"
        >
          查询
        </button>
        <button type="button" class="capture-list__btn" @click="resetEntryCaptureSearch">
          重置
        </button>
      </div>

      <div class="capture-list__items">
        <article v-for="item in entryCapturePagedItems" :key="item.id" class="capture-card">
          <div
            class="capture-card__thumb"
            :class="
              entryCaptureMode === 'person'
                ? 'capture-card__thumb--person'
                : 'capture-card__thumb--vehicle'
            "
            aria-hidden="true"
          />

          <div class="capture-card__body">
            <div class="capture-card__head">
              <h4
                class="capture-card__title"
                :class="
                  item.title === '未识别'
                    ? 'capture-card__title--danger'
                    : toneClass(item.confidence)
                "
              >
                {{ item.title }}
              </h4>
              <span v-if="item.statusTag" class="capture-card__tag">{{ item.statusTag }}</span>
              <span
                class="capture-card__dir"
                :class="
                  item.direction === '入厂' ? 'capture-card__dir--enter' : 'capture-card__dir--exit'
                "
              >
                {{ item.direction }}
              </span>
            </div>
            <div class="capture-card__meta">{{ item.gate }}</div>
            <div class="capture-card__meta">{{ item.time }}</div>
          </div>
        </article>
      </div>

      <div class="capture-list__pagination">
        <button
          type="button"
          class="page-btn"
          :disabled="entryCaptureCurrentPage <= 1"
          @click="goToEntryCapturePage(entryCaptureCurrentPage - 1)"
        >
          ‹
        </button>
        <button
          v-for="page in entryCaptureVisiblePages"
          :key="page"
          type="button"
          class="page-btn"
          :class="{ 'page-btn--active': entryCaptureCurrentPage === page }"
          @click="goToEntryCapturePage(page)"
        >
          {{ page }}
        </button>
        <button
          type="button"
          class="page-btn"
          :disabled="entryCaptureCurrentPage >= entryCaptureTotalPages"
          @click="goToEntryCapturePage(entryCaptureCurrentPage + 1)"
        >
          ›
        </button>
      </div>
    </div>
  </PanelCard>
</template>

<style scoped>
.capture-list__title {
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
}

.capture-list__heading {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: var(--color-text-strong);
  white-space: nowrap;
}

.capture-list__sub {
  font-size: 13px;
  color: var(--map-device-offline);
  white-space: nowrap;
}

.capture-list__back {
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

.capture-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  gap: 10px;
}

.capture-list__tabs {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.capture-list__tab {
  height: 28px;
  padding: 0 10px;
  border: 1px solid var(--btn-border);
  border-radius: 2px;
  background: var(--stat-card-icon-bg);
  color: var(--map-device-offline);
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
}

.capture-list__tab--active {
  color: var(--color-text-strong);
  border-color: rgb(0 180 255 / 55%);
  background: rgb(0 90 160 / 50%);
}

.capture-list__filters {
  display: grid;
  grid-template-columns: 1fr 1fr auto auto;
  gap: 8px;
  flex-shrink: 0;
}

.capture-list__input {
  height: 30px;
  padding: 0 10px;
  border: 1px solid var(--btn-border);
  border-radius: 2px;
  background: var(--btn-bg);
  color: var(--color-text-strong);
  font-size: 12px;
  font-family: var(--font-body);
  outline: none;
}

.capture-list__input::placeholder {
  color: #6a84a4;
}

.capture-list__btn {
  height: 30px;
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

.capture-list__btn--primary {
  color: var(--color-text-strong);
  border-color: var(--border-glow);
  background: rgb(0 90 160 / 45%);
}

.capture-list__items {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 2px;
}

.capture-card {
  display: grid;
  grid-template-columns: 106px 1fr;
  gap: 10px;
  padding: 8px 10px;
  background: var(--alarm-card-bg);
  border: 1px solid var(--alarm-card-border);
  border-radius: 2px;
}

.capture-card__thumb {
  height: 72px;
  border-radius: 2px;
  border: 1px solid rgb(0 130 210 / 28%);
}

.capture-card__thumb--vehicle {
  background: linear-gradient(135deg, rgb(160 50 40 / 50%), rgb(60 25 20 / 65%));
}

.capture-card__thumb--person {
  background: linear-gradient(135deg, rgb(0 90 160 / 45%), rgb(0 35 70 / 65%));
}

.capture-card__head {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 4px;
}

.capture-card__title {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-strong);
}

.capture-card__title--danger {
  color: var(--color-danger);
}

.capture-card__title--warning {
  color: var(--color-warning);
}

.capture-card__title--safe {
  color: var(--map-marker-cyan);
}

.capture-card__tag {
  font-size: 11px;
  color: var(--color-text-strong);
  padding: 1px 6px;
  border: 1px solid rgb(255 255 255 / 28%);
  border-radius: 2px;
}

.capture-card__dir {
  margin-left: auto;
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 2px;
  border: 1px solid rgb(255 255 255 / 28%);
  white-space: nowrap;
}

.capture-card__dir--enter {
  color: var(--color-success);
  border-color: rgb(61 214 140 / 40%);
}

.capture-card__dir--exit {
  color: var(--map-marker-cyan);
  border-color: rgb(55 207 255 / 40%);
}

.capture-card__meta {
  font-size: 12px;
  color: #c8d4e8;
  line-height: 1.5;
}

.capture-list__pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.page-btn {
  min-width: 28px;
  height: 28px;
  padding: 0 8px;
  border: 1px solid var(--btn-border);
  border-radius: 2px;
  background: var(--btn-bg);
  color: #c8d8ec;
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
}

.page-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.page-btn--active {
  color: var(--color-text-strong);
  border-color: rgb(0 180 255 / 55%);
  background: rgb(0 90 160 / 55%);
}
</style>
