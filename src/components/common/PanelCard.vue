<!--
  PanelCard — §8 信息面板容器（设计稿图 5-6）
  升级要点：
    - 圆角、内边距、描边、顶部亮线、底部光带全部走组件级 token
    - 标题区：43px 高度 + 青色竖条 + 发光（panel-title 来自 global.css）
    - 提供 optional "more" 链接按钮（panel-more）
    - 提供底部光带（panel-card__glow）
    - 标题区支持 "tabs" 插槽：传 tabs 插槽时整个标题区作为 tab 切换器
      （不传 title，只传 tabs 插槽即可；不传 tabs 插槽时回退到 title prop，行为不变）
-->
<script setup lang="ts">
import { computed } from 'vue';
import * as ElementPlusIcons from '@element-plus/icons-vue';

const props = withDefaults(
  defineProps<{
    title?: string;
    icon?: string;
    more?: string;
  }>(),
  { title: '', icon: '', more: '' },
);

const emit = defineEmits<{ (e: 'more'): void }>();

const iconComp = computed(() => {
  if (!props.icon) return null;
  return (ElementPlusIcons as Record<string, unknown>)[props.icon] ?? null;
});
</script>

<template>
  <section class="panel-card glass-panel">
    <header v-if="title || $slots.tabs" class="panel-card__head">
      <component :is="iconComp" v-if="iconComp" class="panel-card__icon" />
      <h2 class="panel-title panel-card__title">
        <template v-if="$slots.tabs">
          <span v-if="title" class="panel-card__title-text">{{ title }}</span>
          <slot name="tabs" />
        </template>
        <template v-else>{{ title }}</template>
      </h2>
      <button v-if="more" type="button" class="panel-more" @click="emit('more')">
        {{ more }}
        <span class="panel-more__arrow">›</span>
      </button>
    </header>
    <div class="panel-card__body">
      <slot />
    </div>
    <span class="panel-card__glow" aria-hidden="true" />
  </section>
</template>

<style scoped>
.panel-card {
  display: flex;
  flex-direction: column;
  position: relative;
  border-radius: var(--panel-radius);
}

/* §8.2 标题区 — 43px 高度，右侧 more 按钮 */
.panel-card__head {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  height: var(--panel-head-h);
  padding: 0 var(--panel-body-pad-x);
  flex-shrink: 0;
}

.panel-card__icon {
  color: var(--color-accent);
  width: var(--icon-sm);
  height: var(--icon-sm);
  flex-shrink: 0;
}

.panel-card__title {
  flex: 1;
  min-width: 0;
}

.panel-card__title-text {
  flex-shrink: 0;
}

.panel-more {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px 4px;
  font-size: 12px;
  color: var(--panel-more-color);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: color 0.15s;
}

.panel-more:hover {
  color: var(--color-accent);
}

.panel-more__arrow {
  font-size: 14px;
  line-height: 1;
}

/* §8.1 内容区：垂直内边距，水平继承 head 内边距 */
.panel-card__body {
  flex: 1;
  min-height: 0;
  padding: var(--panel-body-pad-y) var(--panel-body-pad-x) var(--space-lg);
}

/* §8.1 底部青色光带（2px，opacity 0.55） */
.panel-card__glow {
  position: absolute;
  bottom: 0;
  left: 24px;
  right: 24px;
  height: 2px;
  border-radius: 2px;
  background: linear-gradient(90deg, transparent, var(--color-accent), transparent);
  opacity: 0.55;
  pointer-events: none;
}
</style>
