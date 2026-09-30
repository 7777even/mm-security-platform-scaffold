<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import DashboardLayout from '../components/layout/DashboardLayout.vue';
import MapPageShell from '../components/map/MapPageShell.vue';
import PanelCard from '../components/common/PanelCard.vue';
import { fetchRiskWarningById, type RiskWarningItem } from '@/services/production';

const props = defineProps<{
  warningId: string;
}>();

const router = useRouter();
const loading = ref(true);
const detail = ref<RiskWarningItem | null>(null);

const levelClass = computed(() => {
  const l = detail.value?.level;
  return l ? `risk-detail__level--${l}` : '';
});

const fields = computed(() => {
  const w = detail.value;
  if (!w) return [];
  return [
    { label: '风险等级', value: w.levelLabel ?? '--', tone: levelClass.value },
    { label: '风险位置', value: w.location ?? '--' },
    { label: '风险类型', value: w.type ?? '--' },
    { label: '发生时间', value: w.time ?? '--' },
    { label: '责任人', value: w.person ?? '--' },
    { label: '联系方式', value: w.phone ?? '--' },
  ];
});

async function load() {
  loading.value = true;
  try {
    detail.value = await fetchRiskWarningById(Number(props.warningId));
  } catch {
    detail.value = null;
  } finally {
    loading.value = false;
  }
}

function goBack() {
  void router.push({ name: 'production' });
}

watch(() => props.warningId, load, { immediate: true });
onMounted(load);
</script>

<template>
  <MapPageShell min-width="1920px" class="risk-detail-shell">
    <DashboardLayout module="production" active-nav="production" class="risk-detail__layout">
      <div class="risk-detail-page">
        <aside class="risk-detail-page__left">
          <PanelCard title="" variant="risk" module="production" :show-more="false">
            <template #title>
              <h3 class="risk-detail__panel-title">重大风险管控 · 预警详情</h3>
            </template>
            <template #header-extra>
              <button type="button" class="risk-detail__back-btn" @click="goBack">返回</button>
            </template>

            <div class="risk-detail">
              <div v-if="loading" class="risk-detail__state">正在加载风险预警实时数据…</div>
              <div v-else-if="!detail" class="risk-detail__state risk-detail__state--warn">
                未找到该风险预警（ID：{{ warningId }}）
              </div>
              <div v-else class="risk-detail__body">
                <div class="risk-detail__rows">
                  <div v-for="f in fields" :key="f.label" class="risk-detail__row">
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
.risk-detail__layout :deep(.dashboard-layout__main) {
  padding: 0;
  min-height: 0;
}

.risk-detail-page {
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

.risk-detail-page__left {
  width: 420px;
  min-height: 0;
  pointer-events: auto;
  flex-shrink: 0;
  max-height: calc(100% - 8px);
}

.risk-detail-page__left > :deep(.panel-card) {
  height: 100%;
  min-height: 0;
}

.risk-detail__panel-title {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-strong);
}

.risk-detail__back-btn {
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

.risk-detail {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.risk-detail__state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--map-device-offline);
  font-size: 13px;
}

.risk-detail__state--warn {
  color: var(--color-alarm-2);
}

.risk-detail__body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding-right: 2px;
}

.risk-detail__rows {
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 1px solid rgb(0 120 200 / 18%);
  border-radius: 2px;
  background: rgb(0 24 50 / 35%);
  overflow: hidden;
}

.risk-detail__row {
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid rgb(0 80 140 / 14%);
  font-size: 12px;
}

.risk-detail__row:last-child {
  border-bottom: none;
}

.risk-detail__row span {
  color: var(--map-device-offline);
}

.risk-detail__row em {
  font-style: normal;
  color: #e8f2fc;
}

.risk-detail__level--red {
  color: var(--color-danger) !important;
}

.risk-detail__level--orange {
  color: var(--color-alarm-2) !important;
}

.risk-detail__level--yellow {
  color: var(--color-alarm-3) !important;
}
</style>
