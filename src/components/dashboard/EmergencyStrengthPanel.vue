<template>
  <PanelCard title="应急力量数据" icon="TrendCharts">
    <div class="strength" data-test="emergency-strength-grid">
      <div v-for="r in resources" :key="r.kind" class="strength__cell">
        <span class="strength__icon">
          <el-icon :size="22" color="#7ad7ff">
            <component :is="ICON_MAP[r.icon]" />
          </el-icon>
        </span>
        <div class="strength__meta">
          <span class="strength__count">{{ formatCount(r.count) }}</span>
          <span class="strength__label">{{ r.kind }}</span>
        </div>
      </div>
    </div>
  </PanelCard>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import PanelCard from '@/components/common/PanelCard.vue';
import {
  fetchEmergencyStrength,
  type EmergencyResource,
  type EmergencyStrength,
} from '@/services/emergency';
import {
  Avatar,
  Box,
  Tools,
  OfficeBuilding,
  FirstAidKit,
  UserFilled,
  Van,
  Warning,
} from '@element-plus/icons-vue';

const ICON_MAP: Record<string, unknown> = {
  Avatar,
  Box,
  Tools,
  OfficeBuilding,
  FirstAidKit,
  UserFilled,
  Van,
  Warning,
};

const resources = ref<EmergencyResource[]>([]);

function formatCount(n: number): string {
  return n.toLocaleString('en-US');
}

onMounted(async () => {
  try {
    const data: EmergencyStrength = await fetchEmergencyStrength();
    resources.value = data.resources;
  } catch {
    resources.value = [];
  }
});
</script>

<style scoped>
.strength {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.strength__cell {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: rgb(255 255 255 / 6%);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  min-height: 64px;
}

.strength__icon {
  flex: 0 0 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: rgb(122 215 255 / 14%);
  border: 1px solid rgb(122 215 255 / 35%);
}

.strength__meta {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.strength__count {
  font-size: 22px;
  font-weight: 700;
  color: #7ad7ff;
  font-family: 'DIN Alternate', 'Microsoft YaHei', monospace;
  line-height: 1;
}

.strength__label {
  font-size: 12px;
  color: var(--color-text-muted);
}
</style>
