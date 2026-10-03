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
  createBollard,
  deleteBollard,
  fetchBollards,
  updateBollard,
  type BollardItem,
  type BollardWriteRequest,
} from '@/services/security';

// 液压防撞柱管理（/bollard-mgmt）：接后端 /security/bollards。
// 全量 CRUD：POST 新增、PUT 编辑、DELETE 删除；写操作受 security:bollard-write 权限码控制。
// status 为设备实时状态，仅读不写（零下行控制红线），写请求体不含该字段。
// 写成功后后端广播 security.bollard，管理端 / 大屏订阅方自动重拉。
const rows = ref<BollardItem[]>([]);
const loading = ref(false);
const dialogVisible = ref(false);
const editRow = ref<Record<string, unknown> | null>(null);

// 列表已返回全量字段，编辑直接以行数据回填，无需额外取详情。
const FIELDS: FieldDef[] = [
  {
    prop: 'name',
    label: '防恐柱名称',
    type: 'input',
    required: true,
    placeholder: '如 1#门防恐柱',
  },
  { prop: 'zone', label: '所属区域', type: 'input', placeholder: '如 1#门' },
  { prop: 'longitude', label: '经度', type: 'number' },
  { prop: 'latitude', label: '纬度', type: 'number' },
];

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetchBollards();
    rows.value = Array.isArray(res) ? res : [];
  } catch (err) {
    toastErr(err, '加载防撞柱失败：');
    rows.value = [];
  } finally {
    loading.value = false;
  }
}

function openCreate(): void {
  editRow.value = null;
  dialogVisible.value = true;
}

function openEdit(row: BollardItem): void {
  if (row.id == null) return;
  editRow.value = { ...row } as unknown as Record<string, unknown>;
  dialogVisible.value = true;
}

async function onSave(payload: Record<string, unknown>, id: number | null): Promise<void> {
  try {
    const body = payload as BollardWriteRequest;
    if (id == null) {
      await createBollard(body);
      toastOk('防恐柱台账已新增');
    } else {
      await updateBollard(id, body);
      toastOk('已保存');
    }
    dialogVisible.value = false;
    await load();
  } catch (err) {
    toastErr(err, id == null ? '新增失败：' : '保存失败：');
  }
}

async function onDelete(row: BollardItem): Promise<void> {
  if (row.id == null) return;
  try {
    await ElMessageBox.confirm(
      `确认删除防恐柱台账「${row.name || String(row.id)}」？删除后不可恢复。`,
      '删除确认',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' },
    );
  } catch {
    return; // 用户取消
  }
  try {
    await deleteBollard(Number(row.id));
    ElMessage.success('已删除');
    await load();
  } catch (err) {
    toastErr(err, '删除失败：');
  }
}

onMounted(load);

// 三端实时刷新：任一端改防恐柱台账，本列表自动重拉
useDomainAutoRefresh('security.bollard', load, { immediate: false });
</script>

<template>
  <div>
    <MgmtPageHead
      title="液压防撞柱管理"
      crumb="治安防恐管理 / 液压防撞柱管理"
      :icon="Lock"
      icon-tone="blue"
    >
      <template #actions>
        <el-button :loading="loading" @click="load">刷新</el-button>
        <el-button v-permission="'security:bollard-write'" type="primary" @click="openCreate">
          新增
        </el-button>
      </template>
    </MgmtPageHead>

    <MgmtProTable :data="rows">
      <el-table-column prop="id" label="编号" min-width="100" />
      <el-table-column prop="name" label="名称" min-width="160">
        <template #default="{ row }">{{ row.name || '—' }}</template>
      </el-table-column>
      <el-table-column prop="zone" label="区域" min-width="160">
        <template #default="{ row }">{{ row.zone || '—' }}</template>
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
            v-permission="'security:bollard-write'"
            link
            type="primary"
            @click="openEdit(row as BollardItem)"
          >
            编辑
          </el-button>
          <el-button
            v-permission="'security:bollard-write'"
            link
            type="danger"
            @click="onDelete(row as BollardItem)"
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
      title="防恐柱台账"
      @save="onSave"
    />
  </div>
</template>
