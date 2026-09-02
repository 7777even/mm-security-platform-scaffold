<script setup lang="ts">
import { computed, ref } from 'vue';
import PreliminarySidePanel from '../../common/PreliminarySidePanel.vue';
import ClipImage from '../../common/ClipImage.vue';
import { dutyWatchPersons } from '../../../lib/data/preliminaryMock';
import { fireDutyWatchPersons } from '../../../lib/data/fireEmergencyMock';
import { dutyAvatarClips } from '../../../utils/preliminaryClipConfig';
import { fireDutyAvatarClips } from '../../../utils/fireEmergencyClipConfig';
import type { DesignModule } from '../../../utils/designAssets';

const props = withDefaults(
  defineProps<{
    module?: Extract<DesignModule, 'preliminary' | 'fireEmergency'>;
  }>(),
  { module: 'preliminary' },
);

const shift = ref<'day' | 'night'>('day');

const persons = computed(() =>
  props.module === 'fireEmergency' ? fireDutyWatchPersons : dutyWatchPersons,
);
const avatarClips = computed(() =>
  props.module === 'fireEmergency' ? fireDutyAvatarClips : dutyAvatarClips,
);
</script>

<template>
  <PreliminarySidePanel title="值班值守" variant="duty" :module="module">
    <div class="duty-watch">
      <div class="duty-watch__filter">
        <span class="duty-watch__filter-label">部门：</span>
        <select class="duty-watch__select">
          <option>全部</option>
          <option>应急指挥部</option>
          <option>安全保卫部</option>
        </select>
      </div>

      <div class="duty-watch__list">
        <div v-for="person in persons" :key="person.id" class="duty-card">
          <ClipImage v-bind="avatarClips[person.avatarIndex]" class="duty-card__avatar" />
          <div class="duty-card__info">
            <div class="duty-card__head">
              <span class="duty-card__name">{{ person.name }}</span>
              <span class="duty-card__role">{{ person.role }}</span>
            </div>
            <div class="duty-card__phone">{{ person.phone }}</div>
          </div>
        </div>
      </div>

      <div class="duty-watch__shift">
        <button
          type="button"
          class="shift-btn"
          :class="{ 'shift-btn--active': shift === 'day' }"
          @click="shift = 'day'"
        >
          白班
        </button>
        <button
          type="button"
          class="shift-btn"
          :class="{ 'shift-btn--active': shift === 'night' }"
          @click="shift = 'night'"
        >
          夜班
        </button>
      </div>
    </div>
  </PreliminarySidePanel>
</template>

<style scoped>
/* 设计切图 image_0012：394×219 */
.duty-watch {
  display: grid;
  grid-template-rows: 44px 1fr 34px;
  height: 219px;
  gap: 4px;
}

.duty-watch__filter {
  display: flex;
  align-items: center;
  gap: 4px;
  min-height: 0;
}

.duty-watch__filter-label {
  font-size: 14px;
  color: #c8d4e8;
  white-space: nowrap;
}

.duty-watch__select {
  flex: 1;
  height: 32px;
  padding: 0 28px 0 10px;
  background: rgb(0 22 48 / 75%);
  border: 1px solid rgb(0 110 190 / 38%);
  border-radius: 2px;
  color: #fff;
  font-size: 14px;
  font-family: var(--font-body);
  outline: none;
  appearance: none;
}

.duty-watch__list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 6px 8px;
  min-height: 0;
}

.duty-card {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 0;
  padding: 6px 8px;
  background: rgb(0 18 40 / 55%);
  border: 1px solid rgb(0 110 190 / 32%);
  border-radius: 2px;
}

.duty-card__avatar {
  flex-shrink: 0;
}

.duty-card__info {
  min-width: 0;
  flex: 1;
}

.duty-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
}

.duty-card__name {
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  white-space: nowrap;
}

.duty-card__role {
  font-size: 12px;
  color: #5ecfb8;
  white-space: nowrap;
}

.duty-card__phone {
  margin-top: 4px;
  font-size: 12px;
  color: #a8b8cc;
  line-height: 1.2;
}

.duty-watch__shift {
  display: flex;
  height: 32px;
  border: 1px solid rgb(0 110 190 / 38%);
  border-radius: 2px;
  overflow: hidden;
}

.shift-btn {
  flex: 1;
  border: none;
  background: rgb(0 22 48 / 75%);
  color: #a8b8cc;
  font-size: 14px;
  font-family: var(--font-body);
  cursor: pointer;
}

.shift-btn--active {
  background: linear-gradient(180deg, rgb(0 130 220 / 88%), rgb(0 90 180 / 88%));
  color: #fff;
}
</style>
