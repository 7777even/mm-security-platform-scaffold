<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Phone } from '@element-plus/icons-vue';
import MgmtProTable from '../../components/MgmtProTable.vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import { toastErr } from '../../utils/feedback';
import { fetchEmergencyPhones } from '@/services/emergencyPhone';
import type { EmergencyPhone } from '@/services/emergencyPhone';

// 应急通讯录管理（/contacts-mgmt）：接后端 /emergency/phones（扁平通讯录）。
// 后端仅返回 名称/号码/类别 三类字段，其余菜单静态列（岗位/单位/备用/启用）无真实数据源，按红线不造假、不展示。
const rows = ref<EmergencyPhone[]>([]);
const loading = ref(false);

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetchEmergencyPhones();
    rows.value = Array.isArray(res?.entries) ? res.entries : [];
  } catch (err) {
    toastErr(err, '加载应急通讯录失败：');
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
      title="应急通讯录管理"
      crumb="应急及演练管理 / 应急通讯录管理"
      :icon="Phone"
      icon-tone="blue"
    >
      <template #actions>
        <el-button :loading="loading" @click="load()">刷新</el-button>
      </template>
    </MgmtPageHead>

    <MgmtProTable :data="rows">
      <el-table-column prop="name" label="名称" min-width="160">
        <template #default="{ row }">{{ row.name || '—' }}</template>
      </el-table-column>
      <el-table-column prop="number" label="号码" min-width="140" />
      <el-table-column prop="category" label="类别" min-width="120" />
    </MgmtProTable>
  </div>
</template>
