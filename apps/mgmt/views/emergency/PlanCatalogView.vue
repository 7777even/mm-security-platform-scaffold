<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Document } from '@element-plus/icons-vue';
import MgmtProTable from '../../components/MgmtProTable.vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import { toastErr } from '../../utils/feedback';
import { fetchEmergencyPlanCatalog } from '@/services/emergencyPlan';
import type { EmergencyPlanCatalogItem } from '@/services/emergencyPlan';

// 预案管理（/plan-mgmt）：接后端 /emergency-plans/catalog（只读预案目录，4 行层级）。
const rows = ref<EmergencyPlanCatalogItem[]>([]);
const loading = ref(false);

function asItem(row: unknown): EmergencyPlanCatalogItem {
  return row as EmergencyPlanCatalogItem;
}

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetchEmergencyPlanCatalog();
    rows.value = Array.isArray(res?.items) ? res.items : [];
  } catch (err) {
    toastErr(err, '加载预案目录失败：');
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
      title="预案管理"
      crumb="应急及演练管理 / 预案管理"
      :icon="Document"
      icon-tone="blue"
    >
      <template #actions>
        <el-button :loading="loading" @click="load">刷新</el-button>
      </template>
    </MgmtPageHead>

    <MgmtProTable :data="rows">
      <el-table-column prop="label" label="预案层级" min-width="180" />
      <el-table-column prop="planName" label="当前预案" min-width="240">
        <template #default="{ row }">{{ row.planName || '—' }}</template>
      </el-table-column>
      <el-table-column label="是否当前" width="110" align="center">
        <template #default="{ row }">
          <span class="tag" :class="asItem(row).isCurrent ? 'tag-success' : 'tag-info'">
            {{ asItem(row).isCurrent ? '当前' : '否' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="可切换" width="100" align="center">
        <template #default="{ row }">
          <span class="tag" :class="asItem(row).canSwitch ? 'tag-success' : 'tag-info'">
            {{ asItem(row).canSwitch ? '可切换' : '不可' }}
          </span>
        </template>
      </el-table-column>
    </MgmtProTable>
  </div>
</template>
