<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessageBox } from 'element-plus';
import { Bell, Message, Microphone, Phone, Promotion } from '@element-plus/icons-vue';
import MgmtProTable from '../../components/MgmtProTable.vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import MgmtRecordEditDialog, { type FieldDef } from '../../components/MgmtRecordEditDialog.vue';
import type { IconTileTone } from '../../components/MgmtIconTile.vue';
import { toastErr, toastOk } from '../../utils/feedback';
import {
  createCommunicationRecord,
  deleteCommunicationRecord,
  fetchCommunicationRecords,
  updateCommunicationRecord,
  type CommRecordWriteRequest,
  type CommunicationRecord,
  type CommunicationRecordType,
} from '@/services/communication';
import type { Component } from 'vue';
import { useDomainAutoRefresh } from '@/composables/useDomainAutoRefresh';

// 通讯通知管理（/comm-sms、/comm-call、/comm-broadcast、/comm-push、/comm-intercom）：
// 五页共用本视图，按 route.path 决定记录类型与列定义，数据统一来自后端 /communication/records。
// 解冻来源：docs/frozen-prototype.md（原为 module-embed iframe 占位）。
// 写操作（POST/PUT/DELETE）受 communication:record-write 权限码控制，成功后后端广播 communication.record。

interface Column {
  prop: keyof CommunicationRecord;
  label: string;
  width?: number;
  minWidth?: number;
}

interface ViewMeta {
  title: string;
  icon: Component;
  iconTone: IconTileTone;
  columns: Column[];
}

const VIEWS: Record<CommunicationRecordType, ViewMeta> = {
  sms: {
    title: '短信记录',
    icon: Message,
    iconTone: 'blue',
    columns: [
      { prop: 'recordNo', label: '记录编号', width: 130 },
      { prop: 'occurredAt', label: '发送时间', width: 170 },
      { prop: 'sender', label: '发送人', width: 120 },
      { prop: 'receiver', label: '接收号码', width: 160 },
      { prop: 'category', label: '短信类型', width: 130 },
      { prop: 'summary', label: '内容摘要', minWidth: 240 },
      { prop: 'result', label: '状态', width: 110 },
    ],
  },
  call: {
    title: '电话通话记录',
    icon: Phone,
    iconTone: 'cyan',
    columns: [
      { prop: 'recordNo', label: '记录编号', width: 130 },
      { prop: 'occurredAt', label: '通话时间', width: 170 },
      { prop: 'category', label: '通话类型', width: 130 },
      { prop: 'sender', label: '主叫方', width: 130 },
      { prop: 'receiver', label: '被叫方', width: 130 },
      { prop: 'duration', label: '通话时长', width: 120 },
      { prop: 'result', label: '通话结果', width: 120 },
    ],
  },
  broadcast: {
    title: '广播播报记录',
    icon: Bell,
    iconTone: 'orange',
    columns: [
      { prop: 'recordNo', label: '记录编号', width: 130 },
      { prop: 'occurredAt', label: '播报时间', width: 170 },
      { prop: 'category', label: '广播类型', width: 130 },
      { prop: 'contentType', label: '内容类型', width: 110 },
      { prop: 'receiver', label: '覆盖区域', width: 130 },
      { prop: 'channel', label: '关联设备', width: 130 },
      { prop: 'summary', label: '内容摘要', minWidth: 240 },
    ],
  },
  push: {
    title: 'APP推送记录',
    icon: Promotion,
    iconTone: 'purple',
    columns: [
      { prop: 'recordNo', label: '记录编号', width: 130 },
      { prop: 'occurredAt', label: '推送时间', width: 170 },
      { prop: 'summary', label: '推送标题', minWidth: 200 },
      { prop: 'category', label: '消息类型', width: 120 },
      { prop: 'channel', label: '业务类型', width: 130 },
      { prop: 'receiver', label: '推送对象', width: 130 },
    ],
  },
  intercom: {
    title: '语音对讲记录',
    icon: Microphone,
    iconTone: 'indigo',
    columns: [
      { prop: 'recordNo', label: '记录编号', width: 130 },
      { prop: 'occurredAt', label: '通话时间', width: 170 },
      { prop: 'sender', label: '发起人', width: 120 },
      { prop: 'receiver', label: '通话组', width: 140 },
      { prop: 'channel', label: '信道/频率', width: 130 },
      { prop: 'direction', label: '呼叫方向', width: 120 },
      { prop: 'duration', label: '时长', width: 110 },
    ],
  },
};

const route = useRoute();

// 具名键访问（无索引签名），避免 record 索引在 strict 下的取值歧义。
const meta = computed<ViewMeta>(() => {
  const path = route.path;
  if (path === '/comm-call') return VIEWS.call;
  if (path === '/comm-broadcast') return VIEWS.broadcast;
  if (path === '/comm-push') return VIEWS.push;
  if (path === '/comm-intercom') return VIEWS.intercom;
  return VIEWS.sms;
});

const recordType = computed<CommunicationRecordType>(() => {
  const path = route.path;
  if (path === '/comm-call') return 'call';
  if (path === '/comm-broadcast') return 'broadcast';
  if (path === '/comm-push') return 'push';
  if (path === '/comm-intercom') return 'intercom';
  return 'sms';
});

const rows = ref<CommunicationRecord[]>([]);
const loading = ref(false);
const dialogVisible = ref(false);
const editRow = ref<Record<string, unknown> | null>(null);
// 本域主键为字符串业务自然键 recordNo（非自增 id），MgmtRecordEditDialog 回传的 id 为数字故不可靠，
// 页面自行记录当前编辑键：为空表示新增。
const editKey = ref<string | null>(null);

// 记录类型与 VIEWS 键一致（后端枚举：sms/call/broadcast/push/intercom）。
const RECORD_TYPE_OPTIONS = [
  { label: '短信', value: 'sms' },
  { label: '电话通话', value: 'call' },
  { label: '广播播报', value: 'broadcast' },
  { label: 'APP推送', value: 'push' },
  { label: '语音对讲', value: 'intercom' },
];

const FIELDS: FieldDef[] = [
  {
    prop: 'recordNo',
    label: '记录编号',
    type: 'input',
    required: true,
    disabledOnEdit: true,
    placeholder: '如 SMS-091',
  },
  {
    prop: 'recordType',
    label: '记录类型',
    type: 'select',
    required: true,
    options: RECORD_TYPE_OPTIONS,
  },
  { prop: 'occurredAt', label: '发生时间', type: 'input', placeholder: '如 2026-08-21 09:03' },
  { prop: 'category', label: '业务分类', type: 'input', placeholder: '如 告警通知' },
  { prop: 'sender', label: '发起方', type: 'input' },
  { prop: 'receiver', label: '接收方', type: 'input' },
  { prop: 'summary', label: '内容摘要', type: 'textarea' },
  { prop: 'result', label: '状态/结果', type: 'input', placeholder: '如 成功 / 失败' },
  { prop: 'duration', label: '时长', type: 'input', placeholder: '如 00:42' },
  { prop: 'channel', label: '通道', type: 'input' },
  { prop: 'direction', label: '呼叫方向', type: 'input', placeholder: '如 呼入 / 外呼 / 组呼' },
  { prop: 'contentType', label: '内容类型', type: 'input', placeholder: '如 文本 / 语音' },
];

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetchCommunicationRecords(recordType.value);
    rows.value = Array.isArray(res?.items) ? res.items : [];
  } catch (err) {
    toastErr(err, '加载通讯记录失败：');
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

function openEdit(row: CommunicationRecord): void {
  if (!row.recordNo) return;
  editKey.value = row.recordNo;
  editRow.value = { ...row } as unknown as Record<string, unknown>;
  dialogVisible.value = true;
}

// 第二个参数 id 由组件按数字主键回传，本域 recordNo 是字符串，故忽略该参数改用 editKey 判定新增/更新。
async function onSave(payload: Record<string, unknown>, _id: number | null): Promise<void> {
  const key = editKey.value;
  try {
    const body = payload as CommRecordWriteRequest;
    if (key == null) {
      await createCommunicationRecord(body);
      toastOk('通讯记录已新增');
    } else {
      await updateCommunicationRecord(key, body);
      toastOk('已保存');
    }
    dialogVisible.value = false;
    await load();
  } catch (err) {
    toastErr(err, key == null ? '新增失败：' : '保存失败：');
  }
}

async function onDelete(row: CommunicationRecord): Promise<void> {
  const key = row.recordNo;
  if (!key) return;
  try {
    await ElMessageBox.confirm(
      `确认删除通讯记录「${row.summary || key}」？删除后不可恢复。`,
      '删除确认',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' },
    );
  } catch {
    return; // 用户取消
  }
  try {
    await deleteCommunicationRecord(key);
    toastOk('已删除');
    await load();
  } catch (err) {
    toastErr(err, '删除失败：');
  }
}

onMounted(load);
// 五页共用同一视图，统一订阅 communication.record：任意一端改写记录后五个记录页同源刷新。
useDomainAutoRefresh('communication.record', load);
</script>

<template>
  <div>
    <MgmtPageHead
      :title="meta.title"
      :crumb="`通讯通知管理 / ${meta.title}`"
      :icon="meta.icon"
      :icon-tone="meta.iconTone"
    >
      <template #actions>
        <el-button :loading="loading" @click="load()">刷新</el-button>
        <el-button v-permission="'communication:record-write'" type="primary" @click="openCreate">
          新增
        </el-button>
      </template>
    </MgmtPageHead>

    <MgmtProTable :data="rows">
      <el-table-column
        v-for="col in meta.columns"
        :key="col.prop"
        :prop="col.prop"
        :label="col.label"
        :width="col.width"
        :min-width="col.minWidth"
      >
        <template #default="{ row }">{{ row[col.prop] || '—' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button
            v-permission="'communication:record-write'"
            link
            type="primary"
            @click="openEdit(row as CommunicationRecord)"
          >
            编辑
          </el-button>
          <el-button
            v-permission="'communication:record-write'"
            link
            type="danger"
            @click="onDelete(row as CommunicationRecord)"
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
      :title="meta.title"
      @save="onSave"
    />
  </div>
</template>
