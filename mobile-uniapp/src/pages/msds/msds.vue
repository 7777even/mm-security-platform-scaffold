<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import MobileHeader from '@/components/MobileHeader.vue';
import { fetchMsdsList, type MsdsItem } from '@/platform/api';
import { go } from '@/platform/nav';

const loading = ref(true);
const keyword = ref('');
const all = ref<MsdsItem[]>([]);

const filtered = computed<MsdsItem[]>(() => {
  const k = keyword.value.trim().toLowerCase();
  if (!k) return all.value;
  return all.value.filter(
    (r) => (r.name ?? '').toLowerCase().includes(k) || (r.cas ?? '').toLowerCase().includes(k),
  );
});

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetchMsdsList();
    all.value = res.items ?? [];
  } catch (e: any) {
    uni.showToast({ title: e?.message ?? '加载失败', icon: 'none' });
    all.value = [];
  } finally {
    loading.value = false;
  }
}

function onTap(cas?: string): void {
  if (!cas) return;
  go('/pages/msds-detail/msds-detail?cas=' + encodeURIComponent(cas));
}

onLoad(load);
</script>

<template>
  <view class="mb-page">
    <MobileHeader variant="back" title="MSDS 化学品" subtitle="安全数据表检索" />

    <view class="mb-search">
      <input
        v-model="keyword"
        class="mb-search__input"
        type="text"
        placeholder="按名称 / CAS 号搜索"
        placeholder-class="mb-search__ph"
      />
    </view>

    <text v-if="loading" class="mb-loading">加载中…</text>

    <view v-else-if="filtered.length" class="mb-stack">
      <view
        v-for="r in filtered"
        :key="(r.id as string | number) ?? r.cas"
        class="mb-card mb-card--link"
        @click="onTap(r.cas)"
      >
        <view class="mb-card__row">
          <text class="mb-card__title">{{ r.name || '未命名化学品' }}</text>
          <text class="tag">{{ r.classification || '未知类别' }}</text>
        </view>
        <text class="mb-card__desc">CAS: {{ r.cas || '—' }}</text>
      </view>
    </view>

    <view v-else class="mb-empty">
      <text class="mb-empty__text">未找到化学品</text>
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

.mb-card__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
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

.tag {
  padding: 2rpx 12rpx;
  border-radius: 8rpx;
  font-size: var(--mb-fz-help);
  background: rgb(22 119 255 / 12%);
  color: var(--primary-mobile);
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
