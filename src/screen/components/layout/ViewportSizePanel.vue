<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue';
import {
  applyCustomViewport,
  closeSizePanel,
  isSimPreviewActive,
  notifySizeChangedFromPanel,
  selectViewportPreset,
  simulatedViewport,
  viewportPresets,
  viewportSimulator,
  type ViewportPresetId,
} from '../../utils/viewportSimulator';

const props = defineProps<{
  open: boolean;
  anchorEl: HTMLElement | null;
}>();

const panelEl = ref<HTMLElement | null>(null);
const panelStyle = ref<Record<string, string>>({});

const draftWidth = ref(String(viewportSimulator.customWidth.value));
const draftHeight = ref(String(viewportSimulator.customHeight.value));

const activeId = computed(() => viewportSimulator.activePresetId.value);

defineExpose({ panelEl });

function updatePanelPosition() {
  if (!props.anchorEl) return;
  const rect = props.anchorEl.getBoundingClientRect();
  panelStyle.value = {
    top: `${rect.bottom + 8}px`,
    left: `${rect.left + rect.width / 2}px`,
    transform: 'translateX(-50%)',
  };
}

watch(
  () => props.open,
  async (open) => {
    if (!open) {
      window.removeEventListener('resize', updatePanelPosition);
      return;
    }
    draftWidth.value = String(viewportSimulator.customWidth.value);
    draftHeight.value = String(viewportSimulator.customHeight.value);
    await nextTick();
    updatePanelPosition();
    window.addEventListener('resize', updatePanelPosition);
  },
);

watch(
  () => props.anchorEl,
  () => {
    if (props.open) nextTick(() => updatePanelPosition());
  },
);

onUnmounted(() => {
  window.removeEventListener('resize', updatePanelPosition);
});

function confirmSizeChange() {
  closeSizePanel();
  notifySizeChangedFromPanel();
}

function handleSelect(id: ViewportPresetId) {
  selectViewportPreset(id);
  confirmSizeChange();
}

function handleApplyCustom() {
  const width = Number.parseInt(draftWidth.value, 10);
  const height = Number.parseInt(draftHeight.value, 10);
  if (!Number.isFinite(width) || !Number.isFinite(height)) return;
  applyCustomViewport(width, height);
  confirmSizeChange();
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" ref="panelEl" class="viewport-size-panel" :style="panelStyle" @click.stop>
      <div class="viewport-size-panel__header">
        <span>大屏尺寸预览</span>
        <span v-if="isSimPreviewActive" class="viewport-size-panel__active">
          {{ simulatedViewport.label }}
        </span>
      </div>

      <ul class="viewport-size-panel__list">
        <li v-for="preset in viewportPresets" :key="preset.id">
          <button
            type="button"
            class="viewport-size-panel__item"
            :class="{ 'viewport-size-panel__item--active': activeId === preset.id }"
            @click="handleSelect(preset.id)"
          >
            <span>{{ preset.label }}</span>
          </button>
        </li>
      </ul>

      <div class="viewport-size-panel__custom">
        <div class="viewport-size-panel__custom-title">自定义尺寸</div>
        <div class="viewport-size-panel__custom-row">
          <label>
            <span>宽</span>
            <input v-model="draftWidth" type="number" min="320" step="1" />
          </label>
          <label>
            <span>高</span>
            <input v-model="draftHeight" type="number" min="240" step="1" />
          </label>
          <button type="button" class="viewport-size-panel__apply" @click="handleApplyCustom">
            应用
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.viewport-size-panel {
  position: fixed;
  z-index: 10001;
  width: 220px;
  max-height: min(70vh, 520px);
  overflow-y: auto;
  padding: 10px;
  border: 1px solid rgb(0 140 220 / 45%);
  border-radius: 4px;
  background: rgb(0 22 48 / 98%);
  box-shadow: 0 8px 24px rgb(0 0 0 / 45%);
}

.viewport-size-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 12px;
  color: #fff;
}

.viewport-size-panel__active {
  font-size: 11px;
  color: #00b4ff;
  white-space: nowrap;
}

.viewport-size-panel__list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.viewport-size-panel__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 4px;
  padding: 7px 10px;
  border: 1px solid transparent;
  border-radius: 3px;
  background: rgb(0 50 90 / 35%);
  color: #d8d8d8;
  font-size: 12px;
  text-align: left;
  cursor: pointer;
}

.viewport-size-panel__item:hover {
  border-color: rgb(0 180 255 / 35%);
  background: rgb(0 70 120 / 45%);
}

.viewport-size-panel__item--active {
  border-color: rgb(0 180 255 / 65%);
  background: rgb(0 90 150 / 50%);
  color: #fff;
}

.viewport-size-panel__custom {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgb(0 140 220 / 25%);
}

.viewport-size-panel__custom-title {
  margin-bottom: 6px;
  font-size: 11px;
  color: #8795b0;
}

.viewport-size-panel__custom-row {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 6px;
  align-items: end;
}

.viewport-size-panel__custom-row label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 11px;
  color: #8795b0;
}

.viewport-size-panel__custom-row input {
  width: 100%;
  height: 28px;
  padding: 0 6px;
  border: 1px solid rgb(0 140 220 / 35%);
  border-radius: 3px;
  background: rgb(0 35 75 / 80%);
  color: #fff;
  font-size: 12px;
}

.viewport-size-panel__apply {
  height: 28px;
  padding: 0 10px;
  border: 1px solid rgb(0 180 255 / 55%);
  border-radius: 3px;
  background: rgb(0 120 200 / 35%);
  color: #fff;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
}

.viewport-size-panel__apply:hover {
  background: rgb(0 140 220 / 50%);
}
</style>
