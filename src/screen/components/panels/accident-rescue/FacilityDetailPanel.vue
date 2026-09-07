<script setup lang="ts">
import { ref } from 'vue';
import AccidentRescueSidePanel from '../../common/AccidentRescueSidePanel.vue';
import type { FacilityDetailInfo } from '@/services/hazard';
import { closeFacilityDetail } from '../../../lib/composables/useFacilityDetail';

defineProps<{
  detail: FacilityDetailInfo;
}>();

const tabs = [
  { key: 'basic', label: '基础信息' },
  { key: 'chemical', label: '化学品信息' },
] as const;

const activeTab = ref<(typeof tabs)[number]['key']>('basic');
</script>

<template>
  <div class="facility-detail-wrap">
    <button
      type="button"
      class="facility-detail__close"
      aria-label="关闭设施详情"
      @click="closeFacilityDetail"
    >
      ×
    </button>

    <AccidentRescueSidePanel :title="detail.facilityName" variant="facilityDetail" theme="accident">
      <div class="facility-detail">
        <div class="facility-detail__tabs">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            type="button"
            class="facility-detail__tab"
            :class="{ 'facility-detail__tab--active': activeTab === tab.key }"
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
          </button>
        </div>

        <div v-if="activeTab === 'basic'" class="facility-detail__body ar-scroll">
          <div class="facility-detail__code-row">
            <span class="facility-detail__code-label">重大危险源编码：</span>
            <span class="facility-detail__code-value">{{ detail.hazardSourceCode }}</span>
          </div>

          <div v-for="field in detail.basicFields" :key="field.label" class="facility-detail__row">
            <span class="facility-detail__label">{{ field.label }}：</span>
            <span class="facility-detail__value">{{ field.value }}</span>
          </div>

          <div class="facility-detail__archive">
            <div class="facility-detail__archive-head">
              <span class="facility-detail__archive-check" aria-hidden="true" />
              <span class="facility-detail__archive-title">重大危险源档案</span>
            </div>
            <ul class="facility-detail__archive-list">
              <li v-for="file in detail.archives" :key="file.id">
                <button type="button" class="facility-detail__archive-item">
                  <span class="facility-detail__archive-icon" aria-hidden="true" />
                  <span class="facility-detail__archive-name">{{ file.name }}</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div v-else class="facility-detail__body ar-scroll">
          <div
            v-for="field in detail.chemicalFields"
            :key="field.label"
            class="facility-detail__row"
          >
            <span class="facility-detail__label">{{ field.label }}：</span>
            <span class="facility-detail__value">{{ field.value }}</span>
          </div>
        </div>
      </div>
    </AccidentRescueSidePanel>
  </div>
</template>

<style scoped>
.facility-detail-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
}

.facility-detail-wrap :deep(.accident-rescue-panel) {
  padding-top: 6px;
  box-sizing: border-box;
  overflow: visible;
}

.facility-detail-wrap :deep(.accident-rescue-panel__content--facilityDetail) {
  margin-top: 44px;
}

.facility-detail__close {
  position: absolute;
  right: 14px;
  top: 13px;
  z-index: var(--z-chrome);
  width: 28px;
  height: 25px;
  padding: 0;
  border: none;
  background: transparent;
  color: #a8b8cc;
  font-size: 20px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.facility-detail__close:hover {
  color: var(--color-text-strong);
}

.facility-detail {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.facility-detail__tabs {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0;
  flex-shrink: 0;
  height: 36px;
  margin-bottom: 8px;
  border: 1px solid var(--panel-head-line);
  border-radius: 2px;
  overflow: hidden;
}

.facility-detail__tab {
  height: 36px;
  padding: 0;
  border: none;
  border-right: 1px solid rgb(0 110 190 / 28%);
  background: var(--map-facility-btn-bg);
  color: #a8b8cc;
  font-size: 13px;
  font-family: var(--font-body);
  cursor: pointer;
}

.facility-detail__tab:last-child {
  border-right: none;
}

.facility-detail__tab--active {
  color: var(--color-text-strong);
  font-weight: 500;
  background: linear-gradient(180deg, rgb(0 130 220 / 92%), rgb(0 90 180 / 92%));
}

.facility-detail__body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
}

.facility-detail__code-row {
  display: grid;
  grid-template-columns: 112px minmax(0, 1fr);
  gap: 6px;
  padding: 9px 0;
  font-size: 13px;
  line-height: 1.55;
  border-bottom: 1px solid rgb(0 80 140 / 22%);
}

.facility-detail__code-label {
  color: var(--map-facility-btn-fg);
  white-space: nowrap;
}

.facility-detail__code-value {
  color: var(--color-text-strong);
  font-weight: 500;
  word-break: break-all;
}

.facility-detail__row {
  display: grid;
  grid-template-columns: 112px minmax(0, 1fr);
  gap: 6px;
  padding: 9px 0;
  font-size: 13px;
  line-height: 1.55;
  border-bottom: 1px solid rgb(0 80 140 / 22%);
}

.facility-detail__label {
  color: var(--map-facility-btn-fg);
  white-space: nowrap;
}

.facility-detail__value {
  color: var(--color-text-strong);
  word-break: break-all;
}

.facility-detail__archive {
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid rgb(0 80 140 / 22%);
}

.facility-detail__archive-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.facility-detail__archive-check {
  width: 14px;
  height: 14px;
  border: 1px solid rgb(0 130 210 / 45%);
  border-radius: 2px;
  background: var(--map-facility-btn-bg);
  flex-shrink: 0;
}

.facility-detail__archive-title {
  font-size: 13px;
  color: #c8d4e8;
}

.facility-detail__archive-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.facility-detail__archive-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 10px;
  border: 1px solid rgb(0 110 190 / 28%);
  border-radius: 2px;
  background: var(--map-facility-btn-bg);
  color: #c8d4e8;
  font-size: 12px;
  font-family: var(--font-body);
  text-align: left;
  cursor: pointer;
}

.facility-detail__archive-item:hover {
  border-color: rgb(0 130 210 / 45%);
  color: var(--color-text-strong);
}

.facility-detail__archive-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  border-radius: 2px;
  background: rgb(0 60 110 / 55%);
  border: 1px solid rgb(0 110 190 / 28%);
}

.facility-detail__archive-name {
  flex: 1;
  min-width: 0;
  line-height: 1.45;
  word-break: break-all;
}
</style>
