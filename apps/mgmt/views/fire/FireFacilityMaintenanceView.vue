<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Tools } from '@element-plus/icons-vue';
import MgmtProTable from '../../components/MgmtProTable.vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import { toastErr } from '../../utils/feedback';
import { fetchFireFacilityLedger } from '@/services/fireFacility';

// 维护保养记录（/facility-maintenance）：后端无独立维保列表端点，
// 维保记录内嵌于台账每项（FireFacilityLedgerItem.maintenanceRecords），
// 故拉取全量台账后在客户端展平为维保记录列表。
interface MaintenanceRow {
  facilityCode: string;
  facilityName: string;
  date: string;
  content: string;
  reportFile?: string | null;
}

const rows = ref<MaintenanceRow[]>([]);
const loading = ref(false);

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetchFireFacilityLedger();
    const items = Array.isArray(res?.items) ? res.items : [];
    const flat: MaintenanceRow[] = [];
    for (const item of items) {
      const recs = Array.isArray(item.maintenanceRecords) ? item.maintenanceRecords : [];
      for (const rec of recs) {
        flat.push({
          facilityCode: item.facilityCode,
          facilityName: item.facilityName,
          date: rec.date,
          content: rec.content,
          reportFile: rec.reportFile,
        });
      }
    }
    rows.value = flat;
  } catch (err) {
    toastErr(err, '加载维保记录失败：');
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
      title="维护保养记录"
      crumb="消防设施管理 / 维护保养记录"
      :icon="Tools"
      icon-tone="blue"
    >
      <template #actions>
        <el-button :loading="loading" @click="load">刷新</el-button>
      </template>
    </MgmtPageHead>

    <MgmtProTable :data="rows">
      <el-table-column prop="facilityCode" label="关联设施编号" min-width="140" />
      <el-table-column prop="facilityName" label="关联设施名称" min-width="180">
        <template #default="{ row }">{{ row.facilityName || '—' }}</template>
      </el-table-column>
      <el-table-column prop="date" label="维保日期" min-width="140">
        <template #default="{ row }">{{ row.date || '—' }}</template>
      </el-table-column>
      <el-table-column prop="content" label="维保内容" min-width="260">
        <template #default="{ row }">{{ row.content || '—' }}</template>
      </el-table-column>
      <el-table-column prop="reportFile" label="维保报告" min-width="160">
        <template #default="{ row }">{{ row.reportFile || '—' }}</template>
      </el-table-column>
    </MgmtProTable>
  </div>
</template>
