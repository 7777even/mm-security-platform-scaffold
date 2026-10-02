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
  createEmergencyCase,
  deleteEmergencyCase,
  fetchEmergencyCases,
  updateEmergencyCase,
} from '@/services/emergencyCase';
import type { EmergencyCaseItem, EmergencyCaseWriteRequest } from '@/services/emergencyCase';

// 事故案例库管理（/case-lib）：接后端 /emergency/cases（可编辑台账，区别于 fac_alarm 自动归档的只读结案聚合）。
// 全量 CRUD：POST 新增、PUT 编辑（局部更新）、DELETE 删除；写操作受 emergency:case:write
// 权限码控制（V96 已登记）。编辑态字段与列表契约同名，行对象可直接灌进表单，无需映射。

const rows = ref<EmergencyCaseItem[]>([]);
const loading = ref(false);

const dialogVisible = ref(false);
const editRow = ref<Record<string, unknown> | null>(null);

const FIELDS: FieldDef[] = [
  {
    prop: 'title',
    label: '事故名称',
    type: 'input',
    required: true,
    placeholder: '如 T-301 罐区泄漏处置复盘',
  },
  { prop: 'accidentType', label: '事故类型', type: 'input', placeholder: '如 泄漏 / 火灾 / 爆炸' },
  { prop: 'location', label: '事故地点', type: 'input', placeholder: '如 储运部 T-301 罐区' },
  {
    prop: 'occurredAt',
    label: '发生时间',
    type: 'date',
    dateType: 'datetime',
    valueFormat: 'YYYY-MM-DD HH:mm:ss',
    placeholder: '选择事故发生时间',
  },
  { prop: 'summary', label: '案例摘要', type: 'textarea', placeholder: '事故经过与处置要点' },
  { prop: 'lessons', label: '经验教训', type: 'textarea', placeholder: '复盘启示与改进项' },
];

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetchEmergencyCases();
    rows.value = Array.isArray(res?.items) ? res.items : [];
  } catch (err) {
    toastErr(err, '加载事故案例失败：');
    rows.value = [];
  } finally {
    loading.value = false;
  }
}

function openCreate(): void {
  editRow.value = null;
  dialogVisible.value = true;
}

function openEdit(row: EmergencyCaseItem): void {
  editRow.value = { ...row } as unknown as Record<string, unknown>;
  dialogVisible.value = true;
}

async function onSave(payload: Record<string, unknown>, id: number | null): Promise<void> {
  try {
    const body = payload as EmergencyCaseWriteRequest;
    if (id == null) {
      await createEmergencyCase(body);
      toastOk('案例已新增');
    } else {
      await updateEmergencyCase(id, body);
      toastOk('已保存');
    }
    dialogVisible.value = false;
    await load();
  } catch (err) {
    toastErr(err, id == null ? '新增失败：' : '保存失败：');
  }
}

async function onDelete(row: EmergencyCaseItem): Promise<void> {
  if (row.id == null) return;
  try {
    await ElMessageBox.confirm(
      `确认删除事故案例「${row.title || String(row.id)}」？删除后不可恢复。`,
      '删除确认',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' },
    );
  } catch {
    return; // 用户取消
  }
  try {
    await deleteEmergencyCase(Number(row.id));
    ElMessage.success('已删除');
    await load();
  } catch (err) {
    toastErr(err, '删除失败：');
  }
}

onMounted(load);

// 三端实时刷新：任一端改动案例台账，本列表自动重拉
useDomainAutoRefresh('emergency.case', load, { immediate: false });
</script>

<template>
  <div>
    <MgmtPageHead
      title="事故案例库管理"
      crumb="应急及演练管理 / 事故案例库管理"
      :icon="Document"
      icon-tone="blue"
    >
      <template #actions>
        <el-button :loading="loading" @click="load">刷新</el-button>
        <el-button v-permission="'emergency:case:write'" type="primary" @click="openCreate">
          新增案例
        </el-button>
      </template>
    </MgmtPageHead>

    <MgmtProTable :data="rows">
      <el-table-column prop="id" label="案例编号" width="120" />
      <el-table-column prop="title" label="事故名称" min-width="200">
        <template #default="{ row }">{{ row.title || '—' }}</template>
      </el-table-column>
      <el-table-column prop="accidentType" label="事故类型" width="120">
        <template #default="{ row }">{{ row.accidentType || '—' }}</template>
      </el-table-column>
      <el-table-column prop="location" label="事故地点" min-width="180">
        <template #default="{ row }">{{ row.location || '—' }}</template>
      </el-table-column>
      <el-table-column prop="occurredAt" label="发生时间" min-width="170">
        <template #default="{ row }">{{ row.occurredAt || '—' }}</template>
      </el-table-column>
      <el-table-column prop="summary" label="案例摘要" min-width="260">
        <template #default="{ row }">{{ row.summary || '—' }}</template>
      </el-table-column>
      <el-table-column prop="lessons" label="经验教训" min-width="260">
        <template #default="{ row }">{{ row.lessons || '—' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button
            v-permission="'emergency:case:write'"
            link
            type="primary"
            @click="openEdit(row as EmergencyCaseItem)"
          >
            编辑
          </el-button>
          <el-button
            v-permission="'emergency:case:write'"
            link
            type="danger"
            @click="onDelete(row as EmergencyCaseItem)"
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
      title="事故案例"
      @save="onSave"
    />
  </div>
</template>
