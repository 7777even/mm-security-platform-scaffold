<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import MobileHeader from '../components/MobileHeader.vue';
import Icon from '../components/Icon.vue';
import { fetchDrills } from '@/services/drill';
import { isOfflineNoBackend, notifyBackendOffline } from '@/services/backendFallback';

// 演练信息（列表页模板，docs/UI规范-移动端.md §5 / §5.1）
// 数据源：后端 /api/v1/drills（应急演练），经 fetchDrills 拉取，取代原 data/mock.ts 静态数据。
// - 筛选 chip 由后端状态派生（原为硬编码常量）；热区 48。
// - 演练状态只用 .tag--danger / --info / --success 三档，禁止自造色阶。

interface DrillRow {
  id: number;
  code: string;
  name: string;
  st: string;
  time: string;
  place: string;
  taskCount: number;
}

const STATUS_TAG: Record<string, string> = {
  进行中: 'tag--danger',
  计划中: 'tag--info',
  已结束: 'tag--success',
};

const loading = ref(false);
const list = ref<DrillRow[]>([]);
const filter = ref<string>('全部');

async function load(): Promise<void> {
  loading.value = true;
  try {
    if (isOfflineNoBackend()) {
      notifyBackendOffline('drills', '/drills');
      list.value = [];
      return;
    }
    const res = await fetchDrills();
    list.value = (res.items ?? []).map((d) => ({
      id: d.id,
      code: d.drillCode,
      name: d.name,
      st: d.status,
      time: d.timeRange,
      place: d.place,
      taskCount: d.taskCount,
    }));
  } catch {
    list.value = [];
  } finally {
    loading.value = false;
  }
}

const chips = computed(() => ['全部', ...new Set(list.value.map((d) => d.st).filter(Boolean))]);

const filtered = computed(() =>
  filter.value === '全部' ? list.value : list.value.filter((d) => d.st === filter.value),
);

onMounted(load);
</script>

<template>
  <div class="mb-page">
    <MobileHeader variant="back" title="演练信息" back-to="/home" />

    <div class="mb-chips" role="tablist" aria-label="演练状态筛选">
      <button
        v-for="c in chips"
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

    <p v-if="loading" class="mb-loading">加载中…</p>

    <div v-else-if="filtered.length > 0" class="mb-stack">
      <RouterLink
        v-for="d in filtered"
        :key="d.id"
        class="mb-card mb-card--link"
        :to="`/drills/${d.id}`"
      >
        <div class="mb-card__title">
          <span class="drill__name">
            <Icon name="drill" size="var(--mb-ico-sm)" />
            {{ d.name }}
          </span>
          <span class="tag" :class="STATUS_TAG[d.st] ?? 'tag--info'">{{ d.st }}</span>
        </div>
        <p class="mb-card__desc">{{ d.code }} · {{ d.time }}</p>
        <p class="mb-card__desc">{{ d.place }} · 我的任务：{{ d.taskCount }} 项</p>
      </RouterLink>
    </div>

    <div v-else class="mb-empty">
      <div class="mb-empty__art" />
      <p class="mb-empty__text">当前筛选下暂无演练</p>
    </div>
  </div>
</template>

<style scoped>
.drill__name {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
}

.mb-loading {
  text-align: center;
  color: var(--mb-muted);
  padding: var(--space-lg) 0;
}
</style>
