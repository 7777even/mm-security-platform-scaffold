<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Phone } from '@element-plus/icons-vue';
import { useDomainAutoRefresh } from '@/composables/useDomainAutoRefresh';
import MgmtProTable from '../../components/MgmtProTable.vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import MgmtRecordEditDialog, { type FieldDef } from '../../components/MgmtRecordEditDialog.vue';
import { toastErr, toastOk } from '../../utils/feedback';
import {
  createEmergencyPhone,
  deleteEmergencyPhone,
  fetchEmergencyPhones,
  updateEmergencyPhone,
} from '@/services/emergencyPhone';
import type { EmergencyPhone, PhoneWriteRequest } from '@/services/emergencyPhone';

// 应急通讯录管理（/contacts-mgmt）：接后端 /emergency/phones（扁平通讯录）。
// 全量 CRUD：POST 新增、PUT 编辑（局部更新）、DELETE 删除；写操作受 emergency:phone:write
// 权限码控制（V95 已登记）。编辑态字段与列表契约同名，行对象可直接灌进表单，无需映射。

const rows = ref<EmergencyPhone[]>([]);
const loading = ref(false);

const dialogVisible = ref(false);
const editRow = ref<Record<string, unknown> | null>(null);

const CATEGORY_OPTIONS = ['消防', '医疗', '公安', '厂内应急', '保卫值班', '应急通讯', '智能联动'];

const FIELDS: FieldDef[] = [
  { prop: 'name', label: '名称/单位', type: 'input', required: true, placeholder: '如 消防报警' },
  { prop: 'number', label: '联系电话', type: 'input', required: true, placeholder: '如 119' },
  {
    prop: 'category',
    label: '分类',
    type: 'select',
    options: CATEGORY_OPTIONS.map((c) => ({ label: c, value: c })),
    placeholder: '选择分类',
  },
];

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetchEmergencyPhones();
    rows.value = Array.isArray(res?.entries) ? res.entries : [];
  } catch (err) {
    toastErr(err, '加载应急通讯录失败：');
    rows.value = [];
  } finally {
    loading.value = false;
  }
}

function openCreate(): void {
  editRow.value = null;
  dialogVisible.value = true;
}

function openEdit(row: EmergencyPhone): void {
  editRow.value = { ...row } as unknown as Record<string, unknown>;
  dialogVisible.value = true;
}

async function onSave(payload: Record<string, unknown>, id: number | null): Promise<void> {
  try {
    const body = payload as PhoneWriteRequest;
    if (id == null) {
      await createEmergencyPhone(body);
      toastOk('通讯录条目已新增');
    } else {
      await updateEmergencyPhone(id, body);
      toastOk('已保存');
    }
    dialogVisible.value = false;
    await load();
  } catch (err) {
    toastErr(err, id == null ? '新增失败：' : '保存失败：');
  }
}

async function onDelete(row: EmergencyPhone): Promise<void> {
  if (row.id == null) return;
  try {
    await ElMessageBox.confirm(
      `确认删除通讯录条目「${row.name || String(row.id)}」？删除后不可恢复。`,
      '删除确认',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' },
    );
  } catch {
    return; // 用户取消
  }
  try {
    await deleteEmergencyPhone(Number(row.id));
    ElMessage.success('已删除');
    await load();
  } catch (err) {
    toastErr(err, '删除失败：');
  }
}

onMounted(load);

// 三端实时刷新：任一端改动通讯录台账，本列表自动重拉
useDomainAutoRefresh('emergency.phone', load, { immediate: false });
</script>

<template>
  <div>
    <MgmtPageHead
      title="应急通讯录管理"
      crumb="应急及演练管理 / 应急通讯录管理"
      :icon="Phone"
      icon-tone="blue"
    >
      <template #actions>
        <el-button :loading="loading" @click="load">刷新</el-button>
        <el-button v-permission="'emergency:phone:write'" type="primary" @click="openCreate">
          新增联系人
        </el-button>
      </template>
    </MgmtPageHead>

    <MgmtProTable :data="rows">
      <el-table-column prop="name" label="名称" min-width="160">
        <template #default="{ row }">{{ row.name || '—' }}</template>
      </el-table-column>
      <el-table-column prop="number" label="号码" min-width="140" />
      <el-table-column prop="category" label="类别" min-width="120">
        <template #default="{ row }">{{ row.category || '—' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button
            v-permission="'emergency:phone:write'"
            link
            type="primary"
            @click="openEdit(row as EmergencyPhone)"
          >
            编辑
          </el-button>
          <el-button
            v-permission="'emergency:phone:write'"
            link
            type="danger"
            @click="onDelete(row as EmergencyPhone)"
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
      title="应急通讯录管理"
      @save="onSave"
    />
  </div>
</template>
