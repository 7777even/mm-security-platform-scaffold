<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import MapPageShell from '../components/map/MapPageShell.vue';
import ProductionMap from '../components/map/ProductionMap.vue';
import CommunicationDeviceListPanel from '../components/panels/production/CommunicationDeviceListPanel.vue';
import CommunicationDeviceDetailPanel from '../components/panels/production/CommunicationDeviceDetailPanel.vue';
import OneKeyBroadcastDialog from '../components/panels/production/OneKeyBroadcastDialog.vue';
import SinglePointBroadcastDialog from '../components/panels/production/SinglePointBroadcastDialog.vue';
import {
  communicationDrawerOpen,
  selectedDevice,
  switchCommunicationTab,
} from '../lib/composables/useCommunicationDevices';
import type { CommunicationTab } from '@/services/communication';
import { useShellRoute } from '../lib/composables/useShellRoute';

const router = useRouter();
const shellRoute = useShellRoute();
const oneKeyOpen = ref(false);
const singleOpen = ref(false);

const tabMap: Record<string, CommunicationTab> = {
  broadcast: 'broadcast',
  phone: 'phone',
  intercom: 'intercom',
};

watch(
  () => shellRoute.query.value.tab,
  (tab) => {
    if (typeof tab === 'string' && tabMap[tab]) {
      switchCommunicationTab(tabMap[tab]);
    }
  },
  { immediate: true },
);

onMounted(() => {
  communicationDrawerOpen.value = true;
});

onUnmounted(() => {
  communicationDrawerOpen.value = false;
});

function goBack() {
  void router.push({ name: 'production' });
}
</script>

<template>
  <MapPageShell min-width="1920px" class="comm-view">
    <template #map>
      <ProductionMap />
    </template>

    <template #floating>
      <button type="button" class="comm-view__back" @click="goBack">返回生产应急</button>

      <aside class="comm-view__drawer comm-view__drawer--left">
        <CommunicationDeviceListPanel />
      </aside>

      <aside v-if="selectedDevice" class="comm-view__drawer comm-view__drawer--right">
        <CommunicationDeviceDetailPanel @broadcast="oneKeyOpen = true" @shout="singleOpen = true" />
      </aside>

      <div class="comm-view__bottom">
        <div class="comm-view__pagination">1 2 3 4 5</div>
        <div class="comm-view__actions">
          <button type="button" class="comm-view__btn" @click="oneKeyOpen = true">发送广播</button>
          <button type="button" class="comm-view__btn" @click="singleOpen = true">单点广播</button>
          <button
            type="button"
            class="comm-view__btn comm-view__btn--primary"
            :disabled="!selectedDevice"
            @click="singleOpen = true"
          >
            即时喊话
          </button>
        </div>
      </div>
    </template>
  </MapPageShell>

  <OneKeyBroadcastDialog :open="oneKeyOpen" @close="oneKeyOpen = false" />
  <SinglePointBroadcastDialog
    :open="singleOpen"
    :device="selectedDevice"
    @close="singleOpen = false"
  />
</template>

<style scoped>
/*
 * 返回按钮与 ProductionAreaView 的返回钮同一套视觉（36 高 / 2px 圆角 / 同配色），
 * 且同样落位左栏面板左下角的下方（面板底 132 = 84 + 36 + 12 间距）——
 * 原左上角位置会被左栏面板（z-overlay）盖住，等于不可见。
 */
.comm-view__back {
  position: absolute;
  left: 18px;
  bottom: 84px;
  z-index: var(--z-chrome);
  height: 36px;
  padding: 0 18px;
  border: 1px solid rgb(0 150 230 / 45%);
  border-radius: 2px;
  background: var(--map-facility-btn-bg);
  color: #e8f4ff;
  font-size: 14px;
  font-family: var(--font-body);
  cursor: pointer;
  pointer-events: auto;
}

.comm-view__back:hover {
  color: var(--color-text-strong);
  border-color: rgb(0 180 255 / 55%);
}

/*
 * 与 /production/area/:id 详情页（ProductionAreaView）同一套侧栏几何：
 * 左右栏 left/right 18px、top 96px、宽 var(--sidebar-width)（原 520/420 写死宽度
 * 是全大屏仅剩的偏离例）；底部统一让出「返回按钮带(48px) + 操作条(72px)」，
 * 返回钮同样落位面板左下角下方，与 area 页同一模式。
 */
.comm-view__drawer {
  position: absolute;
  top: 96px;
  height: calc(100% - 96px - 132px);
  pointer-events: auto;
  z-index: var(--z-overlay);
}

.comm-view__drawer--left {
  left: 18px;
  width: var(--sidebar-width);
}

.comm-view__drawer--right {
  right: 18px;
  width: var(--sidebar-width);
}

.comm-view__drawer :deep(.panel-card) {
  height: 100%;
  min-height: 0;
}

.comm-view__bottom {
  position: absolute;
  left: 19px;
  right: 38px;
  bottom: 10px;
  height: 62px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: rgb(0 35 75 / 82%);
  pointer-events: auto;
}

.comm-view__pagination {
  color: var(--map-device-offline);
  font-size: 13px;
}

.comm-view__actions {
  display: flex;
  gap: 10px;
}

.comm-view__btn {
  height: 34px;
  padding: 0 16px;
  border: 1px solid rgb(0 120 200 / 30%);
  border-radius: 3px;
  background: var(--btn-bg);
  color: #c8d8ec;
  font-size: 13px;
  font-family: var(--font-body);
  cursor: pointer;
}

.comm-view__btn:hover:not(:disabled) {
  color: var(--color-text-strong);
  border-color: rgb(0 180 255 / 50%);
}

.comm-view__btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.comm-view__btn--primary {
  color: var(--color-text-strong);
  border-color: rgb(0 180 255 / 50%);
  background: rgb(0 90 160 / 50%);
}
</style>
