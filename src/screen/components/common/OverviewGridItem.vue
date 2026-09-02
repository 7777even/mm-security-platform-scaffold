<script setup lang="ts">
import ClipImage from './ClipImage.vue';
import { overviewCardClip, overviewCardSrc } from '../../utils/productionClipConfig';

defineProps<{
  name: string;
  count: number;
  image: string;
}>();
</script>

<template>
  <div class="overview-item">
    <ClipImage :src="overviewCardSrc(image)" v-bind="overviewCardClip" />
    <div class="overview-item__info">
      <div class="overview-item__name">{{ name }}</div>
      <div class="overview-item__count">{{ count }}</div>
    </div>
  </div>
</template>

<style scoped>
.overview-item {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 70px;
  min-height: 0;
  padding-right: 8px;
  background: rgb(0 20 45 / 50%);
  border: 1px solid rgb(0 130 210 / 32%);
  border-radius: 2px;
  box-sizing: border-box;
  overflow: hidden;
}

.overview-item__info {
  min-width: 0;
  flex: 1;
  padding-left: 2px;
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
</style>
