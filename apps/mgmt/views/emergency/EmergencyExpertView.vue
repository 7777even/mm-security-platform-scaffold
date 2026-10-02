<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Medal } from '@element-plus/icons-vue';
import { useDomainAutoRefresh } from '@/composables/useDomainAutoRefresh';
import MgmtProTable from '../../components/MgmtProTable.vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import MgmtRecordEditDialog, { type FieldDef } from '../../components/MgmtRecordEditDialog.vue';
import { toastErr, toastOk } from '../../utils/feedback';
import {
  createRescuePersonnel,
  deleteRescuePersonnel,
  DUTY_STATUS_OPTIONS,
  fetchRescuePersonnel,
  updateRescuePersonnel,
} from '@/services/rescueResource';
import type {
  RescuePersonnelItem,
  RescuePersonnelList,
  RescuePersonnelWriteRequest,
} from '@/services/rescueResource';

// 应急专家（/emergency-expert）：接后端 /rescue-resources/personnel。
// 全量 CRUD：POST 新增、PUT 编辑（局部更新）、DELETE 删除；写操作受 rescue:personnel:write
// 权限码控制（V93 已登记）。编辑态字段与列表契约同名，行对象可直接灌进表单，无需映射。

const rows = ref<RescuePersonnelItem[]>([]);
const roles = ref<string[]>([]);
const roleFilter = ref<string>('');
const loading = ref(false);

const dialogVisible = ref(false);
const editRow = ref<Record<string, unknown> | null>(null);

const FIELDS: FieldDef[] = [
  { prop: 'name', label: '姓名', type: 'input', required: true, placeholder: '如 王强' },
  { prop: 'squadron', label: '中队', type: 'input', required: true, placeholder: '如 炼油中队' },
  { prop: 'role', label: '岗位', type: 'input', required: true, placeholder: '如 指挥员' },
  {
    prop: 'dutyStatus',
    label: '值班状态',
    type: 'select',
    options: DUTY_STATUS_OPTIONS,
  },
  { prop: 'personGroup', label: '所属分组', type: 'input', placeholder: '如 危化品处置组' },
  { prop: 'phone', label: '联系电话', type: 'input', placeholder: '如 13800000001' },
];

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res: RescuePersonnelList = await fetchRescuePersonnel(
      undefined,
      roleFilter.value || undefined,
    );
    rows.value = Array.isArray(res?.items) ? res.items : [];
    if (Array.isArray(res?.roles)) roles.value = res.roles;
  } catch (err) {
    toastErr(err, '加载应急专家失败：');
    rows.value = [];
  } finally {
    loading.value = false;
  }
}

function openCreate(): void {
  editRow.value = null;
  dialogVisible.value = true;
}

function openEdit(row: RescuePersonnelItem): void {
  editRow.value = { ...row } as unknown as Record<string, unknown>;
  dialogVisible.value = true;
}

async function onSave(payload: Record<string, unknown>, id: number | null): Promise<void> {
  try {
    const body = payload as RescuePersonnelWriteRequest;
    if (id == null) {
      await createRescuePersonnel(body);
      toastOk('专家已新增');
    } else {
      await updateRescuePersonnel(id, body);
      toastOk('已保存');
    }
    dialogVisible.value = false;
    await load();
  } catch (err) {
    toastErr(err, id == null ? '新增失败：' : '保存失败：');
  }
}

async function onDelete(row: RescuePersonnelItem): Promise<void> {
  if (row.id == null) return;
  try {
    await ElMessageBox.confirm(
      `确认删除专家「${row.name || String(row.id)}」？删除后不可恢复。`,
      '删除确认',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' },
    );
  } catch {
    return; // 用户取消
  }
  try {
    await deleteRescuePersonnel(row.id);
    ElMessage.success('已删除');
    await load();
  } catch (err) {
    toastErr(err, '删除失败：');
  }
}

onMounted(load);

// 三端实时刷新：任一端改动人员台账，本列表自动重拉
useDomainAutoRefresh('rescue.personnel', load, { immediate: false });
</script>

<template>
  <div>
    <MgmtPageHead title="应急专家" crumb="应急及演练管理 / 应急专家" :icon="Medal" icon-tone="blue">
      <template #actions>
        <el-select
          v-model="roleFilter"
          placeholder="全部角色"
          clearable
          style="width: 160px"
          @change="load"
        >
          <el-option v-for="r in roles" :key="r" :label="r" :value="r" />
        </el-select>
        <el-button :loading="loading" @click="load">刷新</el-button>
        <el-button v-permission="'rescue:personnel:write'" type="primary" @click="openCreate">
          新增专家
        </el-button>
      </template>
    </MgmtPageHead>

    <MgmtProTable :data="rows">
      <el-table-column prop="name" label="姓名" min-width="120">
        <template #default="{ row }">{{ row.name || '—' }}</template>
      </el-table-column>
      <el-table-column prop="squadron" label="中队" min-width="160">
        <template #default="{ row }">{{ row.squadron || '—' }}</template>
      </el-table-column>
      <el-table-column prop="role" label="岗位" min-width="140">
        <template #default="{ row }">{{ row.role || '—' }}</template>
      </el-table-column>
      <el-table-column prop="dutyStatus" label="值班状态" min-width="110">
        <template #default="{ row }">{{ row.dutyStatus || '—' }}</template>
      </el-table-column>
      <el-table-column prop="phone" label="联系电话" min-width="140">
        <template #default="{ row }">{{ row.phone || '—' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button
            v-permission="'rescue:personnel:write'"
            link
            type="primary"
            @click="openEdit(row as RescuePersonnelItem)"
          >
            编辑
          </el-button>
          <el-button
            v-permission="'rescue:personnel:write'"
            link
            type="danger"
            @click="onDelete(row as RescuePersonnelItem)"
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
      title="应急专家"
      @save="onSave"
    />
  </div>
</template>
