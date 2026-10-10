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

    <view class="mb-chips">
      <view
        v-for="f in chips"
        :key="f"
        class="mb-chip"
        :class="{ 'mb-chip--on': filter === f }"
        @click="filter = f"
        >{{ f }}</view
      >
    </view>

    <view v-if="loading" class="mb-loading">加载中…</view>

    <view v-else-if="filtered.length === 0" class="mb-empty">
      <view class="mb-empty__art" />
      <p class="mb-empty__text">暂无摄像头</p>
    </view>

    <view v-else class="mb-video-grid">
      <view v-for="c in filtered" :key="c.id" class="mb-video" @click="open(c)">
        <view class="mb-video__thumb">
          <image v-if="thumbs[c.id]" class="mb-video__img" :src="thumbs[c.id]" mode="aspectFill" />
          <Icon v-else name="play" size="var(--mb-ico-play)" />
        </view>
        <view class="video__head">
          <view class="mb-video__name">{{ c.name }}</view>
          <text class="tag" :class="isOnline(c) ? 'tag--success' : 'tag--danger'">
            {{ isOnline(c) ? '在线' : '离线' }}
          </text>
        </view>
        <p class="video__meta">{{ c.location || '—' }} · {{ c.cameraType || '' }}</p>
      </view>
    </view>
  </view>
</template>

<style scoped>
.mb-loading {
  text-align: center;
  color: var(--mb-muted);
  padding: var(--space-lg) 0;
}

.mb-video__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.video__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-xs);
}

.video__meta {
  margin: 0;
  font-size: var(--mb-fz-tip);
  color: var(--mb-body);
}
</style>
