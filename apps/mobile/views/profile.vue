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
        class="mb-menu__item"
        @click="onMenu()"
      >
        <span class="mb-menu__left">
          <span class="mb-menu__ico" :class="`mb-menu__ico--${item.tone}`">
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
          <span class="mb-menu__label">{{ item.label }}</span>
        </span>
        <span class="mb-menu__chevron" aria-hidden="true">›</span>
      </button>
    </section>

    <section class="mb-card mb-setting-group" aria-label="设置">
      <button class="mb-menu__item" type="button" @click="toggleElder">
        <span class="mb-menu__left">
          <span class="mb-menu__ico mb-menu__ico--blue">
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
          <span class="mb-menu__label">适老模式</span>
        </span>
        <span
          class="mb-switch"
          role="switch"
          :aria-checked="String(elder)"
          :class="{ 'mb-switch--on': elder }"
        ></span>
      </button>

      <button class="mb-menu__item" type="button" @click="toggleOutdoor">
        <span class="mb-menu__left">
          <span class="mb-menu__ico mb-menu__ico--orange">
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
          <span class="mb-menu__label">户外模式</span>
        </span>
        <span
          class="mb-switch"
          role="switch"
          :aria-checked="String(outdoor)"
          :class="{ 'mb-switch--on': outdoor }"
        ></span>
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
  width: var(--mb-avatar-md);
  height: var(--mb-avatar-md);
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
  margin: var(--space-xs) 0 0;
  font-size: var(--mb-fz-tip);
  opacity: 0.85;
}

.mb-menu-group,
.mb-setting-group {
  margin: 0 var(--mb-pad-x) var(--mb-card-gap);
  padding: var(--space-xs) var(--mb-pad-x);
}
</style>
