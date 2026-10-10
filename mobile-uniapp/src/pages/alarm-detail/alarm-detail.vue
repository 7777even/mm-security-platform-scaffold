<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import MobileHeader from '@/components/MobileHeader.vue';
import { liveAlarms } from '@/data/liveCache';
import type { AlarmItem } from '@/platform/api';

// 详情页模板（UI规范-移动端 §5 / §5.1）。
// 数据源：首页拉取后写入 liveAlarms 缓存；本页按路由 id 从缓存读取；
// 深链/刷新无缓存时降级为「未找到」空态。uni 路由参数经 onLoad(query) 获取（无 vue-router）。
const alarm = ref<AlarmItem | undefined>(undefined);

onLoad((query?: { id?: string }) => {
  if (query?.id) alarm.value = liveAlarms.get(query.id);
});

const LEVEL_LABEL: Record<number, string> = { 1: '一级', 2: '二级', 3: '三级', 4: '四级' };
const LEVEL_TAG: Record<number, string> = {
  1: 'tag--danger',
  2: 'tag--warning',
  3: 'tag--warning',
  4: 'tag--info',
};
const TYPE_LABEL: Record<string, string> = {
  FIRE: '消防报警',
  GAS: '气体报警',
  TEMP: '温度报警',
  CCTV: '视频AI',
  SOS: 'SOS 求助',
};
const STATUS_LABEL: Record<string, string> = {
  ACTIVE: '未确认',
  ACKED: '已确认',
  DISPATCHED: '已派发',
  CLOSED: '已关闭',
};
const STATUS_TAG: Record<string, string> = {
  ACTIVE: 'tag--danger',
  ACKED: 'tag--warning',
  DISPATCHED: 'tag--warning',
  CLOSED: 'tag--success',
};

function formatTs(ts?: string): string {
  if (!ts) return '—';
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return ts;
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

const timeText = computed(() => (alarm.value ? formatTs(alarm.value.ts) : ''));
const levelText = computed(() => (alarm.value ? (LEVEL_LABEL[alarm.value.level] ?? '') : ''));
const levelTag = computed(() =>
  alarm.value ? (LEVEL_TAG[alarm.value.level] ?? 'tag--info') : 'tag--info',
);
const typeText = computed(() =>
  alarm.value ? (TYPE_LABEL[alarm.value.type] ?? alarm.value.type) : '',
);
const statusText = computed(() =>
  alarm.value ? (STATUS_LABEL[alarm.value.status] ?? alarm.value.status) : '',
);
const statusTag = computed(() =>
  alarm.value ? (STATUS_TAG[alarm.value.status] ?? 'tag--info') : 'tag--info',
);

// 确认/处置反馈：后端暂未提供对应端点，先给出明确提示（不伪造成功）
function onAction(name: string): void {
  uni.showToast({ title: `${name}待后端接口支持`, icon: 'none' });
}
</script>

<template>
  <view class="mb-page">
    <MobileHeader variant="back" title="告警详情" />

    <view v-if="!alarm" class="mb-empty">
      <text class="mb-empty__text">未找到该告警（请从列表进入）</text>
    </view>

    <view v-else class="mb-stack">
      <view class="mb-card">
        <view class="mb-card__title">
          <text>{{ alarm.title ?? alarm.description ?? alarm.alarmId }}</text>
          <text class="tag" :class="levelTag">{{ levelText }}</text>
        </view>
        <text class="mb-card__desc">{{ alarm.alarmId }} · {{ timeText }} · {{ typeText }}</text>
      </view>

      <view class="mb-detail">
        <view class="mb-detail__row"
          ><text class="mb-detail__label">来源 / 设备</text
          ><text class="mb-detail__value">{{ alarm.deviceCode }}</text></view
        >
        <view class="mb-detail__row"
          ><text class="mb-detail__label">所在区域</text
          ><text class="mb-detail__value">{{ alarm.location }}</text></view
        >
        <view class="mb-detail__row"
          ><text class="mb-detail__label">告警简述</text
          ><text class="mb-detail__value">{{ alarm.description }}</text></view
        >
        <view class="mb-detail__row">
          <text class="mb-detail__label">处置状态</text>
          <text class="mb-detail__value"
            ><text class="tag" :class="statusTag">{{ statusText }}</text></text
          >
        </view>
      </view>

      <button type="button" class="mb-btn-primary mb-btn-block" @click="onAction('一键确认')">
        一键确认
      </button>
      <button type="button" class="mb-btn-ghost mb-btn-block" @click="onAction('处置反馈')">
        处置反馈
      </button>
    </view>
  </view>
</template>

<style scoped>
.mb-empty {
  padding: var(--mb-empty-pad) var(--mb-pad-x);
  text-align: center;
}
.mb-empty__text {
  font-size: var(--mb-fz-help);
  color: var(--text-muted-mobile);
}

.mb-stack {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding: var(--space-md) var(--mb-pad-x);
}
.mb-card {
  padding: var(--space-md);
  background: var(--card-mobile);
  border: var(--mb-border-w) solid var(--mb-stroke);
  border-radius: var(--mb-radius-card);
}
.mb-card__title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
  font-size: var(--mb-fz-form-label);
  font-weight: 600;
  color: var(--text-title-mobile);
}
.mb-card__desc {
  display: block;
  margin-top: var(--space-xs);
  font-size: var(--mb-fz-tip);
  color: var(--text-muted-mobile);
}

.mb-detail {
  padding: var(--space-md);
  background: var(--card-mobile);
  border: var(--mb-border-w) solid var(--mb-stroke);
  border-radius: var(--mb-radius-card);
}
.mb-detail__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 88rpx;
  border-bottom: var(--mb-border-w) solid var(--mb-stroke);
}
.mb-detail__row:last-child {
  border-bottom: none;
}
.mb-detail__label {
  font-size: var(--mb-fz-tip);
  color: var(--text-muted-mobile);
}
.mb-detail__value {
  font-size: var(--mb-fz-form-label);
  color: var(--text-title-mobile);
}

.tag {
  padding: 2rpx 12rpx;
  border-radius: 8rpx;
  font-size: var(--mb-fz-help);
  background: #eef1f6;
  color: var(--text-muted-mobile);
}
.tag--danger {
  background: rgb(245 34 45 / 12%);
  color: var(--danger-mobile);
}
.tag--warning {
  background: rgb(250 140 22 / 12%);
  color: var(--warning-mobile);
}
.tag--info {
  background: rgb(22 119 255 / 12%);
  color: var(--primary-mobile);
}
.tag--success {
  background: rgb(82 196 26 / 12%);
  color: var(--success-mobile);
}

.mb-btn-primary {
  background: var(--primary-mobile);
  color: #fff;
  border: none;
  border-radius: var(--mb-radius-ctrl);
  min-height: 88rpx;
  font-size: var(--mb-fz-form-label);
}
.mb-btn-ghost {
  background: #fff;
  color: var(--primary-mobile);
  border: 1rpx solid var(--primary-mobile);
  border-radius: var(--mb-radius-ctrl);
  min-height: 88rpx;
  font-size: var(--mb-fz-form-label);
}
.mb-btn-block {
  width: 100%;
}
</style>
