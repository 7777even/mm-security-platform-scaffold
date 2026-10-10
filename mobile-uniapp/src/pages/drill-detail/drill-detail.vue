<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { fetchDrillDetail } from '@/platform/api';
import MobileHeader from '@/components/MobileHeader.vue';

const id = ref<string>('');
const detail = ref<any>(null);
const tasks = ref<any[]>([]);
const loading = ref(true);

async function load() {
  loading.value = true;
  try {
    const r = await fetchDrillDetail(id.value);
    detail.value = r ?? null;
    tasks.value = (r as any)?.tasks ?? [];
  } catch (e: any) {
    uni.showToast({ title: e?.message ?? '加载失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
}

onLoad((q) => {
  id.value = (q as any).id as string;
  load();
});
</script>

<template>
  <view class="mb-page">
    <MobileHeader variant="back" title="演练详情" :subtitle="detail?.drillCode" />
    <view v-if="loading" class="mb-state">加载中…</view>
    <view v-else-if="!detail" class="mb-state">暂无演练信息</view>

    <view v-else class="mb-list">
      <view class="mb-card mb-info">
        <view class="mb-info__name">{{ detail.name }}</view>
        <view class="mb-field"
          ><text class="mb-field__label">编号</text
          ><text class="mb-field__value">{{ detail.drillCode }}</text></view
        >
        <view class="mb-field"
          ><text class="mb-field__label">状态</text
          ><text class="mb-field__value">{{ detail.status }}</text></view
        >
        <view class="mb-field"
          ><text class="mb-field__label">时间</text
          ><text class="mb-field__value">{{ detail.timeRange }}</text></view
        >
        <view class="mb-field"
          ><text class="mb-field__label">地点</text
          ><text class="mb-field__value">{{ detail.place }}</text></view
        >
        <view v-if="detail.drillType" class="mb-field"
          ><text class="mb-field__label">类型</text
          ><text class="mb-field__value">{{ detail.drillType }}</text></view
        >
        <view v-if="detail.form" class="mb-field"
          ><text class="mb-field__label">形式</text
          ><text class="mb-field__value">{{ detail.form }}</text></view
        >
        <view v-if="detail.departments" class="mb-field"
          ><text class="mb-field__label">参与部门</text
          ><text class="mb-field__value">{{ detail.departments }}</text></view
        >
      </view>

      <view class="mb-section__title">演练任务（{{ tasks.length }}）</view>
      <view v-if="tasks.length === 0" class="mb-state">暂无任务</view>
      <view v-for="(t, i) in tasks" :key="i" class="mb-card mb-task">
        <view class="mb-task__name">{{ t.name }}</view>
        <view class="mb-task__status">{{ t.status }}</view>
      </view>
    </view>
  </view>
</template>

<style scoped>
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
  padding: var(--space-md);
}

.mb-info__name {
  font-size: 32rpx;
  font-weight: 700;
  margin-bottom: var(--space-sm);
}

.mb-field {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
  min-height: 64rpx;
  padding: 12rpx 0;
  border-top: 1rpx solid #f0f0f0;
}

.mb-field__label {
  font-size: 26rpx;
  color: #888;
  flex: none;
}

.mb-field__value {
  font-size: 28rpx;
  text-align: right;
}

.mb-section__title {
  font-size: var(--mb-fz-section);
  font-weight: 700;
  color: var(--primary-mobile);
  margin: var(--space-md) 0 var(--space-sm);
}

.mb-task {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 88rpx;
}

.mb-task__name {
  font-size: 28rpx;
  font-weight: 600;
}

.mb-task__status {
  font-size: 24rpx;
  color: #fff;
  background: var(--primary-mobile);
  padding: 4rpx 16rpx;
  border-radius: 999rpx;
}
</style>
