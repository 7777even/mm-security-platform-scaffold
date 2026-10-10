<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import MobileHeader from '@/components/MobileHeader.vue';
import Icon from '@/components/Icon.vue';
import { fetchVideoCameras, fetchCameraSnapshot, type VideoCamera } from '@/platform/api';
import { back } from '@/platform/nav';

const id = ref<string>('');
const loading = ref(true);
const camera = ref<VideoCamera | null>(null);
/** 真实直播帧（后端快照端点 base64）；streamUrl 有值时优先播放视频流。 */
const frame = ref<string>('');

function onPtz() {
  uni.showToast({ title: '云台控制待后端接入', icon: 'none' });
}

/** 截图保存到相册（App 写文件后保存；H5 不支持则提示长按保存）。 */
function onScreenshot() {
  if (!frame.value) {
    uni.showToast({ title: '暂无画面可截取', icon: 'none' });
    return;
  }
  const u = (globalThis as Record<string, any>).uni;
  if (
    !u ||
    typeof u.getFileSystemManager !== 'function' ||
    typeof u.saveImageToPhotosAlbum !== 'function'
  ) {
    uni.showToast({ title: '请长按画面保存到相册', icon: 'none' });
    return;
  }
  try {
    const fs = u.getFileSystemManager();
    const tmp = `${u.env.USER_DATA_PATH}/snap_${Date.now()}.jpg`;
    fs.writeFile({
      filePath: tmp,
      data: frame.value.split(',')[1],
      encoding: 'base64',
      success: () => {
        u.saveImageToPhotosAlbum({
          filePath: tmp,
          success: () => uni.showToast({ title: '已保存到相册', icon: 'success' }),
          fail: (e: any) =>
            uni.showToast({ title: '保存失败：' + (e?.errMsg ?? ''), icon: 'none' }),
        });
      },
      fail: () => uni.showToast({ title: '截图保存失败', icon: 'none' }),
    });
  } catch {
    uni.showToast({ title: '当前环境不支持保存', icon: 'none' });
  }
}

function onFullscreen() {
  if (frame.value) {
    uni.previewImage({ urls: [frame.value], current: frame.value });
    return;
  }
  uni.showToast({ title: '暂无画面', icon: 'none' });
}

async function load() {
  loading.value = true;
  try {
    const res = await fetchVideoCameras(1, 100);
    const found = (res.list ?? []).find((c) => String(c.id) === id.value);
    camera.value = found ?? null;
    if (!found) {
      uni.showToast({ title: '未找到该摄像头', icon: 'none' });
    } else {
      try {
        frame.value = await fetchCameraSnapshot(found.id);
      } catch {
        frame.value = '';
      }
    }
  } catch (e: any) {
    uni.showToast({ title: e?.message ?? '加载失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
}

onLoad((q) => {
  id.value = (q as any).id as string;
  load();
});
</script>

<template>
  <view class="mb-page">
    <MobileHeader variant="back" :title="camera?.name || '视频播放'" @click="back" />

    <view v-if="loading" class="state">加载中…</view>

    <view v-else-if="!camera" class="state">无信号</view>

    <view v-else class="wrap">
      <view class="screen">
        <video
          v-if="camera?.streamUrl"
          class="player"
          :src="camera.streamUrl"
          object-fit="contain"
          :autoplay="true"
          controls
        />
        <image v-else-if="frame" class="player" :src="frame" mode="aspectFill" />
        <view v-else class="play-mask">
          <Icon name="play" size="72rpx" />
        </view>
      </view>

      <view class="info">
        <view class="title">{{ camera.name }}</view>
        <view class="sub">{{ camera.location || '—' }} · {{ camera.cameraType || '' }}</view>
      </view>

      <view class="controls">
        <view class="ctrl" @click="onPtz">
          <Icon name="ptz" size="40rpx" />
          <text>云台</text>
        </view>
        <view class="ctrl" @click="onScreenshot">
          <Icon name="shot" size="40rpx" />
          <text>截图</text>
        </view>
        <view class="ctrl" @click="onFullscreen">
          <Icon name="full" size="40rpx" />
          <text>全屏</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.state {
  text-align: center;
  color: #8a97a8;
  padding: 80rpx 0;
}

.wrap {
  padding: 0 var(--mb-pad-x) 40rpx;
}

.screen {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%;
  background: #000;
  border-radius: var(--mb-radius-card);
  overflow: hidden;
}

.player {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.play-mask {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(255 255 255 / 70%);
}

.info {
  padding: 24rpx 0 8rpx;
}

.title {
  font-size: 32rpx;
  color: #eaf0f7;
}

.sub {
  font-size: 24rpx;
  color: #8a97a8;
  margin-top: 6rpx;
}

.controls {
  display: flex;
  justify-content: space-around;
  margin-top: 24rpx;
}

.ctrl {
  min-height: 44px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 0 32rpx;
  color: #c9d4e3;
  font-size: 24rpx;
}
</style>
