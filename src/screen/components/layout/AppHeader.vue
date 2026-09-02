<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { getAssets, type DesignModule } from '../../utils/designAssets';
import { navItems } from '../../lib/data/nav';
import UserMenuDropdown from './UserMenuDropdown.vue';
import WeatherEntry from './WeatherEntry.vue';

const props = withDefaults(
  defineProps<{
    module: DesignModule;
    activeNav: string;
    title?: string;
  }>(),
  {
    title: '安全管控指挥系统',
  },
);

const router = useRouter();
const assets = computed(() => getAssets(props.module));
const currentTime = ref('');
const currentDate = ref('');

const mainNavItems = computed(() => navItems.filter((item) => item.key !== 'warning'));
const warningNavItem = computed(() => navItems.find((item) => item.key === 'warning'));

const navIconSizes = [
  { width: 21, height: 22 },
  { width: 17, height: 16 },
  { width: 19, height: 22 },
  { width: 19, height: 18 },
  { width: 19, height: 19 },
];

function handleNavClick(route?: string) {
  if (route) {
    router.push(route);
  }
}

function updateClock() {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString('zh-CN', { hour12: false });
  currentDate.value = now
    .toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'long',
    })
    .replace(/\//g, '-');
}

const userMenuOpen = ref(false);
const userAreaRef = ref<HTMLElement | null>(null);
const userMenuRef = ref<InstanceType<typeof UserMenuDropdown> | null>(null);

function toggleUserMenu() {
  userMenuOpen.value = !userMenuOpen.value;
}

function closeUserMenu() {
  userMenuOpen.value = false;
}

function handleDocumentClick(event: MouseEvent) {
  if (!userMenuOpen.value) return;
  const target = event.target as Node;
  if (userAreaRef.value?.contains(target)) return;
  if (userMenuRef.value?.panelEl?.contains(target)) return;
  userMenuOpen.value = false;
}

let timer: ReturnType<typeof setInterval>;

onMounted(() => {
  updateClock();
  timer = setInterval(updateClock, 1000);
  document.addEventListener('click', handleDocumentClick);
});

onUnmounted(() => {
  clearInterval(timer);
  document.removeEventListener('click', handleDocumentClick);
});
</script>

<template>
  <header class="app-header">
    <img class="app-header__bg" :src="assets.headerBg" alt="" />

    <div class="app-header__left">
      <img class="app-header__deco" :src="assets.headerTitleDeco" alt="" />
      <h1 class="app-header__title">{{ props.title }}</h1>
      <img class="app-header__title-line" :src="assets.headerTitleLine" alt="" />
      <img class="app-header__title-accent" :src="assets.headerTitleAccent" alt="" />
    </div>

    <div class="app-header__center">
      <nav class="app-header__nav">
        <button
          v-for="(item, index) in mainNavItems"
          :key="item.key"
          class="nav-item"
          :class="{ 'nav-item--active': activeNav === item.key }"
          @click="handleNavClick(item.route)"
        >
          <div v-if="activeNav === item.key" class="nav-item__active">
            <img class="nav-item__active-bg" :src="assets.navActiveBg" alt="" />
            <img class="nav-item__active-line" :src="assets.navActiveLine" alt="" />
          </div>
          <img
            class="nav-item__icon"
            :src="assets.navIcons[index]"
            alt=""
            :style="{
              width: `${navIconSizes[index].width}px`,
              height: `${navIconSizes[index].height}px`,
            }"
          />
          <span class="nav-item__label">{{ item.label }}</span>
        </button>
      </nav>

      <button
        v-if="warningNavItem"
        class="nav-warning"
        :class="{ 'nav-warning--active': activeNav === warningNavItem.key }"
        @click="handleNavClick(warningNavItem.route)"
      >
        <img class="nav-warning__icon" :src="assets.navIcons[5]" alt="" />
        <span class="nav-warning__label">{{ warningNavItem.label }}</span>
      </button>
    </div>

    <div class="app-header__right">
      <WeatherEntry :icon="assets.weatherIcon" />
      <div class="datetime">
        <div class="datetime__time">{{ currentTime }}</div>
        <div class="datetime__date">{{ currentDate }}</div>
      </div>
      <div ref="userAreaRef" class="user-area">
        <button type="button" class="user" @click.stop="toggleUserMenu">
          <img class="user__avatar" :src="assets.userAvatar" alt="" />
          <span class="user__name">管理员</span>
          <img
            class="user__arrow"
            :class="{ 'user__arrow--open': userMenuOpen }"
            :src="assets.userArrow"
            alt=""
          />
        </button>
        <UserMenuDropdown
          ref="userMenuRef"
          :open="userMenuOpen"
          :anchor-el="userAreaRef"
          @close="closeUserMenu"
        />
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: relative;
  height: var(--header-height);
  flex-shrink: 0;
  display: grid;
  grid-template-columns: 507px 1fr minmax(430px, auto);
  align-items: stretch;
  overflow: hidden;
}

.app-header__bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: fill;
  pointer-events: none;
}

.app-header__left {
  position: relative;
  z-index: 1;
  height: 100%;
}

.app-header__deco {
  position: absolute;
  left: 0;
  top: 0;
  width: 507px;
  height: 70px;
  pointer-events: none;
}

.app-header__title {
  position: absolute;
  left: 50px;
  top: 11px;
  margin: 0;
  font-family: var(--font-display);
  font-size: 38px;
  font-weight: 400;
  letter-spacing: 2px;
  color: var(--color-text-strong);
  line-height: 1.15;
  white-space: nowrap;
  text-shadow: 0 0 20px rgb(80 170 255 / 55%);
}

.app-header__title-line {
  position: absolute;
  left: 123px;
  top: 69px;
  width: 172px;
  height: 1px;
  pointer-events: none;
}

.app-header__title-accent {
  position: absolute;
  left: 454px;
  top: 18px;
  width: 41px;
  height: 34.5px;
  pointer-events: none;
}

.app-header__center {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 28px;
  padding-bottom: 8px;
  height: 100%;
}

.app-header__nav {
  display: flex;
  align-items: flex-end;
  gap: 52px;
}

.nav-item {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 14px 6px 0;
  border: none;
  background: transparent;
  cursor: pointer;
  height: 62px;
  box-sizing: border-box;
  flex-shrink: 0;
}

.nav-item__active {
  position: absolute;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
  width: 163px;
  height: 62px;
  pointer-events: none;
  z-index: -1;
}

.nav-item__active-bg {
  width: 163px;
  height: 62px;
  display: block;
}

.nav-item__active-line {
  position: absolute;
  left: 18px;
  bottom: 0;
  width: 120px;
  height: 2px;
}

.nav-item__icon {
  flex-shrink: 0;
  object-fit: contain;
}

.nav-item__label {
  font-size: 20px;
  font-weight: 400;
  color: var(--color-text-strong);
  white-space: nowrap;
  line-height: 1;
}

.nav-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 4px 20px;
  border: none;
  background: transparent;
  cursor: pointer;
  height: 62px;
  box-sizing: border-box;
  flex-shrink: 0;
}

.nav-warning__icon {
  width: 20px;
  height: 18px;
  object-fit: contain;
}

.nav-warning__label {
  font-size: 16px;
  font-weight: 400;
  color: var(--accent-gold);
  white-space: nowrap;
  font-family: 'Microsoft YaHei', var(--font-body);
}

.app-header__right {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 20px;
  padding-right: 20px;
  flex-shrink: 0;
  white-space: nowrap;
}

.weather {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.weather__icon {
  width: 23px;
  height: 16px;
  flex-shrink: 0;
}

.weather__temp {
  font-size: 18px;
  color: var(--color-text-strong);
  font-family: 'Microsoft YaHei', var(--font-body);
  white-space: nowrap;
}

.datetime {
  text-align: left;
  flex-shrink: 0;
}

.datetime__time {
  font-size: 18px;
  color: var(--color-text-strong);
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
  font-family: 'Microsoft YaHei', var(--font-body);
  white-space: nowrap;
}

.datetime__date {
  font-size: 11px;
  color: var(--color-text-strong);
  line-height: 1.3;
  font-family: 'Microsoft YaHei', var(--font-body);
  white-space: nowrap;
}

.user-area {
  position: relative;
  flex-shrink: 0;
}

.user {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  flex-shrink: 0;
}

.user__avatar {
  width: 33px;
  height: 33px;
  flex-shrink: 0;
}

.user__name {
  font-size: 14px;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.user__arrow {
  width: 10px;
  height: 5px;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.user__arrow--open {
  transform: rotate(180deg);
}
</style>
