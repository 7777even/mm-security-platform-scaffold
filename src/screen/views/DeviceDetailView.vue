<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import DashboardLayout from '../components/layout/DashboardLayout.vue';
import MapPageShell from '../components/map/MapPageShell.vue';
import PanelCard from '../components/common/PanelCard.vue';
import { fetchDeviceByCode, type DeviceItem, type DeviceStatus } from '@/services/device';
import {
  deviceStatusLabel,
  deviceStatusTone,
  deviceTypeLabel,
} from '../lib/adapters/deviceAdapter';
import { backendUnavailableWarn } from '@/services/backendFallback';

const props = defineProps<{
  deviceCode: string;
}>();

const router = useRouter();
const loading = ref(true);
const detail = ref<DeviceItem | null>(null);

const statusTone = computed(() =>
  detail.value ? deviceStatusTone(detail.value.status as DeviceStatus) : 'offline',
);

const fields = computed(() => {
  const d = detail.value;
  if (!d) return [];
  const hasCoord = typeof d.lon === 'number' && typeof d.lat === 'number';
  return [
    { label: '设备编码', value: d.deviceCode },
    { label: '设备名称', value: d.deviceName },
    { label: '设备类型', value: deviceTypeLabel(d.deviceType) },
    { label: '所属区域', value: d.zone },
    {
      label: '运行状态',
      value: deviceStatusLabel(d.status as DeviceStatus),
      tone: statusTone.value,
    },
    { label: '经度', value: hasCoord ? String(d.lon) : '--' },
    { label: '纬度', value: hasCoord ? String(d.lat) : '--' },
  ];
});

async function load() {
  loading.value = true;
  try {
    detail.value = await fetchDeviceByCode(props.deviceCode);
  } catch {
    detail.value = null;
    backendUnavailableWarn('device', `/devices/${props.deviceCode}`);
  } finally {
    loading.value = false;
  }
}

function goBack() {
  void router.push({ name: 'production' });
}

watch(() => props.deviceCode, load, { immediate: true });
onMounted(load);
</script>

<template>
  <MapPageShell min-width="1920px" class="device-detail-shell">
    <DashboardLayout module="production" active-nav="production" class="device-detail__layout">
      <div class="device-detail-page">
        <aside class="device-detail-page__left">
          <PanelCard title="" variant="devices" module="production" :show-more="false">
            <template #title>
              <h3 class="device-detail__panel-title">设备台账详情</h3>
            </template>
            <template #header-extra>
              <button type="button" class="device-detail__back-btn" @click="goBack">返回</button>
            </template>

            <div class="device-detail">
              <div v-if="loading" class="device-detail__state">正在加载设备实时数据…</div>
              <div v-else-if="!detail" class="device-detail__state device-detail__state--warn">
                未找到该设备（编码：{{ deviceCode }}）
              </div>
              <div v-else class="device-detail__body">
                <div class="device-detail__rows">
                  <div v-for="f in fields" :key="f.label" class="device-detail__row">
                    <span>{{ f.label }}</span>
                    <em :class="f.tone === 'ok' ? 'is-ok' : f.tone === 'fault' ? 'is-fault' : ''">{{
                      f.value
                    }}</em>
                  </div>
                </div>
              </div>
            </div>
          </PanelCard>
        </aside>
      </div>
    </DashboardLayout>
  </MapPageShell>
</template>

<style scoped>
.device-detail__layout :deep(.dashboard-layout__main) {
  padding: 0;
  min-height: 0;
}

.device-detail-page {
  position: relative;
  display: flex;
  align-items: stretch;
  flex: 1;
  width: 100%;
  height: 100%;
  min-height: 0;
  box-sizing: border-box;
  pointer-events: none;
  padding: 14px 18px 24px;
}

.device-detail-page__left {
  width: 420px;
  min-height: 0;
  pointer-events: auto;
  flex-shrink: 0;
  max-height: calc(100% - 8px);
}

.device-detail-page__left > :deep(.panel-card) {
  height: 100%;
  min-height: 0;
}

.device-detail__panel-title {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-strong);
}

.device-detail__back-btn {
  height: 26px;
  padding: 0 10px;
  border: 1px solid rgb(0 130 210 / 35%);
  border-radius: 2px;
  background: rgb(0 28 58 / 65%);
  color: #c8d8ec;
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
}

.device-detail {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.device-detail__state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--map-device-offline);
  font-size: 13px;
}

.device-detail__state--warn {
  color: var(--color-alarm-2);
}

.device-detail__body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding-right: 2px;
}

.device-detail__rows {
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 1px solid rgb(0 120 200 / 18%);
  border-radius: 2px;
  background: rgb(0 24 50 / 35%);
  overflow: hidden;
}

.device-detail__row {
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid rgb(0 80 140 / 14%);
  font-size: 12px;
}

.device-detail__row:last-child {
  border-bottom: none;
}

.device-detail__row span {
  color: var(--map-device-offline);
}

.device-detail__row em {
  font-style: normal;
  color: #e8f2fc;
}

.is-ok {
  color: var(--color-success) !important;
}

.is-fault {
  color: var(--color-danger) !important;
}
</style>
