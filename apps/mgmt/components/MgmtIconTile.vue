<script setup lang="ts">
import { computed, type Component } from 'vue';

/*
 * MgmtIconTile：后台端图标瓦片
 * 对齐 ui-redesign IconTile 角色；内部以 @element-plus/icons-vue 渲染，
 * tone 走 --mgmt-tone-* token（tokens.css [data-theme='mgmt'] 块）。
 * 业务要新增 icon：直接传对应的 ep icon component 即可，无需再维护 svg path 表。
 */

export type IconTileTone =
  'red' | 'orange' | 'amber' | 'navy' | 'indigo' | 'cyan' | 'purple' | 'slate' | 'blue';

const props = withDefaults(
  defineProps<{
    icon: Component;
    tone?: IconTileTone;
    shape?: 'rounded' | 'circle';
    variant?: 'soft' | 'solid' | 'ghost';
    /** number(px) | 'sm' | 'md' | 'lg' */
    size?: number | 'sm' | 'md' | 'lg';
  }>(),
  {
    tone: 'blue',
    shape: 'rounded',
    variant: 'soft',
    size: 'md',
  },
);

const sizePx = computed(() => {
  if (typeof props.size === 'number') return props.size;
  if (props.size === 'sm') return 'var(--mgmt-tile-sm)';
  if (props.size === 'lg') return 'var(--mgmt-tile-lg)';
  return 'var(--mgmt-tile-md)';
});

const toneClass = computed(() => `mgmt-tile--tone-${props.tone}`);
const variantClass = computed(() => `mgmt-tile--${props.variant}`);
const shapeClass = computed(() => `mgmt-tile--${props.shape}`);

const glyphSize = computed(() => {
  const px = sizePx.value;
  if (typeof px === 'number') return Math.round(px * 0.6);
  return `calc(${px} * 0.6)`;
});
</script>

<template>
  <span
    class="mgmt-tile"
    :class="[toneClass, variantClass, shapeClass]"
    :style="{ width: String(sizePx), height: String(sizePx) }"
  >
    <el-icon :size="String(glyphSize)"><component :is="icon" /></el-icon>
  </span>
</template>

<style scoped>
.mgmt-tile {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: var(--mgmt-tile-radius);
  line-height: 1;
}

.mgmt-tile--circle {
  border-radius: 50%;
}

/* ---- variant：soft（浅底实色图标，默认） ---- */
.mgmt-tile--soft.mgmt-tile--tone-red {
  background: var(--mgmt-tone-red-soft);
  color: var(--mgmt-tone-red-fg);
}

.mgmt-tile--soft.mgmt-tile--tone-orange {
  background: var(--mgmt-tone-orange-soft);
  color: var(--mgmt-tone-orange-fg);
}

.mgmt-tile--soft.mgmt-tile--tone-amber {
  background: var(--mgmt-tone-amber-soft);
  color: var(--mgmt-tone-amber-fg);
}

.mgmt-tile--soft.mgmt-tile--tone-navy {
  background: var(--mgmt-tone-navy-soft);
  color: var(--mgmt-tone-navy-fg);
}

.mgmt-tile--soft.mgmt-tile--tone-indigo {
  background: var(--mgmt-tone-indigo-soft);
  color: var(--mgmt-tone-indigo-fg);
}

.mgmt-tile--soft.mgmt-tile--tone-cyan {
  background: var(--mgmt-tone-cyan-soft);
  color: var(--mgmt-tone-cyan-fg);
}

.mgmt-tile--soft.mgmt-tile--tone-purple {
  background: var(--mgmt-tone-purple-soft);
  color: var(--mgmt-tone-purple-fg);
}

.mgmt-tile--soft.mgmt-tile--tone-slate {
  background: var(--mgmt-tone-slate-soft);
  color: var(--mgmt-tone-slate-fg);
}

.mgmt-tile--soft.mgmt-tile--tone-blue {
  background: var(--primary-mgmt-soft);
  color: var(--primary-mgmt);
}

/* ---- variant：solid（实底白图标） ---- */
.mgmt-tile--solid {
  color: var(--color-on-primary);
}

.mgmt-tile--solid.mgmt-tile--tone-red {
  background: var(--mgmt-tone-red-fg);
}

.mgmt-tile--solid.mgmt-tile--tone-orange {
  background: var(--mgmt-tone-orange-fg);
}

.mgmt-tile--solid.mgmt-tile--tone-amber {
  background: var(--mgmt-tone-amber-fg);
}

.mgmt-tile--solid.mgmt-tile--tone-navy {
  background: var(--mgmt-tone-navy-fg);
}

.mgmt-tile--solid.mgmt-tile--tone-indigo {
  background: var(--mgmt-tone-indigo-fg);
}

.mgmt-tile--solid.mgmt-tile--tone-cyan {
  background: var(--mgmt-tone-cyan-fg);
}

.mgmt-tile--solid.mgmt-tile--tone-purple {
  background: var(--mgmt-tone-purple-fg);
}

.mgmt-tile--solid.mgmt-tile--tone-slate {
  background: var(--mgmt-tone-slate-fg);
}

.mgmt-tile--solid.mgmt-tile--tone-blue {
  background: var(--primary-mgmt);
}

/* ---- variant：ghost（白底描边） ---- */
.mgmt-tile--ghost {
  background: var(--card-mgmt);
  border: 1px solid var(--border-mgmt);
}

.mgmt-tile--ghost.mgmt-tile--tone-red {
  color: var(--mgmt-tone-red-fg);
}

.mgmt-tile--ghost.mgmt-tile--tone-orange {
  color: var(--mgmt-tone-orange-fg);
}

.mgmt-tile--ghost.mgmt-tile--tone-amber {
  color: var(--mgmt-tone-amber-fg);
}

.mgmt-tile--ghost.mgmt-tile--tone-navy {
  color: var(--mgmt-tone-navy-fg);
}

.mgmt-tile--ghost.mgmt-tile--tone-indigo {
  color: var(--mgmt-tone-indigo-fg);
}

.mgmt-tile--ghost.mgmt-tile--tone-cyan {
  color: var(--mgmt-tone-cyan-fg);
}

.mgmt-tile--ghost.mgmt-tile--tone-purple {
  color: var(--mgmt-tone-purple-fg);
}

.mgmt-tile--ghost.mgmt-tile--tone-slate {
  color: var(--mgmt-tone-slate-fg);
}

.mgmt-tile--ghost.mgmt-tile--tone-blue {
  color: var(--primary-mgmt);
}
</style>
