<!--
  AppLayout — §7 顶部导航栏 + 内容区 + 底部消息栏（设计稿图 5-5）
  全屏骨架：
    - 顶部：64px（var(--layout-header-h)）
    - 中部：flex:1 主路由出口（大屏视图铺满，无内边距）
    - 底部：消息栏（BottomMessageBar，56px）
  五层 z-index（§5.1）严格遵循。
-->
<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import type { Component } from 'vue';
import type { RouteRecordRaw } from 'vue-router';
import { useRoute, useRouter, RouterLink, RouterView } from 'vue-router';
import { usePermission } from '@/composables/usePermission';
import { getInstalledMenuRoutes } from '@/router/menu';
import BottomMessageBar from '@/components/common/BottomMessageBar.vue';
import { markOnce } from '@/utils/perf';

const route = useRoute();
const router = useRouter();
const { filterRoutesByPerm } = usePermission();

const time = ref('');
const dateText = ref('');
// 天气占位数据：当前未对接气象服务，先以静态值展示，后续接入真实数据源可热替换。
const weather = ref({ temp: 14, desc: '多云' });
let timer: ReturnType<typeof setInterval> | null = null;

const WEEK_LABELS = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

// 大屏模块导航：取动态装配的菜单路由，按角色 meta.perm 过滤
const menuRoutes = computed(() =>
  filterRoutesByPerm(getInstalledMenuRoutes()).flatMap((r) => {
    if (r.children && r.children.length > 0) return r.children;
    if (r.children === undefined) return [r];
    return [];
  }),
);

// 二级子应用页（meta.subapp && meta.hidden，如 /fire/rescue、/emergency/drill）：
// 这些是自带顶栏的全屏大屏视图（Cesium 一张图 + rescue-header / 演练页头），
// 若再叠加主壳的 §7 顶栏与 §11.2 消息栏，页面上就会出现「两个顶部栏」。
// 一级模块页（/fire、/emergency…，由 menu.ts 装配、无 hidden）依赖主壳导航做模块切换，
// 必须保留壳层，故仅对二级详情页收起。
const isFullscreenSubapp = computed(() => route.meta.subapp === true && route.meta.hidden === true);

function tick(): void {
  const d = new Date();
  const pad = (n: number): string => String(n).padStart(2, '0');
  time.value = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  dateText.value = `${d.getFullYear()}年${pad(d.getMonth() + 1)}月${pad(d.getDate())}日 ${WEEK_LABELS[d.getDay()]}`;
}

function goHome(): void {
  router.push('/');
}

// 读取导航项图标（菜单 meta.icon 由 menu.ts 装配写入）
function navIcon(item: RouteRecordRaw): Component | undefined {
  return (item.meta as { icon?: Component }).icon;
}

onMounted(() => {
  tick();
  timer = setInterval(tick, 1000);
  markOnce('layout:ready');
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<template>
  <div class="screen">
    <!-- §7 顶部导航栏（二级子应用全屏页收起：其自带 rescue-header 等页头，叠加会出现两个顶栏） -->
    <header v-if="!isFullscreenSubapp" class="header">
      <div class="brand" title="返回首页" @click="goHome">
        <svg
          class="logo"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M8 15v-3h2.5v3" />
          <path d="M13.5 15v-5h2.5v5" />
          <path d="M7 15h10" />
        </svg>
        <span class="brand-title">安全管控指挥系统</span>
      </div>

      <!-- 原型顶部 Tab 条：6 个一级业务模块，选中态青色底边高亮 -->
      <nav class="nav" aria-label="模块导航">
        <RouterLink
          v-for="item in menuRoutes"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{
            active: route.path.startsWith(item.path),
            'nav-item--warning': item.meta?.title === '预警中心',
          }"
        >
          <component :is="navIcon(item)" v-if="navIcon(item)" class="nav-item__icon" />
          <span class="nav-item__label">{{ item.meta?.title }}</span>
        </RouterLink>
      </nav>

      <div class="header-right">
        <!-- §3 天气（占位：未对接气象服务） -->
        <div class="weather" :title="weather.desc" aria-label="天气">
          <svg
            class="weather__icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M7 18h10a4 4 0 0 0 .5-7.97A6 6 0 0 0 5.4 10.5 4 4 0 0 0 7 18Z" />
          </svg>
          <span class="weather__temp">
            <span class="weather__num">{{ weather.temp }}</span
            ><span class="weather__deg">°C</span>
          </span>
        </div>

        <!-- §3 时间 / 日期：顶部关键数字 + 日期 -->
        <div class="time-stack" aria-label="当前时间">
          <span class="time-stack__time">{{ time }}</span>
          <span class="time-stack__date">{{ dateText }}</span>
        </div>

        <!-- §3 用户：头像 + 管理员（脚手架阶段不展开角色权限管理，单一身份展示，无下拉框） -->
        <div class="user-chip">
          <div class="user-chip__avatar" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-3.3 0-9 1.7-9 5v1h18v-1c0-3.3-5.7-5-9-5Z"
              />
            </svg>
          </div>
          <span class="user-chip__name">管理员</span>
          <svg
            class="user-chip__caret"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </div>
    </header>

    <!-- 主路由出口（大屏视图铺满，无内边距；视图内部自行控制边距）
         二级子应用页用稳定挂载槽 key（'subapp-slot'），使 WujieHost 在子应用间
         复用而非随 fullPath 重建——否则 wujie 全局 window.__WUJIE_QUEUE[name] 的
         跨实例同名 startApp 竞态会导致切走再切回后子应用 0 实例（见 Change
         wujie-subapp-switch-race）。一级模块页 / 主应用页仍按 fullPath 重建。
         子应用随路径切换的重新挂载由 WujieHost 内 WujieVue 的 $watch(name+url) 完成。 -->
    <main class="content">
      <RouterView :key="isFullscreenSubapp ? 'subapp-slot' : route.fullPath" />
    </main>

    <!-- §11.2 底部消息栏（二级子应用全屏页收起，让出完整视口给 Cesium 一张图） -->
    <BottomMessageBar v-if="!isFullscreenSubapp" />
  </div>
</template>

<style scoped>
.screen {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

/* §7 顶部导航栏：高度 77px（--layout-header-h），深蓝渐变底 + 底部亮带（源 AppHeader） */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-lg);
  height: var(--layout-header-h);
  padding: 0 var(--space-lg);
  position: relative;
  z-index: var(--z-chrome);
  flex-shrink: 0;
  background: var(--layout-header-bg);
}

/* §7 底部 1px 亮带（源 AppHeader 底部亮线） */
.header::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--layout-header-line), transparent);
  pointer-events: none;
}

.brand {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  cursor: pointer;
  user-select: none;
  flex-shrink: 0;
}

.logo {
  width: 30px;
  height: 30px;
  color: var(--color-accent);
  filter: drop-shadow(0 0 6px var(--color-accent-glow));
}

.brand-title {
  font-size: var(--font-size-display);
  font-weight: 400;
  letter-spacing: 2px;
  color: var(--color-text-strong);
  text-shadow: var(--header-title-glow);
  white-space: nowrap;
}

/* §7 顶部 Tab 条：占满 header 高度，居中排列；选中态青色底边高亮（对齐原型） */
.nav {
  display: flex;
  align-items: stretch;
  align-self: stretch;
  gap: 0;
  flex: 1;
  justify-content: center;
  height: 100%;
}

.nav-item {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;

  /* 占满整个 nav 高度，使选中/悬停背景覆盖整条导航而非仅文字行高 */
  height: 100%;
  padding: 0 22px;
  font-size: var(--font-size-nav);
  font-weight: 400;
  letter-spacing: 2px;
  color: var(--color-text);
  text-decoration: none;
  border: none;
  border-radius: var(--radius-sm);
  box-shadow: none;
  transition:
    color 0.25s ease,
    background 0.25s ease,
    border-color 0.25s ease,
    box-shadow 0.25s ease;
  white-space: nowrap;
}

/* §7 导航图标（--icon-md = 18px） */
.nav-item__icon {
  width: var(--icon-md);
  height: var(--icon-md);
  flex-shrink: 0;
}

.nav-item__label {
  line-height: 1;
}

.nav-item:hover {
  color: var(--color-text);
  background: var(--color-accent-soft);
}

/* §7 导航选中态（源 AppHeader）：顶部泛光渐变底 + 底部亮线 */
.nav-item.active {
  color: var(--color-text-strong);
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--color-accent) 18%, transparent) 0%,
    transparent 72%
  );
  border-color: transparent;
  box-shadow: none;
}

.nav-item.active::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: 120px;
  height: 2px;
  background: var(--color-accent);
  box-shadow: 0 0 8px var(--color-accent-glow);
}

/* §7 预警中心：独立模块，与前面五项亮蓝 Tab 区分（点缀金色字体 + 同色图标，源 nav-warning #eca641）；
   无分隔线、无选中态背景/辉光 */
.nav-item--warning {
  color: var(--accent-gold);
  margin-left: 22px;
  border-radius: var(--radius-sm);
}

.nav-item--warning .nav-item__icon {
  color: var(--accent-gold);
}

.nav-item--warning:hover {
  color: var(--accent-gold);
}

/* 选中时仅保持金色文字，不显示任何选中态背景/辉光（避免回退成蓝色激活态） */
.nav-item--warning.active {
  color: var(--accent-gold);
  background: none;
  box-shadow: none;
  text-shadow: none;
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  flex-shrink: 0;
}

/* §3 右侧 · 天气：图标 + 温度（数据为占位，待接气象服务） */
.weather {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  color: var(--color-text-muted);
}

.weather__icon {
  width: var(--icon-md);
  height: var(--icon-md);
  color: var(--color-accent-2);
  filter: drop-shadow(0 0 4px var(--color-accent-glow));
  flex-shrink: 0;
}

.weather__temp {
  display: inline-flex;
  align-items: baseline;
  font-family: var(--font-family-num);
  font-size: var(--font-size-body);
  font-weight: 600;
  letter-spacing: 0.5px;
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.weather__deg {
  font-family: var(--font-family-base);
  font-weight: 400;
  margin-left: 1px;
  color: var(--color-text-muted);
}

/* §3 右侧 · 时间 / 日期竖排：顶部关键数字 + 日期（§3.1） */
.time-stack {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  line-height: 1;
  min-width: 160px;
}

.time-stack__time {
  font-family: var(--font-family-num);
  font-size: var(--font-size-keynum);
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--color-text-strong);
  text-shadow: 0 0 10px var(--color-accent-glow);
  font-variant-numeric: tabular-nums;
}

.time-stack__date {
  font-family: var(--font-family-base);
  font-size: var(--font-size-helper);
  letter-spacing: 0.5px;
  color: var(--color-text-muted);
}

/* §3 右侧 · 用户：头像 + 管理员（脚手架阶段单一身份，无下拉框 / 无背景框） */
.user-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  user-select: none;
}

.user-chip__avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--color-accent-2);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 8px var(--color-accent-glow);
  flex-shrink: 0;
}

.user-chip__avatar svg {
  width: 18px;
  height: 18px;
  color: var(--color-text-strong);
}

.user-chip__name {
  font-size: var(--font-size-body);
  color: var(--color-text);
  font-weight: 500;
  letter-spacing: 1px;
  white-space: nowrap;
}

.user-chip__caret {
  width: var(--icon-sm);
  height: var(--icon-sm);
  color: var(--color-text-muted);
  flex-shrink: 0;
}

/* §5.4 主路由区：大屏铺满，无内边距；视图内部自行控制布局与边距 */
.content {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
</style>
