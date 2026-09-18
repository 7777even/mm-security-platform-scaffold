<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import MobileHeader from '../components/MobileHeader.vue';
import { fetchEmergencyEvents, type EmergencyEventItem } from '@/services/emergencyEvent';
import { isOfflineNoBackend, notifyBackendOffline } from '@/services/backendFallback';
import { liveEvents } from '../data/liveCache';
import { useDomainAutoRefresh } from '@/composables/useDomainAutoRefresh';
import {
  fetchEmergencyCommandGroups,
  type EmergencyCommandGroup,
  type EmergencyCommandInstructionStatus,
} from '@/services/emergency';
import { fetchEmergencyCommandRecords } from '@/services/businessWrite';
import type { EmergencyCommandRecordView } from '@/services/businessWrite';

/**
 * 应急事件 / 应急指令（docs/UI规范-移动端.md §5）
 *
 * 合并说明：应急指令（管理端 R1 写侧下发的指令）与应急事件同属「应急」主题，
 * 不再单开一页，统一收进本页，用顶部分段切换 [应急事件 | 应急指令] 切换。
 * - 应急事件：后端 /api/v1/emergency-events（消防 / 先期处置事件分组）。
 * - 应急指令：后端 /api/v1/emergency/commands（fac_emergency_cmd 模板 + fac_emergency_command_record
 *   留痕合并），与管理端「应急指令管理」下发、大屏「应急响应」面板同源；
 *   「流转留痕」读 /api/v1/emergency/command-records（与下发写侧同一张表）。
 * 未连后端均走空态 + 全局离线告警（不回灌假数据）。
 */
type Tab = 'events' | 'commands';

const tab = ref<Tab>('events');

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

// 应急指令数据
const STATUS_TAG: Record<EmergencyCommandInstructionStatus, string> = {
  待处置: 'tag--warning',
  待派发: 'tag--info',
  已处置: 'tag--success',
};
const groups = ref<EmergencyCommandGroup[]>([]);
const records = ref<EmergencyCommandRecordView[]>([]);

/** 危险源等级 → 标签类（重大/较大/一般 + 一级/二级/三级 兼容）。 */
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
    time: e.time,
    area: e.location,
    st: e.statusLabel,
  };
}

/** ISO 8601 → MM-DD HH:mm（移动端留痕时间口径）。 */
function timeOf(ts?: string): string {
  if (!ts) return '—';
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return ts;
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

async function loadEvents() {
  if (isOfflineNoBackend()) {
    notifyBackendOffline('emergency-event', '/emergency-events');
    rows.value = [];
    return;
  }
  try {
    const evGroups = await fetchEmergencyEvents();
    const flat = evGroups.flatMap((g) => g.events);
    liveEvents.items = flat;
    rows.value = flat.map(toRow);
  } catch {
    // 离线 / 请求失败：保持空态（http 层已弹全局 toast）
    rows.value = [];
  }
}

async function loadCommands() {
  try {
    // 留痕失败时内部已告警并返回空数组（不抛错），与指令分组并列拉取不影响主数据。
    const [gs, rs] = await Promise.all([
      fetchEmergencyCommandGroups(),
      fetchEmergencyCommandRecords(),
    ]);
    groups.value = gs;
    records.value = rs.slice(0, 5);
  } catch {
    groups.value = [];
    records.value = [];
  }
}

async function load() {
  loading.value = true;
  try {
    await Promise.all([loadEvents(), loadCommands()]);
  } finally {
    loading.value = false;
  }
}

onMounted(load);

// 三端实时刷新：管理端 / 大屏下发应急指令，指令 tab 自动重拉（realtime-channel spec）
useDomainAutoRefresh('emergency.command', () => void loadCommands(), { immediate: false });
</script>

<template>
  <div class="mb-page">
    <MobileHeader variant="back" title="应急事件" back-to="/home" />

    <!-- 分段切换：应急事件 / 应急指令（同属「应急」主题，不再单开一页） -->
    <div class="seg">
      <button
        type="button"
        class="mb-chip"
        :class="{ 'mb-chip--on': tab === 'events' }"
        @click="tab = 'events'"
      >
        应急事件
      </button>
      <button
        type="button"
        class="mb-chip"
        :class="{ 'mb-chip--on': tab === 'commands' }"
        @click="tab = 'commands'"
      >
        应急指令
      </button>
    </div>

    <p v-if="loading" class="mb-loading">加载中…</p>

    <template v-else>
      <!-- 应急事件 -->
      <div v-if="tab === 'events'" class="mb-stack">
        <div v-if="rows.length === 0" class="mb-empty">
          <div class="mb-empty__art" />
          <p class="mb-empty__text">暂无应急事件</p>
        </div>

        <template v-else>
          <RouterLink
            v-for="e in rows"
            :key="e.id"
            class="mb-card mb-card--link"
            :to="`/events/${e.id}`"
          >
            <div class="mb-card__title">
              <span>{{ e.name }}</span>
              <span v-if="e.level" class="tag" :class="levelTag(e.level)">{{ e.level }}</span>
            </div>
            <p class="mb-card__desc">{{ e.id }} · {{ e.time }}</p>
            <p class="mb-card__desc">状态：{{ e.st }} · {{ e.area }}</p>
          </RouterLink>
        </template>
      </div>

      <!-- 应急指令 -->
      <div v-else class="mb-stack">
        <template v-if="groups.length">
          <section v-for="g in groups" :key="g.id" class="cmd-group">
            <h2 class="mb-section__title cmd-group__title">{{ g.label }}</h2>
            <div v-for="item in g.items" :key="item.id" class="mb-card">
              <div class="mb-card__title">
                <span>{{ item.name }}</span>
                <span class="tag" :class="STATUS_TAG[item.status] ?? 'tag--info'">
                  {{ item.status }}
                </span>
              </div>
              <p class="mb-card__desc">{{ item.type }} · {{ item.location }}</p>
            </div>
          </section>
        </template>

        <div v-else class="mb-empty">
          <div class="mb-empty__art" />
          <p class="mb-empty__text">暂无应急指令</p>
        </div>

        <template v-if="records.length">
          <h2 class="mb-section__title cmd-group__title">流转留痕</h2>
          <div v-for="(r, i) in records" :key="r.id ?? i" class="mb-card">
            <div class="mb-card__title">
              <span>{{ r.commandName || r.commandCode }}</span>
              <span class="tag tag--info">{{ r.currStatus || '—' }}</span>
            </div>
            <p class="mb-card__desc">
              {{ timeOf(r.createdAt) }}
              {{ r.prevStatus ? `· ${r.prevStatus} → ${r.currStatus}` : '' }}
            </p>
          </div>
        </template>
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

/* 分段切换（复用全局 mb-chip 风格，与消息筛选一致） */
.seg {
  display: flex;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--mb-pad-x) 0;
}

.cmd-group__title {
  margin: var(--space-md) 0 0;
}

.cmd-group {
  display: block;
}
</style>
