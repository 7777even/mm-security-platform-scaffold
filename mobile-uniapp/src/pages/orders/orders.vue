<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { fetchFireFacilityWorkOrders } from '@/platform/api';
import { go } from '@/platform/nav';
import MobileHeader from '@/components/MobileHeader.vue';
import IconTile from '@/components/IconTile.vue';

const list = ref<any[]>([]);
const loading = ref(true);
const typeFilter = ref<string>('全部');
const statusFilter = ref<string>('全部');

const types = computed(() => [
  '全部',
  ...Array.from(new Set(list.value.map((o) => o.facilityType).filter(Boolean))),
]);
const statuses = computed(() => [
  '全部',
  ...Array.from(new Set(list.value.map((o) => o.status).filter(Boolean))),
]);
const filtered = computed(() =>
  list.value.filter(
    (o) =>
      (typeFilter.value === '全部' || o.facilityType === typeFilter.value) &&
      (statusFilter.value === '全部' || o.status === statusFilter.value),
  ),
);

async function load() {
  loading.value = true;
  try {
    list.value = await fetchFireFacilityWorkOrders();
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
    <MobileHeader variant="brand" title="消防设施工单" subtitle="报修与维修处置" />
    <view class="filters">
      <scroll-view scroll-x class="chip-row">
        <view
          v-for="t in types"
          :key="t"
          class="chip"
          :class="{ active: typeFilter === t }"
          @click="typeFilter = t"
          >{{ t }}</view
        >
      </scroll-view>
      <scroll-view scroll-x class="chip-row">
        <view
          v-for="s in statuses"
          :key="s"
          class="chip"
          :class="{ active: statusFilter === s }"
          @click="statusFilter = s"
          >{{ s }}</view
        >
      </scroll-view>
    </view>

    <view v-if="loading" class="state">加载中…</view>
    <view v-else-if="filtered.length === 0" class="state">暂无工单数据</view>
    <view v-else class="list">
      <view
        v-for="o in filtered"
        :key="o.workOrderNo"
        class="card"
        @click="go('/orders/' + o.workOrderNo)"
      >
        <IconTile name="fire" tone="red" />
        <view class="card-body">
          <view class="title">{{ o.facilityName || '—' }}</view>
          <view class="meta">{{ o.facilityType || '—' }} · 故障等级 {{ o.faultLevel || '—' }}</view>
          <view class="meta status">{{ o.status || '—' }}</view>
          <view class="meta">{{ o.dispatchTime || '—' }} · 维修人 {{ o.repairPerson || '—' }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.filters {
  padding: var(--mb-pad-x);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.chip-row {
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
  color: var(--mb-hero-fg);
  font-size: 26rpx;
  border: 1rpx solid rgb(0 0 0 / 8%);
}

.chip.active {
  background: var(--primary-mobile);
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
