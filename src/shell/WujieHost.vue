<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import WujieVue from 'wujie-vue3';
import { useAuthStore } from '@/stores/auth';
import { injectDesignTokens } from './wujieTokens';

// wujie 主壳装载槽（wujie-shell spec）。
// 经 <RouterView> 渲染：当路由 meta.subappUrl 存在时挂载对应子应用，
// AppLayout 的 <RouterView/> 即为主壳挂载槽。子应用不可达时由 loading 插槽兜底。
// 子应用名取自路由 name（同域唯一），保证 wujie 实例复用。

const route = useRoute();
const auth = useAuthStore();

const subappUrl = computed(() => route.meta.subappUrl as string | undefined);
const subappName = computed(() => (route.name as string) ?? 'subapp');

// 主壳 → 子应用下传共享态（子应用经 window.$wujie.props 读取）
const sharedProps = computed(() => ({
  user: auth.roleId,
  perms: auth.perms,
  theme: 'dark',
}));

// 子应用沙箱 style 隔离，无法读取主壳 :root 变量；
// 在挂载前把设计 token 注入其沙箱 document（单一真源，子应用不再打包 tokens.css）。
function onBeforeMount(appWindow: Window) {
  injectDesignTokens(appWindow, sharedProps.value.theme);
}
</script>

<template>
  <!-- sandbox 显式声明：allow-scripts + allow-same-origin 保证 wujie 的同源 blob 沙箱
       可创建 WebGL 上下文（Cesium 强依赖 WebGL），排除 iframe 沙箱拦截 WebGL 的隐患 -->
  <!-- width/height 显式 100%：wujie iframe 为 100%×100%，但其容器 div 默认 height:auto，
       不传会高度塌陷（子应用只剩背景、面板/地图不可见） -->
  <WujieVue
    v-if="subappUrl"
    :name="subappName"
    :url="subappUrl"
    :props="sharedProps"
    :before-mount="onBeforeMount"
    width="100%"
    height="100%"
    :sandbox="'allow-scripts allow-same-origin'"
    :live="true"
  >
    <template #loading>
      <div class="wujie-state">子应用加载中…</div>
    </template>
  </WujieVue>
  <div v-else class="wujie-state">未配置子应用地址（meta.subappUrl 缺失）</div>
</template>

<style scoped>
.wujie-state {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted, #94a3b8);
  font-size: 13px;
  background: var(--color-bg);
}
</style>
