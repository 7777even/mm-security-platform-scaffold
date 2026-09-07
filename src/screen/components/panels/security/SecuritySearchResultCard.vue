<script setup lang="ts">
import { computed } from 'vue';
import type { PersonSearchResult, VehicleSearchResult } from '@/services/security';
import {
  selectPersonSearchResult,
  selectVehicleSearchResult,
  selectedPersonSearchId,
  selectedVehicleSearchId,
} from '../../../lib/composables/useSecuritySearchDetail';
import { openSecurityTrack } from '../../../lib/composables/useSecurityTrackView';

const props = defineProps<{
  mode: 'vehicle' | 'person';
  vehicle?: VehicleSearchResult;
  person?: PersonSearchResult;
}>();

const vehicleActions = ['查看详情', '轨迹回放'];
const personActions = ['查看详情', '轨迹回放'];

function confidenceClass(value?: number) {
  if (value == null) return '';
  if (value >= 80) return 'search-card__title--safe';
  if (value >= 50) return 'search-card__title--warning';
  return 'search-card__title--danger';
}

const active = computed(() => {
  if (props.mode === 'vehicle' && props.vehicle) {
    return selectedVehicleSearchId.value === props.vehicle.id;
  }
  if (props.mode === 'person' && props.person) {
    return selectedPersonSearchId.value === props.person.id;
  }
  return false;
});

function handleCardClick() {
  if (props.mode === 'vehicle' && props.vehicle) {
    selectVehicleSearchResult(props.vehicle.id);
    return;
  }
  if (props.mode === 'person' && props.person) {
    selectPersonSearchResult(props.person.id);
  }
}

function handleActionClick(event: Event, label: string) {
  event.stopPropagation();
  if (label === '轨迹回放') {
    if (props.mode === 'vehicle' && props.vehicle) {
      openSecurityTrack('vehicle', props.vehicle.id);
    } else if (props.mode === 'person' && props.person) {
      openSecurityTrack('person', props.person.id);
    }
    return;
  }
  if (label === '查看详情') {
    handleCardClick();
  }
}
</script>

<template>
  <article
    v-if="mode === 'vehicle' && vehicle"
    class="search-card"
    :class="{ 'search-card--active': active }"
    @click="handleCardClick"
  >
    <div class="search-card__thumb search-card__thumb--vehicle" aria-hidden="true" />

    <div class="search-card__body">
      <div class="search-card__head">
        <h4
          class="search-card__title"
          :class="
            vehicle.plate === '未识别'
              ? 'search-card__title--danger'
              : confidenceClass(vehicle.confidence)
          "
        >
          {{ vehicle.plate }}
        </h4>
        <span v-if="vehicle.confidence != null" class="search-card__tag"
          >{{ vehicle.confidence }}%</span
        >
        <span class="search-card__status">{{ vehicle.status }}</span>
      </div>

      <div class="search-card__meta">{{ vehicle.gate }}</div>
      <div class="search-card__meta">{{ vehicle.time }}</div>

      <div class="search-card__actions">
        <button
          v-for="label in vehicleActions"
          :key="label"
          type="button"
          class="search-card__action"
          @click="handleActionClick($event, label)"
        >
          {{ label }}
        </button>
      </div>
    </div>
  </article>

  <article
    v-else-if="mode === 'person' && person"
    class="search-card"
    :class="{ 'search-card--active': active }"
    @click="handleCardClick"
  >
    <div class="search-card__thumb search-card__thumb--person" aria-hidden="true" />

    <div class="search-card__body">
      <div class="search-card__head">
        <h4 class="search-card__title">{{ person.name }}</h4>
        <span class="search-card__tag">{{ person.gate }}</span>
        <span class="search-card__status">{{ person.status }}</span>
      </div>

      <div class="search-card__meta">{{ person.date }}</div>
      <div class="search-card__meta">门禁抓拍记录</div>

      <div class="search-card__actions">
        <button
          v-for="label in personActions"
          :key="label"
          type="button"
          class="search-card__action"
          @click="handleActionClick($event, label)"
        >
          {{ label }}
        </button>
      </div>
    </div>
  </article>
</template>

<style scoped>
.search-card {
  display: grid;
  grid-template-columns: 106px 1fr;
  gap: 10px;
  padding: 8px 10px;
  flex-shrink: 0;
  background: var(--alarm-card-bg);
  border: 1px solid var(--alarm-card-border);
  border-radius: 2px;
  cursor: pointer;
  text-align: left;
  font-family: var(--font-body);
  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;
}

.search-card:hover {
  border-color: rgb(0 150 230 / 40%);
  background: rgb(0 35 70 / 70%);
}

.search-card--active {
  border-color: rgb(0 180 255 / 55%);
  background: rgb(0 55 100 / 45%);
  box-shadow: inset 0 0 10px rgb(0 170 255 / 8%);
}

.search-card__thumb {
  overflow: hidden;
  border-radius: 2px;
  border: 1px solid rgb(0 130 210 / 28%);
  align-self: start;
  height: 72px;
}

.search-card__thumb--vehicle {
  background: linear-gradient(135deg, rgb(160 50 40 / 50%), rgb(60 25 20 / 65%));
}

.search-card__thumb--person {
  background: linear-gradient(135deg, rgb(0 90 160 / 45%), rgb(0 35 70 / 65%));
}

.search-card__body {
  min-width: 0;
}

.search-card__head {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 4px;
}

.search-card__title {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-strong);
}

.search-card__title--danger {
  color: var(--color-danger);
}

.search-card__title--warning {
  color: var(--color-warning);
}

.search-card__title--safe {
  color: var(--map-marker-cyan);
}

.search-card__tag,
.search-card__status {
  font-size: 11px;
  color: var(--color-text-strong);
  padding: 1px 6px;
  border: 1px solid rgb(255 255 255 / 35%);
  border-radius: 2px;
}

.search-card__status {
  margin-left: auto;
  color: var(--accent-cyan);
  border-color: rgb(106 202 178 / 45%);
}

.search-card__meta {
  font-size: 12px;
  color: #c8d4e8;
  line-height: 1.5;
}

.search-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 4px;
}

.search-card__action {
  padding: 0;
  border: none;
  background: transparent;
  color: var(--color-accent-2);
  font-size: 12px;
  white-space: nowrap;
  cursor: pointer;
  font-family: inherit;
}

.search-card__action:hover {
  color: #6df;
  text-decoration: underline;
}
</style>
