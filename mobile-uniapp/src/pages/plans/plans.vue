<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { fetchEmergencyPlanCatalog } from '@/platform/api';
import { go } from '@/platform/nav';
import MobileHeader from '@/components/MobileHeader.vue';
import Icon from '@/components/Icon.vue';

const list = ref<any[]>([]);
const loading = ref(true);
const keyword = ref('');

const filtered = computed(() => {
  const kw = keyword.value.trim().toLowerCase();
  if (!kw) return list.value;
  return list.value.filter(
    (p) =>
      (p.planName ?? '').toLowerCase().includes(kw) || (p.label ?? '').toLowerCase().includes(kw),
  );
});

async function load() {
  loading.value = true;
  try {
    list.value = await fetchEmergencyPlanCatalog();
  } catch (e: any) {
    uni.showToast({ title: e?.message ?? '加载失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
}

function open(id: string | number) {
  go('/plans/' + id);
}

onLoad(load);
</script>

<template>
  <view class="mb-page">
    <MobileHeader variant="back" title="应急预案" subtitle="预案目录查阅" />
    <view class="mb-search">
      <Icon name="search" size="var(--mb-ico-md)" color="var(--mb-muted)" />
      <input
        v-model="keyword"
        class="mb-search__input"
        type="text"
        placeholder="搜索预案名称"
        confirm-type="search"
      />
    </view>

    <view v-if="loading" class="mb-state">加载中…</view>
    <view v-else-if="filtered.length === 0" class="mb-state">暂无预案</view>

    <view v-else class="mb-list">
      <view v-for="p in filtered" :key="p.id" class="mb-card mb-plan" @click="open(p.id)">
        <view class="mb-plan__main">
          <view class="mb-plan__name">
            {{ p.planName }}
            <text v-if="p.isCurrent" class="mb-plan__tag">现行</text>
          </view>
          <view v-if="p.label" class="mb-plan__label">{{ p.label }}</view>
        </view>
        <view class="mb-plan__arrow">›</view>
      </view>
    </view>
  </view>
</template>

<style scoped>
/* 搜索框复用全局 .mb-search（与迁移前一致：浅色描边、贴页面左右边距） */

.mb-state {
  padding: var(--space-lg) var(--mb-pad-x);
  text-align: center;
  color: var(--mb-fz-tip);
}

.mb-list {
  margin: var(--space-md) var(--mb-pad-x);
}

.mb-card {
  background: #fff;
  border-radius: var(--mb-radius-card);
  margin-bottom: var(--space-sm);
}

.mb-plan {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 96rpx;
  padding: var(--space-md);
}

.mb-plan__name {
  font-size: 30rpx;
  font-weight: 600;
}

.mb-plan__tag {
  margin-left: 12rpx;
  padding: 2rpx 12rpx;
  font-size: 20rpx;
  color: #fff;
  background: var(--success-mobile, #2ecc71);
  border-radius: 999rpx;
}

.mb-plan__label {
  font-size: 24rpx;
  color: #666;
  margin-top: 6rpx;
}

.mb-plan__arrow {
  font-size: 44rpx;
  color: #bbb;
}
</style>
