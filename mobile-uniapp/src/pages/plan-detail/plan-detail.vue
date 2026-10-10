<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { fetchEmergencyPlanCatalog, fetchEmergencyPlanDetailSections } from '@/platform/api';
import MobileHeader from '@/components/MobileHeader.vue';

const id = ref<string>('');
const header = ref<any>(null);
const sections = ref<any[]>([]);
const loading = ref(true);

async function load() {
  loading.value = true;
  try {
    const [catalog, secs] = await Promise.all([
      fetchEmergencyPlanCatalog(),
      fetchEmergencyPlanDetailSections(),
    ]);
    header.value = (catalog ?? []).find((p) => String(p.id) === id.value) ?? null;
    sections.value = secs ?? [];
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
    <MobileHeader variant="back" title="预案详情" :subtitle="header?.planName" />
    <view v-if="loading" class="mb-state">加载中…</view>
    <view v-else-if="sections.length === 0" class="mb-state">暂无预案内容</view>

    <view v-else class="mb-list">
      <view v-if="header" class="mb-card mb-head">
        <view class="mb-head__name">{{ header.planName }}</view>
        <view v-if="header.label" class="mb-head__label">{{ header.label }}</view>
      </view>

      <view v-for="(s, i) in sections" :key="i" class="mb-card mb-section">
        <view class="mb-section__title">{{ s.title }}</view>
        <view v-for="(f, j) in s.fields ?? []" :key="j" class="mb-field">
          <text class="mb-field__label">{{ f.label }}</text>
          <text class="mb-field__value">{{ f.value }}</text>
        </view>
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

.mb-head__name {
  font-size: 32rpx;
  font-weight: 700;
}

.mb-head__label {
  font-size: 24rpx;
  color: #666;
  margin-top: 8rpx;
}

.mb-section__title {
  font-size: var(--mb-fz-section);
  font-weight: 700;
  color: var(--primary-mobile);
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
</style>
