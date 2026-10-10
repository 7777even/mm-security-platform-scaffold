<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import MobileHeader from '@/components/MobileHeader.vue';
import IconTile from '@/components/IconTile.vue';
import { fetchEmergencyKnowledge } from '@/platform/api';

interface KnowledgeRow {
  id: string | number;
  title: string;
  count: number;
}

const loading = ref(true);
const keyword = ref('');
const all = ref<KnowledgeRow[]>([]);

const filtered = computed<KnowledgeRow[]>(() => {
  const k = keyword.value.trim().toLowerCase();
  if (!k) return all.value;
  return all.value.filter((r) => r.title.toLowerCase().includes(k));
});

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetchEmergencyKnowledge();
    all.value = (res as any[]).map((it: any) => ({
      id: it.id,
      title: it.title ?? '未命名分类',
      count: it.count ?? 0,
    }));
  } catch (e: any) {
    uni.showToast({ title: e?.message ?? '加载失败', icon: 'none' });
    all.value = [];
  } finally {
    loading.value = false;
  }
}

onLoad(load);
</script>

<template>
  <view class="mb-page">
    <MobileHeader variant="back" title="资料库" subtitle="应急知识分类" />

    <view class="mb-search">
      <input
        v-model="keyword"
        class="mb-search__input"
        type="text"
        placeholder="搜索分类名称"
        placeholder-class="mb-search__ph"
      />
    </view>

    <text v-if="loading" class="mb-loading">加载中…</text>

    <view v-else-if="filtered.length" class="mb-stack">
      <view v-for="r in filtered" :key="r.id" class="mb-card">
        <IconTile name="book" tone="indigo" />
        <view class="mb-card__text">
          <text class="mb-card__title">{{ r.title }}</text>
          <text class="mb-card__desc">资料 {{ r.count }} 篇</text>
        </view>
      </view>
    </view>

    <view v-else class="mb-empty">
      <text class="mb-empty__text">暂无资料分类</text>
    </view>
  </view>
</template>

<style scoped>
.mb-search {
  padding: var(--space-md) var(--mb-pad-x) 0;
}

.mb-search__input {
  width: 100%;
  min-height: 80rpx;
  padding: 0 var(--space-md);
  background: var(--card-mobile);
  border: var(--mb-border-w) solid var(--mb-stroke);
  border-radius: var(--mb-radius-ctrl);
  font-size: var(--mb-fz-form-label);
  color: var(--text-title-mobile);
}

.mb-search__ph {
  color: var(--text-muted-mobile);
}

.mb-loading {
  text-align: center;
  color: var(--text-muted-mobile);
  padding: var(--space-lg) 0;
}

.mb-stack {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding: var(--space-md) var(--mb-pad-x);
}

.mb-card {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md);
  background: var(--card-mobile);
  border: var(--mb-border-w) solid var(--mb-stroke);
  border-radius: var(--mb-radius-card);
}

.mb-card__text {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.mb-card__title {
  font-size: var(--mb-fz-form-label);
  font-weight: 600;
  color: var(--text-title-mobile);
}

.mb-card__desc {
  font-size: var(--mb-fz-tip);
  color: var(--text-muted-mobile);
}

.mb-empty {
  padding: var(--mb-empty-pad) var(--mb-pad-x);
  text-align: center;
}

.mb-empty__text {
  font-size: var(--mb-fz-help);
  color: var(--text-muted-mobile);
}
</style>
