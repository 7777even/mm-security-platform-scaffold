<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { Warning } from '@element-plus/icons-vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import MgmtProTable from '../../components/MgmtProTable.vue';
import { toastErr } from '../../utils/feedback';
import { fetchFireAlarmPage } from '@/services/alarm';
import type { FireAlarmItem, AlarmStatus } from '@/services/alarm';

// 消防报警记录：与大屏「消防报警」同源，接后端 GET /api/v1/fire-alarms（fac_fire_alarm）。
// 后端仅支持分页，状态(ACTIVE/CLOSED)在前端过滤，保证管理端与大屏「已闭环」口径联动一致。

function asAlarm(row: unknown): FireAlarmItem {
  return row as FireAlarmItem;
}

const allRows = ref<FireAlarmItem[]>([]);
const page = ref(1);
const size = ref(10);
const loading = ref(false);

const filters = reactive<{ status: AlarmStatus | '' }>({ status: '' });

async function load(): Promise<void> {
  loading.value = true;
  try {
    // 拉全量，与大屏 size=1000 同源；状态在前端过滤，确保两端「已闭环」同数。
    const res = await fetchFireAlarmPage(1, 1000);
    allRows.value = Array.isArray(res?.list) ? (res.list as FireAlarmItem[]) : [];
  } catch (err) {
    toastErr(err, '加载消防报警记录失败：');
    allRows.value = [];
  } finally {
    loading.value = false;
  }
}

const filtered = computed<FireAlarmItem[]>(() =>
  filters.status ? allRows.value.filter((r) => r.status === filters.status) : allRows.value,
);
const total = computed(() => filtered.value.length);
const pageRows = computed<FireAlarmItem[]>(() => {
  const start = (page.value - 1) * size.value;
  return filtered.value.slice(start, start + size.value);
});

watch(
  () => filters.status,
  () => {
    page.value = 1;
  },
);

function resetFilters(): void {
  filters.status = '';
  page.value = 1;
}
function onPage(p: number): void {
  page.value = p;
}
function onSize(s: number): void {
  size.value = s;
  page.value = 1;
}

const STATUS_TEXT: Record<string, string> = { ACTIVE: '活动', CLOSED: '已闭环' };
const STATUS_TAG: Record<string, string> = { ACTIVE: 'tag-danger', CLOSED: 'tag-success' };
function statusText(s: string): string {
  return STATUS_TEXT[s] ?? s;
}
function statusTag(s: string): string {
  return STATUS_TAG[s] ?? 'tag-info';
}
function falseTag(v?: string): string {
  if (v === '误报') return 'tag-info';
  if (v === '真实') return 'tag-success';
  return 'tag-warning';
}

onMounted(load);
</script>

<template>
  <div>
    <MgmtPageHead
      title="消防报警记录"
      crumb="报警管理 / 消防报警记录"
      :icon="Warning"
      icon-tone="red"
    />

    <div class="mgmt-filter-card">
      <el-select v-model="filters.status" placeholder="状态：全部" clearable style="width: 150px">
        <el-option label="活动" value="ACTIVE" />
        <el-option label="已闭环" value="CLOSED" />
      </el-select>
      <el-button
        type="primary"
        @click="
          page = 1;
          load();
        "
        >查询</el-button
      >
      <el-button @click="resetFilters">重置</el-button>
    </div>

    <MgmtProTable
      v-loading="loading"
      :data="pageRows"
      :total="total"
      :page="page"
      :page-size="size"
      @update:page="onPage"
      @update:page-size="onSize"
    >
      <el-table-column label="报警时间" min-width="160">
        <template #default="{ row }">{{ asAlarm(row).time || '—' }}</template>
      </el-table-column>
      <el-table-column label="报警名称" min-width="180">
        <template #default="{ row }">{{ asAlarm(row).title || '—' }}</template>
      </el-table-column>
      <el-table-column label="类型" width="110">
        <template #default="{ row }">
          <span class="tag tag-info">{{ asAlarm(row).typeLabel || '—' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="事发位置" min-width="160">
        <template #default="{ row }">{{ asAlarm(row).location || '—' }}</template>
      </el-table-column>
      <el-table-column label="关联监控" min-width="140">
        <template #default="{ row }">{{ asAlarm(row).monitorLabel || '—' }}</template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <span class="tag" :class="statusTag(asAlarm(row).status)">{{
            statusText(asAlarm(row).status)
          }}</span>
        </template>
      </el-table-column>
      <el-table-column label="误报核实" width="100">
        <template #default="{ row }">
          <span class="tag" :class="falseTag(asAlarm(row).falseAlarm)">{{
            asAlarm(row).falseAlarm || '—'
          }}</span>
        </template>
      </el-table-column>
    </MgmtProTable>
  </div>
</template>

<style scoped>
.mgmt-filter-card {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  align-items: center;
  padding: var(--space-sm) var(--space-md);
  margin-bottom: var(--space-md);
  background: var(--card-mgmt);
  border: 1px solid var(--border-mgmt);
  border-radius: var(--mgmt-radius-lg);
}
</style>
