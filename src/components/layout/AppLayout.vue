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
import { useAuthStore, ROLE_PERMS, ROLE_NAMES, type RoleId } from '@/stores/auth';
import { getInstalledMenuRoutes } from '@/router/menu';
import BottomMessageBar from '@/components/common/BottomMessageBar.vue';
import { markOnce } from '@/utils/perf';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const { filterRoutesByPerm } = usePermission();

const now = ref('');
let timer: ReturnType<typeof setInterval> | null = null;

// 大屏模块导航：取动态装配的菜单路由，按角色 meta.perm 过滤
const menuRoutes = computed(() =>
  filterRoutesByPerm(getInstalledMenuRoutes()).flatMap((r) => {
    if (r.children && r.children.length > 0) return r.children;
    if (r.children === undefined) return [r];
    return [];
  }),
);

const roleOptions = computed(() =>
  (Object.keys(ROLE_PERMS) as RoleId[]).map((id) => ({ id, label: ROLE_NAMES[id] })),
);

function onRoleChange(id: RoleId): void {
  auth.setRole(id);
}

function tick(): void {
  const d = new Date();
  const pad = (n: number): string => String(n).padStart(2, '0');
  now.value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
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
    <!-- §7 顶部导航栏 -->
    <header class="header">
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
        <span class="clock">{{ now }}</span>
        <el-select
          :model-value="auth.roleId"
          class="role-select"
          size="small"
          @change="onRoleChange"
        >
          <el-option
            v-for="role in roleOptions"
            :key="role.id"
            :label="role.label"
            :value="role.id"
          />
        </el-select>
      </div>
    </header>

    <!-- 主路由出口（大屏视图铺满，无内边距；视图内部自行控制边距） -->
    <main class="content">
      <RouterView />
    </main>

    <!-- §11.2 底部消息栏 -->
    <BottomMessageBar />
  </div>
</template>

<style scoped>
.screen {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

/* §7 顶部导航栏：高度 64px（--layout-header-h），深色半透明底 + 底部青色光带 */
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
  border-bottom: 1px solid var(--color-border);
  backdrop-filter: blur(var(--glass-blur));
}

/* §7 底部 1px 青色光带 */
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
  font-size: var(--font-size-time);
  font-weight: 600;
  letter-spacing: 2px;
  color: var(--color-text);
  text-shadow: 0 0 14px var(--color-accent-glow);
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
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 2px;
  color: var(--color-text-muted);
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

.nav-item.active {
  color: var(--color-text-strong);
  font-weight: 600;

  /* 原型选中态：无边框。底部一条薄而柔的光条——径向光团（中心亮青，向左右/上方渐暗、无硬边）；
     中部一层泛光（中间亮、四周渐暗）；底色深蓝与顶栏自然融合 */
  background:
    radial-gradient(
      72% 48% at 50% 102%,
      color-mix(in srgb, var(--color-accent) 95%, transparent) 0%,
      color-mix(in srgb, var(--color-accent) 42%, transparent) 38%,
      transparent 74%
    ),
    radial-gradient(
      150% 140% at 50% 56%,
      color-mix(in srgb, var(--color-accent) 36%, transparent) 0%,
      color-mix(in srgb, var(--color-accent) 16%, transparent) 46%,
      transparent 76%
    ),
    linear-gradient(180deg, rgb(0 14 32 / 85%) 0%, rgb(0 20 42 / 78%) 100%);
  border-color: transparent;
  box-shadow: none;
}

/* §7 预警中心：独立模块，与前面五项青色 Tab 区分（警示色字体 + 警示色图标）；
   无分隔线、无选中态背景/辉光 */
.nav-item--warning {
  color: var(--color-warning);
  margin-left: 22px;
  border-radius: var(--radius-sm);
}

.nav-item--warning .nav-item__icon {
  color: var(--color-warning);
}

.nav-item--warning:hover {
  color: var(--color-warning);
}

/* 选中时仅保持警示色文字，不显示任何选中态背景/辉光（避免回退成青色激活态） */
.nav-item--warning.active {
  color: var(--color-warning);
  background: none;
  box-shadow: none;
  text-shadow: none;
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  flex-shrink: 0;
}

/* §7 右侧顶部时间：Poppins Bold 18px（--font-size-time） */
.clock {
  font-family: var(--font-family-num);
  font-size: var(--font-size-stat-label);
  font-weight: 600;
  letter-spacing: 1px;
  color: var(--color-text);
  text-shadow: 0 0 8px var(--color-accent-glow);
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.role-select {
  width: 140px;
}

.role-select :deep(.el-select__wrapper) {
  background: rgb(0 0 0 / 25%);
  box-shadow: 0 0 0 1px var(--glass-border) inset;
}

.role-select :deep(.el-select__placeholder),
.role-select :deep(.el-select__selected-item) {
  color: var(--color-text);
}

/* §5.4 主路由区：大屏铺满，无内边距；视图内部自行控制布局与边距 */
.content {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
</style>
