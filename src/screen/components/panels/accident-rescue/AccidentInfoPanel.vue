<script setup lang="ts">
import { ref } from 'vue';
import AccidentRescueSidePanel from '../../common/AccidentRescueSidePanel.vue';
import {
  accidentArrivalFields,
  accidentInfoFields,
  accidentInfoTabs,
  accidentReportFields,
} from '../../../lib/data/accidentRescueMock';

const activeTab = ref(0);
const tabFields = [accidentInfoFields, accidentReportFields, accidentArrivalFields];
</script>

<template>
  <AccidentRescueSidePanel title="事故信息" variant="guidance" theme="accident">
    <div class="accident-info">
      <div class="accident-info__tabs">
        <button
          v-for="(tab, index) in accidentInfoTabs"
          :key="tab.key"
          type="button"
          class="accident-info__tab"
          :class="{ 'accident-info__tab--active': activeTab === index }"
          @click="activeTab = index"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="accident-info__table ar-scroll">
        <div v-for="field in tabFields[activeTab]" :key="field.label" class="accident-info__row">
          <span class="accident-info__label">{{ field.label }}</span>
          <span class="accident-info__value">{{ field.value }}</span>
        </div>
      </div>
    </div>
  </AccidentRescueSidePanel>
</template>

<style scoped>
.accident-info {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  gap: 4px;
}

.accident-info__tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  flex-shrink: 0;
  height: 28px;
  border: 1px solid var(--panel-head-line);
  border-radius: 2px;
  overflow: hidden;
}

.accident-info__tab {
  height: 28px;
  padding: 0;
  border: none;
  border-right: 1px solid rgb(0 110 190 / 28%);
  background: var(--map-facility-btn-bg);
  color: #a8b8cc;
  font-size: 11px;
  font-family: var(--font-body);
  cursor: pointer;
}

.accident-info__tab:last-child {
  border-right: none;
}

.accident-info__tab--active {
  color: var(--color-text-strong);
  font-weight: 500;
  background: linear-gradient(180deg, rgb(0 130 220 / 92%), rgb(0 90 180 / 92%));
}

.accident-info__table {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.accident-info__row {
  display: grid;
  grid-template-columns: 80px minmax(0, 1fr);
  gap: 5px;
  padding: 4px 0;
  font-size: 11px;
  line-height: 1.28;
  border-bottom: 1px solid rgb(0 80 140 / 22%);
}

.accident-info__row:last-child {
  border-bottom: none;
}

.accident-info__label {
  color: var(--map-facility-btn-fg);
  white-space: nowrap;
}

.accident-info__value {
  color: var(--color-text-strong);
  word-break: break-all;
}
</style>
