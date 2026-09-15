<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Medal } from '@element-plus/icons-vue';
import MgmtProTable from '../../components/MgmtProTable.vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import { toastErr } from '../../utils/feedback';
import { fetchRescuePersonnel } from '@/services/rescueResource';
import type { RescuePersonnelItem, RescuePersonnelList } from '@/services/rescueResource';

// 应急专家（/emergency-expert）：接后端 /rescue-resources/personnel（只读人员台账，可按角色过滤）。
const rows = ref<RescuePersonnelItem[]>([]);
const roles = ref<string[]>([]);
const roleFilter = ref<string>('');
const loading = ref(false);

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res: RescuePersonnelList = await fetchRescuePersonnel(
      undefined,
      roleFilter.value || undefined,
    );
    rows.value = Array.isArray(res?.items) ? res.items : [];
    if (Array.isArray(res?.roles)) roles.value = res.roles;
  } catch (err) {
    toastErr(err, '加载应急专家失败：');
    rows.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div>
    <MgmtPageHead title="应急专家" crumb="应急及演练管理 / 应急专家" :icon="Medal" icon-tone="blue">
      <template #actions>
        <el-select
          v-model="roleFilter"
          placeholder="全部角色"
          clearable
          style="width: 160px"
          @change="load"
        >
          <el-option v-for="r in roles" :key="r" :label="r" :value="r" />
        </el-select>
        <el-button :loading="loading" @click="load">刷新</el-button>
      </template>
    </MgmtPageHead>

    <MgmtProTable :data="rows">
      <el-table-column prop="name" label="姓名" min-width="140">
        <template #default="{ row }">{{ row.name || '—' }}</template>
      </el-table-column>
      <el-table-column prop="squadron" label="中队" min-width="180">
        <template #default="{ row }">{{ row.squadron || '—' }}</template>
      </el-table-column>
      <el-table-column prop="role" label="角色" min-width="160">
        <template #default="{ row }">{{ row.role || '—' }}</template>
      </el-table-column>
    </MgmtProTable>
  </div>
</template>
