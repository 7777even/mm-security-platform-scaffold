<script setup lang="ts">
import { onMounted, ref } from 'vue';
import MobileHeader from '@/components/MobileHeader.vue';
import { fetchEmergencyEvents, type EmergencyEventItem } from '@/platform/api';
import { useDomainAutoRefresh } from '@/composables/useDomainAutoRefresh';
import { liveEvents } from '@/data/liveCache';
import { go } from '@/platform/nav';

// 应急事件（docs/UI规范-移动端.md §5）。数据源：后端 /api/v1/emergency-events（分组聚合）。
interface EventRow {
  id: string;
  name: string;
  level: string;
  time: string;
  area: string;
  st: string;
}

const loading = ref(false);
const rows = ref<EventRow[]>([]);

const LEVEL_TAG: Record<string, string> = {
  重大: 'tag--danger',
  较大: 'tag--warning',
  一般: 'tag--info',
  一级: 'tag--danger',
  二级: 'tag--warning',
  三级: 'tag--info',
};

function levelTag(level: string): string {
  return LEVEL_TAG[level] ?? 'tag--info';
}

function toRow(e: EmergencyEventItem): EventRow {
  return {
    id: String(e.id),
    name: e.title,
    level: e.hazardSourceLevel ?? '',
    time: e.time ?? '—',
    area: e.location ?? '—',
    st: e.statusLabel ?? e.status ?? '—',
  };
}

function timeOf(ts?: string): string {
  if (!ts) return '—';
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return ts;
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

async function load() {
  loading.value = true;
  try {
    const groups = await fetchEmergencyEvents();
    const flat = groups.flatMap((g) => g.events);
    liveEvents.items = flat;
    rows.value = flat.map(toRow);
  } catch {
    rows.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(load);
useDomainAutoRefresh('emergency.event', load, { immediate: false });

function onTap(id: string): void {
  go(`/pages/event-detail/event-detail?id=${id}`);
}
</script>

<template>
  <view class="mb-page">
    <MobileHeader variant="back" title="应急事件" />

    <text v-if="loading" class="mb-loading">加载中…</text>

    <view v-else-if="rows.length === 0" class="mb-empty">
      <text class="mb-empty__text">暂无应急事件</text>
    </view>

    <view v-else class="mb-stack">
      <view v-for="e in rows" :key="e.id" class="mb-card mb-card--link" @click="onTap(e.id)">
        <view class="mb-card__title">
          <text>{{ e.name }}</text>
          <text v-if="e.level" class="tag" :class="levelTag(e.level)">{{ e.level }}</text>
        </view>
        <text class="mb-card__desc">{{ e.id }} · {{ timeOf(e.time) }}</text>
        <text class="mb-card__desc">状态：{{ e.st }} · {{ e.area }}</text>
      </view>
    </view>
  </view>
</template>

<style scoped>
.mb-loading {
  text-align: center;
  color: var(--text-muted-mobile);
  padding: var(--space-lg) 0;
}

.mb-empty {
  padding: var(--mb-empty-pad) var(--mb-pad-x);
  text-align: center;
}

.mb-empty__text {
  font-size: var(--mb-fz-help);
  color: var(--text-muted-mobile);
}

.mb-stack {
  display: flex;
  flex-direction: column;
  gap: var(--mb-card-gap);
  padding: var(--mb-card-gap) var(--mb-pad-x);
}

.mb-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  padding: var(--space-md);
  background: var(--card-mobile);
  border: var(--mb-border-w) solid var(--mb-stroke);
  border-radius: var(--mb-radius-card);
}

.mb-card--link:active {
  opacity: 0.85;
}

.mb-card__title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
  font-size: var(--mb-fz-form-label);
  font-weight: 600;
  color: var(--text-title-mobile);
}

.mb-card__desc {
  margin: 0;
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
.tag--danger {
  background: rgb(245 34 45 / 12%);
  color: var(--danger-mobile);
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
</style>
