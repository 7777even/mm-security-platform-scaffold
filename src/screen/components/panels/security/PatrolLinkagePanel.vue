<script setup lang="ts">
import PanelCard from '../../common/PanelCard.vue';
import { patrolZones } from '../../../lib/data/securityMock';
import { openPatrolCameraListView } from '../../../lib/composables/usePatrolCameraListView';
import { openPatrolLinkage } from '../../../lib/composables/usePatrolLinkage';

function handleMore() {
  openPatrolCameraListView();
}
</script>

<template>
  <PanelCard
    title="联动巡查"
    variant="patrolLeft"
    module="security"
    :show-more="true"
    @more="handleMore"
  >
    <div class="patrol-linkage">
      <div class="patrol-linkage__zones">
        <button
          v-for="zone in patrolZones"
          :key="zone.label"
          type="button"
          class="patrol-zone"
          @click="openPatrolLinkage(zone.label)"
        >
          <span class="patrol-zone__icon" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <template v-if="zone.iconIndex === 0">
                <path d="M12 3 19 6v5c0 4.6-2.8 8-7 10-4.2-2-7-5.4-7-10V6l7-3Z" />
                <path d="m9 12 2 2 4-5" />
              </template>
              <template v-else-if="zone.iconIndex === 1">
                <path d="M7 21 10 3M17 21 14 3M12 5v3m0 3v3m0 3v3" />
              </template>
              <template v-else-if="zone.iconIndex === 2">
                <path d="M4 20V7m16 13V7M4 10h16M7 10v10m5-10v10m5-10v10" />
                <path d="m3 7 4-3 5 3 5-3 4 3" />
              </template>
              <template v-else-if="zone.iconIndex === 3">
                <path d="M5 21V4h14v17M8 8h8M8 12h5" />
                <rect x="13" y="14" width="7" height="5" rx="1" />
              </template>
              <template v-else>
                <circle cx="12" cy="12" r="8" />
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v3m0 14v3M2 12h3m14 0h3" />
              </template>
            </svg>
          </span>
          <span class="patrol-zone__label">{{ zone.label }}</span>
        </button>
      </div>

      <p class="patrol-linkage__hint">选择防控区域，联动查看周边摄像机与巡查资源</p>
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

.patrol-linkage {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  gap: 6px;
}

.patrol-linkage__zones {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  grid-template-rows: minmax(88px, 1fr);
  gap: 6px;
  flex: 1;
  min-height: 0;
}

.patrol-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 0;
  padding: 8px 3px 7px;
  border: 1px solid rgb(0 110 190 / 32%);
  border-radius: 2px;
  background: rgb(0 18 40 / 55%);
  cursor: pointer;
}

.patrol-zone__label {
  font-size: 11px;
  color: #c4dcff;
  text-align: center;
  line-height: 1.3;
}

.patrol-zone__icon {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border: 1px solid rgb(31 206 255 / 72%);
  border-radius: 9px 9px 12px 12px;
  background: linear-gradient(145deg, rgb(0 157 211 / 28%), rgb(0 47 89 / 70%));
  color: #4de2ff;
  box-shadow:
    inset 0 0 12px rgb(0 183 255 / 14%),
    0 0 10px rgb(0 174 255 / 8%);
}

.patrol-zone__icon svg {
  width: 22px;
  height: 22px;
}

.patrol-zone:hover {
  border-color: rgb(35 207 255 / 72%);
  background: rgb(0 63 103 / 72%);
}

.patrol-zone:hover .patrol-zone__icon {
  color: #fff;
  box-shadow:
    inset 0 0 12px rgb(0 183 255 / 26%),
    0 0 12px rgb(0 174 255 / 20%);
}

.patrol-linkage__hint {
  flex-shrink: 0;
  margin: 0;
  color: #7899b3;
  font-size: 11px;
  line-height: 1.4;
  text-align: center;
}
</style>
