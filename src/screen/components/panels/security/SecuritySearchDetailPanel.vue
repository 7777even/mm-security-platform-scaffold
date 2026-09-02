<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import PanelCard from '../../common/PanelCard.vue';
import {
  selectedPersonDetail,
  selectedPersonSearchId,
  selectedVehicleDetail,
  selectedVehicleSearchId,
} from '../../../lib/composables/useSecuritySearchDetail';
import { openSecurityTrack } from '../../../lib/composables/useSecurityTrackView';
import type { SecuritySearchPanelMode } from '../../../lib/composables/useSecuritySearchPanel';

const props = defineProps<{
  mode: SecuritySearchPanelMode;
}>();

const vehicleTabs = [
  { key: 'appointment', label: '预约备案信息' },
  { key: 'waybill', label: '运单信息' },
  { key: 'snapshot', label: '车辆抓拍' },
] as const;

const personTabs = [
  { key: 'appointment', label: '预约备案信息' },
  { key: 'specialOp', label: '特殊作业信息' },
  { key: 'snapshot', label: '人员抓拍' },
] as const;

type VehicleTabKey = (typeof vehicleTabs)[number]['key'];
type PersonTabKey = (typeof personTabs)[number]['key'];

const activeVehicleTab = ref<VehicleTabKey>('appointment');
const activePersonTab = ref<PersonTabKey>('appointment');

const isVehicle = computed(() => props.mode === 'vehicle');
const tabs = computed(() => (isVehicle.value ? vehicleTabs : personTabs));

const panelTitle = computed(() => {
  if (isVehicle.value) return selectedVehicleDetail.value?.plate ?? '车辆详情';
  return selectedPersonDetail.value?.name ?? '人员详情';
});

const vehicleInfoRows = computed(() => {
  const item = selectedVehicleDetail.value;
  if (!item) return [];
  return [
    { label: '车辆类型', value: item.vehicleType },
    { label: '司机姓名', value: item.driverName },
    { label: '联系电话', value: item.driverPhone },
    { label: '所属单位', value: item.company },
    { label: '通行状态', value: item.status },
    { label: '最近通行', value: `${item.gate} · ${item.time}` },
  ];
});

const personInfoRows = computed(() => {
  const item = selectedPersonDetail.value;
  if (!item) return [];
  return [
    { label: '姓名', value: item.name },
    { label: '性别', value: item.gender },
    { label: '联系电话', value: item.phone },
    { label: '所属单位', value: item.company },
    { label: '证件号码', value: item.idNumber },
    { label: '通行状态', value: item.status },
    { label: '最近通行', value: `${item.gate} · ${item.date}` },
  ];
});

watch(
  () => selectedVehicleSearchId.value,
  () => {
    activeVehicleTab.value = 'appointment';
  },
);

watch(
  () => selectedPersonSearchId.value,
  () => {
    activePersonTab.value = 'appointment';
  },
);

function handleViewTrack() {
  if (isVehicle.value && selectedVehicleDetail.value) {
    openSecurityTrack('vehicle', selectedVehicleDetail.value.id);
    return;
  }
  if (selectedPersonDetail.value) {
    openSecurityTrack('person', selectedPersonDetail.value.id);
  }
}
</script>

<template>
  <PanelCard title="" variant="rescue" :show-more="false">
    <template #title>
      <h3 class="search-detail__heading">{{ panelTitle }}</h3>
    </template>

    <div class="search-detail">
      <section class="search-detail__section">
        <h4 class="search-detail__section-title">{{ isVehicle ? '车辆信息' : '人员信息' }}</h4>
        <div class="search-detail__info-block">
          <div
            v-for="row in isVehicle ? vehicleInfoRows : personInfoRows"
            :key="row.label"
            class="detail-row"
          >
            <span class="detail-row__label">{{ row.label }}</span>
            <span class="detail-row__value">{{ row.value }}</span>
          </div>
        </div>
      </section>

      <section class="search-detail__section search-detail__section--grow">
        <h4 class="search-detail__section-title">业务信息</h4>

        <div class="search-detail__tabs">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            type="button"
            class="search-detail__tab"
            :class="{
              'search-detail__tab--active': isVehicle
                ? activeVehicleTab === tab.key
                : activePersonTab === tab.key,
            }"
            @click="
              isVehicle
                ? (activeVehicleTab = tab.key as VehicleTabKey)
                : (activePersonTab = tab.key as PersonTabKey)
            "
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="search-detail__tab-content">
          <template v-if="isVehicle && selectedVehicleDetail">
            <template v-if="activeVehicleTab === 'appointment'">
              <div class="detail-row">
                <span class="detail-row__label">预约编号</span>
                <span class="detail-row__value">{{ selectedVehicleDetail.appointmentNo }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-row__label">预约时段</span>
                <span class="detail-row__value">{{ selectedVehicleDetail.appointmentTime }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-row__label">来访事由</span>
                <span class="detail-row__value">{{ selectedVehicleDetail.visitPurpose }}</span>
              </div>
            </template>

            <template v-else-if="activeVehicleTab === 'waybill'">
              <div class="detail-row">
                <span class="detail-row__label">运单编号</span>
                <span class="detail-row__value">{{ selectedVehicleDetail.waybillNo }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-row__label">货物名称</span>
                <span class="detail-row__value">{{ selectedVehicleDetail.cargo }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-row__label">目的地</span>
                <span class="detail-row__value">{{ selectedVehicleDetail.destination }}</span>
              </div>
            </template>

            <template v-else>
              <div class="search-detail__placeholder">
                <div
                  class="search-detail__snapshot search-detail__snapshot--vehicle"
                  aria-hidden="true"
                />
                <p class="search-detail__placeholder-text">
                  抓拍记录 · {{ selectedVehicleDetail.time }}
                </p>
              </div>
            </template>
          </template>

          <template v-else-if="selectedPersonDetail">
            <template v-if="activePersonTab === 'appointment'">
              <div class="detail-row">
                <span class="detail-row__label">预约编号</span>
                <span class="detail-row__value">{{ selectedPersonDetail.appointmentNo }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-row__label">预约时段</span>
                <span class="detail-row__value">{{ selectedPersonDetail.appointmentTime }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-row__label">来访事由</span>
                <span class="detail-row__value">{{ selectedPersonDetail.visitPurpose }}</span>
              </div>
            </template>

            <template v-else-if="activePersonTab === 'specialOp'">
              <div class="detail-row">
                <span class="detail-row__label">作业类型</span>
                <span class="detail-row__value">{{ selectedPersonDetail.specialOperation }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-row__label">作业区域</span>
                <span class="detail-row__value">{{ selectedPersonDetail.operationArea }}</span>
              </div>
            </template>

            <template v-else>
              <div class="search-detail__placeholder">
                <div
                  class="search-detail__snapshot search-detail__snapshot--person"
                  aria-hidden="true"
                />
                <p class="search-detail__placeholder-text">
                  门禁抓拍 · {{ selectedPersonDetail.gate }}
                </p>
              </div>
            </template>
          </template>
        </div>
      </section>

      <button type="button" class="search-detail__track-btn" @click="handleViewTrack">
        查看轨迹
      </button>
    </div>
  </PanelCard>
</template>

<style scoped>
.search-detail__heading {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #fff;
  white-space: nowrap;
}

.search-detail {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  gap: 10px;
}

.search-detail__section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}

.search-detail__section--grow {
  flex: 1;
  min-height: 0;
}

.search-detail__section-title {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #c8d8ec;
}

.search-detail__info-block {
  padding: 8px 10px;
  border: 1px solid rgb(0 130 210 / 22%);
  border-radius: 2px;
  background: rgb(0 24 50 / 45%);
}

.search-detail__tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  flex-shrink: 0;
}

.search-detail__tab {
  height: 28px;
  padding: 0 10px;
  border: 1px solid rgb(0 120 200 / 28%);
  border-radius: 2px;
  background: rgb(0 22 48 / 55%);
  color: #8aa4c4;
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
  white-space: nowrap;
}

.search-detail__tab--active {
  color: #fff;
  border-color: rgb(0 180 255 / 55%);
  background: rgb(0 90 160 / 50%);
}

.search-detail__tab-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 8px 10px;
  border: 1px solid rgb(0 130 210 / 18%);
  border-radius: 2px;
  background: rgb(0 24 50 / 35%);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-row {
  display: grid;
  grid-template-columns: 72px 1fr;
  gap: 8px;
  padding: 2px 0;
}

.detail-row__label {
  font-size: 12px;
  color: #8aa4c4;
}

.detail-row__value {
  font-size: 13px;
  color: #fff;
  line-height: 1.4;
  word-break: break-all;
}

.search-detail__placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 0;
}

.search-detail__snapshot {
  width: 100%;
  height: 120px;
  border-radius: 2px;
  border: 1px solid rgb(0 130 210 / 28%);
}

.search-detail__snapshot--vehicle {
  background: linear-gradient(135deg, rgb(160 50 40 / 50%), rgb(60 25 20 / 65%));
}

.search-detail__snapshot--person {
  background: linear-gradient(135deg, rgb(0 90 160 / 45%), rgb(0 35 70 / 65%));
}

.search-detail__placeholder-text {
  margin: 0;
  font-size: 12px;
  color: #8aa4c4;
}

.search-detail__track-btn {
  flex-shrink: 0;
  width: 100%;
  height: 36px;
  border: 1px solid rgb(0 180 255 / 45%);
  border-radius: 2px;
  background: rgb(0 90 160 / 45%);
  color: #fff;
  font-size: 14px;
  font-family: var(--font-body);
  cursor: pointer;
  transition:
    background 0.2s,
    border-color 0.2s;
}

.search-detail__track-btn:hover {
  background: rgb(0 110 180 / 55%);
  border-color: rgb(0 200 255 / 60%);
}
</style>
