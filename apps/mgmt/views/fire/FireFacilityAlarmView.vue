<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Bell } from '@element-plus/icons-vue';
import MgmtProTable from '../../components/MgmtProTable.vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import { toastErr } from '../../utils/feedback';
import { fetchFireFacilityAlarms } from '@/services/fireFacility';
import type { FireFacilityAlarmItem } from '@/services/fireFacility';

// 消防设施运行监控（/monitor-* 系列）：接后端 /fire-facility/alarms。
// 后端报警端点仅支持 level/status 过滤（不支持按设施类型），故各 monitor 叶子共用本报警列表。
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
    <MgmtPageHead
      title="消防设施运行监控"
      crumb="消防设施管理 / 运行监控"
      :icon="Bell"
      icon-tone="blue"
    >
      <template #actions>
        <el-select
          v-model="level"
          placeholder="全部级别"
          clearable
          style="width: 140px"
          @change="load"
        >
          <el-option label="一级" value="一级" />
          <el-option label="二级" value="二级" />
          <el-option label="三级" value="三级" />
        </el-select>
        <el-select
          v-model="status"
          placeholder="全部状态"
          clearable
          style="width: 140px"
          @change="load"
        >
          <el-option label="未处置" value="未处置" />
          <el-option label="处置中" value="处置中" />
          <el-option label="已处置" value="已处置" />
        </el-select>
        <el-button :loading="loading" @click="load">刷新</el-button>
      </template>
    </MgmtPageHead>

    <MgmtProTable :data="rows">
      <el-table-column prop="id" label="告警编号" min-width="120" />
      <el-table-column prop="time" label="时间" min-width="160">
        <template #default="{ row }">{{ row.time || '—' }}</template>
      </el-table-column>
      <el-table-column prop="category" label="告警类型" min-width="140">
        <template #default="{ row }">{{ row.category || '—' }}</template>
      </el-table-column>
      <el-table-column prop="level" label="级别" min-width="100">
        <template #default="{ row }">{{ row.level || '—' }}</template>
      </el-table-column>
      <el-table-column prop="status" label="状态" min-width="100">
        <template #default="{ row }">{{ row.status || '—' }}</template>
      </el-table-column>
      <el-table-column prop="content" label="描述" min-width="220">
        <template #default="{ row }">{{ row.content || '—' }}</template>
      </el-table-column>
      <el-table-column prop="source" label="来源" min-width="160">
        <template #default="{ row }">{{ row.source || '—' }}</template>
      </el-table-column>
    </MgmtProTable>
  </div>
</template>
