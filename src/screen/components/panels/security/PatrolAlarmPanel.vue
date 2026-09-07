<script setup lang="ts">
import PanelCard from '../../common/PanelCard.vue';
import { patrolAlarms } from '@/services/security';
import { patrolAlarmToDetail } from '../../../lib/data/alarmDetailMock';
import { useAlarmDetailPanel } from '../../../lib/composables/useAlarmDetailPanel';
import { usePlantArea } from '../../../lib/composables/usePlantArea';

const { openAlarmDetail } = useAlarmDetailPanel();
const { areaScopedItems } = usePlantArea();
const visiblePatrolAlarms = areaScopedItems(patrolAlarms);
</script>

<template>
  <PanelCard title="告警列表" variant="patrolAlarm" module="security" :show-more="false">
    <div class="patrol-alarm">
      <div class="patrol-alarm__filters">
        <select class="patrol-alarm__select">
          <option>处理状态</option>
          <option>未处置</option>
          <option>处理中</option>
          <option>已完成</option>
        </select>
        <select class="patrol-alarm__select">
          <option>告警类型</option>
          <option>人员异常聚集</option>
          <option>超速行驶</option>
          <option>危险区域入侵</option>
        </select>
      </div>

      <div class="patrol-alarm__list">
        <article
          v-for="alarm in visiblePatrolAlarms"
          :key="alarm.id"
          class="patrol-alarm-card"
          :class="`patrol-alarm-card--${alarm.statusTone}`"
          @click="openAlarmDetail(patrolAlarmToDetail(alarm))"
        >
          <div class="patrol-alarm-card__main">
            <h4
              class="patrol-alarm-card__title"
              :class="`patrol-alarm-card__title--${alarm.titleTone}`"
            >
              {{ alarm.title }}
            </h4>
            <div class="patrol-alarm-card__row"><span>告警描述：</span>{{ alarm.description }}</div>
            <div class="patrol-alarm-card__row"><span>告警位置：</span>{{ alarm.location }}</div>
            <div class="patrol-alarm-card__row"><span>告警时间：</span>{{ alarm.time }}</div>
          </div>
          <span
            class="patrol-alarm-card__status"
            :class="`patrol-alarm-card__status--${alarm.statusTone}`"
          >
            {{ alarm.status }}
          </span>
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
  padding: 8px 12px 10px;
}

.patrol-alarm {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  gap: 8px;
}

.patrol-alarm__filters {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  flex-shrink: 0;
}

.patrol-alarm__select {
  height: 30px;
  padding: 0 24px 0 10px;
  background: rgb(0 22 48 / 75%);
  border: 1px solid var(--map-facility-btn-border);
  border-radius: 2px;
  color: var(--color-text-strong);
  font-size: 13px;
  font-family: var(--font-body);
  outline: none;
  appearance: none;
}

.patrol-alarm__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.patrol-alarm__list::-webkit-scrollbar {
  width: 4px;
}

.patrol-alarm__list::-webkit-scrollbar-thumb {
  background: rgb(0 140 220 / 30%);
  border-radius: 2px;
}

.patrol-alarm-card {
  position: relative;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  padding: 10px 12px;
  background: rgb(0 18 40 / 55%);
  border: 1px solid rgb(0 110 190 / 28%);
  border-radius: 2px;
  flex-shrink: 0;
  cursor: pointer;
}

.patrol-alarm-card--pending {
  border-color: rgb(160 170 190 / 35%);
}

.patrol-alarm-card--processing {
  border-color: rgb(240 180 41 / 45%);
}

.patrol-alarm-card--done {
  border-color: rgb(61 214 140 / 35%);
}

.patrol-alarm-card__title {
  margin: 0 0 6px;
  font-size: 14px;
  font-weight: 500;
}

.patrol-alarm-card__title--danger {
  color: var(--color-danger);
}

.patrol-alarm-card__title--warning {
  color: var(--color-warning);
}

.patrol-alarm-card__title--success {
  color: var(--color-success);
}

.patrol-alarm-card__row {
  font-size: 12px;
  color: #a8b8cc;
  line-height: 1.5;
}

.patrol-alarm-card__row span {
  color: #7a8ea8;
}

.patrol-alarm-card__status {
  align-self: start;
  min-width: 58px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.patrol-alarm-card__status--pending {
  color: var(--color-text);
  background: rgb(0 22 48 / 75%);
  border: 1px solid rgb(160 170 190 / 45%);
}

.patrol-alarm-card__status--processing {
  color: #1a1200;
  background: var(--color-warning);
  border: 1px solid var(--color-warning);
}

.patrol-alarm-card__status--done {
  color: var(--color-text-strong);
  background: rgb(35 130 90 / 85%);
  border: 1px solid rgb(61 214 140 / 50%);
}
</style>
