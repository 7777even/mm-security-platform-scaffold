<script setup lang="ts">
import { computed } from 'vue';
import type { BollardItem } from '@/services/security';

const props = defineProps<{
  open: boolean;
  item: BollardItem | null;
}>();

const emit = defineEmits<{
  close: [];
}>();

const title = computed(() => props.item?.name ?? '防恐柱详情');

function closeDialog() {
  emit('close');
}

function statusClass(status?: BollardItem['status']) {
  if (status === '正常') return 'bollard-detail__status--normal';
  if (status === '离线') return 'bollard-detail__status--offline';
  return 'bollard-detail__status--fault';
}

function handleRaise() {
  // 占位：升起
}

function handleLower() {
  // 占位：降下
}

function handleTest() {
  // 占位：自检
}
</script>

<template>
  <Teleport to="body">
    <Transition name="bollard-detail-fade">
      <div v-if="open" class="bollard-detail" @click.self="closeDialog">
        <section
          class="bollard-detail__dialog"
          role="dialog"
          aria-modal="true"
          :aria-label="title"
          @click.stop
        >
          <header class="bollard-detail__header">
            <div class="bollard-detail__title-wrap">
              <h3 class="bollard-detail__title">{{ title }}</h3>
              <span v-if="item" class="bollard-detail__meta">{{ item.zone }}</span>
            </div>
            <button type="button" class="bollard-detail__close" @click="closeDialog">×</button>
          </header>

          <div v-if="item" class="bollard-detail__body">
            <div class="bollard-detail__summary">
              <div class="bollard-detail__row">
                <span>设备状态</span>
                <strong class="bollard-detail__status" :class="statusClass(item.status)">
                  {{ item.status }}
                </strong>
              </div>
              <div class="bollard-detail__row"><span>设备编号</span>{{ item.id }}</div>
              <div class="bollard-detail__row">
                <span>坐标</span>{{ item.longitude }}, {{ item.latitude }}
              </div>
            </div>

            <div class="bollard-detail__actions">
              <button
                type="button"
                class="bollard-detail__btn bollard-detail__btn--primary"
                @click="handleRaise"
              >
                升起
              </button>
              <button type="button" class="bollard-detail__btn" @click="handleLower">降下</button>
              <button type="button" class="bollard-detail__btn" @click="handleTest">自检</button>
            </div>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.bollard-detail {
  position: fixed;
  inset: 0;
  z-index: var(--z-toast);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgb(0 10 24 / 72%);
}

.bollard-detail__dialog {
  display: flex;
  flex-direction: column;
  width: min(560px, 100%);
  border: 1px solid rgb(0 148 236 / 45%);
  border-radius: 4px;
  background: linear-gradient(180deg, rgb(8 28 58 / 98%), rgb(5 20 40 / 98%));
  box-shadow: 0 14px 36px rgb(0 0 0 / 42%);
  overflow: hidden;
}

.bollard-detail__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-shrink: 0;
  padding: 12px 16px;
  border-bottom: 1px solid var(--panel-head-line);
  background: rgb(0 18 40 / 60%);
}

.bollard-detail__title-wrap {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.bollard-detail__title {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: var(--color-text-strong);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bollard-detail__meta {
  font-size: 12px;
  color: var(--map-device-offline);
}

.bollard-detail__close {
  width: 28px;
  height: 28px;
  border: 1px solid rgb(0 130 210 / 35%);
  border-radius: 2px;
  background: rgb(0 28 58 / 65%);
  color: #c8d8ec;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  flex-shrink: 0;
}

.bollard-detail__body {
  padding: 12px 16px 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bollard-detail__summary {
  border: 1px solid rgb(0 130 210 / 18%);
  border-radius: 2px;
  background: rgb(0 24 50 / 40%);
  padding: 10px 12px;
}

.bollard-detail__row {
  display: grid;
  grid-template-columns: 70px 1fr;
  gap: 8px;
  font-size: 12px;
  color: #e8f2fc;
  padding: 6px 0;
  border-bottom: 1px solid rgb(0 80 140 / 14%);
}

.bollard-detail__row:last-child {
  border-bottom: none;
}

.bollard-detail__row span {
  color: var(--map-device-offline);
}

.bollard-detail__status {
  justify-self: start;
  padding: 1px 8px;
  border-radius: 2px;
  border: 1px solid rgb(255 255 255 / 25%);
  font-weight: 600;
}

.bollard-detail__status--normal {
  color: var(--color-success);
  border-color: rgb(61 214 140 / 40%);
}

.bollard-detail__status--offline {
  color: var(--map-device-offline);
  border-color: rgb(140 160 185 / 30%);
}

.bollard-detail__status--fault {
  color: var(--color-warning);
  border-color: rgb(240 180 41 / 35%);
}

.bollard-detail__actions {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
}

.bollard-detail__btn {
  height: 34px;
  padding: 0 12px;
  border: 1px solid var(--btn-border);
  border-radius: 2px;
  background: var(--btn-bg);
  color: #c8d8ec;
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
  white-space: nowrap;
}

.bollard-detail__btn--primary {
  color: var(--color-text-strong);
  border-color: var(--border-glow);
  background: rgb(0 90 160 / 45%);
}

.bollard-detail-fade-enter-active,
.bollard-detail-fade-leave-active {
  transition: opacity 0.22s ease;
}

.bollard-detail-fade-enter-from,
.bollard-detail-fade-leave-to {
  opacity: 0;
}
</style>
