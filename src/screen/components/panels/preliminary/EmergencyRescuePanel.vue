<script setup lang="ts">
import { computed } from 'vue';
import PreliminarySidePanel from '../../common/PreliminarySidePanel.vue';
import ClipImage from '../../common/ClipImage.vue';
import { rescueForceStats } from '../../../lib/data/preliminaryMock';
import { fireRescueForceStats } from '../../../lib/data/fireEmergencyMock';
import { rescueIconClips } from '../../../utils/preliminaryClipConfig';
import { fireRescueIconClips } from '../../../utils/fireEmergencyClipConfig';
import type { DesignModule } from '../../../utils/designAssets';

const props = withDefaults(
  defineProps<{
    module?: Extract<DesignModule, 'preliminary' | 'fireEmergency'>;
  }>(),
  { module: 'preliminary' },
);

const stats = computed(() =>
  props.module === 'fireEmergency' ? fireRescueForceStats : rescueForceStats,
);
const iconClips = computed(() =>
  props.module === 'fireEmergency' ? fireRescueIconClips : rescueIconClips,
);
</script>

<template>
  <PreliminarySidePanel title="应急力量救援" variant="rescue" :module="module">
    <div class="rescue-grid">
      <div v-for="stat in stats" :key="stat.label" class="rescue-item">
        <ClipImage v-bind="iconClips[stat.iconIndex]" class="rescue-item__icon" />
        <div class="rescue-item__text">
          <div class="rescue-item__value">{{ stat.value }}</div>
          <div class="rescue-item__label">{{ stat.label }}</div>
        </div>
      </div>
    </div>
  </PreliminarySidePanel>
</template>

<style scoped>
/* 设计切图 image_0011：398×259，2列×4行 */
.rescue-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: 1px;
  height: 259px;
  background: rgb(0 90 160 / 22%);
  border: 1px solid rgb(0 100 180 / 28%);
  border-radius: 2px;
  overflow: hidden;
}

.rescue-item {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 0;
  padding: 8px 10px 8px 18px;
  background: rgb(0 14 32 / 82%);
}

.rescue-item__icon {
  flex-shrink: 0;
}

.rescue-item__text {
  min-width: 0;
}

.rescue-item__value {
  font-size: 22px;
  font-weight: 700;
  color: #00d4ff;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.rescue-item__label {
  margin-top: 4px;
  font-size: 12px;
  color: #c4d4e8;
  line-height: 1.2;
  white-space: nowrap;
}
</style>
