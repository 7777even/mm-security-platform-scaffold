<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Van } from '@element-plus/icons-vue';
import MgmtProTable from '../../components/MgmtProTable.vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import { toastErr } from '../../utils/feedback';
import { fetchRescueVehicles } from '@/services/rescueResource';
import type { RescueVehicleItem } from '@/services/rescueResource';

// 应急车辆（/emergency-vehicle）：接后端 /rescue-resources/vehicles（只读车辆台账）。
const rows = ref<RescueVehicleItem[]>([]);
const loading = ref(false);

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetchRescueVehicles();
    rows.value = Array.isArray(res?.items) ? res.items : [];
  } catch (err) {
    toastErr(err, '加载应急车辆失败：');
    rows.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div>
    <MgmtPageHead title="应急车辆" crumb="应急及演练管理 / 应急车辆" :icon="Van" icon-tone="blue">
      <template #actions>
        <el-button :loading="loading" @click="load">刷新</el-button>
      </template>
    </MgmtPageHead>

    <MgmtProTable :data="rows">
      <el-table-column prop="plate" label="车牌" min-width="140">
        <template #default="{ row }">{{ row.plate || '—' }}</template>
      </el-table-column>
      <el-table-column prop="type" label="类型" min-width="160">
        <template #default="{ row }">{{ row.type || '—' }}</template>
      </el-table-column>
      <el-table-column prop="squadron" label="中队" min-width="160">
        <template #default="{ row }">{{ row.squadron || '—' }}</template>
      </el-table-column>
      <el-table-column prop="leaderName" label="车组长" min-width="120">
        <template #default="{ row }">{{ row.leaderName || '—' }}</template>
      </el-table-column>
      <el-table-column prop="status" label="状态" min-width="120">
        <template #default="{ row }">{{ row.status || '—' }}</template>
      </el-table-column>
      <el-table-column prop="businessName" label="所属单位" min-width="200">
        <template #default="{ row }">{{ row.businessName || '—' }}</template>
      </el-table-column>
    </MgmtProTable>
  </div>
</template>
