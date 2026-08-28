<!--
  MapFloatTools — 大屏地图右侧悬浮工具栏（原型图：图层/区域/搜索/3D视角/热力模式/标绘默认/地图切换/切换组件）
  竖排圆形图标按钮，浮于地图右侧、紧邻右面板左缘（right = 侧栏宽 + 间隙）。
  交互：
    - 3D视角 按钮：切换二/三维（emit toggle-scene）
    - 其余按钮：emit command(name)，由宿主视图接入图层/搜索/标绘等能力
-->
<script setup lang="ts">
import { computed } from 'vue';
import {
  Grid,
  MapLocation,
  Search,
  View,
  Sunny,
  EditPen,
  Switch,
  Menu,
} from '@element-plus/icons-vue';

const props = withDefaults(
  defineProps<{
    /** 当前地图场景模式，控制 3D视角 按钮高亮态 */
    sceneMode?: '2d' | '3d';
  }>(),
  { sceneMode: '3d' },
);

const emit = defineEmits<{
  (e: 'toggle-scene', mode: '2d' | '3d'): void;
  (e: 'command', name: string): void;
}>();

interface Tool {
  key: string;
  label: string;
  icon: unknown;
  /** 切换型按钮（如 3D视角），激活态随状态变化 */
  toggle?: boolean;
}

const tools: Tool[] = [
  { key: 'layer', label: '图层', icon: Grid },
  { key: 'region', label: '区域', icon: MapLocation },
  { key: 'search', label: '搜索', icon: Search },
  { key: 'scene', label: '3D视角', icon: View, toggle: true },
  { key: 'heat', label: '热力模式', icon: Sunny },
  { key: 'plot', label: '标绘默认', icon: EditPen },
  { key: 'switch', label: '地图切换', icon: Switch },
  { key: 'component', label: '切换组件', icon: Menu },
];

function onClick(t: Tool): void {
  if (t.toggle && t.key === 'scene') {
    emit('toggle-scene', props.sceneMode === '3d' ? '2d' : '3d');
    return;
  }
  emit('command', t.key);
}

const isSceneActive = computed(() => props.sceneMode === '3d');
</script>

<template>
  <div class="map-tools" role="toolbar" aria-label="地图工具">
    <button
      v-for="t in tools"
      :key="t.key"
      type="button"
      class="map-tools__btn"
      :class="{ 'is-active': t.key === 'scene' && isSceneActive }"
      :title="t.label"
      :aria-label="t.label"
      @click="onClick(t)"
    >
      <component :is="t.icon" class="map-tools__icon" />
    </button>
  </div>
</template>

<style scoped>
/* 浮于地图右侧，紧邻右侧面板左缘；z 高于地图底座，低于面板容器以免遮挡 */
.map-tools {
  position: absolute;
  top: 50%;
  right: calc(var(--layout-aside-w) + 40px);
  transform: translateY(-50%);
  z-index: var(--z-chrome);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.map-tools__btn {
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  color: var(--color-accent);
  cursor: pointer;
  backdrop-filter: blur(6px);
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    background 0.15s ease;
}

.map-tools__btn:hover {
  transform: scale(1.08);
  background: var(--color-accent-soft);
  box-shadow: 0 0 12px var(--color-accent-glow);
}

.map-tools__btn.is-active {
  background: var(--color-accent-soft);
  border-color: var(--color-accent);
  box-shadow: 0 0 12px var(--color-accent-glow);
}

.map-tools__icon {
  width: 20px;
  height: 20px;
}
</style>
