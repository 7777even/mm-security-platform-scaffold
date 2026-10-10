<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { fetchFirePatrols } from '@/platform/api';
import { go } from '@/platform/nav';
import MobileHeader from '@/components/MobileHeader.vue';
import IconTile from '@/components/IconTile.vue';

const list = ref<any[]>([]);
const loading = ref(true);

function progressOf(p: any): number {
  const items = p.checkItems ?? [];
  if (!items.length) return 0;
  const done = items.filter((i: any) => i.result && i.result !== 'PENDING').length;
  return Math.round((done / items.length) * 100);
}

const enriched = computed(() => list.value.map((p) => ({ ...p, progress: progressOf(p) })));

async function load() {
  loading.value = true;
  try {
    list.value = await fetchFirePatrols();
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
    <MobileHeader variant="brand" title="防火巡查" subtitle="消防巡查任务" />
    <view v-if="loading" class="state">加载中…</view>
    <view v-else-if="enriched.length === 0" class="state">暂无巡查任务</view>
    <view v-else class="list">
      <view v-for="p in enriched" :key="p.id" class="card" @click="go('/patrol-exec')">
        <IconTile name="patrol" tone="blue" />
        <view class="card-body">
          <view class="title">{{ p.patrolDate || '—' }} · {{ p.shift || '—' }}</view>
          <view class="meta">值班人 {{ p.dutyPerson || '—' }}</view>
          <view class="meta">地点：{{ (p.locations || []).join('、') || '—' }}</view>
          <view class="progress-row">
            <view class="progress-bar">
              <view class="progress-fill" :style="{ width: p.progress + '%' }" />
            </view>
            <text class="progress-text">{{ p.progress }}%</text>
          </view>
          <view class="meta status">{{ p.completed ? '已完成' : '巡查中' }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.state {
  text-align: center;
  padding: 80rpx 0;
  color: rgb(0 0 0 / 45%);
}

.list {
  padding: var(--mb-pad-x);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.card {
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
  padding: var(--space-md);
  background: #fff;
  border-radius: var(--mb-radius-card);
  min-height: 120rpx;
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
  color: var(--success-mobile);
}

.progress-row {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin: 6rpx 0;
}

.progress-bar {
  flex: 1;
  height: 14rpx;
  border-radius: 999rpx;
  background: rgb(0 0 0 / 8%);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--primary-mobile);
}

.progress-text {
  font-size: 22rpx;
  color: rgb(0 0 0 / 55%);
}
</style>
