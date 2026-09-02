<script setup lang="ts">
import { computed } from 'vue';
import { assets } from '../../utils/designAssets';
import { getSharedMap } from '../../lib/composables/sharedCesiumBridge';
import { useWorldMarkerScreenPositions } from '../../lib/composables/useCesiumScreenAnchor';
import { fireBrigadeTeams, getFireBrigadeTeam } from '../../lib/data/fireBrigadeMock';
import { selectedFireBrigadeId, selectFireBrigade } from '../../lib/composables/useFireBrigadeView';

const activeTeam = computed(() => getFireBrigadeTeam(selectedFireBrigadeId.value));

const { styleFor: markerStyleFor } = useWorldMarkerScreenPositions(() => {
  const height = getSharedMap()?.getBoundaryModelTopHeight?.() ?? 72.05;
  return fireBrigadeTeams.map((team) => ({
    key: String(team.id),
    longitude: team.longitude,
    latitude: team.latitude,
    height,
  }));
});
</script>

<template>
  <div class="brigade-map" aria-hidden="true">
    <div
      v-for="team in fireBrigadeTeams"
      :key="team.id"
      class="brigade-marker"
      :class="{ 'brigade-marker--active': selectedFireBrigadeId === team.id }"
      :style="markerStyleFor(String(team.id))"
    >
      <button
        type="button"
        class="brigade-marker__btn"
        :title="team.name"
        @click="selectFireBrigade(team.id)"
      >
        <span class="brigade-marker__label">{{ team.name }}</span>
        <span class="brigade-marker__pin">
          <img class="brigade-marker__outer" :src="assets.fireMarkerOuter" alt="" />
          <img class="brigade-marker__inner" :src="assets.fireMarkerInner" alt="" />
          <img class="brigade-marker__icon" :src="assets.fireMarkerIcon" alt="" />
        </span>
      </button>
    </div>

    <div v-if="activeTeam" class="brigade-popup" :style="markerStyleFor(String(activeTeam.id))">
      <div class="brigade-popup__card">
        <div class="brigade-popup__title">{{ activeTeam.name }}</div>
        <div class="brigade-popup__row">救援人员：{{ activeTeam.rescuePersonnel }}人</div>
        <div class="brigade-popup__row">救援车辆：{{ activeTeam.rescueVehicles }}辆</div>
        <div class="brigade-popup__row">负责人：{{ activeTeam.leaderName }}</div>
        <div class="brigade-popup__row">位置：{{ activeTeam.location }}</div>
        <div class="brigade-popup__desc">{{ activeTeam.description }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.brigade-map {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: var(--z-chrome);
}

.brigade-marker,
.brigade-popup {
  position: absolute;
  transform: translate(-50%, -100%);
  pointer-events: none;
}

.brigade-marker__btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  pointer-events: auto;
}

.brigade-marker__label {
  padding: 2px 8px;
  border-radius: 2px;
  background: var(--map-facility-btn-bg);
  border: 1px solid rgb(0 150 240 / 35%);
  color: var(--color-text-strong);
  font-size: 11px;
  white-space: nowrap;
}

.brigade-marker--active .brigade-marker__label {
  border-color: rgb(0 200 255 / 75%);
  box-shadow: 0 0 8px var(--panel-border);
}

.brigade-marker__pin {
  position: relative;
  width: 42px;
  height: 52px;
}

.brigade-marker__outer,
.brigade-marker__inner,
.brigade-marker__icon {
  position: absolute;
  object-fit: contain;
}

.brigade-marker__outer {
  left: 50%;
  top: 0;
  width: 34px;
  transform: translateX(-50%);
}

.brigade-marker__inner {
  left: 50%;
  top: 4px;
  width: 28px;
  transform: translateX(-50%);
}

.brigade-marker__icon {
  left: 50%;
  top: 10px;
  width: 14px;
  transform: translateX(-50%);
}

.brigade-popup {
  margin-top: -118px;
  margin-left: 58px;
}

.brigade-popup__card {
  width: 168px;
  padding: 10px 12px;
  border-radius: 2px;
  background: rgb(0 18 40 / 90%);
  border: 1px solid rgb(0 130 210 / 35%);
  box-shadow: 0 8px 20px rgb(0 0 0 / 28%);
  pointer-events: none;
}

.brigade-popup__title {
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-strong);
}

.brigade-popup__row {
  font-size: 11px;
  color: #c8d8ec;
  line-height: 1.45;
}

.brigade-popup__desc {
  margin-top: 6px;
  font-size: 11px;
  color: var(--map-device-offline);
  line-height: 1.4;
}
</style>
