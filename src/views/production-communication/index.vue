<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import MapPageShell from '@/components/map/MapPageShell.vue';
import ProductionMap from '@/components/map/ProductionMap.vue';
import CommunicationDeviceListPanel from '@/components/panels/production/CommunicationDeviceListPanel.vue';
import CommunicationInteractionLayer from '@/components/production-communication/CommunicationInteractionLayer.vue';
import PkgIcon from '@/components/common/PkgIcon.vue';
import { useCommunicationInteraction } from '@/composables/useCommunicationInteraction';
import {
  communicationDrawerOpen,
  selectedDevice,
  switchCommunicationTab,
} from '@/composables/useCommunicationDevices';
import type { CommunicationTab } from '@/services/map-data/communicationDeviceMock';

const route = useRoute();
const router = useRouter();
const ia = useCommunicationInteraction();

const tabMap: Record<string, CommunicationTab> = {
  broadcast: 'broadcast',
  phone: 'phone',
  intercom: 'intercom',
};

watch(
  () => route.query.tab,
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
  void router.push({ name: 'ops-monitor' });
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

      <div class="comm-view__bottom">
        <div class="comm-view__pagination">1 2 3 4 5</div>
        <div class="comm-view__actions">
          <button type="button" class="comm-view__btn" @click="ia.openOneKeyBroadcast()">
            <PkgIcon name="bell-ringing" size="16px" class="comm-view__btn-icon" />
            发送广播
          </button>
          <button
            type="button"
            class="comm-view__btn"
            @click="ia.openSingleBroadcast(selectedDevice)"
          >
            <PkgIcon name="bell-ringing" size="16px" class="comm-view__btn-icon" />
            单点广播
          </button>
          <button
            type="button"
            class="comm-view__btn comm-view__btn--primary"
            :disabled="!selectedDevice"
            @click="ia.openSingleBroadcast(selectedDevice)"
          >
            <PkgIcon name="bell-ringing" size="16px" class="comm-view__btn-icon" />
            即时喊话
          </button>
        </div>
      </div>
    </template>
  </MapPageShell>

  <CommunicationInteractionLayer />
</template>

<style scoped>
.comm-view__back {
  position: absolute;
  left: 19px;
  top: calc(var(--header-height) + 16px);
  z-index: var(--z-chrome);
  height: 34px;
  padding: 0 14px;
  border: 1px solid color-mix(in srgb, var(--map-border) 35%, transparent);
  border-radius: 4px;
  background: color-mix(in srgb, var(--color-panel) 82%, transparent);
  color: var(--color-text);
  font-size: 13px;
  font-family: var(--font-body);
  cursor: pointer;
  pointer-events: auto;
}

.comm-view__back:hover {
  color: var(--color-text-strong);
  border-color: color-mix(in srgb, var(--color-accent) 55%, transparent);
}

.comm-view__drawer {
  position: absolute;
  top: 112px;
  height: calc(100% - 112px - 154px);
  pointer-events: auto;
  z-index: var(--z-local-12);
}

.comm-view__drawer--left {
  left: 18px;
  width: 520px;
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
  background: color-mix(in srgb, var(--color-panel) 82%, transparent);
  pointer-events: auto;
}

.comm-view__pagination {
  color: var(--color-text-muted);
  font-size: 13px;
}

.comm-view__actions {
  display: flex;
  gap: 10px;
}

.comm-view__btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 34px;
  padding: 0 16px;
  border: 1px solid color-mix(in srgb, var(--map-border) 30%, transparent);
  border-radius: 3px;
  background: var(--btn-bg);
  color: var(--color-text);
  font-size: 13px;
  font-family: var(--font-body);
  cursor: pointer;
}

.comm-view__btn-icon {
  color: var(--color-accent);
}

.comm-view__btn:hover:not(:disabled) {
  color: var(--color-text-strong);
  border-color: color-mix(in srgb, var(--color-accent) 50%, transparent);
}

.comm-view__btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.comm-view__btn--primary {
  color: var(--color-text-strong);
  border-color: color-mix(in srgb, var(--color-accent) 50%, transparent);
  background: var(--map-tab-selected-bg);
}
</style>
