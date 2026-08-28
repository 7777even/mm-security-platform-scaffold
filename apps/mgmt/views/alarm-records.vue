<script setup lang="ts">
// 报警记录列表页 —— 后台标准列表页参照实现（docs/UI规范-后台管理端.md §5.1）
// 骨架：页标题 → 筛选卡（MgmtFilterBar）→ 数据表格（MgmtProTable）→ 分页
// 状态 / 等级着色只用全局 .tag-* 与 tokens.css --color-alarm-* 映射，禁止自造色
import { computed, reactive, ref } from 'vue';
import MgmtFilterBar from '../components/MgmtFilterBar.vue';
import MgmtProTable from '../components/MgmtProTable.vue';

type AlarmStatus = 'ACTIVE' | 'ACKED' | 'DISPATCHED' | 'CLOSED';
type AlarmLevel = 1 | 2 | 3 | 4;

// 报警状态 → 标签（枚举真源见 docs/UI规范-后台管理端.md §7，后续抽到共享常量）
const ALARM_STATUS_META: Record<AlarmStatus, { label: string; tagClass: string }> = {
  ACTIVE: { label: '待处理', tagClass: 'tag-danger' },
  ACKED: { label: '已确认', tagClass: 'tag-warning' },
  DISPATCHED: { label: '已派单', tagClass: 'tag-info' },
  CLOSED: { label: '已闭环', tagClass: 'tag-success' },
};

// 报警等级 → 标签：一级红 / 二三级橙 / 四级主蓝
const LEVEL_TAG: Record<AlarmLevel, string> = {
  1: 'tag-danger',
  2: 'tag-warning',
  3: 'tag-warning',
  4: 'tag-info',
};

interface AlarmRow {
  id: string;
  type: string;
  level: AlarmLevel;
  location: string;
  status: AlarmStatus;
  time: string;
}

const MOCK_ROWS: AlarmRow[] = [
  {
    id: 'AL-2608-0101',
    type: '火灾探测报警',
    level: 1,
    location: '一号厂房·装置区 A',
    status: 'ACTIVE',
    time: '2026-08-28 09:12',
  },
  {
    id: 'AL-2608-0100',
    type: '消防水系统异常',
    level: 3,
    location: '二号仓库·消防泵房',
    status: 'ACKED',
    time: '2026-08-28 08:47',
  },
  {
    id: 'AL-2608-0098',
    type: '门禁异常闯入',
    level: 2,
    location: '厂区北门·卡口 03',
    status: 'DISPATCHED',
    time: '2026-08-28 08:20',
  },
  {
    id: 'AL-2608-0095',
    type: '液位超限预警',
    level: 4,
    location: '危化品库·储罐 B2',
    status: 'CLOSED',
    time: '2026-08-27 22:05',
  },
  {
    id: 'AL-2608-0091',
    type: '火灾探测报警',
    level: 1,
    location: '一号厂房·装置区 C',
    status: 'CLOSED',
    time: '2026-08-27 18:31',
  },
  {
    id: 'AL-2608-0088',
    type: '视频遮挡告警',
    level: 4,
    location: '综合楼·东侧出入口',
    status: 'CLOSED',
    time: '2026-08-27 15:58',
  },
  {
    id: 'AL-2608-0085',
    type: '消防水系统异常',
    level: 3,
    location: '二号仓库·稳压设备',
    status: 'CLOSED',
    time: '2026-08-27 11:26',
  },
  {
    id: 'AL-2608-0080',
    type: '防撞柱撞击告警',
    level: 2,
    location: '大门一·防撞柱 01',
    status: 'CLOSED',
    time: '2026-08-26 19:44',
  },
  {
    id: 'AL-2608-0076',
    type: '液位超限预警',
    level: 4,
    location: '危化品库·储罐 A1',
    status: 'CLOSED',
    time: '2026-08-26 14:02',
  },
  {
    id: 'AL-2608-0071',
    type: '门禁异常闯入',
    level: 2,
    location: '厂区南门·卡口 01',
    status: 'CLOSED',
    time: '2026-08-26 09:17',
  },
  {
    id: 'AL-2608-0069',
    type: '火灾探测报警',
    level: 1,
    location: '一号厂房·装置区 B',
    status: 'CLOSED',
    time: '2026-08-25 21:36',
  },
  {
    id: 'AL-2608-0065',
    type: '视频遮挡告警',
    level: 4,
    location: '综合楼·西侧走廊',
    status: 'CLOSED',
    time: '2026-08-25 16:49',
  },
];

const filters = reactive<{ keyword: string; status: AlarmStatus | ''; level: AlarmLevel | '' }>({
  keyword: '',
  status: '',
  level: '',
});

const page = ref(1);
const pageSize = ref(10);

const filteredRows = computed<AlarmRow[]>(() =>
  MOCK_ROWS.filter((row) => {
    if (filters.status && row.status !== filters.status) return false;
    if (filters.level !== '' && row.level !== filters.level) return false;
    if (filters.keyword && !`${row.id}${row.type}${row.location}`.includes(filters.keyword.trim()))
      return false;
    return true;
  }),
);

const pagedRows = computed<AlarmRow[]>(() => {
  const start = (page.value - 1) * pageSize.value;
  return filteredRows.value.slice(start, start + pageSize.value);
});

function onSearch() {
  page.value = 1;
}

function onReset() {
  filters.keyword = '';
  filters.status = '';
  filters.level = '';
  page.value = 1;
}

function statusMeta(status: AlarmStatus) {
  return ALARM_STATUS_META[status];
}
</script>

<template>
  <div class="alarm-records">
    <h1 class="alarm-records__title">报警记录</h1>

    <MgmtFilterBar @search="onSearch" @reset="onReset">
      <el-input
        v-model="filters.keyword"
        placeholder="编号 / 类型 / 位置"
        clearable
        style="width: var(--mgmt-filter-input-w)"
        @keyup.enter="onSearch"
      />
      <el-select
        v-model="filters.status"
        placeholder="报警状态"
        clearable
        style="width: var(--mgmt-filter-select-w)"
      >
        <el-option
          v-for="(meta, key) in ALARM_STATUS_META"
          :key="key"
          :label="meta.label"
          :value="key"
        />
      </el-select>
      <el-select
        v-model="filters.level"
        placeholder="报警等级"
        clearable
        style="width: var(--mgmt-filter-select-w)"
      >
        <el-option label="一级" :value="1" />
        <el-option label="二级" :value="2" />
        <el-option label="三级" :value="3" />
        <el-option label="四级" :value="4" />
      </el-select>
    </MgmtFilterBar>

    <MgmtProTable
      v-model:page="page"
      v-model:page-size="pageSize"
      :data="pagedRows"
      :total="filteredRows.length"
    >
      <el-table-column prop="id" label="报警编号" min-width="140" />
      <el-table-column prop="type" label="报警类型" min-width="140" />
      <el-table-column label="等级" width="90">
        <template #default="{ row }">
          <span class="tag" :class="LEVEL_TAG[row.level as AlarmLevel]"> {{ row.level }}级 </span>
        </template>
      </el-table-column>
      <el-table-column prop="location" label="位置" min-width="180" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <span class="tag" :class="statusMeta(row.status as AlarmStatus).tagClass">
            {{ statusMeta(row.status as AlarmStatus).label }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="time" label="报警时间" min-width="150" />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default>
          <el-button type="primary" link size="small">详情</el-button>
          <el-button type="primary" link size="small">处置</el-button>
        </template>
      </el-table-column>
    </MgmtProTable>
  </div>
</template>

<style scoped>
.alarm-records {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.alarm-records__title {
  margin: 0;
  font-size: var(--mgmt-fz-page-title);
  font-weight: 700;
  color: var(--text-title-mgmt);
}
</style>
