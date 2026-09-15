<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import MobileHeader from '../components/MobileHeader.vue';
import { fetchEmergencyEvents, type EmergencyEventItem } from '@/services/emergencyEvent';
import { isOfflineNoBackend, notifyBackendOffline } from '@/services/backendFallback';
import { liveEvents } from '../data/liveCache';

/**
 * 应急事件列表（docs/UI规范-移动端.md §5）
 *
 * 数据源：后端 /api/v1/emergency-events（消防 / 先期处置事件分组），经 fetchEmergencyEvents
 * 拉取后拍平为列表。取消原 data/mock.ts 静态数据；未连后端时走空态 + 全局离线告警（不回灌假数据）。
 */
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

async function load() {
  loading.value = true;
  try {
    if (isOfflineNoBackend()) {
      notifyBackendOffline('emergency-event', '/emergency-events');
      rows.value = [];
      return;
    }
    const groups = await fetchEmergencyEvents();
    const flat = groups.flatMap((g) => g.events);
    liveEvents.items = flat;
    rows.value = flat.map(toRow);
  } catch {
    // 离线 / 请求失败：保持空态（http 层已弹全局 toast）
    rows.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="mb-page">
    <MobileHeader variant="back" title="应急事件" back-to="/home" />

    <p v-if="loading" class="mb-loading">加载中…</p>

    <div v-else-if="rows.length === 0" class="mb-empty">
      <div class="mb-empty__art" />
      <p class="mb-empty__text">暂无应急事件</p>
    </div>

    <div v-else class="mb-stack">
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
    </div>
  </div>
</template>

<style scoped>
.mb-loading {
  text-align: center;
  color: var(--mb-muted);
  padding: var(--space-lg) 0;
}
</style>
