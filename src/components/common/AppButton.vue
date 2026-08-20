<!--
  AppButton — §9.3 按钮组件（设计稿图 5-7 右侧）
  variant: primary | danger | ghost | default
  size:    sm 28 / md 34 / lg 40
-->
<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'danger' | 'ghost' | 'default';
    size?: 'sm' | 'md' | 'lg';
    type?: 'button' | 'submit' | 'reset';
  }>(),
  { variant: 'default', size: 'md', type: 'button' },
);
</script>

<template>
  <button :type="type" :class="['btn', `btn--${variant}`, `btn--${size}`]">
    <slot />
  </button>
</template>
