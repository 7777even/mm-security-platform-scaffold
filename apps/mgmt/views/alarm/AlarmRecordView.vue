<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Warning } from '@element-plus/icons-vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import MgmtProTable from '../../components/MgmtProTable.vue';
import FireAlarmEditDialog from '../../components/FireAlarmEditDialog.vue';
import { toastErr } from '../../utils/feedback';
import { fetchFireAlarmPage, deleteFireAlarm } from '@/services/alarm';
import { subscribeDomainChange } from '@/services/realtime';
import type { FireAlarmItem, AlarmStatus } from '@/services/alarm';

// 消防报警记录：与大屏「消防报警」同源，接后端 GET /api/v1/fire-alarms（fac_fire_alarm）。
// 后端仅支持分页，状态(ACTIVE/ACKED/DISPATCHED/CLOSED)在前端过滤，保证管理端与大屏「已闭环」口径联动一致。
// 三端实时联通：订阅 fire-alarm.alarm 域变更，后台增删改后自动重拉本列表。

function asAlarm(row: unknown): FireAlarmItem {
  return row as FireAlarmItem;
}

const allRows = ref<FireAlarmItem[]>([]);
const page = ref(1);
const size = ref(10);
const loading = ref(false);

const filters = reactive<{ status: AlarmStatus | '' }>({ status: '' });

const dialogVisible = ref(false);
const editRow = ref<FireAlarmItem | null>(null);

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

function openCreate(): void {
  editRow.value = null;
  dialogVisible.value = true;
}
function openEdit(row: FireAlarmItem): void {
  editRow.value = row;
  dialogVisible.value = true;
}
async function onSaved(): Promise<void> {
  await load();
}
async function onDelete(row: FireAlarmItem): Promise<void> {
  try {
    await ElMessageBox.confirm(
      `确认删除消防报警「${row.title || row.alarmId}」？删除后不可恢复。`,
      '删除确认',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' },
    );
  } catch {
    return; // 用户取消
  }
  try {
    await deleteFireAlarm(row.alarmId);
    ElMessage.success('已删除');
    await load();
  } catch (err) {
    toastErr(err, '删除失败：');
  }
}

const STATUS_TEXT: Record<string, string> = {
  ACTIVE: '活动',
  ACKED: '已确认',
  DISPATCHED: '已派单',
  CLOSED: '已闭环',
};
const STATUS_TAG: Record<string, string> = {
  ACTIVE: 'tag-danger',
  ACKED: 'tag-warning',
  DISPATCHED: 'tag-primary',
  CLOSED: 'tag-success',
};
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

// 三端实时联通：订阅 fire-alarm.alarm 变更，卸载时退订。
const unsubFireAlarm = subscribeDomainChange('fire-alarm.alarm', () => void load());
onMounted(load);
onUnmounted(() => unsubFireAlarm());
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
      <el-button type="primary" @click="openCreate">新增</el-button>
      <el-select v-model="filters.status" placeholder="状态：全部" clearable style="width: 150px">
        <el-option label="活动" value="ACTIVE" />
        <el-option label="已确认" value="ACKED" />
        <el-option label="已派单" value="DISPATCHED" />
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
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(asAlarm(row))">编辑</el-button>
          <el-button link type="danger" @click="onDelete(asAlarm(row))">删除</el-button>
        </template>
      </el-table-column>
    </MgmtProTable>

    <FireAlarmEditDialog v-model="dialogVisible" :edit-row="editRow" @saved="onSaved" />
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
