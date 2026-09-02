<script setup lang="ts">
import SpriteImage from './SpriteImage.vue';
import { sprites } from '../../utils/spriteConfig';

defineProps<{
  count: number;
  name: string;
  iconIndex: number;
}>();
</script>

<template>
  <div class="equip-card">
    <div class="equip-card__icon-wrap">
      <SpriteImage class="equip-card__icon" :sprite="sprites.equipmentIcons[iconIndex]" />
    </div>
    <div class="equip-card__info">
      <div class="equip-card__count">{{ count }}</div>
      <div class="equip-card__name">{{ name }}</div>
    </div>
  </div>
</template>

<style scoped>
.equip-card {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 58px;
  padding: 6px 8px;
  background: rgb(0 40 80 / 35%);
  border: 1px solid rgb(0 130 210 / 15%);
  border-radius: 2px;
  box-sizing: border-box;
}

.equip-card__icon-wrap {
  width: 48px;
  height: 56px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  overflow: visible;
}

.equip-card__icon {
  overflow: visible !important;
}

.equip-card__info {
  min-width: 0;
  flex: 1;
}

.equip-card__count {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
}

.equip-card__name {
  font-size: 12px;
  color: #a8b8cc;
  margin-top: 2px;
}
</style>
