<script setup lang="ts">
import Icon from '@/components/Icon.vue';
import IconTile from '@/components/IconTile.vue';
import MobileHeader from '@/components/MobileHeader.vue';
import { useAccessibilityModes } from '@/composables/useAccessibilityModes';
import { go } from '@/platform/nav';

// 我的（docs/UI规范-移动端.md §5）。port of apps/mobile/views/profile.vue（RouterLink→go，无 DOM API）。
const userName = '张工';
const userRole = '消防业务管理员 · 储运部 · MM-2018';
const avatarChar = userName.charAt(0);

interface ProfileMenuItem {
  key: string;
  label: string;
  icon: string;
  tone: 'green' | 'teal' | 'blue' | 'orange' | 'navy' | 'red' | 'cyan' | 'slate';
  to: string;
}

const menuItems: ProfileMenuItem[] = [
  { key: 'contacts', label: '通讯录', icon: 'phone', tone: 'green', to: '/contacts' },
  { key: 'duty', label: '今日值班', icon: 'calendar', tone: 'teal', to: '/duty' },
  { key: 'plan', label: '应急预案', icon: 'plan', tone: 'blue', to: '/plans' },
  { key: 'msds', label: '化学品知识（MSDS）', icon: 'flask', tone: 'orange', to: '/msds' },
  { key: 'resource', label: '应急资源', icon: 'resource', tone: 'green', to: '/resources' },
  { key: 'library', label: '辅助资料库', icon: 'book', tone: 'navy', to: '/library' },
  { key: 'drill', label: '演练信息', icon: 'drill', tone: 'red', to: '/drills' },
  { key: 'ops', label: '运维监测看板', icon: 'ops', tone: 'cyan', to: '/ops' },
  { key: 'settings', label: '系统设置', icon: 'settings', tone: 'slate', to: '/settings' },
];

const { outdoor, elder } = useAccessibilityModes();
function toggleOutdoor() {
  outdoor.value = !outdoor.value;
}
function toggleElder() {
  elder.value = !elder.value;
}

function onMenu(item: ProfileMenuItem): void {
  go(item.to);
}
</script>

<template>
  <view class="mb-page">
    <MobileHeader variant="brand" title="我的" />

    <view class="mb-usercard">
      <text class="mb-avatar mb-avatar--on-primary">{{ avatarChar }}</text>
      <view class="mb-usercard__meta">
        <text class="mb-usercard__name">{{ userName }}</text>
        <text class="mb-usercard__role">{{ userRole }}</text>
      </view>
    </view>

    <view class="mb-stack">
      <view class="mb-menu mb-menu-group">
        <view v-for="item in menuItems" :key="item.key" class="mb-menu__item" @click="onMenu(item)">
          <view class="mb-menu__left">
            <IconTile
              :name="item.icon"
              size="md"
              shape="rounded"
              variant="soft"
              :tone="item.tone"
            />
            <text class="mb-menu__label">{{ item.label }}</text>
          </view>
          <Icon name="chevron" size="var(--mb-ico-md)" />
        </view>
      </view>

      <view class="mb-menu">
        <view
          class="mb-menu__item mb-menu__item--btn"
          role="switch"
          :aria-checked="elder"
          @click="toggleElder"
        >
          <view class="mb-menu__left">
            <IconTile name="user" size="md" shape="rounded" variant="soft" tone="indigo" />
            <text class="mb-menu__label">适老模式</text>
          </view>
          <view class="mb-switch" :class="{ 'mb-switch--on': elder }" />
        </view>

        <view
          class="mb-menu__item mb-menu__item--btn"
          role="switch"
          :aria-checked="outdoor"
          @click="toggleOutdoor"
        >
          <view class="mb-menu__left">
            <IconTile name="map" size="md" shape="rounded" variant="soft" tone="amber" />
            <text class="mb-menu__label">户外模式</text>
          </view>
          <view class="mb-switch" :class="{ 'mb-switch--on': outdoor }" />
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.mb-usercard {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin: var(--space-md) var(--mb-pad-x);
  padding: var(--space-md);
  background: var(--mb-hero-bg);
  border-radius: var(--mb-radius-card);
  color: #fff;
}

.mb-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--mb-avatar-md);
  height: var(--mb-avatar-md);
  border-radius: 50%;
  font-size: var(--mb-fz-page);
  font-weight: 700;
}

.mb-avatar--on-primary {
  background: rgb(255 255 255 / 22%);
  color: #fff;
}

.mb-usercard__meta {
  display: flex;
  flex-direction: column;
}

.mb-usercard__name {
  font-size: var(--mb-fz-section);
  font-weight: 700;
}

.mb-usercard__role {
  font-size: var(--mb-fz-tip);
  opacity: 0.9;
}

.mb-stack {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding: 0 var(--mb-pad-x) var(--mb-pad-x);
}

.mb-menu {
  background: var(--card-mobile);
  border: var(--mb-border-w) solid var(--mb-stroke);
  border-radius: var(--mb-radius-card);
  overflow: hidden;
}

.mb-menu__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 96rpx;
  padding: 0 var(--space-md);
  border-bottom: var(--mb-border-w) solid var(--mb-stroke);
}

.mb-menu__item:last-child {
  border-bottom: none;
}

.mb-menu__left {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.mb-menu__label {
  font-size: var(--mb-fz-form-label);
  color: var(--text-title-mobile);
}

.mb-switch {
  width: 84rpx;
  height: 48rpx;
  border-radius: 999rpx;
  background: #d4d9e2;
  position: relative;
  transition: background 0.2s;
}

.mb-switch::after {
  content: '';
  position: absolute;
  top: 4rpx;
  left: 4rpx;
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.2s;
}

.mb-switch--on {
  background: var(--primary-mobile);
}

.mb-switch--on::after {
  transform: translateX(36rpx);
}
</style>
