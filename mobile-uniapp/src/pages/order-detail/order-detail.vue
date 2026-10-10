<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { fetchFireFacilityWorkOrders } from '@/platform/api';
import MobileHeader from '@/components/MobileHeader.vue';
import IconTile from '@/components/IconTile.vue';

const id = ref<string>('');
const order = ref<any>(null);
const loading = ref(true);

const fields = computed(() => {
  const o = order.value;
  if (!o) return [];
  return [
    { label: '工单号', value: o.workOrderNo },
    { label: '设施名称', value: o.facilityName },
    { label: '设施类型', value: o.facilityType },
    { label: '故障等级', value: o.faultLevel },
    { label: '状态', value: o.status },
    { label: '派单时间', value: o.dispatchTime },
    { label: '维修人', value: o.repairPerson },
    { label: '预计完成', value: o.estimatedFinish },
    { label: '描述', value: o.description },
  ];
});

async function load() {
  loading.value = true;
  try {
    const list = await fetchFireFacilityWorkOrders();
    order.value = list.find((o) => o.workOrderNo === id.value) ?? null;
    if (!order.value) {
      uni.showToast({ title: '未找到对应工单', icon: 'none' });
    }
  } catch (e: any) {
    uni.showToast({ title: e?.message ?? '加载失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
}

function onPlaceholder() {
  uni.showToast({ title: '功能待接入', icon: 'none' });
}

onLoad((q) => {
  id.value = (q as any).id as string;
  load();
});
</script>

<template>
  <view class="mb-page">
    <MobileHeader variant="back" title="工单详情" :subtitle="id" />
    <view v-if="loading" class="state">加载中…</view>
    <view v-else-if="!order" class="state">未找到对应工单</view>
    <view v-else class="detail">
      <IconTile name="fire" tone="red" />
      <view class="fields">
        <view v-for="f in fields" :key="f.label" class="field">
          <text class="label">{{ f.label }}</text>
          <text class="value">{{ f.value || '—' }}</text>
        </view>
      </view>
      <view class="actions">
        <button class="btn" @click="onPlaceholder">完成维修</button>
        <button class="btn ghost" @click="onPlaceholder">验收</button>
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

.detail {
  padding: var(--mb-pad-x);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.fields {
  background: #fff;
  border-radius: var(--mb-radius-card);
  overflow: hidden;
}

.field {
  display: flex;
  padding: var(--space-md);
  border-bottom: 1rpx solid rgb(0 0 0 / 6%);
}

.field:last-child {
  border-bottom: none;
}

.label {
  width: 180rpx;
  color: rgb(0 0 0 / 50%);
  font-size: 26rpx;
}

.value {
  flex: 1;
  font-size: 26rpx;
}

.actions {
  display: flex;
  gap: var(--space-sm);
}

.btn {
  flex: 1;
  min-height: 88rpx;
  line-height: 88rpx;
  background: var(--primary-mobile);
  color: #fff;
  border-radius: var(--mb-radius-card);
  font-size: 28rpx;
}

.btn.ghost {
  background: #fff;
  color: var(--primary-mobile);
  border: 1rpx solid var(--primary-mobile);
}
</style>
