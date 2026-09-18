<script setup lang="ts">
import { computed, useSlots } from 'vue';
import MapMarkerIcon, { type MapMarkerIconName } from '@/components/map/MapMarkerIcon.vue';

/**
 * 大屏地图点位标注公共组件（统一标注语言）。
 *
 * 收敛自此前各页自绘的 5 套实现（`patrol-marker` / `device-marker` / `acc-point-marker` /
 * `fire-situation-marker` / `realtime-marker`），结构统一为：
 *
 *   [状态标签条：徽标 + 名称(+次行)]  →  [圆针：底色=色调色 + 内置线描图标]  →  [引线]  →  [呼吸点]
 *
 * 两种布局：
 * - `column`（默认）：标签条/针/引线/呼吸点纵向排列，锚点 `translate(-50%, -100%)`，针尖落在坐标点；
 * - `pulse`：仅圆针 + 中心呼吸环，锚点 `translate(-50%, -50%)`（用于密集点位，如报警/设备点位落图）。
 *
 * 色调取 token（不再各页写死 rgb）：normal=--map-marker-cyan、warning=--color-warning、
 * danger=--color-danger、alarm-2/alarm-3=分级色、offline=--map-device-offline（置灰）。
 * 坐标由调用方通过 `:style` 传入（`useCesiumScreenAnchor` / `useWorldMarkerScreenPositions` 等），
 * 组件自身不计算坐标。
 */
export type MapPointTone = 'normal' | 'warning' | 'danger' | 'alarm-2' | 'alarm-3' | 'offline';

const props = withDefaults(
  defineProps<{
    /** 针内内置线描图标 */
    icon?: MapMarkerIconName;
    /** 针内文本（与 icon 二选一，如「◆」） */
    pinText?: string;
    /** 标签条徽标文案（如 在线 / 正常 / 未销警） */
    status?: string;
    /** 标签条名称 */
    name?: string;
    /** 标签条次行（可选，独占一行） */
    sub?: string;
    /** 是否允许渲染标签条（无 status/name/sub 时自动不渲染） */
    showLabel?: boolean;
    /**
     * 布局：
     * - `column`（默认）：标签条/针/引线/呼吸点纵向排列，根节点 `translate(-50%, -100%)`（针尖落点）；
     * - `pulse`：仅圆针 + 中心呼吸环，`translate(-50%, -50%)`（密集点位）；
     * - `none`：根节点不施加 transform，仅提供 `position:absolute` + 调用方 `:style` 的 left/top，
     *   由 `#default` 插槽内的自定义内容自行负责定位（用于收编既有切图驱动点位，保留其原定位/transform）。
     */
    layout?: 'column' | 'pulse' | 'none';
    tone?: MapPointTone;
    /** 针直径 / 图标尺寸 / 引线高度 / 呼吸点直径（px） */
    pinSize?: number;
    iconSize?: number;
    stemHeight?: number;
    breathSize?: number;
    /** 是否渲染呼吸点/呼吸环 */
    breath?: boolean;
    /** 标签条最大宽度（px） */
    labelMaxWidth?: number;
    /** 是否可交互（true → <button> + 点击 emit('activate')） */
    interactive?: boolean;
    /** 高亮态（事故救援「已定位」用） */
    active?: boolean;
    ariaLabel?: string;
    title?: string;
  }>(),
  {
    icon: undefined,
    pinText: '',
    status: '',
    name: '',
    sub: '',
    showLabel: true,
    layout: 'column',
    tone: 'normal',
    pinSize: 26,
    iconSize: 15,
    stemHeight: 18,
    breathSize: 8,
    breath: true,
    labelMaxWidth: 140,
    interactive: false,
    active: false,
    ariaLabel: undefined,
    title: undefined,
  },
);

const emit = defineEmits<{ activate: [] }>();

const slots = useSlots();
/** 调用方提供整段自定义内容（#default）时，根节点仅做定位容器，不再渲染内置标签条/圆针/引线/呼吸点 */
const hasBodySlot = computed(() => Boolean(slots.default));

const hasLabel = computed(
  () => props.showLabel && Boolean(props.status || props.name || props.sub),
);

const vars = computed(() => ({
  '--marker-pin-size': `${props.pinSize}px`,
  '--marker-icon-size': `${props.iconSize}px`,
  '--marker-stem-h': `${props.stemHeight}px`,
  '--marker-breath-size': `${props.breathSize}px`,
  '--marker-label-max-w': `${props.labelMaxWidth}px`,
}));

function onClick() {
  if (props.interactive) emit('activate');
}
</script>

<template>
  <component
    :is="interactive ? 'button' : 'div'"
    class="map-point-marker"
    :class="[
      `map-point-marker--${layout}`,
      `map-point-marker--${tone}`,
      {
        'is-interactive': interactive,
        'is-active': active,
        'has-tooltip': Boolean(title),
        'has-body-slot': hasBodySlot,
      },
    ]"
    :type="interactive ? 'button' : undefined"
    :title="title"
    :aria-label="ariaLabel"
    :style="vars"
    @click="onClick"
  >
    <slot v-if="hasBodySlot" />
    <template v-else>
      <span v-if="hasLabel" class="map-point-marker__label">
        <span v-if="status" class="map-point-marker__status">{{ status }}</span>
        <span class="map-point-marker__name">{{ name }}</span>
        <span v-if="sub" class="map-point-marker__sub">{{ sub }}</span>
      </span>
      <span class="map-point-marker__pin" aria-hidden="true">
        <MapMarkerIcon v-if="icon" :name="icon" />
        <template v-else>{{ pinText }}</template>
      </span>
      <span v-if="layout === 'column'" class="map-point-marker__stem" aria-hidden="true" />
      <span v-if="breath" class="map-point-marker__breath" aria-hidden="true" />
    </template>
  </component>
</template>

<style scoped>
/*
 * 色调：pin / 徽标 / 引线 / 呼吸点共用 `--marker`（引线渐变与呼吸点光晕由 color-mix 派生），
 * 因此新增点位只需选 tone，不必再各页抄一份颜色分支。
 */
.map-point-marker {
  --marker: var(--map-marker-cyan);
  --marker-glow: color-mix(in srgb, var(--marker) 45%, transparent);

  position: absolute;
  z-index: var(--z-marker);
  padding: 0;
  border: none;
  background: transparent;
  font-family: var(--font-body);
  pointer-events: none;
}

/* 内置标注语言（标签条/圆针/引线/呼吸点）纵向居中；收编既有切图点位时（#default 插槽）根节点退化为定位容器 */
.map-point-marker:not(.has-body-slot) {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.map-point-marker.has-body-slot {
  display: block;
}

.map-point-marker--warning {
  --marker: var(--color-warning);
}

.map-point-marker--danger {
  --marker: var(--color-danger);
}

.map-point-marker--alarm-2 {
  --marker: var(--color-alarm-2);
}

.map-point-marker--alarm-3 {
  --marker: var(--color-alarm-3);
}

.map-point-marker--offline {
  --marker: var(--map-device-offline);
}

/* 锚点：column = 针尖落点（-100%）/ pulse = 圆心落点（-50%）/ none = 不施加 transform（由 #default 插槽内容自行定位） */
.map-point-marker--column {
  transform: translate(-50%, -100%);
}

.map-point-marker--pulse {
  justify-content: center;
  width: var(--marker-pin-size);
  height: var(--marker-pin-size);
  transform: translate(-50%, -50%);
}

.map-point-marker--none {
  transform: none;
}

.map-point-marker.is-interactive {
  cursor: pointer;
  pointer-events: auto;
}

/* 非交互但带 title 的点位仍保留原生 tooltip（原 realtime-marker 口径） */
.map-point-marker.has-tooltip {
  pointer-events: auto;
}

.map-point-marker.is-interactive:focus-visible {
  outline: 2px solid var(--border-glow);
  outline-offset: 2px;
}

/* ---- 标签条 ---- */
.map-point-marker__label {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px;
  margin-bottom: 4px;
  max-width: var(--marker-label-max-w);
  padding: 2px 6px;
  border-radius: 2px;
  background: var(--map-device-label-bg);
  border: 1px solid rgb(0 140 220 / 28%);
  color: var(--color-text-muted);
  font-size: 11px;
  line-height: 16px;
  text-align: left;
}

.map-point-marker__status {
  flex-shrink: 0;
  padding: 0 4px;
  border-radius: 2px;
  font-size: 10px;
  line-height: 15px;
  font-weight: 700;
  color: var(--map-marker-ink);
  background: var(--marker);
}

.map-point-marker__name,
.map-point-marker__sub {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.map-point-marker__sub {
  flex-basis: 100%;
  font-size: 10px;
  line-height: 14px;
  opacity: 0.85;
}

/* ---- 圆针 ---- */
.map-point-marker__pin {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: var(--marker-pin-size);
  height: var(--marker-pin-size);
  border-radius: 50%;
  border: 2px solid rgb(255 255 255 / 90%);
  color: var(--map-marker-ink);
  background: var(--marker);
  box-shadow: 0 0 10px var(--marker-glow);
  transition:
    transform 0.18s ease,
    filter 0.16s ease,
    box-shadow 0.18s ease;
}

.map-point-marker__pin :deep(.map-marker-icon) {
  width: var(--marker-icon-size);
  height: var(--marker-icon-size);
}

.map-point-marker.is-interactive:hover .map-point-marker__pin {
  filter: brightness(1.12);
}

.map-point-marker.is-active .map-point-marker__pin {
  border-color: #ffd54a;
  box-shadow: 0 0 18px rgb(255 213 74 / 75%);
  transform: scale(1.12);
}

.map-point-marker.is-active .map-point-marker__label {
  border-color: rgb(255 213 74 / 65%);
}

/* ---- 引线 / 呼吸点 ---- */
.map-point-marker__stem {
  width: 2px;
  height: var(--marker-stem-h);
  margin-top: -1px;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--marker) 85%, transparent),
    transparent
  );
}

.map-point-marker__breath {
  width: var(--marker-breath-size);
  height: var(--marker-breath-size);
  border-radius: 50%;
  background: var(--marker);
  box-shadow: 0 0 10px var(--marker-glow);
  animation: map-point-breath 1.9s ease-in-out infinite;
}

/* pulse 布局：呼吸环叠在圆心，不再向下引线 */
.map-point-marker--pulse .map-point-marker__breath {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  animation: map-point-pulse 1.9s ease-in-out infinite;
}

/* 离线点位置灰、不再发光（原 device-marker--offline 口径） */
.map-point-marker--offline .map-point-marker__pin,
.map-point-marker--offline .map-point-marker__breath {
  box-shadow: none;
  filter: grayscale(0.4);
}

@keyframes map-point-breath {
  0%,
  100% {
    transform: scale(0.9);
    opacity: 0.75;
  }

  50% {
    transform: scale(1.15);
    opacity: 1;
  }
}

@keyframes map-point-pulse {
  0%,
  100% {
    transform: translate(-50%, -50%) scale(0.9);
    opacity: 0.75;
  }

  50% {
    transform: translate(-50%, -50%) scale(1.25);
    opacity: 1;
  }
}
</style>
