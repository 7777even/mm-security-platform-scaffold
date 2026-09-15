<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Bell } from '@element-plus/icons-vue';
import MgmtProTable from '../../components/MgmtProTable.vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import { toastErr } from '../../utils/feedback';
import { fetchCommunicationDevices } from '@/services/communication';
import type { CommunicationDevice } from '@/services/communication';

// 广播设备管理（/broadcast-device）：接后端 /communication/devices，取 broadcast 分组设备展平。
const rows = ref<CommunicationDevice[]>([]);
const loading = ref(false);

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetchCommunicationDevices();
    const groups = Array.isArray(res?.broadcast) ? res.broadcast : [];
    rows.value = groups.flatMap((g) => (Array.isArray(g.devices) ? g.devices : []));
  } catch (err) {
    toastErr(err, '加载广播设备失败：');
    rows.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div>
    <MgmtPageHead
      title="广播设备管理"
      crumb="设备管理 / 广播设备管理"
      :icon="Bell"
      icon-tone="blue"
    >
      <template #actions>
        <el-button :loading="loading" @click="load">刷新</el-button>
      </template>
    </MgmtPageHead>

    <MgmtProTable :data="rows">
      <el-table-column prop="id" label="设备编号" min-width="140" />
      <el-table-column prop="name" label="设备名称" min-width="160">
        <template #default="{ row }">{{ row.name || '—' }}</template>
      </el-table-column>
      <el-table-column prop="type" label="设备类型" min-width="120">
        <template #default="{ row }">{{ row.type || '—' }}</template>
      </el-table-column>
      <el-table-column prop="area" label="覆盖区域" min-width="140">
        <template #default="{ row }">{{ row.area || '—' }}</template>
      </el-table-column>
      <el-table-column prop="location" label="安装位置" min-width="160">
        <template #default="{ row }">{{ row.location || '—' }}</template>
      </el-table-column>
      <el-table-column label="IP地址" min-width="140">
        <template #default="{ row }">{{ row.detail?.ip || '—' }}</template>
      </el-table-column>
      <el-table-column prop="status" label="状态" min-width="100">
        <template #default="{ row }">{{ row.status || '—' }}</template>
      </el-table-column>
    </MgmtProTable>
  </div>
</template>
