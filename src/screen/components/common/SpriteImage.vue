<script setup lang="ts">
import { computed } from 'vue';
import type { SpriteSpec } from '../../utils/spriteConfig';

const props = defineProps<{
  sprite: SpriteSpec;
  /** @deprecated 使用 sprite.clip = 'fit' */
  fit?: boolean;
}>();

function formatPos(value: number | string | undefined, fallback: string): string {
  if (value === undefined) return fallback;
  return typeof value === 'number' ? `${value}px` : value;
}

const style = computed(() => {
  const s = props.sprite;
  const clip = props.fit ? 'fit' : (s.clip ?? 'none');
  const base = {
    width: `${s.width}px`,
    height: `${s.height}px`,
    backgroundImage: `url(${s.src})`,
    backgroundRepeat: 'no-repeat',
  };

  if (clip === 'fit') {
    return {
      ...base,
      backgroundSize: `${s.imageWidth}px ${s.imageHeight}px`,
      backgroundPosition: '0 0',
    };
  }

  if (clip === 'contain') {
    return {
      ...base,
      backgroundSize: 'contain',
      backgroundPosition: 'center',
    };
  }

  if (clip === 'icon-left') {
    return {
      ...base,
      backgroundSize: `${s.imageWidth}px ${s.imageHeight}px`,
      backgroundPosition: `${formatPos(s.posX, '0')} center`,
    };
  }

  if (clip === 'icon-top') {
    return {
      ...base,
      backgroundSize: `${s.imageWidth}px ${s.imageHeight}px`,
      backgroundPosition: `center ${formatPos(s.posY, '0')}`,
    };
  }

  return {
    ...base,
    backgroundSize: `${s.imageWidth}px ${s.imageHeight}px`,
    backgroundPosition: `${formatPos(s.posX, '0')} ${formatPos(s.posY, '0')}`,
  };
});
</script>

<template>
  <span class="sprite-image" :style="style" role="img" />
</template>

<style scoped>
.sprite-image {
  display: inline-block;
  flex-shrink: 0;
  overflow: hidden;
}
</style>
