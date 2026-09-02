<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import PanelCard from '../common/PanelCard.vue';
import type { RescueEquipmentItem } from '../../lib/data/rescueEquipmentMock';

const props = defineProps<{
  item: RescueEquipmentItem;
}>();

const tabs = [
  { key: 'basic', label: '基础信息' },
  { key: 'spec', label: '装备规格' },
  { key: 'maintenance', label: '运维管理' },
] as const;

type TabKey = (typeof tabs)[number]['key'];

const activeTab = ref<TabKey>('basic');

watch(
  () => props.item.id,
  () => {
    activeTab.value = 'basic';
  },
);

const basicRows = computed(() => [
  { label: '装备名称', value: props.item.name },
  { label: '所属中队', value: props.item.squadron },
  { label: '在库数量', value: `${props.item.stockQuantity} 套` },
  { label: '负责人', value: props.item.leaderName },
  { label: '联系电话', value: props.item.leaderPhone },
]);

const specRows = computed(() => [
  { label: '规格型号', value: props.item.model },
  { label: '防护类型', value: props.item.protectionType },
  { label: '配套滤毒罐', value: props.item.filterCanister },
  { label: '有效使用时长', value: props.item.maxContinuousUse },
  { label: '存放位置', value: props.item.storageLocation },
  { label: '采购批次', value: props.item.purchaseBatch },
  { label: '出厂有效期', value: props.item.factoryValidityYears },
  { label: '剩余有效年限', value: props.item.remainingValidity },
]);

const maintenanceRows = computed(() => [
  { label: '上次巡检日期', value: props.item.lastInspectionDate },
  { label: '下次强制检修日期', value: props.item.nextMandatoryMaintenanceDate },
  { label: '装备状态', value: props.item.equipmentStatus },
  { label: '报废预警', value: props.item.scrapWarning },
  { label: '领用登记', value: props.item.issueRegistration },
  { label: '备用配件', value: props.item.spareParts },
]);
</script>

<template>
  <PanelCard :title="item.name" variant="rescue" :show-more="false">
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
        <div v-for="row in basicRows" :key="row.label" class="detail-row">
          <span class="detail-row__label">{{ row.label }}</span>
          <span class="detail-row__value">{{ row.value }}</span>
        </div>
      </div>

      <div v-else-if="activeTab === 'spec'" class="brigade-detail__content">
        <div v-for="row in specRows" :key="row.label" class="detail-row">
          <span class="detail-row__label">{{ row.label }}</span>
          <span class="detail-row__value">{{ row.value }}</span>
        </div>
      </div>

      <div v-else-if="activeTab === 'maintenance'" class="brigade-detail__content">
        <div v-for="row in maintenanceRows" :key="row.label" class="detail-row">
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
  border: 1px solid rgb(0 120 200 / 28%);
  border-radius: 2px;
  background: rgb(0 22 48 / 55%);
  color: #8aa4c4;
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
}

.brigade-detail__tab--active {
  color: #fff;
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
}

.detail-row {
  display: grid;
  grid-template-columns: 88px 1fr;
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
  word-break: break-word;
}
</style>
