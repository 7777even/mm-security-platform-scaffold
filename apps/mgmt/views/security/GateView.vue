<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Lock } from '@element-plus/icons-vue';
import { useDomainAutoRefresh } from '@/composables/useDomainAutoRefresh';
import MgmtProTable from '../../components/MgmtProTable.vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import MgmtRecordEditDialog, { type FieldDef } from '../../components/MgmtRecordEditDialog.vue';
import { toastErr, toastOk } from '../../utils/feedback';
import {
  createGateControl,
  deleteGateControl,
  fetchGateControls,
  updateGateControl,
  type GateControlItem,
  type GateControlWriteRequest,
} from '@/services/security';

// 卡口门禁信息管理（/gate-mgmt）：接后端 /security/gate-controls。
// 全量 CRUD：POST 新增、PUT 编辑、DELETE 删除；写操作受 security:gate-write 权限码控制。
// status 为设备实时状态，仅读不写（零下行控制红线），写请求体不含该字段。
// 写成功后后端广播 security.gate-control，管理端 / 大屏订阅方自动重拉。
const rows = ref<GateControlItem[]>([]);
const loading = ref(false);
const dialogVisible = ref(false);
const editRow = ref<Record<string, unknown> | null>(null);

// 列表已返回全量字段，编辑直接以行数据回填，无需额外取详情（与人员备案的摘要+详情两阶段不同）。
const FIELDS: FieldDef[] = [
  { prop: 'name', label: '道闸名称', type: 'input', required: true, placeholder: '如 1#门-道闸1' },
  { prop: 'location', label: '所属门', type: 'input', placeholder: '如 1#门' },
  { prop: 'longitude', label: '经度', type: 'number' },
  { prop: 'latitude', label: '纬度', type: 'number' },
];

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetchGateControls();
    rows.value = Array.isArray(res) ? res : [];
  } catch (err) {
    toastErr(err, '加载卡口门禁失败：');
    rows.value = [];
  } finally {
    loading.value = false;
  }
}

function openCreate(): void {
  editRow.value = null;
  dialogVisible.value = true;
}

function openEdit(row: GateControlItem): void {
  if (row.id == null) return;
  editRow.value = { ...row } as unknown as Record<string, unknown>;
  dialogVisible.value = true;
}

async function onSave(payload: Record<string, unknown>, id: number | null): Promise<void> {
  try {
    const body = payload as GateControlWriteRequest;
    if (id == null) {
      await createGateControl(body);
      toastOk('道闸台账已新增');
    } else {
      await updateGateControl(id, body);
      toastOk('已保存');
    }
    dialogVisible.value = false;
    await load();
  } catch (err) {
    toastErr(err, id == null ? '新增失败：' : '保存失败：');
  }
}

async function onDelete(row: GateControlItem): Promise<void> {
  if (row.id == null) return;
  try {
    await ElMessageBox.confirm(
      `确认删除道闸台账「${row.name || String(row.id)}」？删除后不可恢复。`,
      '删除确认',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' },
    );
  } catch {
    return; // 用户取消
  }
  try {
    await deleteGateControl(Number(row.id));
    ElMessage.success('已删除');
    await load();
  } catch (err) {
    toastErr(err, '删除失败：');
  }
}

onMounted(load);

// 三端实时刷新：任一端改道闸台账，本列表自动重拉
useDomainAutoRefresh('security.gate-control', load, { immediate: false });
</script>

<template>
  <div>
    <MgmtPageHead
      title="卡口门禁信息管理"
      crumb="治安防恐管理 / 卡口门禁信息管理"
      :icon="Lock"
      icon-tone="blue"
    >
      <template #actions>
        <el-button :loading="loading" @click="load">刷新</el-button>
        <el-button v-permission="'security:gate-write'" type="primary" @click="openCreate">
          新增
        </el-button>
      </template>
    </MgmtPageHead>

    <MgmtProTable :data="rows">
      <el-table-column prop="id" label="编号" min-width="100" />
      <el-table-column prop="name" label="名称" min-width="160">
        <template #default="{ row }">{{ row.name || '—' }}</template>
      </el-table-column>
      <el-table-column prop="location" label="位置" min-width="160">
        <template #default="{ row }">{{ row.location || '—' }}</template>
      </el-table-column>
      <el-table-column prop="status" label="状态" min-width="100">
        <template #default="{ row }">{{ row.status || '—' }}</template>
      </el-table-column>
      <el-table-column prop="longitude" label="经度" min-width="120">
        <template #default="{ row }">{{ row.longitude ?? '—' }}</template>
      </el-table-column>
      <el-table-column prop="latitude" label="纬度" min-width="120">
        <template #default="{ row }">{{ row.latitude ?? '—' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button
            v-permission="'security:gate-write'"
            link
            type="primary"
            @click="openEdit(row as GateControlItem)"
          >
            编辑
          </el-button>
          <el-button
            v-permission="'security:gate-write'"
            link
            type="danger"
            @click="onDelete(row as GateControlItem)"
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
      title="卡口门禁台账"
      @save="onSave"
    />
  </div>
</template>
