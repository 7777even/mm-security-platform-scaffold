<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Bell } from '@element-plus/icons-vue';
import MgmtProTable from '../../components/MgmtProTable.vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import { toastErr } from '../../utils/feedback';
import { fetchFireAlarmPage, type FireAlarmItem } from '@/services/alarm';

// 消防报警单源化：改读与大屏同源的 /fire-alarms（fac_fire_alarm），
// 使「消防报警」概念在管理端与大屏共用同一权威源、数字一致（16 条 / 已闭环 3）。
// 注：/fire-alarms 仅支持分页、不支持 level/status 过滤，故在管理端做客户端过滤。
const rows = ref<FireAlarmItem[]>([]);
const loading = ref(false);
const level = ref('');
const status = ref('');

const STATUS_LABEL: Record<string, string> = { ACTIVE: '进行中', CLOSED: '已闭环' };

const visibleRows = computed(() =>
  rows.value.filter((r) => {
    if (level.value && r.level !== level.value) return false;
    if (status.value && r.status !== status.value) return false;
    return true;
  }),
);

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetchFireAlarmPage(1, 1000);
    rows.value = Array.isArray(res?.list) ? res.list : [];
  } catch (err) {
    toastErr(err, '加载消防报警失败：');
    rows.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div>
    <MgmtPageHead title="消防报警" crumb="消防报警 / 报警记录" :icon="Bell" icon-tone="blue">
      <template #actions>
        <el-select v-model="level" placeholder="全部级别" clearable style="width: 140px">
          <el-option label="高报" value="高报" />
          <el-option label="高高报" value="高高报" />
          <el-option label="无阈值" value="-" />
        </el-select>
        <el-select v-model="status" placeholder="全部状态" clearable style="width: 140px">
          <el-option label="进行中" value="ACTIVE" />
          <el-option label="已闭环" value="CLOSED" />
        </el-select>
        <el-button :loading="loading" @click="load">刷新</el-button>
      </template>
    </MgmtPageHead>

    <MgmtProTable :data="visibleRows">
      <el-table-column prop="alarmId" label="告警编号" min-width="140" />
      <el-table-column prop="time" label="时间" min-width="160">
        <template #default="{ row }">{{ row.time || '—' }}</template>
      </el-table-column>
      <el-table-column prop="typeLabel" label="告警类型" min-width="140">
        <template #default="{ row }">{{ row.typeLabel || '—' }}</template>
      </el-table-column>
      <el-table-column prop="level" label="级别" min-width="100">
        <template #default="{ row }">{{ row.level || '—' }}</template>
      </el-table-column>
      <el-table-column prop="status" label="状态" min-width="100">
        <template #default="{ row }">{{ STATUS_LABEL[row.status] || row.status || '—' }}</template>
      </el-table-column>
      <el-table-column prop="description" label="描述" min-width="220">
        <template #default="{ row }">{{ row.description || '—' }}</template>
      </el-table-column>
      <el-table-column prop="source" label="来源" min-width="160">
        <template #default="{ row }">{{ row.source || '—' }}</template>
      </el-table-column>
    </MgmtProTable>
  </div>
</template>
