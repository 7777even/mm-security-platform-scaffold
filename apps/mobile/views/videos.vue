<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import MobileHeader from '../components/MobileHeader.vue';
import Icon from '../components/Icon.vue';
import { fetchVideoCameras, type VideoCameraItem } from '@/services/video';
import { isOfflineNoBackend, notifyBackendOffline } from '@/services/backendFallback';

// 视频监控（宫格页模板，docs/UI规范-移动端.md §5）
// - 数据源：后端 /api/v1/video/cameras（摄像头分页网格），经 fetchVideoCameras 拉取。
//   取消原 data/mock.ts 静态数据；未连后端走空态 + 全局离线告警（不回灌假数据）。
// - 区域 chips 由后端返回点位位置派生（原为硬编码常量）。
// - 点位状态只用 .tag--success / --danger 两档，禁止自造色阶。

interface Cam {
  id: string;
  name: string;
  area: string;
  type: string;
  st: string;
  ai: boolean;
}

const loading = ref(false);
const list = ref<Cam[]>([]);
const filter = ref<string>('全部');

function toRow(c: VideoCameraItem): Cam {
  const online = c.status === 'live' || c.status === 'ai';
  return {
    id: String(c.id),
    name: c.name,
    area: c.location,
    type: c.cameraType,
    st: online ? '在线' : '离线',
    ai: c.status === 'ai',
  };
}

async function load(): Promise<void> {
  loading.value = true;
  try {
    if (isOfflineNoBackend()) {
      notifyBackendOffline('video', '/video/cameras');
      list.value = [];
      return;
    }
    const page = await fetchVideoCameras(1, 100);
    list.value = (page.list ?? []).map(toRow);
  } catch {
    list.value = [];
  } finally {
    loading.value = false;
  }
}

const chips = computed(() => ['全部', ...new Set(list.value.map((c) => c.area).filter(Boolean))]);

const filtered = computed(() =>
  filter.value === '全部' ? list.value : list.value.filter((c) => c.area === filter.value),
);

/** 点位状态 → 标签类（在线绿 / 离线红） */
const STATUS_TAG: Record<string, string> = {
  在线: 'tag--success',
  离线: 'tag--danger',
};

onMounted(load);
</script>

<template>
  <div class="mb-page">
    <MobileHeader variant="back" title="视频监控" back-to="/home" />

    <div class="mb-chips" role="tablist" aria-label="视频点位区域筛选">
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

    <div v-else-if="filtered.length > 0" class="mb-video-grid">
      <RouterLink v-for="c in filtered" :key="c.id" class="mb-video" :to="`/videos/${c.id}`">
        <div class="mb-video__thumb">
          <Icon name="play" size="var(--mb-ico-play)" />
        </div>
        <div class="video__head">
          <span class="mb-video__name">{{ c.name }}</span>
          <span class="tag" :class="STATUS_TAG[c.st] ?? 'tag--info'"
            >{{ c.st }}{{ c.ai ? ' · AI' : '' }}</span
          >
        </div>
        <p class="video__meta">{{ c.id }} · {{ c.type }}</p>
      </RouterLink>
    </div>

    <div v-else class="mb-empty">
      <div class="mb-empty__art" />
      <p class="mb-empty__text">当前筛选下暂无视频点位</p>
    </div>
  </div>
</template>

<style scoped>
.video__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-xs);
}

.video__meta {
  margin: 0;
  font-size: var(--mb-fz-tip);
  color: var(--mb-body);
}

.mb-loading {
  text-align: center;
  color: var(--mb-muted);
  padding: var(--space-lg) 0;
}
</style>
