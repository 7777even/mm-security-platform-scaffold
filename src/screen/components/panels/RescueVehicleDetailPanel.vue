<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import PanelCard from '../common/PanelCard.vue';
import type { RescueVehicleItem } from '@/services/rescueResource';

const props = defineProps<{
  item: RescueVehicleItem;
}>();

const tabs = [
  { key: 'basic', label: '基础信息' },
  { key: 'crew', label: '随车人员及装备' },
] as const;

type TabKey = (typeof tabs)[number]['key'];

const activeTab = ref<TabKey>('basic');

watch(
  () => props.item.id,
  () => {
    activeTab.value = 'basic';
  },
);

const archiveRows = computed(() => [
  { label: '业务对象名称', value: props.item.businessName },
  { label: '车牌号', value: props.item.plate },
  { label: '车辆类型', value: props.item.vehicleTypeFull },
  { label: '所属中队', value: props.item.squadron },
  { label: '车辆负责人', value: props.item.leaderName },
  { label: '负责人联系电话', value: props.item.leaderPhone },
  { label: '当前车辆状态', value: props.item.status },
  { label: '车辆停放点位', value: props.item.parkingLocation },
]);

const hardwareRows = computed(() => [
  { label: '车辆底盘型号', value: props.item.chassisModel },
  { label: '整车出厂日期', value: props.item.manufactureDate },
  { label: '年检到期时间', value: props.item.inspectionExpiry },
  { label: '泡沫罐容积', value: props.item.foamTankVolume },
  { label: '水罐容积', value: props.item.waterTankVolume },
  { label: '最大供水流量', value: props.item.maxWaterFlow },
  { label: '车载泡沫类型', value: props.item.foamType },
]);

const maintenanceRows = computed(() => [
  { label: '上次维保日期', value: props.item.lastMaintenanceDate },
  { label: '下次维保日期', value: props.item.nextMaintenanceDate },
  { label: '累计行驶里程', value: props.item.totalMileage },
  { label: '故障记录', value: props.item.faultRecord },
  { label: '年检状态', value: props.item.inspectionStatus },
]);
</script>

<template>
  <PanelCard :title="item.businessName ?? ''" variant="rescue" :show-more="false">
    <div class="brigade-detail">
      <div class="brigade-detail__tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="brigade-detail__tab"
          :class="{ 'brigade-detail__tab--active': activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <div v-if="activeTab === 'basic'" class="brigade-detail__content">
        <h4 class="detail-section__title">车辆基础档案</h4>
        <div v-for="row in archiveRows" :key="row.label" class="detail-row">
          <span class="detail-row__label">{{ row.label }}</span>
          <span class="detail-row__value">{{ row.value }}</span>
        </div>

        <h4 class="detail-section__title">车辆硬件参数</h4>
        <div v-for="row in hardwareRows" :key="row.label" class="detail-row">
          <span class="detail-row__label">{{ row.label }}</span>
          <span class="detail-row__value">{{ row.value }}</span>
        </div>

        <h4 class="detail-section__title">运维台账</h4>
        <div v-for="row in maintenanceRows" :key="row.label" class="detail-row">
          <span class="detail-row__label">{{ row.label }}</span>
          <span class="detail-row__value">{{ row.value }}</span>
        </div>
      </div>

      <div v-else class="brigade-detail__content">
        <h4 class="detail-section__title">随车值守人员</h4>
        <div class="crew-table-wrap">
          <table class="crew-table">
            <colgroup>
              <col style="width: 11%" />
              <col style="width: 12%" />
              <col style="width: 22%" />
              <col style="width: 40%" />
              <col style="width: 15%" />
            </colgroup>
            <thead>
              <tr>
                <th>岗位</th>
                <th>姓名</th>
                <th>联系电话</th>
                <th>持证资质</th>
                <th>在岗状态</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(member, index) in item.crew" :key="index">
                <td>{{ member.role }}</td>
                <td>{{ member.name }}</td>
                <td>{{ member.phone }}</td>
                <td>{{ member.certificate }}</td>
                <td>{{ member.dutyStatus }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h4 class="detail-section__title">随车搭载救援装备</h4>
        <template v-for="(equip, index) in item.onboardEquipment" :key="index">
          <div class="detail-row">
            <span class="detail-row__label">装备名称</span>
            <span class="detail-row__value">{{ equip.name }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-row__label">随车配备数量</span>
            <span class="detail-row__value">{{ equip.quantity }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-row__label">规格型号</span>
            <span class="detail-row__value">{{ equip.model }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-row__label">下次校验日期</span>
            <span class="detail-row__value">{{ equip.nextCheckDate }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-row__label">装备状态</span>
            <span class="detail-row__value">{{ equip.equipmentStatus }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-row__label">存放位置</span>
            <span class="detail-row__value">{{ equip.storageLocation }}</span>
          </div>
        </template>

        <h4 class="detail-section__title">车载耗材储备</h4>
        <div v-for="row in item.consumables" :key="row.label" class="detail-row">
          <span class="detail-row__label">{{ row.label }}</span>
          <span class="detail-row__value">{{ row.value }}</span>
        </div>

        <h4 class="detail-section__title">出车记录简览</h4>
        <div v-for="row in item.dispatchSummary" :key="row.label" class="detail-row">
          <span class="detail-row__label">{{ row.label }}</span>
          <span class="detail-row__value">{{ row.value }}</span>
        </div>
      </div>
    </div>
  </PanelCard>
</template>

<style scoped>
.brigade-detail {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  gap: 10px;
}

.brigade-detail__tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  flex-shrink: 0;
}

.brigade-detail__tab {
  height: 28px;
  padding: 0 10px;
  border: 1px solid var(--btn-border);
  border-radius: 2px;
  background: var(--stat-card-icon-bg);
  color: var(--map-device-offline);
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
}

.brigade-detail__tab--active {
  color: var(--color-text-strong);
  border-color: rgb(0 180 255 / 55%);
  background: rgb(0 90 160 / 50%);
}

.brigade-detail__content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-right: 2px;
  scrollbar-width: thin;
  scrollbar-color: rgb(0 160 255 / 45%) rgb(0 25 55 / 50%);
}

.brigade-detail__content::-webkit-scrollbar {
  width: 4px;
}

.brigade-detail__content::-webkit-scrollbar-thumb {
  background: rgb(0 140 220 / 35%);
  border-radius: 2px;
}

.detail-section__title {
  margin: 4px 0 0;
  font-size: 13px;
  font-weight: 600;
  color: #d8ecff;
  line-height: 1.35;
}

.detail-section__title:first-child {
  margin-top: 0;
}

.detail-row {
  display: grid;
  grid-template-columns: 88px 1fr;
  gap: 8px;
  padding: 2px 0;
}

.detail-row__label {
  font-size: 12px;
  color: var(--map-device-offline);
}

.detail-row__value {
  font-size: 13px;
  color: var(--color-text-strong);
  line-height: 1.4;
  word-break: break-word;
}

.crew-table-wrap {
  width: 100%;
  overflow-x: auto;
  flex-shrink: 0;
  scrollbar-width: thin;
  scrollbar-color: rgb(0 160 255 / 45%) rgb(0 25 55 / 50%);
}

.crew-table-wrap::-webkit-scrollbar {
  height: 4px;
}

.crew-table-wrap::-webkit-scrollbar-thumb {
  background: rgb(0 140 220 / 35%);
  border-radius: 2px;
}

.crew-table {
  width: 100%;
  min-width: 360px;
  border-collapse: collapse;
  table-layout: fixed;
}

.crew-table th,
.crew-table td {
  padding: 6px 4px;
  font-size: 12px;
  text-align: left;
  vertical-align: top;
  line-height: 1.4;
  word-break: break-word;
  white-space: normal;
}

.crew-table th {
  color: var(--map-device-offline);
  font-weight: 500;
  padding-bottom: 6px;
  border-bottom: 1px solid rgb(0 120 200 / 18%);
}

.crew-table td {
  color: var(--color-text-strong);
  padding-top: 8px;
  padding-bottom: 8px;
}

.crew-table tbody tr + tr td {
  border-top: 1px solid rgb(0 120 200 / 10%);
}
</style>
