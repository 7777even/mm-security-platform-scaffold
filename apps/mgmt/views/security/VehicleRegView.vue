<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Van } from '@element-plus/icons-vue';
import { useDomainAutoRefresh } from '@/composables/useDomainAutoRefresh';
import MgmtProTable from '../../components/MgmtProTable.vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import MgmtRecordEditDialog, { type FieldDef } from '../../components/MgmtRecordEditDialog.vue';
import { toastErr, toastOk } from '../../utils/feedback';
import {
  createVehicleSearch,
  deleteVehicleSearch,
  fetchVehicleSearch,
  updateVehicleSearch,
  type VehicleSearchWriteRequest,
} from '@/services/security';
import type { VehicleSearchResult } from '@/services/map-data/securitySearchMock';

// 车辆备案管理（/vehicle-registration）：接后端 /security/search/vehicle（关键字检索）。
// 全量 CRUD：POST 新增、PUT 编辑（局部更新）、DELETE 删除；写操作受 security:vehicle-write
// 权限码控制。写成功后后端广播 security.vehicle-search，管理端 / 大屏订阅方自动重拉。
const rows = ref<VehicleSearchResult[]>([]);
const loading = ref(false);
const keyword = ref('');

const dialogVisible = ref(false);
const editRow = ref<Record<string, unknown> | null>(null);

// 列表只返回检索摘要（车牌/卡口/状态/置信度/时间），编辑弹窗按同一契约的写请求字段展开完整备案信息。
const FIELDS: FieldDef[] = [
  { prop: 'plate', label: '车牌号', type: 'input', required: true, placeholder: '如 粤KA4543' },
  { prop: 'confidence', label: '识别置信度', type: 'number', placeholder: '0-100，识别失败可留空' },
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
    prop: 'time',
    label: '识别时间',
    type: 'date',
    dateType: 'datetime',
    valueFormat: 'YYYY-MM-DD HH:mm:ss',
    placeholder: '选择识别时间',
  },
  { prop: 'vehicleType', label: '车辆类型', type: 'input', placeholder: '如 危化品运输车' },
  { prop: 'driverName', label: '驾驶员姓名', type: 'input' },
  { prop: 'driverPhone', label: '驾驶员电话', type: 'input' },
  { prop: 'company', label: '所属单位', type: 'input', placeholder: '如 茂名顺达物流有限公司' },
  { prop: 'appointmentNo', label: '预约单号', type: 'input', placeholder: '如 YY202610030001' },
  { prop: 'appointmentTime', label: '预约时段', type: 'input', placeholder: '如 09:00 — 18:00' },
  { prop: 'visitPurpose', label: '来访事由', type: 'input', placeholder: '如 原料配送' },
  { prop: 'waybillNo', label: '运单号', type: 'input' },
  { prop: 'cargo', label: '承运货物', type: 'input', placeholder: '如 工业乙醇' },
  { prop: 'destination', label: '目的地', type: 'input', placeholder: '如 炼油一区装卸点' },
];

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetchVehicleSearch(keyword.value.trim() || undefined);
    rows.value = Array.isArray(res) ? res : [];
  } catch (err) {
    toastErr(err, '加载车辆备案失败：');
    rows.value = [];
  } finally {
    loading.value = false;
  }
}

function openCreate(): void {
  editRow.value = null;
  dialogVisible.value = true;
}

function openEdit(row: VehicleSearchResult): void {
  editRow.value = { ...row } as unknown as Record<string, unknown>;
  dialogVisible.value = true;
}

async function onSave(payload: Record<string, unknown>, id: number | null): Promise<void> {
  try {
    const body = payload as VehicleSearchWriteRequest;
    if (id == null) {
      await createVehicleSearch(body);
      toastOk('车辆备案已新增');
    } else {
      await updateVehicleSearch(id, body);
      toastOk('已保存');
    }
    dialogVisible.value = false;
    await load();
  } catch (err) {
    toastErr(err, id == null ? '新增失败：' : '保存失败：');
  }
}

async function onDelete(row: VehicleSearchResult): Promise<void> {
  if (row.id == null) return;
  try {
    await ElMessageBox.confirm(
      `确认删除车辆备案「${row.plate || String(row.id)}」？删除后不可恢复。`,
      '删除确认',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' },
    );
  } catch {
    return; // 用户取消
  }
  try {
    await deleteVehicleSearch(Number(row.id));
    ElMessage.success('已删除');
    await load();
  } catch (err) {
    toastErr(err, '删除失败：');
  }
}

onMounted(load);

// 三端实时刷新：任一端改动车辆备案，本列表自动重拉
useDomainAutoRefresh('security.vehicle-search', load, { immediate: false });
</script>

<template>
  <div>
    <MgmtPageHead
      title="车辆备案管理"
      crumb="治安防恐管理 / 车辆备案管理"
      :icon="Van"
      icon-tone="blue"
    >
      <template #actions>
        <el-input
          v-model="keyword"
          placeholder="搜索车牌"
          clearable
          style="width: 200px"
          @keyup.enter="load"
          @clear="load"
        />
        <el-button type="primary" @click="load">查询</el-button>
        <el-button :loading="loading" @click="load">刷新</el-button>
        <el-button v-permission="'security:vehicle-write'" type="primary" @click="openCreate">
          新增
        </el-button>
      </template>
    </MgmtPageHead>

    <MgmtProTable :data="rows">
      <el-table-column prop="id" label="编号" min-width="100" />
      <el-table-column prop="plate" label="车牌" min-width="160">
        <template #default="{ row }">{{ row.plate || '—' }}</template>
      </el-table-column>
      <el-table-column prop="gate" label="卡口" min-width="160">
        <template #default="{ row }">{{ row.gate || '—' }}</template>
      </el-table-column>
      <el-table-column prop="status" label="状态" min-width="100">
        <template #default="{ row }">{{ row.status || '—' }}</template>
      </el-table-column>
      <el-table-column prop="confidence" label="识别置信度" min-width="120">
        <template #default="{ row }">{{
          row.confidence != null ? row.confidence + '%' : '—'
        }}</template>
      </el-table-column>
      <el-table-column prop="time" label="时间" min-width="180">
        <template #default="{ row }">{{ row.time || '—' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button
            v-permission="'security:vehicle-write'"
            link
            type="primary"
            @click="openEdit(row as VehicleSearchResult)"
          >
            编辑
          </el-button>
          <el-button
            v-permission="'security:vehicle-write'"
            link
            type="danger"
            @click="onDelete(row as VehicleSearchResult)"
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
      title="车辆备案"
      @save="onSave"
    />
  </div>
</template>
