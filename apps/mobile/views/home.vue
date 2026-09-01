<script setup lang="ts">
import { computed, ref } from 'vue';
import MobileHeader from '../components/MobileHeader.vue';
import Icon from '../components/Icon.vue';
import IconTile from '../components/IconTile.vue';
import MapPanel from '../components/MapPanel.vue';
import { MM_CENTER, alarmMarkers } from '../data/geo';

// 首页：对齐 ui-redesign 参考 Home.vue（2026-08-31 二次迁移补齐）
// - 地图区由占位卡替换为真实 MapPanel（Leaflet·高德），与参考一致 interactive=false
// - 区块链接落地到真实路由（/alarms /map /events /tasks），替换此前的 /tasks 占位
// - 补齐参考的「快捷功能」12 宫格——这是通讯录/值班/工单等新页面在 UI 上的唯一入口
// - 图标统一走共享 Icon / IconTile 组件（AGENTS.md §5 复用既有能力），删除页内内联 SVG

/** 告警等级 → 语义色档（浅底图标 + 同色数字） */
type AlertSeverity = 'danger' | 'warning' | 'info';

interface AlertStat {
  key: string;
  label: string;
  value: number;
  severity: AlertSeverity;
  icon: string;
}

const alertStats: AlertStat[] = [
  { key: 'fire', label: '消防报警', value: 2, severity: 'danger', icon: 'fire' },
  { key: 'dcs', label: 'DCS 报警', value: 1, severity: 'warning', icon: 'dashboard' },
  { key: 'gds', label: 'GDS 气体', value: 1, severity: 'danger', icon: 'flask' },
  { key: 'perimeter', label: '周界入侵', value: 1, severity: 'warning', icon: 'shield' },
  { key: 'video', label: '视频AI', value: 1, severity: 'info', icon: 'video' },
  { key: 'person', label: '人员异常', value: 1, severity: 'info', icon: 'user' },
];

/** 告警等级 → IconTile 色板（对齐参考 statTone） */
const SEVERITY_TONE: Record<AlertSeverity, 'red' | 'orange' | 'blue'> = {
  danger: 'red',
  warning: 'orange',
  info: 'blue',
};

const userName = ref('张工');
const userRole = ref('消防业务管理员 · 今日值班');
const pendingCount = ref(3);
const unreadCount = ref(5);
const alarmTotal = computed(() => alertStats.reduce((sum, s) => sum + s.value, 0));

/** 快捷功能宫格：路由均已落地， tone 沿用参考配色并映射到 iconset 色板 */
interface QuickLink {
  name: string;
  to: string;
  icon: string;
  tone: 'green' | 'teal' | 'blue' | 'orange' | 'cyan' | 'indigo' | 'red' | 'amber' | 'purple';
}

const quicks: QuickLink[] = [
  { name: '通讯录', to: '/contacts', icon: 'phone', tone: 'green' },
  { name: '今日值班', to: '/duty', icon: 'calendar', tone: 'teal' },
  { name: '应急预案', to: '/plans', icon: 'plan', tone: 'blue' },
  { name: 'MSDS', to: '/msds', icon: 'flask', tone: 'orange' },
  { name: '防火巡查', to: '/patrols', icon: 'patrol', tone: 'orange' },
  { name: '报修工单', to: '/orders', icon: 'order', tone: 'cyan' },
  { name: '运维看板', to: '/ops', icon: 'ops', tone: 'cyan' },
  { name: '视频监控', to: '/videos', icon: 'video', tone: 'indigo' },
  { name: '演练信息', to: '/drills', icon: 'drill', tone: 'red' },
  { name: '应急资源', to: '/resources', icon: 'resource', tone: 'green' },
  { name: '异常管理', to: '/anomalies', icon: 'anomaly', tone: 'amber' },
  { name: '操作票', to: '/tickets', icon: 'ticket', tone: 'purple' },
];

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
    <MobileHeader variant="brand" title="安全管控指挥系统" subtitle="茂名石化" />

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
          <Icon name="alarm" size="var(--mb-ico-sm)" />
          今日告警概览
        </span>
        <RouterLink to="/alarms" class="mb-section__link">全部 →</RouterLink>
      </div>
      <div class="alert-grid">
        <RouterLink v-for="stat in alertStats" :key="stat.key" to="/alarms" class="alert-card">
          <IconTile :name="stat.icon" :tone="SEVERITY_TONE[stat.severity]" shape="rounded" />
          <b class="alert-card__value" :class="`alert-card__value--${stat.severity}`">{{
            stat.value
          }}</b>
          <span class="alert-card__label">{{ stat.label }}</span>
        </RouterLink>
      </div>
    </section>

    <!-- 报警态势地图：真实 Leaflet 地图（点击进态势地图页） -->
    <section class="mb-section">
      <div class="mb-section__head">
        <span class="mb-section__title">
          <Icon name="map" size="var(--mb-ico-sm)" />
          报警态势地图
        </span>
        <RouterLink to="/map" class="mb-section__link">进入地图 →</RouterLink>
      </div>
      <RouterLink to="/map" class="map-link" aria-label="报警态势地图，点击进入态势页">
        <MapPanel
          height="var(--mb-map-h-sm)"
          :center="MM_CENTER"
          :zoom="12"
          :markers="alarmMarkers.slice(0, 3)"
          :label="`报警态势 · ${alarmTotal} 起`"
          :interactive="false"
        />
      </RouterLink>
    </section>

    <!-- 应急事件警示条 -->
    <RouterLink to="/events" class="event-strip">
      <span class="event-strip__text">
        <Icon name="event" size="var(--mb-ico-sm)" />
        应急事件 3 条进行中
      </span>
      <span class="event-strip__link">查看 →</span>
    </RouterLink>

    <!-- 待办任务 -->
    <section class="mb-section">
      <div class="mb-section__head">
        <span class="mb-section__title">
          <Icon name="task" size="var(--mb-ico-sm)" />
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

    <!-- 快捷功能：全部业务页面的入口宫格（对齐参考 Home.vue quicks） -->
    <section class="mb-section">
      <div class="mb-section__head">
        <span class="mb-section__title">
          <Icon name="grid" size="var(--mb-ico-sm)" />
          快捷功能
        </span>
      </div>
      <div class="quick-grid">
        <RouterLink v-for="q in quicks" :key="q.to" :to="q.to" class="quick-grid__item">
          <IconTile :name="q.icon" :tone="q.tone" shape="rounded" variant="solid" />
          <span>{{ q.name }}</span>
        </RouterLink>
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
  min-width: var(--mb-hero-stat-w);
  padding: var(--space-xs) var(--space-sm);
  font-size: var(--mb-fz-tip);
  background: var(--mb-hero-stat-bg);
  border-radius: var(--mb-radius-ctrl);
}

.home-hero__stat b {
  font-size: var(--mb-fz-page);
  font-weight: 700;
}

/* ---- 告警概览：3 列图标卡（整卡可点 → 告警列表） ---- */
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
  border: var(--mb-border-w) solid var(--mb-stroke);
  border-radius: var(--mb-radius-card);
  text-decoration: none;
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
  color: var(--text-title-mobile);
}

/* ---- 态势地图链接壳：圆角裁切，与卡片栅格对齐 ---- */
.map-link {
  display: block;
  border-radius: var(--mb-radius-card);
  overflow: hidden;
  text-decoration: none;
}

/* ---- 应急事件警示条：浅黄底 + 深黄字，整条可点热区 ≥48 ---- */
.event-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: var(--mb-row-h);
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

/* ---- 快捷功能宫格：4 列白卡，图标实底方 + 名称 ---- */
.quick-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-sm);
}

.quick-grid__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  min-height: var(--mb-tile-h);
  padding: var(--space-md) var(--space-xs) var(--space-sm);
  background: var(--card-mobile);
  border: var(--mb-border-w) solid var(--mb-stroke);
  border-radius: var(--mb-radius-card);
  text-decoration: none;
}

.quick-grid__item span {
  font-size: var(--mb-fz-help);
  line-height: 1.3;
  color: var(--text-title-mobile);
  text-align: center;
  word-break: keep-all;
}
</style>
