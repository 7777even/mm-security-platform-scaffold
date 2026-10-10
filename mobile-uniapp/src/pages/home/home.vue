<script setup lang="ts">
import { onMounted, ref } from 'vue';
import MobileHeader from '@/components/MobileHeader.vue';
import Icon from '@/components/Icon.vue';
import IconTile from '@/components/IconTile.vue';
import MapPanel from '@/components/MapPanel.vue';
import type { MapMarker } from '@/lib/mapAlarm';
import { MM_CENTER } from '@/data/geo';
import {
  fetchAlarmPage,
  fetchTasks,
  fetchEmergencyEvents,
  fetchMessages,
  fetchAlarmPoints,
  type AlarmItem,
} from '@/platform/api';
import { mapPointsToMarkers } from '@/lib/mapAlarm';
import { wgs84ToGcj02 } from '@/lib/coord';
import { liveAlarms } from '@/data/liveCache';
import { go } from '@/platform/nav';
import { startRealtime } from '@/platform/realtime';
import { useDomainAutoRefresh } from '@/composables/useDomainAutoRefresh';

interface AlertStat {
  key: string;
  label: string;
  value: number;
  severity: 'danger' | 'warning' | 'info';
  icon: string;
  firstAlarmId?: string;
}
interface TodoTask {
  id: string;
  title: string;
  meta: string;
  status: string;
}

const TYPE_META: Record<
  string,
  { label: string; icon: string; severity: 'danger' | 'warning' | 'info' }
> = {
  FIRE: { label: '火灾报警', icon: 'fire', severity: 'danger' },
  GAS: { label: '气体报警', icon: 'flask', severity: 'danger' },
  TEMP: { label: '温度报警', icon: 'dashboard', severity: 'warning' },
  CCTV: { label: '视频AI', icon: 'video', severity: 'info' },
  SOS: { label: '紧急求助', icon: 'user', severity: 'warning' },
};
const SEVERITY_TONE: Record<string, 'red' | 'orange' | 'blue'> = {
  danger: 'red',
  warning: 'orange',
  info: 'blue',
};
const TASK_STATUS_TAG: Record<string, string> = {
  待接收: 'tag--warning',
  待执行: 'tag--info',
  执行中: 'tag--warning',
  已签收: 'tag--info',
  已完成: 'tag--success',
};

interface QuickLink {
  name: string;
  to: string;
  icon: string;
  tone: any;
}
const quicks: QuickLink[] = [
  { name: '通讯录', to: '/contacts', icon: 'phone', tone: 'green' },
  { name: '今日值班', to: '/duty', icon: 'calendar', tone: 'teal' },
  { name: '应急事件', to: '/events', icon: 'event', tone: 'red' },
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
const pendingCount = ref(0);
const unreadCount = ref(0);
const eventCount = ref(0);
const todoTasks = ref<TodoTask[]>([]);
const mapMarkers = ref<MapMarker[]>([]);
// 厂区中心点（geo.ts 为 WGS-84）转 GCJ-02 后再作为地图中心，避免与报警标记偏移。
const mmCenter = wgs84ToGcj02(MM_CENTER.lng, MM_CENTER.lat);
const userName = ref('张工');
const userRole = ref('消防业务管理员 · 今日值班');

async function loadAlarmStats(): Promise<void> {
  try {
    const page = await fetchAlarmPage(1, 200);
    const list = (page.list ?? []) as AlarmItem[];
    liveAlarms.set(list); // 写入缓存，供详情页按 id 读取
    const byType = new Map<string, { count: number; firstId?: string }>();
    list.forEach((a) => {
      const e = byType.get(a.type) ?? { count: 0 };
      e.count += 1;
      if (e.firstId === undefined) e.firstId = a.alarmId;
      byType.set(a.type, e);
    });
    alertStats.value = Array.from(byType.entries()).map(([t, e]) => {
      const meta = TYPE_META[t] ?? { label: t, icon: 'alarm', severity: 'info' as const };
      return {
        key: t,
        label: meta.label,
        value: e.count,
        severity: meta.severity,
        icon: meta.icon,
        firstAlarmId: e.firstId,
      };
    });
  } catch {
    alertStats.value = [];
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
async function loadMapMarkers(): Promise<void> {
  try {
    const pts = await fetchAlarmPoints();
    mapMarkers.value = mapPointsToMarkers(pts).slice(0, 3);
  } catch {
    mapMarkers.value = [];
  }
}

async function load(): Promise<void> {
  if (!import.meta.env.VITE_API_BASE) return; // 未连后端：各 loader 已有三态兜底
  startRealtime();
  await Promise.all([
    loadAlarmStats(),
    loadTodo(),
    loadEventCount(),
    loadUnread(),
    loadMapMarkers(),
  ]);
}

onMounted(load);
// 实时刷新：任一端改动告警（alarm 域），首页告警概览自动重拉
useDomainAutoRefresh('alarm', loadAlarmStats, { immediate: false });

function onAlertTap(stat: AlertStat): void {
  if (stat.firstAlarmId) go(`/pages/alarm-detail/alarm-detail?id=${stat.firstAlarmId}`);
  else go('/alarms');
}
</script>

<template>
  <view class="mb-page">
    <MobileHeader variant="brand" title="安全管控指挥系统" subtitle="茂名石化" />

    <view class="home-hero">
      <view class="home-hero__text">
        <text class="home-hero__greeting">您好，{{ userName }}</text>
        <text class="home-hero__role">{{ userRole }}</text>
      </view>
      <view class="home-hero__stats">
        <text class="home-hero__stat"
          ><b>{{ pendingCount }}</b
          >待办</text
        >
        <text class="home-hero__stat"
          ><b>{{ unreadCount }}</b
          >未读</text
        >
      </view>
    </view>

    <view class="mb-section">
      <view class="mb-section__head">
        <text class="mb-section__title"
          ><Icon name="alarm" size="var(--mb-ico-sm)" /> 今日告警概览</text
        >
        <view class="mb-section__link" @click="go('/alarms')"><text>全部 ›</text></view>
      </view>
      <view v-if="alertStats.length" class="alert-grid">
        <view
          v-for="stat in alertStats"
          :key="stat.key"
          class="alert-card"
          @click="onAlertTap(stat)"
        >
          <IconTile :name="stat.icon" :tone="SEVERITY_TONE[stat.severity]" shape="rounded" />
          <text class="alert-card__value" :class="`alert-card__value--${stat.severity}`">{{
            stat.value
          }}</text>
          <text class="alert-card__label">{{ stat.label }}</text>
        </view>
      </view>
      <view v-else class="mb-empty"><text class="mb-empty__text">暂无告警</text></view>
    </view>

    <view class="mb-section">
      <view class="mb-section__head">
        <text class="mb-section__title"
          ><Icon name="map" size="var(--mb-ico-sm)" /> 报警态势地图</text
        >
        <view class="mb-section__link" @click="go('/map')"><text>进入地图 ›</text></view>
      </view>
      <view class="map-link" @click="go('/map')">
        <MapPanel
          height="var(--mb-map-h-sm)"
          :center="mmCenter"
          :zoom="12"
          :markers="mapMarkers"
          :label="`报警态势`"
          :interactive="false"
        />
      </view>
    </view>

    <view v-if="eventCount > 0" class="event-strip" @click="go('/events')">
      <text class="event-strip__text"
        ><Icon name="event" size="var(--mb-ico-sm)" /> 应急事件 {{ eventCount }} 条进行中</text
      >
      <text class="event-strip__link">查看 ›</text>
    </view>

    <view v-if="todoTasks.length" class="mb-section">
      <view class="mb-section__head">
        <text class="mb-section__title"><Icon name="task" size="var(--mb-ico-sm)" /> 待办任务</text>
        <view class="mb-section__link" @click="go('/tasks')"><text>全部 ›</text></view>
      </view>
      <view v-for="task in todoTasks" :key="task.id" class="mb-card todo-card">
        <view class="todo-card__row">
          <text class="todo-card__title">{{ task.title }}</text>
          <text class="tag" :class="TASK_STATUS_TAG[task.status] ?? 'tag--info'">{{
            task.status
          }}</text>
        </view>
        <text class="todo-card__meta">{{ task.id }} · {{ task.meta }}</text>
      </view>
    </view>

    <view class="mb-section">
      <view class="mb-section__head"
        ><text class="mb-section__title"
          ><Icon name="grid" size="var(--mb-ico-sm)" /> 快捷功能</text
        ></view
      >
      <view class="quick-grid">
        <view v-for="q in quicks" :key="q.to" class="quick-grid__item" @click="go(q.to)">
          <IconTile :name="q.icon" :tone="q.tone" shape="rounded" variant="solid" />
          <text>{{ q.name }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
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
  font-size: var(--mb-fz-section);
  font-weight: 700;
}
.home-hero__role {
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

.mb-section {
  margin-bottom: var(--space-md);
  padding: 0 var(--mb-pad-x);
}
.mb-section__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-sm);
}
.mb-section__title {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--mb-fz-form-label);
  font-weight: 600;
  color: var(--text-title-mobile);
}
.mb-section__link {
  font-size: var(--mb-fz-tip);
  color: var(--primary-mobile);
}

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

.map-link {
  display: block;
  border-radius: var(--mb-radius-card);
  overflow: hidden;
}

.event-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: var(--mb-row-h);
  margin: 0 var(--mb-pad-x) var(--space-md);
  padding: 0 var(--space-md);
  background: var(--warning-mobile-soft);
  border-radius: var(--mb-radius-ctrl);
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

.todo-card {
  margin-bottom: var(--space-sm);
  padding: var(--space-md);
  background: var(--card-mobile);
  border: var(--mb-border-w) solid var(--mb-stroke);
  border-radius: var(--mb-radius-card);
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
  font-size: var(--mb-fz-tip);
  color: var(--text-muted-mobile);
}
.tag {
  padding: 2rpx 12rpx;
  border-radius: 8rpx;
  font-size: var(--mb-fz-help);
  background: #eef1f6;
  color: var(--text-muted-mobile);
}
.tag--warning {
  background: rgb(250 140 22 / 12%);
  color: var(--warning-mobile);
}
.tag--info {
  background: rgb(22 119 255 / 12%);
  color: var(--primary-mobile);
}
.tag--success {
  background: rgb(82 196 26 / 12%);
  color: var(--success-mobile);
}

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
}
.quick-grid__item text {
  font-size: var(--mb-fz-help);
  line-height: 1.3;
  color: var(--text-title-mobile);
  text-align: center;
}

.mb-empty {
  padding: var(--mb-empty-pad) 0;
  text-align: center;
}
.mb-empty__text {
  font-size: var(--mb-fz-help);
  color: var(--text-muted-mobile);
}
</style>
