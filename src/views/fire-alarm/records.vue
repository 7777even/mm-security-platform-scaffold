<!--
  消防报警记录（二级页面）
  完整报警记录：等级/状态筛选 + 关键字搜索 + 分页表格 + 详情抽屉
  布局：全宽 PanelCard 容器（区别于一级页面的 ModuleLayout 双栏骨架）
-->
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import PanelCard from '@/components/common/PanelCard.vue';
import AppButton from '@/components/common/AppButton.vue';
import { useAlarmView } from '@/composables/useAlarmView';
import type { AlarmItem, AlarmLevel, AlarmStatus } from '@/services/alarm';

const router = useRouter();
const {
  page,
  size,
  levelFilter,
  statusFilter,
  detail,
  pageResult,
  refresh,
  openDetail,
  ack,
} = useAlarmView();

const keyword = ref('');
const detailVisible = computed(() => detail.value !== null);

const LEVELS: AlarmLevel[] = [1, 2, 3, 4];
const STATUSES: AlarmStatus[] = ['ACTIVE', 'ACKED', 'DISPATCHED', 'CLOSED'];
const LEVEL_TEXT: Record<AlarmLevel, string> = { 1: '一级', 2: '二级', 3: '三级', 4: '四级' };
const STATUS_TEXT: Record<AlarmStatus, string> = {
  ACTIVE: '待处理',
  ACKED: '已确认',
  DISPATCHED: '已派单',
  CLOSED: '已闭环',
};

const filtered = computed(() => {
  const k = keyword.value.trim().toLowerCase();
  if (!k) return pageResult.value.list;
  return pageResult.value.list.filter((a) => {
    const hit =
      a.alarmId.toLowerCase().includes(k) ||
      a.deviceCode.toLowerCase().includes(k) ||
      a.location.toLowerCase().includes(k);
    return hit;
  });
});

function formatTs(ts: string): string {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return ts;
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

async function onAck(row: AlarmItem): Promise<void> {
  const ok = await ack(row.alarmId);
  if (ok) ElMessage.success(`已确认报警 ${row.alarmId}`);
  else ElMessage.warning('无确认权限或状态不可确认');
}

function goBack(): void {
  router.push('/fire-alarm');
}

onMounted(() => {
  void refresh();
});
</script>

<template>
  <PanelCard title="消防报警记录" icon="Bell" class="records-page">
    <div class="records-toolbar">
      <el-input
        v-model="keyword"
        placeholder="搜索 报警编号 / 设备编码 / 位置"
        clearable
        style="width: 240px"
      />
      <el-select v-model="levelFilter" placeholder="全部等级" clearable style="width: 140px">
        <el-option v-for="l in LEVELS" :key="l" :label="LEVEL_TEXT[l]" :value="l" />
      </el-select>
      <el-select v-model="statusFilter" placeholder="全部状态" clearable style="width: 140px">
        <el-option v-for="s in STATUSES" :key="s" :label="STATUS_TEXT[s]" :value="s" />
      </el-select>
      <div class="records-toolbar__spacer" />
      <AppButton variant="ghost" size="sm" @click="goBack">返回</AppButton>
    </div>

    <el-table
      :data="filtered"
      stripe
      class="records-table"
      max-height="calc(100vh - 260px)"
      @row-click="openDetail"
    >
      <el-table-column prop="alarmId" label="报警编号" width="150" />
      <el-table-column label="等级" width="90">
        <template #default="{ row }">
          <el-tag size="small" :type="row.level === 1 ? 'success' : row.level === 2 ? 'warning' : 'danger'">
            {{ LEVEL_TEXT[row.level as AlarmLevel] }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="类型" width="120">
        <template #default="{ row }">{{ row.type }}</template>
      </el-table-column>
      <el-table-column label="状态" width="110">
        <template #default="{ row }">
          <span class="records-status" :class="`is-${row.status}`">
            {{ STATUS_TEXT[row.status as AlarmStatus] }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="deviceCode" label="设备编码" width="140" />
      <el-table-column prop="location" label="位置" min-width="180" show-overflow-tooltip />
      <el-table-column label="上报时间" width="180">
        <template #default="{ row }">{{ formatTs(row.ts) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click.stop="openDetail(row)">详情</el-button>
          <el-button
            link
            type="success"
            size="small"
            :disabled="row.status !== 'ACTIVE'"
            @click.stop="onAck(row)"
          >
            确认
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="records-pager">
      <el-pagination
        v-model:current-page="page"
        layout="total, prev, pager, next, sizes"
        :total="pageResult.total"
        :page-size="size"
        :page-sizes="[10, 20, 50]"
      />
    </div>

    <el-drawer v-model="detailVisible" title="报警详情" direction="rtl" size="400px">
      <dl v-if="detail" class="detail-view">
        <div class="detail-view__row">
          <dt>报警编号</dt>
          <dd class="font-number">{{ detail.alarmId }}</dd>
        </div>
        <div class="detail-view__row">
          <dt>等级</dt>
          <dd>{{ LEVEL_TEXT[detail.level as AlarmLevel] }}</dd>
        </div>
        <div class="detail-view__row">
          <dt>类型</dt>
          <dd>{{ detail.type }}</dd>
        </div>
        <div class="detail-view__row">
          <dt>设备编码</dt>
          <dd class="font-number">{{ detail.deviceCode }}</dd>
        </div>
        <div class="detail-view__row">
          <dt>位置</dt>
          <dd>{{ detail.location }}</dd>
        </div>
        <div class="detail-view__row">
          <dt>描述</dt>
          <dd>{{ detail.description }}</dd>
        </div>
        <div class="detail-view__row">
          <dt>状态</dt>
          <dd>{{ STATUS_TEXT[detail.status as AlarmStatus] }}</dd>
        </div>
        <div class="detail-view__row">
          <dt>上报时间</dt>
          <dd class="font-number">{{ formatTs(detail.ts) }}</dd>
        </div>
      </dl>
      <div v-if="detail" class="records-detail-actions">
        <AppButton variant="primary" size="sm" :disabled="detail.status !== 'ACTIVE'" @click="onAck(detail)">
          确认处置
        </AppButton>
        <AppButton variant="ghost" size="sm" @click="detailVisible = false">关闭</AppButton>
      </div>
    </el-drawer>
  </PanelCard>
</template>

<style scoped>
.records-page {
  height: 100%;
}

.records-toolbar {
  display: flex;
  gap: var(--space-sm);
  align-items: center;
  margin-bottom: var(--space-md);
  flex-wrap: wrap;
}

.records-toolbar__spacer {
  flex: 1;
}

.records-table {
  width: 100%;
}

.records-status {
  font-size: 12px;
}

.records-status.is-ACTIVE {
  color: var(--color-alarm-1, #ef4444);
}

.records-status.is-ACKED {
  color: var(--color-warning, #fbbf24);
}

.records-status.is-DISPATCHED {
  color: var(--color-accent, #00d8ff);
}

.records-status.is-CLOSED {
  color: var(--color-success, #2ee6a8);
}

.records-pager {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--space-md);
}

.records-detail-actions {
  display: flex;
  gap: var(--space-sm);
  margin-top: var(--space-lg);
}

/* 详情抽屉：项目自定义深色描述布局（对齐 §5.3 详情抽屉 + dashboard .crud-view 风格） */
.detail-view {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin: 0;
  border: 1px solid rgb(148 163 184 / 18%);
  border-radius: var(--radius-md, 10px);
  overflow: hidden;
  background: linear-gradient(180deg, rgb(15 23 42 / 55%), rgb(11 17 32 / 55%));
}

.detail-view__row {
  display: grid;
  grid-template-columns: 96px 1fr;
  align-items: center;
  gap: 12px;
  min-height: 42px;
  padding: 0 14px;
  border-bottom: 1px dashed rgb(148 163 184 / 12%);
  font-size: 13px;
}

.detail-view__row:last-child {
  border-bottom: none;
}

.detail-view__row:nth-child(even) {
  background: rgb(255 255 255 / 2.5%);
}

.detail-view dt {
  color: var(--color-text-muted, #94a3b8);
  font-size: 12px;
}

.detail-view dd {
  margin: 0;
  color: var(--color-text, #e2e8f0);
  text-align: right;
}
</style>