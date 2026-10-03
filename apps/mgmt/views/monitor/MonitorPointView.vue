<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElMessageBox } from 'element-plus';
import { Aim } from '@element-plus/icons-vue';
import MgmtProTable from '../../components/MgmtProTable.vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import MgmtRecordEditDialog, { type FieldDef } from '../../components/MgmtRecordEditDialog.vue';
import { toastErr, toastOk } from '../../utils/feedback';
import {
  createMonitoringPoint,
  deleteMonitoringPoint,
  fetchMonitoringPoints,
  updateMonitoringPoint,
  type MonitoringPointWriteRequest,
} from '@/services/hazard';
import type { MonitoringPoint } from '@/services/map-data/monitoringPointsMock';
import { useDomainAutoRefresh } from '@/composables/useDomainAutoRefresh';

// 监测点位管理（/monitor-point）：接后端 /monitoring/points（工艺/消防监测点列表）。
const rows = ref<MonitoringPoint[]>([]);
const loading = ref(false);
const dialogVisible = ref(false);
const editRow = ref<Record<string, unknown> | null>(null);
const editKey = ref<string | null>(null);

const FIELDS: FieldDef[] = [
  {
    prop: 'id',
    label: '点位编码',
    type: 'input',
    required: true,
    disabledOnEdit: true,
  },
  { prop: 'name', label: '点位名称', type: 'input' },
  { prop: 'category', label: '点位分类', type: 'input' },
  { prop: 'status', label: '点位状态', type: 'input' },
  { prop: 'lastTime', label: '最近采集时间', type: 'input', placeholder: '如 2026-08-21 09:03' },
  { prop: 'org', label: '责任单位', type: 'input' },
  { prop: 'longitude', label: '经度', type: 'number' },
  { prop: 'latitude', label: '纬度', type: 'number' },
];

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetchMonitoringPoints();
    rows.value = Array.isArray(res) ? res : [];
  } catch (err) {
    toastErr(err, '加载监测点位失败：');
    rows.value = [];
  } finally {
    loading.value = false;
  }
}

function openCreate(): void {
  editKey.value = null;
  editRow.value = null;
  dialogVisible.value = true;
}

function openEdit(row: MonitoringPoint): void {
  if (!row.id) return;
  editKey.value = row.id;
  editRow.value = { ...row } as unknown as Record<string, unknown>;
  dialogVisible.value = true;
}

async function onSave(payload: Record<string, unknown>, _id: number | null): Promise<void> {
  const key = editKey.value;
  try {
    const body = payload as MonitoringPointWriteRequest;
    if (key == null) {
      await createMonitoringPoint(body);
      toastOk('监测点位已新增');
    } else {
      await updateMonitoringPoint(key, body);
      toastOk('已保存');
    }
    dialogVisible.value = false;
    await load();
  } catch (err) {
    toastErr(err, key == null ? '新增失败：' : '保存失败：');
  }
}

async function onDelete(row: MonitoringPoint): Promise<void> {
  if (!row.id) return;
  try {
    await ElMessageBox.confirm(
      `确认删除监测点位「${row.name || row.id}」？删除后不可恢复。`,
      '删除确认',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' },
    );
  } catch {
    return; // 用户取消
  }
  try {
    await deleteMonitoringPoint(row.id);
    toastOk('已删除');
    await load();
  } catch (err) {
    toastErr(err, '删除失败：');
  }
}

onMounted(load);
useDomainAutoRefresh('hazard.point', load);
</script>

<template>
  <div>
    <MgmtPageHead title="监测点位管理" crumb="设备管理 / 监测点位管理" :icon="Aim" icon-tone="blue">
      <template #actions>
        <el-button :loading="loading" @click="load">刷新</el-button>
        <el-button v-permission="'hazard:point-write'" type="primary" @click="openCreate">
          新增
        </el-button>
      </template>
    </MgmtPageHead>

    <MgmtProTable :data="rows">
      <el-table-column prop="id" label="编号" min-width="120" />
      <el-table-column prop="name" label="名称" min-width="160">
        <template #default="{ row }">{{ row.name || '—' }}</template>
      </el-table-column>
      <el-table-column prop="category" label="类型" min-width="140">
        <template #default="{ row }">{{ row.category || '—' }}</template>
      </el-table-column>
      <el-table-column prop="org" label="责任单位" min-width="160">
        <template #default="{ row }">{{ row.org || '—' }}</template>
      </el-table-column>
      <el-table-column prop="status" label="状态" min-width="100">
        <template #default="{ row }">{{ row.status || '—' }}</template>
      </el-table-column>
      <el-table-column prop="lastTime" label="最近更新" min-width="160">
        <template #default="{ row }">{{ row.lastTime || '—' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button
            v-permission="'hazard:point-write'"
            link
            type="primary"
            @click="openEdit(row as MonitoringPoint)"
          >
            编辑
          </el-button>
          <el-button
            v-permission="'hazard:point-write'"
            link
            type="danger"
            @click="onDelete(row as MonitoringPoint)"
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
      title="监测点位"
      @save="onSave"
    />
  </div>
</template>
