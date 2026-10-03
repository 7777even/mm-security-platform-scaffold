<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Tools } from '@element-plus/icons-vue';
import { useDomainAutoRefresh } from '@/composables/useDomainAutoRefresh';
import MgmtProTable from '../../components/MgmtProTable.vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import MgmtRecordEditDialog, { type FieldDef } from '../../components/MgmtRecordEditDialog.vue';
import { toastErr, toastOk } from '../../utils/feedback';
import {
  createFireFacilityMaintenance,
  deleteFireFacilityMaintenance,
  fetchFireFacilityLedger,
  type FireFacilityLedgerItem,
  type FireFacilityMaintenanceRecord,
  type FireFacilityMaintenanceWriteRequest,
} from '@/services/fireFacility';

// 维护保养记录（/facility-maintenance）：维保记录内嵌于消防设施台账每项（maintenanceRecords），
// 后端提供台账级写回（fire-facility:ledger:write）下沉到维保子表：
// - 新增：POST /fire-facility/ledger/{ledgerId}/maintenance
// - 删除：DELETE /fire-facility/maintenance/{recordId}
// 展开每条台账可维护其维保记录；写成功后后端广播 fire-facility.ledger，面板自动重拉。
const items = ref<FireFacilityLedgerItem[]>([]);
const loading = ref(false);
const dialogVisible = ref(false);
const activeLedgerId = ref<number | null>(null);

const MAINT_FIELDS: FieldDef[] = [
  {
    prop: 'date',
    label: '维保日期',
    type: 'date',
    dateType: 'date',
    valueFormat: 'YYYY-MM-DD',
    required: true,
  },
  { prop: 'content', label: '维保内容', type: 'textarea', required: true },
  {
    prop: 'reportFile',
    label: '维保报告路径',
    type: 'input',
    placeholder: '可空，如 https://.../report.pdf',
  },
];

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetchFireFacilityLedger();
    items.value = Array.isArray(res?.items) ? res.items : [];
  } catch (err) {
    toastErr(err, '加载消防设施台账失败：');
    items.value = [];
  } finally {
    loading.value = false;
  }
}

function openAdd(ledgerId: number | undefined): void {
  if (ledgerId == null) return;
  activeLedgerId.value = ledgerId;
  dialogVisible.value = true;
}

async function onSave(payload: Record<string, unknown>): Promise<void> {
  if (activeLedgerId.value == null) return;
  try {
    const body = payload as unknown as FireFacilityMaintenanceWriteRequest;
    await createFireFacilityMaintenance(activeLedgerId.value, body);
    toastOk('维保记录已新增');
    dialogVisible.value = false;
    activeLedgerId.value = null;
    await load();
  } catch (err) {
    toastErr(err, '新增维保记录失败：');
  }
}

async function onDelete(rec: FireFacilityMaintenanceRecord): Promise<void> {
  if (rec.id == null) return;
  try {
    await ElMessageBox.confirm('确认删除该维保记录？删除后不可恢复。', '删除确认', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    });
  } catch {
    return; // 用户取消
  }
  try {
    await deleteFireFacilityMaintenance(Number(rec.id));
    ElMessage.success('已删除');
    await load();
  } catch (err) {
    toastErr(err, '删除失败：');
  }
}

onMounted(load);

// 三端实时刷新：任一端改维保记录/台账，本页自动重拉
useDomainAutoRefresh('fire-facility.ledger', load, { immediate: false });
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

    <MgmtProTable :data="items">
      <el-table-column type="expand">
        <template #default="{ row }">
          <div class="maint-sub">
            <div class="maint-sub__head">
              <span
                >维保记录（{{
                  ((row as FireFacilityLedgerItem).maintenanceRecords || []).length
                }}）</span
              >
              <el-button
                v-permission="'fire-facility:ledger:write'"
                size="small"
                type="primary"
                :icon="Plus"
                @click="openAdd((row as FireFacilityLedgerItem).id)"
              >
                新增维保
              </el-button>
            </div>
            <el-table
              :data="(row as FireFacilityLedgerItem).maintenanceRecords || []"
              size="small"
              border
            >
              <el-table-column prop="date" label="维保日期" min-width="120" />
              <el-table-column prop="content" label="维保内容" min-width="240">
                <template #default="{ row: r }">{{
                  (r as FireFacilityMaintenanceRecord).content || '—'
                }}</template>
              </el-table-column>
              <el-table-column prop="reportFile" label="维保报告" min-width="200">
                <template #default="{ row: r }">{{
                  (r as FireFacilityMaintenanceRecord).reportFile || '—'
                }}</template>
              </el-table-column>
              <el-table-column label="操作" width="100">
                <template #default="{ row: r }">
                  <el-button
                    v-permission="'fire-facility:ledger:write'"
                    link
                    type="danger"
                    @click="onDelete(r as FireFacilityMaintenanceRecord)"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="facilityCode" label="设施编号" min-width="140" />
      <el-table-column prop="facilityName" label="设施名称" min-width="180">
        <template #default="{ row }">{{
          (row as FireFacilityLedgerItem).facilityName || '—'
        }}</template>
      </el-table-column>
      <el-table-column prop="facilityType" label="设施类型" min-width="120">
        <template #default="{ row }">{{
          (row as FireFacilityLedgerItem).facilityType || '—'
        }}</template>
      </el-table-column>
      <el-table-column prop="location" label="位置" min-width="160">
        <template #default="{ row }">{{
          (row as FireFacilityLedgerItem).location || '—'
        }}</template>
      </el-table-column>
      <el-table-column prop="maintainerName" label="维护人" min-width="120">
        <template #default="{ row }">{{
          (row as FireFacilityLedgerItem).maintainerName || '—'
        }}</template>
      </el-table-column>
      <el-table-column prop="enabled" label="启用" min-width="80">
        <template #default="{ row }">{{
          (row as FireFacilityLedgerItem).enabled ? '是' : '否'
        }}</template>
      </el-table-column>
    </MgmtProTable>

    <MgmtRecordEditDialog
      v-model="dialogVisible"
      :edit-row="null"
      :fields="MAINT_FIELDS"
      title="消防设施维保记录"
      @save="onSave"
    />
  </div>
</template>

<style scoped>
.maint-sub {
  padding: 8px 24px 12px;
}

.maint-sub__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  color: var(--el-text-color-secondary, #909399);
  font-size: 13px;
}
</style>
