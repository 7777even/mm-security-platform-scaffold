<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import MobileHeader from '../components/MobileHeader.vue';
import {
  fetchAlarmPage,
  type AlarmItem,
  type AlarmLevel,
  type AlarmStatus,
  type AlarmType,
} from '@/services/alarm';
import { liveAlarms } from '../data/liveCache';

// 告警明细（docs/UI规范-移动端.md §5 / §5.1）
// 数据源：后端 /api/v1/alarms（通用告警分页，fac_alarm）——与大屏「地图报警撒点」同源（useScreenAlarmFeed 主 feed，含 /ws/alarm 实时增量）。
// 口径说明（2026-09-16 定）：**不**对齐大屏「安全报警面板」与管理端「报警记录」——那两处读 /fire-alarms（fac_fire_alarm，消防专项记录）。
// 依据：本页要展示五类告警（消防/气体/温度/视频AI/SOS）+ 来源设备编码，只有 fac_alarm 具备 type 与 device_code 字段；
// fac_fire_alarm 无五类 type、无设备编码，且全为消防记录（含误报标记/关联灭火事件），换过去会丢两类字段与 10 条非消防告警。
// 取消原 data/mock.ts 静态数据；未连后端由 service 内部走空态 + 全局离线告警（不回灌假数据）。
// - 筛选 chip 热区 48，等级 / 状态着色只用规范 §8 枚举映射，禁止自造色阶

interface AlarmRow {
  id: string;
  name: string;
  level: string;
  levelTag: string;
  type: string;
  time: string;
  area: string;
  src: string;
  desc: string;
  st: string;
  stTag: string;
}

const loading = ref(false);
const rows = ref<AlarmRow[]>([]);
const filter = ref<string>('全部');

/** 报警等级（1-4）→ 中文标签 + 标签类（一级红 / 二三级橙 / 四级主蓝） */
const LEVEL_LABEL: Record<AlarmLevel, string> = { 1: '一级', 2: '二级', 3: '三级', 4: '四级' };
const LEVEL_TAG: Record<AlarmLevel, string> = {
  1: 'tag--danger',
  2: 'tag--warning',
  3: 'tag--warning',
  4: 'tag--info',
};

/** 报警类型 → 中文标签 */
const TYPE_LABEL: Record<AlarmType, string> = {
  FIRE: '消防报警',
  GAS: '气体报警',
  TEMP: '温度报警',
  CCTV: '视频AI',
  SOS: 'SOS 求助',
};

/** 处置状态 → 中文标签 + 标签类 */
const STATUS_LABEL: Record<AlarmStatus, string> = {
  ACTIVE: '未确认',
  ACKED: '已确认',
  DISPATCHED: '已派发',
  CLOSED: '已关闭',
};
const STATUS_TAG: Record<AlarmStatus, string> = {
  ACTIVE: 'tag--danger',
  ACKED: 'tag--warning',
  DISPATCHED: 'tag--warning',
  CLOSED: 'tag--success',
};

/** 报警时间：后端 ts 为 ISO 8601，按 mgmt 告警记录同口径格式化为本地 YYYY-MM-DD HH:mm。 */
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
    level: LEVEL_LABEL[a.level] ?? `等级 ${a.level}`,
    levelTag: LEVEL_TAG[a.level] ?? 'tag--info',
    type: TYPE_LABEL[a.type] ?? a.type,
    time: formatTs(a.ts),
    area: a.location,
    src: a.deviceCode,
    desc: a.description,
    st: STATUS_LABEL[a.status] ?? a.status,
    stTag: STATUS_TAG[a.status] ?? 'tag--info',
  };
}

/** 筛选 chip 由真实数据去重得到（全部 + 实际出现的类型），保证筛选可用。 */
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
    // service 内部已处理 offline / 失败：保持空态
    rows.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="mb-page">
    <MobileHeader variant="back" title="告警明细" back-to="/home" />

    <p v-if="loading" class="mb-loading">加载中…</p>

    <div v-else-if="rows.length === 0" class="mb-empty">
      <div class="mb-empty__art" />
      <p class="mb-empty__text">暂无告警</p>
    </div>

    <template v-else>
      <div class="mb-chips" role="tablist" aria-label="告警类型筛选">
        <button
          v-for="c in CHIPS"
          :key="c"
          type="button"
          class="mb-chip"
          :class="{ 'mb-chip--on': filter === c }"
          role="tab"
          :aria-selected="filter === c"
          @click="filter = c"
        >
          {{ c }}
        </button>
      </div>

      <div v-if="list.length > 0" class="mb-stack">
        <RouterLink
          v-for="a in list"
          :key="a.id"
          class="mb-card mb-card--link"
          :to="`/alarms/${a.id}`"
        >
          <div class="mb-card__title">
            <span>{{ a.name }}</span>
            <span class="tag" :class="a.levelTag">{{ a.level }}</span>
          </div>
          <p class="mb-card__desc">{{ a.id }} · {{ a.time }} · {{ a.area }}</p>
          <p class="mb-card__desc">
            状态：<span class="tag" :class="a.stTag">{{ a.st }}</span> · {{ a.type }}
          </p>
        </RouterLink>
      </div>

      <div v-else class="mb-empty">
        <div class="mb-empty__art" />
        <p class="mb-empty__text">当前筛选下暂无告警</p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.mb-loading {
  text-align: center;
  color: var(--mb-muted);
  padding: var(--space-lg) 0;
}
</style>
