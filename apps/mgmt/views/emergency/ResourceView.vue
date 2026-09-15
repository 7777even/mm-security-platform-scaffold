<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Box } from '@element-plus/icons-vue';
import MgmtProTable from '../../components/MgmtProTable.vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import { toastErr } from '../../utils/feedback';
import { fetchRescueEquipment } from '@/services/rescueResource';
import type { RescueEquipmentItem } from '@/services/rescueResource';

// 应急物资与装备（/resource-mgmt）：接后端 /rescue-resources/equipment（只读台账）。
const rows = ref<RescueEquipmentItem[]>([]);
const loading = ref(false);

function asItem(row: unknown): RescueEquipmentItem {
  return row as RescueEquipmentItem;
}

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetchRescueEquipment();
    rows.value = Array.isArray(res?.items) ? res.items : [];
  } catch (err) {
    toastErr(err, '加载应急物资失败：');
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
      title="应急物资与装备"
      crumb="应急及演练管理 / 应急物资与装备"
      :icon="Box"
      icon-tone="blue"
    >
      <template #actions>
        <el-button :loading="loading" @click="load">刷新</el-button>
      </template>
    </MgmtPageHead>

    <MgmtProTable :data="rows">
      <el-table-column prop="name" label="装备名称" min-width="200">
        <template #default="{ row }">{{ row.name || '—' }}</template>
      </el-table-column>
      <el-table-column prop="squadron" label="所属中队" min-width="160">
        <template #default="{ row }">{{ row.squadron || '—' }}</template>
      </el-table-column>
      <el-table-column prop="quantity" label="配置数量" width="110" align="center">
        <template #default="{ row }">{{ asItem(row).quantity ?? '—' }}</template>
      </el-table-column>
      <el-table-column prop="leaderName" label="负责人" min-width="120">
        <template #default="{ row }">{{ row.leaderName || '—' }}</template>
      </el-table-column>
      <el-table-column prop="stockQuantity" label="库存" width="100" align="center">
        <template #default="{ row }">{{ asItem(row).stockQuantity ?? '—' }}</template>
      </el-table-column>
      <el-table-column prop="equipmentStatus" label="状态" min-width="120">
        <template #default="{ row }">{{ row.equipmentStatus || '—' }}</template>
      </el-table-column>
    </MgmtProTable>
  </div>
</template>
