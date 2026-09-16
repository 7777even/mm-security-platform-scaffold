<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import MobileHeader from '../components/MobileHeader.vue';
import Icon from '../components/Icon.vue';
import { fetchDevicePage, type DeviceType } from '@/services/device';
import {
  fetchFireFacilityWorkOrders,
  type FireFacilityWorkOrderItem,
} from '@/services/fireFacility';
import { isOfflineNoBackend, notifyBackendOffline } from '@/services/backendFallback';

// 运维监测看板（看板页模板，docs/UI规范-移动端.md §5）
// 数据源：后端 /api/v1/devices（设备台账分页）+ /api/v1/fire-facility/work-orders（工单）。
// 取消原 data/mock.ts 静态数据与写死的设备统计常量；未连后端走空态 + 全局离线告警。
// - 设备统计按设备台账 status（0 离线 / 1 在线 / 2 告警）聚合；维修中 / 待验收按工单状态聚合。
// - 设备类型分布按 deviceType（FIRE/GAS/FLOOD/CCTV）聚合，条形宽度按各类型占比（百分比为数据）。
// - 数值着色只用 .mb-stat__num--* 枚举，禁止自造色阶。

interface DeviceStat {
  key: string;
  label: string;
  value: number;
  tone: 'none' | 'success' | 'warning' | 'danger';
}

interface DistBar {
  id: string;
  width: string;
}

interface OrderRow {
  id: string;
  device: string;
  level: string;
  time: string;
  st: string;
}

const TONE_CLASS: Record<DeviceStat['tone'], string> = {
  none: '',
  success: 'mb-stat__num--success',
  warning: 'mb-stat__num--warning',
  danger: 'mb-stat__num--danger',
};

const TYPE_LABEL: Record<DeviceType, string> = {
  FIRE: '火灾报警',
  GAS: '气体监测',
  FLOOD: '防汛',
  CCTV: '视频',
};

/** 工单紧急度 → 标签类 */
const LEVEL_TAG: Record<string, string> = {
  紧急: 'tag--danger',
  重要: 'tag--warning',
  一般: 'tag--info',
};

const loading = ref(false);
const stats = ref<DeviceStat[]>([]);
const distText = ref('');
const distBars = ref<DistBar[]>([]);
const orders = ref<OrderRow[]>([]);

function toOrder(w: FireFacilityWorkOrderItem): OrderRow {
  return {
    id: w.workOrderNo,
    device: w.facilityName ?? w.facilityCode ?? '—',
    level: w.faultLevel ?? '',
    time: w.dispatchTime ?? '',
    st: w.status,
  };
}

async function load(): Promise<void> {
  loading.value = true;
  try {
    if (isOfflineNoBackend()) {
      notifyBackendOffline('device', '/devices');
      stats.value = [];
      orders.value = [];
      return;
    }
    const [devices, workOrders] = await Promise.all([
      fetchDevicePage({ page: 1, size: 500 }),
      fetchFireFacilityWorkOrders(),
    ]);

    const list = devices.list ?? [];
    const total = devices.total ?? list.length;
    const online = list.filter((d) => d.status === 1).length;
    const offline = list.filter((d) => d.status === 0).length;
    const alarm = list.filter((d) => d.status === 2).length;
    const wo = workOrders.items ?? [];
    const repairing = wo.filter((w) => (w.status ?? '').includes('维修')).length;
    const accepting = wo.filter((w) => (w.status ?? '').includes('验收')).length;

    stats.value = [
      { key: 'total', label: '设备总数', value: total, tone: 'none' },
      { key: 'online', label: '在线', value: online, tone: 'success' },
      { key: 'offline', label: '离线', value: offline, tone: 'warning' },
      { key: 'alarm', label: '告警', value: alarm, tone: 'danger' },
      { key: 'repair', label: '维修中', value: repairing, tone: 'warning' },
      { key: 'accept', label: '待验收', value: accepting, tone: 'none' },
    ];

    // 设备类型分布：按 deviceType 计数
    const byType = new Map<string, number>();
    list.forEach((d) => byType.set(d.deviceType, (byType.get(d.deviceType) ?? 0) + 1));
    const entries = Array.from(byType.entries()).sort((a, b) => b[1] - a[1]);
    const max = entries[0]?.[1] ?? 1;
    distText.value = entries
      .map(([t, n]) => `${TYPE_LABEL[t as DeviceType] ?? t} ${n}`)
      .join(' · ');
    distBars.value = entries.map(([t, n]) => ({
      id: t,
      width: `${Math.round((n / max) * 100)}%`,
    }));

    orders.value = wo.slice(0, 3).map(toOrder);
  } catch {
    stats.value = [];
    distText.value = '';
    distBars.value = [];
    orders.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="mb-page">
    <MobileHeader variant="back" title="运维监测看板" back-to="/home" />

    <p v-if="loading" class="mb-loading">加载中…</p>

    <template v-else>
      <section class="mb-section">
        <div class="mb-section__head">
          <span class="mb-section__title">
            <Icon name="ops" size="var(--mb-ico-sm)" mono />
            设备统计
          </span>
        </div>
        <div v-if="stats.length" class="mb-stat-grid">
          <div v-for="s in stats" :key="s.key" class="mb-stat">
            <span class="mb-stat__num" :class="TONE_CLASS[s.tone]">{{ s.value }}</span>
            <span class="mb-stat__label">{{ s.label }}</span>
          </div>
        </div>
        <div v-else class="mb-empty">
          <div class="mb-empty__art" />
          <p class="mb-empty__text">暂无设备数据</p>
        </div>
      </section>

      <section class="mb-section">
        <div class="mb-section__head">
          <span class="mb-section__title">最近告警事件</span>
          <RouterLink class="mb-section__link" to="/orders">工单列表 →</RouterLink>
        </div>
        <div v-if="orders.length" class="mb-stack">
          <RouterLink
            v-for="o in orders"
            :key="o.id"
            class="mb-card mb-card--link"
            :to="`/orders/${o.id}`"
          >
            <div class="mb-card__title">
              <span>{{ o.device }}</span>
              <span v-if="o.level" class="tag" :class="LEVEL_TAG[o.level] ?? 'tag--info'">{{
                o.level
              }}</span>
            </div>
            <p class="mb-card__desc">{{ o.time }} · 状态：{{ o.st }}</p>
          </RouterLink>
        </div>
        <div v-else class="mb-empty">
          <div class="mb-empty__art" />
          <p class="mb-empty__text">暂无告警事件</p>
        </div>
      </section>

      <section v-if="distBars.length" class="mb-section">
        <div class="mb-section__head">
          <span class="mb-section__title">设备类型分布</span>
        </div>
        <div class="mb-card">
          <p class="mb-card__desc dist__text">{{ distText }}</p>
          <div class="dist__bars">
            <div v-for="b in distBars" :key="b.id" class="mb-progress">
              <i class="mb-progress__bar" :style="{ width: b.width }" />
            </div>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.dist__text {
  margin-top: 0;
}

.dist__bars {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin-top: var(--space-md);
}

.mb-loading {
  text-align: center;
  color: var(--mb-muted);
  padding: var(--space-lg) 0;
}
</style>
