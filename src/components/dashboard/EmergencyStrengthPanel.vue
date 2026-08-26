<script setup lang="ts">
import { onMounted, ref, type Component } from 'vue';
import {
  FirstAidKit,
  Van,
  Warning,
  WarnTriangleFilled,
  Tools,
  Goods,
  OfficeBuilding,
  Plus,
} from '@element-plus/icons-vue';
import {
  fetchEmergencyStrength,
  type EmergencyResource,
  type EmergencyResourceKind,
} from '@/services/emergency';

const resources = ref<EmergencyResource[]>([]);

const ICON_MAP: Record<EmergencyResourceKind, Component> = {
  消防车: Van,
  救护车: FirstAidKit,
  警用车: WarnTriangleFilled,
  防化车: Warning,
  工程车: Tools,
  应急物资: Goods,
  消防站: OfficeBuilding,
  医疗点: Plus,
};

const COLOR_MAP: Record<EmergencyResourceKind, string> = {
  消防车: 'var(--color-alarm-1)',
  救护车: 'var(--color-success)',
  警用车: 'var(--color-alarm-4)',
  防化车: 'var(--color-alarm-2)',
  工程车: 'var(--color-warning)',
  应急物资: 'var(--color-accent)',
  消防站: 'var(--color-danger)',
  医疗点: 'var(--color-alarm-3)',
};

onMounted(async () => {
  resources.value = (await fetchEmergencyStrength()).resources;
});
</script>

<template>
  <div class="strength-grid" data-test="emergency-strength-grid">
    <div v-for="r in resources" :key="r.kind" class="strength-cell">
      <div class="cell-icon" :style="{ color: COLOR_MAP[r.kind] }">
        <el-icon :size="22"><component :is="ICON_MAP[r.kind]" /></el-icon>
      </div>
      <div class="cell-body">
        <div class="cell-kind">{{ r.kind }}</div>
        <div class="cell-nums">
          <span class="on-duty">{{ r.onDuty }}</span>
          <span class="cell-sep">/</span>
          <span class="cell-total">{{ r.total }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.strength-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.strength-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-panel-soft);
  transition:
    border-color var(--transition-fast),
    transform var(--transition-fast);
}

.strength-cell:hover {
  border-color: var(--color-accent);
  transform: translateY(-1px);
}

.cell-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  flex: 0 0 auto;
  border-radius: var(--radius-md);
  background: var(--color-panel);
}

.cell-body {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.cell-kind {
  font-size: 13px;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cell-nums {
  display: flex;
  align-items: baseline;
  gap: 2px;
  font-variant-numeric: tabular-nums;
  margin-top: 2px;
}

.on-duty {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text);
}

.cell-sep,
.cell-total {
  font-size: 12px;
  color: var(--color-text-muted);
}
</style>
