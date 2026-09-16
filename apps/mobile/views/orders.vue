<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import MobileHeader from '../components/MobileHeader.vue';
import Icon from '../components/Icon.vue';
import {
  fetchFireFacilityWorkOrders,
  type FireFacilityWorkOrderItem,
} from '@/services/fireFacility';
import { isOfflineNoBackend, notifyBackendOffline } from '@/services/backendFallback';

/**
 * 报修工单列表（docs/UI规范-移动端.md §5）
 *
 * 数据源：后端 /api/v1/fire-facility/work-orders（消防设施维保工单，与后台
 * 维护保养记录同源），经 fetchFireFacilityWorkOrders 拉取。取消原 data/mock.ts 静态数据；
 * 未连后端时走空态 + 全局离线告警（不回灌假数据）。
 * - 原「区域」筛选无对应后端字段，改为后端实有的「设备类型」筛选，避免无效筛选。
 */
interface Order {
  id: string;
  name: string;
  device: string;
  type: string;
  level: string;
  st: string;
  area: string;
  time: string;
  owner: string;
  deadline: string;
  phen: string;
  pri: string;
}

const loading = ref(false);
const list = ref<Order[]>([]);

function toRow(w: FireFacilityWorkOrderItem): Order {
  const level = w.faultLevel ?? '';
  return {
    id: w.workOrderNo,
    name: w.facilityName ?? w.faultCode ?? '维保工单',
    device: w.facilityName ?? w.facilityCode ?? '—',
    type: w.facilityType ?? '—',
    level,
    st: w.status,
    area: w.facilityType ?? '—',
    time: w.dispatchTime ?? '',
    owner: w.repairPerson ?? '待指派',
    deadline: w.estimatedFinish ?? '—',
    phen: w.description ?? '',
    pri: level,
  };
}

async function load(): Promise<void> {
  loading.value = true;
  try {
    if (isOfflineNoBackend()) {
      notifyBackendOffline('fire-facility', '/fire-facility/work-orders');
      list.value = [];
      return;
    }
    const res = await fetchFireFacilityWorkOrders();
    list.value = (res.items ?? []).map(toRow);
  } catch {
    // 离线 / 请求失败：保持空态（http 层已弹全局 toast）
    list.value = [];
  } finally {
    loading.value = false;
  }
}

const areas = computed(() => ['全部', ...new Set(list.value.map((o) => o.area).filter(Boolean))]);
const statuses = computed(() => ['全部', ...new Set(list.value.map((o) => o.st).filter(Boolean))]);

const area = ref('全部');
const status = ref('全部');

const filtered = computed(() =>
  list.value.filter(
    (o) =>
      (area.value === '全部' || o.area === area.value) &&
      (status.value === '全部' || o.st === status.value),
  ),
);

const LEVEL_TAG: Record<string, string> = {
  紧急: 'tag--danger',
  重要: 'tag--warning',
  一般: 'tag--info',
};

const STATUS_TAG: Record<string, string> = {
  已派单: 'tag--warning',
  维修中: 'tag--info',
  已确认: 'tag--info',
  已闭环: 'tag--success',
};

onMounted(load);
</script>

<template>
  <div class="mb-page">
    <MobileHeader variant="back" title="报修工单" back-to="/home" />

    <div class="orders__filter">
      <select v-model="area" class="mb-select" aria-label="按设备类型筛选">
        <option v-for="a in areas" :key="a" :value="a">
          {{ a === '全部' ? '设备类型：全部' : a }}
        </option>
      </select>
      <select v-model="status" class="mb-select" aria-label="按状态筛选">
        <option v-for="s in statuses" :key="s" :value="s">
          {{ s === '全部' ? '状态：全部' : s }}
        </option>
      </select>
    </div>

    <p v-if="loading" class="mb-loading">加载中…</p>

    <div v-else-if="filtered.length" class="mb-stack">
      <RouterLink
        v-for="o in filtered"
        :key="o.id"
        class="mb-card mb-card--link"
        :to="`/orders/${o.id}`"
      >
        <div class="mb-card__title">
          <span class="orders__device">
            <Icon name="order" size="var(--mb-ico-md)" />
            {{ o.device }}
          </span>
          <span v-if="o.level" class="tag" :class="LEVEL_TAG[o.level] ?? 'tag--info'">{{
            o.level
          }}</span>
        </div>
        <p class="mb-card__desc">{{ o.id }} · {{ o.time }}</p>
        <p class="mb-card__desc">
          状态：<span class="tag" :class="STATUS_TAG[o.st] ?? 'tag--info'">{{ o.st }}</span> ·
          负责人：{{ o.owner }}
        </p>
      </RouterLink>
    </div>

    <div v-else class="mb-empty">
      <div class="mb-empty__art" />
      <p class="mb-empty__text">当前筛选条件下没有工单</p>
    </div>
  </div>
</template>

<style scoped>
.orders__filter {
  display: flex;
  gap: var(--space-sm);
  margin-bottom: var(--mb-card-gap);
}

.orders__device {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  min-width: 0;
  color: var(--primary-mobile);
}

.mb-loading {
  text-align: center;
  color: var(--mb-muted);
  padding: var(--space-lg) 0;
}
</style>
