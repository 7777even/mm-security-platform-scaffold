<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import MobileHeader from '../components/MobileHeader.vue';
import Icon from '../components/Icon.vue';
import {
  fetchFireFacilityWorkOrders,
  type FireFacilityWorkOrderItem,
} from '@/services/fireFacility';
import { isOfflineNoBackend, notifyBackendOffline } from '@/services/backendFallback';

/**
 * 报修工单详情（docs/UI规范-移动端.md §5）
 *
 * 数据源：后端 /api/v1/fire-facility/work-orders（按 workOrderNo 取列表内命中项）。
 * 取消原 data/mock.ts 静态数据；未连后端走空态 + 全局离线告警。后端工单无独立详情端点，
 * 采用列表内按工单号匹配（列表已含 timeline 全量字段）。
 */
interface Order {
  id: string;
  device: string;
  type: string;
  level: string;
  st: string;
  time: string;
  owner: string;
  deadline: string;
  phen: string;
}

const route = useRoute();
const loading = ref(false);
const order = ref<Order | null>(null);

function toRow(w: FireFacilityWorkOrderItem): Order {
  return {
    id: w.workOrderNo,
    device: w.facilityName ?? w.facilityCode ?? '—',
    type: w.facilityType ?? '—',
    level: w.faultLevel ?? '',
    st: w.status,
    time: w.dispatchTime ?? '',
    owner: w.repairPerson ?? '待指派',
    deadline: w.estimatedFinish ?? '—',
    phen: w.description ?? '',
  };
}

async function load(): Promise<void> {
  loading.value = true;
  try {
    if (isOfflineNoBackend()) {
      notifyBackendOffline('fire-facility', '/fire-facility/work-orders');
      order.value = null;
      return;
    }
    const res = await fetchFireFacilityWorkOrders();
    const id = String(route.params.id);
    const hit = (res.items ?? []).find((w) => w.workOrderNo === id);
    order.value = hit ? toRow(hit) : null;
  } catch {
    order.value = null;
  } finally {
    loading.value = false;
  }
}

const STEPS = ['待确认', '已确认', '已派单', '维修中', '待验收', '已闭环'];

const currentStep = computed(() => Math.max(0, STEPS.indexOf(order.value?.st ?? '')));

function stepClass(i: number): string {
  if (i < currentStep.value) return 'mb-steps__item mb-steps__item--done';
  if (i === currentStep.value) return 'mb-steps__item mb-steps__item--on';
  return 'mb-steps__item';
}

onMounted(load);
</script>

<template>
  <div class="mb-page">
    <MobileHeader variant="back" title="工单详情" back-to="/orders" />

    <p v-if="loading" class="mb-loading">加载中…</p>

    <div v-else-if="!order" class="mb-empty">
      <div class="mb-empty__art" />
      <p class="mb-empty__text">未找到该工单</p>
    </div>

    <div v-else class="mb-stack">
      <div class="mb-steps">
        <span v-for="(s, i) in STEPS" :key="s" :class="stepClass(i)">{{ s }}</span>
      </div>

      <div class="mb-detail">
        <div class="mb-detail__row">
          <span class="mb-detail__label">工单编号</span>
          <span class="mb-detail__value">{{ order.id }}</span>
        </div>
        <div class="mb-detail__row">
          <span class="mb-detail__label">故障设备</span>
          <span class="mb-detail__value">{{ order.device }}</span>
        </div>
        <div class="mb-detail__row">
          <span class="mb-detail__label">设备类型 / 级别</span>
          <span class="mb-detail__value">{{ order.type }} · {{ order.level || '—' }}</span>
        </div>
        <div class="mb-detail__row">
          <span class="mb-detail__label">故障现象</span>
          <span class="mb-detail__value">{{ order.phen || '—' }}</span>
        </div>
        <div class="mb-detail__row">
          <span class="mb-detail__label">负责人 / 期限</span>
          <span class="mb-detail__value">{{ order.owner }} · 预计 {{ order.deadline }}</span>
        </div>
      </div>

      <h2 class="mb-section__title order-detail__sec">处置操作</h2>

      <textarea class="mb-textarea" placeholder="填写处理结果（必填）" />

      <div class="order-detail__photos">
        <button type="button" class="mb-photo" aria-label="新增现场照片">
          <Icon name="plus" size="var(--mb-ico-lg)" />
        </button>
        <button type="button" class="mb-photo" aria-label="拍照上传">
          <Icon name="camera" size="var(--mb-ico-lg)" />
        </button>
      </div>

      <button type="button" class="mb-btn-primary mb-btn-block">完成维修并提交验收</button>
      <button type="button" class="mb-btn-ghost mb-btn-block">验收（合格关闭 / 不合格退回）</button>
    </div>
  </div>
</template>

<style scoped>
.order-detail__sec {
  margin: var(--space-md) 0 calc(-1 * var(--space-sm));
}

.order-detail__photos {
  display: flex;
  gap: var(--space-sm);
}

.mb-loading {
  text-align: center;
  color: var(--mb-muted);
  padding: var(--space-lg) 0;
}
</style>
