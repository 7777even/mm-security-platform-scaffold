<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { fetchSpecialOperations } from '@/platform/api';
import { go } from '@/platform/nav';
import MobileHeader from '@/components/MobileHeader.vue';
import IconTile from '@/components/IconTile.vue';

const list = ref<any[]>([]);
const loading = ref(true);
const levelFilter = ref<string>('全部');

const levels = computed(() => [
  '全部',
  ...Array.from(new Set(list.value.map((t) => t.level).filter(Boolean))),
]);
const filtered = computed(() =>
  list.value.filter((t) => levelFilter.value === '全部' || t.level === levelFilter.value),
);

async function load() {
  loading.value = true;
  try {
    const res = await fetchSpecialOperations(1, 50);
    list.value = res.list ?? [];
  } catch (e: any) {
    uni.showToast({ title: e?.message ?? '加载失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
}
onLoad(load);
</script>

<template>
  <view class="mb-page">
    <MobileHeader variant="brand" title="操作票" subtitle="特种作业操作票" />
    <scroll-view scroll-x class="chip-row">
      <view
        v-for="l in levels"
        :key="l"
        class="chip"
        :class="{ active: levelFilter === l }"
        @click="levelFilter = l"
        >{{ l }}</view
      >
    </scroll-view>

    <view v-if="loading" class="state">加载中…</view>
    <view v-else-if="filtered.length === 0" class="state">暂无操作票</view>
    <view v-else class="list">
      <view v-for="t in filtered" :key="t.id" class="card" @click="go('/ticket-exec')">
        <IconTile name="ops" tone="orange" />
        <view class="card-body">
          <view class="title">{{ t.content || '—' }}</view>
          <view class="meta"
            >{{ t.area || '—' }} · {{ t.type || '—' }} · 等级 {{ t.level || '—' }}</view
          >
          <view class="meta status">{{ t.status || '—' }} · {{ t.timeRange || '—' }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.chip-row {
  padding: var(--mb-pad-x);
  white-space: nowrap;
}

.chip {
  display: inline-block;
  min-height: 56rpx;
  line-height: 56rpx;
  padding: 0 24rpx;
  margin-right: 16rpx;
  border-radius: 999rpx;
  background: #fff;
  color: var(--mb-body);
  font-size: 26rpx;
  border: 1rpx solid rgb(0 0 0 / 8%);
}

.chip.active {
  background: var(--warning-mobile);
  color: #fff;
}

.state {
  text-align: center;
  padding: 80rpx 0;
  color: rgb(0 0 0 / 45%);
}

.list {
  padding: 0 var(--mb-pad-x) var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.card {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  background: #fff;
  border-radius: var(--mb-radius-card);
  min-height: 96rpx;
}

.card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.title {
  font-size: 30rpx;
  font-weight: 600;
}

.meta {
  font-size: 24rpx;
  color: rgb(0 0 0 / 55%);
}

.meta.status {
  color: var(--warning-mobile);
}
</style>
