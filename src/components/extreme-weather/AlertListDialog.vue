<!--
  AlertListDialog — 极端天气预警信息发布列表（二级界面 alertList）
  使用通用 AlarmCard 逐条渲染 weatherAlerts（level 取自规范 AlarmLevel 1..4）。
  数据消费 extremeWeatherPanelMock.weatherAlerts。
-->
<script setup lang="ts">
import ScreenDialog from '@/components/fire/ScreenDialog.vue';
import AlarmCard from '@/components/common/AlarmCard.vue';
import { weatherAlerts } from '@/services/map-data/extremeWeatherPanelMock';

const emit = defineEmits<{ close: [] }>();
</script>

<template>
  <ScreenDialog :open="true" title="预警信息发布" icon="bell-ringing" @close="emit('close')">
    <div class="alert-list">
      <AlarmCard
        v-for="a in weatherAlerts"
        :key="a.id"
        :level="a.level"
        :title="a.title"
        :desc="a.desc"
        :time="a.time"
      />
    </div>
  </ScreenDialog>
</template>

<style scoped>
.alert-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
  overflow: auto;
}
</style>
