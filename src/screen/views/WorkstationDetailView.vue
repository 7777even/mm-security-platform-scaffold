<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import DashboardLayout from '../components/layout/DashboardLayout.vue';
import MapPageShell from '../components/map/MapPageShell.vue';
import PanelCard from '../components/common/PanelCard.vue';
import { fetchWorkstationById, type Workstation } from '@/services/dashboard';

const props = defineProps<{
  workstationId: string;
}>();

const router = useRouter();
const loading = ref(true);
const detail = ref<Workstation | null>(null);

const fields = computed(() => {
  const w = detail.value;
  if (!w) return [];
  return [
    { label: '工位名称', value: w.name },
    { label: '工位编号', value: w.id },
    { label: '所属区域', value: w.zone },
    {
      label: '运行状态',
      value: w.online ? '在线' : '离线',
      tone: w.online ? 'is-ok' : 'is-off',
    },
  ];
});

async function load() {
  loading.value = true;
  try {
    detail.value = await fetchWorkstationById(props.workstationId);
  } catch {
    detail.value = null;
  } finally {
    loading.value = false;
  }
}

function goBack() {
  void router.push({ name: 'production' });
}

watch(() => props.workstationId, load, { immediate: true });
onMounted(load);
</script>

<template>
  <MapPageShell min-width="1920px" class="ws-detail-shell">
    <DashboardLayout module="production" active-nav="production" class="ws-detail__layout">
      <div class="ws-detail-page">
        <aside class="ws-detail-page__left">
          <PanelCard title="" variant="facilities" module="production" :show-more="false">
            <template #title>
              <h3 class="ws-detail__panel-title">值守工位详情</h3>
            </template>
            <template #header-extra>
              <button type="button" class="ws-detail__back-btn" @click="goBack">返回</button>
            </template>

            <div class="ws-detail">
              <div v-if="loading" class="ws-detail__state">正在加载值守实时数据…</div>
              <div v-else-if="!detail" class="ws-detail__state ws-detail__state--warn">
                未找到该值守工位（编号：{{ workstationId }}）
              </div>
              <div v-else class="ws-detail__body">
                <div class="ws-detail__rows">
                  <div v-for="f in fields" :key="f.label" class="ws-detail__row">
                    <span>{{ f.label }}</span>
                    <em :class="f.tone">{{ f.value }}</em>
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
.ws-detail__layout :deep(.dashboard-layout__main) {
  padding: 0;
  min-height: 0;
}

.ws-detail-page {
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

.ws-detail-page__left {
  width: 420px;
  min-height: 0;
  pointer-events: auto;
  flex-shrink: 0;
  max-height: calc(100% - 8px);
}

.ws-detail-page__left > :deep(.panel-card) {
  height: 100%;
  min-height: 0;
}

.ws-detail__panel-title {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-strong);
}

.ws-detail__back-btn {
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

.ws-detail {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.ws-detail__state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--map-device-offline);
  font-size: 13px;
}

.ws-detail__state--warn {
  color: var(--color-alarm-2);
}

.ws-detail__body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding-right: 2px;
}

.ws-detail__rows {
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 1px solid rgb(0 120 200 / 18%);
  border-radius: 2px;
  background: rgb(0 24 50 / 35%);
  overflow: hidden;
}

.ws-detail__row {
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid rgb(0 80 140 / 14%);
  font-size: 12px;
}

.ws-detail__row:last-child {
  border-bottom: none;
}

.ws-detail__row span {
  color: var(--map-device-offline);
}

.ws-detail__row em {
  font-style: normal;
  color: #e8f2fc;
}

.is-ok {
  color: var(--color-success) !important;
}

.is-off {
  color: var(--map-device-offline) !important;
}
</style>
