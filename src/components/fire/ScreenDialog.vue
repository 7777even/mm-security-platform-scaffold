<!--
  ScreenDialog — 大屏端二级界面通用深蓝弹窗壳（对齐 SurveillanceVideoDialog 视觉语言）
  规范约束（AGENTS.md §3）：
    - 深蓝底：--map-dialog-bg / --map-dialog-border / --map-dialog-ring / --map-dialog-inner-glow
    - 遮罩：--map-mask-bg
    - z-index 仅用五层 token：--z-overlay
    - 零硬编码色；标题白+发光（panel-title 语义）
  承载方式：
    - side="center" 居中弹窗（默认）
    - side="right"  右侧抽屉（告警详情等）
  显隐由父 v-if 控制挂载；关闭 emit('close') 交由调度层卸载。
  宽度经 :style 内联（避免 stylelint 不识别的 v-bind()）。
-->
<script setup lang="ts">
import PkgIcon from '@/components/common/PkgIcon.vue';

withDefaults(
  defineProps<{
    open: boolean;
    title: string;
    side?: 'center' | 'right';
    width?: string;
    widthRight?: string;
    icon?: string;
  }>(),
  {
    side: 'center',
    width: 'min(960px, calc(100vw - 80px))',
    widthRight: 'min(560px, 92vw)',
    icon: '',
  },
);

const emit = defineEmits<{ close: [] }>();
</script>

<template>
  <Teleport to="body">
    <Transition name="screen-dialog">
      <div v-if="open" class="screen-dialog" role="dialog" aria-modal="true" :aria-label="title">
        <button
          class="screen-dialog__mask"
          type="button"
          aria-label="关闭"
          @click="emit('close')"
        />
        <section
          class="screen-dialog__panel"
          :class="`screen-dialog__panel--${side}`"
          :style="{ width: side === 'right' ? widthRight : width }"
        >
          <header class="screen-dialog__header">
            <span class="screen-dialog__heading">
              <PkgIcon v-if="icon" :name="icon" size="20px" class="screen-dialog__icon" />
              <strong class="screen-dialog__title">{{ title }}</strong>
            </span>
            <button
              type="button"
              class="screen-dialog__close"
              aria-label="关闭"
              @click="emit('close')"
            >
              ×
            </button>
          </header>
          <div class="screen-dialog__body">
            <slot />
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.screen-dialog {
  position: fixed;
  inset: 0;
  z-index: var(--z-overlay);
  display: grid;
  place-items: center;
  font-family: var(--font-body, sans-serif);
}

.screen-dialog__mask {
  position: absolute;
  inset: 0;
  border: 0;
  background: var(--map-mask-bg);
  backdrop-filter: blur(4px);
  cursor: default;
}

.screen-dialog__panel {
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--map-dialog-border);
  border-radius: var(--radius-md, 6px);
  background: var(--map-dialog-bg);
  box-shadow:
    0 0 0 1px var(--map-dialog-ring),
    0 24px 80px rgb(0 0 0 / 72%),
    inset 0 0 40px var(--map-dialog-inner-glow);
  color: var(--color-text);
  transition: transform 0.22s ease;
}

.screen-dialog__panel--center {
  height: min(760px, calc(100vh - 70px));
}

.screen-dialog__panel--right {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  border-radius: 0;
  border-left: 1px solid var(--map-dialog-border);
}

.screen-dialog__header {
  height: 56px;
  flex-shrink: 0;
  padding: 0 18px 0 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid color-mix(in srgb, var(--map-dialog-border) 38%, transparent);
  background: linear-gradient(
    90deg,
    color-mix(in srgb, var(--map-dialog-border) 22%, transparent),
    transparent
  );
}

.screen-dialog__title {
  font-size: var(--font-size-h3, 18px);
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--color-text-strong);
  text-shadow: 0 0 8px rgb(0 200 255 / 28%);
}

.screen-dialog__heading {
  display: inline-flex;
  align-items: center;
  min-width: 0;
}

.screen-dialog__icon {
  flex: none;
  margin-right: 8px;
  color: var(--color-accent);
}

.screen-dialog__close {
  width: 36px;
  height: 36px;
  border: 0;
  background: transparent;
  color: var(--color-text);
  font-size: 28px;
  line-height: 1;
  cursor: pointer;
}

.screen-dialog__close:hover {
  color: var(--color-accent);
}

.screen-dialog__body {
  flex: 1;
  min-height: 0;
  padding: var(--space-md);
  overflow: auto;
}

.screen-dialog-enter-active,
.screen-dialog-leave-active {
  transition: opacity 0.2s ease;
}

.screen-dialog-enter-from,
.screen-dialog-leave-to {
  opacity: 0;
}

.screen-dialog-enter-from .screen-dialog__panel--right,
.screen-dialog-leave-to .screen-dialog__panel--right {
  transform: translateX(100%);
}
</style>
