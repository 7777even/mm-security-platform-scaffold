<script setup lang="ts">
import type { Component } from 'vue';
import {
  OfficeBuilding,
  Tools,
  Box,
  Warning,
  Connection,
  Monitor,
  Location,
  FirstAidKit,
  Refresh,
  Microphone,
  Phone,
} from '@element-plus/icons-vue';

defineProps<{
  name: string;
  count: number;
  image: string;
}>();

/* 设施/设备名称 → 图标：名称缺失时回退 Box */
const OVERVIEW_ICONS: Record<string, Component> = {
  厂区: OfficeBuilding,
  生产装置: Tools,
  仓库: Box,
  重大危险源: Warning,
  储罐: Box,
  '卡口/通道': Connection,
  监测点: Monitor,
  人员定位: Location,
  消防设施: FirstAidKit,
  通风设备: Refresh,
  广播: Microphone,
  电话: Phone,
};

function overviewIcon(name: string) {
  return OVERVIEW_ICONS[name] ?? Box;
}
</script>

<template>
  <div class="overview-item">
    <span class="overview-item__icon" aria-hidden="true">
      <component :is="overviewIcon(name)" />
    </span>
    <div class="overview-item__info">
      <div class="overview-item__name">{{ name }}</div>
      <div class="overview-item__count">{{ count }}</div>
    </div>
  </div>
</template>

<style scoped>
.overview-item {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 70px;
  min-height: 0;
  padding-right: 8px;
  background: rgb(0 20 45 / 50%);
  border: 1px solid rgb(0 130 210 / 32%);
  border-radius: 2px;
  box-sizing: border-box;
  overflow: hidden;
}

.overview-item__icon {
  flex-shrink: 0;
  width: 68px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-accent);
}

.overview-item__icon svg {
  width: 20px;
  height: 20px;
  fill: currentcolor;
}

.overview-item__info {
  min-width: 0;
  flex: 1;
  padding-left: 2px;
}

.overview-item__name {
  font-size: 13px;
  color: #7cdbff;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.overview-item__count {
  margin-top: 6px;
  font-size: 24px;
  font-weight: 700;
  color: #7cdbff;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
</style>
