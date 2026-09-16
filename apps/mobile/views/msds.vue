<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import MobileHeader from '../components/MobileHeader.vue';
import Icon from '../components/Icon.vue';
import { fetchMsdsList } from '@/services/msds';
import { isOfflineNoBackend, notifyBackendOffline } from '@/services/backendFallback';

// 危化品 MSDS 检索（列表页模板，docs/UI规范-移动端.md §5 / §5.1）
// 数据源：后端 /api/v1/msds（化学品 MSDS），经 fetchMsdsList 拉取，取代原 data/mock.ts 静态数据。
// - 搜索框沿用 .mb-input；危化品分类只用 .tag--warning，禁止自造色阶。

interface MsdsRow {
  id: number;
  name: string;
  cas: string;
  clsShort: string;
}

const loading = ref(false);
const keyword = ref('');
const list = ref<MsdsRow[]>([]);

async function load(): Promise<void> {
  loading.value = true;
  try {
    if (isOfflineNoBackend()) {
      notifyBackendOffline('msds', '/msds');
      list.value = [];
      return;
    }
    const res = await fetchMsdsList();
    list.value = (res.items ?? []).map((m) => ({
      id: m.id,
      name: m.name,
      cas: m.cas,
      clsShort: (m.classification ?? '').split('/')[0],
    }));
  } catch {
    list.value = [];
  } finally {
    loading.value = false;
  }
}

/** 按名称 / CAS 号模糊检索（空关键字返回全量） */
const filtered = computed(() => {
  const kw = keyword.value.trim().toLowerCase();
  if (!kw) return list.value;
  return list.value.filter((m) => m.name.toLowerCase().includes(kw) || m.cas.includes(kw));
});

onMounted(load);
</script>

<template>
  <div class="mb-page">
    <MobileHeader variant="back" title="化学品知识 MSDS" back-to="/profile" />

    <input v-model="keyword" class="mb-input msds-search" placeholder="搜索名称 / CAS 号" />

    <p v-if="loading" class="mb-loading">加载中…</p>

    <div v-else-if="filtered.length > 0" class="mb-stack">
      <RouterLink
        v-for="m in filtered"
        :key="m.cas"
        class="mb-card mb-card--link"
        :to="`/msds/${m.cas}`"
      >
        <div class="mb-card__title">
          <span class="msds-name">
            <Icon name="flask" size="var(--mb-ico-sm)" mono />
            {{ m.name }}
          </span>
          <span v-if="m.clsShort" class="tag tag--warning">{{ m.clsShort }}</span>
        </div>
        <p class="mb-card__desc">CAS：{{ m.cas }}</p>
      </RouterLink>
    </div>

    <div v-else class="mb-empty">
      <div class="mb-empty__art" />
      <p class="mb-empty__text">未找到匹配的化学品</p>
    </div>
  </div>
</template>

<style scoped>
.msds-search {
  margin-bottom: var(--mb-card-gap);
}

/* 标题左侧「图标 + 名称」：图标随正文色，间距由 token 控制 */
.msds-name {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  min-width: 0;
}

.mb-loading {
  text-align: center;
  color: var(--mb-muted);
  padding: var(--space-lg) 0;
}
</style>
