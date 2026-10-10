<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import MobileHeader from '@/components/MobileHeader.vue';
import {
  fetchAlarmPage,
  type AlarmItem,
  type AlarmLevel,
  type AlarmStatus,
  type AlarmType,
} from '@/platform/api';
import { useDomainAutoRefresh } from '@/composables/useDomainAutoRefresh';
import { liveAlarms } from '@/data/liveCache';
import { go } from '@/platform/nav';

// 告警明细（docs/UI规范-移动端.md §5 / §5.1）。数据源：后端 /api/v1/alarms（通用告警分页，fac_alarm）。
interface AlarmRow {
  id: string;
  name: string;
  level: string;
  levelTag: string;
  type: string;
  time: string;
  area: string;
  st: string;
  stTag: string;
}

const loading = ref(false);
const rows = ref<AlarmRow[]>([]);
const filter = ref<string>('全部');

const LEVEL_LABEL: Record<number, string> = { 1: '一级', 2: '二级', 3: '三级', 4: '四级' };
const LEVEL_TAG: Record<number, string> = {
  1: 'tag--danger',
  2: 'tag--warning',
  3: 'tag--warning',
  4: 'tag--info',
};
const TYPE_LABEL: Record<string, string> = {
  FIRE: '消防报警',
  GAS: '气体报警',
  TEMP: '温度报警',
  CCTV: '视频AI',
  SOS: 'SOS 求助',
};
const STATUS_LABEL: Record<string, string> = {
  ACTIVE: '未确认',
  ACKED: '已确认',
  DISPATCHED: '已派发',
  CLOSED: '已关闭',
};
const STATUS_TAG: Record<string, string> = {
  ACTIVE: 'tag--danger',
  ACKED: 'tag--warning',
  DISPATCHED: 'tag--warning',
  CLOSED: 'tag--success',
};

function formatTs(ts?: string): string {
  if (!ts) return '—';
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return ts;
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function toRow(a: AlarmItem): AlarmRow {
  return {
    id: a.alarmId,
    name: a.title ?? a.description ?? a.alarmId,
    level: LEVEL_LABEL[a.level as AlarmLevel] ?? `等级 ${a.level}`,
    levelTag: LEVEL_TAG[a.level as AlarmLevel] ?? 'tag--info',
    type: TYPE_LABEL[a.type as AlarmType] ?? a.type,
    time: formatTs(a.ts),
    area: a.location ?? '—',
    st: STATUS_LABEL[a.status as AlarmStatus] ?? a.status,
    stTag: STATUS_TAG[a.status as AlarmStatus] ?? 'tag--info',
  };
}

const CHIPS = computed(() => ['全部', ...Array.from(new Set(rows.value.map((r) => r.type)))]);
const list = computed(() =>
  filter.value === '全部' ? rows.value : rows.value.filter((a) => a.type === filter.value),
);

async function load() {
  loading.value = true;
  try {
    const res = await fetchAlarmPage(1, 50);
    liveAlarms.items = res.list;
    rows.value = res.list.map(toRow);
  } catch {
    rows.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(load);
useDomainAutoRefresh('alarm', load, { immediate: false });

function onTap(id: string): void {
  go(`/pages/alarm-detail/alarm-detail?id=${id}`);
}
</script>

<template>
  <view class="mb-page">
    <MobileHeader variant="back" title="告警明细" />

    <text v-if="loading" class="mb-loading">加载中…</text>

    <view v-else-if="rows.length === 0" class="mb-empty">
      <text class="mb-empty__text">暂无告警</text>
    </view>

    <template v-else>
      <view class="mb-chips">
        <view
          v-for="c in CHIPS"
          :key="c"
          class="mb-chip"
          :class="{ 'mb-chip--on': filter === c }"
          @click="filter = c"
        >
          {{ c }}
        </view>
      </view>

      <view v-if="list.length > 0" class="mb-stack">
        <view v-for="a in list" :key="a.id" class="mb-card mb-card--link" @click="onTap(a.id)">
          <view class="mb-card__title">
            <text>{{ a.name }}</text>
            <text class="tag" :class="a.levelTag">{{ a.level }}</text>
          </view>
          <text class="mb-card__desc">{{ a.id }} · {{ a.time }} · {{ a.area }}</text>
          <text class="mb-card__desc"
            >状态：<text class="tag" :class="a.stTag">{{ a.st }}</text> · {{ a.type }}</text
          >
        </view>
      </view>

      <view v-else class="mb-empty">
        <text class="mb-empty__text">当前筛选下暂无告警</text>
      </view>
    </template>
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

.mb-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--mb-pad-x);
}

.mb-chip {
  padding: 6rpx 24rpx;
  font-size: var(--mb-fz-tip);
  color: var(--text-muted-mobile);
  background: #eef1f6;
  border-radius: 999rpx;
}

.mb-chip--on {
  color: #fff;
  background: var(--primary-mobile);
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
