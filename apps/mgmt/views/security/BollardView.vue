<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Lock } from '@element-plus/icons-vue';
import MgmtProTable from '../../components/MgmtProTable.vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import { toastErr } from '../../utils/feedback';
import { fetchBollards } from '@/services/security';
import type { BollardItem } from '@/services/security';

// 液压防撞柱管理（/bollard-mgmt）：接后端 /security/bollards。
const rows = ref<BollardItem[]>([]);
const loading = ref(false);

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetchBollards();
    rows.value = Array.isArray(res) ? res : [];
  } catch (err) {
    toastErr(err, '加载防撞柱失败：');
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
      title="液压防撞柱管理"
      crumb="治安防恐管理 / 液压防撞柱管理"
      :icon="Lock"
      icon-tone="blue"
    >
      <template #actions>
        <el-button :loading="loading" @click="load">刷新</el-button>
      </template>
    </MgmtPageHead>

    <MgmtProTable :data="rows">
      <el-table-column prop="id" label="编号" min-width="100" />
      <el-table-column prop="name" label="名称" min-width="160">
        <template #default="{ row }">{{ row.name || '—' }}</template>
      </el-table-column>
      <el-table-column prop="zone" label="区域" min-width="160">
        <template #default="{ row }">{{ row.zone || '—' }}</template>
      </el-table-column>
      <el-table-column prop="status" label="状态" min-width="100">
        <template #default="{ row }">{{ row.status || '—' }}</template>
      </el-table-column>
      <el-table-column prop="longitude" label="经度" min-width="120">
        <template #default="{ row }">{{ row.longitude ?? '—' }}</template>
      </el-table-column>
      <el-table-column prop="latitude" label="纬度" min-width="120">
        <template #default="{ row }">{{ row.latitude ?? '—' }}</template>
      </el-table-column>
    </MgmtProTable>
  </div>
</template>
