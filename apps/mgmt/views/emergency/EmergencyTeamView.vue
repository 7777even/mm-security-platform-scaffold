<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { UserFilled } from '@element-plus/icons-vue';
import MgmtProTable from '../../components/MgmtProTable.vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import { toastErr } from '../../utils/feedback';
import { fetchFireBrigades } from '@/services/rescueResource';
import type { FireBrigadeTeam } from '@/services/rescueResource';

// 应急队伍（/emergency-team）：接后端 /rescue-resources/brigades（只读消防队伍台账）。
const rows = ref<FireBrigadeTeam[]>([]);
const loading = ref(false);

function asItem(row: unknown): FireBrigadeTeam {
  return row as FireBrigadeTeam;
}

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetchFireBrigades();
    rows.value = Array.isArray(res?.items) ? res.items : [];
  } catch (err) {
    toastErr(err, '加载应急队伍失败：');
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
      title="应急队伍"
      crumb="应急及演练管理 / 应急队伍"
      :icon="UserFilled"
      icon-tone="blue"
    >
      <template #actions>
        <el-button :loading="loading" @click="load">刷新</el-button>
      </template>
    </MgmtPageHead>

    <MgmtProTable :data="rows">
      <el-table-column prop="name" label="队伍名称" min-width="200">
        <template #default="{ row }">{{ row.name || '—' }}</template>
      </el-table-column>
      <el-table-column prop="area" label="区域" min-width="140">
        <template #default="{ row }">{{ row.area || '—' }}</template>
      </el-table-column>
      <el-table-column prop="memberCount" label="编制人数" width="110" align="center">
        <template #default="{ row }">{{ asItem(row).memberCount ?? '—' }}</template>
      </el-table-column>
      <el-table-column prop="leaderName" label="队长" min-width="120">
        <template #default="{ row }">{{ row.leaderName || '—' }}</template>
      </el-table-column>
      <el-table-column prop="location" label="驻防位置" min-width="200">
        <template #default="{ row }">{{ row.location || '—' }}</template>
      </el-table-column>
    </MgmtProTable>
  </div>
</template>
