<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Box } from '@element-plus/icons-vue';
import { useDomainAutoRefresh } from '@/composables/useDomainAutoRefresh';
import MgmtProTable from '../../components/MgmtProTable.vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import MgmtRecordEditDialog, { type FieldDef } from '../../components/MgmtRecordEditDialog.vue';
import { toastErr, toastOk } from '../../utils/feedback';
import {
  createRescueEquipment,
  deleteRescueEquipment,
  EQUIPMENT_STATUS_OPTIONS,
  fetchRescueEquipment,
  updateRescueEquipment,
} from '@/services/rescueResource';
import type { RescueEquipmentItem, RescueEquipmentWriteRequest } from '@/services/rescueResource';

// 应急物资与装备（/resource-mgmt）：接后端 /rescue-resources/equipment。
// 全量 CRUD：POST 新增、PUT 编辑（局部更新）、DELETE 删除；写操作受 rescue:equipment:write
// 权限码控制（V93 已登记）。quantity 是编配数量、stockQuantity 是当前库存，分开维护。

const rows = ref<RescueEquipmentItem[]>([]);
const loading = ref(false);

const dialogVisible = ref(false);
const editRow = ref<Record<string, unknown> | null>(null);

const FIELDS: FieldDef[] = [
  {
    prop: 'name',
    label: '装备名称',
    type: 'input',
    required: true,
    placeholder: '如 正压式空气呼吸器',
  },
  {
    prop: 'squadron',
    label: '所属中队',
    type: 'input',
    required: true,
    placeholder: '如 炼油中队',
  },
  { prop: 'category', label: '装备类别', type: 'input', placeholder: '如 防护装备' },
  { prop: 'unit', label: '计量单位', type: 'input', placeholder: '如 具' },
  { prop: 'quantity', label: '编配数量', type: 'number' },
  { prop: 'stockQuantity', label: '当前库存', type: 'number' },
  {
    prop: 'equipmentStatus',
    label: '装备状态',
    type: 'select',
    options: EQUIPMENT_STATUS_OPTIONS,
  },
  { prop: 'leaderName', label: '责任人', type: 'input', required: true },
  { prop: 'leaderPhone', label: '责任人电话', type: 'input', required: true },
  { prop: 'model', label: '规格型号', type: 'input', required: true, placeholder: '如 RHZK6.8' },
  { prop: 'protectionType', label: '防护类型', type: 'input', placeholder: '如 隔绝式' },
  { prop: 'filterCanister', label: '滤毒罐型号', type: 'input' },
  { prop: 'maxContinuousUse', label: '最长连续使用', type: 'input', placeholder: '如 60 分钟' },
  { prop: 'storageLocation', label: '存放位置', type: 'input' },
  { prop: 'purchaseBatch', label: '采购批次', type: 'input' },
  { prop: 'factoryValidityYears', label: '出厂有效期', type: 'input', placeholder: '如 10' },
  { prop: 'remainingValidity', label: '剩余有效期', type: 'input', placeholder: '如 7 年 4 个月' },
  { prop: 'lastInspectionDate', label: '上次检查', type: 'input', placeholder: '如 2026-09-01' },
  {
    prop: 'nextMandatoryMaintenanceDate',
    label: '下次强检',
    type: 'input',
    placeholder: '如 2027-03-01',
  },
  { prop: 'scrapWarning', label: '报废预警', type: 'input' },
  { prop: 'issueRegistration', label: '领用登记', type: 'textarea' },
  { prop: 'spareParts', label: '备品备件', type: 'textarea' },
];

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

function openCreate(): void {
  editRow.value = null;
  dialogVisible.value = true;
}

function openEdit(row: RescueEquipmentItem): void {
  editRow.value = { ...row } as unknown as Record<string, unknown>;
  dialogVisible.value = true;
}

async function onSave(payload: Record<string, unknown>, id: number | null): Promise<void> {
  try {
    const body = payload as RescueEquipmentWriteRequest;
    if (id == null) {
      await createRescueEquipment(body);
      toastOk('装备已新增');
    } else {
      await updateRescueEquipment(id, body);
      toastOk('已保存');
    }
    dialogVisible.value = false;
    await load();
  } catch (err) {
    toastErr(err, id == null ? '新增失败：' : '保存失败：');
  }
}

async function onDelete(row: RescueEquipmentItem): Promise<void> {
  if (row.id == null) return;
  try {
    await ElMessageBox.confirm(
      `确认删除装备「${row.name || String(row.id)}」？删除后不可恢复。`,
      '删除确认',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' },
    );
  } catch {
    return; // 用户取消
  }
  try {
    await deleteRescueEquipment(row.id);
    ElMessage.success('已删除');
    await load();
  } catch (err) {
    toastErr(err, '删除失败：');
  }
}

onMounted(load);

// 三端实时刷新：任一端改动装备台账，本列表自动重拉
useDomainAutoRefresh('rescue.equipment', load, { immediate: false });
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
        <el-button v-permission="'rescue:equipment:write'" type="primary" @click="openCreate">
          新增装备
        </el-button>
      </template>
    </MgmtPageHead>

    <MgmtProTable :data="rows">
      <el-table-column prop="name" label="装备名称" min-width="180">
        <template #default="{ row }">{{ row.name || '—' }}</template>
      </el-table-column>
      <el-table-column prop="category" label="类别" min-width="120">
        <template #default="{ row }">{{ row.category || '—' }}</template>
      </el-table-column>
      <el-table-column prop="squadron" label="所属中队" min-width="130">
        <template #default="{ row }">{{ row.squadron || '—' }}</template>
      </el-table-column>
      <el-table-column prop="quantity" label="配置数量" width="100" align="center">
        <template #default="{ row }">{{ asItem(row).quantity ?? '—' }}</template>
      </el-table-column>
      <el-table-column prop="stockQuantity" label="库存" width="90" align="center">
        <template #default="{ row }">{{ asItem(row).stockQuantity ?? '—' }}</template>
      </el-table-column>
      <el-table-column prop="leaderName" label="负责人" min-width="110">
        <template #default="{ row }">{{ row.leaderName || '—' }}</template>
      </el-table-column>
      <el-table-column prop="equipmentStatus" label="状态" min-width="110">
        <template #default="{ row }">{{ row.equipmentStatus || '—' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button
            v-permission="'rescue:equipment:write'"
            link
            type="primary"
            @click="openEdit(row as RescueEquipmentItem)"
          >
            编辑
          </el-button>
          <el-button
            v-permission="'rescue:equipment:write'"
            link
            type="danger"
            @click="onDelete(row as RescueEquipmentItem)"
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
      title="应急物资与装备"
      @save="onSave"
    />
  </div>
</template>
