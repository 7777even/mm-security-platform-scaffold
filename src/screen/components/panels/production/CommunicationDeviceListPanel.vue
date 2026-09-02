<script setup lang="ts">
import { computed } from 'vue';
import PanelCard from '../../common/PanelCard.vue';
import {
  activeGroups,
  allDevices,
  communicationTab,
  selectedDeviceId,
  selectCommunicationDevice,
  switchCommunicationTab,
} from '../../../lib/composables/useCommunicationDevices';
import type { CommunicationTab } from '../../../lib/data/communicationDeviceMock';

const tabOptions: { key: CommunicationTab; label: string }[] = [
  { key: 'broadcast', label: '广播' },
  { key: 'phone', label: '电话' },
  { key: 'intercom', label: '对讲' },
];

const totalCount = computed(() => allDevices.value.length);

function statusTone(status: string) {
  if (status === '离线') return 'offline';
  if (status === '故障') return 'fault';
  return 'ok';
}
</script>

<template>
  <PanelCard title="" variant="devices" module="production" :show-more="false">
    <template #title>
      <div class="comm-list__title">
        <h3 class="comm-list__heading">通讯设备</h3>
        <span class="comm-list__count">共 {{ totalCount }} 个</span>
      </div>
    </template>

    <div class="comm-list">
      <div class="comm-list__tabs">
        <button
          v-for="opt in tabOptions"
          :key="opt.key"
          type="button"
          class="comm-list__tab"
          :class="{ 'comm-list__tab--active': communicationTab === opt.key }"
          @click="switchCommunicationTab(opt.key)"
        >
          {{ opt.label }}
        </button>
      </div>

      <div class="comm-list__groups">
        <section v-for="group in activeGroups" :key="group.key" class="comm-list__group">
          <div class="comm-list__group-title">{{ group.label }}</div>
          <button
            v-for="device in group.devices"
            :key="device.id"
            type="button"
            class="comm-list__row"
            :class="{ 'comm-list__row--active': selectedDeviceId === device.id }"
            @click="selectCommunicationDevice(device.id)"
          >
            <span class="comm-list__name" :title="device.name">{{ device.name }}</span>
            <span class="comm-list__area">{{ device.area }}</span>
            <span
              class="comm-list__status"
              :class="`comm-list__status--${statusTone(device.status)}`"
            >
              {{ device.status }}
            </span>
            <span v-if="device.type === 'phone'" class="comm-list__direct">直连</span>
          </button>
        </section>
      </div>

      <div class="comm-list__pagination">
        <button type="button" class="comm-list__page" disabled>‹</button>
        <button type="button" class="comm-list__page comm-list__page--active">1</button>
        <button type="button" class="comm-list__page">›</button>
      </div>
    </div>
  </PanelCard>
</template>

<style scoped>
.comm-list__title {
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
}

.comm-list__heading {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: var(--color-text-strong);
  white-space: nowrap;
}

.comm-list__count {
  font-size: 13px;
  color: var(--map-device-offline);
}

.comm-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  gap: 8px;
}

.comm-list__tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  flex-shrink: 0;
}

.comm-list__tab {
  height: 30px;
  border: 1px solid rgb(0 120 200 / 30%);
  border-radius: 2px;
  background: rgb(0 22 48 / 70%);
  color: var(--map-device-offline);
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
}

.comm-list__tab--active {
  color: var(--color-text-strong);
  border-color: rgb(0 180 255 / 55%);
  background: rgb(0 90 160 / 50%);
}

.comm-list__groups {
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
  scrollbar-width: thin;
  scrollbar-color: rgb(0 160 255 / 45%) rgb(0 25 55 / 50%);
}

.comm-list__group-title {
  height: 30px;
  display: flex;
  align-items: center;
  padding: 0 8px;
  border: 1px solid rgb(0 120 200 / 20%);
  border-radius: 2px;
  background: rgb(0 40 78 / 45%);
  color: var(--map-device-offline);
  font-size: 12px;
}

.comm-list__row {
  display: grid;
  grid-template-columns: 1.4fr 0.8fr 0.6fr auto;
  gap: 6px;
  align-items: center;
  min-height: 40px;
  padding: 0 8px;
  border: 1px solid rgb(0 100 180 / 16%);
  border-radius: 2px;
  background: rgb(0 24 50 / 40%);
  color: #e8f2fc;
  font-size: 12px;
  font-family: var(--font-body);
  text-align: left;
  cursor: pointer;
  box-sizing: border-box;
  width: 100%;
}

.comm-list__row:hover {
  border-color: var(--border-glow);
  background: rgb(0 35 70 / 55%);
}

.comm-list__row--active {
  border-color: rgb(0 180 255 / 55%);
  background: rgb(0 70 130 / 45%);
}

.comm-list__name,
.comm-list__area {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.comm-list__status--ok {
  color: #3ecf8e;
}

.comm-list__status--offline {
  color: var(--map-device-offline);
}

.comm-list__status--fault {
  color: #ff6b5a;
}

.comm-list__direct {
  padding: 1px 6px;
  border: 1px solid rgb(0 180 255 / 40%);
  border-radius: 2px;
  color: #6eb5ff;
  font-size: 11px;
  white-space: nowrap;
}

.comm-list__pagination {
  display: flex;
  justify-content: center;
  gap: 6px;
  flex-shrink: 0;
  padding-top: 2px;
}

.comm-list__page {
  min-width: 28px;
  height: 28px;
  padding: 0 6px;
  border: 1px solid var(--btn-border);
  border-radius: 2px;
  background: var(--stat-card-icon-bg);
  color: var(--map-device-offline);
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
}

.comm-list__page:disabled {
  opacity: 0.4;
  cursor: default;
}

.comm-list__page--active {
  color: var(--color-text-strong);
  border-color: rgb(0 180 255 / 55%);
  background: rgb(0 90 160 / 50%);
}
</style>
