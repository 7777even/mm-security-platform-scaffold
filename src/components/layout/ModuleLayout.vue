<!--
  ModuleLayout — 业务模块统一骨架（对齐设计稿 §5.4 页面骨架）

  所有业务模块共用同一布局：
    - 中央：Cesium 地图底座（BaseMap，二三维一体化）
    - 两侧：绝对定位 419px PanelCard 列（左 #left / 右 #right 插槽）
    - 右上：2D/3D 切换浮层（避开右侧面板）

  与 dashboard 既有实现保持一致；业务模块统一收敛到本组件，避免布局漂移。
  中央底座默认渲染 BaseMap；亦可通过 #center 插槽覆盖（如工业视频墙）。
-->
<script setup lang="ts">
import { ref, computed } from 'vue';
import { MAP_TILE_URL } from '@/constants/map';
import BaseMap from '@/components/cesium/BaseMap.vue';
import type { MapPoint, RiskZone } from '@/services/map';
import type { ClusterPoint } from '@/services/cesium-cluster';
import type { PickResult, ZonePick } from '@/services/cesium';

const props = withDefaults(
  defineProps<{
    tileUrl?: string;
    alarms?: MapPoint[];
    devices?: MapPoint[];
    zones?: RiskZone[];
    clusterPoints?: ClusterPoint[];
    loading?: boolean;
    showMap?: boolean;
  }>(),
  {
    tileUrl: MAP_TILE_URL,
    alarms: () => [],
    devices: () => [],
    zones: () => [],
    clusterPoints: () => [],
    loading: false,
    showMap: true,
  },
);

const emit = defineEmits<{
  error: [];
  'mode-change': [mode: '2d' | '3d'];
  pick: [result: PickResult | null];
  'zone-pick': [zone: ZonePick];
}>();

const sceneMode = ref<'2d' | '3d'>('3d');
const mapNotice = ref('');

// 聚合打点数据：优先使用外部传入的 clusterPoints，否则由 alarms/devices 自动聚合（遵循项目 UI 规范着色）
const clusterPointsData = computed<ClusterPoint[]>(() => {
  if (props.clusterPoints && props.clusterPoints.length) return props.clusterPoints;
  return [
    ...props.alarms.map((p) => ({
      id: `alarm:${p.id}`,
      name: p.name,
      lng: p.lng,
      lat: p.lat,
      type: 'alarm',
      raw: { ...p },
    })),
    ...props.devices.map((p) => ({
      id: `device:${p.id}`,
      name: p.name,
      lng: p.lng,
      lat: p.lat,
      type: 'device',
      raw: { ...p },
    })),
  ];
});

function onMapError(): void {
  mapNotice.value = '地图初始化失败：当前环境不支持 WebGL，已降级';
  sceneMode.value = '2d';
  emit('error');
}

function onModeChange(mode: '2d' | '3d'): void {
  sceneMode.value = mode;
  emit('mode-change', mode);
}

function onPick(result: PickResult | null): void {
  emit('pick', result);
}

function onZonePick(zone: ZonePick): void {
  emit('zone-pick', zone);
}
</script>

<template>
  <div class="module-map">
    <!-- 中央地图底座（默认） / 或 #center 插槽覆盖，底图经统一深蓝科技色调色与系统基色融合 -->
    <slot name="center">
      <BaseMap
        v-if="showMap"
        :tile-url="tileUrl"
        :alarms="alarms"
        :devices="devices"
        :zones="zones"
        :cluster-points="clusterPointsData"
        :scene-mode="sceneMode"
        @error="onMapError"
        @mode-change="onModeChange"
        @pick="onPick"
        @zone-pick="onZonePick"
      />
    </slot>

    <p v-if="mapNotice" class="module-map__notice">{{ mapNotice }}</p>

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

/* 地图降级提示 */
.module-map__notice {
  position: absolute;
  top: var(--space-md);
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  padding: 6px 16px;
  border-radius: var(--radius-sm);
  background: var(--notice-warning-bg);
  border: 1px solid var(--color-warning);
  color: var(--color-warning);
  font-size: 12px;
}

/* 底部快捷控制（地图正下方居中） */
.module-map__bottom {
  position: absolute;
  left: 50%;
  bottom: 24px;
  transform: translateX(-50%);
  z-index: 6;
}

/* 左侧数据列（设计稿 419px）：超出可滚动但隐藏滚动条（与 dashboard 一致） */
.module-map__left {
  position: absolute;
  top: var(--space-md);
  left: var(--space-md);
  bottom: var(--space-md);
  width: var(--layout-aside-w);
  z-index: 5;
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
  z-index: 5;
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
  z-index: 10;
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
