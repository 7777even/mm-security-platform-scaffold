<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Document } from '@element-plus/icons-vue';
import { useDomainAutoRefresh } from '@/composables/useDomainAutoRefresh';
import MgmtProTable from '../../components/MgmtProTable.vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import MgmtRecordEditDialog, { type FieldDef } from '../../components/MgmtRecordEditDialog.vue';
import { toastErr, toastOk } from '../../utils/feedback';
import {
  createPlanCatalogRow,
  deletePlanCatalogRow,
  fetchEmergencyPlanCatalogRows,
  updatePlanCatalogRow,
} from '@/services/emergencyPlan';
import type {
  EmergencyPlanCatalogRow,
  EmergencyPlanCatalogWriteRequest,
} from '@/services/emergencyPlan';

// 预案目录管理（/plan-mgmt）：接后端 /emergency-plans/catalog-items（可编辑扁平台账）。
// 区别于 /catalog 层次化只读摘要（大屏展示用）。全量 CRUD，写操作受 emergency:plan-catalog:write
// 权限码控制（V97 已登记）。编辑态字段与列表契约同名，行对象可直接灌进表单，无需映射。

const rows = ref<EmergencyPlanCatalogRow[]>([]);
const loading = ref(false);

const dialogVisible = ref(false);
const editRow = ref<Record<string, unknown> | null>(null);

const FIELDS: FieldDef[] = [
  { prop: 'planCode', label: '目录编码', type: 'input', placeholder: '如 company / branch' },
  { prop: 'label', label: '层级标签', type: 'input', required: true, placeholder: '如 公司级预案' },
  { prop: 'planName', label: '当前预案', type: 'input', placeholder: '如 茂名石化应急预案' },
  {
    prop: 'canSwitch',
    label: '可切换',
    type: 'select',
    options: [
      { label: '不可切换', value: 0 },
      { label: '可切换', value: 1 },
    ],
  },
  {
    prop: 'isCurrent',
    label: '是否当前',
    type: 'select',
    options: [
      { label: '否', value: 0 },
      { label: '是', value: 1 },
    ],
  },
  { prop: 'sortNo', label: '排序号', type: 'number', placeholder: '升序展示' },
];

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetchEmergencyPlanCatalogRows();
    rows.value = Array.isArray(res) ? res : [];
  } catch (err) {
    toastErr(err, '加载预案目录失败：');
    rows.value = [];
  } finally {
    loading.value = false;
  }
}

function openCreate(): void {
  editRow.value = null;
  dialogVisible.value = true;
}

function openEdit(row: EmergencyPlanCatalogRow): void {
  editRow.value = { ...row } as unknown as Record<string, unknown>;
  dialogVisible.value = true;
}

async function onSave(payload: Record<string, unknown>, id: number | null): Promise<void> {
  try {
    const body = payload as EmergencyPlanCatalogWriteRequest;
    if (id == null) {
      await createPlanCatalogRow(body);
      toastOk('预案目录行已新增');
    } else {
      await updatePlanCatalogRow(id, body);
      toastOk('已保存');
    }
    dialogVisible.value = false;
    await load();
  } catch (err) {
    toastErr(err, id == null ? '新增失败：' : '保存失败：');
  }
}

async function onDelete(row: EmergencyPlanCatalogRow): Promise<void> {
  if (row.id == null) return;
  try {
    await ElMessageBox.confirm(
      `确认删除预案目录行「${row.label || String(row.id)}」？删除后不可恢复。`,
      '删除确认',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' },
    );
  } catch {
    return; // 用户取消
  }
  try {
    await deletePlanCatalogRow(Number(row.id));
    ElMessage.success('已删除');
    await load();
  } catch (err) {
    toastErr(err, '删除失败：');
  }
}

onMounted(load);

// 三端实时刷新：任一端改动预案目录台账，本列表自动重拉
useDomainAutoRefresh('emergency.plan-catalog', load, { immediate: false });
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
        <el-button v-permission="'emergency:plan-catalog:write'" type="primary" @click="openCreate">
          新增目录行
        </el-button>
      </template>
    </MgmtPageHead>

    <MgmtProTable :data="rows">
      <el-table-column prop="id" label="编号" width="90" />
      <el-table-column prop="planCode" label="目录编码" width="140">
        <template #default="{ row }">{{ row.planCode || '—' }}</template>
      </el-table-column>
      <el-table-column prop="label" label="层级标签" min-width="160">
        <template #default="{ row }">{{ row.label || '—' }}</template>
      </el-table-column>
      <el-table-column prop="planName" label="当前预案" min-width="220">
        <template #default="{ row }">{{ row.planName || '—' }}</template>
      </el-table-column>
      <el-table-column label="可切换" width="100" align="center">
        <template #default="{ row }">
          <span class="tag" :class="row.canSwitch ? 'tag-success' : 'tag-info'">
            {{ row.canSwitch ? '可切换' : '不可' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="是否当前" width="110" align="center">
        <template #default="{ row }">
          <span class="tag" :class="row.isCurrent ? 'tag-success' : 'tag-info'">
            {{ row.isCurrent ? '当前' : '否' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="sortNo" label="排序号" width="90" align="center">
        <template #default="{ row }">{{ row.sortNo ?? '—' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button
            v-permission="'emergency:plan-catalog:write'"
            link
            type="primary"
            @click="openEdit(row as EmergencyPlanCatalogRow)"
          >
            编辑
          </el-button>
          <el-button
            v-permission="'emergency:plan-catalog:write'"
            link
            type="danger"
            @click="onDelete(row as EmergencyPlanCatalogRow)"
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
      title="预案目录行"
      @save="onSave"
    />
  </div>
</template>
