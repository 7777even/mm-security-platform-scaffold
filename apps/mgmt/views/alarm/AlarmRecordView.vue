<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { Warning } from '@element-plus/icons-vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import MgmtProTable from '../../components/MgmtProTable.vue';
import { toastErr } from '../../utils/feedback';
import { fetchAlarmPage } from '@/services/alarm';
import type { AlarmItem, AlarmLevel, AlarmStatus, AlarmType } from '@/services/alarm';

// 报警记录（/alarm-record）：接后端 GET /api/v1/alarms 分页查询。
// 只读订阅（后端 @RequireAuth 仅需登录），无下行控制；写操作（确认/派发/删除）
// 需后端补端点（当前仅 create/update/delete 应急事件），留待下一批。

function asAlarm(row: unknown): AlarmItem {
  return row as AlarmItem;
}

const rows = ref<AlarmItem[]>([]);
const total = ref(0);
const page = ref(1);
const size = ref(10);
const loading = ref(false);

const filters = reactive<{ level: AlarmLevel | undefined; status: AlarmStatus | '' | undefined }>({
  level: undefined,
  status: undefined,
});

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetchAlarmPage(page.value, size.value, {
      level: filters.level,
      status: filters.status || undefined,
    });
    rows.value = Array.isArray(res?.list) ? (res.list as AlarmItem[]) : [];
    total.value = Number(res?.total ?? 0);
  } catch (err) {
    toastErr(err, '加载报警记录失败：');
    rows.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
}

function resetFilters(): void {
  filters.level = undefined;
  filters.status = undefined;
  page.value = 1;
  void load();
}

function onPage(p: number): void {
  page.value = p;
  void load();
}

function onSize(s: number): void {
  size.value = s;
  page.value = 1;
  void load();
}

const LEVEL_TEXT: Record<AlarmLevel, string> = { 1: '一级', 2: '二级', 3: '三级', 4: '四级' };
const LEVEL_TAG: Record<AlarmLevel, string> = {
  1: 'tag-danger',
  2: 'tag-warning',
  3: 'tag-warning',
  4: 'tag-info',
};
const STATUS_TEXT: Record<AlarmStatus, string> = {
  ACTIVE: '活动',
  ACKED: '已确认',
  DISPATCHED: '已派发',
  CLOSED: '已闭环',
};
const STATUS_TAG: Record<AlarmStatus, string> = {
  ACTIVE: 'tag-danger',
  ACKED: 'tag-warning',
  DISPATCHED: 'tag-info',
  CLOSED: 'tag-success',
};
const TYPE_TEXT: Record<AlarmType, string> = {
  FIRE: '消防',
  GAS: '气体',
  TEMP: '温度',
  CCTV: '视频',
  SOS: '应急',
};

function levelText(l: AlarmLevel): string {
  return LEVEL_TEXT[l] ?? `L${l}`;
}
function levelTag(l: AlarmLevel): string {
  return LEVEL_TAG[l] ?? 'tag-info';
}
function statusText(s: AlarmStatus): string {
  return STATUS_TEXT[s] ?? s;
}
function statusTag(s: AlarmStatus): string {
  return STATUS_TAG[s] ?? 'tag-info';
}
function typeText(t: AlarmType): string {
  return TYPE_TEXT[t] ?? t;
}
function formatTs(ts?: string): string {
  if (!ts) return '—';
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return ts;
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

onMounted(load);
</script>

<template>
  <div>
    <MgmtPageHead title="报警记录" crumb="报警管理 / 报警记录" :icon="Warning" icon-tone="red" />

    <div class="mgmt-filter-card">
      <el-select v-model="filters.level" placeholder="级别：全部" clearable style="width: 140px">
        <el-option label="一级" :value="1" />
        <el-option label="二级" :value="2" />
        <el-option label="三级" :value="3" />
        <el-option label="四级" :value="4" />
      </el-select>
      <el-select v-model="filters.status" placeholder="状态：全部" clearable style="width: 150px">
        <el-option label="活动" value="ACTIVE" />
        <el-option label="已确认" value="ACKED" />
        <el-option label="已派发" value="DISPATCHED" />
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
      :data="rows"
      :total="total"
      :page="page"
      :page-size="size"
      @update:page="onPage"
      @update:page-size="onSize"
    >
      <el-table-column label="报警时间" min-width="150">
        <template #default="{ row }">{{ formatTs(asAlarm(row).ts) }}</template>
      </el-table-column>
      <el-table-column label="报警名称" min-width="180">
        <template #default="{ row }">{{ asAlarm(row).title || '—' }}</template>
      </el-table-column>
      <el-table-column label="类型" width="100">
        <template #default="{ row }">
          <span class="tag tag-info">{{ typeText(asAlarm(row).type) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="级别" width="90">
        <template #default="{ row }">
          <span class="tag" :class="levelTag(asAlarm(row).level)">{{
            levelText(asAlarm(row).level)
          }}</span>
        </template>
      </el-table-column>
      <el-table-column label="事发位置" min-width="160">
        <template #default="{ row }">{{ asAlarm(row).location || '—' }}</template>
      </el-table-column>
      <el-table-column label="关联设备" min-width="140">
        <template #default="{ row }">{{ asAlarm(row).deviceCode || '—' }}</template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <span class="tag" :class="statusTag(asAlarm(row).status)">{{
            statusText(asAlarm(row).status)
          }}</span>
        </template>
      </el-table-column>
      <el-table-column label="是否预警" width="100">
        <template #default="{ row }">
          <span class="tag" :class="asAlarm(row).warned ? 'tag-warning' : 'tag-info'">
            {{ asAlarm(row).warned ? '是' : '否' }}
          </span>
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
