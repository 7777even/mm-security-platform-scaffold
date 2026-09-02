<script setup lang="ts">
import { nextTick, onUnmounted, ref, watch } from 'vue';
import { openSizePanel } from '../../utils/viewportSimulator';

const props = defineProps<{
  open: boolean;
  anchorEl: HTMLElement | null;
}>();

const emit = defineEmits<{
  close: [];
}>();

const panelEl = ref<HTMLElement | null>(null);
const panelStyle = ref<Record<string, string>>({});

defineExpose({ panelEl });

function updatePanelPosition() {
  if (!props.anchorEl) return;
  const rect = props.anchorEl.getBoundingClientRect();
  panelStyle.value = {
    top: `${rect.bottom + 8}px`,
    right: `${window.innerWidth - rect.right}px`,
  };
}

watch(
  () => props.open,
  async (open) => {
    if (!open) {
      window.removeEventListener('resize', updatePanelPosition);
      return;
    }
    await nextTick();
    updatePanelPosition();
    window.addEventListener('resize', updatePanelPosition);
  },
);

onUnmounted(() => {
  window.removeEventListener('resize', updatePanelPosition);
});

function handleSimPreview() {
  emit('close');
  nextTick(() => {
    if (props.anchorEl) openSizePanel(props.anchorEl);
  });
}

function handleProfile() {
  emit('close');
}

function handleLogout() {
  emit('close');
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" ref="panelEl" class="user-menu" :style="panelStyle" @click.stop>
      <button type="button" class="user-menu__item" @click="handleSimPreview">模拟预览</button>
      <button type="button" class="user-menu__item" @click="handleProfile">个人中心</button>
      <button type="button" class="user-menu__item user-menu__item--danger" @click="handleLogout">
        退出登录
      </button>
    </div>
  </Teleport>
</template>

<style scoped>
.user-menu {
  position: fixed;
  z-index: 10000;
  min-width: 120px;
  padding: 6px;
  border: 1px solid rgb(0 140 220 / 45%);
  border-radius: 4px;
  background: rgb(0 22 48 / 98%);
  box-shadow: 0 8px 24px rgb(0 0 0 / 45%);
}

.user-menu__item {
  display: block;
  width: 100%;
  padding: 8px 12px;
  border: none;
  border-radius: 3px;
  background: transparent;
  color: #d8d8d8;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  white-space: nowrap;
}

.user-menu__item:hover {
  background: rgb(0 70 120 / 45%);
  color: #fff;
}

.user-menu__item--danger:hover {
  background: rgb(180 40 40 / 35%);
  color: #ffc4c4;
}
</style>
