<script setup lang="ts">
import Icon from './Icon.vue';

defineProps<{
  name: string;
  tone?:
    | 'red'
    | 'orange'
    | 'blue'
    | 'green'
    | 'teal'
    | 'cyan'
    | 'indigo'
    | 'amber'
    | 'purple'
    | 'navy'
    | 'slate';
  shape?: 'rounded' | 'circle';
  variant?: 'solid' | 'soft';
}>();
</script>

<template>
  <span
    class="icon-tile"
    :class="[`tone-${tone ?? 'blue'}`, `shape-${shape ?? 'rounded'}`, `v-${variant ?? 'soft'}`]"
  >
    <Icon :name="name" />
  </span>
</template>

<style scoped>
.icon-tile {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.shape-rounded {
  border-radius: 12rpx;
}

.shape-circle {
  border-radius: 50%;
}

.v-solid {
  color: #fff;
}

.v-soft {
  background: rgb(22 119 255 / 12%);
  color: var(--primary-mobile);
}
.tone-red.v-solid {
  background: var(--danger-mobile);
}
.tone-orange.v-solid {
  background: var(--warning-mobile);
}
.tone-blue.v-solid {
  background: var(--primary-mobile);
}
.tone-green.v-solid {
  background: var(--success-mobile);
}
.tone-red.v-soft {
  background: rgb(245 34 45 / 12%);
  color: var(--danger-mobile);
}
.tone-orange.v-soft {
  background: rgb(250 140 22 / 12%);
  color: var(--warning-mobile);
}
.tone-green.v-soft {
  background: rgb(82 196 26 / 12%);
  color: var(--success-mobile);
}
.tone-navy.v-soft {
  background: rgb(16 42 91 / 12%);
  color: #102a5b;
}
.tone-slate.v-soft {
  background: rgb(90 99 117 / 12%);
  color: #5a6375;
}
</style>
