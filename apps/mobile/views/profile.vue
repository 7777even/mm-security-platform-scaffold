<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import TabBar from '../components/TabBar.vue';
import MobileHeader from '../components/MobileHeader.vue';
import { useAccessibilityModes } from '../composables/useAccessibilityModes';

const userName = ref('张工');
const userRole = ref('消防业务管理员 · 储运部 · MM-2018');
const avatarChar = userName.value.charAt(0);

type Tone = 'green' | 'blue' | 'orange' | 'red';

interface ProfileMenuItem {
  key: string;
  label: string;
  tone: Tone;
}
const menuItems: ProfileMenuItem[] = [
  { key: 'contacts', label: '通讯录', tone: 'green' },
  { key: 'duty', label: '今日值班', tone: 'green' },
  { key: 'plan', label: '应急预案', tone: 'blue' },
  { key: 'msds', label: '化学品知识（MSDS）', tone: 'orange' },
  { key: 'resource', label: '应急资源', tone: 'green' },
  { key: 'library', label: '辅助资料库', tone: 'blue' },
  { key: 'drill', label: '演练信息', tone: 'red' },
  { key: 'ops', label: '运维监测看板', tone: 'blue' },
  { key: 'settings', label: '系统设置', tone: 'blue' },
];

const ICON_PATHS: Record<string, string> = {
  contacts: 'M4 5h16v14H4zM9 10a2 2 0 104 0M9 14c0-1.4 2-2 4-2s4 .6 4 2',
  duty: 'M4 5h16v15H4zM4 9h16M8 3v4M16 3v4',
  plan: 'M7 3h7l4 4v14H7zM14 3v4h4M9 12h6M9 16h6',
  msds: 'M9 3h6v3l3 4v11H6V10l3-4zM9 3v3h6V3',
  resource: 'M12 3l8 3v6c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V6z',
  library: 'M5 4h4v16H5zM11 4h4v16h-4zM17 5l3 1-2 14-3-1z',
  drill: 'M13 2L4 14h7l-1 8 9-12h-7z',
  ops: 'M4 20V10M9 20V4M14 20v-7M19 20V8',
  settings:
    'M12 9a3 3 0 100 6 3 3 0 000-6zM4 12h2M18 12h2M12 4v2M12 18v2M6.5 6.5l1.5 1.5M16 16l1.5 1.5M17.5 6.5L16 8M8 16l-1.5 1.5',
  elder: 'M12 4a4 4 0 100 8 4 4 0 000-8zM4 20c0-4 4-6 8-6s8 2 8 6',
  outdoor: 'M12 3a9 9 0 109 9 7 7 0 01-9-9z',
};

const TONE_COLOR: Record<Tone, string> = {
  green: 'var(--success-mobile)',
  blue: 'var(--primary-mobile)',
  orange: 'var(--warning-mobile)',
  red: 'var(--danger-mobile)',
};

const { outdoor, elder } = useAccessibilityModes();
function toggleOutdoor() {
  outdoor.value = !outdoor.value;
}
function toggleElder() {
  elder.value = !elder.value;
}
function onMenu() {
  ElMessage.info('功能建设中');
}
</script>

<template>
  <div class="mb-page profile-page">
    <MobileHeader variant="brand" title="我的" />

    <section class="mb-user-card" aria-label="用户信息">
      <span class="mb-user-avatar">{{ avatarChar }}</span>
      <div class="mb-user-meta">
        <p class="mb-user-name">{{ userName }}</p>
        <p class="mb-user-role">{{ userRole }}</p>
      </div>
    </section>

    <section class="mb-card mb-menu-group" aria-label="功能菜单">
      <button
        v-for="item in menuItems"
        :key="item.key"
        type="button"
        class="mb-menu-item"
        @click="onMenu()"
      >
        <span
          class="mb-menu-ico"
          :class="`tone-${item.tone}`"
          :style="{ color: TONE_COLOR[item.tone] }"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path :d="ICON_PATHS[item.key]" />
          </svg>
        </span>
        <span class="mb-menu-label">{{ item.label }}</span>
        <span class="mb-menu-arrow" aria-hidden="true">›</span>
      </button>
    </section>

    <section class="mb-card mb-setting-group" aria-label="设置">
      <button class="mb-setting-item" type="button" @click="toggleElder">
        <span class="mb-setting-ico tone-blue">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path :d="ICON_PATHS.elder" />
          </svg>
        </span>
        <span class="mb-setting-label">适老模式</span>
        <span class="mb-switch" role="switch" :aria-checked="String(elder)" :class="{ on: elder }">
          <span class="mb-switch__knob" />
        </span>
      </button>

      <button class="mb-setting-item" type="button" @click="toggleOutdoor">
        <span class="mb-setting-ico tone-orange">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path :d="ICON_PATHS.outdoor" />
          </svg>
        </span>
        <span class="mb-setting-label">户外模式</span>
        <span
          class="mb-switch"
          role="switch"
          :aria-checked="String(outdoor)"
          :class="{ on: outdoor }"
        >
          <span class="mb-switch__knob" />
        </span>
      </button>
    </section>

    <TabBar active="profile" />
  </div>
</template>

<style scoped>
.profile-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--bg-mobile);
}

.mb-user-card {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin: var(--mb-card-gap) var(--mb-pad-x);
  padding: var(--space-lg) var(--mb-pad-x);
  border-radius: var(--mb-radius-card);
  background: var(--mb-usercard-bg);
  color: var(--mb-usercard-fg);
}

.mb-user-avatar {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: var(--mb-fz-section);
  font-weight: 700;
  color: var(--primary-mobile);
  background: var(--primary-mobile-soft);
}

.mb-user-meta {
  min-width: 0;
}

.mb-user-name {
  margin: 0;
  font-size: var(--mb-fz-section);
  font-weight: 700;
}

.mb-user-role {
  margin: 4px 0 0;
  font-size: var(--mb-fz-tip);
  opacity: 0.85;
}

.mb-menu-group,
.mb-setting-group {
  margin: 0 var(--mb-pad-x) var(--mb-card-gap);
  padding: 4px var(--mb-pad-x);
}

.mb-menu-item,
.mb-setting-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  width: 100%;
  min-height: var(--mb-row-h); /* 触控热区 48 */
  padding: 10px 0;
  background: transparent;
  border: none;
  border-bottom: var(--mb-border-w, 1px) solid var(--color-border);
  text-align: left;
  cursor: pointer;
}

.mb-menu-group .mb-menu-item:last-child,
.mb-setting-group .mb-setting-item:last-child {
  border-bottom: none;
}

.mb-menu-ico,
.mb-setting-ico {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: grid;
  place-items: center;
}

.mb-menu-ico svg,
.mb-setting-ico svg {
  width: 20px;
  height: 20px;
}

.tone-green {
  background: var(--mb-menu-green-soft);
  color: var(--success-mobile);
}

.tone-blue {
  background: var(--mb-menu-blue-soft);
  color: var(--primary-mobile);
}

.tone-orange {
  background: var(--mb-menu-orange-soft);
  color: var(--warning-mobile);
}

.tone-red {
  background: var(--mb-menu-red-soft);
  color: var(--danger-mobile);
}

.mb-menu-label,
.mb-setting-label {
  flex: 1;
  min-width: 0;
  font-size: var(--mb-fz-help);
  color: var(--text-title-mobile);
}

.mb-menu-arrow {
  flex-shrink: 0;
  color: var(--text-muted-mobile);
  font-size: 22px;
  line-height: 1;
}

.mb-switch {
  flex-shrink: 0;
  width: 44px;
  height: 26px;
  border-radius: 999px;
  background: var(--color-border);
  position: relative;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.mb-switch.on {
  background: var(--primary-mobile);
}

.mb-switch__knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  transition: transform var(--transition-fast);
}

.mb-switch.on .mb-switch__knob {
  transform: translateX(18px);
}
</style>
