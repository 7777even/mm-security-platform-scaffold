<!--
ModuleLayout — 业务模块统一骨架（对齐设计稿 §5.4 页面骨架）

所有业务模块共用同一布局：
- 中央：源项目地图底座（SharedCesiumMap：Esri 影像 + 世界地形 + 茂名石化装置区立体渲染）
- 两侧：绝对定位 419px PanelCard 列（左 #left / 右 #right 插槽）

报警/设备点位经 map-adapter 映射为 HTML 覆盖层（worldToScreen 屏幕锚定）；
中央底座可通过 #center 插槽覆盖（如工业视频墙）。
-->
<script setup lang="ts">
import { computed } from 'vue';
import SharedCesiumMap from '@/components/map/SharedCesiumMap.vue';
import AccidentRescueMarkersOverlay from '@/components/map/AccidentRescueMarkersOverlay.vue';
import type { MapPoint } from '@/services/map';
import { toMonitoringPoints } from '@/services/map-adapter';

const props = withDefaults(
  defineProps<{
    alarms?: MapPoint[];
    devices?: MapPoint[];
    loading?: boolean;
    showMap?: boolean;
  }>(),
  {
    alarms: () => [],
    devices: () => [],
    loading: false,
    showMap: true,
  },
);

// 覆盖层监测点：报警/设备点位经适配层映射为源项目 HTML 覆盖层输入
const monitoringPoints = computed(() => [
  ...toMonitoringPoints(props.alarms, 'alarm'),
  ...toMonitoringPoints(props.devices, 'device'),
]);
</script>

<template>
  <div class="module-map">
    <!-- 中央地图底座（默认） / 或 #center 插槽覆盖 -->
    <slot name="center">
      <SharedCesiumMap v-if="showMap" />
      <!-- 报警/设备点位覆盖层（HTML 锚定，worldToScreen 跟随相机） -->
      <AccidentRescueMarkersOverlay
        v-if="showMap"
        :monitoring-points="monitoringPoints"
        class="module-map__overlay"
      />
    </slot>

    <!-- 底部快捷控制（原型安全防恐地图底部一排图标，默认无内容） -->
    <div v-if="$slots.bottom" class="module-map__bottom">
      <slot name="bottom" />
    </div>

    <!-- 左侧数据列（设计稿 419px） -->
    <div v-if="$slots.left" class="module-map__left">
      <slot name="left" />
    </div>

    <!-- 右侧数据列（设计稿 419px） -->
    <div v-if="$slots.right" class="module-map__right">
      <slot name="right" />
    </div>

    <!-- 加载骨架屏 -->
    <div v-if="loading" class="module-map__skeleton">
      <span class="skeleton skeleton-line" style="width: 200px" />
      <span class="skeleton skeleton-line" style="width: 160px" />
      <span class="skeleton skeleton-line" style="width: 180px" />
    </div>
  </div>
</template>

<style scoped>
.module-map {
  position: relative;
  height: 100%;

  /* 不裁切子元素溢出：左右数据列内部 overflow-y:auto 仍可滚 */
}

/* 地图覆盖层铺满容器（世界坐标锚定由 overlay 内部处理） */
.module-map__overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

/* 底部快捷控制（地图正下方居中） */
.module-map__bottom {
  position: absolute;
  left: 50%;
  bottom: 24px;
  transform: translateX(-50%);
  z-index: var(--z-chrome);
}

/* 左侧数据列（设计稿 419px）：超出可滚动但隐藏滚动条（与 dashboard 一致） */
.module-map__left {
  position: absolute;
  top: var(--space-md);
  left: var(--space-md);
  bottom: var(--space-md);
  width: var(--layout-aside-w);
  z-index: var(--z-chrome);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

/* 右侧数据列（设计稿 419px）：超出可滚动但隐藏滚动条（与 dashboard 一致） */
.module-map__right {
  position: absolute;
  top: var(--space-md);
  right: var(--space-md);
  bottom: var(--space-md);
  width: var(--layout-aside-w);
  z-index: var(--z-chrome);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.module-map__left::-webkit-scrollbar,
.module-map__right::-webkit-scrollbar {
  width: 0;
  height: 0;
  background: transparent;
}

/* 骨架屏 */
.module-map__skeleton {
  position: absolute;
  inset: 0;
  z-index: var(--z-chrome);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding: var(--space-lg);
  background: var(--color-bg);
}

.skeleton {
  display: block;
  background: linear-gradient(
    90deg,
    var(--skeleton-base),
    var(--skeleton-hi),
    var(--skeleton-base)
  );
  background-size: 200% 100%;
  animation: skeleton-sweep 1.4s ease-in-out infinite;
  border-radius: var(--radius-sm);
}

.skeleton-line {
  height: 16px;
}

@keyframes skeleton-sweep {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}
</style>
