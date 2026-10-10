<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import MobileHeader from '@/components/MobileHeader.vue';
import { getItem, setItem, removeItem } from '@/platform/storage';

const pushEnabled = ref(getItem('setting_push') !== '0');
const cacheEnabled = ref(getItem('setting_cache') !== '0');

function togglePush(): void {
  pushEnabled.value = !pushEnabled.value;
  setItem('setting_push', pushEnabled.value ? '1' : '0');
}
function toggleCache(): void {
  cacheEnabled.value = !cacheEnabled.value;
  setItem('setting_cache', cacheEnabled.value ? '1' : '0');
}

function onPlaceholder(): void {
  uni.showToast({ title: '功能待接入', icon: 'none' });
}

function onLogout(): void {
  uni.showModal({
    title: '退出登录',
    content: '确认退出当前账号？',
    success: (res: { confirm?: boolean }) => {
      if (res.confirm) {
        removeItem('access_token');
        uni.reLaunch({ url: '/pages/login/login' });
      }
    },
  });
}

onLoad(() => {});
</script>

<template>
  <view class="mb-page">
    <MobileHeader variant="back" title="设置" />

    <view class="mb-stack">
      <view class="mb-block">
        <text class="mb-block__title">通用</text>
        <view class="mb-row" @click="togglePush">
          <text class="mb-row__label">消息推送</text>
          <view class="mb-switch" :class="{ 'mb-switch--on': pushEnabled }">
            <view class="mb-switch__knob" />
          </view>
        </view>
        <view class="mb-row" @click="toggleCache">
          <text class="mb-row__label">离线缓存</text>
          <view class="mb-switch" :class="{ 'mb-switch--on': cacheEnabled }">
            <view class="mb-switch__knob" />
          </view>
        </view>
      </view>

      <view class="mb-block">
        <text class="mb-block__title">账号</text>
        <view class="mb-row" @click="onPlaceholder">
          <text class="mb-row__label">修改密码</text>
          <text class="mb-row__arrow">›</text>
        </view>
        <view class="mb-row" @click="onPlaceholder">
          <text class="mb-row__label">关于版本</text>
          <text class="mb-row__arrow">v1.0.0 ›</text>
        </view>
      </view>

      <button type="button" class="mb-btn-ghost mb-btn-block" @click="onLogout">退出登录</button>
    </view>
  </view>
</template>

<style scoped>
.mb-stack {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding: var(--space-md) var(--mb-pad-x);
}

.mb-block {
  display: flex;
  flex-direction: column;
  background: var(--card-mobile);
  border: var(--mb-border-w) solid var(--mb-stroke);
  border-radius: var(--mb-radius-card);
  overflow: hidden;
}

.mb-block__title {
  font-size: var(--mb-fz-help);
  color: var(--text-muted-mobile);
  padding: var(--space-sm) var(--space-md) 0;
}

.mb-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 96rpx;
  padding: 0 var(--space-md);
  border-bottom: var(--mb-border-w) solid var(--mb-stroke);
}

.mb-row:last-child {
  border-bottom: none;
}

.mb-row__label {
  font-size: var(--mb-fz-form-label);
  color: var(--text-title-mobile);
}

.mb-row__arrow {
  font-size: var(--mb-fz-help);
  color: var(--text-muted-mobile);
}

.mb-switch {
  width: 96rpx;
  height: 56rpx;
  border-radius: 28rpx;
  background: #d0d4dc;
  position: relative;
  transition: background 0.2s;
}

.mb-switch--on {
  background: var(--success-mobile);
}

.mb-switch__knob {
  position: absolute;
  top: 4rpx;
  left: 4rpx;
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: #fff;
  transition: left 0.2s;
}

.mb-switch--on .mb-switch__knob {
  left: 44rpx;
}

.mb-btn-ghost {
  background: #fff;
  color: var(--danger-mobile);
  border: 1rpx solid var(--danger-mobile);
  border-radius: var(--mb-radius-ctrl);
  min-height: 88rpx;
  font-size: var(--mb-fz-form-label);
}

.mb-btn-block {
  width: 100%;
}
</style>
