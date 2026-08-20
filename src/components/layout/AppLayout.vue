<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import type { Component } from 'vue';
import type { RouteRecordRaw } from 'vue-router';
import { useRoute, useRouter, RouterLink, RouterView } from 'vue-router';
import { usePermission } from '@/composables/usePermission';
import { useAuthStore, ROLE_PERMS, ROLE_NAMES, type RoleId } from '@/stores/auth';
import { getInstalledMenuRoutes } from '@/router/menu';
import { markOnce } from '@/utils/perf';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const { filterRoutesByPerm } = usePermission();

const now = ref('');
let timer: ReturnType<typeof setInterval> | null = null;

// 大屏模块导航：取动态装配的菜单路由（main.ts 按 /auth/menus 装配），
// 按角色 meta.perm 过滤；无组件分组壳（如 system）展开为叶子项，
// 但子项全被过滤的空壳不渲染（避免"系统管理"点进去无页面的幽灵菜单）。
// 叶子路由 children 为 undefined（保留）；分组壳 children 过滤后为空数组（丢弃）。
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

// 读取导航项图标（菜单 meta.icon 由 menu.ts 装配写入；RouteMeta 未声明该字段，安全取值）
function navIcon(item: RouteRecordRaw): Component | undefined {
  return (item.meta as { icon?: Component }).icon;
}

onMounted(() => {
  tick();
  timer = setInterval(tick, 1000);
  // 渲染层：大屏布局挂载完成（对比 app:ready 与 FCP）
  markOnce('layout:ready');
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<template>
  <div class="screen">
    <header class="header">
      <div class="brand" title="返回首页" @click="goHome">
        <!-- 盾牌 Logo：风格化占位，正式接入时替换为中石化品牌资产 -->
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

      <nav class="nav" aria-label="模块导航">
        <RouterLink
          v-for="item in menuRoutes"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: route.path.startsWith(item.path) }"
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

    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.screen {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-lg);
  height: 64px;
  padding: 0 var(--space-lg);
  position: relative;
  z-index: 10;
  flex-shrink: 0;
  background: linear-gradient(180deg, rgb(15 30 54 / 92%), rgb(15 30 54 / 65%));
  border-bottom: 1px solid var(--glass-border);
  backdrop-filter: blur(var(--glass-blur));
}

/* 底部青色亮线 */
.header::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgb(0 212 255 / 55%), transparent);
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
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 2px;
  color: var(--color-text);
  text-shadow: 0 0 14px var(--color-accent-glow);
  white-space: nowrap;
}

.nav {
  display: flex;
  gap: var(--space-xs);
  flex: 1;
  justify-content: center;
}

.nav-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 18px;
  border-radius: 20px;
  font-size: var(--font-body);
  letter-spacing: 1px;
  color: var(--color-text-muted);
  text-decoration: none;
  border: 1px solid transparent;
  transition:
    color 0.25s ease,
    background 0.25s ease,
    box-shadow 0.25s ease;
  white-space: nowrap;
}

/* 导航图标：Element Plus 图标 svg 无 width/height，需显式定尺寸；
   fill=currentColor 使其颜色随 nav-item 选中态（accent）自动变化 */
.nav-item__icon {
  width: 18px;
  height: 18px;
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
  color: var(--color-accent);
  background: var(--color-accent-soft);
  border-color: var(--glass-border);
  box-shadow: 0 0 12px rgb(0 212 255 / 15%);
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  flex-shrink: 0;
}

.clock {
  font-family: Consolas, 'Courier New', monospace;
  font-size: 13px;
  letter-spacing: 1px;
  color: var(--color-text);
  text-shadow: 0 0 8px rgb(0 212 255 / 30%);
  white-space: nowrap;
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

.content {
  flex: 1;
  padding: var(--space-md);
  overflow: auto;
}
</style>
