<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref, watch, type Component } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  Aim,
  ArrowDown,
  ArrowRight,
  Bell,
  Clock,
  Files,
  FirstAidKit,
  Grid,
  Message,
  Monitor,
  OfficeBuilding,
  Tickets,
  Warning,
} from '@element-plus/icons-vue';
import MgmtIconTile from './components/MgmtIconTile.vue';
import { mgmtMenus } from '@/data/mgmtMenus';
import type { MgmtMenuGroup } from '@/data/mgmtMenus';

// MgmtLayout：后台管理端 T 型布局壳（docs/UI规范-后台管理端.md §3）
// 顶栏 56px：Logo｜竖分隔｜产品名｜tabstrip（浏览器标签式多页签）+ 时间 / 适老模式 / 用户（右）
// 侧栏 220px（折叠 64px）：分组可折叠菜单（分组彩色 tone 图标 + 子菜单小图标）
// 主内容区 24px 边距白卡承载；颜色 / 字号 / 尺寸全部走 mgmt token

const route = useRoute();
const router = useRouter();

/* ---- 侧栏折叠（220px ↔ 64px，§3 布局骨架） ---- */
const collapsed = ref(false);

/* ---- 侧栏分组折叠展开（key → open） ---- */
const openGroups = reactive<Record<string, boolean>>(
  Object.fromEntries(mgmtMenus.map((g, i) => [g.key, i < 2])),
);

/* ---- 顶栏 tabstrip（浏览器标签式多页签） ---- */
interface OpenTab {
  path: string;
  name: string;
  groupKey: string;
  icon: string;
}
const openTabs = reactive<OpenTab[]>([]);

const iconNameByKey: Record<string, Component> = {
  alarm: Bell,
  fire: Warning,
  emergency: FirstAidKit,
  production: OfficeBuilding,
  security: Aim,
  monitor: Monitor,
  comm: Message,
  sys: Files,
};

function isActiveTab(path: string): boolean {
  return route.path === path || route.path.startsWith(`${path}/`);
}
function closeTab(path: string) {
  const idx = openTabs.findIndex((t) => t.path === path);
  if (idx < 0) return;
  openTabs.splice(idx, 1);
  if (isActiveTab(path)) {
    const next = openTabs[Math.min(idx, openTabs.length - 1)];
    router.push(next?.path || '/workbench');
  }
}
function openTab(g: MgmtMenuGroup, path: string, name: string) {
  // 自动展开对应分组
  openGroups[g.key] = true;
  if (!openTabs.some((t) => t.path === path)) {
    openTabs.push({ path, name, groupKey: g.key, icon: g.icon });
  }
  router.push(path);
}

watch(
  () => route.path,
  (p) => {
    const g = mgmtMenus.find((x) =>
      x.children.some((c) => p === c.path || p.startsWith(`${c.path}/`)),
    );
    if (g) openGroups[g.key] = true;
    const leaf = g?.children.find((c) => p === c.path || p.startsWith(`${c.path}/`));
    if (leaf && !openTabs.some((t) => t.path === leaf.path)) {
      openTabs.push({ path: leaf.path, name: leaf.name, groupKey: g!.key, icon: g!.icon });
    }
  },
  { immediate: true },
);

/* ---- item 激活判断 ---- */
function isActiveLeaf(path: string): boolean {
  return route.path === path || route.path.startsWith(`${path}/`);
}

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
const ELDER_KEY = 'mm-mgmt-elder';
const elderMode = ref(localStorage.getItem(ELDER_KEY) === '1');
function applyElder(): void {
  const root = document.documentElement;
  if (elderMode.value) {
    root.setAttribute('data-elder', 'on');
  } else {
    root.removeAttribute('data-elder');
  }
  localStorage.setItem(ELDER_KEY, elderMode.value ? '1' : '0');
}
const toggleElder = () => {
  elderMode.value = !elderMode.value;
  applyElder();
};
applyElder();

/* ---- 消息气泡 ---- */
const msgCount = ref(3);

const toneClassByKey: Record<string, string> = {
  alarm: 'mgmt-tone--red',
  fire: 'mgmt-tone--orange',
  emergency: 'mgmt-tone--amber',
  production: 'mgmt-tone--navy',
  security: 'mgmt-tone--indigo',
  monitor: 'mgmt-tone--cyan',
  comm: 'mgmt-tone--purple',
  sys: 'mgmt-tone--slate',
};

function toneClass(groupKey: string): string {
  return toneClassByKey[groupKey] || 'mgmt-tone--blue';
}
function resolveIcon(name: string): Component {
  return iconNameByKey[name] || Tickets;
}
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
          <!-- 工作台入口（无分组） -->
          <RouterLink
            to="/workbench"
            class="mgmt-nav__item mgmt-nav__item--top"
            :class="{ 'mgmt-nav__item--active': route.path === '/workbench' }"
            title="工作台"
          >
            <el-icon :size="14" class="mgmt-nav__icon"><Monitor /></el-icon>
            <span class="mgmt-nav__label">工作台</span>
          </RouterLink>

          <!-- 业务模块分组（数据驱动，可折叠） -->
          <div v-for="g in mgmtMenus" :key="g.key" class="mgmt-nav__group-wrap">
            <button
              type="button"
              class="mgmt-nav__group"
              :class="[toneClass(g.key)]"
              :aria-expanded="openGroups[g.key]"
              @click="openGroups[g.key] = !openGroups[g.key]"
            >
              <MgmtIconTile
                :icon="resolveIcon(g.icon)"
                :tone="toneClass(g.key).replace('mgmt-tone--', '') as any"
                size="sm"
                variant="soft"
                shape="rounded"
              />
              <span class="mgmt-nav__group-label">{{ g.title }}</span>
              <el-icon
                :size="12"
                class="mgmt-nav__group-arrow"
                :class="{ 'mgmt-nav__group-arrow--open': openGroups[g.key] }"
              >
                <Component :is="openGroups[g.key] ? ArrowDown : ArrowRight" />
              </el-icon>
            </button>
            <div v-show="openGroups[g.key]" class="mgmt-nav__group-children">
              <button
                v-for="item in g.children"
                :key="item.path"
                type="button"
                class="mgmt-nav__item"
                :class="{ 'mgmt-nav__item--active': isActiveLeaf(item.path) }"
                :title="item.name"
                @click="openTab(g, item.path, item.name)"
              >
                <MgmtIconTile
                  :icon="resolveIcon(item.icon)"
                  :tone="toneClass(g.key).replace('mgmt-tone--', '') as any"
                  size="sm"
                  variant="ghost"
                  shape="circle"
                />
                <span class="mgmt-nav__label">{{ item.name }}</span>
              </button>
            </div>
          </div>
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

          <!-- 浏览器标签式多页签（tabstrip）：当前打开的所有页面 -->
          <div class="mgmt-tabstrip">
            <button
              v-for="t in openTabs"
              :key="t.path"
              type="button"
              class="mgmt-tab"
              :class="{ 'mgmt-tab--on': isActiveTab(t.path) }"
              :title="t.name"
              @click="router.push(t.path)"
            >
              <MgmtIconTile
                :icon="resolveIcon(t.icon)"
                :tone="
                  (toneClassByKey[t.groupKey] || 'mgmt-tone--blue').replace(
                    'mgmt-tone--',
                    '',
                  ) as any
                "
                size="sm"
                variant="ghost"
                shape="circle"
              />
              <span class="mgmt-tab__label">{{ t.name }}</span>
              <span
                type="button"
                class="mgmt-tab__close"
                title="关闭"
                @click.stop="closeTab(t.path)"
              >
                ×
              </span>
            </button>
          </div>

          <span class="mgmt-header__spacer" />

          <span class="mgmt-header__pill">
            <el-icon :size="12"><Clock /></el-icon>
            {{ now }}
          </span>
          <span class="mgmt-header__pill mgmt-header__pill--bell">
            <el-icon :size="15"><Bell /></el-icon>
            <span v-if="msgCount" class="mgmt-msg-badge">{{ msgCount }}</span>
          </span>
          <button
            type="button"
            class="mgmt-header__pill mgmt-header__pill--btn"
            :class="{ active: elderMode }"
            :aria-pressed="elderMode"
            title="适老模式"
            @click="toggleElder"
          >
            <el-icon :size="12"><Grid /></el-icon>
            适老
          </button>
          <span class="mgmt-header__user">
            <el-icon :size="14"><Tickets /></el-icon>
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
  gap: var(--space-sm);
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

/* ---- tabstrip：浏览器标签式多页签（背景条 + 独立白底标签 + 右上角关闭按钮） ---- */
.mgmt-tabstrip {
  display: flex;
  align-items: flex-end;
  gap: var(--space-xs);
  margin-left: var(--space-sm);
  flex-shrink: 1;
  overflow-x: auto;
  scrollbar-width: none;
}

.mgmt-tabstrip::-webkit-scrollbar {
  display: none;
}

.mgmt-tab {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  height: calc(var(--mgmt-header-h) - 8px);
  max-width: 180px;
  padding: 0 var(--space-sm) 0 var(--space-xs);
  flex-shrink: 0;
  border: none;
  border-radius: var(--mgmt-radius-sm) var(--mgmt-radius-sm) 0 0;
  background: var(--mgmt-tab-item-bg, rgba(255 255 255 / 55%));
  font-size: var(--mgmt-fz-caption);
  font-weight: 600;
  color: var(--text-title-mgmt);
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
  backdrop-filter: blur(2px);
}

.mgmt-tab:hover {
  background: var(--mgmt-tab-item-hover-bg, rgba(255 255 255 / 75%));
}

.mgmt-tab--on {
  background: var(--card-mgmt);
  color: var(--primary-mgmt);
  box-shadow: inset 0 -2px 0 0 var(--primary-mgmt);
}

.mgmt-tab__label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.mgmt-tab__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  border-radius: 50%;
  font-size: 13px;
  line-height: 1;
  color: var(--text-muted-mgmt);
  margin-left: var(--space-xs);
  cursor: pointer;
}

.mgmt-tab__close:hover {
  background: var(--tag-danger-bg);
  color: var(--danger-mgmt);
}

.mgmt-tab--on .mgmt-tab__close:hover {
  color: var(--color-on-primary);
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
  position: relative;
}

.mgmt-header__pill--btn {
  margin-left: var(--space-xs);
  font-family: inherit;
  cursor: pointer;
}

.mgmt-header__pill--btn:hover {
  background: var(--mgmt-header-pill-hover-bg);
}

.mgmt-header__pill--btn.active {
  background: var(--mgmt-header-pill-hover-bg);
  color: var(--color-on-primary);
  box-shadow: inset 0 0 0 1px var(--color-on-primary);
}

/* 消息铃铛：红色气泡 */
.mgmt-header__pill--bell {
  cursor: pointer;
}

.mgmt-msg-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 700;
  line-height: 16px;
  text-align: center;
  color: var(--color-on-primary);
  background: var(--danger-mgmt);
  box-shadow: 0 0 0 1px var(--card-mgmt);
}

.mgmt-header__user {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  margin-left: var(--space-xs);
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

.mgmt-aside--collapsed .mgmt-nav__group-wrap,
.mgmt-aside--collapsed .mgmt-nav__item--top .mgmt-nav__label {
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

/* 分组折叠头：按钮化，可交互折叠/展开 */
.mgmt-nav__group-wrap {
  margin-bottom: var(--space-xs);
}

.mgmt-nav__group {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  width: 100%;
  height: var(--mgmt-sidebar-item-h);
  padding: 0 var(--space-sm);
  border: none;
  background: transparent;
  border-radius: var(--mgmt-radius-md);
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: background 0.15s ease;
}

.mgmt-nav__group:hover {
  background: var(--mgmt-nav-group-hover-bg);
}

.mgmt-nav__group-label {
  flex: 1;
  font-size: var(--mgmt-fz-caption);
  font-weight: 600;
  color: var(--text-title-mgmt);
  letter-spacing: 0.3px;
}

.mgmt-nav__group-arrow {
  color: var(--text-muted-mgmt);
  transition: transform 0.18s ease;
}

.mgmt-nav__group-arrow--open {
  transform: rotate(0deg);
}

.mgmt-nav__group-arrow:not(.mgmt-nav__group-arrow--open) {
  transform: rotate(0deg);
}

/* 子菜单容器：缩进展示 */
.mgmt-nav__group-children {
  margin-top: var(--space-xs);
  margin-left: var(--space-xs);
  padding-left: var(--space-xs);
  border-left: 2px solid var(--border-mgmt);
  display: flex;
  flex-direction: column;
  gap: 1px;
}

/* 侧栏菜单项 */
.mgmt-nav__item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: 0 var(--space-sm);
  height: var(--mgmt-sidebar-item-h);
  margin-bottom: 1px;
  border: none;
  background: transparent;
  border-radius: var(--mgmt-radius-md);
  font-size: var(--mgmt-fz-body);
  color: var(--color-text);
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  cursor: pointer;
  font-family: inherit;
  width: 100%;
  text-align: left;
  transition:
    background 0.12s ease,
    color 0.12s ease;
}

.mgmt-nav__item:hover {
  background: var(--mgmt-nav-group-hover-bg);
  color: var(--primary-mgmt);
}

.mgmt-nav__item--active {
  background: var(--primary-mgmt-soft);
  color: var(--primary-mgmt);
  font-weight: 600;
  box-shadow: inset 2px 0 0 0 var(--mgmt-active-bar, var(--primary-mgmt));
}

/* 置顶工作台入口 */
.mgmt-nav__item--top {
  margin-bottom: var(--space-sm);
  font-weight: 600;
}

.mgmt-nav__icon {
  flex-shrink: 0;
  color: var(--text-muted-mgmt);
}

.mgmt-nav__item:hover .mgmt-nav__icon,
.mgmt-nav__item--active .mgmt-nav__icon {
  color: inherit;
}

/* 分组 tone 着色（图标 tone 已处理容器色；此处添加分组名下划线装饰） */
.mgmt-nav__group::before {
  content: '';
  width: 3px;
  height: 16px;
  border-radius: 2px;
  background: var(--mgmt-tone-fg, var(--primary-mgmt));
  flex-shrink: 0;
}

.mgmt-tone--red {
  --mgmt-tone-fg: var(--mgmt-tone-red-fg);
}

.mgmt-tone--orange {
  --mgmt-tone-fg: var(--mgmt-tone-orange-fg);
}

.mgmt-tone--amber {
  --mgmt-tone-fg: var(--mgmt-tone-amber-fg);
}

.mgmt-tone--navy {
  --mgmt-tone-fg: var(--mgmt-tone-navy-fg);
}

.mgmt-tone--indigo {
  --mgmt-tone-fg: var(--mgmt-tone-indigo-fg);
}

.mgmt-tone--cyan {
  --mgmt-tone-fg: var(--mgmt-tone-cyan-fg);
}

.mgmt-tone--purple {
  --mgmt-tone-fg: var(--mgmt-tone-purple-fg);
}

.mgmt-tone--slate {
  --mgmt-tone-fg: var(--mgmt-tone-slate-fg);
}

.mgmt-tone--blue {
  --mgmt-tone-fg: var(--primary-mgmt);
}

/* ---- 主内容区：页边距 24px（规范 24–32），页面由白卡承载 ---- */
.mgmt-main {
  flex: 1;
  min-width: 0;
  padding: var(--mgmt-content-pad);
  overflow-y: auto;
}
</style>
