<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import MobileHeader from '@/components/MobileHeader.vue';
import MapPanel from '@/components/MapPanel.vue';
import type { MapMarker } from '@/lib/mapAlarm';
import { fetchTasks, type TaskItem, fetchAlarmPoints } from '@/platform/api';
import { mapPointsToMarkers } from '@/lib/mapAlarm';
import { getItem, setItem } from '@/platform/storage';

interface LngLat {
  lng: number;
  lat: number;
}

const loading = ref(true);
const task = ref<TaskItem | null>(null);
const myLoc = ref<LngLat | null>(null);
const destinations = ref<MapMarker[]>([]);
const dest = ref<MapMarker | null>(null);

/** 真实 GPS 定位（gcj02）。 */
function locate(): void {
  uni.getLocation({
    type: 'gcj02',
    success: (res: any) => {
      myLoc.value = { lng: res.longitude, lat: res.latitude };
    },
    fail: (e: any) => uni.showToast({ title: e?.errMsg ?? '定位失败', icon: 'none' }),
  });
}

async function load(): Promise<void> {
  loading.value = true;
  try {
    const [tasks, pts] = await Promise.all([fetchTasks(), fetchAlarmPoints()]);
    task.value = (tasks.items ?? [])[0] ?? null;
    // pts 为后端 WGS-84，经 mapPointsToMarkers 转 GCJ-02，与"我的位置"(gcj02) 对齐。
    destinations.value = mapPointsToMarkers(pts);
  } catch (e: any) {
    uni.showToast({ title: e?.message ?? '加载失败', icon: 'none' });
    destinations.value = [];
  } finally {
    loading.value = false;
  }
}

const routeInfo = computed(() => {
  const t = task.value;
  if (!t) return { title: '暂无进行中任务', meta: '', status: '' };
  return {
    title: t.title ?? '未命名任务',
    meta: [t.area, t.deadline].filter(Boolean).join(' · '),
    status: t.status ?? '',
  };
});

/** 当前位置 → 目的地 轨迹线。 */
const polyline = computed<LngLat[]>(() => {
  if (myLoc.value && dest.value) return [myLoc.value, { lng: dest.value.lng, lat: dest.value.lat }];
  return [];
});

const myMarker = computed<MapMarker[]>(() =>
  myLoc.value
    ? [{ id: 'me', lng: myLoc.value.lng, lat: myLoc.value.lat, label: '我的位置', level: 0 }]
    : [],
);
const destMarker = computed<MapMarker[]>(() => (dest.value ? [dest.value] : []));
const shownMarkers = computed<MapMarker[]>(() => [...myMarker.value, ...destMarker.value]);

function chooseDest(m: MapMarker): void {
  dest.value = m;
}

/** 真实原生导航：拉起系统地图 App 进行实时路线规划与导航。 */
function startNav(): void {
  if (!dest.value) {
    uni.showToast({ title: '请先选择目的地', icon: 'none' });
    return;
  }
  uni.openLocation({
    latitude: dest.value.lat,
    longitude: dest.value.lng,
    name: dest.value.label ?? '目的地',
    fail: (e: any) => uni.showToast({ title: e?.errMsg ?? '无法拉起导航', icon: 'none' }),
  });
}

/** 缓存目的地（离线可达）。 */
function cacheRoute(): void {
  if (!dest.value) {
    uni.showToast({ title: '请先选择目的地', icon: 'none' });
    return;
  }
  setItem('cached_route_dest', JSON.stringify(dest.value));
  uni.showToast({ title: '路径已缓存', icon: 'none' });
}

onLoad(() => {
  load();
  locate();
});
onMounted(locate);
</script>

<template>
  <view class="mb-page">
    <MobileHeader variant="back" title="路径导航" />

    <text v-if="loading" class="mb-loading">加载中…</text>

    <block v-else>
      <view class="mb-stack">
        <view class="mb-card task-card">
          <text class="task-card__label">当前任务</text>
          <text class="task-card__title">{{ routeInfo.title }}</text>
          <text v-if="routeInfo.meta" class="task-card__meta">{{ routeInfo.meta }}</text>
          <text v-if="routeInfo.status" class="tag tag--info">{{ routeInfo.status }}</text>
        </view>
      </view>

      <MapPanel
        :markers="shownMarkers"
        :center="myLoc || undefined"
        :polyline="polyline"
        :show-my-location="true"
        height="340rpx"
        label="导航路径"
      />

      <view class="mb-stack">
        <view class="mb-card">
          <text class="mb-card__label">选择目的地（点击地图标记或下方列表）</text>
          <view v-if="dest" class="mb-card__hint">已选：{{ dest.label || '未命名点' }}</view>
          <text v-else class="mb-card__hint">尚未选择目的地</text>
        </view>

        <view class="dest-list">
          <view
            v-for="m in destinations"
            :key="m.id"
            class="dest-item"
            :class="dest && dest.id === m.id ? 'dest-item--on' : ''"
            @click="chooseDest(m)"
          >
            <text class="dest-item__name">{{ m.label || '未命名点' }}</text>
            <text v-if="m.level" class="dest-item__lv">L{{ m.level }}</text>
          </view>
        </view>
      </view>

      <view class="bottom-bar">
        <view class="btn btn--primary" @click="startNav"><text>开始导航</text></view>
        <view class="btn btn--ghost" @click="cacheRoute"><text>缓存路径</text></view>
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

.mb-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  padding: var(--space-md);
  background: var(--card-mobile);
  border: var(--mb-border-w) solid var(--mb-stroke);
  border-radius: var(--mb-radius-card);
}
.mb-card__label {
  font-size: var(--mb-fz-help);
  color: var(--text-muted-mobile);
}
.mb-card__hint {
  font-size: var(--mb-fz-form-label);
  color: var(--text-title-mobile);
}

.task-card__label {
  font-size: var(--mb-fz-help);
  color: var(--text-muted-mobile);
}
.task-card__title {
  font-size: var(--mb-fz-section);
  font-weight: 600;
  color: var(--text-title-mobile);
}
.task-card__meta {
  font-size: var(--mb-fz-help);
  color: var(--text-muted-mobile);
}

.tag {
  align-self: flex-start;
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

.dest-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  padding: 0 var(--mb-pad-x);
}

.dest-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-sm) var(--space-md);
  background: var(--card-mobile);
  border: var(--mb-border-w) solid var(--mb-stroke);
  border-radius: var(--mb-radius-card);
}

.dest-item--on {
  border-color: var(--primary-mobile);
  background: rgb(22 119 255 / 6%);
}
.dest-item__name {
  font-size: var(--mb-fz-form-label);
  color: var(--text-title-mobile);
}
.dest-item__lv {
  font-size: var(--mb-fz-help);
  color: var(--text-muted-mobile);
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  gap: var(--space-sm);
  padding: var(--space-md) var(--mb-pad-x) calc(var(--space-md) + env(safe-area-inset-bottom));
  background: var(--card-mobile);
  border-top: var(--mb-border-w) solid var(--mb-stroke);
}

.btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 88rpx;
  border-radius: var(--mb-radius-ctrl);
  font-size: var(--mb-fz-section);
  font-weight: 600;
}
.btn--primary {
  background: var(--primary-mobile);
  color: #fff;
}
.btn--ghost {
  background: #f0f2f5;
  color: var(--text-title-mobile);
}
.btn:active {
  opacity: 0.85;
}
</style>
