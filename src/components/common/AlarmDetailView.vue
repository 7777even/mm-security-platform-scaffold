<script setup lang="ts">
import { computed } from 'vue';
import AppButton from '@/components/common/AppButton.vue';
import type { AlarmItem } from '@/services/alarm';
import {
  ALARM_LEVEL_TEXT,
  ALARM_STATUS_TEXT,
  ALARM_TYPE_LABEL,
  alarmLevelColor,
  formatAlarmTs,
} from '@/composables/useAlarmMeta';

const props = defineProps<{ alarm: AlarmItem }>();
const emit = defineEmits<{
  (e: 'ack', alarm: AlarmItem): void;
  (e: 'close'): void;
}>();

const typeLabel = computed(() => ALARM_TYPE_LABEL[props.alarm.type]);
const statusLabel = computed(() => ALARM_STATUS_TEXT[props.alarm.status]);
const levelLabel = computed(() => ALARM_LEVEL_TEXT[props.alarm.level]);
const levelColor = computed(() => alarmLevelColor(props.alarm.level));
const tsText = computed(() => formatAlarmTs(props.alarm.ts));
const canAck = computed(() => props.alarm.status === 'ACTIVE');
</script>

<template>
  <div class="alarm-detail">
    <dl class="detail-view">
      <div class="detail-view__row">
        <dt>编号</dt>
        <dd class="font-number">{{ alarm.alarmId }}</dd>
      </div>
      <div class="detail-view__row">
        <dt>等级</dt>
        <dd>
          <span class="alarm-detail__level" :style="{ color: levelColor }">{{ levelLabel }}</span>
        </dd>
      </div>
      <div class="detail-view__row">
        <dt>类型</dt>
        <dd>{{ typeLabel }}</dd>
      </div>
      <div class="detail-view__row">
        <dt>状态</dt>
        <dd>{{ statusLabel }}</dd>
      </div>
      <div class="detail-view__row">
        <dt>设备编码</dt>
        <dd class="font-number">{{ alarm.deviceCode }}</dd>
      </div>
      <div class="detail-view__row">
        <dt>位置</dt>
        <dd>{{ alarm.location }}</dd>
      </div>
      <div class="detail-view__row">
        <dt>时间</dt>
        <dd class="font-number">{{ tsText }}</dd>
      </div>
      <div class="detail-view__row">
        <dt>描述</dt>
        <dd>{{ alarm.description }}</dd>
      </div>
    </dl>
    <div class="alarm-detail__actions">
      <AppButton variant="primary" size="sm" :disabled="!canAck" @click="emit('ack', alarm)">
        确认处置
      </AppButton>
      <AppButton variant="ghost" size="sm" @click="emit('close')">关闭</AppButton>
    </div>
  </div>
</template>

<style scoped>
.alarm-detail {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg, 16px);
}

.alarm-detail__level {
  font-weight: 700;
}

.alarm-detail__actions {
  display: flex;
  gap: var(--space-sm, 8px);
  justify-content: flex-end;
}
</style>
