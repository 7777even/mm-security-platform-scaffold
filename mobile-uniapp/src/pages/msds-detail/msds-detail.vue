<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import MobileHeader from '@/components/MobileHeader.vue';
import { fetchMsdsDetail, type MsdsDetail } from '@/platform/api';

const cas = ref('');
const loading = ref(true);
const detail = ref<MsdsDetail | null>(null);

const FIELDS: { key: keyof MsdsDetail; label: string }[] = [
  { key: 'name', label: '化学品名称' },
  { key: 'cas', label: 'CAS 号' },
  { key: 'classification', label: '危险类别' },
  { key: 'state', label: '物理状态' },
  { key: 'boilingPoint', label: '沸点' },
  { key: 'flashPoint', label: '闪点' },
  { key: 'explosionLimit', label: '爆炸极限' },
  { key: 'storage', label: '储存要求' },
  { key: 'safety', label: '安全注意事项' },
  { key: 'emergency', label: '应急处置' },
];

async function load(): Promise<void> {
  loading.value = true;
  try {
    detail.value = await fetchMsdsDetail(encodeURIComponent(cas.value));
  } catch (e: any) {
    uni.showToast({ title: e?.message ?? '加载失败', icon: 'none' });
    detail.value = null;
  } finally {
    loading.value = false;
  }
}

onLoad((q?: Record<string, any>) => {
  cas.value = (q?.cas as string) ?? '';
  if (cas.value) void load();
  else {
    loading.value = false;
    detail.value = null;
  }
});
</script>

<template>
  <view class="mb-page">
    <MobileHeader variant="back" title="MSDS 详情" :subtitle="cas || ''" />

    <text v-if="loading" class="mb-loading">加载中…</text>

    <view v-else-if="detail" class="mb-stack">
      <view class="mb-detail">
        <view v-for="f in FIELDS" :key="f.key" class="mb-detail__row">
          <text class="mb-detail__label">{{ f.label }}</text>
          <text class="mb-detail__value">{{ (detail[f.key] as string) || '—' }}</text>
        </view>
      </view>
    </view>

    <view v-else class="mb-empty">
      <text class="mb-empty__text">未找到该化学品</text>
    </view>
  </view>
</template>

<style scoped>
.mb-loading {
  text-align: center;
  color: var(--text-muted-mobile);
  padding: var(--space-lg) 0;
}

.mb-stack {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding: var(--space-md) var(--mb-pad-x);
}

.mb-detail {
  padding: var(--space-md);
  background: var(--card-mobile);
  border: var(--mb-border-w) solid var(--mb-stroke);
  border-radius: var(--mb-radius-card);
}

.mb-detail__row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
  min-height: 88rpx;
  padding: var(--space-sm) 0;
  border-bottom: var(--mb-border-w) solid var(--mb-stroke);
}

.mb-detail__row:last-child {
  border-bottom: none;
}

.mb-detail__label {
  flex-shrink: 0;
  font-size: var(--mb-fz-tip);
  color: var(--text-muted-mobile);
}

.mb-detail__value {
  flex: 1;
  text-align: right;
  font-size: var(--mb-fz-form-label);
  color: var(--text-title-mobile);
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
