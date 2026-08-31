<script setup lang="ts">
import { computed, ref } from 'vue';

// 首页：对齐移动端原型图（2026-08 原型：问候横幅 / 今日告警概览 / 报警态势地图 / 应急事件条 / 待办任务）
// - 告警概览六类的等级着色只用规范映射（--danger/-warning/-primary-mobile），禁止自造色阶
// - 地图区为占位卡：Leaflet/高德引擎接入后替换；"进入地图"暂跳任务页，路由落地后改链
// - 数值为 mock；接入后由 /mobile/workbench 概要接口 + WS 推送驱动

/** 告警等级 → 语义色档（浅底图标 + 同色数字） */
type AlertSeverity = 'danger' | 'warning' | 'info';

interface AlertStat {
  key: string;
  label: string;
  value: number;
  severity: AlertSeverity;
}

const alertStats: AlertStat[] = [
  { key: 'fire', label: '消防报警', value: 2, severity: 'danger' },
  { key: 'dcs', label: 'DCS 报警', value: 1, severity: 'warning' },
  { key: 'gds', label: 'GDS 气体', value: 1, severity: 'danger' },
  { key: 'perimeter', label: '周界入侵', value: 1, severity: 'warning' },
  { key: 'video', label: '视频AI', value: 1, severity: 'info' },
  { key: 'person', label: '人员异常', value: 1, severity: 'info' },
];

const userName = ref('张工');
const userRole = ref('消防业务管理员 · 今日值班');
const pendingCount = ref(3);
const unreadCount = ref(5);
const alarmTotal = computed(() => alertStats.reduce((sum, s) => sum + s.value, 0));

interface TodoTask {
  id: string;
  title: string;
  meta: string;
  status: '待执行' | '执行中';
}

const TASK_STATUS_TAG: Record<TodoTask['status'], string> = {
  待执行: 'tag--info',
  执行中: 'tag--warning',
};

const todoTasks: TodoTask[] = [
  { id: 'T-2081', title: '3号罐区防火巡检', meta: '08:00 - 12:00 · 东区', status: '执行中' },
  { id: 'T-2082', title: '消防水泵房例行检查', meta: '09:30 - 11:00 · 动力站', status: '待执行' },
];
</script>

<template>
  <div class="mb-page">
    <!-- 顶部：系统名 + 单位副标题 + 导航入口 -->
    <header class="mb-brand-header">
      <div>
        <h1 class="mb-brand-header__title">安全管控指挥系统</h1>
        <p class="mb-brand-header__sub">茂名石化</p>
      </div>
      <!-- TODO: 待导航菜单页路由落地后替换 /tasks -->
      <RouterLink to="/tasks" class="mb-brand-header__nav">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
        导航
      </RouterLink>
    </header>

    <!-- 问候横幅：主色实底 + 待办/未读统计 -->
    <section class="home-hero">
      <div class="home-hero__text">
        <p class="home-hero__greeting">您好，{{ userName }}</p>
        <p class="home-hero__role">{{ userRole }}</p>
      </div>
      <div class="home-hero__stats">
        <span class="home-hero__stat"
          ><b>{{ pendingCount }}</b
          >待办</span
        >
        <span class="home-hero__stat"
          ><b>{{ unreadCount }}</b
          >未读</span
        >
      </div>
    </section>

    <!-- 今日告警概览：3 列图标卡 × 2 行 -->
    <section class="mb-section">
      <div class="mb-section__head">
        <span class="mb-section__title">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="8" />
            <path d="M12 8v4l3 2" />
          </svg>
          今日告警概览
        </span>
        <!-- TODO: 待告警列表页路由落地后替换 /tasks -->
        <RouterLink to="/tasks" class="mb-section__link">全部 →</RouterLink>
      </div>
      <div class="alert-grid">
        <div v-for="stat in alertStats" :key="stat.key" class="alert-card">
          <span class="alert-card__icon" :class="`alert-card__icon--${stat.severity}`">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
            >
              <template v-if="stat.key === 'fire'">
                <circle cx="12" cy="13" r="7" />
                <path d="M12 10v3l2 2M10 3h4" />
              </template>
              <template v-else-if="stat.key === 'dcs'">
                <path d="M5 20V12M12 20V5M19 20v-6" />
              </template>
              <template v-else-if="stat.key === 'gds'">
                <path d="M10 3h4M11 3v5l-5 9a3 3 0 0 0 3 4h6a3 3 0 0 0 3-4l-5-9V3" />
              </template>
              <template v-else-if="stat.key === 'perimeter'">
                <path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6l7-3z" />
              </template>
              <template v-else-if="stat.key === 'video'">
                <rect x="3" y="7" width="12" height="10" rx="2" />
                <path d="M15 11l6-3v8l-6-3" />
              </template>
              <template v-else>
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c1-4 4-6 8-6s7 2 8 6" />
              </template>
            </svg>
          </span>
          <b class="alert-card__value" :class="`alert-card__value--${stat.severity}`">{{
            stat.value
          }}</b>
          <span class="alert-card__label">{{ stat.label }}</span>
        </div>
      </div>
    </section>

    <!-- 报警态势地图：占位卡（Leaflet/高德接入后替换为真实底图） -->
    <section class="mb-section">
      <div class="mb-section__head">
        <span class="mb-section__title">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
          报警态势地图
        </span>
        <!-- TODO: 待地图页路由落地后替换 -->
        <RouterLink to="/tasks" class="mb-section__link">进入地图 →</RouterLink>
      </div>
      <div class="map-card" role="img" :aria-label="`报警态势共 ${alarmTotal} 起`">
        <span class="map-card__badge"
          >报警态势 · <b>{{ alarmTotal }}</b> 起</span
        >
        <span class="map-card__dot map-card__dot--danger" />
        <span class="map-card__dot map-card__dot--warning" />
        <span class="map-card__dot map-card__dot--success" />
        <span class="map-card__placeholder">地图引擎接入中（Leaflet · 高德）</span>
      </div>
    </section>

    <!-- 应急事件警示条 -->
    <RouterLink to="/tasks" class="event-strip">
      <span class="event-strip__text">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <path d="M12 4L2 20h20L12 4z" />
          <path d="M12 10v4M12 17.5v.5" />
        </svg>
        应急事件 3 条进行中
      </span>
      <span class="event-strip__link">查看 →</span>
    </RouterLink>

    <!-- 待办任务 -->
    <section class="mb-section">
      <div class="mb-section__head">
        <span class="mb-section__title">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path d="M4 6h16M4 12h16M4 18h10" />
          </svg>
          待办任务
        </span>
        <RouterLink to="/tasks" class="mb-section__link">全部 →</RouterLink>
      </div>
      <div v-for="task in todoTasks" :key="task.id" class="mb-card todo-card">
        <div class="todo-card__row">
          <span class="todo-card__title">{{ task.title }}</span>
          <span class="tag" :class="TASK_STATUS_TAG[task.status]">{{ task.status }}</span>
        </div>
        <p class="todo-card__meta">{{ task.id }} · {{ task.meta }}</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ---- 问候横幅：主色实底白字 ---- */
.home-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-md);
  padding: var(--space-md);
  background: var(--primary-mobile);
  border-radius: var(--mb-radius-card);
  color: var(--color-on-primary);
}

.home-hero__greeting {
  margin: 0;
  font-size: var(--mb-fz-section);
  font-weight: 700;
}

.home-hero__role {
  margin: var(--space-xs) 0 0;
  font-size: var(--mb-fz-tip);
  opacity: 0.9;
}

.home-hero__stats {
  display: flex;
  gap: var(--space-sm);
}

.home-hero__stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 56px;
  padding: var(--space-xs) var(--space-sm);
  font-size: var(--mb-fz-tip);
  background: var(--mb-hero-stat-bg);
  border-radius: var(--mb-radius-ctrl);
}

.home-hero__stat b {
  font-size: var(--mb-fz-page);
  font-weight: 700;
}

/* ---- 通用 section（样式真源在 mobile.css，此处仅页内微调） ---- */

/* ---- 告警概览：3 列图标卡 ---- */
.alert-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--mb-card-gap);
}

.alert-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-md) 0;
  background: var(--card-mobile);
  border: 1px solid var(--color-border);
  border-radius: var(--mb-radius-card);
}

/* 图标：浅色圆底 + 同色线性图标 */
.alert-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.alert-card__icon svg {
  width: 20px;
  height: 20px;
}

.alert-card__icon--danger {
  color: var(--danger-mobile);
  background: var(--tag-danger-bg);
}

.alert-card__icon--warning {
  color: var(--warning-mobile);
  background: var(--tag-warning-bg);
}

.alert-card__icon--info {
  color: var(--primary-mobile);
  background: var(--tag-info-bg);
}

.alert-card__value {
  font-size: var(--mb-fz-page);
  font-weight: 700;
}

.alert-card__value--danger {
  color: var(--danger-mobile);
}

.alert-card__value--warning {
  color: var(--warning-mobile);
}

.alert-card__value--info {
  color: var(--primary-mobile);
}

.alert-card__label {
  font-size: var(--mb-fz-help);
  color: var(--color-text);
}

/* ---- 报警态势地图占位卡 ---- */
.map-card {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 180px;
  background: var(--primary-mobile-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--mb-radius-card);
  overflow: hidden;
}

.map-card__badge {
  position: absolute;
  top: var(--space-sm);
  left: var(--space-sm);
  padding: var(--space-xs) var(--space-sm);
  font-size: var(--mb-fz-tip);
  color: var(--color-text);
  background: var(--card-mobile);
  border-radius: var(--mb-radius-ctrl);
}

.map-card__badge b {
  color: var(--danger-mobile);
}

/* 态势点位（mock 布局） */
.map-card__dot {
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.map-card__dot--danger {
  top: 40%;
  left: 30%;
  background: var(--danger-mobile);
}

.map-card__dot--warning {
  top: 60%;
  left: 55%;
  background: var(--warning-mobile);
}

.map-card__dot--success {
  top: 35%;
  left: 72%;
  background: var(--success-mobile);
}

.map-card__placeholder {
  font-size: var(--mb-fz-help);
  color: var(--text-muted-mobile);
}

/* ---- 应急事件警示条：浅黄底 + 深黄字，整条可点热区 ≥48 ---- */
.event-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 48px;
  margin-bottom: var(--space-md);
  padding: 0 var(--space-md);
  background: var(--warning-mobile-soft);
  border-radius: var(--mb-radius-ctrl);
  text-decoration: none;
}

.event-strip__text {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--mb-fz-form-label);
  color: var(--tag-warning-fg);
}

.event-strip__text svg {
  width: 16px;
  height: 16px;
}

.event-strip__link {
  font-size: var(--mb-fz-form-label);
  font-weight: 600;
  color: var(--tag-warning-fg);
}

/* ---- 待办任务卡 ---- */
.todo-card {
  margin-bottom: var(--space-sm);
}

.todo-card:last-child {
  margin-bottom: 0;
}

.todo-card__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
}

.todo-card__title {
  font-size: var(--mb-fz-form-label);
  font-weight: 600;
  color: var(--text-title-mobile);
}

.todo-card__meta {
  margin: 0;
  font-size: var(--mb-fz-tip);
  color: var(--text-muted-mobile);
}
</style>
