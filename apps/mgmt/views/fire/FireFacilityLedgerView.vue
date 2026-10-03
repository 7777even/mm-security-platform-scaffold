<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { Box } from '@element-plus/icons-vue';
import { ElMessageBox } from 'element-plus';
import MgmtProTable from '../../components/MgmtProTable.vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import MgmtRecordEditDialog, { type FieldDef } from '../../components/MgmtRecordEditDialog.vue';
import { toastErr, toastOk } from '../../utils/feedback';
import {
  fetchFireFacilityLedger,
  createFireFacilityLedger,
  updateFireFacilityLedger,
  deleteFireFacilityLedger,
} from '@/services/fireFacility';
import type { FireFacilityLedgerItem } from '@/services/fireFacility';
import { useDomainAutoRefresh } from '@/composables/useDomainAutoRefresh';

// 消防设施台账：接后端 /fire-facility/ledger。后端以 facilityType 维度提供统一台账，前端按类型下拉过滤。
const rows = ref<FireFacilityLedgerItem[]>([]);
const typeOptions = ref<string[]>([]);
const selectedType = ref('');
const loading = ref(false);

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetchFireFacilityLedger();
    rows.value = Array.isArray(res?.items) ? res.items : [];
    typeOptions.value = Array.isArray(res?.typeOptions) ? res.typeOptions : [];
  } catch (err) {
    toastErr(err, '加载消防设施台账失败：');
    rows.value = [];
    typeOptions.value = [];
  } finally {
    loading.value = false;
  }
}

const filteredRows = computed<FireFacilityLedgerItem[]>(() =>
  selectedType.value ? rows.value.filter((r) => r.facilityType === selectedType.value) : rows.value,
);

// —— CRUD 弹窗（MgmtRecordEditDialog 标准范式）——
const dialogVisible = ref(false);
const editRow = ref<Record<string, unknown> | null>(null);

const facilityTypeOptions = computed(() => typeOptions.value.map((t) => ({ label: t, value: t })));

const FIELDS: FieldDef[] = [
  { prop: 'facilityCode', label: '设施编码', type: 'input', required: true, disabledOnEdit: true },
  { prop: 'facilityName', label: '设施名称', type: 'input', required: true },
  {
    prop: 'facilityType',
    label: '设施类型',
    type: 'select',
    required: true,
    options: facilityTypeOptions.value,
  },
  { prop: 'location', label: '设置部位', type: 'input' },
  { prop: 'device', label: '关联设备', type: 'input' },
  { prop: 'maintainerName', label: '维保人', type: 'input' },
  { prop: 'maintainerPhone', label: '维保电话', type: 'input' },
  {
    prop: 'enabled',
    label: '是否启用',
    type: 'select',
    options: [
      { label: '是', value: true },
      { label: '否', value: false },
    ],
  },
];

function openCreate(): void {
  editRow.value = null;
  dialogVisible.value = true;
}

function openEdit(row: FireFacilityLedgerItem): void {
  editRow.value = { ...row } as Record<string, unknown>;
  dialogVisible.value = true;
}

async function onSave(payload: Record<string, unknown>, id: number | null): Promise<void> {
  if (id == null) {
    await createFireFacilityLedger(payload as never);
  } else {
    await updateFireFacilityLedger(id, payload as never);
  }
  await load();
}

async function onDelete(row: FireFacilityLedgerItem): Promise<void> {
  try {
    await ElMessageBox.confirm(
      `确认删除设施「${row.facilityName || row.facilityCode}」？`,
      '删除确认',
      {
        type: 'warning',
        confirmButtonText: '删除',
        cancelButtonText: '取消',
      },
    );
  } catch {
    return;
  }
  try {
    await deleteFireFacilityLedger(row.id as number);
    toastOk('已删除');
    await load();
  } catch (err) {
    toastErr(err, '删除失败：');
  }
}

onMounted(load);
// 写后实时刷新：后端 fire-facility.ledger 广播触发本订阅重拉台账。
useDomainAutoRefresh('fire-facility.ledger', load, { immediate: false });
</script>

<template>
  <div>
    <MgmtPageHead
      title="消防设施台账"
      crumb="消防设施管理 / 消防设施台账"
      :icon="Box"
      icon-tone="blue"
    >
      <template #actions>
        <el-select
          v-model="selectedType"
          placeholder="全部设施类型"
          clearable
          style="width: 200px"
          @change="() => {}"
        >
          <el-option v-for="t in typeOptions" :key="t" :label="t" :value="t" />
        </el-select>
        <el-button v-permission="'fire-facility:ledger:write'" type="primary" @click="openCreate">
          新增设施
        </el-button>
        <el-button :loading="loading" @click="load">刷新</el-button>
      </template>
    </MgmtPageHead>

    <MgmtProTable :data="filteredRows">
      <el-table-column prop="facilityCode" label="设施编号" min-width="120" />
      <el-table-column prop="facilityName" label="设施名称" min-width="160">
        <template #default="{ row }">{{ row.facilityName || '—' }}</template>
      </el-table-column>
      <el-table-column prop="facilityType" label="设施类型" min-width="160">
        <template #default="{ row }">{{ row.facilityType || '—' }}</template>
      </el-table-column>
      <el-table-column prop="location" label="设置部位" min-width="160">
        <template #default="{ row }">{{ row.location || '—' }}</template>
      </el-table-column>
      <el-table-column prop="device" label="关联设备" min-width="140">
        <template #default="{ row }">{{ row.device || '—' }}</template>
      </el-table-column>
      <el-table-column prop="maintainerName" label="维保人" min-width="120">
        <template #default="{ row }">{{ row.maintainerName || '—' }}</template>
      </el-table-column>
      <el-table-column prop="maintainerPhone" label="维保电话" min-width="140">
        <template #default="{ row }">{{ row.maintainerPhone || '—' }}</template>
      </el-table-column>
      <el-table-column prop="enabled" label="启用" min-width="80">
        <template #default="{ row }">{{ row.enabled ? '是' : '否' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button
            v-permission="'fire-facility:ledger:write'"
            link
            type="primary"
            @click="openEdit(row as FireFacilityLedgerItem)"
          >
            编辑
          </el-button>
          <el-button
            v-permission="'fire-facility:ledger:write'"
            link
            type="danger"
            @click="onDelete(row as FireFacilityLedgerItem)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </MgmtProTable>

    <MgmtRecordEditDialog
      v-model="dialogVisible"
      :edit-row="editRow"
      :fields="FIELDS"
      title="消防设施台账"
      @save="onSave"
    />
  </div>
</template>
