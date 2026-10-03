<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElMessageBox } from 'element-plus';
import { Cpu } from '@element-plus/icons-vue';
import MgmtProTable from '../../components/MgmtProTable.vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import MgmtRecordEditDialog, { type FieldDef } from '../../components/MgmtRecordEditDialog.vue';
import { toastErr, toastOk } from '../../utils/feedback';
import {
  createDevice,
  deleteDevice,
  fetchDevicePage,
  updateDevice,
  type DeviceItem,
  type DeviceStatus,
  type DeviceWriteRequest,
} from '@/services/device';
import { useDomainAutoRefresh } from '@/composables/useDomainAutoRefresh';

// 装置/设备台账管理（/device-mgmt）：接后端 /devices 分页。
// 取代原 module-embed 原型 iframe 占位，数据全部来自后端；取数三态：加载中 / 空态 / 错误回落（不回灌假数据）。
// 写操作（POST/PUT/DELETE）受 device:write 权限码控制，成功后后端广播 device。

const rows = ref<DeviceItem[]>([]);
const loading = ref(false);
const page = ref(1);
const size = ref(20);
const total = ref(0);
const statusFilter = ref<DeviceStatus | ''>('');

const STATUS_TEXT: Record<DeviceStatus, string> = { 0: '离线', 1: '在线', 2: '告警' };
const TYPE_TEXT: Record<string, string> = {
  FIRE: '消防',
  GAS: '气体',
  FLOOD: '防汛',
  CCTV: '视频',
};

const dialogVisible = ref(false);
const editRow = ref<Record<string, unknown> | null>(null);
// 本域主键为 20 位 MDM 编码 deviceCode（非自增 id），MgmtRecordEditDialog 回传的 id 为数字故不可靠，
// 页面自行记录当前编辑键：为空表示新增。
const editKey = ref<string | null>(null);

// 设备类型枚举（与后端 device_type 同义），写表单据此下拉。
const DEVICE_TYPE_OPTIONS = Object.entries(TYPE_TEXT).map(([value, label]) => ({ value, label }));

const FIELDS: FieldDef[] = [
  {
    prop: 'deviceCode',
    label: '设备编码',
    type: 'input',
    required: true,
    disabledOnEdit: true,
    placeholder: '20 位 MDM 设备编码',
  },
  { prop: 'deviceName', label: '设备名称', type: 'input', placeholder: '如 罐区A消防探头-F01' },
  { prop: 'deviceType', label: '设备类型', type: 'select', options: DEVICE_TYPE_OPTIONS },
  { prop: 'zone', label: '所属区域', type: 'input', placeholder: '如 罐区A' },
  { prop: 'status', label: '运行状态', type: 'number', placeholder: '0=离线 1=在线 2=告警' },
  { prop: 'lat', label: '纬度', type: 'number' },
  { prop: 'lon', label: '经度', type: 'number' },
];

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetchDevicePage({
      page: page.value,
      size: size.value,
      status: statusFilter.value === '' ? undefined : statusFilter.value,
    });
    rows.value = Array.isArray(res?.list) ? res.list : [];
    total.value = typeof res?.total === 'number' ? res.total : rows.value.length;
  } catch (err) {
    toastErr(err, '加载设备台账失败：');
    rows.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
}

function onPageChange(p: number) {
  page.value = p;
  load();
}
function onSizeChange(s: number) {
  size.value = s;
  page.value = 1;
  load();
}
function onStatusChange() {
  page.value = 1;
  load();
}

function openCreate(): void {
  editKey.value = null;
  editRow.value = null;
  dialogVisible.value = true;
}

function openEdit(row: DeviceItem): void {
  if (!row.deviceCode) return;
  editKey.value = row.deviceCode;
  editRow.value = { ...row } as unknown as Record<string, unknown>;
  dialogVisible.value = true;
}

// 第二个参数 id 由组件按数字主键回传，本域 deviceCode 是字符串，故忽略该参数改用 editKey 判定新增/更新。
async function onSave(payload: Record<string, unknown>, _id: number | null): Promise<void> {
  const key = editKey.value;
  try {
    const body = payload as DeviceWriteRequest;
    if (key == null) {
      await createDevice(body);
      toastOk('设备台账已新增');
    } else {
      await updateDevice(key, body);
      toastOk('已保存');
    }
    dialogVisible.value = false;
    await load();
  } catch (err) {
    toastErr(err, key == null ? '新增失败：' : '保存失败：');
  }
}

async function onDelete(row: DeviceItem): Promise<void> {
  const key = row.deviceCode;
  if (!key) return;
  try {
    await ElMessageBox.confirm(
      `确认删除设备「${row.deviceName || key}」？删除后不可恢复。`,
      '删除确认',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' },
    );
  } catch {
    return; // 用户取消
  }
  try {
    await deleteDevice(key);
    toastOk('已删除');
    await load();
  } catch (err) {
    toastErr(err, '删除失败：');
  }
}

onMounted(load);
useDomainAutoRefresh('device', load);
</script>

<template>
  <div>
    <MgmtPageHead title="设备台账管理" crumb="生产信息管理 / 装置管理" :icon="Cpu" icon-tone="blue">
      <template #actions>
        <el-select
          v-model="statusFilter"
          placeholder="全部状态"
          style="width: 120px"
          @change="onStatusChange"
        >
          <el-option label="全部状态" value="" />
          <el-option label="离线" :value="0" />
          <el-option label="在线" :value="1" />
          <el-option label="告警" :value="2" />
        </el-select>
        <el-button :loading="loading" @click="load">刷新</el-button>
        <el-button v-permission="'device:write'" type="primary" @click="openCreate">新增</el-button>
      </template>
    </MgmtPageHead>

    <MgmtProTable
      :data="rows"
      :total="total"
      :page="page"
      :page-size="size"
      @update:page="onPageChange"
      @update:page-size="onSizeChange"
    >
      <el-table-column prop="deviceCode" label="设备编码" min-width="200" />
      <el-table-column prop="deviceName" label="设备名称" min-width="160">
        <template #default="{ row }">{{ row.deviceName || '—' }}</template>
      </el-table-column>
      <el-table-column prop="deviceType" label="类型" min-width="100">
        <template #default="{ row }">{{
          TYPE_TEXT[row.deviceType] || row.deviceType || '—'
        }}</template>
      </el-table-column>
      <el-table-column prop="zone" label="所属区域" min-width="160">
        <template #default="{ row }">{{ row.zone || '—' }}</template>
      </el-table-column>
      <el-table-column prop="status" label="状态" min-width="100">
        <template #default="{ row }">
          <span :class="['tone', `tone-${row.status}`]">{{
            STATUS_TEXT[row.status as DeviceStatus] || '—'
          }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="longitude" label="经度" min-width="120">
        <template #default="{ row }">{{ row.lat ?? '—' }}</template>
      </el-table-column>
      <el-table-column prop="latitude" label="纬度" min-width="120">
        <template #default="{ row }">{{ row.lon ?? '—' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button
            v-permission="'device:write'"
            link
            type="primary"
            @click="openEdit(row as DeviceItem)"
          >
            编辑
          </el-button>
          <el-button
            v-permission="'device:write'"
            link
            type="danger"
            @click="onDelete(row as DeviceItem)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </MgmtProTable>

    <el-empty v-if="!loading && !rows.length" description="暂无设备台账数据" />

    <MgmtRecordEditDialog
      v-model="dialogVisible"
      :edit-row="editRow"
      :fields="FIELDS"
      title="设备台账"
      @save="onSave"
    />
  </div>
</template>

<style scoped>
.tone {
  font-weight: 600;
}

.tone-1 {
  color: #16a34a;
}

.tone-2 {
  color: #dc2626;
}

.tone-0 {
  color: #9ca3af;
}
</style>
