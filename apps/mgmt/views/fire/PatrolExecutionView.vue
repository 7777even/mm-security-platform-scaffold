<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useDomainAutoRefresh } from '@/composables/useDomainAutoRefresh';
import { Aim } from '@element-plus/icons-vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import MgmtProTable from '../../components/MgmtProTable.vue';
import MgmtRecordEditDialog, { type FieldDef } from '../../components/MgmtRecordEditDialog.vue';
import { toastErr, toastOk } from '../../utils/feedback';
import {
  createPatrolExecution,
  deletePatrolExecution,
  fetchPatrolExecutions,
  updatePatrolExecution,
} from '@/services/businessWrite';
import type { PatrolExecutionView, PatrolExecutionWriteRequest } from '@/services/businessWrite';

// 后端枚举强校验英文码：下拉 label 显示中文、value 存英文码。
const EXEC_RESULT_LABEL: Record<string, string> = { NORMAL: '正常', ABNORMAL: '异常' };

// 消防巡更执行（/patrol-execution）：接后端 /fire/patrol-executions（GET 列表 + POST 上报）。
// 业务留痕：巡更记录落独立表，巡查计划本体保持只读；写按钮受 fire-alarm:patrol:write 权限码控制。

const rows = ref<PatrolExecutionView[]>([]);
const loading = ref(false);

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetchPatrolExecutions();
    rows.value = Array.isArray(res) ? res : [];
  } catch (err) {
    toastErr(err, '加载巡更记录失败：');
    rows.value = [];
  } finally {
    loading.value = false;
  }
}

// 执行结果为既定枚举 → 下拉；班次/值班人员/位置/发现/工单号无字典 → 自由文本（不臆造下拉）
const FIELDS: FieldDef[] = [
  {
    prop: 'patrolDate',
    label: '巡查日期',
    type: 'date',
    required: true,
    dateType: 'date',
    valueFormat: 'YYYY-MM-DD',
  },
  { prop: 'shiftName', label: '班次', type: 'input', placeholder: '如 早班 / 中班 / 夜班' },
  {
    prop: 'dutyPerson',
    label: '值班人员',
    type: 'input',
    required: true,
    placeholder: '巡更人姓名',
  },
  { prop: 'patrolCount', label: '部位数', type: 'input', placeholder: '如 12' },
  { prop: 'location', label: '位置', type: 'input', placeholder: '如 T-301 罐区' },
  {
    prop: 'execResult',
    label: '执行结果',
    type: 'select',
    required: true,
    options: [
      { label: '正常', value: 'NORMAL' },
      { label: '异常', value: 'ABNORMAL' },
    ],
  },
  { prop: 'finding', label: '发现', type: 'textarea', placeholder: '异常情况描述' },
  { prop: 'workOrderNo', label: '工单号', type: 'input', placeholder: '关联工单号（如有）' },
];

const dialogVisible = ref(false);
const editRow = ref<Record<string, unknown> | null>(null);

function openCreate(): void {
  editRow.value = null;
  dialogVisible.value = true;
}
function openEdit(row: PatrolExecutionView): void {
  editRow.value = { ...row } as unknown as Record<string, unknown>;
  dialogVisible.value = true;
}

async function onSave(payload: Record<string, unknown>, id: number | null): Promise<void> {
  try {
    const body = payload as unknown as PatrolExecutionWriteRequest;
    if (id == null) {
      await createPatrolExecution(body);
      toastOk('巡更上报成功');
    } else {
      await updatePatrolExecution(id, body);
      toastOk('已保存');
    }
    dialogVisible.value = false;
    await load();
  } catch (err) {
    toastErr(err, id == null ? '提交失败：' : '保存失败：');
  }
}

async function onDelete(row: PatrolExecutionView): Promise<void> {
  if (row.id == null) return;
  try {
    await ElMessageBox.confirm(
      `确认删除「${row.dutyPerson || String(row.id)}」的巡更记录？删除后不可恢复。`,
      '删除确认',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' },
    );
  } catch {
    return; // 用户取消
  }
  try {
    await deletePatrolExecution(row.id);
    ElMessage.success('已删除');
    await load();
  } catch (err) {
    toastErr(err, '删除失败：');
  }
}

onMounted(load);

// 三端实时刷新：任一端上报巡更，本列表自动重拉（realtime-channel spec）
useDomainAutoRefresh('fire.patrol', load, { immediate: false });
</script>

<template>
  <div>
    <MgmtPageHead
      title="消防巡更执行"
      crumb="消防设施管理 / 消防巡更执行"
      :icon="Aim"
      icon-tone="blue"
    >
      <template #actions>
        <el-button v-permission="'fire-alarm:patrol:write'" type="primary" @click="openCreate">
          巡更上报
        </el-button>
      </template>
    </MgmtPageHead>

    <MgmtProTable :data="rows">
      <el-table-column prop="patrolDate" label="巡查日期" min-width="130" />
      <el-table-column prop="shiftName" label="班次" min-width="100">
        <template #default="{ row }">{{ row.shiftName || '—' }}</template>
      </el-table-column>
      <el-table-column prop="dutyPerson" label="值班人员" min-width="110" />
      <el-table-column prop="patrolCount" label="部位数" min-width="90">
        <template #default="{ row }">{{ row.patrolCount || '—' }}</template>
      </el-table-column>
      <el-table-column prop="location" label="位置" min-width="140">
        <template #default="{ row }">{{ row.location || '—' }}</template>
      </el-table-column>
      <el-table-column prop="execResult" label="执行结果" min-width="100">
        <template #default="{ row }">
          <span
            class="tag"
            :class="
              row.execResult === 'NORMAL'
                ? 'tag-success'
                : row.execResult === 'ABNORMAL'
                  ? 'tag-bad'
                  : 'tag-warning'
            "
          >
            {{ EXEC_RESULT_LABEL[row.execResult] || row.execResult || '—' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="finding" label="发现" min-width="160">
        <template #default="{ row }">{{ row.finding || '—' }}</template>
      </el-table-column>
      <el-table-column prop="workOrderNo" label="工单号" min-width="130">
        <template #default="{ row }">{{ row.workOrderNo || '—' }}</template>
      </el-table-column>
      <el-table-column prop="operator" label="操作人" min-width="100">
        <template #default="{ row }">{{ row.operator || '—' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button
            v-permission="'fire-alarm:patrol:write'"
            link
            type="primary"
            @click="openEdit(row as PatrolExecutionView)"
          >
            编辑
          </el-button>
          <el-button
            v-permission="'fire-alarm:patrol:write'"
            link
            type="danger"
            @click="onDelete(row as PatrolExecutionView)"
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
      title="消防巡更记录"
      @save="onSave"
    />
  </div>
</template>
