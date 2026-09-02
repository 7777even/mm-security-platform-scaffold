<script setup lang="ts">
import { computed } from 'vue';
import { useWorldMarkerScreenPositions } from '../../lib/composables/useCesiumScreenAnchor';
import { getSharedMap } from '../../lib/composables/sharedCesiumBridge';
import { coordsForFireBrigadeTeam, coordsForSquadronPaged } from '../../lib/data/rescueMapCoords';
import {
  fireBrigadeViewActive,
  fireBrigadeCurrentPage,
  fireBrigadePagedTeams,
  selectFireBrigade,
  selectedFireBrigadeId,
} from '../../lib/composables/useFireBrigadeView';
import {
  rescueEquipmentViewActive,
  rescueEquipmentCurrentPage,
  rescueEquipmentPagedItems,
  selectRescueEquipment,
  selectedRescueEquipmentId,
} from '../../lib/composables/useRescueEquipmentView';
import {
  rescuePersonnelViewActive,
  rescuePersonnelCurrentPage,
  rescuePersonnelPagedItems,
  selectRescuePersonnel,
  selectedRescuePersonnelId,
} from '../../lib/composables/useRescuePersonnelView';
import {
  rescueVehicleViewActive,
  rescueVehicleCurrentPage,
  rescueVehiclePagedItems,
  selectRescueVehicle,
  selectedRescueVehicleId,
} from '../../lib/composables/useRescueVehicleView';
import {
  specialOperationViewActive,
  specialOperationCurrentPage,
  specialOperationPagedItems,
  selectSpecialOperation,
  selectedSpecialOperationId,
} from '../../lib/composables/useSpecialOperationView';
import { coordsForPagedSpread } from '../../lib/data/rescueMapCoords';

interface RescueMapMarker {
  mapKey: string;
  id: number;
  label: string;
  meta?: string;
  longitude: number;
  latitude: number;
}

const markers = computed<RescueMapMarker[]>(() => {
  if (fireBrigadeViewActive.value) {
    const page = fireBrigadeCurrentPage.value;
    const teams = fireBrigadePagedTeams.value;
    return teams.map((team, index) => {
      const { longitude, latitude } = coordsForFireBrigadeTeam(team, index, teams.length, page);
      return {
        mapKey: `brigade-${page}-${team.id}`,
        id: team.id,
        label: team.name,
        meta: team.location,
        longitude,
        latitude,
      };
    });
  }

  if (rescueEquipmentViewActive.value) {
    const page = rescueEquipmentCurrentPage.value;
    const items = rescueEquipmentPagedItems.value;
    return items.map((item, index) => {
      const { longitude, latitude } = coordsForSquadronPaged(
        item.squadron,
        item.id,
        index,
        items.length,
        page,
      );
      return {
        mapKey: `equip-${page}-${item.id}`,
        id: item.id,
        label: item.name,
        meta: item.squadron,
        longitude,
        latitude,
      };
    });
  }

  if (rescuePersonnelViewActive.value) {
    const page = rescuePersonnelCurrentPage.value;
    const items = rescuePersonnelPagedItems.value;
    return items.map((item, index) => {
      const { longitude, latitude } = coordsForSquadronPaged(
        item.squadron,
        item.id,
        index,
        items.length,
        page,
      );
      return {
        mapKey: `personnel-${page}-${item.id}`,
        id: item.id,
        label: item.name,
        meta: `${item.squadron} · ${item.role}`,
        longitude,
        latitude,
      };
    });
  }

  if (rescueVehicleViewActive.value) {
    const page = rescueVehicleCurrentPage.value;
    const items = rescueVehiclePagedItems.value;
    return items.map((item, index) => {
      const { longitude, latitude } = coordsForSquadronPaged(
        item.squadron,
        item.id,
        index,
        items.length,
        page,
      );
      return {
        mapKey: `vehicle-${page}-${item.id}`,
        id: item.id,
        label: item.plate,
        meta: `${item.type} · ${item.status}`,
        longitude,
        latitude,
      };
    });
  }

  if (specialOperationViewActive.value) {
    const page = specialOperationCurrentPage.value;
    const items = specialOperationPagedItems.value;
    return items.map((item, index) => {
      const { longitude, latitude } = coordsForPagedSpread(index, items.length, page, item.id);
      return {
        mapKey: `specop-${page}-${item.id}`,
        id: item.id,
        label: item.area,
        meta: `${item.type} · ${item.status}`,
        longitude,
        latitude,
      };
    });
  }

  return [];
});

const selectedId = computed(() => {
  if (fireBrigadeViewActive.value) return selectedFireBrigadeId.value;
  if (rescueEquipmentViewActive.value) return selectedRescueEquipmentId.value;
  if (rescuePersonnelViewActive.value) return selectedRescuePersonnelId.value;
  if (rescueVehicleViewActive.value) return selectedRescueVehicleId.value;
  if (specialOperationViewActive.value) return selectedSpecialOperationId.value;
  return null;
});

const clickable = computed(
  () =>
    fireBrigadeViewActive.value ||
    rescueEquipmentViewActive.value ||
    rescuePersonnelViewActive.value ||
    rescueVehicleViewActive.value ||
    specialOperationViewActive.value,
);

const { styleFor: markerStyleFor } = useWorldMarkerScreenPositions(() => {
  const height = getSharedMap()?.getBoundaryModelTopHeight?.() ?? 72.05;
  return markers.value.map((marker) => ({
    key: marker.mapKey,
    longitude: marker.longitude,
    latitude: marker.latitude,
    height,
  }));
});

function handleSelect(id: number) {
  if (fireBrigadeViewActive.value) {
    selectFireBrigade(id);
    return;
  }
  if (rescueEquipmentViewActive.value) {
    selectRescueEquipment(id);
    return;
  }
  if (rescuePersonnelViewActive.value) {
    selectRescuePersonnel(id);
    return;
  }
  if (rescueVehicleViewActive.value) {
    selectRescueVehicle(id);
    return;
  }
  if (specialOperationViewActive.value) {
    selectSpecialOperation(id);
  }
}
</script>

<template>
  <div class="rescue-map-layer" aria-hidden="true">
    <div
      v-for="marker in markers"
      :key="marker.mapKey"
      class="rescue-map-marker"
      :class="{ 'rescue-map-marker--active': selectedId === marker.id }"
      :style="markerStyleFor(marker.mapKey)"
    >
      <component
        :is="clickable ? 'button' : 'div'"
        :type="clickable ? 'button' : undefined"
        class="rescue-map-marker__body"
        @click="clickable ? handleSelect(marker.id) : undefined"
      >
        <div class="rescue-map-marker__box">
          <div class="rescue-map-marker__title">{{ marker.label }}</div>
          <div v-if="marker.meta" class="rescue-map-marker__meta">{{ marker.meta }}</div>
        </div>
        <div class="rescue-map-marker__stem" />
        <div class="rescue-map-marker__dot" />
      </component>
    </div>
  </div>
</template>

<style scoped>
.rescue-map-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 4;
}

.rescue-map-marker {
  position: absolute;
  transform: translate(-50%, -100%);
  pointer-events: none;
}

.rescue-map-marker__body {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
  border: none;
  background: transparent;
  cursor: default;
  pointer-events: auto;
}

button.rescue-map-marker__body {
  cursor: pointer;
}

.rescue-map-marker__box {
  max-width: 148px;
  padding: 4px 8px;
  border-radius: 2px;
  background: rgb(0 18 40 / 88%);
  border: 1px solid rgb(0 140 220 / 35%);
  text-align: center;
}

.rescue-map-marker--active .rescue-map-marker__box {
  border-color: rgb(0 200 255 / 75%);
  box-shadow: 0 0 10px rgb(0 180 255 / 35%);
}

.rescue-map-marker__title {
  font-size: 11px;
  font-weight: 500;
  color: #fff;
  line-height: 1.35;
  word-break: break-word;
}

.rescue-map-marker__meta {
  margin-top: 2px;
  font-size: 10px;
  color: #8aa4c4;
  line-height: 1.35;
  word-break: break-word;
}

.rescue-map-marker__stem {
  width: 1px;
  height: 10px;
  background: rgb(0 180 255 / 55%);
}

.rescue-map-marker__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #00c8ff;
  border: 2px solid rgb(255 255 255 / 85%);
  box-shadow: 0 0 8px rgb(0 200 255 / 55%);
}

.rescue-map-marker--active .rescue-map-marker__dot {
  width: 10px;
  height: 10px;
  background: #3de0ff;
}
</style>
