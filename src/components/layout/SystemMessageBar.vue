<script setup lang="ts">
import { computed } from 'vue';
import ClipImage from '../common/ClipImage.vue';
import { footerLabelClip } from '@/utils/footerClipConfig';
import { systemMessages } from '@/services/map-data/mock';
import type { DesignModule } from '@/utils/designAssets';

const props = defineProps<{
  module: DesignModule;
}>();

const labelClip = computed(() => footerLabelClip(props.module));
</script>

<template>
  <footer class="message-bar">
    <div class="message-bar__label">
      <ClipImage v-bind="labelClip" class="message-bar__label-clip" />
    </div>

    <div class="message-bar__ticker">
      <div class="message-bar__track">
        <div
          v-for="(msg, index) in [...systemMessages, ...systemMessages]"
          :key="`${msg.id}-${index}`"
          class="message-item"
          :class="`message-item--${msg.type}`"
        >
          <span class="message-item__warn">⚠</span>
          <span class="message-item__title">{{ msg.title }}</span>
          <span class="message-item__time">{{ msg.time }}</span>
          <span class="message-item__content">{{ msg.content }}</span>
        </div>
      </div>
    </div>

    <button type="button" class="message-bar__more">查看全部</button>
  </footer>
</template>

<style scoped>
.message-bar {
  position: relative;
  height: var(--footer-height);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 17px 0 19px;
  margin: 0 17px 10px;
  box-sizing: border-box;
  background: var(--message-bar-bg);
  border: 1px solid var(--message-bar-border);
  border-radius: 2px;
  box-shadow: inset 0 1px 0 color-mix(in srgb, var(--color-accent) 12%, transparent);
}

.message-bar__label {
  flex-shrink: 0;
  width: 132px;
  height: 52px;
  display: flex;
  align-items: center;
  overflow: hidden;
  padding-right: 16px;
  border-right: 1px solid color-mix(in srgb, var(--map-border) 30%, transparent);
}

.message-bar__label-clip {
  flex-shrink: 0;
}

.message-bar__ticker {
  flex: 1;
  height: 46px;
  overflow: hidden;
  display: flex;
  align-items: center;
  min-width: 0;
}

.message-bar__track {
  display: flex;
  gap: 48px;
  animation: scroll 28s linear infinite;
  white-space: nowrap;
  padding: 0 12px;
}

@keyframes scroll {
  0% {
    transform: translateX(0);
  }

  100% {
    transform: translateX(-50%);
  }
}

.message-item {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

.message-item--danger .message-item__title {
  color: var(--color-text-strong);
}

.message-item--warning .message-item__title {
  color: var(--color-alarm-4);
}

.message-item__warn {
  color: var(--color-warning);
  font-size: 12px;
}

.message-item__time,
.message-item__content {
  color: var(--color-text-muted);
  font-size: 13px;
}

.message-bar__more {
  flex-shrink: 0;
  padding: 8px 20px;
  border: 1px solid color-mix(in srgb, var(--color-accent) 40%, transparent);
  border-radius: 2px;
  background: color-mix(in srgb, var(--map-border) 30%, transparent);
  color: var(--color-accent);
  font-size: 14px;
  font-family: var(--font-body);
  cursor: pointer;
}
</style>
