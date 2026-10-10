<script setup lang="ts">
import { computed, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import MobileHeader from '@/components/MobileHeader.vue';
import Icon from '@/components/Icon.vue';
import { fetchVideoCameras, fetchCameraSnapshot, type VideoCamera } from '@/platform/api';
import { go } from '@/platform/nav';

const loading = ref(true);
const list = ref<VideoCamera[]>([]);
const filter = ref<string>('全部');
/** 摄像头 id → 快照 base64（真实截图端点）。 */
const thumbs = ref<Record<string, string>>({});

const isOnline = (c: VideoCamera) => c.status === 'live' || c.status === 'ai';

const filtered = computed(() => {
  if (filter.value === '在线') return list.value.filter(isOnline);
  if (filter.value === '离线') return list.value.filter((c) => !isOnline(c));
  return list.value;
});

const chips = ['全部', '在线', '离线'];

async function load() {
  loading.value = true;
  try {
    const res = await fetchVideoCameras(1, 100);
    const items = res.list ?? [];
    list.value = items;
    // 并行拉取每个摄像头的真实快照（失败不阻塞其余卡片）。
    await Promise.all(
      items.map(async (c) => {
        try {
          const url = await fetchCameraSnapshot(c.id);
          thumbs.value = { ...thumbs.value, [String(c.id)]: url };
        } catch {
          /* 离线/无图 → 留占位图标 */
        }
      }),
    );
  } catch (e: any) {
    uni.showToast({ title: e?.message ?? '加载失败', icon: 'none' });
    list.value = [];
  } finally {
    loading.value = false;
  }
}

function open(c: VideoCamera) {
  go('/videos/' + c.id);
}

onLoad(load);
</script>

<template>
  <view class="mb-page">
    <MobileHeader variant="back" title="视频监控" />

    <view class="filters">
      <view
        v-for="f in chips"
        :key="f"
        class="chip"
        :class="{ 'chip--on': filter === f }"
        @click="filter = f"
        >{{ f }}</view
      >
    </view>

    <view v-if="loading" class="state">加载中…</view>

    <view v-else-if="filtered.length === 0" class="state">暂无摄像头</view>

    <view v-else class="grid">
      <view v-for="c in filtered" :key="c.id" class="card" @click="open(c)">
        <view class="thumb">
          <image v-if="thumbs[c.id]" class="thumb-img" :src="thumbs[c.id]" mode="aspectFill" />
          <Icon v-else name="play" size="48rpx" />
        </view>
        <view class="meta">
          <view class="name">{{ c.name }}</view>
          <view class="sub">{{ c.location || '—' }}</view>
          <view class="row">
            <text class="badge" :class="isOnline(c) ? 'badge--on' : 'badge--off'">
              {{ isOnline(c) ? '在线' : '离线' }}
            </text>
            <text class="type">{{ c.cameraType || '' }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.filters {
  display: flex;
  gap: 16rpx;
  padding: 20rpx var(--mb-pad-x);
}

.chip {
  min-height: 44px;
  display: flex;
  align-items: center;
  padding: 0 28rpx;
  border-radius: 999rpx;
  background: rgb(255 255 255 / 8%);
  color: #c9d4e3;
  font-size: 26rpx;
}

.chip--on {
  background: var(--primary-mobile);
  color: #fff;
}

.state {
  text-align: center;
  color: #8a97a8;
  padding: 80rpx 0;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  padding: 0 var(--mb-pad-x) 40rpx;
}

.card {
  background: rgb(255 255 255 / 5%);
  border-radius: var(--mb-radius-card);
  overflow: hidden;
}

.thumb {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%;
  background: #0b1626;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.thumb-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.meta {
  padding: 16rpx;
}

.name {
  font-size: 28rpx;
  color: #eaf0f7;
  line-height: 1.3;
}

.sub {
  font-size: 22rpx;
  color: #8a97a8;
  margin-top: 4rpx;
}

.row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 10rpx;
}

.badge {
  font-size: 20rpx;
  padding: 2rpx 12rpx;
  border-radius: 6rpx;
}

.badge--on {
  color: var(--success-mobile);
  background: rgb(40 199 111 / 15%);
}

.badge--off {
  color: #8a97a8;
  background: rgb(138 151 168 / 15%);
}

.type {
  font-size: 20rpx;
  color: #8a97a8;
}
</style>
