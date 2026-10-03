<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElMessageBox } from 'element-plus';
import { Tickets } from '@element-plus/icons-vue';
import MgmtProTable from '../../components/MgmtProTable.vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import MgmtRecordEditDialog, { type FieldDef } from '../../components/MgmtRecordEditDialog.vue';
import { toastErr, toastOk } from '../../utils/feedback';
import {
  createSpecialOperation,
  deleteSpecialOperation,
  fetchSpecialOperations,
  updateSpecialOperation,
  type SpecialOperationItem,
  type SpecialOperationQuery,
  type SpecialOperationWriteRequest,
} from '@/services/specialOperation';
import { useDomainAutoRefresh } from '@/composables/useDomainAutoRefresh';

// 特殊作业管理（/special-ops）：接后端 /special-operations 分页列表，支持类型/等级/状态过滤。
const rows = ref<SpecialOperationItem[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const loading = ref(false);
const dialogVisible = ref(false);
const editRow = ref<Record<string, unknown> | null>(null);

const type = ref('');
const level = ref('');
const status = ref('');

const typeOptions = ['动火作业', '受限空间', '高处作业', '临时用电', '吊装作业', '盲板抽堵'];
const levelOptions = ['一级', '二级', '三级'];
const statusOptions = ['审批中', '进行中', '已完成', '已取消'];

const FIELDS: FieldDef[] = [
  { prop: 'opType', label: '作业类型', type: 'input', required: true },
  { prop: 'ticketArea', label: '作业区域', type: 'input' },
  { prop: 'opLevel', label: '作业等级', type: 'input' },
  { prop: 'ticketStatus', label: '作业票状态', type: 'input' },
  { prop: 'startTime', label: '开始时间', type: 'input', placeholder: '如 2026-08-21 08:30:00' },
  { prop: 'endTime', label: '结束时间', type: 'input', placeholder: '如 2026-08-21 17:30:00' },
  { prop: 'timeRange', label: '作业时间段', type: 'input', placeholder: '如 08:30-17:30' },
  { prop: 'workUnit', label: '作业单位', type: 'input' },
  { prop: 'applyUnit', label: '申请单位', type: 'input' },
  { prop: 'operationDate', label: '作业日期', type: 'input', placeholder: '如 2026-08-21' },
  { prop: 'workLocation', label: '作业地点', type: 'input' },
  { prop: 'isContractor', label: '是否承包商', type: 'input' },
  { prop: 'hazardType', label: '危害类型', type: 'input' },
  { prop: 'leaderName', label: '负责人姓名', type: 'input' },
  { prop: 'leaderPhone', label: '负责人电话', type: 'input' },
  { prop: 'position', label: '负责人岗位', type: 'input' },
  { prop: 'longitude', label: '经度', type: 'number' },
  { prop: 'latitude', label: '纬度', type: 'number' },
  { prop: 'changeReason', label: '变更原因', type: 'textarea' },
  { prop: 'cancelReason', label: '取消原因', type: 'textarea' },
  { prop: 'guardianName', label: '监护人姓名', type: 'input' },
  { prop: 'workers', label: '作业人员', type: 'textarea' },
  { prop: 'permitNo', label: '许可证编号', type: 'input' },
  { prop: 'content', label: '作业内容', type: 'textarea' },
  { prop: 'videoCount', label: '现场视频数量', type: 'number' },
  { prop: 'gasMonitorCount', label: '气体检测点数量', type: 'number' },
  { prop: 'personnelCount', label: '作业人员数量', type: 'number' },
];

async function load(p = page.value, s = pageSize.value): Promise<void> {
  loading.value = true;
  page.value = p;
  pageSize.value = s;
  try {
    const query: SpecialOperationQuery = {
      page: p,
      size: s,
      type: type.value || undefined,
      level: level.value || undefined,
      status: status.value || undefined,
    };
    const res = await fetchSpecialOperations(query);
    rows.value = Array.isArray(res?.list) ? res.list : [];
    total.value = typeof res?.total === 'number' ? res.total : 0;
  } catch (err) {
    toastErr(err, '加载特殊作业失败：');
    rows.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
}

function onPageChange(p: number) {
  load(p, pageSize.value);
}
function onSizeChange(s: number) {
  load(1, s);
}
function onFilter() {
  load(1, pageSize.value);
}

function openCreate(): void {
  editRow.value = null;
  dialogVisible.value = true;
}

function openEdit(row: SpecialOperationItem): void {
  if (row.id == null) return;
  editRow.value = {
    ...row,
    opType: row.type,
    ticketArea: row.area,
    opLevel: row.level,
    ticketStatus: row.status,
    workUnit: row.unit,
    workLocation: row.location,
  } as unknown as Record<string, unknown>;
  dialogVisible.value = true;
}

async function onSave(payload: Record<string, unknown>, id: number | null): Promise<void> {
  try {
    const body = payload as SpecialOperationWriteRequest;
    if (id == null) {
      await createSpecialOperation(body);
      toastOk('特殊作业已新增');
    } else {
      await updateSpecialOperation(id, body);
      toastOk('已保存');
    }
    dialogVisible.value = false;
    await load();
  } catch (err) {
    toastErr(err, id == null ? '新增失败：' : '保存失败：');
  }
}

async function onDelete(row: SpecialOperationItem): Promise<void> {
  if (row.id == null) return;
  try {
    await ElMessageBox.confirm(
      `确认删除特殊作业「${row.type || row.permitNo || String(row.id)}」？删除后不可恢复。`,
      '删除确认',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' },
    );
  } catch {
    return; // 用户取消
  }
  try {
    await deleteSpecialOperation(row.id);
    toastOk('已删除');
    await load();
  } catch (err) {
    toastErr(err, '删除失败：');
  }
}

onMounted(load);
useDomainAutoRefresh('special-operation', load);
</script>

<template>
  <div>
    <MgmtPageHead
      title="特殊作业管理"
      crumb="生产信息管理 / 特殊作业管理"
      :icon="Tickets"
      icon-tone="blue"
    >
      <template #actions>
        <el-button :loading="loading" @click="load()">刷新</el-button>
        <el-button v-permission="'special-operation:write'" type="primary" @click="openCreate">
          新增
        </el-button>
      </template>
    </MgmtPageHead>

    <div style="display: flex; gap: 12px; margin-bottom: 12px; flex-wrap: wrap">
      <el-select
        v-model="type"
        placeholder="作业类型"
        clearable
        style="width: 160px"
        @change="onFilter"
      >
        <el-option v-for="t in typeOptions" :key="t" :label="t" :value="t" />
      </el-select>
      <el-select
        v-model="level"
        placeholder="风险等级"
        clearable
        style="width: 140px"
        @change="onFilter"
      >
        <el-option v-for="l in levelOptions" :key="l" :label="l" :value="l" />
      </el-select>
      <el-select
        v-model="status"
        placeholder="状态"
        clearable
        style="width: 140px"
        @change="onFilter"
      >
        <el-option v-for="s in statusOptions" :key="s" :label="s" :value="s" />
      </el-select>
    </div>

    <MgmtProTable
      :data="rows"
      :total="total"
      :page="page"
      :page-size="pageSize"
      @update:page="onPageChange"
      @update:page-size="onSizeChange"
    >
      <el-table-column prop="permitNo" label="作业票编号" min-width="160" />
      <el-table-column prop="type" label="作业类型" min-width="110" />
      <el-table-column prop="content" label="作业内容" min-width="180">
        <template #default="{ row }">{{ row.content || '—' }}</template>
      </el-table-column>
      <el-table-column prop="applyUnit" label="作业单位" min-width="140">
        <template #default="{ row }">{{ row.applyUnit || row.unit || '—' }}</template>
      </el-table-column>
      <el-table-column prop="level" label="风险等级" min-width="100" />
      <el-table-column prop="status" label="状态" min-width="100" />
      <el-table-column prop="timeRange" label="有效期" min-width="160">
        <template #default="{ row }">{{ row.timeRange || row.operationDate || '—' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button
            v-permission="'special-operation:write'"
            link
            type="primary"
            @click="openEdit(row as SpecialOperationItem)"
          >
            编辑
          </el-button>
          <el-button
            v-permission="'special-operation:write'"
            link
            type="danger"
            @click="onDelete(row as SpecialOperationItem)"
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
      title="特殊作业"
      @save="onSave"
    />
  </div>
</template>
