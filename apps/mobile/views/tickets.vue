<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import MobileHeader from '../components/MobileHeader.vue';
import { fetchSpecialOperations, type SpecialOperationItem } from '@/services/specialOperation';
import { isOfflineNoBackend, notifyBackendOffline } from '@/services/backendFallback';

// 操作票（列表页模板，docs/UI规范-移动端.md §5 / §5.1）
// - 数据源：后端 /api/v1/special-operations（特殊作业票分页），经 fetchSpecialOperations 拉取。
//   取消原 data/mock.ts 静态数据；未连后端走空态 + 全局离线告警（不回灌假数据）。
// - 票级只作标识（A/B 级），不参与等级色阶，故统一 .tag--info。

interface TicketItem {
  id: number;
  name: string;
  range: string;
  grade: string;
  st: string;
}

const loading = ref(false);
const list = ref<TicketItem[]>([]);

function toItem(o: SpecialOperationItem): TicketItem {
  return {
    id: o.id,
    name: o.content || `${o.area} · ${o.type}`,
    range: o.timeRange,
    grade: o.level,
    st: o.status,
  };
}

async function load(): Promise<void> {
  loading.value = true;
  try {
    if (isOfflineNoBackend()) {
      notifyBackendOffline('special-operation', '/special-operations');
      list.value = [];
      return;
    }
    const page = await fetchSpecialOperations({ page: 1, size: 50 });
    list.value = (page.list ?? []).map(toItem);
  } catch {
    list.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="mb-page">
    <MobileHeader variant="back" title="操作票" back-to="/home" />

    <p v-if="loading" class="mb-loading">加载中…</p>

    <div v-else-if="list.length" class="mb-stack">
      <RouterLink v-for="t in list" :key="t.id" class="mb-card mb-card--link" to="/ticket-exec">
        <div class="mb-card__title">
          <span>{{ t.name }}</span>
          <span v-if="t.grade" class="tag tag--info">{{ t.grade }}级</span>
        </div>
        <p class="mb-card__desc">{{ t.range }} · {{ t.st }}</p>
      </RouterLink>
    </div>

    <div v-else class="mb-empty">
      <div class="mb-empty__art" />
      <p class="mb-empty__text">暂无操作票</p>
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
