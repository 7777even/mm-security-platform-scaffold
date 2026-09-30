<script setup lang="ts">
import { computed, type Component } from 'vue';
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
import { OVERVIEW_ITEM_ACTION_META, type OverviewItemAction } from '../../lib/overviewItemAction';

const props = defineProps<{
  name: string;
  count: number;
  image: string;
  /** 交互语义角标：见 lib/overviewItemAction.ts。不传则不渲染角标（纯展示卡）。 */
  action?: OverviewItemAction;
}>();

const actionMeta = computed(() => (props.action ? OVERVIEW_ITEM_ACTION_META[props.action] : null));

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
      <div class="overview-item__name" :title="name">{{ name }}</div>
      <div class="overview-item__count">{{ count }}</div>
    </div>
    <!-- 交互语义角标：提前告知点下去是「跳独立页」还是「就地展开」，避免整屏跳转的突兀感 -->
    <span
      v-if="actionMeta"
      class="overview-item__action"
      :class="`overview-item__action--${action}`"
      :title="actionMeta.hint"
    >
      <span class="overview-item__action-glyph" aria-hidden="true">{{ actionMeta.glyph }}</span>
      <span class="overview-item__action-label">{{ actionMeta.label }}</span>
    </span>
  </div>
</template>

<style scoped>
.overview-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 4px;
  height: var(--overview-item-h, 70px);
  min-height: 0;
  padding-right: 8px;
  background: rgb(0 20 45 / 50%);
  border: 1px solid rgb(0 130 210 / 32%);
  border-radius: 2px;
  box-sizing: border-box;
  overflow: hidden;
  transition:
    border-color 0.18s ease,
    background 0.18s ease;
}

/* 悬停态集中在本组件：原先两个承载面板各抄一份，容易出现改一处漏一处的不一致。 */
.overview-item:hover {
  border-color: var(--border-glow);
  background: var(--c-0-35-70-55);
}

.overview-item__icon {
  flex-shrink: 0;

  /* 原 68px 只居中放一个 20px 图标，右侧留白过多且挤占文案区（角标无法容纳）。 */
  width: 56px;
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

  /* 与右上角角标避让：角标绝对定位在卡片右上，文案区预留其宽度。 */
  padding-right: 42px;
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

.overview-item__action {
  position: absolute;
  top: 5px;
  right: 5px;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  height: 16px;
  padding: 0 4px;
  border-radius: 2px;
  font-size: 10px;
  line-height: 1;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.overview-item__action-glyph {
  font-size: 11px;
}

/* 跨页跳转：实心蓝底，权重更高（会离开当前页，值得更醒目的提前告知） */
.overview-item__action--navigate {
  color: var(--color-text-strong);
  border: 1px solid rgb(0 150 230 / 55%);
  background: linear-gradient(180deg, rgb(0 130 220 / 92%), rgb(0 90 180 / 92%));
}

/* 就地展开：描边款，权重更低（留在当前页，风险小） */
.overview-item__action--expand {
  color: var(--color-accent);
  border: 1px solid rgb(0 140 220 / 40%);
  background: rgb(0 30 64 / 85%);
}

.overview-item:hover .overview-item__action {
  filter: brightness(1.12);
}
</style>
