<script setup lang="ts">
import { ref, computed } from 'vue';
import MobileHeader from '@/components/MobileHeader.vue';

type TabKey = 'param' | 'miss' | 'device';

interface AnomalyRow {
  id: string;
  title: string;
  meta: string;
  level: string;
}

const TABS: { key: TabKey; label: string }[] = [
  { key: 'param', label: '参数异常' },
  { key: 'miss', label: '漏检任务' },
  { key: 'device', label: '设备异常' },
];

const active = ref<TabKey>('param');

const PARAM_DATA: AnomalyRow[] = [
  { id: 'p1', title: '储罐压力超限', meta: 'A区-3号储罐 · 2.4MPa', level: '二级' },
  { id: 'p2', title: '温度持续偏高', meta: '反应釜-02 · 86℃', level: '一级' },
  { id: 'p3', title: '液位骤降', meta: 'B区-缓冲罐 · 18%', level: '三级' },
];

const MISS_DATA: AnomalyRow[] = [
  { id: 'm1', title: '夜间防火巡查漏检', meta: '责任人：王伟 · 10-08', level: '二级' },
  { id: 'm2', title: '周检任务未完成', meta: '责任人：李娜 · 10-06', level: '一级' },
  { id: 'm3', title: '月度点检缺失', meta: '责任人：赵强 · 09-30', level: '二级' },
];

const DEVICE_DATA: AnomalyRow[] = [
  { id: 'd1', title: '烟感探测器离线', meta: '楼层3-东 · SN-031', level: '一级' },
  { id: 'd2', title: '消防泵异常震动', meta: '泵房-1 · PB-07', level: '三级' },
  { id: 'd3', title: '应急照明失效', meta: '走廊-2F · EL-14', level: '二级' },
];

const list = computed<AnomalyRow[]>(() => {
  if (active.value === 'param') return PARAM_DATA;
  if (active.value === 'miss') return MISS_DATA;
  return DEVICE_DATA;
});

const LEVEL_TAG: Record<string, string> = {
  一级: 'tag--info',
  二级: 'tag--warning',
  三级: 'tag--danger',
};

function setTab(k: TabKey): void {
  active.value = k;
}
</script>

<template>
  <view class="mb-page">
    <MobileHeader variant="back" title="异常中心" />

    <view class="tabs">
      <view
        v-for="t in TABS"
        :key="t.key"
        class="tabs__item"
        :class="active === t.key ? 'tabs__item--active' : ''"
        @click="setTab(t.key)"
      >
        <text>{{ t.label }}</text>
      </view>
    </view>

    <view v-if="list.length" class="mb-stack">
      <view v-for="row in list" :key="row.id" class="mb-card anomaly-card">
        <view class="anomaly-card__row">
          <text class="anomaly-card__title">{{ row.title }}</text>
          <text class="tag" :class="LEVEL_TAG[row.level] ?? 'tag--info'">{{ row.level }}</text>
        </view>
        <text class="anomaly-card__meta">{{ row.meta }}</text>
      </view>
    </view>

    <view v-else class="mb-empty">
      <text class="mb-empty__text">暂无异常记录</text>
    </view>
  </view>
</template>

<style scoped>
.tabs {
  display: flex;
  gap: var(--space-xs);
  padding: var(--space-md) var(--mb-pad-x);
  background: var(--card-mobile);
}

.tabs__item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 72rpx;
  border-radius: var(--mb-radius-ctrl);
  font-size: var(--mb-fz-form-label);
  color: var(--text-muted-mobile);
  background: #f0f2f5;
}

.tabs__item--active {
  color: #fff;
  background: var(--primary-mobile);
  font-weight: 600;
}

.mb-stack {
  display: flex;
  flex-direction: column;
  gap: var(--mb-card-gap);
  padding: var(--mb-card-gap) var(--mb-pad-x);
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

.anomaly-card__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
}
.anomaly-card__title {
  font-size: var(--mb-fz-section);
  font-weight: 600;
  color: var(--text-title-mobile);
}
.anomaly-card__meta {
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
.tag--info {
  background: rgb(22 119 255 / 12%);
  color: var(--primary-mobile);
}
.tag--warning {
  background: rgb(250 140 22 / 12%);
  color: var(--warning-mobile);
}
.tag--danger {
  background: rgb(245 34 45 / 12%);
  color: var(--danger-mobile);
}
</style>
