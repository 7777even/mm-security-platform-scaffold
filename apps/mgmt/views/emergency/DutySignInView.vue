<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useDomainAutoRefresh } from '@/composables/useDomainAutoRefresh';
import { Calendar } from '@element-plus/icons-vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import MgmtProTable from '../../components/MgmtProTable.vue';
import MgmtRecordEditDialog, { type FieldDef } from '../../components/MgmtRecordEditDialog.vue';
import { toastErr, toastOk } from '../../utils/feedback';
import {
  createDutySignIn,
  deleteDutySignIn,
  fetchDutySignIns,
  updateDutySignIn,
} from '@/services/businessWrite';
import type { DutySignInView, DutySignInWriteRequest } from '@/services/businessWrite';

// 后端枚举强校验英文码：下拉 label 显示中文、value 存英文码。
const SIGN_ACTION_LABEL: Record<string, string> = { SIGN_IN: '签到', SIGN_OUT: '签退' };

// 值班签到（/duty-sign-in）：接后端 /emergency/duty-sign-ins。
// 全量 CRUD：POST 签到、PUT 编辑、DELETE 删除。业务留痕；
// 写操作受 emergency:duty:write 权限码控制（v-permission）。

const rows = ref<DutySignInView[]>([]);
const loading = ref(false);

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetchDutySignIns();
    rows.value = Array.isArray(res) ? res : [];
  } catch (err) {
    toastErr(err, '加载签到记录失败：');
    rows.value = [];
  } finally {
    loading.value = false;
  }
}

// 签到动作为既定枚举 → 下拉；班次/部门/姓名/备注无字典 → 自由文本（不臆造下拉）
const FIELDS: FieldDef[] = [
  {
    prop: 'dutyDate',
    label: '值班日期',
    type: 'date',
    required: true,
    dateType: 'date',
    valueFormat: 'YYYY-MM-DD',
  },
  { prop: 'shiftName', label: '班次', type: 'input', placeholder: '如 早班 / 中班 / 夜班' },
  { prop: 'department', label: '部门', type: 'input', placeholder: '如 储运部' },
  { prop: 'personName', label: '姓名', type: 'input', required: true, placeholder: '值班人姓名' },
  {
    prop: 'signAction',
    label: '签到动作',
    type: 'select',
    required: true,
    options: [
      { label: '签到', value: 'SIGN_IN' },
      { label: '签退', value: 'SIGN_OUT' },
    ],
  },
  { prop: 'remark', label: '备注', type: 'textarea', placeholder: '补充说明' },
];

const dialogVisible = ref(false);
const editRow = ref<Record<string, unknown> | null>(null);

function openCreate(): void {
  editRow.value = null;
  dialogVisible.value = true;
}
function openEdit(row: DutySignInView): void {
  editRow.value = { ...row } as unknown as Record<string, unknown>;
  dialogVisible.value = true;
}

async function onSave(payload: Record<string, unknown>, id: number | null): Promise<void> {
  try {
    const body = payload as unknown as DutySignInWriteRequest;
    if (id == null) {
      await createDutySignIn(body);
      toastOk(body.signAction === 'SIGN_IN' ? '签到成功' : '签退成功');
    } else {
      await updateDutySignIn(id, body);
      toastOk('已保存');
    }
    dialogVisible.value = false;
    await load();
  } catch (err) {
    toastErr(err, id == null ? '提交失败：' : '保存失败：');
  }
}

async function onDelete(row: DutySignInView): Promise<void> {
  if (row.id == null) return;
  try {
    await ElMessageBox.confirm(
      `确认删除「${row.personName || String(row.id)}」的值班签到记录？删除后不可恢复。`,
      '删除确认',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' },
    );
  } catch {
    return; // 用户取消
  }
  try {
    await deleteDutySignIn(row.id);
    ElMessage.success('已删除');
    await load();
  } catch (err) {
    toastErr(err, '删除失败：');
  }
}

onMounted(load);

// 三端实时刷新：任一端提交值班签到，本列表自动重拉（realtime-channel spec）
useDomainAutoRefresh('emergency.duty', load, { immediate: false });
</script>

<template>
  <div>
    <MgmtPageHead
      title="值班签到"
      crumb="应急及演练管理 / 值班签到"
      :icon="Calendar"
      icon-tone="blue"
    >
      <template #actions>
        <el-button v-permission="'emergency:duty:write'" type="primary" @click="openCreate">
          值班签到
        </el-button>
      </template>
    </MgmtPageHead>

    <MgmtProTable :data="rows">
      <el-table-column prop="dutyDate" label="值班日期" min-width="130" />
      <el-table-column prop="shiftName" label="班次" min-width="100">
        <template #default="{ row }">{{ row.shiftName || '—' }}</template>
      </el-table-column>
      <el-table-column prop="department" label="部门" min-width="120">
        <template #default="{ row }">{{ row.department || '—' }}</template>
      </el-table-column>
      <el-table-column prop="personName" label="姓名" min-width="100" />
      <el-table-column prop="signAction" label="签到动作" min-width="100">
        <template #default="{ row }">
          <span class="tag" :class="row.signAction === 'SIGN_OUT' ? 'tag-info' : 'tag-success'">
            {{ SIGN_ACTION_LABEL[row.signAction] || row.signAction || '—' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="signTime" label="签到时间" min-width="120">
        <template #default="{ row }">{{ row.signTime || '—' }}</template>
      </el-table-column>
      <el-table-column prop="operator" label="操作人" min-width="100">
        <template #default="{ row }">{{ row.operator || '—' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button
            v-permission="'emergency:duty:write'"
            link
            type="primary"
            @click="openEdit(row as DutySignInView)"
          >
            编辑
          </el-button>
          <el-button
            v-permission="'emergency:duty:write'"
            link
            type="danger"
            @click="onDelete(row as DutySignInView)"
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
      title="值班签到"
      @save="onSave"
    />
  </div>
</template>
