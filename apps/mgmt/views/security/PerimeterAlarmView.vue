<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Warning } from '@element-plus/icons-vue';
import { useDomainAutoRefresh } from '@/composables/useDomainAutoRefresh';
import MgmtProTable from '../../components/MgmtProTable.vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import MgmtRecordEditDialog, { type FieldDef } from '../../components/MgmtRecordEditDialog.vue';
import { toastErr, toastOk } from '../../utils/feedback';
import {
  createPerimeterAlarm,
  deletePerimeterAlarm,
  fetchPerimeterAlarms,
  updatePerimeterAlarm,
  type PerimeterAlarmCreatePayload,
  type PerimeterAlarmDetail,
  type PerimeterAlarmUpdatePayload,
} from '@/services/security';

// 周界入侵告警管理（/perimeter-alarm-mgmt）：接后端 /security/perimeter-alarms。
// 全量 CRUD：POST 新增、PUT 处置写回（确认/派单/误报/处置情况）、DELETE 删除；
// 写操作分别受 security:perimeter-create / security:perimeter-ack / security:perimeter-delete 权限码控制。
// 写成功后后端广播 security.perimeter-alarm，管理端 / 大屏订阅方自动重拉。
const rows = ref<PerimeterAlarmDetail[]>([]);
const loading = ref(false);
const dialogVisible = ref(false);
const editRow = ref<Record<string, unknown> | null>(null);
// 'create' = 新增告警；'handle' = 处置/派单写回（局部更新）
const dialogMode = ref<'create' | 'handle'>('create');

const STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: '未确认', value: '未确认' },
  { label: '已确认', value: '已确认' },
  { label: '已派单', value: '已派单' },
  { label: '已处理', value: '已处理' },
];
const FALSE_ALARM_OPTIONS: { label: string; value: string }[] = [
  { label: '未核实', value: '未核实' },
  { label: '是', value: '是' },
  { label: '否', value: '否' },
];
const YES_NO_BOOL_OPTIONS: { label: string; value: boolean }[] = [
  { label: '是', value: true },
  { label: '否', value: false },
];

// 新增：title 必填，其余可选由后端填充默认
const CREATE_FIELDS: FieldDef[] = [
  {
    prop: 'title',
    label: '告警标题',
    type: 'input',
    required: true,
    placeholder: '如 南门未经授权翻越',
  },
  { prop: 'alarmType', label: '告警类型', type: 'input', placeholder: '周界入侵告警' },
  { prop: 'levelCode', label: '告警等级', type: 'input', placeholder: '如 一级' },
  { prop: 'location', label: '告警位置', type: 'input', placeholder: '如 厂区南门西侧' },
  {
    prop: 'alarmTime',
    label: '发生时间',
    type: 'date',
    dateType: 'datetime',
    valueFormat: 'YYYY-MM-DD HH:mm:ss',
  },
  { prop: 'description', label: '告警说明', type: 'textarea' },
  { prop: 'objectName', label: '入侵对象', type: 'input' },
  { prop: 'objectType', label: '对象类型', type: 'input', placeholder: '人员/车辆' },
  { prop: 'intrusionPosition', label: '入侵位置', type: 'input' },
  { prop: 'intrusionMethod', label: '入侵方式', type: 'input' },
  { prop: 'relatedCamera', label: '关联摄像机', type: 'input' },
  { prop: 'deviceId', label: '设备编号', type: 'input' },
];

// 处置：状态流转 + 误报标记 + 处置情况/时间/派单人员/通知方式（均可选，局部更新）
const HANDLE_FIELDS: FieldDef[] = [
  { prop: 'status', label: '处置状态', type: 'select', required: true, options: STATUS_OPTIONS },
  { prop: 'falseAlarm', label: '是否误报', type: 'select', options: FALSE_ALARM_OPTIONS },
  {
    prop: 'dispatchPersonnel',
    label: '派单人员',
    type: 'input',
    placeholder: '多个以英文逗号分隔',
  },
  { prop: 'handleResult', label: '处置情况', type: 'textarea' },
  {
    prop: 'handleTime',
    label: '处置时间',
    type: 'date',
    dateType: 'datetime',
    valueFormat: 'YYYY-MM-DD HH:mm:ss',
  },
  { prop: 'notifyApp', label: 'APP 通知', type: 'select', options: YES_NO_BOOL_OPTIONS },
  { prop: 'notifySms', label: '短信通知', type: 'select', options: YES_NO_BOOL_OPTIONS },
];

const FIELDS = computed<FieldDef[]>(() =>
  dialogMode.value === 'create' ? CREATE_FIELDS : HANDLE_FIELDS,
);

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetchPerimeterAlarms();
    rows.value = Array.isArray(res) ? res : [];
  } catch (err) {
    toastErr(err, '加载周界入侵告警失败：');
    rows.value = [];
  } finally {
    loading.value = false;
  }
}

function openCreate(): void {
  dialogMode.value = 'create';
  editRow.value = null;
  dialogVisible.value = true;
}

function openHandle(row: PerimeterAlarmDetail): void {
  if (row.id == null) return;
  dialogMode.value = 'handle';
  editRow.value = { ...row } as unknown as Record<string, unknown>;
  dialogVisible.value = true;
}

async function onSave(payload: Record<string, unknown>, id: number | null): Promise<void> {
  try {
    if (dialogMode.value === 'create') {
      const body = payload as unknown as PerimeterAlarmCreatePayload;
      await createPerimeterAlarm(body);
      toastOk('周界入侵告警已新增');
    } else {
      if (id == null) return;
      const body = payload as unknown as PerimeterAlarmUpdatePayload;
      await updatePerimeterAlarm(id, body);
      toastOk('处置信息已保存');
    }
    dialogVisible.value = false;
    await load();
  } catch (err) {
    toastErr(err, dialogMode.value === 'create' ? '新增失败：' : '保存失败：');
  }
}

async function onDelete(row: PerimeterAlarmDetail): Promise<void> {
  if (row.id == null) return;
  try {
    await ElMessageBox.confirm(
      `确认删除周界入侵告警「${row.title || String(row.id)}」？删除后不可恢复。`,
      '删除确认',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' },
    );
  } catch {
    return; // 用户取消
  }
  try {
    await deletePerimeterAlarm(Number(row.id));
    ElMessage.success('已删除');
    await load();
  } catch (err) {
    toastErr(err, '删除失败：');
  }
}

onMounted(load);

// 三端实时刷新：任一端改周界告警，本列表自动重拉
useDomainAutoRefresh('security.perimeter-alarm', load, { immediate: false });
</script>

<template>
  <div>
    <MgmtPageHead
      title="周界入侵告警管理"
      crumb="治安防恐管理 / 周界入侵告警管理"
      :icon="Warning"
      icon-tone="orange"
    >
      <template #actions>
        <el-button :loading="loading" @click="load">刷新</el-button>
        <el-button v-permission="'security:perimeter-create'" type="primary" @click="openCreate">
          新增告警
        </el-button>
      </template>
    </MgmtPageHead>

    <MgmtProTable :data="rows">
      <el-table-column prop="id" label="编号" min-width="90" />
      <el-table-column prop="alarmCode" label="告警编号" min-width="150">
        <template #default="{ row }">{{ (row as PerimeterAlarmDetail).alarmCode || '—' }}</template>
      </el-table-column>
      <el-table-column prop="title" label="标题" min-width="200">
        <template #default="{ row }">{{ (row as PerimeterAlarmDetail).title || '—' }}</template>
      </el-table-column>
      <el-table-column prop="alarmType" label="类型" min-width="120">
        <template #default="{ row }">{{ (row as PerimeterAlarmDetail).alarmType || '—' }}</template>
      </el-table-column>
      <el-table-column prop="level" label="等级" min-width="90">
        <template #default="{ row }">{{ (row as PerimeterAlarmDetail).level || '—' }}</template>
      </el-table-column>
      <el-table-column prop="status" label="处置状态" min-width="100">
        <template #default="{ row }">{{ (row as PerimeterAlarmDetail).status || '—' }}</template>
      </el-table-column>
      <el-table-column prop="falseAlarm" label="误报" min-width="80">
        <template #default="{ row }">{{
          (row as PerimeterAlarmDetail).falseAlarm || '—'
        }}</template>
      </el-table-column>
      <el-table-column prop="time" label="告警时间" min-width="170">
        <template #default="{ row }">{{ (row as PerimeterAlarmDetail).time || '—' }}</template>
      </el-table-column>
      <el-table-column prop="location" label="位置" min-width="160">
        <template #default="{ row }">{{ (row as PerimeterAlarmDetail).location || '—' }}</template>
      </el-table-column>
      <el-table-column prop="objectName" label="入侵对象" min-width="120">
        <template #default="{ row }">{{
          (row as PerimeterAlarmDetail).objectName || '—'
        }}</template>
      </el-table-column>
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button
            v-permission="'security:perimeter-ack'"
            link
            type="primary"
            @click="openHandle(row as PerimeterAlarmDetail)"
          >
            处置
          </el-button>
          <el-button
            v-permission="'security:perimeter-delete'"
            link
            type="danger"
            @click="onDelete(row as PerimeterAlarmDetail)"
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
      title="周界入侵告警"
      @save="onSave"
    />
  </div>
</template>
