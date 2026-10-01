<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useDomainAutoRefresh } from '@/composables/useDomainAutoRefresh';
import { Promotion } from '@element-plus/icons-vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import MgmtProTable from '../../components/MgmtProTable.vue';
import MgmtRecordEditDialog, { type FieldDef } from '../../components/MgmtRecordEditDialog.vue';
import { toastErr, toastOk } from '../../utils/feedback';
import {
  createEmergencyCommandRecord,
  deleteEmergencyCommandRecord,
  fetchEmergencyCommandRecords,
  updateEmergencyCommandRecord,
} from '@/services/businessWrite';
import type {
  EmergencyCommandRecordView,
  EmergencyCommandRecordWriteRequest,
} from '@/services/businessWrite';

// 应急指令下发（/emergency-command）：接后端 /emergency/command-records。
// 全量 CRUD：POST 下发、PUT 编辑、DELETE 删除。业务留痕，绝不触发物理设备
// （零下行红线在前后端双重拦截）；写操作受 emergency:command:write 权限码控制。

const rows = ref<EmergencyCommandRecordView[]>([]);
const loading = ref(false);

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetchEmergencyCommandRecords();
    rows.value = Array.isArray(res) ? res : [];
  } catch (err) {
    toastErr(err, '加载指令记录失败：');
    rows.value = [];
  } finally {
    loading.value = false;
  }
}

// 状态为既定枚举 → 下拉；类别/下发方式/目标/备注无字典 → 自由文本（不臆造下拉）
const STATUS_OPTIONS = [
  { label: '待下发', value: '待下发' },
  { label: '已下发', value: '已下发' },
  { label: '执行中', value: '执行中' },
  { label: '已完成', value: '已完成' },
];

const FIELDS: FieldDef[] = [
  {
    prop: 'commandCode',
    label: '指令编号',
    type: 'input',
    required: true,
    placeholder: '如 CMD-20260820-001',
  },
  { prop: 'commandName', label: '指令名称', type: 'input', placeholder: '如 罐区泡沫联锁' },
  { prop: 'commandKind', label: '类别', type: 'input', placeholder: '如 应急调度' },
  {
    prop: 'currStatus',
    label: '当前状态',
    type: 'select',
    required: true,
    options: STATUS_OPTIONS,
  },
  { prop: 'dispatchMode', label: '下发方式', type: 'input', placeholder: '如 APP+短信' },
  { prop: 'target', label: '目标', type: 'input', placeholder: '下发对象 / 单位' },
  { prop: 'remark', label: '备注', type: 'textarea', placeholder: '补充说明' },
];

const dialogVisible = ref(false);
const editRow = ref<Record<string, unknown> | null>(null);

function openCreate(): void {
  editRow.value = null;
  dialogVisible.value = true;
}
function openEdit(row: EmergencyCommandRecordView): void {
  editRow.value = { ...row } as unknown as Record<string, unknown>;
  dialogVisible.value = true;
}

async function onSave(payload: Record<string, unknown>, id: number | null): Promise<void> {
  try {
    const body = payload as unknown as EmergencyCommandRecordWriteRequest;
    if (id == null) {
      await createEmergencyCommandRecord(body);
      toastOk('指令已下发');
    } else {
      await updateEmergencyCommandRecord(id, body);
      toastOk('已保存');
    }
    dialogVisible.value = false;
    await load();
  } catch (err) {
    toastErr(err, id == null ? '下发失败：' : '保存失败：');
  }
}

async function onDelete(row: EmergencyCommandRecordView): Promise<void> {
  if (row.id == null) return;
  try {
    await ElMessageBox.confirm(
      `确认删除应急指令「${row.commandCode || String(row.id)}」？删除后不可恢复。`,
      '删除确认',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' },
    );
  } catch {
    return; // 用户取消
  }
  try {
    await deleteEmergencyCommandRecord(row.id);
    ElMessage.success('已删除');
    await load();
  } catch (err) {
    toastErr(err, '删除失败：');
  }
}

onMounted(load);

// 三端实时刷新：任一端下发应急指令，本列表自动重拉（realtime-channel spec）
useDomainAutoRefresh('emergency.command', load, { immediate: false });
</script>

<template>
  <div>
    <MgmtPageHead
      title="应急指令下发"
      crumb="应急及演练管理 / 应急指令下发"
      :icon="Promotion"
      icon-tone="blue"
    >
      <template #actions>
        <el-button v-permission="'emergency:command:write'" type="primary" @click="openCreate">
          下发指令
        </el-button>
      </template>
    </MgmtPageHead>

    <MgmtProTable :data="rows">
      <el-table-column prop="commandCode" label="指令编号" min-width="150" />
      <el-table-column prop="commandName" label="指令名称" min-width="140">
        <template #default="{ row }">{{ row.commandName || '—' }}</template>
      </el-table-column>
      <el-table-column prop="commandKind" label="类别" min-width="110">
        <template #default="{ row }">{{ row.commandKind || '—' }}</template>
      </el-table-column>
      <el-table-column prop="currStatus" label="当前状态" min-width="110">
        <template #default="{ row }">
          <span
            class="tag"
            :class="
              row.currStatus === '已下发' || row.currStatus === '已完成'
                ? 'tag-success'
                : 'tag-warning'
            "
          >
            {{ row.currStatus || '—' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="dispatchMode" label="下发方式" min-width="120">
        <template #default="{ row }">{{ row.dispatchMode || '—' }}</template>
      </el-table-column>
      <el-table-column prop="target" label="目标" min-width="120">
        <template #default="{ row }">{{ row.target || '—' }}</template>
      </el-table-column>
      <el-table-column prop="operator" label="操作人" min-width="100">
        <template #default="{ row }">{{ row.operator || '—' }}</template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" min-width="160">
        <template #default="{ row }">{{ row.createdAt || '—' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button
            v-permission="'emergency:command:write'"
            link
            type="primary"
            @click="openEdit(row as EmergencyCommandRecordView)"
          >
            编辑
          </el-button>
          <el-button
            v-permission="'emergency:command:write'"
            link
            type="danger"
            @click="onDelete(row as EmergencyCommandRecordView)"
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
      title="应急指令"
      @save="onSave"
    />
  </div>
</template>
