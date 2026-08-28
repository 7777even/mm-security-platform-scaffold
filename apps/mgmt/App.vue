<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';

// MgmtLayout：后台管理端 T 型布局壳（docs/UI规范-后台管理端.md §3）
// 深蓝渐变顶栏 56px（品牌带）+ 侧栏 220px（折叠 64px）+ 主内容区 24px 边距白卡承载
const collapsed = ref(false);
const route = useRoute();

interface NavItem {
  path: string;
  label: string;
  group?: string;
}

// 导航按「系统管理 — 业务专题 — 数据统计」组织；此处先挂骨架菜单，
// 后续由 /auth/menus 动态菜单 + v-permission 权限点驱动
const navItems: NavItem[] = [
  { path: '/workbench', label: '工作台' },
  { path: '/alarm-records', label: '报警记录', group: '业务专题' },
];
</script>

<template>
  <div class="mgmt-layout">
    <header class="mgmt-header">
      <!-- Logo 置左上角，点击返回主页（详设 V1.5 §3.4） -->
      <RouterLink to="/workbench" class="mgmt-header__brand" title="返回主页">
        安全管控平台 · 管理后台
      </RouterLink>
      <div class="mgmt-header__actions">
        <span class="mgmt-header__action">全局搜索</span>
        <span class="mgmt-header__action">消息通知</span>
        <span class="mgmt-header__action">适老模式</span>
        <span class="mgmt-header__action">用户中心</span>
      </div>
    </header>

    <div class="mgmt-body">
      <aside class="mgmt-aside" :class="{ 'mgmt-aside--collapsed': collapsed }">
        <nav class="mgmt-nav">
          <template v-for="item in navItems" :key="item.path">
            <div v-if="item.group && !collapsed" class="mgmt-nav__group">{{ item.group }}</div>
            <RouterLink
              :to="item.path"
              class="mgmt-nav__item"
              :class="{ 'mgmt-nav__item--active': route.path === item.path }"
              :title="item.label"
            >
              <span v-if="!collapsed" class="mgmt-nav__label">{{ item.label }}</span>
            </RouterLink>
          </template>
        </nav>
        <button
          type="button"
          class="mgmt-aside__collapse"
          :title="collapsed ? '展开侧栏' : '折叠侧栏'"
          @click="collapsed = !collapsed"
        >
          {{ collapsed ? '»' : '«' }}
        </button>
      </aside>

      <main class="mgmt-main">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
.mgmt-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* 顶栏：深蓝（蓝系）渐变品牌带（仅后台用 --mgmt-header-bg，禁止复用大屏 --gradient-bg 深蓝黑底） */
.mgmt-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--mgmt-header-h);
  flex-shrink: 0;
  padding: 0 var(--space-lg);
  background: var(--mgmt-header-bg);
}

.mgmt-header__brand {
  font-size: var(--mgmt-fz-header);
  font-weight: 600;
  color: var(--color-on-primary);
  text-decoration: none;
  cursor: pointer;
}

/* 顶栏快捷入口：白描线落在半透明圆角底上（文字走主色上的白字 token） */
.mgmt-header__actions {
  display: flex;
  gap: var(--space-md);
}

.mgmt-header__action {
  display: inline-flex;
  align-items: center;
  height: var(--mgmt-header-action-h);
  padding: 0 10px;
  font-size: var(--mgmt-fz-caption);
  color: var(--color-on-primary);
  background: var(--mgmt-header-action-bg);
  border-radius: var(--mgmt-radius-md);
  cursor: pointer;
}

.mgmt-body {
  display: flex;
  flex: 1;
  min-height: 0;
}

/* 侧栏：220px / 折叠 64px，菜单项 40px，选中仅改主色 + 浅蓝底 */
.mgmt-aside {
  display: flex;
  flex-direction: column;
  width: var(--mgmt-aside-w);
  flex-shrink: 0;
  background: var(--card-mgmt);
  border-right: 1px solid var(--border-mgmt);
  transition: width 0.2s ease;
}

.mgmt-aside--collapsed {
  width: 64px;
}

.mgmt-nav {
  flex: 1;
  padding: var(--space-sm);
  overflow-y: auto;
}

.mgmt-nav__group {
  height: var(--mgmt-sidebar-item-h);
  display: flex;
  align-items: center;
  padding-left: var(--space-sm);
  font-size: var(--mgmt-fz-caption);
  color: var(--text-muted-mgmt);
}

.mgmt-nav__item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: var(--mgmt-sidebar-item-h);
  margin-bottom: var(--space-xs);
  border-radius: var(--mgmt-radius-md);
  font-size: var(--mgmt-fz-body);
  color: var(--color-text);
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
}

.mgmt-nav__item:hover {
  background: var(--primary-mgmt-soft);
}

.mgmt-nav__item--active {
  background: var(--primary-mgmt-soft);
  color: var(--primary-mgmt);
  font-weight: 600;
}

.mgmt-aside__collapse {
  height: 32px;
  margin: var(--space-sm);
  border: 1px solid var(--border-mgmt);
  border-radius: var(--mgmt-radius-md);
  background: transparent;
  color: var(--text-muted-mgmt);
  cursor: pointer;
}

.mgmt-aside__collapse:hover {
  color: var(--primary-mgmt);
  border-color: var(--primary-mgmt);
}

/* 主内容区：页边距 24px（规范 24–32），页面由白卡承载 */
.mgmt-main {
  flex: 1;
  min-width: 0;
  padding: var(--mgmt-content-pad);
  overflow-y: auto;
}
</style>
