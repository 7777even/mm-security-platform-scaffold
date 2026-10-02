<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { UserFilled } from '@element-plus/icons-vue';
import { useDomainAutoRefresh } from '@/composables/useDomainAutoRefresh';
import MgmtProTable from '../../components/MgmtProTable.vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import MgmtRecordEditDialog, { type FieldDef } from '../../components/MgmtRecordEditDialog.vue';
import { toastErr, toastOk } from '../../utils/feedback';
import {
  createRescueBrigade,
  deleteRescueBrigade,
  fetchFireBrigades,
  updateRescueBrigade,
} from '@/services/rescueResource';
import type { FireBrigadeTeam, RescueBrigadeWriteRequest } from '@/services/rescueResource';

// 应急队伍（/emergency-team）：接后端 /rescue-resources/brigades。
// 全量 CRUD：POST 新增、PUT 编辑（局部更新）、DELETE 删除；写操作受 rescue:brigade:write
// 权限码控制（V93 已登记）。经纬度可选——缺省时大屏地图不落点，前端按 null 跳过飞入。

const rows = ref<FireBrigadeTeam[]>([]);
const loading = ref(false);

const dialogVisible = ref(false);
const editRow = ref<Record<string, unknown> | null>(null);

const FIELDS: FieldDef[] = [
  { prop: 'name', label: '队伍名称', type: 'input', required: true, placeholder: '如 化工特勤队' },
  { prop: 'area', label: '所属区域', type: 'input', required: true, placeholder: '如 化工区' },
  { prop: 'memberCount', label: '编制人数', type: 'number' },
  { prop: 'leaderName', label: '队长', type: 'input', required: true },
  { prop: 'leaderPhone', label: '队长电话', type: 'input', required: true },
  { prop: 'location', label: '驻防位置', type: 'input' },
  { prop: 'longitude', label: '经度', type: 'number' },
  { prop: 'latitude', label: '纬度', type: 'number' },
  { prop: 'rescuePersonnel', label: '可投入人数', type: 'number' },
  { prop: 'rescueVehicles', label: '可投入车辆', type: 'number' },
  { prop: 'description', label: '队伍简介', type: 'textarea' },
];

function asItem(row: unknown): FireBrigadeTeam {
  return row as FireBrigadeTeam;
}

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetchFireBrigades();
    rows.value = Array.isArray(res?.items) ? res.items : [];
  } catch (err) {
    toastErr(err, '加载应急队伍失败：');
    rows.value = [];
  } finally {
    loading.value = false;
  }
}

function openCreate(): void {
  editRow.value = null;
  dialogVisible.value = true;
}

function openEdit(row: FireBrigadeTeam): void {
  editRow.value = { ...row } as unknown as Record<string, unknown>;
  dialogVisible.value = true;
}

async function onSave(payload: Record<string, unknown>, id: number | null): Promise<void> {
  try {
    const body = payload as RescueBrigadeWriteRequest;
    if (id == null) {
      await createRescueBrigade(body);
      toastOk('队伍已新增');
    } else {
      await updateRescueBrigade(id, body);
      toastOk('已保存');
    }
    dialogVisible.value = false;
    await load();
  } catch (err) {
    toastErr(err, id == null ? '新增失败：' : '保存失败：');
  }
}

async function onDelete(row: FireBrigadeTeam): Promise<void> {
  if (row.id == null) return;
  try {
    await ElMessageBox.confirm(
      `确认删除队伍「${row.name || String(row.id)}」？删除后不可恢复。`,
      '删除确认',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' },
    );
  } catch {
    return; // 用户取消
  }
  try {
    await deleteRescueBrigade(row.id);
    ElMessage.success('已删除');
    await load();
  } catch (err) {
    toastErr(err, '删除失败：');
  }
}

onMounted(load);

// 三端实时刷新：任一端改动队伍台账，本列表自动重拉
useDomainAutoRefresh('rescue.brigade', load, { immediate: false });
</script>

<template>
  <div>
    <MgmtPageHead
      title="应急队伍"
      crumb="应急及演练管理 / 应急队伍"
      :icon="UserFilled"
      icon-tone="blue"
    >
      <template #actions>
        <el-button :loading="loading" @click="load">刷新</el-button>
        <el-button v-permission="'rescue:brigade:write'" type="primary" @click="openCreate">
          新增队伍
        </el-button>
      </template>
    </MgmtPageHead>

    <MgmtProTable :data="rows">
      <el-table-column prop="name" label="队伍名称" min-width="180">
        <template #default="{ row }">{{ row.name || '—' }}</template>
      </el-table-column>
      <el-table-column prop="area" label="区域" min-width="120">
        <template #default="{ row }">{{ row.area || '—' }}</template>
      </el-table-column>
      <el-table-column prop="memberCount" label="编制人数" width="110" align="center">
        <template #default="{ row }">{{ asItem(row).memberCount ?? '—' }}</template>
      </el-table-column>
      <el-table-column prop="leaderName" label="队长" min-width="110">
        <template #default="{ row }">{{ row.leaderName || '—' }}</template>
      </el-table-column>
      <el-table-column prop="location" label="驻防位置" min-width="170">
        <template #default="{ row }">{{ row.location || '—' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button
            v-permission="'rescue:brigade:write'"
            link
            type="primary"
            @click="openEdit(row as FireBrigadeTeam)"
          >
            编辑
          </el-button>
          <el-button
            v-permission="'rescue:brigade:write'"
            link
            type="danger"
            @click="onDelete(row as FireBrigadeTeam)"
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
      title="应急队伍"
      @save="onSave"
    />
  </div>
</template>
