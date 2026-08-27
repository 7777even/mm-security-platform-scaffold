<script setup lang="ts">
import { formatAlarmTs } from '@/composables/useAlarmMeta';
import type { AlarmItem } from '@/services/alarm';

defineProps<{ alarm: AlarmItem | null }>();
</script>

<template>
  <div v-if="alarm" class="monitor-box">
    <div class="monitor-box__screen">
      <span class="monitor-box__icon">🎥</span>
      <span class="monitor-box__text">现场实时监控画面</span>
    </div>
    <p class="monitor-box__meta">{{ alarm.location }} · {{ formatAlarmTs(alarm.ts) }}</p>
  </div>
</template>

<style scoped>
/* 现场监控占位区（与应急指挥 / 消防报警共用，统一观感） */
.monitor-box {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.monitor-box__screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 200px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--color-panel-soft) 60%, transparent);
  color: var(--color-text-muted);
}

.monitor-box__icon {
  font-size: 32px;
}

.monitor-box__meta {
  margin: 0;
  font-size: 13px;
  color: var(--color-text-muted);
  text-align: center;
}
</style>
