<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Switch } from '@element-plus/icons-vue';
import MgmtProTable from '../../components/MgmtProTable.vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import { toastErr } from '../../utils/feedback';
import { fetchGateControls } from '@/services/security';
import type { GateControlItem } from '@/services/security';

// 道闸管理（/barrier-mgmt）：接后端 /security/gate-controls。
const rows = ref<GateControlItem[]>([]);
const loading = ref(false);

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetchGateControls();
    rows.value = Array.isArray(res) ? res : [];
  } catch (err) {
    toastErr(err, '加载道闸失败：');
    rows.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div>
    <MgmtPageHead title="道闸管理" crumb="治安防恐管理 / 道闸管理" :icon="Switch" icon-tone="blue">
      <template #actions>
        <el-button :loading="loading" @click="load">刷新</el-button>
      </template>
    </MgmtPageHead>

    <MgmtProTable :data="rows">
      <el-table-column prop="id" label="编号" min-width="100" />
      <el-table-column prop="name" label="名称" min-width="180">
        <template #default="{ row }">{{ row.name || '—' }}</template>
      </el-table-column>
      <el-table-column prop="location" label="位置" min-width="160">
        <template #default="{ row }">{{ row.location || '—' }}</template>
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
