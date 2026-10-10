<script setup lang="ts">
import { computed, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import MobileHeader from '@/components/MobileHeader.vue';
import { liveEvents } from '@/data/liveCache';
import { go } from '@/platform/nav';

// 应急事件详情（docs/UI规范-移动端.md §5）。
// 数据源：列表页 /events 拉取后写入 liveEvents 缓存（后端无按 id 详情端点），本页按路由 id 从缓存读取；
// 深链 / 刷新无缓存时降级为「未找到」空态。
const routeId = ref<string>('');

const event = computed(() => liveEvents.items.find((x) => String(x.id) === String(routeId.value)));

const LEVEL_TAG: Record<string, string> = {
  重大: 'tag--danger',
  较大: 'tag--warning',
  一般: 'tag--info',
  一级: 'tag--danger',
  二级: 'tag--warning',
  三级: 'tag--info',
};

const level = computed(() => event.value?.hazardSourceLevel ?? '');
const levelTag = computed(() => LEVEL_TAG[level.value] ?? 'tag--info');

interface Phase {
  time: string;
  title: string;
  desc: string;
  done: boolean;
}
const phases = computed<Phase[]>(() => {
  const e = event.value;
  if (!e) return [];
  const processing = e.status === 'processing';
  const done = e.status === 'done';
  return [
    { time: (e.time ?? '').slice(11, 16), title: '接报', desc: '系统自动接报', done: true },
    {
      time: '',
      title: '研判',
      desc: `匹配${e.eventCategory === 'extremeWeather' ? '极端天气专项' : ''}应急预案`,
      done: processing || done,
    },
    {
      time: '',
      title: e.statusLabel ?? e.status ?? '处置',
      desc: processing ? '现场处置进行中' : done ? '处置已完成' : '等待处置',
      done,
    },
  ];
});

onLoad((query?: { id?: string }) => {
  if (query?.id) routeId.value = query.id;
});

function onAck(): void {
  uni.showToast({ title: '确认接收待后端接口支持', icon: 'none' });
}
function onResources(): void {
  go('/pages/event-resources/event-resources');
}
function onPlans(): void {
  go('/pages/plans/plans');
}
function onVideos(): void {
  go('/pages/videos/videos');
}
</script>

<template>
  <view class="mb-page">
    <MobileHeader variant="back" title="事件详情" />

    <view v-if="!event" class="mb-empty">
      <text class="mb-empty__text">未找到该事件（请从列表进入）</text>
    </view>

    <view v-else class="mb-stack">
      <view class="mb-card">
        <view class="mb-card__title">
          <text>{{ event.title }}</text>
          <text v-if="level" class="tag" :class="levelTag">{{ level }}</text>
        </view>
        <text class="mb-card__desc">{{ event.id }} · {{ event.time }} · {{ event.location }}</text>
        <text class="mb-card__desc">状态：{{ event.statusLabel ?? event.status }}</text>
      </view>

      <view class="mb-card">
        <text class="event-detail__k">事件描述</text>
        <text class="mb-card__desc">{{ event.description }}</text>
      </view>

      <text class="mb-section__title event-detail__sec">处置阶段</text>
      <view class="mb-card">
        <view
          v-for="p in phases"
          :key="p.title"
          class="mb-timeline__item"
          :class="{ 'mb-timeline__item--pending': !p.done }"
        >
          <text class="mb-timeline__time">{{ p.time }}</text>
          <text class="mb-timeline__body">{{ p.title }} · {{ p.desc }}</text>
        </view>
      </view>

      <text class="mb-section__title event-detail__sec">关联入口</text>
      <view class="mb-card mb-card--link" @click="onResources">
        <view class="mb-card__title"><text class="event-detail__link">周边应急资源</text></view>
        <text class="mb-card__desc">消防车 2 辆 · 灭火器材 12 件 · 消防栓 4 处</text>
      </view>
      <view class="mb-card mb-card--link" @click="onPlans">
        <view class="mb-card__title"><text class="event-detail__link">匹配应急预案</text></view>
        <text class="mb-card__desc">查看应急预案库</text>
      </view>
      <view class="mb-card mb-card--link" @click="onVideos">
        <view class="mb-card__title"><text class="event-detail__link">关联视频画面</text></view>
        <text class="mb-card__desc">T-301 罐区球机 2 路 / 高点全景 1 路</text>
      </view>

      <button type="button" class="mb-btn-primary mb-btn-block" @click="onAck">一键确认接收</button>
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
  gap: var(--mb-card-gap);
  padding: var(--space-md) var(--mb-pad-x);
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
  font-size: var(--mb-fz-tip);
  color: var(--text-muted-mobile);
}

.event-detail__k {
  font-size: var(--mb-fz-tip);
  color: var(--text-muted-mobile);
}

.event-detail__sec {
  margin: var(--space-md) 0 calc(-1 * var(--space-sm));
  font-size: var(--mb-fz-form-label);
  font-weight: 600;
  color: var(--text-title-mobile);
}

.event-detail__link {
  min-width: 0;
}

.mb-timeline__item {
  display: flex;
  flex-direction: column;
  padding-left: 24rpx;
  border-left: 6rpx solid var(--primary-mobile);
  margin-bottom: var(--space-sm);
}

.mb-timeline__item--pending {
  border-left-color: var(--mb-stroke);
}

.mb-timeline__time {
  font-size: var(--mb-fz-tip);
  color: var(--text-muted-mobile);
}

.mb-timeline__body {
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

.mb-btn-block {
  width: 100%;
}
</style>
