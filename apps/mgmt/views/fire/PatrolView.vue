<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Calendar } from '@element-plus/icons-vue';
import { ElMessageBox } from 'element-plus';
import MgmtProTable from '../../components/MgmtProTable.vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import MgmtRecordEditDialog, { type FieldDef } from '../../components/MgmtRecordEditDialog.vue';
import { toastErr, toastOk } from '../../utils/feedback';
import {
  fetchFirePatrols,
  createFirePatrol,
  updateFirePatrol,
  deleteFirePatrol,
} from '@/services/fireMonitoring';
import type {
  FirePatrolRecord,
  FirePatrolWriteRequest,
  PatrolShift,
} from '@/services/fireMonitoring';
import { useDomainAutoRefresh } from '@/composables/useDomainAutoRefresh';

// 日常防火巡查管理（/patrol-mgmt）：接后端 /fire/patrols。后端台账新增/编辑/删除走 fire:patrol-write。
const rows = ref<FirePatrolRecord[]>([]);
const loading = ref(false);

/** 异常数 = 巡查项里 result 非「正常」的数量。 */
function abnormalCount(r: FirePatrolRecord): number {
  if (!Array.isArray(r.checkItems)) return 0;
  return r.checkItems.filter((it) => it.result && it.result !== '正常').length;
}

const SHIFT_TEXT: Record<string, string> = { 上午: '上午', 下午: '下午', 夜间: '夜间' };

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetchFirePatrols();
    rows.value = Array.isArray(res) ? res : [];
  } catch (err) {
    toastErr(err, '加载防火巡查记录失败：');
    rows.value = [];
  } finally {
    loading.value = false;
  }
}

// —— CRUD 弹窗（MgmtRecordEditDialog 标准范式）——
const dialogVisible = ref(false);
const editRow = ref<Record<string, unknown> | null>(null);

const SHIFT_OPTIONS = [
  { label: '上午', value: '上午' },
  { label: '下午', value: '下午' },
  { label: '夜间', value: '夜间' },
];

const FIELDS: FieldDef[] = [
  {
    prop: 'patrolDate',
    label: '巡查日期',
    type: 'date',
    dateType: 'date',
    valueFormat: 'YYYY-MM-DD',
    required: true,
  },
  { prop: 'shift', label: '班次', type: 'select', options: SHIFT_OPTIONS },
  { prop: 'dutyPerson', label: '巡查责任人', type: 'input' },
  { prop: 'patrolCount', label: '当班次数', type: 'input', placeholder: '如 第1次' },
  { prop: 'locations', label: '巡查部位', type: 'input', placeholder: '多个部位用逗号/顿号分隔' },
  {
    prop: 'completed',
    label: '是否完成',
    type: 'select',
    options: [
      { label: '是', value: true },
      { label: '否', value: false },
    ],
  },
  { prop: 'workOrderNo', label: '关联工单号', type: 'input' },
];

function openCreate(): void {
  editRow.value = null;
  dialogVisible.value = true;
}

function openEdit(row: FirePatrolRecord): void {
  const base = { ...row } as Record<string, unknown>;
  if (Array.isArray(row.locations)) {
    base.locations = row.locations.join('、');
  }
  editRow.value = base;
  dialogVisible.value = true;
}

async function onSave(payload: Record<string, unknown>, id: number | null): Promise<void> {
  const locationsRaw = payload.locations;
  const locations =
    typeof locationsRaw === 'string'
      ? locationsRaw
          .split(/[,，、]/)
          .map((s) => s.trim())
          .filter(Boolean)
      : Array.isArray(locationsRaw)
        ? (locationsRaw as string[])
        : undefined;
  const clean: FirePatrolWriteRequest = {
    patrolDate: payload.patrolDate as string,
    shift: (payload.shift as PatrolShift) || undefined,
    dutyPerson: (payload.dutyPerson as string) || undefined,
    patrolCount: (payload.patrolCount as string) || undefined,
    locations,
    completed: (payload.completed as boolean) ?? undefined,
    workOrderNo: (payload.workOrderNo as string) || undefined,
  };
  if (id == null) {
    await createFirePatrol(clean);
  } else {
    await updateFirePatrol(id, clean);
  }
  await load();
}

async function onDelete(row: FirePatrolRecord): Promise<void> {
  try {
    await ElMessageBox.confirm(
      `确认删除 ${row.patrolDate || ''} ${row.shift || ''} 的巡查记录？`,
      '删除确认',
      {
        type: 'warning',
        confirmButtonText: '删除',
        cancelButtonText: '取消',
      },
    );
  } catch {
    return;
  }
  try {
    await deleteFirePatrol(row.id);
    toastOk('已删除');
    await load();
  } catch (err) {
    toastErr(err, '删除失败：');
  }
}

onMounted(load);
// 写后实时刷新：后端 fire.patrol-record 广播触发本订阅重拉台账。
useDomainAutoRefresh('fire.patrol-record', load, { immediate: false });
</script>

<template>
  <div>
    <MgmtPageHead
      title="日常防火巡查管理"
      crumb="消防管理 / 日常防火巡查管理"
      :icon="Calendar"
      icon-tone="blue"
    >
      <template #actions>
        <el-button v-permission="'fire:patrol-write'" type="primary" @click="openCreate">
          新增
        </el-button>
        <el-button :loading="loading" @click="load">刷新</el-button>
      </template>
    </MgmtPageHead>

    <MgmtProTable :data="rows">
      <el-table-column prop="patrolDate" label="巡查日期" min-width="140" />
      <el-table-column prop="shift" label="班次" min-width="100">
        <template #default="{ row }">{{
          SHIFT_TEXT[(row as FirePatrolRecord).shift] || (row as FirePatrolRecord).shift || '—'
        }}</template>
      </el-table-column>
      <el-table-column prop="dutyPerson" label="值班人员" min-width="120">
        <template #default="{ row }">{{ (row as FirePatrolRecord).dutyPerson || '—' }}</template>
      </el-table-column>
      <el-table-column prop="patrolCount" label="部位数" min-width="100">
        <template #default="{ row }">{{ (row as FirePatrolRecord).patrolCount || '—' }}</template>
      </el-table-column>
      <el-table-column label="异常数" min-width="100">
        <template #default="{ row }">
          <span :class="['abn', abnormalCount(row as FirePatrolRecord) > 0 ? 'abn-warn' : '']">{{
            abnormalCount(row as FirePatrolRecord)
          }}</span>
        </template>
      </el-table-column>
      <el-table-column label="完成" min-width="90">
        <template #default="{ row }">
          <span :class="(row as FirePatrolRecord).completed ? 'ok' : 'no'">{{
            (row as FirePatrolRecord).completed ? '是' : '否'
          }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="workOrderNo" label="工单号" min-width="160">
        <template #default="{ row }">{{ (row as FirePatrolRecord).workOrderNo || '—' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button
            v-permission="'fire:patrol-write'"
            link
            type="primary"
            @click="openEdit(row as FirePatrolRecord)"
          >
            编辑
          </el-button>
          <el-button
            v-permission="'fire:patrol-write'"
            link
            type="danger"
            @click="onDelete(row as FirePatrolRecord)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </MgmtProTable>

    <el-empty v-if="!loading && !rows.length" description="暂无防火巡查记录" />

    <MgmtRecordEditDialog
      v-model="dialogVisible"
      :edit-row="editRow"
      :fields="FIELDS"
      title="防火巡查记录"
      @save="onSave"
    />
  </div>
</template>

<style scoped>
.ok {
  color: #16a34a;
}

.no {
  color: #9ca3af;
}

.abn-warn {
  color: #dc2626;
  font-weight: 600;
}
</style>
