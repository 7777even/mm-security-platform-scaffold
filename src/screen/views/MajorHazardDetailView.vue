<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import DashboardLayout from '../components/layout/DashboardLayout.vue';
import MapPageShell from '../components/map/MapPageShell.vue';
import PanelCard from '../components/common/PanelCard.vue';
import { useWorldMarkerScreenPositions } from '../lib/composables/useCesiumScreenAnchor';
import { getSharedMap, onSharedMapReady } from '../lib/composables/sharedCesiumBridge';
import { levelTone, resolveMajorHazardDetail, type HazardLevel } from '../lib/data/majorHazardMock';

const props = defineProps<{
  hazardId: string;
}>();

const router = useRouter();
const detail = computed(() => resolveMajorHazardDetail(props.hazardId));
const activeTab = ref<'basic' | 'monitor' | 'video' | 'material' | 'evacuation' | 'operation'>(
  'basic',
);

const tabs = [
  { key: 'basic', label: '基本信息' },
  { key: 'monitor', label: '监测点位' },
  { key: 'video', label: '视频点位' },
  { key: 'material', label: '危化品与应急物资' },
  { key: 'evacuation', label: '疏散路线' },
  { key: 'operation', label: '应急操作' },
] as const;

const { styleFor } = useWorldMarkerScreenPositions(() => {
  const height = getSharedMap()?.getBoundaryModelTopHeight?.() ?? 72.05;
  const d = detail.value;
  return [
    {
      key: String(d.id),
      longitude: d.longitude,
      latitude: d.latitude,
      height,
    },
  ];
});

function levelClass(level: HazardLevel) {
  return `hazard-detail__level--${levelTone(level)}`;
}

async function flyToHazard() {
  const map = getSharedMap();
  const d = detail.value;
  const height = map?.getBoundaryModelTopHeight?.() ?? 72.05;
  await map?.flyToWorldPositions?.({
    positions: [{ longitude: d.longitude, latitude: d.latitude, height }],
    duration: 0.9,
    pitchDeg: -48,
    rangeMultiplier: 1.8,
    panOnly: true,
  });
}

function goBack() {
  void router.push({ name: 'majorHazardList' });
}

watch(
  () => props.hazardId,
  () => {
    activeTab.value = 'basic';
    void flyToHazard();
  },
);

onMounted(() => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => void flyToHazard());
  });
  onSharedMapReady(() => void flyToHazard());
});
</script>

<template>
  <MapPageShell min-width="1920px" class="hazard-detail-shell">
    <template #map>
      <div class="hazard-detail-map">
        <div
          class="hazard-marker"
          :class="`hazard-marker--${levelTone(detail.level)}`"
          :style="styleFor(String(detail.id))"
        >
          <span class="hazard-marker__label">{{ detail.name }}</span>
          <span class="hazard-marker__badge">危</span>
          <span class="hazard-marker__stem" aria-hidden="true" />
        </div>
      </div>
    </template>

    <DashboardLayout module="production" active-nav="production" class="hazard-detail__layout">
      <div class="hazard-detail-page">
        <aside class="hazard-detail-page__left">
          <PanelCard title="" variant="facilities" module="production" :show-more="false">
            <template #title>
              <h3 class="hazard-detail__panel-title">重大危险源详情</h3>
            </template>
            <template #header-extra>
              <button type="button" class="hazard-detail__back-btn" @click="goBack">返回</button>
            </template>
            <div class="hazard-detail">
              <div class="hazard-detail__tabs">
                <button
                  v-for="tab in tabs"
                  :key="tab.key"
                  type="button"
                  class="hazard-detail__tab"
                  :class="{ 'hazard-detail__tab--active': activeTab === tab.key }"
                  @click="activeTab = tab.key"
                >
                  {{ tab.label }}
                </button>
              </div>

              <div class="hazard-detail__body">
                <template v-if="activeTab === 'basic'">
                  <h4 class="hazard-detail__name">{{ detail.name }}</h4>
                  <div class="hazard-detail__code">重大危险源编码：{{ detail.code }}</div>

                  <div class="hazard-detail__rows">
                    <div class="hazard-detail__row">
                      <span>类别</span>
                      <em>{{ detail.category }}</em>
                    </div>
                    <div class="hazard-detail__row">
                      <span>级别</span>
                      <em :class="levelClass(detail.level)">{{ detail.level }}</em>
                    </div>
                    <div class="hazard-detail__row">
                      <span>R值</span>
                      <em>{{ detail.rValue }}</em>
                    </div>
                    <div class="hazard-detail__row">
                      <span>投用日期</span>
                      <em>{{ detail.commissionDate }}</em>
                    </div>
                    <div class="hazard-detail__row">
                      <span>重点监管工艺</span>
                      <em>{{ detail.keyProcess ? '是' : '否' }}</em>
                    </div>
                    <div class="hazard-detail__row">
                      <span>是否在化工园区</span>
                      <em>{{ detail.inChemicalPark ? '是' : '否' }}</em>
                    </div>
                  </div>

                  <div class="hazard-detail__section">
                    <div class="hazard-detail__section-title">联系人</div>
                    <div v-for="c in detail.contacts" :key="c.role" class="hazard-detail__contact">
                      <span>{{ c.role }}</span>
                      <em>{{ c.name }} · {{ c.phone }}</em>
                    </div>
                  </div>

                  <div class="hazard-detail__section">
                    <div class="hazard-detail__section-title">重大危险源档案</div>
                    <div v-for="file in detail.files" :key="file.id" class="hazard-detail__file">
                      <span :title="file.name">{{ file.name }}</span>
                      <button type="button" class="hazard-detail__file-btn">查看</button>
                    </div>
                  </div>
                </template>

                <template v-else-if="activeTab === 'monitor'">
                  <div v-for="m in detail.monitors" :key="m.id" class="hazard-detail__list-item">
                    <span>{{ m.name }}</span>
                    <em :class="m.status === '正常' ? 'is-ok' : 'is-off'">{{ m.status }}</em>
                  </div>
                </template>

                <template v-else-if="activeTab === 'video'">
                  <div v-for="v in detail.videos" :key="v.id" class="hazard-detail__list-item">
                    <span>{{ v.name }}</span>
                    <em :class="v.status === '正常' ? 'is-ok' : 'is-off'">{{ v.status }}</em>
                  </div>
                </template>

                <template v-else-if="activeTab === 'material'">
                  <div v-for="c in detail.chemicals" :key="c.id" class="hazard-detail__list-item">
                    <span>{{ c.name }}</span>
                    <em>{{ c.amount }}</em>
                  </div>
                </template>

                <template v-else-if="activeTab === 'evacuation'">
                  <div
                    v-for="route in detail.evacuationRoutes"
                    :key="route.id"
                    class="hazard-detail__list-item hazard-detail__list-item--column"
                  >
                    <span class="hazard-detail__route-name">{{ route.name }}</span>
                    <em class="hazard-detail__route-path">
                      {{ route.from }} → {{ route.via }} → {{ route.to }}
                    </em>
                    <em :class="route.status === '畅通' ? 'is-ok' : 'is-off'">{{
                      route.status
                    }}</em>
                  </div>
                </template>

                <template v-else>
                  <div
                    v-for="op in detail.operations"
                    :key="op.id"
                    class="hazard-detail__list-item hazard-detail__list-item--column"
                  >
                    <span>{{ op.name }}</span>
                    <em>{{ op.type }} · {{ op.owner }}</em>
                    <em :class="op.status === '待执行' ? 'is-off' : 'is-ok'">{{ op.status }}</em>
                  </div>
                </template>
              </div>
            </div>
          </PanelCard>
        </aside>
      </div>
    </DashboardLayout>
  </MapPageShell>
</template>

<style scoped>
.hazard-detail__layout :deep(.dashboard-layout__main) {
  padding: 0;
  min-height: 0;
}

.hazard-detail-page {
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

.hazard-detail-page__left {
  width: 420px;
  min-height: 0;
  pointer-events: auto;
  flex-shrink: 0;
  max-height: calc(100% - 8px);
}

.hazard-detail-page__left > :deep(.panel-card) {
  height: 100%;
  min-height: 0;
}

.hazard-detail__panel-title {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-strong);
}

.hazard-detail__back-btn {
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

.hazard-detail {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  gap: 10px;
}

.hazard-detail__tabs {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 4px;
  flex-shrink: 0;
}

.hazard-detail__tab {
  height: 30px;
  padding: 0 4px;
  border: 1px solid var(--btn-border);
  border-radius: 2px;
  background: var(--stat-card-icon-bg);
  color: var(--map-device-offline);
  font-size: 11px;
  font-family: var(--font-body);
  cursor: pointer;
  white-space: nowrap;
}

.hazard-detail__tab--active {
  color: var(--color-text-strong);
  border-color: rgb(0 180 255 / 55%);
  background: rgb(0 90 160 / 50%);
}

.hazard-detail__body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding-right: 2px;
}

.hazard-detail__name {
  margin: 0 0 6px;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-strong);
  line-height: 1.35;
}

.hazard-detail__code {
  margin-bottom: 12px;
  font-size: 12px;
  color: var(--map-device-offline);
}

.hazard-detail__rows {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-bottom: 14px;
  border: 1px solid rgb(0 120 200 / 18%);
  border-radius: 2px;
  background: rgb(0 24 50 / 35%);
  overflow: hidden;
}

.hazard-detail__row {
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid rgb(0 80 140 / 14%);
  font-size: 12px;
}

.hazard-detail__row:last-child {
  border-bottom: none;
}

.hazard-detail__row span {
  color: var(--map-device-offline);
}

.hazard-detail__row em {
  font-style: normal;
  color: #e8f2fc;
}

.hazard-detail__level--l1 {
  color: var(--color-danger) !important;
}

.hazard-detail__level--l2 {
  color: var(--color-alarm-2) !important;
}

.hazard-detail__level--l3 {
  color: var(--color-alarm-3) !important;
}

.hazard-detail__level--l4 {
  color: #4db8ff !important;
}

.hazard-detail__section {
  margin-bottom: 14px;
}

.hazard-detail__section-title {
  margin-bottom: 8px;
  font-size: 13px;
  color: rgb(126 200 255 / 92%);
}

.hazard-detail__contact,
.hazard-detail__file,
.hazard-detail__list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 10px;
  margin-bottom: 4px;
  border: 1px solid rgb(0 100 180 / 16%);
  border-radius: 2px;
  background: rgb(0 24 50 / 35%);
  font-size: 12px;
  color: #c8d8ec;
}

.hazard-detail__contact em,
.hazard-detail__list-item em {
  font-style: normal;
  color: #e8f2fc;
  white-space: nowrap;
}

.hazard-detail__list-item--column {
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 4px;
}

.hazard-detail__route-name {
  color: #e8f2fc;
  font-weight: 500;
}

.hazard-detail__route-path {
  white-space: normal !important;
  color: var(--map-device-offline) !important;
}

.hazard-detail__file span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hazard-detail__file-btn {
  flex-shrink: 0;
  border: none;
  background: transparent;
  color: #4db8ff;
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
  padding: 0;
}

.is-ok {
  color: var(--color-success) !important;
}

.is-off {
  color: var(--map-device-offline) !important;
}

.hazard-detail-map {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: var(--z-chrome);
}

.hazard-marker {
  position: absolute;
  z-index: var(--z-marker);
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: translate(-50%, -100%);
}

.hazard-marker__badge {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-strong);
}

.hazard-marker--l1 .hazard-marker__badge {
  background: var(--map-hazard-l1);
}

.hazard-marker--l2 .hazard-marker__badge {
  background: var(--map-hazard-l2);
}

.hazard-marker--l3 .hazard-marker__badge {
  background: var(--map-hazard-l3);
}

.hazard-marker--l4 .hazard-marker__badge {
  background: var(--map-hazard-l4);
}

.hazard-marker__stem {
  width: 2px;
  height: 16px;
  margin-top: -1px;
  background: linear-gradient(180deg, rgb(255 255 255 / 70%), rgb(255 255 255 / 0%));
}

.hazard-marker__label {
  margin-bottom: 4px;
  max-width: 180px;
  padding: 2px 6px;
  border-radius: 2px;
  background: var(--map-device-label-bg);
  border: 1px solid rgb(0 140 220 / 28%);
  color: var(--color-text-muted);
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
