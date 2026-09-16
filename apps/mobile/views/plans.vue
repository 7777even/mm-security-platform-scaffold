<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import MobileHeader from '../components/MobileHeader.vue';
import Icon from '../components/Icon.vue';
import { fetchEmergencyPlanCatalog } from '@/services/emergencyPlan';

// 应急预案（列表页模板，docs/UI规范-移动端.md §5）
// 数据源：后端 /api/v1/emergency-plans/catalog（应急预案目录，4 行层级），
// 经 fetchEmergencyPlanCatalog 拉取。取消原 data/mock.ts 静态数据；未连后端回落空态（零下行控制）。
// - 编号标签用 .tag--info，状态/等级着色不在此页出现，禁止自造色阶。

interface PlanRow {
  id: string;
  name: string;
  label: string;
  current: boolean;
}

const loading = ref(false);
const keyword = ref('');
const list = ref<PlanRow[]>([]);

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetchEmergencyPlanCatalog();
    list.value = (res.items ?? []).map((it) => ({
      id: it.id,
      name: it.planName || it.label,
      label: it.label,
      current: it.isCurrent,
    }));
  } catch {
    list.value = [];
  } finally {
    loading.value = false;
  }
}

const filtered = computed(() => {
  const kw = keyword.value.trim();
  if (!kw) return list.value;
  return list.value.filter((p) => p.name.includes(kw) || p.id.includes(kw));
});

onMounted(load);
</script>

<template>
  <div class="mb-page">
    <MobileHeader variant="back" title="应急预案" back-to="/home" />

    <input v-model="keyword" class="mb-input plan__search" placeholder="搜索预案名称 / 编号" />

    <p v-if="loading" class="mb-loading">加载中…</p>

    <div v-else-if="filtered.length > 0" class="mb-stack">
      <RouterLink
        v-for="p in filtered"
        :key="p.id"
        class="mb-card mb-card--link"
        :to="`/plans/${p.id}`"
      >
        <div class="mb-card__title">
          <span class="plan__name">
            <Icon name="plan" size="var(--mb-ico-sm)" />
            {{ p.name }}
          </span>
          <span class="tag tag--info">{{ p.id }}</span>
        </div>
        <p class="mb-card__desc">层级：{{ p.label }}{{ p.current ? ' · 当前预案' : '' }}</p>
      </RouterLink>
    </div>

    <div v-else class="mb-empty">
      <div class="mb-empty__art" />
      <p class="mb-empty__text">未匹配到相关预案</p>
    </div>
  </div>
</template>

<style scoped>
.plan__search {
  margin-bottom: var(--mb-card-gap);
}

.plan__name {
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
