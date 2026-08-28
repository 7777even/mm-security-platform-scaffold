<script setup lang="ts">
import { onMounted, onUnmounted, ref, type Component } from 'vue';
import { useRoute } from 'vue-router';
import {
  AlarmClock,
  Avatar,
  Bell,
  Box,
  Clock,
  Drizzling,
  Grid,
  HomeFilled,
  Lightning,
  Location,
  MagicStick,
  Microphone,
  Monitor,
  Pouring,
  Setting,
  Tickets,
  Umbrella,
  Warning,
  WindPower,
} from '@element-plus/icons-vue';

// MgmtLayout：后台管理端 T 型布局壳（docs/UI规范-后台管理端.md §3）
// 顶栏 56px：Logo｜竖分隔｜产品名｜当前页签（左）+ 时间 / 适老模式 / 用户（右）
// 侧栏 220px（折叠 64px）：分组菜单（分组彩色图标 + 菜单项小图标）
// 主内容区 24px 边距白卡承载；颜色 / 字号 / 尺寸全部走 mgmt token

const route = useRoute();

/* ---- 侧栏折叠（220px ↔ 64px，§3 布局骨架） ---- */
const collapsed = ref(false);

/* ---- 顶栏时钟（原型右上 2026-08-21 12:00） ---- */
const now = ref('');
let clockTimer: number | undefined;
const updateClock = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  now.value = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
};
onMounted(() => {
  updateClock();
  clockTimer = window.setInterval(updateClock, 30_000);
});
onUnmounted(() => window.clearInterval(clockTimer));

/* ---- 适老模式开关（全局同步生效由各端 token 适老档承接，此处先挂开关位） ---- */
const elderMode = ref(false);
const toggleElder = () => {
  elderMode.value = !elderMode.value;
  document.documentElement.toggleAttribute('data-elder', elderMode.value);
};

interface NavLeaf {
  label: string;
  icon: Component;
  /** 未实现页面为占位项，置灰不可点；后续由 /auth/menus 动态菜单驱动 */
  path?: string;
}

interface NavGroup {
  /** 分组名（一级模块）；空串表示置顶无分组区 */
  group: string;
  icon: Component;
  /** 分组图标着色，只用语义 token（§7 同源） */
  tone: 'primary' | 'danger' | 'warning';
  items: NavLeaf[];
}

// 导航按「工作台 — 业务模块」组织，对齐原型图：
// 工作台 / 报警管理（报警记录、报警规则配置）/ 消防设施管理（设施子系统清单）。
// 占位项（无 path）表示页面未实现，置灰禁止交互；后续接动态菜单 + v-permission 权限点驱动
const navGroups: NavGroup[] = [
  {
    group: '',
    icon: Monitor,
    tone: 'primary',
    items: [{ label: '工作台', icon: Monitor, path: '/workbench' }],
  },
  {
    group: '报警管理',
    icon: Bell,
    tone: 'danger',
    items: [
      { label: '报警记录', icon: Tickets, path: '/alarm-records' },
      { label: '报警规则配置', icon: Setting },
    ],
  },
  {
    group: '消防设施管理',
    icon: Warning,
    tone: 'warning',
    items: [
      { label: '消防重点部位管理', icon: Location },
      { label: '火灾自动报警系统', icon: AlarmClock },
      { label: '消防水系统', icon: Pouring },
      { label: '室外消火栓', icon: Umbrella },
      { label: '自动喷水灭火系统', icon: Drizzling },
      { label: '气体灭火系统', icon: WindPower },
      { label: '泡沫灭火系统', icon: MagicStick },
      { label: '干粉灭火系统', icon: Box },
      { label: '防烟排烟系统', icon: Grid },
      { label: '防火分隔设施', icon: Lightning },
      { label: '消防应急广播', icon: Microphone },
      { label: '消防照明及疏散指示', icon: HomeFilled },
    ],
  },
];
</script>

<template>
  <div class="mgmt-layout">
    <div class="mgmt-body">
      <aside class="mgmt-aside" :class="{ 'mgmt-aside--collapsed': collapsed }">
        <!-- Logo 块：与侧栏同体白底，置左上角且点击返回主页（详设 V1.5 §3.4） -->
        <RouterLink to="/workbench" class="mgmt-brand" title="返回主页">
          <svg class="mgmt-brand__logo" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 2.5l7.5 2.8v5.6c0 4.6-3.2 7.9-7.5 10.4-4.3-2.5-7.5-5.8-7.5-10.4V5.3L12 2.5z"
              fill="none"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linejoin="round"
            />
            <path
              d="M8.5 11.5l2.4 2.4 4.6-4.8"
              fill="none"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span class="mgmt-brand__text">
            <span class="mgmt-brand__name">安全管控平台</span>
            <span class="mgmt-brand__sub">管理后台</span>
          </span>
        </RouterLink>

        <nav class="mgmt-nav">
          <template v-for="group in navGroups" :key="group.group || '_top'">
            <div
              v-if="group.group && !collapsed"
              class="mgmt-nav__group"
              :class="`mgmt-nav__group--${group.tone}`"
            >
              <el-icon :size="14" class="mgmt-nav__group-icon"
                ><component :is="group.icon"
              /></el-icon>
              <span class="mgmt-nav__group-label">{{ group.group }}</span>
            </div>
            <template v-for="item in group.items" :key="item.label">
              <!-- 占位项：页面未实现，置灰不可点 -->
              <span
                v-if="!item.path"
                class="mgmt-nav__item mgmt-nav__item--disabled"
                :title="item.label"
              >
                <el-icon :size="14" class="mgmt-nav__icon"><component :is="item.icon" /></el-icon>
                <span class="mgmt-nav__label">{{ item.label }}</span>
              </span>
              <RouterLink
                v-else
                :to="item.path"
                class="mgmt-nav__item"
                :class="{ 'mgmt-nav__item--active': route.path === item.path }"
                :title="item.label"
              >
                <el-icon :size="14" class="mgmt-nav__icon"><component :is="item.icon" /></el-icon>
                <span class="mgmt-nav__label">{{ item.label }}</span>
              </RouterLink>
            </template>
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

      <div class="mgmt-mainwrap">
        <!-- 顶栏：深蓝渐变品牌带（自侧栏右侧开始） -->
        <header class="mgmt-header">
          <span class="mgmt-header__product">
            <span class="mgmt-header__dot" aria-hidden="true" />
            茂名石化 · 安全管控指挥系统
          </span>

          <!-- 当前页签：白底 + 墨蓝字 + 上圆角（原型「工作台」页签） -->
          <span class="mgmt-header__tab">
            <el-icon :size="12"><Monitor /></el-icon>
            {{ String(route.meta.title ?? '工作台') }}
          </span>

          <span class="mgmt-header__spacer" />

          <span class="mgmt-header__pill">
            <el-icon :size="12"><Clock /></el-icon>
            {{ now }}
          </span>
          <button
            type="button"
            class="mgmt-header__pill mgmt-header__pill--btn"
            :aria-pressed="elderMode"
            title="适老模式"
            @click="toggleElder"
          >
            <el-icon :size="12"><Avatar /></el-icon>
            适老
          </button>
          <span class="mgmt-header__user">
            <el-icon :size="14"><Avatar /></el-icon>
            张工
          </span>
        </header>

        <main class="mgmt-main">
          <RouterView />
        </main>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mgmt-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.mgmt-body {
  display: flex;
  flex: 1;
  min-height: 0;
}

.mgmt-mainwrap {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

/* ---- 顶栏：深蓝（蓝系）渐变品牌带（禁止复用大屏 --gradient-bg 深蓝黑底） ---- */
.mgmt-header {
  display: flex;
  align-items: center;
  height: var(--mgmt-header-h);
  flex-shrink: 0;
  padding: 0 var(--space-md);
  background: var(--mgmt-header-bg);
}

/* 产品名前圆形状态灯（在线）：语义绿，纯色不加发光 */
.mgmt-header__dot {
  width: 8px;
  height: 8px;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--success-mgmt);
}

.mgmt-header__product {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  flex-shrink: 0;
  font-size: var(--mgmt-fz-body);
  font-weight: 600;
  color: var(--color-on-primary);
  white-space: nowrap;
}

/* 当前页签：白底 + 墨蓝字 + 上圆角（原型「工作台」页签） */
.mgmt-header__tab {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  height: var(--mgmt-header-h);
  padding: 0 var(--space-md);
  margin-left: var(--space-md);
  flex-shrink: 0;
  font-size: var(--mgmt-fz-body);
  font-weight: 600;
  color: var(--text-title-mgmt);
  background: var(--card-mgmt);
  border-radius: var(--mgmt-radius-md) var(--mgmt-radius-md) 0 0;
  white-space: nowrap;
}

.mgmt-header__spacer {
  flex: 1;
}

/* 顶栏快捷项：白描线落在半透明圆角底上 */
.mgmt-header__pill {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  height: var(--mgmt-header-action-h);
  padding: 0 10px;
  flex-shrink: 0;
  font-size: var(--mgmt-fz-caption);
  color: var(--color-on-primary);
  background: var(--mgmt-header-action-bg);
  border: none;
  border-radius: var(--mgmt-radius-md);
  white-space: nowrap;
}

.mgmt-header__pill--btn {
  margin-left: var(--space-sm);
  font-family: inherit;
  cursor: pointer;
}

.mgmt-header__pill--btn:hover {
  background: var(--mgmt-header-pill-hover-bg);
}

.mgmt-header__user {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  margin-left: var(--space-md);
  flex-shrink: 0;
  font-size: var(--mgmt-fz-body);
  color: var(--color-on-primary);
  white-space: nowrap;
}

/* ---- 侧栏：220px，白底；菜单项 40px，选中仅改主色 + 浅蓝底 ---- */
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

.mgmt-aside--collapsed .mgmt-nav__group {
  display: none;
}

.mgmt-aside--collapsed .mgmt-nav__item {
  justify-content: center;
  padding-left: 0;
}

.mgmt-aside--collapsed .mgmt-nav__label {
  display: none;
}

/* Logo 块：与侧栏同体白底，高与顶栏对齐（56px） */
.mgmt-brand {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  height: var(--mgmt-header-h);
  flex-shrink: 0;
  padding: 0 var(--space-md);
  color: var(--primary-mgmt);
  text-decoration: none;
  border-bottom: 1px solid var(--border-mgmt);
}

.mgmt-brand__logo {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
}

.mgmt-brand__text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.mgmt-brand__name {
  font-size: var(--mgmt-fz-body);
  font-weight: 700;
  color: var(--text-title-mgmt);
}

.mgmt-brand__sub {
  font-size: var(--mgmt-fz-caption);
  color: var(--text-muted-mgmt);
}

.mgmt-aside--collapsed .mgmt-brand {
  justify-content: center;
  padding: 0;
}

.mgmt-aside--collapsed .mgmt-brand__text {
  display: none;
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

.mgmt-nav {
  flex: 1;
  padding: var(--space-sm);
  overflow-y: auto;
}

/* 分组头：彩色图标（语义 token）+ 墨蓝粗体 */
.mgmt-nav__group {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  height: var(--mgmt-sidebar-item-h);
  padding-left: var(--space-sm);
  font-size: var(--mgmt-fz-caption);
  font-weight: 600;
  color: var(--text-title-mgmt);
}

.mgmt-nav__group-icon {
  color: var(--primary-mgmt);
}

.mgmt-nav__group--danger .mgmt-nav__group-icon {
  color: var(--danger-mgmt);
}

.mgmt-nav__group--warning .mgmt-nav__group-icon {
  color: var(--warning-mgmt);
}

.mgmt-nav__item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding-left: var(--space-md);
  height: var(--mgmt-sidebar-item-h);
  margin-bottom: var(--space-xs);
  border-radius: var(--mgmt-radius-md);
  font-size: var(--mgmt-fz-body);
  color: var(--color-text);
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
}

.mgmt-nav__icon {
  flex-shrink: 0;
  color: var(--text-muted-mgmt);
}

.mgmt-nav__item:hover {
  background: var(--primary-mgmt-soft);
}

.mgmt-nav__item:hover .mgmt-nav__icon {
  color: var(--primary-mgmt);
}

.mgmt-nav__item--active {
  background: var(--primary-mgmt-soft);
  color: var(--primary-mgmt);
  font-weight: 600;
}

.mgmt-nav__item--active .mgmt-nav__icon {
  color: var(--primary-mgmt);
}

.mgmt-nav__item--disabled {
  color: var(--text-muted-mgmt);
  cursor: not-allowed;
  opacity: 0.7;
}

.mgmt-nav__item--disabled:hover {
  background: transparent;
}

.mgmt-nav__item--disabled:hover .mgmt-nav__icon {
  color: var(--text-muted-mgmt);
}

/* ---- 主内容区：页边距 24px（规范 24–32），页面由白卡承载 ---- */
.mgmt-main {
  flex: 1;
  min-width: 0;
  padding: var(--mgmt-content-pad);
  overflow-y: auto;
}
</style>
