<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import MobileHeader from '../components/MobileHeader.vue';
import Icon from '../components/Icon.vue';
import IconTile from '../components/IconTile.vue';
import MapPanel from '../components/MapPanel.vue';
import { MM_CENTER, alarmMarkers } from '../data/geo';
import { fetchAlarmPage } from '@/services/alarm';
import { fetchTasks } from '@/services/task';
import { fetchEmergencyEvents } from '@/services/emergencyEvent';
import { fetchMessages } from '@/services/message';
import { isOfflineNoBackend } from '@/services/backendFallback';

// 首页：对齐 ui-redesign 参考 Home.vue（2026-08-31 二次迁移补齐）
// - 告警概览 / 待办 / 事件条 / 未读**复用后端既有端点**（不新增接口）：
//   告警 → /alarms（与大屏报警面板同源，按 type 聚合）；待办 → /tasks；事件条 → /emergency-events；未读 → 消息中心 /messages。
// - 地图区由占位卡替换为真实 MapPanel（Leaflet·高德）；区块链接落地到真实路由
// - 图标统一走共享 Icon / IconTile；取消页内硬编码统计（不回灌假数据）

/** 告警等级 → 语义色档（浅底图标 + 同色数字） */
type AlertSeverity = 'danger' | 'warning' | 'info';

interface AlertStat {
  key: string;
  label: string;
  value: number;
  severity: AlertSeverity;
  icon: string;
}

/** 后端告警类型（/alarms 的 type 枚举）→ 展示元数据 */
const TYPE_META: Record<string, { label: string; icon: string; severity: AlertSeverity }> = {
  FIRE: { label: '火灾报警', icon: 'fire', severity: 'danger' },
  GAS: { label: '气体报警', icon: 'flask', severity: 'danger' },
  TEMP: { label: '温度报警', icon: 'dashboard', severity: 'warning' },
  CCTV: { label: '视频AI', icon: 'video', severity: 'info' },
  SOS: { label: '紧急求助', icon: 'user', severity: 'warning' },
};

/** 告警等级 → IconTile 色板（对齐参考 statTone） */
const SEVERITY_TONE: Record<AlertSeverity, 'red' | 'orange' | 'blue'> = {
  danger: 'red',
  warning: 'orange',
  info: 'blue',
};

interface TodoTask {
  id: string;
  title: string;
  meta: string;
  status: string;
}

const TASK_STATUS_TAG: Record<string, string> = {
  待接收: 'tag--warning',
  待执行: 'tag--info',
  执行中: 'tag--warning',
  已签收: 'tag--info',
  已完成: 'tag--success',
};

/** 快捷功能宫格：路由均已落地，tone 映射到 iconset 色板 */
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

const alertStats = ref<AlertStat[]>([]);
const alarmTotal = ref(0);
const pendingCount = ref(0);
const unreadCount = ref(0);
const eventCount = ref(0);
const todoTasks = ref<TodoTask[]>([]);
const userName = ref('张工');
const userRole = ref('消防业务管理员 · 今日值班');

async function loadAlarmStats(): Promise<void> {
  try {
    const page = await fetchAlarmPage(1, 200);
    alarmTotal.value = page.total ?? 0;
    const byType = new Map<string, number>();
    (page.list ?? []).forEach((a) => byType.set(a.type, (byType.get(a.type) ?? 0) + 1));
    alertStats.value = Array.from(byType.entries()).map(([t, n]) => {
      const meta = TYPE_META[t] ?? { label: t, icon: 'alarm', severity: 'info' as AlertSeverity };
      return { key: t, label: meta.label, value: n, severity: meta.severity, icon: meta.icon };
    });
  } catch {
    alertStats.value = [];
    alarmTotal.value = 0;
  }
}

async function loadTodo(): Promise<void> {
  try {
    const res = await fetchTasks();
    const items = res.items ?? [];
    pendingCount.value = items.filter((t) => t.status !== '已完成').length;
    todoTasks.value = items.slice(0, 2).map((t) => ({
      id: t.taskCode,
      title: t.title,
      meta: [t.area, t.deadline].filter(Boolean).join(' · '),
      status: t.status,
    }));
  } catch {
    pendingCount.value = 0;
    todoTasks.value = [];
  }
}

async function loadEventCount(): Promise<void> {
  try {
    const groups = await fetchEmergencyEvents();
    eventCount.value = groups.reduce((n, g) => n + (g.events?.length ?? 0), 0);
  } catch {
    eventCount.value = 0;
  }
}

async function loadUnread(): Promise<void> {
  try {
    const msgs = await fetchMessages();
    unreadCount.value = msgs.filter((m) => !m.read).length;
  } catch {
    unreadCount.value = 0;
  }
}

async function load(): Promise<void> {
  if (isOfflineNoBackend()) {
    return; // 未连后端：各 loader 内已有三态兜底，保持空态
  }
  await Promise.all([loadAlarmStats(), loadTodo(), loadEventCount(), loadUnread()]);
}

onMounted(load);
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

    <!-- 今日告警概览：3 列图标卡（按后端 type 聚合） -->
    <section class="mb-section">
      <div class="mb-section__head">
        <span class="mb-section__title">
          <Icon name="alarm" size="var(--mb-ico-sm)" />
          今日告警概览
        </span>
        <RouterLink to="/alarms" class="mb-section__link">全部 →</RouterLink>
      </div>
      <div v-if="alertStats.length" class="alert-grid">
        <RouterLink v-for="stat in alertStats" :key="stat.key" to="/alarms" class="alert-card">
          <IconTile :name="stat.icon" :tone="SEVERITY_TONE[stat.severity]" shape="rounded" />
          <b class="alert-card__value" :class="`alert-card__value--${stat.severity}`">{{
            stat.value
          }}</b>
          <span class="alert-card__label">{{ stat.label }}</span>
        </RouterLink>
      </div>
      <div v-else class="mb-empty">
        <div class="mb-empty__art" />
        <p class="mb-empty__text">暂无告警</p>
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
    <RouterLink v-if="eventCount > 0" to="/events" class="event-strip">
      <span class="event-strip__text">
        <Icon name="event" size="var(--mb-ico-sm)" />
        应急事件 {{ eventCount }} 条进行中
      </span>
      <span class="event-strip__link">查看 →</span>
    </RouterLink>

    <!-- 待办任务 -->
    <section v-if="todoTasks.length" class="mb-section">
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
          <span class="tag" :class="TASK_STATUS_TAG[task.status] ?? 'tag--info'">{{
            task.status
          }}</span>
        </div>
        <p class="todo-card__meta">{{ task.id }} · {{ task.meta }}</p>
      </div>
    </section>

    <!-- 快捷功能：全部业务页面的入口宫格 -->
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
/* ---- 问候横幅：复用 hero token（普通=主蓝白字，户外=白底黑字，与「我的」用户卡对齐） ---- */
.home-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-md);
  padding: var(--space-md);
  background: var(--mb-hero-bg);
  border-radius: var(--mb-radius-card);
  color: var(--mb-hero-fg);
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

/* 户外（§6 警示条/通知）：转高饱和纯色块 + 白字 + 2px 黑硬边，与状态标签/提示条统一；
   背景由浅黄 --warning-mobile-soft 换纯橙 --warning-mobile（规范 #fa8c16），文字沿用 --tag-warning-fg 白字。 */
[data-theme='mobile'][data-skin='outdoor'] .event-strip {
  background: var(--warning-mobile);
  border: 2px solid var(--border-mobile);
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
