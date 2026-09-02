<script setup lang="ts">
import { computed } from 'vue';
import type { GateControlItem } from '../../../lib/data/securityGateControlMock';

const props = defineProps<{
  open: boolean;
  item: GateControlItem | null;
}>();

const emit = defineEmits<{
  close: [];
}>();

const title = computed(() => props.item?.name ?? '道闸详情');

function closeDialog() {
  emit('close');
}

function statusClass(status?: GateControlItem['status']) {
  if (status === '正常') return 'gate-detail__status--normal';
  if (status === '离线') return 'gate-detail__status--offline';
  return 'gate-detail__status--fault';
}

function handleOpen() {
  // 占位：开闸
}

function handleClose() {
  // 占位：关闸
}

function handleAlwaysOpen() {
  // 占位：常开
}

function handleAlwaysClose() {
  // 占位：常关
}
</script>

<template>
  <Teleport to="body">
    <Transition name="gate-detail-fade">
      <div v-if="open" class="gate-detail" @click.self="closeDialog">
        <section
          class="gate-detail__dialog"
          role="dialog"
          aria-modal="true"
          :aria-label="title"
          @click.stop
        >
          <header class="gate-detail__header">
            <div class="gate-detail__title-wrap">
              <h3 class="gate-detail__title">{{ title }}</h3>
              <span v-if="item" class="gate-detail__meta">{{ item.location }}</span>
            </div>
            <button type="button" class="gate-detail__close" @click="closeDialog">×</button>
          </header>

          <div v-if="item" class="gate-detail__body">
            <div class="gate-detail__summary">
              <div class="gate-detail__row">
                <span>设备状态</span>
                <strong class="gate-detail__status" :class="statusClass(item.status)">
                  {{ item.status }}
                </strong>
              </div>
              <div class="gate-detail__row"><span>设备编号</span>{{ item.id }}</div>
              <div class="gate-detail__row">
                <span>坐标</span>{{ item.longitude }}, {{ item.latitude }}
              </div>
            </div>

            <div class="gate-detail__actions">
              <button
                type="button"
                class="gate-detail__btn gate-detail__btn--primary"
                @click="handleOpen"
              >
                开闸
              </button>
              <button type="button" class="gate-detail__btn" @click="handleClose">关闸</button>
              <button type="button" class="gate-detail__btn" @click="handleAlwaysOpen">常开</button>
              <button type="button" class="gate-detail__btn" @click="handleAlwaysClose">
                常关
              </button>
            </div>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.gate-detail {
  position: fixed;
  inset: 0;
  z-index: 2200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgb(0 10 24 / 72%);
}

.gate-detail__dialog {
  display: flex;
  flex-direction: column;
  width: min(600px, 100%);
  border: 1px solid rgb(0 148 236 / 45%);
  border-radius: 4px;
  background: linear-gradient(180deg, rgb(8 28 58 / 98%), rgb(5 20 40 / 98%));
  box-shadow: 0 14px 36px rgb(0 0 0 / 42%);
  overflow: hidden;
}

.gate-detail__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-shrink: 0;
  padding: 12px 16px;
  border-bottom: 1px solid rgb(0 110 190 / 35%);
  background: rgb(0 18 40 / 60%);
}

.gate-detail__title-wrap {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.gate-detail__title {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.gate-detail__meta {
  font-size: 12px;
  color: #8aa4c4;
}

.gate-detail__close {
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

.gate-detail__body {
  padding: 12px 16px 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.gate-detail__summary {
  border: 1px solid rgb(0 130 210 / 18%);
  border-radius: 2px;
  background: rgb(0 24 50 / 40%);
  padding: 10px 12px;
}

.gate-detail__row {
  display: grid;
  grid-template-columns: 70px 1fr;
  gap: 8px;
  font-size: 12px;
  color: #e8f2fc;
  padding: 6px 0;
  border-bottom: 1px solid rgb(0 80 140 / 14%);
}

.gate-detail__row:last-child {
  border-bottom: none;
}

.gate-detail__row span {
  color: #8aa4c4;
}

.gate-detail__status {
  justify-self: start;
  padding: 1px 8px;
  border-radius: 2px;
  border: 1px solid rgb(255 255 255 / 25%);
  font-weight: 600;
}

.gate-detail__status--normal {
  color: #3dd68c;
  border-color: rgb(61 214 140 / 40%);
}

.gate-detail__status--offline {
  color: #8aa4c4;
  border-color: rgb(140 160 185 / 30%);
}

.gate-detail__status--fault {
  color: #f0b429;
  border-color: rgb(240 180 41 / 35%);
}

.gate-detail__actions {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 8px;
}

.gate-detail__btn {
  height: 34px;
  padding: 0 12px;
  border: 1px solid rgb(0 120 200 / 28%);
  border-radius: 2px;
  background: rgb(0 22 48 / 65%);
  color: #c8d8ec;
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
  white-space: nowrap;
}

.gate-detail__btn--primary {
  color: #fff;
  border-color: rgb(0 180 255 / 45%);
  background: rgb(0 90 160 / 45%);
}

.gate-detail-fade-enter-active,
.gate-detail-fade-leave-active {
  transition: opacity 0.22s ease;
}

.gate-detail-fade-enter-from,
.gate-detail-fade-leave-to {
  opacity: 0;
}
</style>
