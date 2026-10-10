<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import MobileHeader from '@/components/MobileHeader.vue';
import {
  fetchDevicePage,
  fetchFireFacilityWorkOrders,
  type DeviceItem,
  type WorkOrder,
} from '@/platform/api';
import { go } from '@/platform/nav';

const loading = ref(true);
const devices = ref<DeviceItem[]>([]);
const workOrders = ref<WorkOrder[]>([]);

async function load(): Promise<void> {
  loading.value = true;
  try {
    const [devRes, woRes] = await Promise.all([
      fetchDevicePage(1, 500),
      fetchFireFacilityWorkOrders(),
    ]);
    devices.value = devRes.list ?? [];
    workOrders.value = woRes ?? [];
  } catch (e: any) {
    uni.showToast({ title: e?.message ?? '加载失败', icon: 'none' });
    devices.value = [];
    workOrders.value = [];
  } finally {
    loading.value = false;
  }
}

onLoad(load);
onMounted(load);

const counts = computed(() => {
  const base = { total: 0, offline: 0, online: 0, alarm: 0 };
  for (const d of devices.value) {
    base.total += 1;
    if (d.status === 0) base.offline += 1;
    else if (d.status === 1) base.online += 1;
    else if (d.status === 2) base.alarm += 1;
  }
  return base;
});

const typeDist = computed(() => {
  const map: Record<string, number> = {};
  for (const d of devices.value) {
    const t = d.deviceType ?? '未知';
    map[t] = (map[t] ?? 0) + 1;
  }
  return Object.entries(map).map(([type, n]) => ({ type, n }));
});

const recentOrders = computed(() => (workOrders.value ?? []).slice(0, 3));

function openOrder(no: string): void {
  go('/orders/' + no);
}
</script>

<template>
  <view class="mb-page">
    <MobileHeader variant="back" title="运营看板" />

    <text v-if="loading" class="mb-loading">加载中…</text>

    <block v-else>
      <view class="mb-stack">
        <view class="stat-grid">
          <view class="stat-card">
            <text class="stat-card__num">{{ counts.total }}</text>
            <text class="stat-card__label">设备总数</text>
          </view>
          <view class="stat-card stat-card--online">
            <text class="stat-card__num">{{ counts.online }}</text>
            <text class="stat-card__label">在线</text>
          </view>
          <view class="stat-card stat-card--offline">
            <text class="stat-card__num">{{ counts.offline }}</text>
            <text class="stat-card__label">离线</text>
          </view>
          <view class="stat-card stat-card--alarm">
            <text class="stat-card__num">{{ counts.alarm }}</text>
            <text class="stat-card__label">告警</text>
          </view>
        </view>

        <view class="section-title">设备类型分布</view>
        <view v-if="typeDist.length" class="mb-stack">
          <view v-for="row in typeDist" :key="row.type" class="mb-card type-row">
            <text class="type-row__name">{{ row.type }}</text>
            <text class="type-row__num">{{ row.n }}</text>
          </view>
        </view>
        <view v-else class="mb-empty"><text class="mb-empty__text">暂无设备数据</text></view>

        <view class="section-title">最近工单</view>
        <view v-if="recentOrders.length" class="mb-stack">
          <view
            v-for="o in recentOrders"
            :key="o.workOrderNo"
            class="mb-card mb-card--link order-card"
            @click="openOrder(o.workOrderNo)"
          >
            <view class="order-card__row">
              <text class="order-card__title">{{ o.facilityName ?? '未命名设施' }}</text>
              <text class="tag" :class="o.status === '已完成' ? 'tag--success' : 'tag--warning'">{{
                o.status ?? '待处理'
              }}</text>
            </view>
            <text class="order-card__meta"
              >{{ o.workOrderNo }} · {{ o.facilityType ?? '' }} ·
              {{ o.repairPerson ?? '未指派' }}</text
            >
          </view>
        </view>
        <view v-else class="mb-empty"><text class="mb-empty__text">暂无工单</text></view>
      </view>
    </block>
  </view>
</template>

<style scoped>
.mb-loading {
  display: block;
  text-align: center;
  color: var(--text-muted-mobile);
  padding: var(--space-lg) 0;
}

.mb-stack {
  display: flex;
  flex-direction: column;
  gap: var(--mb-card-gap);
  padding: var(--mb-card-gap) var(--mb-pad-x);
}

.section-title {
  font-size: var(--mb-fz-section);
  font-weight: 600;
  color: var(--text-title-mobile);
  padding: var(--space-md) var(--mb-pad-x) 0;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--mb-card-gap);
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 120rpx;
  padding: var(--space-md);
  background: var(--card-mobile);
  border: var(--mb-border-w) solid var(--mb-stroke);
  border-radius: var(--mb-radius-card);
}

.stat-card__num {
  font-size: 44rpx;
  font-weight: 700;
  color: var(--text-title-mobile);
}

.stat-card__label {
  font-size: var(--mb-fz-help);
  color: var(--text-muted-mobile);
  margin-top: var(--space-xs);
}
.stat-card--online .stat-card__num {
  color: var(--success-mobile);
}
.stat-card--offline .stat-card__num {
  color: var(--text-muted-mobile);
}
.stat-card--alarm .stat-card__num {
  color: var(--danger-mobile);
}

.mb-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  padding: var(--space-md);
  background: var(--card-mobile);
  border: var(--mb-border-w) solid var(--mb-stroke);
  border-radius: var(--mb-radius-card);
}
.mb-card--link:active {
  opacity: 0.85;
}

.type-row {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  min-height: 88rpx;
}
.type-row__name {
  font-size: var(--mb-fz-form-label);
  color: var(--text-title-mobile);
}
.type-row__num {
  font-size: var(--mb-fz-section);
  font-weight: 600;
  color: var(--primary-mobile);
}

.order-card__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
}
.order-card__title {
  font-size: var(--mb-fz-section);
  font-weight: 600;
  color: var(--text-title-mobile);
}
.order-card__meta {
  font-size: var(--mb-fz-help);
  color: var(--text-muted-mobile);
}

.mb-empty {
  padding: var(--mb-empty-pad) var(--mb-pad-x);
  text-align: center;
}
.mb-empty__text {
  font-size: var(--mb-fz-help);
  color: var(--text-muted-mobile);
}

.tag {
  padding: 2rpx 12rpx;
  border-radius: 8rpx;
  font-size: var(--mb-fz-help);
  background: #eef1f6;
  color: var(--text-muted-mobile);
}
.tag--success {
  background: rgb(82 196 26 / 12%);
  color: var(--success-mobile);
}
.tag--warning {
  background: rgb(250 140 22 / 12%);
  color: var(--warning-mobile);
}
</style>
