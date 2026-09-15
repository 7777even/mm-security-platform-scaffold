<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Aim } from '@element-plus/icons-vue';
import MgmtProTable from '../../components/MgmtProTable.vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import { toastErr } from '../../utils/feedback';
import { fetchMonitoringPoints } from '@/services/hazard';
import type { MonitoringPoint } from '@/services/map-data/monitoringPointsMock';

// 监测点位管理（/monitor-point）：接后端 /monitoring/points（工艺/消防监测点列表）。
const rows = ref<MonitoringPoint[]>([]);
const loading = ref(false);

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetchMonitoringPoints();
    rows.value = Array.isArray(res) ? res : [];
  } catch (err) {
    toastErr(err, '加载监测点位失败：');
    rows.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div>
    <MgmtPageHead title="监测点位管理" crumb="设备管理 / 监测点位管理" :icon="Aim" icon-tone="blue">
      <template #actions>
        <el-button :loading="loading" @click="load">刷新</el-button>
      </template>
    </MgmtPageHead>

    <MgmtProTable :data="rows">
      <el-table-column prop="id" label="编号" min-width="120" />
      <el-table-column prop="name" label="名称" min-width="160">
        <template #default="{ row }">{{ row.name || '—' }}</template>
      </el-table-column>
      <el-table-column prop="category" label="类型" min-width="140">
        <template #default="{ row }">{{ row.category || '—' }}</template>
      </el-table-column>
      <el-table-column prop="org" label="责任单位" min-width="160">
        <template #default="{ row }">{{ row.org || '—' }}</template>
      </el-table-column>
      <el-table-column prop="status" label="状态" min-width="100">
        <template #default="{ row }">{{ row.status || '—' }}</template>
      </el-table-column>
      <el-table-column prop="lastTime" label="最近更新" min-width="160">
        <template #default="{ row }">{{ row.lastTime || '—' }}</template>
      </el-table-column>
    </MgmtProTable>
  </div>
</template>
