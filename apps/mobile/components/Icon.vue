<script setup lang="ts">
import { computed } from 'vue';
import { iconSet, type IconPath } from '../styles/iconset';

/**
 * 行内双色图标（线面结合）。
 *
 * ui-redesign 迁移约定（2026-08）：
 * - 颜色一律走 `currentColor`，由外层 CSS 决定；`color` 仅在确需脱离继承时传
 *   **token 变量**（如 `var(--mb-muted)`），禁止传 hex —— 否则 outdoor 皮肤无法反相。
 * - 尺寸默认继承 CSS（.mb-icon 档位类），不内联 px。
 */
const props = withDefaults(
  defineProps<{
    name: string;
    /** CSS 尺寸（长度串，如 '16px'）；省略则由外层 .mb-icon--* 类控制 */
    size?: string;
    /** 覆盖描边/填充色；应传 token 变量，缺省继承 currentColor */
    color?: string;
    /** 仅保留描边路径（关闭双色浅底），用于未选中态等需要弱化语义的场景 */
    mono?: boolean;
  }>(),
  { size: '', color: 'currentColor', mono: false },
);

const paths = computed<IconPath[]>(() => {
  const def = iconSet[props.name] ?? iconSet.grid;
  if (!props.mono) return def.paths;
  return def.paths.filter((p) => p.stroke && p.stroke !== 'none');
});

function resolveFill(p: IconPath): string {
  if (!p.fill || p.fill === 'none') return 'none';
  return props.color;
}

function resolveStroke(p: IconPath): string {
  if (!p.stroke || p.stroke === 'none') return 'none';
  return props.color;
}
</script>

<template>
  <svg
    class="mb-icon"
    :style="size ? { width: size, height: size } : undefined"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      v-for="(p, i) in paths"
      :key="i"
      :d="p.d"
      :fill="resolveFill(p)"
      :stroke="resolveStroke(p)"
      :stroke-width="p.sw || 0"
      stroke-linecap="round"
      stroke-linejoin="round"
      :opacity="p.opacity ?? 1"
    />
  </svg>
</template>

<style scoped>
.mb-icon {
  display: inline-block;
  flex-shrink: 0;
  vertical-align: -0.2em;
}
</style>
