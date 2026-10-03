<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ChatDotRound } from '@element-plus/icons-vue';
import MgmtProTable from '../../components/MgmtProTable.vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import MgmtRecordEditDialog, { type FieldDef } from '../../components/MgmtRecordEditDialog.vue';
import { toastErr, toastOk } from '../../utils/feedback';
import { useDomainAutoRefresh } from '@/composables/useDomainAutoRefresh';
import {
  createCommunicationDevice,
  deleteCommunicationDevice,
  fetchCommunicationDevices,
  updateCommunicationDevice,
  type CommDeviceWriteRequest,
  type CommunicationDevice,
} from '@/services/communication';

// 无线对讲设备管理（/radio-management）：接后端 /communication/devices，取 intercom 分组设备展平。
// 全量 CRUD：POST 新增、PUT 编辑、DELETE 删除；写操作受 communication:device-write 权限码控制。
// 设备编码 deviceCode 为业务自然键（PUT/DELETE 的路径参数即列表行的 id），编辑时置灰不可改。
// 写成功后后端广播 communication.device，管理端 / 大屏订阅方自动重拉。
const rows = ref<CommunicationDevice[]>([]);
const loading = ref(false);
const dialogVisible = ref(false);
const editRow = ref<Record<string, unknown> | null>(null);

const FIELDS: FieldDef[] = [
  {
    prop: 'deviceCode',
    label: '设备编码',
    type: 'input',
    required: true,
    disabledOnEdit: true,
    placeholder: '如 IC-001',
  },
  {
    prop: 'deviceType',
    label: '设备类型',
    type: 'input',
    required: true,
    placeholder: '如 intercom',
  },
  {
    prop: 'deviceName',
    label: '设备名称',
    type: 'input',
    required: true,
    placeholder: '如 巡检对讲终端01',
  },
  { prop: 'groupKey', label: '分组键', type: 'input', placeholder: '如 intercom-1' },
  { prop: 'groupLabel', label: '分组名称', type: 'input', placeholder: '如 巡检对讲组' },
  { prop: 'areaName', label: '所属厂区', type: 'input', placeholder: '如 化工区' },
  { prop: 'locationName', label: '位置', type: 'input', placeholder: '如 化工装置区巡检点' },
  {
    prop: 'deviceStatus',
    label: '设备状态',
    type: 'input',
    placeholder: '如 online / offline / fault',
  },
  { prop: 'longitude', label: '经度', type: 'number' },
  { prop: 'latitude', label: '纬度', type: 'number' },
  { prop: 'categoryName', label: '设备型号', type: 'input', placeholder: '如 数字对讲终端' },
  { prop: 'installTime', label: '安装时间', type: 'input', placeholder: '如 2024-03-12' },
  { prop: 'ownerName', label: '责任部门', type: 'input', placeholder: '如 安全环保部' },
  { prop: 'ipAddress', label: 'IP地址', type: 'input', placeholder: '如 10.20.5.31' },
  { prop: 'lastCheckTime', label: '最近巡检时间', type: 'input', placeholder: '如 2024-03-12' },
];

// 列表行字段与写请求字段名不同名（id/name/type/detail.*），编辑前先做一次映射回填。
function toEditRow(row: CommunicationDevice): Record<string, unknown> {
  return {
    deviceCode: row.id ?? '',
    deviceType: row.type ?? '',
    deviceName: row.name ?? '',
    areaName: row.area ?? '',
    locationName: row.location ?? '',
    deviceStatus: row.status ?? '',
    longitude: row.longitude ?? null,
    latitude: row.latitude ?? null,
    categoryName: row.detail?.category ?? '',
    installTime: row.detail?.installTime ?? '',
    ownerName: row.detail?.owner ?? '',
    ipAddress: row.detail?.ip ?? '',
    lastCheckTime: row.detail?.lastCheck ?? '',
  };
}

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetchCommunicationDevices();
    const groups = Array.isArray(res?.intercom) ? res.intercom : [];
    rows.value = groups.flatMap((g) => (Array.isArray(g.devices) ? g.devices : []));
  } catch (err) {
    toastErr(err, '加载对讲设备失败：');
    rows.value = [];
  } finally {
    loading.value = false;
  }
}

function openCreate(): void {
  editRow.value = null;
  dialogVisible.value = true;
}

function openEdit(row: CommunicationDevice): void {
  if (!row.id) return;
  editRow.value = toEditRow(row);
  dialogVisible.value = true;
}

async function onSave(payload: Record<string, unknown>, id: number | null): Promise<void> {
  // 设备编码是字符串自然键：弹窗回传的 id 仅用于区分新增/编辑，路径参数取回填行的 deviceCode
  const deviceCode = String(editRow.value?.deviceCode ?? '');
  try {
    const body = payload as CommDeviceWriteRequest;
    if (id == null) {
      await createCommunicationDevice(body);
      toastOk('对讲设备台账已新增');
    } else {
      await updateCommunicationDevice(deviceCode, body);
      toastOk('已保存');
    }
    dialogVisible.value = false;
    await load();
  } catch (err) {
    toastErr(err, id == null ? '新增失败：' : '保存失败：');
  }
}

async function onDelete(row: CommunicationDevice): Promise<void> {
  if (!row.id) return;
  try {
    await ElMessageBox.confirm(
      `确认删除对讲设备「${row.name || row.id}」？删除后不可恢复。`,
      '删除确认',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' },
    );
  } catch {
    return; // 用户取消
  }
  try {
    await deleteCommunicationDevice(row.id);
    ElMessage.success('已删除');
    await load();
  } catch (err) {
    toastErr(err, '删除失败：');
  }
}

onMounted(load);
useDomainAutoRefresh('communication.device', load);
</script>

<template>
  <div>
    <MgmtPageHead
      title="无线对讲设备管理"
      crumb="设备管理 / 无线对讲设备管理"
      :icon="ChatDotRound"
      icon-tone="blue"
    >
      <template #actions>
        <el-button :loading="loading" @click="load">刷新</el-button>
        <el-button v-permission="'communication:device-write'" type="primary" @click="openCreate">
          新增
        </el-button>
      </template>
    </MgmtPageHead>

    <MgmtProTable :data="rows">
      <el-table-column prop="id" label="设备编号" min-width="140" />
      <el-table-column prop="name" label="设备名称" min-width="160">
        <template #default="{ row }">{{ row.name || '—' }}</template>
      </el-table-column>
      <el-table-column prop="type" label="类型" min-width="120">
        <template #default="{ row }">{{ row.type || '—' }}</template>
      </el-table-column>
      <el-table-column prop="area" label="所属厂区" min-width="140">
        <template #default="{ row }">{{ row.area || '—' }}</template>
      </el-table-column>
      <el-table-column prop="location" label="位置" min-width="160">
        <template #default="{ row }">{{ row.location || '—' }}</template>
      </el-table-column>
      <el-table-column prop="status" label="状态" min-width="100">
        <template #default="{ row }">{{ row.status || '—' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button
            v-permission="'communication:device-write'"
            link
            type="primary"
            @click="openEdit(row as CommunicationDevice)"
          >
            编辑
          </el-button>
          <el-button
            v-permission="'communication:device-write'"
            link
            type="danger"
            @click="onDelete(row as CommunicationDevice)"
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
      title="对讲设备台账"
      id-key="deviceCode"
      @save="onSave"
    />
  </div>
</template>
