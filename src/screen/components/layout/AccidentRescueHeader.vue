<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { accidentRescueAssets } from '../../utils/designAssets';
import { useElapsedDuration } from '../../lib/composables/useElapsedDuration';
import { useAccidentRescueNavigation } from '../../lib/composables/useAccidentRescueNavigation';
import UserMenuDropdown from './UserMenuDropdown.vue';
import WeatherEntry from './WeatherEntry.vue';

const props = withDefaults(
  defineProps<{
    incidentTitle: string;
    eventId?: number;
    /** 事件开始时间（报送/报警时间） */
    startedAt?: string;
    /** 已结束事件的结束时间；有值时计时停止 */
    endedAt?: string;
    /** 左上角事件标题风格：应急事件红 / 应急演练琥珀 / 极端天气青 */
    theme?: 'event' | 'drill' | 'weather';
  }>(),
  { theme: 'event' },
);

const assets = computed(() => accidentRescueAssets);
const { goToEmergencyList } = useAccidentRescueNavigation();
const { durationText } = useElapsedDuration({
  startedAt: () => props.startedAt,
  endedAt: () => props.endedAt,
});

const currentTime = ref('');
const currentDate = ref('');
const userMenuOpen = ref(false);
const userAreaRef = ref<HTMLElement | null>(null);
const userMenuRef = ref<InstanceType<typeof UserMenuDropdown> | null>(null);

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

function goBack() {
  const kind = props.theme === 'drill' ? 'drill' : props.theme === 'weather' ? 'event' : 'event';
  goToEmergencyList(kind, props.eventId);
}

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
  <header class="rescue-header" :class="`rescue-header--${theme}`">
    <img class="rescue-header__bg" :src="assets.headerBg" alt="" />
    <img class="rescue-header__title-line" :src="assets.headerTitleLine" alt="" />

    <div class="rescue-header__title-row">
      <button type="button" class="rescue-header__back" title="返回事件列表" @click="goBack">
        <svg
          class="rescue-header__back-icon"
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M14.5 6.5L9 12l5.5 5.5"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <h1 class="rescue-header__incident-title">{{ incidentTitle }}</h1>
    </div>

    <div class="rescue-header__center">
      {{ durationText }}
    </div>

    <div class="rescue-header__right">
      <WeatherEntry />
      <div class="datetime">
        <div class="datetime__time">{{ currentTime }}</div>
        <div class="datetime__date">{{ currentDate }}</div>
      </div>
      <div ref="userAreaRef" class="user-area">
        <button type="button" class="user" @click.stop="toggleUserMenu">
          <div class="user__avatar" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-3.3 0-9 1.7-9 5v1h18v-1c0-3.3-5.7-5-9-5Z"
              />
            </svg>
          </div>
          <span class="user__name">管理员</span>
          <svg
            class="user__arrow"
            :class="{ 'user__arrow--open': userMenuOpen }"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
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
.rescue-header {
  position: relative;
  height: var(--header-height);
  flex-shrink: 0;
  overflow: hidden;

  --rescue-back-color: var(--map-rescue-red);
  --rescue-back-glow: rgb(254 4 4 / 28%);
}

.rescue-header--event {
  --rescue-back-color: var(--map-rescue-red);
  --rescue-back-glow: rgb(254 4 4 / 28%);
}

.rescue-header--drill {
  --rescue-back-color: var(--accent-gold);
  --rescue-back-glow: rgb(236 166 65 / 32%);
}

.rescue-header--weather {
  --rescue-back-color: var(--map-rescue-weather-blue);
  --rescue-back-glow: rgb(0 166 244 / 32%);
}

.rescue-header__bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: fill;
  pointer-events: none;
}

.rescue-header__title-line {
  position: absolute;
  left: 123px;
  bottom: 7px;
  width: 172px;
  height: 1px;
  pointer-events: none;
}

.rescue-header__title-row {
  position: absolute;
  left: 20px;
  top: 12px;
  z-index: var(--z-chrome);
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 420px;
}

.rescue-header__back {
  position: relative;
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 1px solid var(--rescue-back-color);
  border-radius: 50%;
  background: color-mix(in srgb, var(--rescue-back-color) 14%, transparent);
  box-shadow: 0 0 10px var(--rescue-back-glow);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.rescue-header__back:hover {
  background: color-mix(in srgb, var(--rescue-back-color) 24%, transparent);
  box-shadow: 0 0 14px var(--rescue-back-glow);
}

.rescue-header__back-icon {
  display: block;
  width: 14px;
  height: 14px;
  color: var(--rescue-back-color);
  flex-shrink: 0;
}

.rescue-header__incident-title {
  margin: 0;
  min-width: 0;
  font-size: 32px;
  font-weight: 500;
  color: var(--map-rescue-red);
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: 0 0 12px rgb(254 4 4 / 28%);
}

.rescue-header--event .rescue-header__incident-title {
  color: var(--map-rescue-red);
  text-shadow: 0 0 12px rgb(254 4 4 / 28%);
}

.rescue-header--drill .rescue-header__incident-title {
  color: var(--accent-gold);
  text-shadow: 0 0 12px rgb(236 166 65 / 32%);
}

.rescue-header--weather .rescue-header__incident-title {
  color: var(--map-rescue-weather-text);
  text-shadow: 0 0 12px rgb(0 166 244 / 32%);
}

.rescue-header--weather .rescue-header__center {
  text-shadow: 0 0 16px rgb(0 166 244 / 35%);
}

.rescue-header__center {
  position: absolute;
  left: 50%;
  top: 5px;
  transform: translateX(-50%);
  z-index: var(--z-chrome);
  font-size: 36px;
  font-weight: 500;
  color: var(--color-text-strong);
  text-shadow: 0 0 16px rgb(0 160 255 / 35%);
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.rescue-header--drill .rescue-header__center {
  text-shadow: 0 0 16px rgb(236 166 65 / 35%);
}

/* 与主界面主壳 .header-right 对齐：右距 --space-lg、垂直居中、间距 --space-lg */
.rescue-header__right {
  position: absolute;
  right: var(--space-lg);
  top: 0;
  bottom: 0;
  z-index: var(--z-chrome);
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  flex-shrink: 0;
  white-space: nowrap;
}

/* 时间竖排与主界面 .time-stack 同构：左对齐 + min-width 防秒跳抖动 */
.datetime {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  line-height: 1;
  min-width: 160px;
  flex-shrink: 0;
}

.datetime__time {
  font-family: var(--font-family-num);
  font-size: var(--font-size-keynum);
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--color-text-strong);
  text-shadow: 0 0 10px var(--color-accent-glow);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.datetime__date {
  font-family: var(--font-family-base);
  font-size: var(--font-size-helper);
  letter-spacing: 0.5px;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.user-area {
  position: relative;
  flex-shrink: 0;
}

.user {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  flex-shrink: 0;
}

.user__avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--color-accent-2);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 8px var(--color-accent-glow);
  flex-shrink: 0;
}

.user__avatar svg {
  width: 18px;
  height: 18px;
  color: var(--color-text-strong);
}

.user__name {
  font-size: var(--font-size-body);
  color: var(--color-text);
  font-weight: 500;
  letter-spacing: 1px;
  white-space: nowrap;
}

.user__arrow {
  width: var(--icon-sm);
  height: var(--icon-sm);
  color: var(--color-text-muted);
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.user__arrow--open {
  transform: rotate(180deg);
}
</style>
