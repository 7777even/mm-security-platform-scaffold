<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { User } from '@element-plus/icons-vue';
import { useDomainAutoRefresh } from '@/composables/useDomainAutoRefresh';
import MgmtProTable from '../../components/MgmtProTable.vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import MgmtRecordEditDialog, { type FieldDef } from '../../components/MgmtRecordEditDialog.vue';
import { toastErr, toastOk } from '../../utils/feedback';
import {
  createPersonSearch,
  deletePersonSearch,
  fetchPersonSearch,
  updatePersonSearch,
  type PersonSearchWriteRequest,
} from '@/services/security';
import type { PersonSearchResult } from '@/services/map-data/securitySearchMock';

// 人员备案管理（/personnel-registration）：接后端 /security/search/person（关键字检索）。
// 全量 CRUD：POST 新增、PUT 编辑（局部更新）、DELETE 删除；写操作受 security:person-write
// 权限码控制。写成功后后端广播 security.person-search，管理端 / 大屏订阅方自动重拉。
const rows = ref<PersonSearchResult[]>([]);
const loading = ref(false);
const keyword = ref('');

const dialogVisible = ref(false);
const editRow = ref<Record<string, unknown> | null>(null);

// 列表只返回检索摘要（姓名/卡口/状态/日期），编辑弹窗按同一契约的写请求字段展开完整备案信息。
const FIELDS: FieldDef[] = [
  { prop: 'name', label: '姓名', type: 'input', required: true, placeholder: '如 张三' },
  { prop: 'gate', label: '通行卡口', type: 'input', placeholder: '如 东门-入' },
  {
    prop: 'status',
    label: '进出状态',
    type: 'select',
    options: [
      { label: '入厂', value: '入厂' },
      { label: '出厂', value: '出厂' },
    ],
  },
  {
    prop: 'date',
    label: '通行日期',
    type: 'date',
    dateType: 'date',
    valueFormat: 'YYYY-MM-DD',
    placeholder: '选择通行日期',
  },
  {
    prop: 'gender',
    label: '性别',
    type: 'select',
    options: [
      { label: '男', value: '男' },
      { label: '女', value: '女' },
    ],
  },
  { prop: 'phone', label: '联系电话', type: 'input' },
  { prop: 'company', label: '所属单位', type: 'input', placeholder: '如 茂名石化检修公司' },
  { prop: 'idNumber', label: '证件号', type: 'input' },
  { prop: 'appointmentNo', label: '预约单号', type: 'input', placeholder: '如 YY202610030021' },
  { prop: 'appointmentTime', label: '预约时段', type: 'input', placeholder: '如 08:00 — 17:00' },
  { prop: 'visitPurpose', label: '来访事由', type: 'input', placeholder: '如 设备检修' },
  { prop: 'specialOperation', label: '特种作业类型', type: 'input', placeholder: '无则留空' },
  { prop: 'operationArea', label: '作业区域', type: 'input', placeholder: '如 炼油二区' },
];

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetchPersonSearch(keyword.value.trim() || undefined);
    rows.value = Array.isArray(res) ? res : [];
  } catch (err) {
    toastErr(err, '加载人员备案失败：');
    rows.value = [];
  } finally {
    loading.value = false;
  }
}

function openCreate(): void {
  editRow.value = null;
  dialogVisible.value = true;
}

function openEdit(row: PersonSearchResult): void {
  editRow.value = { ...row } as unknown as Record<string, unknown>;
  dialogVisible.value = true;
}

async function onSave(payload: Record<string, unknown>, id: number | null): Promise<void> {
  try {
    const body = payload as PersonSearchWriteRequest;
    if (id == null) {
      await createPersonSearch(body);
      toastOk('人员备案已新增');
    } else {
      await updatePersonSearch(id, body);
      toastOk('已保存');
    }
    dialogVisible.value = false;
    await load();
  } catch (err) {
    toastErr(err, id == null ? '新增失败：' : '保存失败：');
  }
}

async function onDelete(row: PersonSearchResult): Promise<void> {
  if (row.id == null) return;
  try {
    await ElMessageBox.confirm(
      `确认删除人员备案「${row.name || String(row.id)}」？删除后不可恢复。`,
      '删除确认',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' },
    );
  } catch {
    return; // 用户取消
  }
  try {
    await deletePersonSearch(Number(row.id));
    ElMessage.success('已删除');
    await load();
  } catch (err) {
    toastErr(err, '删除失败：');
  }
}

onMounted(load);

// 三端实时刷新：任一端改动人员备案，本列表自动重拉
useDomainAutoRefresh('security.person-search', load, { immediate: false });
</script>

<template>
  <div>
    <MgmtPageHead
      title="人员备案管理"
      crumb="治安防恐管理 / 人员备案管理"
      :icon="User"
      icon-tone="blue"
    >
      <template #actions>
        <el-input
          v-model="keyword"
          placeholder="搜索姓名"
          clearable
          style="width: 200px"
          @keyup.enter="load"
          @clear="load"
        />
        <el-button type="primary" @click="load">查询</el-button>
        <el-button :loading="loading" @click="load">刷新</el-button>
        <el-button v-permission="'security:person-write'" type="primary" @click="openCreate">
          新增
        </el-button>
      </template>
    </MgmtPageHead>

    <MgmtProTable :data="rows">
      <el-table-column prop="id" label="编号" min-width="100" />
      <el-table-column prop="name" label="姓名" min-width="140">
        <template #default="{ row }">{{ row.name || '—' }}</template>
      </el-table-column>
      <el-table-column prop="gate" label="卡口" min-width="160">
        <template #default="{ row }">{{ row.gate || '—' }}</template>
      </el-table-column>
      <el-table-column prop="status" label="状态" min-width="100">
        <template #default="{ row }">{{ row.status || '—' }}</template>
      </el-table-column>
      <el-table-column prop="date" label="日期" min-width="140">
        <template #default="{ row }">{{ row.date || '—' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button
            v-permission="'security:person-write'"
            link
            type="primary"
            @click="openEdit(row as PersonSearchResult)"
          >
            编辑
          </el-button>
          <el-button
            v-permission="'security:person-write'"
            link
            type="danger"
            @click="onDelete(row as PersonSearchResult)"
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
      title="人员备案"
      @save="onSave"
    />
  </div>
</template>
