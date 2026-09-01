<!--
  DeviceDetailDialog — 通讯设备详情（二级界面 deviceDetail）
  对标参考 CommunicationDeviceDetailPanel：展示选中通讯设备的基础档案 + 运行状态，
  并提供「发送广播 / 即时喊话」入口（经 useCommunicationInteraction 进入对应二级界面）。
  详情数据消费 communicationDeviceMock（getCommunicationDevice），与左侧列表同源。
  规范约束（AGENTS.md §3）：零硬编码色，仅用 token；状态色取规范映射（在线/故障→语义色，离线→次字灰）。
-->
<script setup lang="ts">
import { computed } from 'vue';
import ScreenDialog from '@/components/fire/ScreenDialog.vue';
import { useCommunicationInteraction } from '@/composables/useCommunicationInteraction';
import type { CommunicationDevice } from '@/services/map-data/communicationDeviceMock';

const props = defineProps<{ device?: CommunicationDevice }>();
const emit = defineEmits<{ close: [] }>();

const ia = useCommunicationInteraction();

const statusClass = computed(() => {
  if (!props.device) return '';
  return `comm-detail__status--${props.device.status}`;
});

function sendBroadcast(): void {
  ia.openOneKeyBroadcast();
}
function shout(): void {
  if (props.device) ia.openSingleBroadcast(props.device);
}
</script>

<template>
  <ScreenDialog :open="true" :title="props.device?.name ?? '设备详情'" @close="emit('close')">
    <div v-if="props.device" class="comm-detail">
      <div class="comm-detail__info">
        <div class="comm-detail__row">
          <span>设备名称</span>
          <em>{{ props.device.name }}</em>
        </div>
        <div class="comm-detail__row">
          <span>所属区域</span>
          <em>{{ props.device.area }} · {{ props.device.location }}</em>
        </div>
        <div class="comm-detail__row">
          <span>设备类型</span>
          <em>{{ props.device.detail.category }}</em>
        </div>
        <div class="comm-detail__row">
          <span>运行状态</span>
          <em :class="statusClass">{{ props.device.status }}</em>
        </div>
        <div class="comm-detail__row">
          <span>安装时间</span>
          <em>{{ props.device.detail.installTime }}</em>
        </div>
        <div class="comm-detail__row">
          <span>维护部门</span>
          <em>{{ props.device.detail.owner }}</em>
        </div>
        <div class="comm-detail__row">
          <span>IP 地址</span>
          <em>{{ props.device.detail.ip }}</em>
        </div>
        <div class="comm-detail__row">
          <span>最近巡检</span>
          <em>{{ props.device.detail.lastCheck }}</em>
        </div>
      </div>

      <div class="comm-detail__actions">
        <button type="button" class="comm-detail__btn" @click="sendBroadcast">发送广播</button>
        <button type="button" class="comm-detail__btn comm-detail__btn--primary" @click="shout">
          即时喊话
        </button>
      </div>
    </div>

    <div v-else class="comm-detail comm-detail--empty">未选择设备</div>
  </ScreenDialog>
</template>

<style scoped>
.comm-detail {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  gap: var(--space-md);
}

.comm-detail__info {
  display: grid;
  gap: var(--space-sm);
}

.comm-detail__row {
  display: flex;
  align-items: baseline;
  gap: var(--space-sm);
  font-size: var(--font-size-biz);
}

.comm-detail__row span {
  flex-shrink: 0;
  width: 76px;
  color: var(--color-text-muted);
}

.comm-detail__row em {
  color: var(--color-text-strong);
  font-style: normal;
}

.comm-detail__status--在线 {
  color: var(--color-success);
}

.comm-detail__status--离线 {
  color: var(--color-text-muted);
}

.comm-detail__status--故障 {
  color: var(--color-danger);
}

.comm-detail__actions {
  display: flex;
  gap: var(--space-sm);
  margin-top: auto;
  padding-top: var(--space-md);
  border-top: 1px solid color-mix(in srgb, var(--panel-border) 60%, transparent);
}

.comm-detail__btn {
  flex: 1;
  height: 34px;
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--color-accent) 8%, transparent);
  color: var(--color-text-strong);
  font-size: var(--font-size-biz);
  font-family: var(--font-body, sans-serif);
  cursor: pointer;
}

.comm-detail__btn:hover {
  border-color: var(--color-accent);
}

.comm-detail__btn--primary {
  border: none;
  color: var(--color-on-primary);
  background: var(--btn-bg-primary);
  font-weight: 600;
}

.comm-detail__btn--primary:hover {
  filter: brightness(1.08);
}

.comm-detail--empty {
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
}
</style>
