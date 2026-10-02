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
  createRescueVehicle,
  deleteRescueVehicle,
  fetchRescueVehicles,
  updateRescueVehicle,
  VEHICLE_STATUS_OPTIONS,
} from '@/services/rescueResource';
import type { RescueVehicleItem, RescueVehicleWriteRequest } from '@/services/rescueResource';

// 应急车辆（/emergency-vehicle）：接后端 /rescue-resources/vehicles。
// 全量 CRUD：POST 新增、PUT 编辑（局部更新）、DELETE 删除；写操作受 rescue:vehicle:write
// 权限码控制（V93 已登记）。台账只维护车辆本体——乘员 / 随车装备 / 耗材 / 出动汇总分属子表，
// 由详情端点聚合，一次保存不改写子表行（避免误删）。

const rows = ref<RescueVehicleItem[]>([]);
const loading = ref(false);

const dialogVisible = ref(false);
const editRow = ref<Record<string, unknown> | null>(null);

const FIELDS: FieldDef[] = [
  { prop: 'plate', label: '车牌号', type: 'input', required: true, placeholder: '如 粤K12345' },
  { prop: 'type', label: '车辆类型', type: 'input', required: true, placeholder: '如 泡沫消防车' },
  {
    prop: 'squadron',
    label: '所属中队',
    type: 'input',
    required: true,
    placeholder: '如 炼油中队',
  },
  {
    prop: 'status',
    label: '车辆状态',
    type: 'select',
    required: true,
    options: VEHICLE_STATUS_OPTIONS,
  },
  { prop: 'leaderName', label: '车长姓名', type: 'input', required: true },
  { prop: 'leaderPhone', label: '车长电话', type: 'input', required: true },
  { prop: 'businessName', label: '所属单位', type: 'input', required: true },
  { prop: 'vehicleTypeFull', label: '类型全称', type: 'input', required: true },
  { prop: 'parkingLocation', label: '停放位置', type: 'input' },
  { prop: 'chassisModel', label: '底盘型号', type: 'input' },
  { prop: 'manufactureDate', label: '出厂日期', type: 'input', placeholder: '如 2023-05-18' },
  { prop: 'inspectionExpiry', label: '年检到期', type: 'input', placeholder: '如 2026-05-18' },
  { prop: 'inspectionStatus', label: '年检状态', type: 'input', placeholder: '如 合格' },
  { prop: 'foamTankVolume', label: '泡沫罐容积', type: 'input', placeholder: '如 3.5 立方米' },
  { prop: 'waterTankVolume', label: '水罐容积', type: 'input', placeholder: '如 12 立方米' },
  { prop: 'maxWaterFlow', label: '最大出水流量', type: 'input', placeholder: '如 80 L/s' },
  { prop: 'foamType', label: '泡沫类型', type: 'input', placeholder: '如 抗溶性泡沫' },
  { prop: 'lastMaintenanceDate', label: '上次保养', type: 'input', placeholder: '如 2026-08-01' },
  { prop: 'nextMaintenanceDate', label: '下次保养', type: 'input', placeholder: '如 2026-11-01' },
  { prop: 'totalMileage', label: '总里程', type: 'input', placeholder: '如 38000 公里' },
  { prop: 'faultRecord', label: '故障记录', type: 'textarea' },
];

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetchRescueVehicles();
    rows.value = Array.isArray(res?.items) ? res.items : [];
  } catch (err) {
    toastErr(err, '加载应急车辆失败：');
    rows.value = [];
  } finally {
    loading.value = false;
  }
}

function openCreate(): void {
  editRow.value = null;
  dialogVisible.value = true;
}

function openEdit(row: RescueVehicleItem): void {
  // 只取车辆本体字段：子集合（乘员/随车装备/耗材/出动汇总）不进表单，避免保存时被回传
  editRow.value = {
    id: row.id,
    plate: row.plate,
    type: row.type,
    squadron: row.squadron,
    status: row.status,
    leaderName: row.leaderName,
    leaderPhone: row.leaderPhone,
    businessName: row.businessName,
    vehicleTypeFull: row.vehicleTypeFull,
    parkingLocation: row.parkingLocation,
    chassisModel: row.chassisModel,
    manufactureDate: row.manufactureDate,
    inspectionExpiry: row.inspectionExpiry,
    inspectionStatus: row.inspectionStatus,
    foamTankVolume: row.foamTankVolume,
    waterTankVolume: row.waterTankVolume,
    maxWaterFlow: row.maxWaterFlow,
    foamType: row.foamType,
    lastMaintenanceDate: row.lastMaintenanceDate,
    nextMaintenanceDate: row.nextMaintenanceDate,
    totalMileage: row.totalMileage,
    faultRecord: row.faultRecord,
  } as unknown as Record<string, unknown>;
  dialogVisible.value = true;
}

async function onSave(payload: Record<string, unknown>, id: number | null): Promise<void> {
  try {
    const body = payload as RescueVehicleWriteRequest;
    if (id == null) {
      await createRescueVehicle(body);
      toastOk('车辆已新增');
    } else {
      await updateRescueVehicle(id, body);
      toastOk('已保存');
    }
    dialogVisible.value = false;
    await load();
  } catch (err) {
    toastErr(err, id == null ? '新增失败：' : '保存失败：');
  }
}

async function onDelete(row: RescueVehicleItem): Promise<void> {
  if (row.id == null) return;
  try {
    await ElMessageBox.confirm(
      `确认删除车辆「${row.plate || String(row.id)}」？删除后不可恢复。`,
      '删除确认',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' },
    );
  } catch {
    return; // 用户取消
  }
  try {
    await deleteRescueVehicle(row.id);
    ElMessage.success('已删除');
    await load();
  } catch (err) {
    toastErr(err, '删除失败：');
  }
}

onMounted(load);

// 三端实时刷新：任一端改动车辆台账，本列表自动重拉
useDomainAutoRefresh('rescue.vehicle', load, { immediate: false });
</script>

<template>
  <div>
    <MgmtPageHead title="应急车辆" crumb="应急及演练管理 / 应急车辆" :icon="Van" icon-tone="blue">
      <template #actions>
        <el-button :loading="loading" @click="load">刷新</el-button>
        <el-button v-permission="'rescue:vehicle:write'" type="primary" @click="openCreate">
          新增车辆
        </el-button>
      </template>
    </MgmtPageHead>

    <MgmtProTable :data="rows">
      <el-table-column prop="plate" label="车牌" min-width="130">
        <template #default="{ row }">{{ row.plate || '—' }}</template>
      </el-table-column>
      <el-table-column prop="type" label="类型" min-width="140">
        <template #default="{ row }">{{ row.type || '—' }}</template>
      </el-table-column>
      <el-table-column prop="squadron" label="中队" min-width="140">
        <template #default="{ row }">{{ row.squadron || '—' }}</template>
      </el-table-column>
      <el-table-column prop="leaderName" label="车组长" min-width="110">
        <template #default="{ row }">{{ row.leaderName || '—' }}</template>
      </el-table-column>
      <el-table-column prop="status" label="状态" min-width="110">
        <template #default="{ row }">{{ row.status || '—' }}</template>
      </el-table-column>
      <el-table-column prop="businessName" label="所属单位" min-width="170">
        <template #default="{ row }">{{ row.businessName || '—' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button
            v-permission="'rescue:vehicle:write'"
            link
            type="primary"
            @click="openEdit(row as RescueVehicleItem)"
          >
            编辑
          </el-button>
          <el-button
            v-permission="'rescue:vehicle:write'"
            link
            type="danger"
            @click="onDelete(row as RescueVehicleItem)"
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
      title="应急车辆"
      @save="onSave"
    />
  </div>
</template>
