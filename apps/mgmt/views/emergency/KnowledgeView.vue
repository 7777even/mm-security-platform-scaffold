<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Collection } from '@element-plus/icons-vue';
import { useDomainAutoRefresh } from '@/composables/useDomainAutoRefresh';
import MgmtProTable from '../../components/MgmtProTable.vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import MgmtRecordEditDialog, { type FieldDef } from '../../components/MgmtRecordEditDialog.vue';
import { toastErr, toastOk } from '../../utils/feedback';
import {
  createKnowledge,
  deleteKnowledge,
  fetchEmergencyKnowledge,
  updateKnowledge,
} from '@/services/knowledge';
import type { KnowledgeItem, KnowledgeWriteRequest } from '@/services/knowledge';

// 应急知识库（/emergency-knowledge）：接后端 /emergency/knowledge。
// 全量 CRUD：POST 新增、PUT 编辑（局部更新）、DELETE 删除；写操作受 emergency:knowledge:write
// 权限码控制（V94 已登记）。编辑态字段与列表契约同名，行对象可直接灌进表单，无需映射。

const rows = ref<KnowledgeItem[]>([]);
const loading = ref(false);

const dialogVisible = ref(false);
const editRow = ref<Record<string, unknown> | null>(null);

const FIELDS: FieldDef[] = [
  {
    prop: 'title',
    label: '知识标题',
    type: 'input',
    required: true,
    placeholder: '如 岗位应急处置卡',
  },
  { prop: 'count', label: '条目数', type: 'number', placeholder: '如 158' },
  { prop: 'icon', label: '图标', type: 'input', placeholder: 'Element Plus 图标名，如 Document' },
  { prop: 'description', label: '知识说明', type: 'textarea', placeholder: '知识分类说明文案' },
];

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetchEmergencyKnowledge();
    rows.value = Array.isArray(res?.items) ? res.items : [];
  } catch (err) {
    toastErr(err, '加载知识库失败：');
    rows.value = [];
  } finally {
    loading.value = false;
  }
}

function openCreate(): void {
  editRow.value = null;
  dialogVisible.value = true;
}

function openEdit(row: KnowledgeItem): void {
  editRow.value = { ...row } as unknown as Record<string, unknown>;
  dialogVisible.value = true;
}

async function onSave(payload: Record<string, unknown>, id: number | null): Promise<void> {
  try {
    const body = payload as KnowledgeWriteRequest;
    if (id == null) {
      await createKnowledge(body);
      toastOk('知识条目已新增');
    } else {
      await updateKnowledge(id, body);
      toastOk('已保存');
    }
    dialogVisible.value = false;
    await load();
  } catch (err) {
    toastErr(err, id == null ? '新增失败：' : '保存失败：');
  }
}

async function onDelete(row: KnowledgeItem): Promise<void> {
  if (row.id == null) return;
  try {
    await ElMessageBox.confirm(
      `确认删除知识条目「${row.title || String(row.id)}」？删除后不可恢复。`,
      '删除确认',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' },
    );
  } catch {
    return; // 用户取消
  }
  try {
    await deleteKnowledge(Number(row.id));
    ElMessage.success('已删除');
    await load();
  } catch (err) {
    toastErr(err, '删除失败：');
  }
}

onMounted(load);

// 三端实时刷新：任一端改动知识库台账，本列表自动重拉
useDomainAutoRefresh('emergency.knowledge', load, { immediate: false });
</script>

<template>
  <div>
    <MgmtPageHead
      title="应急知识库"
      crumb="应急及演练管理 / 应急知识库"
      :icon="Collection"
      icon-tone="blue"
    >
      <template #actions>
        <el-button :loading="loading" @click="load">刷新</el-button>
        <el-button v-permission="'emergency:knowledge:write'" type="primary" @click="openCreate">
          新增知识
        </el-button>
      </template>
    </MgmtPageHead>

    <MgmtProTable :data="rows">
      <el-table-column prop="id" label="知识编号" min-width="140" />
      <el-table-column prop="title" label="知识标题" min-width="200">
        <template #default="{ row }">{{ row.title || '—' }}</template>
      </el-table-column>
      <el-table-column prop="count" label="条目数" width="100" align="center">
        <template #default="{ row }">{{ row.count ?? '—' }}</template>
      </el-table-column>
      <el-table-column prop="icon" label="图标" min-width="120">
        <template #default="{ row }">{{ row.icon || '—' }}</template>
      </el-table-column>
      <el-table-column prop="description" label="知识说明" min-width="280">
        <template #default="{ row }">{{ row.description || '—' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button
            v-permission="'emergency:knowledge:write'"
            link
            type="primary"
            @click="openEdit(row as KnowledgeItem)"
          >
            编辑
          </el-button>
          <el-button
            v-permission="'emergency:knowledge:write'"
            link
            type="danger"
            @click="onDelete(row as KnowledgeItem)"
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
      title="应急知识库"
      @save="onSave"
    />
  </div>
</template>
