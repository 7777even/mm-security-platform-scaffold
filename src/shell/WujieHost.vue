<script setup lang="ts">
import { computed, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import WujieVue from 'wujie-vue3';
import { useAuthStore } from '@/stores/auth';
import { injectDesignTokens } from './wujieTokens';

// wujie 主壳装载槽（wujie-shell spec）。
// 经 <RouterView> 渲染：当路由 meta.subappUrl 存在时挂载对应子应用，
// AppLayout 的 <RouterView/> 即为主壳挂载槽。子应用不可达时由 loading 插槽兜底。
// 实例命名策略（reviewer task-12 #4/#5 综合权衡）：
// 1. 以子应用 URL（route.meta.subappUrl）派生 slug（去掉前后缀 + 'subapps/' 前缀）作为实例主键。
// 2. 在 slug 后追加 route.path（包含参数）与 query 哈希 → 不同路径/参数/查询各自独立 wujie 实例。
// 依据：wujie-vue3 1.0.29 的 WujieVue 仅在 (name + url) 变化时调用 startApp，且对已存在
// 的 alive sandbox 不会重跑子应用脚本（无 props 响应式桥）。模块顶层的 routeParams 读取
// 只能反映首次启动时的 props；以全路径派生实例名可让 A→B 切换/list→detail/drill→rescue
// 都重新执行子应用 main.ts，避免 params/mode 错乱（task-12 #5 reviewer 备选方案）。
// 旧实例清理：AppLayout 的 <RouterView :key="route.fullPath">（注释见 AppLayout.vue 161-163）
// 使每条路由重建 WujieHost 实例；wujie-vue3 的 beforeDestroy 仅 bus.$offAll，旧 wujie
// sandbox（iframe + Cesium WebGL 上下文）会留在 wujie 全局 map 中持续消耗资源，
// 直接破坏 reviewer #4「避免同 URL 重复 Cesium」目标。下方 onBeforeUnmount 在组件销毁
// 路径上显式 destroyApp(subappName)，把当前实例的 iframe + Cesium 上下文一并拆掉。
// watch(subappName) 在 RouterView :key 重建策略下不会拿到旧 prev（每次都是新实例 +
// immediate 触发 prev=undefined），故清理必须挂在生命周期而非数据 watch 上。
// 跨子应用切换会重 boot 一次（Cesium 重建），smoke 阶段 14 条直链路由均各自加载，经验可接受。

const route = useRoute();
const auth = useAuthStore();

const subappUrl = computed(() => route.meta.subappUrl as string | undefined);

function slugifySubappUrl(url: string | undefined): string {
  if (!url) return 'subapp';
  // 形如 '/subapps/fm-rescue/' → 'fm-rescue'；其它来源直接 trim 斜杠
  const trimmed = url.replace(/^\/+|\/+$/g, '');
  return trimmed.replace(/^subapps\//, '') || 'subapp';
}

const subappSlug = computed(() => slugifySubappUrl(subappUrl.value));

// 全路径派生：路径含参数（/production/area/A），query 区分 eventId/from 等上下文。
// 顺序：slug + path + ('?' + sortedQuery)。空 query 仅留 path。
const subappName = computed(() => {
  const slug = subappSlug.value;
  const path = route.path || '';
  const queryEntries = Object.entries(route.query).filter(([, v]) => v !== undefined);
  if (queryEntries.length === 0) return `${slug}::${path}`;
  const sorted = queryEntries
    .slice()
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${Array.isArray(v) ? v.join(',') : String(v)}`)
    .join('&');
  return `${slug}::${path}?${sorted}`;
});

// 关键：WujieHost 在路由切换时被 RouterView :key=fullPath 重建，所以旧的 wujie 实例
// 不会被 wujie-vue3 自动 destroy。必须在组件销毁时显式拆掉，避免 Cesium/WebGL 泄漏。
// 注意：必须在 setup 顶部捕获「挂载时」的 subappName（plain const）—— 因为本组件被
// 销毁时，vue-router 已把 route 更新到下一条，subappName 这个 computed 也会跟着重算成
// 下一条路由的 name，销毁的就是还没创建的「未来」实例。mountName 在 setup 时定下值，
// 整个组件生命周期不变，正是这个 WujieHost 启动的那个 wujie sandbox 的 key。
const mountName = subappName.value;
onBeforeUnmount(() => {
  if (mountName) {
    WujieVue.destroyApp(mountName);
  }
});

// 主壳 → 子应用下传共享态（子应用经 window.$wujie.props 读取）
// routeParams：二级参数页（fm-production-area 的 facilityId / fm-major-hazard 的 hazardId）
// 由主壳路由参数透传，子应用无路由树也能拿到路径参数。
// routeName / routePath：子应用无独立路由树，但 SharedCesiumMap 等组件依赖 useRoute()
// 才能解析出 Cesium 地图模式与 focus；透传主壳当前路由的 name / path，
// 子应用侧经 window.$wujie.props 读取后回退到本地 vue-router 之上。
// query：子应用视图大量使用 route.query（eventId/from/autostart/tab/monitor/...），
// 由主壳下传替代子应用沙箱 vue-router 永远命中的 subapp-fallback 缺失。
const sharedProps = computed(() => ({
  user: auth.roleId,
  perms: auth.perms,
  theme: 'dark',
  routeParams: { ...route.params } as Record<string, string>,
  routeName: route.name as string | undefined,
  routePath: route.path,
  query: { ...route.query } as Record<string, string | string[] | null | undefined>,
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
  <!-- width/height 显式 100%：wujie iframe 为 100%×100%，但其容器 div 默认 height:auto,
       不传会高度塌陷（子应用只剩背景、面板/地图不可见） -->
  <!-- :key 与 :name 同值：路由 path/params/query 变化时 Vue 重新挂载 WujieVue；
       旧 sandbox 由 script 段 onBeforeUnmount 显式 destroyApp 拆掉，避免同 URL 重复 Cesium。 -->
  <WujieVue
    v-if="subappUrl"
    :key="subappName"
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
  font-size: var(--font-size-stat-label);
  background: var(--color-bg);
}
</style>
