<script setup lang="ts">
import { computed, ref } from 'vue';
import PanelCard from '../../common/PanelCard.vue';
import InfoDetailDialog, { type DetailListItem } from '../../common/InfoDetailDialog.vue';
import {
  fetchTvOverview,
  fetchTvMaintenanceOrders,
  type TvMaintenanceOrder,
  type TvMaintenanceOrderItem,
} from '@/services/tv';
import { useScreenAsyncState } from '../../../lib/composables/useScreenAsyncState';
import { usePlantArea } from '../../../lib/composables/usePlantArea';

const { scaleAreaCount } = usePlantArea();
const { data: overview } = useScreenAsyncState('tv', '/tv/overview', fetchTvOverview);
const orders = computed(() => overview.value?.maintenanceOrders ?? []);

/* 工单卡片详情：参考重大危险源实现范式（V88 起后端工单计数来自 fac_tv_maintenance_order 真实台账
   GROUP BY 状态，不再是手填字典值）。点击卡片 → 弹窗列出该状态真实工单清单（可点击）→ 点工单
   再弹该工单详情。数据来源仅做业务化描述，不暴露底层表名。 */
const STATUS_BY_LABEL: Record<string, string> = {
  未接单: 'PENDING',
  处理中: 'PROCESSING',
  已超时: 'OVERTIME',
};

const listOpen = ref(false);
const selectedOrder = ref<TvMaintenanceOrder | null>(null);
const orderItems = ref<TvMaintenanceOrderItem[]>([]);

const orderDetailOpen = ref(false);
const selectedOrderItem = ref<TvMaintenanceOrderItem | null>(null);

async function openDetail(order: TvMaintenanceOrder) {
  selectedOrder.value = order;
  listOpen.value = true;
  const status = STATUS_BY_LABEL[order.label];
  orderItems.value = await fetchTvMaintenanceOrders(status);
}

const orderListFields = computed(() => {
  const o = selectedOrder.value;
  if (!o) return [];
  return [
    { label: '工单状态', value: o.label },
    { label: '实时数量', value: `${scaleAreaCount(o.value)} 单` },
    { label: '数据来源', value: '实时维修工单台账（按工单状态实时统计）' },
  ];
});

const orderListItems = computed<DetailListItem[]>(() =>
  orderItems.value.map((o) => ({
    primary: o.deviceName,
    secondary: [o.orderNo, o.faultDesc].filter(Boolean).join(' · '),
  })),
);

function handleItemClick(_item: DetailListItem, index: number) {
  const order = orderItems.value[index];
  if (!order) return;
  selectedOrderItem.value = order;
  listOpen.value = false;
  orderDetailOpen.value = true;
}

const orderDetailFields = computed(() => {
  const o = selectedOrderItem.value;
  if (!o) return [];
  return [
    { label: '工单编号', value: o.orderNo ?? '--' },
    { label: '设备/点位', value: o.deviceName ?? '--' },
    { label: '故障描述', value: o.faultDesc ?? '--' },
    { label: '工单状态', value: o.statusLabel ?? o.status ?? '--' },
    { label: '派单人', value: o.assignee ?? '未派单' },
    { label: '责任部门', value: o.department ?? '--' },
    { label: '防区编码', value: o.zoneCode ?? '--' },
    { label: '创建时间', value: o.createdAt ?? '--' },
    { label: '计划完成', value: o.planFinishTime ?? '--' },
    { label: '实际完成', value: o.actualFinishTime ?? '未完成' },
    { label: '处理说明', value: o.handleDesc ?? '--' },
  ];
});
</script>

<template>
  <PanelCard title="维修工单" variant="maintenance" module="tv">
    <div class="maintenance-orders">
      <div
        v-for="order in orders"
        :key="order.label"
        class="maintenance-orders__card maintenance-orders__card--clickable"
        :class="`maintenance-orders__card--${order.tone}`"
        role="button"
        tabindex="0"
        @click="openDetail(order)"
        @keydown.enter="openDetail(order)"
      >
        <div class="maintenance-orders__value">{{ scaleAreaCount(order.value) }}</div>
        <div class="maintenance-orders__label">{{ order.label }}</div>
      </div>
    </div>

    <InfoDetailDialog
      :open="listOpen"
      :title="selectedOrder ? `维修工单 · ${selectedOrder.label}` : '维修工单'"
      :fields="orderListFields"
      :items="orderListItems"
      items-clickable
      @close="listOpen = false"
      @item-click="handleItemClick"
    />

    <InfoDetailDialog
      :open="orderDetailOpen"
      :title="selectedOrderItem ? `维修工单 · ${selectedOrderItem.orderNo}` : '维修工单详情'"
      :fields="orderDetailFields"
      @close="orderDetailOpen = false"
    />
  </PanelCard>
</template>

<style scoped>
:deep(.panel-card__content) {
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 8px 10px 12px;
}

.maintenance-orders {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  height: 100%;
  align-content: center;
}

.maintenance-orders__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 72px;
  border-radius: 2px;
  border: 1px solid transparent;
  box-sizing: border-box;
}

.maintenance-orders__card--grey {
  background: linear-gradient(180deg, rgb(90 100 120 / 32%) 0%, rgb(45 52 65 / 55%) 100%);
  border-color: rgb(150 160 180 / 35%);
}

.maintenance-orders__card--blue {
  background: linear-gradient(180deg, rgb(0 110 210 / 42%) 0%, rgb(0 55 130 / 58%) 100%);
  border-color: rgb(0 150 255 / 42%);
}

.maintenance-orders__card--red {
  background: linear-gradient(180deg, rgb(210 55 45 / 42%) 0%, rgb(120 25 20 / 58%) 100%);
  border-color: rgb(255 85 65 / 42%);
}

.maintenance-orders__card--clickable {
  cursor: pointer;
  transition:
    filter 0.2s ease,
    border-color 0.2s ease;
}

.maintenance-orders__card--clickable:hover,
.maintenance-orders__card--clickable:focus-visible {
  filter: brightness(1.25);
  outline: none;
}

.maintenance-orders__value {
  font-size: 26px;
  font-weight: 700;
  color: var(--color-text-strong);
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.maintenance-orders__label {
  margin-top: 6px;
  font-size: 13px;
  color: var(--map-popup-text-blue);
}
</style>
