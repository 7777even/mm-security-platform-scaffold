<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { fetchSpecialOperations } from '@/platform/api';
import MobileHeader from '@/components/MobileHeader.vue';
import IconTile from '@/components/IconTile.vue';

const ticket = ref<any>(null);
const loading = ref(true);

const TOTAL_STEPS = 5;
const CURRENT_STEP = 2;
const steps = ['核对操作任务', '模拟预演', '执行操作', '复核确认', '记录归档'];

const progress = computed(() => Math.round((CURRENT_STEP / TOTAL_STEPS) * 100));

async function load() {
  loading.value = true;
  try {
    const res = await fetchSpecialOperations(1, 1);
    ticket.value = (res.list ?? [])[0] ?? null;
    if (!ticket.value) {
      uni.showToast({ title: '暂无操作票', icon: 'none' });
    }
  } catch (e: any) {
    uni.showToast({ title: e?.message ?? '加载失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
}

function uploadPhoto() {
  uni.chooseImage({
    count: 1,
    success: () => uni.showToast({ title: '已选择照片（占位）', icon: 'none' }),
    fail: () => uni.showToast({ title: '选择失败', icon: 'none' }),
  });
}

function onConfirm() {
  uni.showToast({ title: '功能待接入', icon: 'none' });
}

onLoad(load);
</script>

<template>
  <view class="mb-page">
    <MobileHeader variant="back" title="操作票执行" />
    <view v-if="loading" class="state">加载中…</view>
    <view v-else-if="!ticket" class="state">暂无操作票</view>
    <view v-else class="exec">
      <view class="ticket-head">
        <IconTile name="ops" tone="orange" />
        <view class="head-body">
          <view class="title">{{ ticket.content || '—' }}</view>
          <view class="meta"
            >{{ ticket.area || '—' }} · {{ ticket.type || '—' }} · 等级
            {{ ticket.level || '—' }}</view
          >
          <view class="meta status"
            >{{ ticket.status || '—' }} · {{ ticket.timeRange || '—' }}</view
          >
        </view>
      </view>

      <view class="progress-wrap">
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: progress + '%' }" />
        </view>
        <text class="progress-text"
          >步骤 {{ CURRENT_STEP }}/{{ TOTAL_STEPS }}（{{ progress }}%）</text
        >
      </view>

      <view class="steps">
        <view
          v-for="(s, i) in steps"
          :key="i"
          class="step"
          :class="{ done: i < CURRENT_STEP, current: i === CURRENT_STEP }"
        >
          <text class="step-no">{{ i + 1 }}</text>
          <text class="step-name">{{ s }}</text>
        </view>
      </view>

      <button class="photo-btn" @click="uploadPhoto">上传现场照片</button>
    </view>

    <view v-if="!loading && ticket" class="confirm-bar">
      <button class="confirm-btn" @click="onConfirm">确认执行</button>
    </view>
  </view>
</template>

<style scoped>
.state {
  text-align: center;
  padding: 80rpx 0;
  color: rgb(0 0 0 / 45%);
}

.exec {
  padding: var(--mb-pad-x);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.ticket-head {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  background: #fff;
  border-radius: var(--mb-radius-card);
}

.head-body {
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

.progress-wrap {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.progress-bar {
  height: 16rpx;
  border-radius: 999rpx;
  background: rgb(0 0 0 / 8%);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--warning-mobile);
}

.progress-text {
  font-size: 24rpx;
  color: rgb(0 0 0 / 55%);
}

.steps {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.step {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  background: #fff;
  border-radius: var(--mb-radius-card);
  min-height: 72rpx;
}

.step-no {
  width: 44rpx;
  height: 44rpx;
  line-height: 44rpx;
  text-align: center;
  border-radius: 999rpx;
  background: rgb(0 0 0 / 8%);
  font-size: 24rpx;
}

.step.done .step-no {
  background: var(--success-mobile);
  color: #fff;
}

.step.current .step-no {
  background: var(--warning-mobile);
  color: #fff;
}

.step-name {
  font-size: 28rpx;
}

.photo-btn {
  min-height: 88rpx;
  line-height: 88rpx;
  background: #fff;
  color: var(--primary-mobile);
  border: 1rpx solid var(--primary-mobile);
  border-radius: var(--mb-radius-card);
  font-size: 28rpx;
}

.confirm-bar {
  padding: var(--mb-pad-x) var(--mb-pad-x) calc(var(--space-lg) + env(safe-area-inset-bottom));
  background: #fff;
}

.confirm-btn {
  width: 100%;
  min-height: 88rpx;
  line-height: 88rpx;
  background: var(--primary-mobile);
  color: #fff;
  border-radius: var(--mb-radius-card);
  font-size: 28rpx;
}
</style>
