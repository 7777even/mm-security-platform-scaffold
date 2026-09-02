<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  resolveSecurityTrackPersonDetail,
  resolveSecurityTrackTimeline,
  resolveSecurityTrackTimeRange,
  resolveSecurityTrackVehicleDetail,
  type SecurityTrackMode,
} from '../../../lib/data/securityTrackMock';

const props = defineProps<{
  open: boolean;
  mode: SecurityTrackMode;
  entityId: number | null;
  playing: boolean;
  speed: number;
  progress: number;
}>();

const emit = defineEmits<{
  close: [];
  'update:playing': [value: boolean];
  'update:speed': [value: number];
}>();

const vehicleTabs = [
  { key: 'track', label: '轨迹信息' },
  { key: 'appointment', label: '预约审批信息' },
  { key: 'operation', label: '作业信息' },
] as const;

const personTabs = [
  { key: 'track', label: '轨迹信息' },
  { key: 'appointment', label: '预约审批信息' },
  { key: 'specialOp', label: '特殊作业信息' },
] as const;

type VehicleTabKey = (typeof vehicleTabs)[number]['key'];
type PersonTabKey = (typeof personTabs)[number]['key'];

const activeVehicleTab = ref<VehicleTabKey>('track');
const activePersonTab = ref<PersonTabKey>('track');

const isVehicle = computed(() => props.mode === 'vehicle');
const tabs = computed(() => (isVehicle.value ? vehicleTabs : personTabs));
const activeTab = computed({
  get: () => (isVehicle.value ? activeVehicleTab.value : activePersonTab.value),
  set: (key: string) => {
    if (isVehicle.value) activeVehicleTab.value = key as VehicleTabKey;
    else activePersonTab.value = key as PersonTabKey;
  },
});

const vehicleDetail = computed(() => resolveSecurityTrackVehicleDetail(props.entityId));
const personDetail = computed(() => resolveSecurityTrackPersonDetail(props.entityId));
const timeline = computed(() => resolveSecurityTrackTimeline(props.mode, props.entityId));
const timeRange = computed(() => resolveSecurityTrackTimeRange(props.mode, props.entityId));

const panelTitle = computed(() => (isVehicle.value ? '车辆关联信息' : '人员关联信息'));
const primaryLabel = computed(() =>
  isVehicle.value ? (vehicleDetail.value?.plate ?? '—') : (personDetail.value?.name ?? '—'),
);

const progressPercent = computed(() => Math.max(0, Math.min(100, (props.progress ?? 0) * 100)));

const speedOptions = [
  { label: '1倍速', value: 1 },
  { label: '2倍速', value: 2 },
  { label: '5倍速', value: 5 },
  { label: '10倍速', value: 10 },
  { label: '20倍速', value: 20 },
  { label: '50倍速', value: 50 },
] as const;

function handleMonitorPlayback() {
  // 占位：监控回放
}
</script>

<template>
  <Transition name="st-scene">
    <div v-if="open" class="st-scene" aria-label="安防轨迹场景" role="region">
      <section class="st-scene__right">
        <header class="st-card__head">
          <div class="st-card__title">{{ panelTitle }}</div>
          <button type="button" class="st-card__close" @click="emit('close')">×</button>
        </header>

        <div class="st-profile">
          <div class="st-profile__id">{{ primaryLabel }}</div>
          <template v-if="isVehicle && vehicleDetail">
            <div class="st-kv">
              <span class="st-k">司机</span>
              <span class="st-v">{{ vehicleDetail.driverName }}</span>
            </div>
            <div class="st-kv">
              <span class="st-k">联系电话</span>
              <span class="st-v">{{ vehicleDetail.driverPhone }}</span>
            </div>
            <div class="st-kv">
              <span class="st-k">运输单位</span>
              <span class="st-v">{{ vehicleDetail.company }}</span>
            </div>
            <div class="st-kv">
              <span class="st-k">货物类型</span>
              <span class="st-v">{{ vehicleDetail.cargo }}</span>
            </div>
            <div class="st-kv">
              <span class="st-k">入厂时间</span>
              <span class="st-v">{{ vehicleDetail.time }}</span>
            </div>
          </template>
          <template v-else-if="personDetail">
            <div class="st-kv">
              <span class="st-k">性别</span>
              <span class="st-v">{{ personDetail.gender }}</span>
            </div>
            <div class="st-kv">
              <span class="st-k">联系电话</span>
              <span class="st-v">{{ personDetail.phone }}</span>
            </div>
            <div class="st-kv">
              <span class="st-k">所属单位</span>
              <span class="st-v">{{ personDetail.company }}</span>
            </div>
            <div class="st-kv">
              <span class="st-k">证件号码</span>
              <span class="st-v">{{ personDetail.idNumber }}</span>
            </div>
            <div class="st-kv">
              <span class="st-k">入厂时间</span>
              <span class="st-v">{{ personDetail.date }}</span>
            </div>
          </template>
        </div>

        <div class="st-tabs">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            type="button"
            class="st-tab"
            :class="{ 'st-tab--active': activeTab === tab.key }"
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="st-body">
          <div v-if="activeTab === 'track'" class="st-timeline">
            <div class="st-timeline__filter">
              <span class="st-timeline__filter-label">入厂时间</span>
              <span class="st-timeline__filter-value">{{ timeRange }}</span>
            </div>

            <article v-for="item in timeline" :key="item.id" class="st-timeline__item">
              <div class="st-timeline__rail">
                <span class="st-timeline__dot" :class="`st-timeline__dot--${item.statusTone}`" />
              </div>
              <div class="st-timeline__content">
                <div class="st-timeline__head">
                  <span class="st-timeline__location">{{ item.location }}</span>
                  <span class="st-timeline__status">{{ item.status }}</span>
                </div>
                <div class="st-timeline__time">{{ item.time }}</div>
                <div
                  class="st-timeline__thumb"
                  :class="isVehicle ? 'st-timeline__thumb--vehicle' : 'st-timeline__thumb--person'"
                />
                <div v-if="item.captureHint" class="st-timeline__hint">{{ item.captureHint }}</div>
                <button type="button" class="st-timeline__playback" @click="handleMonitorPlayback">
                  监控回放
                </button>
              </div>
            </article>
          </div>

          <div v-else-if="activeTab === 'appointment'" class="st-block">
            <template v-if="isVehicle && vehicleDetail">
              <div class="st-kv">
                <span class="st-k">预约编号</span>
                <span class="st-v">{{ vehicleDetail.appointmentNo }}</span>
              </div>
              <div class="st-kv">
                <span class="st-k">预约时段</span>
                <span class="st-v">{{ vehicleDetail.appointmentTime }}</span>
              </div>
              <div class="st-kv">
                <span class="st-k">来访事由</span>
                <span class="st-v">{{ vehicleDetail.visitPurpose }}</span>
              </div>
            </template>
            <template v-else-if="personDetail">
              <div class="st-kv">
                <span class="st-k">预约编号</span>
                <span class="st-v">{{ personDetail.appointmentNo }}</span>
              </div>
              <div class="st-kv">
                <span class="st-k">预约时段</span>
                <span class="st-v">{{ personDetail.appointmentTime }}</span>
              </div>
              <div class="st-kv">
                <span class="st-k">来访事由</span>
                <span class="st-v">{{ personDetail.visitPurpose }}</span>
              </div>
            </template>
          </div>

          <div v-else class="st-block">
            <template v-if="isVehicle && vehicleDetail">
              <div class="st-kv">
                <span class="st-k">运单编号</span>
                <span class="st-v">{{ vehicleDetail.waybillNo }}</span>
              </div>
              <div class="st-kv">
                <span class="st-k">货物名称</span>
                <span class="st-v">{{ vehicleDetail.cargo }}</span>
              </div>
              <div class="st-kv">
                <span class="st-k">目的地</span>
                <span class="st-v">{{ vehicleDetail.destination }}</span>
              </div>
            </template>
            <template v-else-if="personDetail">
              <div class="st-kv">
                <span class="st-k">作业类型</span>
                <span class="st-v">{{ personDetail.specialOperation }}</span>
              </div>
              <div class="st-kv">
                <span class="st-k">作业区域</span>
                <span class="st-v">{{ personDetail.operationArea }}</span>
              </div>
            </template>
          </div>
        </div>
      </section>

      <div class="st-bottom" aria-label="轨迹回放控件">
        <div class="st-row st-row--top">
          <div class="st-top__left">
            <span class="st-entity-tag">{{ primaryLabel }}</span>
            <span class="st-entity-type">{{ isVehicle ? '车辆轨迹' : '人员轨迹' }}</span>
            <span class="st-range">{{ timeRange }}</span>
          </div>
        </div>

        <div class="st-row st-row--bottom">
          <button
            type="button"
            class="st-play-icon"
            :class="{ 'st-play-icon--pause': playing }"
            :aria-label="playing ? '暂停回放' : '开始回放'"
            @click="emit('update:playing', !playing)"
          />

          <div
            class="st-progress"
            role="progressbar"
            :aria-valuenow="progressPercent"
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <span class="st-progress__track" />
            <span class="st-progress__bar" :style="{ width: `${progressPercent}%` }" />
            <span class="st-progress__dot" :style="{ left: `calc(${progressPercent}% - 5px)` }" />
          </div>

          <div class="st-speeds" role="group" aria-label="回放倍速">
            <button
              v-for="opt in speedOptions"
              :key="opt.value"
              type="button"
              class="st-speed-btn"
              :class="{ 'st-speed-btn--active': speed === opt.value }"
              @click="emit('update:speed', opt.value)"
            >
              {{ opt.label }}
            </button>
          </div>

          <button type="button" class="st-exit" @click="emit('close')">退出</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.st-scene {
  position: absolute;
  inset: calc(var(--header-height, 105px) + 18px) 18px 18px;
  pointer-events: none;
}

.st-scene__right {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 420px;
  border-radius: 4px;
  border: 1px solid rgb(0 148 236 / 32%);
  background: linear-gradient(180deg, rgb(8 28 58 / 94%), rgb(5 20 40 / 92%));
  box-shadow: 0 16px 40px rgb(0 0 0 / 42%);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  pointer-events: auto;
}

.st-card__head {
  min-height: 42px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgb(0 110 190 / 22%);
  background: rgb(0 18 40 / 60%);
  flex-shrink: 0;
}

.st-card__title {
  font-size: 14px;
  color: var(--color-text-strong);
}

.st-card__close {
  width: 28px;
  height: 28px;
  border-radius: 2px;
  border: 1px solid rgb(0 130 210 / 35%);
  background: rgb(0 28 58 / 65%);
  color: #c8d8ec;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
}

.st-profile {
  padding: 10px 12px;
  border-bottom: 1px solid rgb(0 110 190 / 16%);
  flex-shrink: 0;
}

.st-profile__id {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-warning);
  margin-bottom: 8px;
}

.st-kv {
  display: grid;
  grid-template-columns: 68px 1fr;
  gap: 8px;
  font-size: 12px;
  padding: 3px 0;
}

.st-k {
  color: var(--map-device-offline);
}

.st-v {
  color: #e8f2fc;
  line-height: 1.4;
  word-break: break-all;
}

.st-tabs {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  border-bottom: 1px solid rgb(0 110 190 / 18%);
  flex-shrink: 0;
}

.st-tab {
  height: 34px;
  border: none;
  border-right: 1px solid rgb(0 110 190 / 16%);
  background: rgb(0 22 48 / 62%);
  color: var(--map-device-offline);
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
}

.st-tab:last-child {
  border-right: none;
}

.st-tab--active {
  background: rgb(0 148 236 / 16%);
  color: var(--color-text-strong);
}

.st-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 10px 12px;
}

.st-block {
  border: 1px solid rgb(0 130 210 / 18%);
  border-radius: 2px;
  background: rgb(0 24 50 / 40%);
  padding: 10px;
}

.st-timeline__filter {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
  padding: 6px 8px;
  border: 1px solid rgb(0 120 200 / 22%);
  border-radius: 2px;
  background: rgb(0 22 48 / 50%);
  font-size: 12px;
}

.st-timeline__filter-label {
  color: var(--map-device-offline);
}

.st-timeline__filter-value {
  color: #c8d8ec;
  text-align: right;
}

.st-timeline__item {
  display: grid;
  grid-template-columns: 16px 1fr;
  gap: 8px;
  margin-bottom: 10px;
}

.st-timeline__rail {
  display: flex;
  justify-content: center;
  padding-top: 4px;
}

.st-timeline__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--map-marker-cyan);
  box-shadow: 0 0 8px rgb(55 207 255 / 40%);
}

.st-timeline__dot--enter {
  background: var(--color-success);
  box-shadow: 0 0 8px rgb(61 214 140 / 40%);
}

.st-timeline__dot--exit {
  background: var(--color-danger);
}

.st-timeline__head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 2px;
}

.st-timeline__location {
  font-size: 13px;
  color: var(--color-text-strong);
  font-weight: 500;
}

.st-timeline__status {
  font-size: 11px;
  color: var(--accent-cyan);
  padding: 1px 6px;
  border: 1px solid rgb(106 202 178 / 40%);
  border-radius: 2px;
}

.st-timeline__time {
  font-size: 12px;
  color: var(--map-device-offline);
  margin-bottom: 6px;
}

.st-timeline__thumb {
  height: 56px;
  border-radius: 2px;
  border: 1px solid rgb(0 130 210 / 28%);
  margin-bottom: 6px;
}

.st-timeline__thumb--vehicle {
  background: linear-gradient(135deg, rgb(160 50 40 / 50%), rgb(60 25 20 / 65%));
}

.st-timeline__thumb--person {
  background: linear-gradient(135deg, rgb(0 90 160 / 45%), rgb(0 35 70 / 65%));
}

.st-timeline__hint {
  font-size: 11px;
  color: var(--map-device-offline);
  margin-bottom: 6px;
}

.st-timeline__playback {
  height: 26px;
  padding: 0 10px;
  border: 1px solid rgb(0 130 210 / 35%);
  border-radius: 2px;
  background: rgb(0 28 58 / 65%);
  color: var(--color-accent-2);
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
}

.st-bottom {
  position: absolute;
  left: 18px;
  right: calc(18px + 420px + 14px);
  bottom: 18px;
  padding: 10px 12px;
  border-radius: 4px;
  border: 1px solid rgb(0 148 236 / 28%);
  background: rgb(0 18 40 / 78%);
  backdrop-filter: blur(6px);
  pointer-events: auto;
  z-index: var(--z-toast);
}

.st-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.st-row--top {
  padding-bottom: 10px;
}

.st-row--bottom {
  border-top: 1px solid rgb(0 110 190 / 22%);
  padding-top: 10px;
  flex-wrap: wrap;
}

.st-top__left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex-wrap: wrap;
}

.st-entity-tag {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 10px;
  border-radius: 2px;
  border: 1px solid var(--panel-border);
  background: rgb(0 55 100 / 50%);
  color: var(--color-text-strong);
  font-size: 12px;
}

.st-entity-type {
  font-size: 12px;
  color: var(--accent-cyan);
}

.st-range {
  font-size: 12px;
  color: #c8d8ec;
}

.st-play-icon {
  width: 26px;
  height: 26px;
  padding: 0;
  border-radius: 50%;
  border: 1px solid rgb(0 148 236 / 35%);
  background: rgb(0 22 48 / 72%);
  cursor: pointer;
  position: relative;
  flex: 0 0 auto;
}

.st-play-icon::before {
  content: '';
  position: absolute;
  inset: 0;
  margin: auto;
  width: 0;
  height: 0;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-left: 10px solid rgb(255 255 255 / 92%);
  transform: translateX(1px);
}

.st-play-icon--pause::before {
  border: none;
  width: 10px;
  height: 12px;
  background: linear-gradient(
    90deg,
    rgb(255 255 255 / 92%) 0%,
    rgb(255 255 255 / 92%) 40%,
    transparent 40%,
    transparent 60%,
    rgb(255 255 255 / 92%) 60%,
    rgb(255 255 255 / 92%) 100%
  );
  transform: none;
}

.st-progress {
  position: relative;
  height: 10px;
  flex: 1;
  min-width: 180px;
}

.st-progress__track {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  top: 4px;
  background: rgb(0 148 236 / 18%);
}

.st-progress__bar {
  position: absolute;
  left: 0;
  height: 2px;
  top: 4px;
  background: linear-gradient(90deg, rgb(55 207 255 / 95%), rgb(0 148 236 / 45%));
  transition: width 0.12s linear;
}

.st-progress__dot {
  position: absolute;
  top: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--color-warning);
  box-shadow: 0 0 14px rgb(240 180 41 / 35%);
  transition: left 0.12s linear;
}

.st-speeds {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.st-speed-btn {
  height: 26px;
  padding: 0 8px;
  border-radius: 2px;
  border: 1px solid transparent;
  background: transparent;
  color: #c8d8ec;
  font-size: 11px;
  font-family: var(--font-body);
  cursor: pointer;
  white-space: nowrap;
}

.st-speed-btn--active {
  border-color: rgb(0 180 255 / 55%);
  background: rgb(0 90 160 / 45%);
  color: var(--color-text-strong);
}

.st-exit {
  height: 30px;
  padding: 0 14px;
  border-radius: 2px;
  border: 1px solid rgb(0 148 236 / 35%);
  background: rgb(0 28 58 / 65%);
  color: var(--color-text-strong);
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
  margin-left: auto;
}

.st-scene-enter-active,
.st-scene-leave-active {
  transition:
    opacity 0.16s ease,
    transform 0.2s cubic-bezier(0.22, 1, 0.36, 1);
}

.st-scene-enter-from,
.st-scene-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
