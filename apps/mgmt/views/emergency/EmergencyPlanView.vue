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
  createEmergencyPlanMeta,
  deleteEmergencyPlanMeta,
  fetchEmergencyPlanMetaList,
  updateEmergencyPlanMeta,
} from '@/services/emergencyPlan';
import type {
  EmergencyPlanMetaItem,
  EmergencyPlanMetaWriteRequest,
} from '@/services/emergencyPlan';

// 应急预案管理（/emergency-plan）：接后端 /emergency-plans（可编辑主记录台账）。
// 区别于大屏 /options /matrix（只读筛选 + 矩阵视图）。全量 CRUD，写操作受 emergency:plan:write
// 权限码控制（V98 已登记）。编辑态字段与列表契约同名，行对象可直接灌进表单，无需映射。

const rows = ref<EmergencyPlanMetaItem[]>([]);
const loading = ref(false);

const dialogVisible = ref(false);
const editRow = ref<Record<string, unknown> | null>(null);

const TAB_OPTIONS: { label: string; value: string }[] = [
  { label: '应急处置方案', value: 'disposal' },
  { label: '消防救援预案', value: 'fire' },
  { label: '公司级应急预案', value: 'company' },
  { label: '上级单位应急预案', value: 'superior' },
];
const DOMAIN_OPTIONS: { label: string; value: string }[] = [
  { label: '生产域', value: 'production' },
  { label: '消防域', value: 'fire' },
  { label: '周界域', value: 'perimeter' },
  { label: '上级单位域', value: 'superior' },
];

const FIELDS: FieldDef[] = [
  {
    prop: 'planName',
    label: '预案名称',
    type: 'input',
    required: true,
    placeholder: '如 乙烯储罐火灾处置方案',
  },
  {
    prop: 'tabKey',
    label: '预案类别',
    type: 'select',
    options: TAB_OPTIONS,
    placeholder: '选择 Tab 类别',
  },
  { prop: 'accidentType', label: '事故类型', type: 'input', placeholder: '如 火灾 / 泄漏' },
  { prop: 'facility', label: '关联设施', type: 'input', placeholder: '如 乙烯裂解装置' },
  {
    prop: 'domain',
    label: '业务域',
    type: 'select',
    options: DOMAIN_OPTIONS,
    placeholder: '选择业务域',
  },
  {
    prop: 'nuclear',
    label: '核预案',
    type: 'select',
    options: [
      { label: '否', value: false },
      { label: '是', value: true },
    ],
  },
  {
    prop: 'isActive',
    label: '是否激活',
    type: 'select',
    options: [
      { label: '否', value: false },
      { label: '是', value: true },
    ],
  },
  { prop: 'sortNo', label: '排序号', type: 'number', placeholder: '升序展示' },
];

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetchEmergencyPlanMetaList();
    rows.value = Array.isArray(res) ? res : [];
  } catch (err) {
    toastErr(err, '加载应急预案失败：');
    rows.value = [];
  } finally {
    loading.value = false;
  }
}

function openCreate(): void {
  editRow.value = null;
  dialogVisible.value = true;
}

function openEdit(row: EmergencyPlanMetaItem): void {
  editRow.value = { ...row } as unknown as Record<string, unknown>;
  dialogVisible.value = true;
}

async function onSave(payload: Record<string, unknown>, id: number | null): Promise<void> {
  try {
    const body = payload as EmergencyPlanMetaWriteRequest;
    if (id == null) {
      await createEmergencyPlanMeta(body);
      toastOk('应急预案已新增');
    } else {
      await updateEmergencyPlanMeta(id, body);
      toastOk('已保存');
    }
    dialogVisible.value = false;
    await load();
  } catch (err) {
    toastErr(err, id == null ? '新增失败：' : '保存失败：');
  }
}

async function onDelete(row: EmergencyPlanMetaItem): Promise<void> {
  if (row.id == null) return;
  try {
    await ElMessageBox.confirm(
      `确认删除应急预案「${row.planName || String(row.id)}」？删除后不可恢复。`,
      '删除确认',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' },
    );
  } catch {
    return; // 用户取消
  }
  try {
    await deleteEmergencyPlanMeta(Number(row.id));
    ElMessage.success('已删除');
    await load();
  } catch (err) {
    toastErr(err, '删除失败：');
  }
}

onMounted(load);

// 三端实时刷新：任一端改动应急预案台账，本列表自动重拉
useDomainAutoRefresh('emergency.plan', load, { immediate: false });
</script>

<template>
  <div>
    <MgmtPageHead
      title="应急预案管理"
      crumb="应急管理 / 应急预案管理"
      :icon="Document"
      icon-tone="blue"
    >
      <template #actions>
        <el-button :loading="loading" @click="load">刷新</el-button>
        <el-button v-permission="'emergency:plan:write'" type="primary" @click="openCreate">
          新增预案
        </el-button>
      </template>
    </MgmtPageHead>

    <MgmtProTable :data="rows">
      <el-table-column prop="id" label="编号" width="90" />
      <el-table-column prop="planName" label="预案名称" min-width="200">
        <template #default="{ row }">{{ row.planName || '—' }}</template>
      </el-table-column>
      <el-table-column prop="tabKey" label="预案类别" width="150">
        <template #default="{ row }">{{
          TAB_OPTIONS.find((t) => t.value === row.tabKey)?.label || row.tabKey || '—'
        }}</template>
      </el-table-column>
      <el-table-column prop="accidentType" label="事故类型" width="120">
        <template #default="{ row }">{{ row.accidentType || '—' }}</template>
      </el-table-column>
      <el-table-column prop="facility" label="关联设施" min-width="160">
        <template #default="{ row }">{{ row.facility || '—' }}</template>
      </el-table-column>
      <el-table-column prop="domain" label="业务域" width="130">
        <template #default="{ row }">{{
          DOMAIN_OPTIONS.find((d) => d.value === row.domain)?.label || row.domain || '—'
        }}</template>
      </el-table-column>
      <el-table-column label="核预案" width="90" align="center">
        <template #default="{ row }">
          <span class="tag" :class="row.nuclear ? 'tag-success' : 'tag-info'">{{
            row.nuclear ? '是' : '否'
          }}</span>
        </template>
      </el-table-column>
      <el-table-column label="激活" width="90" align="center">
        <template #default="{ row }">
          <span class="tag" :class="row.isActive ? 'tag-success' : 'tag-info'">{{
            row.isActive ? '是' : '否'
          }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="invokeCount" label="调用次数" width="100" align="center">
        <template #default="{ row }">{{ row.invokeCount ?? 0 }}</template>
      </el-table-column>
      <el-table-column prop="lastInvokedAt" label="最近调用" min-width="170">
        <template #default="{ row }">{{ row.lastInvokedAt || '—' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button
            v-permission="'emergency:plan:write'"
            link
            type="primary"
            @click="openEdit(row as EmergencyPlanMetaItem)"
          >
            编辑
          </el-button>
          <el-button
            v-permission="'emergency:plan:write'"
            link
            type="danger"
            @click="onDelete(row as EmergencyPlanMetaItem)"
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
      title="应急预案"
      @save="onSave"
    />
  </div>
</template>
