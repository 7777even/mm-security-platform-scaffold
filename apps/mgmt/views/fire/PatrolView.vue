<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Calendar } from '@element-plus/icons-vue';
import MgmtProTable from '../../components/MgmtProTable.vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import { toastErr } from '../../utils/feedback';
import { fetchFirePatrols } from '@/services/fireMonitoring';
import type { FirePatrolRecord } from '@/services/fireMonitoring';

// 日常防火巡查管理（/patrol-mgmt）：接后端 /fire/patrols。
const rows = ref<FirePatrolRecord[]>([]);
const loading = ref(false);

/** 异常数 = 巡查项里 result 非「正常」的数量。 */
function abnormalCount(r: FirePatrolRecord): number {
  if (!Array.isArray(r.checkItems)) return 0;
  return r.checkItems.filter((it) => it.result && it.result !== '正常').length;
}

const SHIFT_TEXT: Record<string, string> = { 上午: '上午', 下午: '下午', 夜间: '夜间' };

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetchFirePatrols();
    rows.value = Array.isArray(res) ? res : [];
  } catch (err) {
    toastErr(err, '加载防火巡查记录失败：');
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
      title="日常防火巡查管理"
      crumb="消防管理 / 日常防火巡查管理"
      :icon="Calendar"
      icon-tone="blue"
    >
      <template #actions>
        <el-button :loading="loading" @click="load">刷新</el-button>
      </template>
    </MgmtPageHead>

    <MgmtProTable :data="rows">
      <el-table-column prop="patrolDate" label="巡查日期" min-width="140" />
      <el-table-column prop="shift" label="班次" min-width="100">
        <template #default="{ row }">{{ SHIFT_TEXT[row.shift] || row.shift || '—' }}</template>
      </el-table-column>
      <el-table-column prop="dutyPerson" label="值班人员" min-width="120">
        <template #default="{ row }">{{ row.dutyPerson || '—' }}</template>
      </el-table-column>
      <el-table-column prop="patrolCount" label="部位数" min-width="100">
        <template #default="{ row }">{{ row.patrolCount || '—' }}</template>
      </el-table-column>
      <el-table-column label="异常数" min-width="100">
        <template #default="{ row }">
          <span :class="['abn', abnormalCount(row as FirePatrolRecord) > 0 ? 'abn-warn' : '']">{{
            abnormalCount(row as FirePatrolRecord)
          }}</span>
        </template>
      </el-table-column>
      <el-table-column label="完成" min-width="90">
        <template #default="{ row }">
          <span :class="row.completed ? 'ok' : 'no'">{{ row.completed ? '是' : '否' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="workOrderNo" label="工单号" min-width="160">
        <template #default="{ row }">{{ row.workOrderNo || '—' }}</template>
      </el-table-column>
    </MgmtProTable>

    <el-empty v-if="!loading && !rows.length" description="暂无防火巡查记录" />
  </div>
</template>

<style scoped>
.ok {
  color: #16a34a;
}

.no {
  color: #9ca3af;
}

.abn-warn {
  color: #dc2626;
  font-weight: 600;
}
</style>
