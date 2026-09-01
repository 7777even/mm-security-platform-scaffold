<script setup lang="ts">
import { computed } from 'vue';
import { iconSet, toneMap, type IconPath, type ToneKey } from '../styles/iconset';

/**
 * 图标瓦片：圆角方 / 圆形浅底承载线面结合图标（规范 §4「服务图标」）。
 *
 * ui-redesign 迁移改动（2026-08）：
 * - 尺寸由数值 px 改为 token 档位（--mb-tile-sm/md/lg），杜绝组件内硬编码尺寸；
 *   瓦片本身是装饰，**触控热区由外层容器（宫格项 / 菜单行）保证 ≥48**。
 * - 色板取自 toneMap（已 token 化）；原实现的 `grad` 渐变档删除（移动端禁渐变），
 *   `solid` 档改为纯 fg 实色 + 主色上的反色字形。
 */
export type TileSize = 'sm' | 'md' | 'lg';
export type TileShape = 'rounded' | 'circle';
export type TileVariant = 'soft' | 'solid' | 'ghost';

const props = withDefaults(
  defineProps<{
    name: string;
    /** 色板键；省略时取图标自带 tone */
    tone?: ToneKey | '';
    shape?: TileShape;
    variant?: TileVariant;
    size?: TileSize;
  }>(),
  { tone: '', shape: 'rounded', variant: 'soft', size: 'md' },
);

const meta = computed(() => iconSet[props.name] ?? iconSet.grid);
const renderPaths = computed<IconPath[]>(() => meta.value.paths);
const palette = computed(() => toneMap[props.tone || meta.value.tone] ?? toneMap.blue);

/** solid 档下浅底填充层需压暗，避免实色底上的双色层糊成一片 */
const SOLID_SOFT_OPACITY = 0.35;

function pathFill(p: IconPath): string {
  if (!p.fill || p.fill === 'none') return 'none';
  return 'currentColor';
}

function pathStroke(p: IconPath): string {
  if (!p.stroke || p.stroke === 'none') return 'none';
  return 'currentColor';
}

function pathOpacity(p: IconPath): number {
  const isFillLayer = Boolean(p.fill && p.fill !== 'none');
  if (props.variant === 'solid' && isFillLayer) return SOLID_SOFT_OPACITY;
  return p.opacity ?? 1;
}
</script>

<template>
  <span
    class="mb-tile"
    :class="[`mb-tile--${size}`, `mb-tile--${shape}`, `mb-tile--${variant}`]"
    :style="{ '--tile-bg': palette.bg, '--tile-fg': palette.fg }"
  >
    <svg class="mb-tile__glyph" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        v-for="(p, i) in renderPaths"
        :key="i"
        :d="p.d"
        :fill="pathFill(p)"
        :stroke="pathStroke(p)"
        :stroke-width="p.sw || 0"
        stroke-linecap="round"
        stroke-linejoin="round"
        :opacity="pathOpacity(p)"
      />
    </svg>
  </span>
</template>

<style scoped>
.mb-tile {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--tile-fg);
  background: var(--tile-bg);
}

/* 尺寸档位（真源：tokens.css --mb-tile-*） */
.mb-tile--sm {
  width: var(--mb-tile-sm);
  height: var(--mb-tile-sm);
}

.mb-tile--md {
  width: var(--mb-tile-md);
  height: var(--mb-tile-md);
}

.mb-tile--lg {
  width: var(--mb-tile-lg);
  height: var(--mb-tile-lg);
}

/* 形状 */
.mb-tile--rounded {
  border-radius: var(--mb-tile-radius);
}

.mb-tile--circle {
  border-radius: 50%;
}

/* 变体：soft 浅底实色图标（默认）| solid 纯色实底 + 反色字形 | ghost 白底描边 */
.mb-tile--solid {
  color: var(--color-on-primary);
  background: var(--tile-fg);
}

.mb-tile--ghost {
  background: var(--card-mobile);
  border: var(--mb-border-w, 1px) solid var(--mb-stroke);
}

/* 字形占瓦片边长比例（真源：--mb-icon-glyph-ratio） */
.mb-tile__glyph {
  display: block;
  width: calc(100% * var(--mb-icon-glyph-ratio));
  height: calc(100% * var(--mb-icon-glyph-ratio));
}
</style>
