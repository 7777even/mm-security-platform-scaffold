<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import MobileHeader from '@/components/MobileHeader.vue';
import MapPanel from '@/components/MapPanel.vue';
import type { MapMarker } from '@/lib/mapAlarm';
import { mapPointsToMarkers } from '@/lib/mapAlarm';
import { fetchAlarmPoints } from '@/platform/api';
import { go } from '@/platform/nav';

type LevelKey = 'all' | '1' | '2' | '3';

const loading = ref(true);
const markers = ref<MapMarker[]>([]);
const level = ref<LevelKey>('all');
const myLoc = ref<{ lng: number; lat: number } | null>(null);

/** 真实 GPS 定位（gcj02，与国内地图坐标系一致）。 */
function locate(): void {
  uni.getLocation({
    type: 'gcj02',
    success: (res: any) => {
      myLoc.value = { lng: res.longitude, lat: res.latitude };
      uni.showToast({ title: '已定位到当前位置', icon: 'none' });
    },
    fail: (e: any) => uni.showToast({ title: e?.errMsg ?? '定位失败', icon: 'none' }),
  });
}

const CHIPS: { key: LevelKey; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: '1', label: '一级' },
  { key: '2', label: '二级' },
  { key: '3', label: '三级及以上' },
];

async function load(): Promise<void> {
  loading.value = true;
  try {
    const pts = await fetchAlarmPoints();
    markers.value = mapPointsToMarkers(pts);
  } catch (e: any) {
    uni.showToast({ title: e?.message ?? '加载失败', icon: 'none' });
    markers.value = [];
  } finally {
    loading.value = false;
  }
}

onLoad(load);
onMounted(load);

const filtered = computed<MapMarker[]>(() => {
  if (level.value === 'all') return markers.value;
  if (level.value === '3') return markers.value.filter((m) => (m.level ?? 0) >= 3);
  const lv = Number(level.value);
  return markers.value.filter((m) => m.level === lv);
});

/** 「我的位置」标记：定位后叠加到报警点之上。 */
const myMarker = computed<MapMarker[]>(() =>
  myLoc.value
    ? [{ id: 'me', lng: myLoc.value.lng, lat: myLoc.value.lat, label: '我的位置', level: 0 }]
    : [],
);
const shownMarkers = computed<MapMarker[]>(() => [...filtered.value, ...myMarker.value]);

function setLevel(k: LevelKey): void {
  level.value = k;
}

function viewAll(): void {
  go('/alarms');
}

function onMarkerTap(_markerId: string): void {
  go('/alarms');
}
</script>

<template>
  <view class="mb-page">
    <MobileHeader variant="back" title="报警态势地图" />

    <text v-if="loading" class="mb-loading">加载中…</text>

    <block v-else>
      <view class="chips">
        <view
          v-for="c in CHIPS"
          :key="c.key"
          class="chip"
          :class="level === c.key ? 'chip--active' : ''"
          @click="setLevel(c.key)"
        >
          <text>{{ c.label }}</text>
        </view>
      </view>

      <view class="locate-row">
        <view class="btn-locate" :class="myLoc ? 'btn-locate--on' : ''" @click="locate">
          <text>{{ myLoc ? '已定位 · 重新定位' : '定位我的位置' }}</text>
        </view>
      </view>

      <MapPanel
        :markers="shownMarkers"
        :center="myLoc || undefined"
        :show-my-location="true"
        height="320rpx"
        label="报警态势"
        @tap="onMarkerTap"
      />

      <view class="mb-stack">
        <view v-if="filtered.length" class="mb-card">
          <text class="mb-card__hint">当前筛选 {{ filtered.length }} 个报警点</text>
        </view>
        <view v-else class="mb-empty"><text class="mb-empty__text">该等级暂无报警</text></view>
      </view>

      <view class="bottom-bar">
        <view class="btn" @click="viewAll">
          <text>查看全部告警</text>
        </view>
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

.chips {
  display: flex;
  gap: var(--space-sm);
  padding: var(--space-md) var(--mb-pad-x);
}

.chip {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 64rpx;
  border-radius: var(--mb-radius-ctrl);
  font-size: var(--mb-fz-form-label);
  color: var(--text-muted-mobile);
  background: var(--card-mobile);
  border: var(--mb-border-w) solid var(--mb-stroke);
}

.chip--active {
  color: #fff;
  background: var(--primary-mobile);
  border-color: var(--primary-mobile);
  font-weight: 600;
}

.locate-row {
  display: flex;
  padding: 0 var(--mb-pad-x) var(--space-sm);
}

.btn-locate {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 72rpx;
  border-radius: var(--mb-radius-ctrl);
  font-size: var(--mb-fz-form-label);
  color: var(--primary-mobile);
  background: rgb(22 119 255 / 8%);
  border: var(--mb-border-w) solid var(--primary-mobile);
}

.btn-locate--on {
  color: #fff;
  background: var(--primary-mobile);
}
.btn-locate:active {
  opacity: 0.85;
}

.mb-stack {
  display: flex;
  flex-direction: column;
  gap: var(--mb-card-gap);
  padding: var(--mb-card-gap) var(--mb-pad-x);
}

.mb-card {
  padding: var(--space-md);
  background: var(--card-mobile);
  border: var(--mb-border-w) solid var(--mb-stroke);
  border-radius: var(--mb-radius-card);
}
.mb-card__hint {
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

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: var(--space-md) var(--mb-pad-x) calc(var(--space-md) + env(safe-area-inset-bottom));
  background: var(--card-mobile);
  border-top: var(--mb-border-w) solid var(--mb-stroke);
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 88rpx;
  border-radius: var(--mb-radius-ctrl);
  background: var(--primary-mobile);
  color: #fff;
  font-size: var(--mb-fz-section);
  font-weight: 600;
}
.btn:active {
  opacity: 0.85;
}
</style>
