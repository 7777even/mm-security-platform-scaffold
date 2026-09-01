<script setup lang="ts">
defineProps<{
  src: string;
  imageWidth: number;
  imageHeight: number;
  viewWidth: number;
  viewHeight: number;
  offsetX?: number;
  offsetY?: number;
}>();
</script>

<template>
  <div class="clip-image" :style="{ width: `${viewWidth}px`, height: `${viewHeight}px` }">
    <img
      :src="src"
      alt=""
      :style="{
        width: `${imageWidth}px`,
        height: `${imageHeight}px`,
        marginLeft: `${offsetX ?? 0}px`,
        marginTop: `${offsetY ?? 0}px`,
      }"
    />
  </div>
</template>

<style scoped>
.clip-image {
  overflow: hidden;
  flex-shrink: 0;
  line-height: 0;
}

.clip-image img {
  display: block;
  max-width: none;
}
</style>
