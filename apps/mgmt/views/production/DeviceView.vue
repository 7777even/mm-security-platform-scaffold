<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Cpu } from '@element-plus/icons-vue';
import MgmtProTable from '../../components/MgmtProTable.vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import { toastErr } from '../../utils/feedback';
import { fetchDevicePage } from '@/services/device';
import type { DeviceItem, DeviceStatus } from '@/services/device';

// 装置/设备台账管理（/device-mgmt）：接后端 /devices 分页。
// 取代原 module-embed 原型 iframe 占位，数据全部来自后端；取数三态：加载中 / 空态 / 错误回落（不回灌假数据）。

const rows = ref<DeviceItem[]>([]);
const loading = ref(false);
const page = ref(1);
const size = ref(20);
const total = ref(0);
const statusFilter = ref<DeviceStatus | ''>('');

const STATUS_TEXT: Record<DeviceStatus, string> = { 0: '离线', 1: '在线', 2: '告警' };
const TYPE_TEXT: Record<string, string> = {
  FIRE: '消防',
  GAS: '气体',
  FLOOD: '防汛',
  CCTV: '视频',
};

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetchDevicePage({
      page: page.value,
      size: size.value,
      status: statusFilter.value === '' ? undefined : statusFilter.value,
    });
    rows.value = Array.isArray(res?.list) ? res.list : [];
    total.value = typeof res?.total === 'number' ? res.total : rows.value.length;
  } catch (err) {
    toastErr(err, '加载设备台账失败：');
    rows.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
}

function onPageChange(p: number) {
  page.value = p;
  load();
}
function onSizeChange(s: number) {
  size.value = s;
  page.value = 1;
  load();
}
function onStatusChange() {
  page.value = 1;
  load();
}

onMounted(load);
</script>

<template>
  <div>
    <MgmtPageHead title="设备台账管理" crumb="生产信息管理 / 装置管理" :icon="Cpu" icon-tone="blue">
      <template #actions>
        <el-select
          v-model="statusFilter"
          placeholder="全部状态"
          style="width: 120px"
          @change="onStatusChange"
        >
          <el-option label="全部状态" value="" />
          <el-option label="离线" :value="0" />
          <el-option label="在线" :value="1" />
          <el-option label="告警" :value="2" />
        </el-select>
        <el-button :loading="loading" @click="load">刷新</el-button>
      </template>
    </MgmtPageHead>

    <MgmtProTable
      :data="rows"
      :total="total"
      :page="page"
      :page-size="size"
      @update:page="onPageChange"
      @update:page-size="onSizeChange"
    >
      <el-table-column prop="deviceCode" label="设备编码" min-width="200" />
      <el-table-column prop="deviceName" label="设备名称" min-width="160">
        <template #default="{ row }">{{ row.deviceName || '—' }}</template>
      </el-table-column>
      <el-table-column prop="deviceType" label="类型" min-width="100">
        <template #default="{ row }">{{
          TYPE_TEXT[row.deviceType] || row.deviceType || '—'
        }}</template>
      </el-table-column>
      <el-table-column prop="zone" label="所属区域" min-width="160">
        <template #default="{ row }">{{ row.zone || '—' }}</template>
      </el-table-column>
      <el-table-column prop="status" label="状态" min-width="100">
        <template #default="{ row }">
          <span :class="['tone', `tone-${row.status}`]">{{
            STATUS_TEXT[row.status as DeviceStatus] || '—'
          }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="longitude" label="经度" min-width="120">
        <template #default="{ row }">{{ row.lat ?? '—' }}</template>
      </el-table-column>
      <el-table-column prop="latitude" label="纬度" min-width="120">
        <template #default="{ row }">{{ row.lon ?? '—' }}</template>
      </el-table-column>
    </MgmtProTable>

    <el-empty v-if="!loading && !rows.length" description="暂无设备台账数据" />
  </div>
</template>

<style scoped>
.tone {
  font-weight: 600;
}

.tone-1 {
  color: #16a34a;
}

.tone-2 {
  color: #dc2626;
}

.tone-0 {
  color: #9ca3af;
}
</style>
