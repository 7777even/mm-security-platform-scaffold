<script setup lang="ts">
import { computed, ref } from 'vue';
import ClipImage from '../../common/ClipImage.vue';
import {
  bottomToolbarItems,
  eventCommandToolbarIconIndices,
  eventCommandToolbarItems,
} from '../../../lib/data/accidentRescueMock';
import { bottomToolbarIconClips } from '../../../utils/accidentRescueClipConfig';

const props = withDefaults(
  defineProps<{
    theme?: 'accident' | 'drill';
    layout?: 'rescue' | 'eventCommand';
  }>(),
  {
    theme: 'accident',
    layout: 'rescue',
  },
);

const collapsed = ref(false);
const activeItemId = ref<string | null>(null);

const items = computed(() =>
  props.layout === 'eventCommand' ? eventCommandToolbarItems : bottomToolbarItems,
);

const iconIndices = computed(() =>
  props.layout === 'eventCommand' ? eventCommandToolbarIconIndices : items.value.map((_, i) => i),
);

const emit = defineEmits<{
  action: [id: string];
}>();

function toggleCollapse() {
  collapsed.value = !collapsed.value;
}

function handleItemClick(id: string) {
  activeItemId.value = activeItemId.value === id ? null : id;
  emit('action', id);
}
</script>

<template>
  <div
    class="rescue-bottom-toolbar"
    :class="[`rescue-bottom-toolbar--${theme}`, { 'rescue-bottom-toolbar--collapsed': collapsed }]"
  >
    <button
      v-if="layout === 'eventCommand'"
      type="button"
      class="rescue-bottom-toolbar__collapse"
      :title="collapsed ? '展开工具栏' : '收起工具栏'"
      @click="toggleCollapse"
    >
      <span :class="{ 'rescue-bottom-toolbar__collapse-icon--open': !collapsed }">›</span>
    </button>

    <button
      v-for="(item, index) in items"
      :key="item.id"
      type="button"
      class="rescue-bottom-toolbar__item"
      :class="{ 'rescue-bottom-toolbar__item--active': activeItemId === item.id }"
      :title="item.label"
      @click="handleItemClick(item.id)"
    >
      <span class="rescue-bottom-toolbar__icon-wrap">
        <ClipImage
          v-bind="bottomToolbarIconClips[iconIndices[index]]"
          class="rescue-bottom-toolbar__icon"
        />
      </span>
      <span class="rescue-bottom-toolbar__label">{{ item.label }}</span>
    </button>
  </div>
</template>

<style scoped>
.rescue-bottom-toolbar {
  position: absolute;
  left: 50%;
  bottom: 12px;
  transform: translateX(-50%);
  display: flex;
  align-items: flex-end;
  gap: 34px;
  z-index: 5;
  pointer-events: auto;
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.rescue-bottom-toolbar--collapsed .rescue-bottom-toolbar__item {
  opacity: 0;
  pointer-events: none;
  transform: translateY(12px);
}

.rescue-bottom-toolbar__collapse {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  margin-bottom: 28px;
  padding: 0;
  border: 1px solid rgb(0 110 190 / 38%);
  border-radius: 2px;
  background: rgb(0 22 48 / 88%);
  color: #4f8dd3;
  font-size: 16px;
  cursor: pointer;
}

.rescue-bottom-toolbar--drill .rescue-bottom-toolbar__collapse {
  border-color: rgb(236 166 65 / 42%);
  background: rgb(52 36 10 / 88%);
  color: #eca641;
}

.rescue-bottom-toolbar__collapse-icon--open {
  display: inline-block;
  transform: rotate(180deg);
}

.rescue-bottom-toolbar__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  width: 98px;
  padding: 8px 4px 6px;
  border: 1px solid rgb(0 110 190 / 38%);
  border-radius: 2px;
  background: linear-gradient(180deg, rgb(0 28 58 / 92%), rgb(0 14 32 / 95%));
  cursor: pointer;
  transition:
    filter 0.2s ease,
    border-color 0.2s ease,
    opacity 0.25s ease,
    transform 0.25s ease;
}

.rescue-bottom-toolbar--drill .rescue-bottom-toolbar__item {
  border-color: rgb(236 166 65 / 42%);
  background: linear-gradient(180deg, rgb(72 48 18 / 92%), rgb(40 26 8 / 95%));
}

.rescue-bottom-toolbar__item:hover,
.rescue-bottom-toolbar__item--active {
  filter: brightness(1.1);
  border-color: rgb(0 160 240 / 55%);
}

.rescue-bottom-toolbar--drill .rescue-bottom-toolbar__item:hover,
.rescue-bottom-toolbar--drill .rescue-bottom-toolbar__item--active {
  border-color: rgb(236 166 65 / 55%);
}

.rescue-bottom-toolbar__icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
}

.rescue-bottom-toolbar__label {
  font-size: 12px;
  color: #c8d4e8;
  line-height: 1.3;
  text-align: center;
  white-space: nowrap;
}

.rescue-bottom-toolbar--drill .rescue-bottom-toolbar__label {
  color: #ffd9a0;
}
</style>
