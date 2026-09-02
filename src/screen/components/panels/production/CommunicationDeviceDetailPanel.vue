<script setup lang="ts">
import { computed } from 'vue';
import PanelCard from '../../common/PanelCard.vue';
import { selectedDevice } from '../../../lib/composables/useCommunicationDevices';

const emit = defineEmits<{
  broadcast: [];
  shout: [];
}>();

const statusClass = computed(() => {
  if (!selectedDevice.value) return '';
  return `comm-detail__status--${selectedDevice.value.status}`;
});
</script>

<template>
  <PanelCard title="" variant="devices" module="production" :show-more="false">
    <template #title>
      <h3 class="comm-detail__heading">{{ selectedDevice?.name ?? '设备详情' }}</h3>
    </template>

    <div v-if="selectedDevice" class="comm-detail">
      <div class="comm-detail__info">
        <div class="comm-detail__row">
          <span>设备名称</span>
          <em>{{ selectedDevice.name }}</em>
        </div>
        <div class="comm-detail__row">
          <span>所属区域</span>
          <em>{{ selectedDevice.area }} · {{ selectedDevice.location }}</em>
        </div>
        <div class="comm-detail__row">
          <span>设备类型</span>
          <em>{{ selectedDevice.detail.category }}</em>
        </div>
        <div class="comm-detail__row">
          <span>运行状态</span>
          <em :class="statusClass">{{ selectedDevice.status }}</em>
        </div>
        <div class="comm-detail__row">
          <span>安装时间</span>
          <em>{{ selectedDevice.detail.installTime }}</em>
        </div>
        <div class="comm-detail__row">
          <span>维护部门</span>
          <em>{{ selectedDevice.detail.owner }}</em>
        </div>
        <div class="comm-detail__row">
          <span>IP 地址</span>
          <em>{{ selectedDevice.detail.ip }}</em>
        </div>
        <div class="comm-detail__row">
          <span>最近巡检</span>
          <em>{{ selectedDevice.detail.lastCheck }}</em>
        </div>
      </div>

      <div class="comm-detail__actions">
        <button type="button" class="comm-detail__btn" @click="emit('broadcast')">发送广播</button>
        <button
          type="button"
          class="comm-detail__btn comm-detail__btn--primary"
          @click="emit('shout')"
        >
          即时喊话
        </button>
      </div>
    </div>

    <div v-else class="comm-detail comm-detail--empty">请在左侧选择通讯设备</div>
  </PanelCard>
</template>

<style scoped>
.comm-detail {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.comm-detail__heading {
  margin: 0;
  color: #fff;
  font-size: 16px;
  font-weight: 500;
}

.comm-detail__info {
  display: grid;
  gap: 8px;
}

.comm-detail__row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 13px;
}

.comm-detail__row span {
  flex-shrink: 0;
  color: #8aa4c4;
}

.comm-detail__row em {
  color: #eaf3ff;
  font-style: normal;
}

.comm-detail__status--在线 {
  color: #3dd68c;
}

.comm-detail__status--离线 {
  color: #8aa4c4;
}

.comm-detail__status--故障 {
  color: #ff7a6a;
}

.comm-detail__actions {
  display: flex;
  gap: 8px;
  margin-top: auto;
  padding-top: 12px;
}

.comm-detail__btn {
  flex: 1;
  height: 32px;
  border: 1px solid rgb(0 120 200 / 30%);
  border-radius: 3px;
  background: rgb(0 22 48 / 65%);
  color: #c8d8ec;
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
}

.comm-detail__btn:hover {
  color: #fff;
  border-color: rgb(0 180 255 / 50%);
}

.comm-detail__btn--primary {
  color: #fff;
  border-color: rgb(0 180 255 / 50%);
  background: rgb(0 90 160 / 50%);
}

.comm-detail--empty {
  align-items: center;
  justify-content: center;
  color: #6e8bb0;
}
</style>
