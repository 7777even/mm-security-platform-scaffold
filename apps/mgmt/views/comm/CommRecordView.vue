<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { Bell, Message, Microphone, Phone, Promotion } from '@element-plus/icons-vue';
import MgmtProTable from '../../components/MgmtProTable.vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import type { IconTileTone } from '../../components/MgmtIconTile.vue';
import { toastErr } from '../../utils/feedback';
import { fetchCommunicationRecords } from '@/services/communication';
import type { CommunicationRecord, CommunicationRecordType } from '@/services/communication';
import type { Component } from 'vue';

// 通讯通知管理（/comm-sms、/comm-call、/comm-broadcast、/comm-push、/comm-intercom）：
// 五页共用本视图，按 route.path 决定记录类型与列定义，数据统一来自后端 /communication/records。
// 解冻来源：docs/frozen-prototype.md（原为 module-embed iframe 占位）。

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

onMounted(load);
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
    </MgmtProTable>
  </div>
</template>
