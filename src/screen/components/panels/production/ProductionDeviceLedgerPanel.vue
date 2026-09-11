<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import PanelCard from '../../common/PanelCard.vue';
import { fetchDevicePage, type DeviceItem } from '@/services/device';
import { backendUnavailableWarn } from '@/services/backendFallback';
import { toDeviceLedgerItem, type DeviceLedgerItem } from '../../../lib/adapters/deviceAdapter';

const loading = ref(true);
const failed = ref(false);
const allDevices = ref<DeviceLedgerItem[]>([]);

const zoneFilter = ref('');
const typeFilter = ref('全部类型');
const statusFilter = ref<'全部状态' | '在线' | '离线' | '告警'>('全部状态');

const pageSize = 8;
const currentPage = ref(1);

const typeOptions = ['全部类型', '消防', '可燃气体', '周界报警', '视频监控'];

const filteredDevices = computed(() => {
  const zone = zoneFilter.value.trim();
  return allDevices.value.filter((d) => {
    if (zone && !d.zone.includes(zone)) return false;
    if (typeFilter.value !== '全部类型' && d.type !== typeFilter.value) return false;
    if (statusFilter.value !== '全部状态' && d.status !== statusFilter.value) return false;
    return true;
  });
});

const totalPages = computed(() => Math.max(1, Math.ceil(filteredDevices.value.length / pageSize)));

const pagedDevices = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredDevices.value.slice(start, start + pageSize);
});

const onlineCount = computed(() => allDevices.value.filter((d) => d.status === '在线').length);

function statusClass(tone: string) {
  return `ledger__status--${tone}`;
}

function applySearch() {
  currentPage.value = 1;
}

function goToPage(page: number) {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
}

const visiblePages = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  const windowSize = 5;
  let start = Math.max(1, current - Math.floor(windowSize / 2));
  const end = Math.min(total, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  const pages: number[] = [];
  for (let i = start; i <= end; i += 1) pages.push(i);
  return pages;
});

onMounted(async () => {
  try {
    const page = await fetchDevicePage({ page: 1, size: 200 });
    allDevices.value = page.list.map((d: DeviceItem, i) => toDeviceLedgerItem(d, i));
    failed.value = false;
  } catch {
    // 直连真后端失败时回落空列表 + 显式告警，UI 不崩
    failed.value = true;
    backendUnavailableWarn('device', '/devices');
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <PanelCard title="设备台账" variant="devices" module="production" :show-more="false">
    <template #header-extra>
      <span class="ledger__badge">实时 · {{ allDevices.length }} 台 / 在线 {{ onlineCount }}</span>
    </template>

    <div class="ledger">
      <div class="ledger__filters">
        <input v-model="zoneFilter" class="ledger__input" type="text" placeholder="区域" />
        <select v-model="typeFilter" class="ledger__select">
          <option v-for="opt in typeOptions" :key="opt" :value="opt">{{ opt }}</option>
        </select>
        <select v-model="statusFilter" class="ledger__select">
          <option value="全部状态">全部状态</option>
          <option value="在线">在线</option>
          <option value="离线">离线</option>
          <option value="告警">告警</option>
        </select>
        <button type="button" class="ledger__btn" @click="applySearch">检索</button>
      </div>

      <div v-if="loading" class="ledger__state">正在加载实时设备数据…</div>
      <div v-else-if="failed" class="ledger__state ledger__state--warn">
        实时数据获取失败，暂无可展示记录
      </div>
      <div v-else-if="!pagedDevices.length" class="ledger__state">暂无匹配设备</div>

      <template v-else>
        <div class="ledger__table">
          <div class="ledger__head">
            <span>设备编码</span>
            <span>名称</span>
            <span>类型</span>
            <span>区域</span>
            <span>状态</span>
          </div>
          <div v-for="item in pagedDevices" :key="item.id" class="ledger__row">
            <span class="ledger__code" :title="item.deviceCode">{{ item.deviceCode }}</span>
            <span class="ledger__name" :title="item.name">{{ item.name }}</span>
            <span>{{ item.type }}</span>
            <span>{{ item.zone }}</span>
            <span class="ledger__status" :class="statusClass(item.statusTone)">{{
              item.status
            }}</span>
          </div>
        </div>

        <div class="ledger__pagination">
          <button
            type="button"
            class="page-btn"
            :disabled="currentPage <= 1"
            @click="goToPage(currentPage - 1)"
          >
            ‹
          </button>
          <button
            v-for="page in visiblePages"
            :key="page"
            type="button"
            class="page-btn"
            :class="{ 'page-btn--active': currentPage === page }"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
          <button
            type="button"
            class="page-btn"
            :disabled="currentPage >= totalPages"
            @click="goToPage(currentPage + 1)"
          >
            ›
          </button>
        </div>
      </template>
    </div>
  </PanelCard>
</template>

<style scoped>
.ledger__badge {
  font-size: 12px;
  color: var(--map-device-offline);
}

.ledger {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  gap: 8px;
}

.ledger__filters {
  display: grid;
  grid-template-columns: 1.2fr 1fr 0.9fr auto;
  gap: 6px;
  flex-shrink: 0;
}

.ledger__input,
.ledger__select {
  height: 30px;
  padding: 0 8px;
  border: 1px solid rgb(0 120 200 / 30%);
  border-radius: 2px;
  background: rgb(0 22 48 / 70%);
  color: #c8d8ec;
  font-size: 12px;
  font-family: var(--font-body);
  outline: none;
  min-width: 0;
}

.ledger__input::placeholder {
  color: #6a829e;
}

.ledger__btn {
  height: 30px;
  padding: 0 10px;
  border: 1px solid rgb(0 160 255 / 45%);
  border-radius: 2px;
  background: rgb(0 90 160 / 55%);
  color: #e8f4ff;
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
  white-space: nowrap;
}

.ledger__state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--map-device-offline);
  font-size: 13px;
}

.ledger__state--warn {
  color: var(--color-alarm-2);
}

.ledger__table {
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
  scrollbar-width: thin;
  scrollbar-color: rgb(0 160 255 / 45%) rgb(0 25 55 / 50%);
}

.ledger__head,
.ledger__row {
  display: grid;
  grid-template-columns: 1.7fr 1.1fr 0.9fr 0.9fr 0.6fr;
  gap: 6px;
  align-items: center;
  padding: 0 8px;
  box-sizing: border-box;
}

.ledger__head {
  height: 30px;
  flex-shrink: 0;
  font-size: 12px;
  color: var(--map-device-offline);
  background: rgb(0 40 78 / 45%);
  border: 1px solid rgb(0 120 200 / 20%);
  border-radius: 2px;
}

.ledger__row {
  min-height: 38px;
  border: 1px solid rgb(0 100 180 / 16%);
  border-radius: 2px;
  background: rgb(0 24 50 / 40%);
  color: #e8f2fc;
  font-size: 12px;
}

.ledger__code,
.ledger__name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ledger__status--ok {
  color: var(--color-success);
}

.ledger__status--offline {
  color: var(--map-device-offline);
}

.ledger__status--fault {
  color: var(--color-danger);
}

.ledger__pagination {
  display: flex;
  justify-content: center;
  gap: 6px;
  flex-shrink: 0;
  padding-top: 2px;
}

.page-btn {
  min-width: 26px;
  height: 26px;
  padding: 0 6px;
  border: 1px solid var(--btn-border);
  border-radius: 2px;
  background: var(--stat-card-icon-bg);
  color: var(--map-device-offline);
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.page-btn--active {
  color: var(--color-text-strong);
  border-color: rgb(0 180 255 / 55%);
  background: rgb(0 90 160 / 50%);
}
</style>
