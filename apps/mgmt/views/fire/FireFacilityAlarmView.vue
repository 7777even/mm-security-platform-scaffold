<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Bell } from '@element-plus/icons-vue';
import { useDomainAutoRefresh } from '@/composables/useDomainAutoRefresh';
import MgmtProTable from '../../components/MgmtProTable.vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import FireFacilityAlarmHandleDialog from '../../components/FireFacilityAlarmHandleDialog.vue';
import type { AlarmHandleAction } from '../../components/FireFacilityAlarmHandleDialog.vue';
import { toastErr } from '../../utils/feedback';
import {
  fetchFireFacilityAlarms,
  FIRE_FAULT_LEVEL_OPTIONS,
  FIRE_FAULT_STATUS_OPTIONS,
  type FireFacilityAlarmItem,
} from '@/services/fireFacility';

// 消防设施报警（/facility-alarm）：改读与大屏同源的 /fire-facility/alarms（由 fac_fire_facility_fault 派生），
// 替代原先错接的 /fire-alarms（fac_fire_alarm 报警单），使「设施报警」概念在管理端与大屏共用同一权威源。
// 报警为派生命名视图，无独立写端点/表；处置在「消防故障」台账完成（fire-facility.fault 广播后本页自动重拉）。
const rows = ref<FireFacilityAlarmItem[]>([]);
const loading = ref(false);
const level = ref('');
const status = ref('');

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetchFireFacilityAlarms(level.value || null, status.value || null);
    rows.value = Array.isArray(res?.items) ? res.items : [];
  } catch (err) {
    toastErr(err, '加载消防设施报警失败：');
    rows.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(load);

// 三端实时刷新：消防故障写回（fire-facility.fault 广播）后，报警派生视图自动重拉
useDomainAutoRefresh('fire-facility.fault', load, { immediate: false });

// 报警处置：复用故障处置能力（权限 fire-facility:handle），状态机 待确认→已确认→已派单→维修中→待验收→已闭环
const ACTION_PREDECESSOR: Record<AlarmHandleAction, string> = {
  confirm: '待确认',
  dispatch: '已确认',
  repair: '已派单',
  accept: '维修中',
  close: '待验收',
};
const dialogVisible = ref(false);
const activeAction = ref<AlarmHandleAction>('confirm');
const activeAlarm = ref<FireFacilityAlarmItem | null>(null);

function canHandle(row: FireFacilityAlarmItem, action: AlarmHandleAction): boolean {
  return (row.status ?? '') === ACTION_PREDECESSOR[action];
}
function openHandle(row: FireFacilityAlarmItem, action: AlarmHandleAction): void {
  activeAlarm.value = row;
  activeAction.value = action;
  dialogVisible.value = true;
}
function onSaved(): void {
  // fire-facility.fault 广播已触发 load() 重拉；此处兜底再拉一次，保证即时刷新。
  void load();
}
</script>

<template>
  <div>
    <MgmtPageHead
      title="消防设施报警"
      crumb="消防设施管理 / 报警记录"
      :icon="Bell"
      icon-tone="blue"
    >
      <template #actions>
        <el-select v-model="level" placeholder="全部级别" clearable style="width: 140px">
          <el-option
            v-for="o in FIRE_FAULT_LEVEL_OPTIONS"
            :key="o.value"
            :label="o.label"
            :value="o.value"
          />
        </el-select>
        <el-select v-model="status" placeholder="全部状态" clearable style="width: 140px">
          <el-option
            v-for="o in FIRE_FAULT_STATUS_OPTIONS"
            :key="o.value"
            :label="o.label"
            :value="o.value"
          />
        </el-select>
        <el-button :loading="loading" @click="load">刷新</el-button>
      </template>
    </MgmtPageHead>

    <MgmtProTable :data="rows">
      <el-table-column prop="id" label="编号" min-width="90" />
      <el-table-column prop="faultCode" label="故障编号" min-width="150">
        <template #default="{ row }">{{
          (row as FireFacilityAlarmItem).faultCode || '—'
        }}</template>
      </el-table-column>
      <el-table-column prop="facilityType" label="设施类型" min-width="120">
        <template #default="{ row }">{{
          (row as FireFacilityAlarmItem).facilityType || '—'
        }}</template>
      </el-table-column>
      <el-table-column prop="category" label="报警类别" min-width="120">
        <template #default="{ row }">{{ (row as FireFacilityAlarmItem).category || '—' }}</template>
      </el-table-column>
      <el-table-column prop="level" label="级别" min-width="100">
        <template #default="{ row }">{{ (row as FireFacilityAlarmItem).level || '—' }}</template>
      </el-table-column>
      <el-table-column prop="status" label="状态" min-width="100">
        <template #default="{ row }">{{ (row as FireFacilityAlarmItem).status || '—' }}</template>
      </el-table-column>
      <el-table-column prop="content" label="内容" min-width="240">
        <template #default="{ row }">{{ (row as FireFacilityAlarmItem).content || '—' }}</template>
      </el-table-column>
      <el-table-column prop="source" label="来源" min-width="160">
        <template #default="{ row }">{{ (row as FireFacilityAlarmItem).source || '—' }}</template>
      </el-table-column>
      <el-table-column prop="time" label="时间" min-width="170">
        <template #default="{ row }">{{ (row as FireFacilityAlarmItem).time || '—' }}</template>
      </el-table-column>
      <el-table-column v-permission="'fire-facility:handle'" label="处置" min-width="320">
        <template #default="{ row }">
          <el-button
            link
            type="primary"
            :disabled="!canHandle(row as FireFacilityAlarmItem, 'confirm')"
            @click="openHandle(row as FireFacilityAlarmItem, 'confirm')"
            >确认</el-button
          >
          <el-button
            link
            type="primary"
            :disabled="!canHandle(row as FireFacilityAlarmItem, 'dispatch')"
            @click="openHandle(row as FireFacilityAlarmItem, 'dispatch')"
            >派单</el-button
          >
          <el-button
            link
            type="primary"
            :disabled="!canHandle(row as FireFacilityAlarmItem, 'repair')"
            @click="openHandle(row as FireFacilityAlarmItem, 'repair')"
            >维修</el-button
          >
          <el-button
            link
            type="warning"
            :disabled="!canHandle(row as FireFacilityAlarmItem, 'accept')"
            @click="openHandle(row as FireFacilityAlarmItem, 'accept')"
            >验收</el-button
          >
          <el-button
            link
            type="success"
            :disabled="!canHandle(row as FireFacilityAlarmItem, 'close')"
            @click="openHandle(row as FireFacilityAlarmItem, 'close')"
            >闭环</el-button
          >
        </template>
      </el-table-column>
    </MgmtProTable>

    <FireFacilityAlarmHandleDialog
      v-model="dialogVisible"
      :alarm="activeAlarm"
      :action="activeAction"
      @saved="onSaved"
    />
  </div>
</template>
