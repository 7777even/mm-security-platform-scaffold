<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { fetchDrills } from '@/platform/api';
import { go } from '@/platform/nav';
import MobileHeader from '@/components/MobileHeader.vue';

const items = ref<any[]>([]);
const total = ref(0);
const loading = ref(true);
const activeStatus = ref<string>('ALL');

const statuses = ['ALL', 'PLANNED', 'ONGOING', 'FINISHED', 'CANCELLED'];

const statusText: Record<string, string> = {
  ALL: '全部',
  PLANNED: '未开始',
  ONGOING: '进行中',
  FINISHED: '已完成',
  CANCELLED: '已取消',
};

const filtered = computed(() => {
  if (activeStatus.value === 'ALL') return items.value;
  return items.value.filter((d) => d.status === activeStatus.value);
});

async function load() {
  loading.value = true;
  try {
    const r = await fetchDrills();
    items.value = r.items ?? [];
    total.value = r.total ?? 0;
  } catch (e: any) {
    uni.showToast({ title: e?.message ?? '加载失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
}

function open(id: string | number) {
  go('/drills/' + id);
}

onLoad(load);
</script>

<template>
  <view class="mb-page">
    <MobileHeader variant="back" title="应急演练" :subtitle="`共 ${total} 场`" />

    <scroll-view scroll-x class="mb-chips">
      <view
        v-for="s in statuses"
        :key="s"
        class="mb-chip"
        :class="{ 'mb-chip--active': activeStatus === s }"
        @click="activeStatus = s"
        >{{ statusText[s] }}</view
      >
    </scroll-view>

    <view v-if="loading" class="mb-state">加载中…</view>
    <view v-else-if="filtered.length === 0" class="mb-state">暂无演练</view>

    <view v-else class="mb-list">
      <view v-for="d in filtered" :key="d.id" class="mb-card mb-drill" @click="open(d.id)">
        <view class="mb-drill__top">
          <text class="mb-drill__code">{{ d.drillCode }}</text>
          <text class="mb-drill__status">{{ statusText[d.status] ?? d.status }}</text>
        </view>
        <view class="mb-drill__name">{{ d.name }}</view>
        <view v-if="d.timeRange" class="mb-drill__meta">时间：{{ d.timeRange }}</view>
        <view v-if="d.place" class="mb-drill__meta">地点：{{ d.place }}</view>
        <view v-if="d.taskCount != null" class="mb-drill__meta">任务数：{{ d.taskCount }}</view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.mb-chips {
  white-space: nowrap;
  padding: var(--space-sm) var(--mb-pad-x);
}

.mb-chip {
  display: inline-block;
  min-height: 56rpx;
  line-height: 56rpx;
  padding: 0 var(--space-md);
  margin-right: var(--space-sm);
  background: #fff;
  border-radius: 999rpx;
  font-size: 26rpx;
  color: #555;
}

.mb-chip--active {
  background: var(--primary-mobile);
  color: #fff;
}

.mb-state {
  padding: var(--space-lg) var(--mb-pad-x);
  text-align: center;
  color: var(--mb-fz-tip);
}

.mb-list {
  margin: var(--space-sm) var(--mb-pad-x);
}

.mb-card {
  background: #fff;
  border-radius: var(--mb-radius-card);
  margin-bottom: var(--space-sm);
  padding: var(--space-md);
}

.mb-drill__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.mb-drill__code {
  font-size: 24rpx;
  color: #999;
}

.mb-drill__status {
  font-size: 24rpx;
  color: var(--primary-mobile);
  background: rgb(0 0 0 / 4%);
  padding: 2rpx 14rpx;
  border-radius: 999rpx;
}

.mb-drill__name {
  font-size: 30rpx;
  font-weight: 600;
  margin: 8rpx 0;
}

.mb-drill__meta {
  font-size: 24rpx;
  color: #666;
  margin-top: 4rpx;
}
</style>
