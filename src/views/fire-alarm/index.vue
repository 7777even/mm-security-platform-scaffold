<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useAlarmView } from '@/composables/useAlarmView';
import type { AlarmItem, AlarmLevel, AlarmStatus } from '@/services/alarm';
import PanelCard from '@/components/common/PanelCard.vue';
import AlarmCard from '@/components/common/AlarmCard.vue';
import AppButton from '@/components/common/AppButton.vue';

const {
  page,
  size,
  levelFilter,
  statusFilter,
  detail,
  pageResult,
  activeCount,
  refresh,
  openDetail,
  canAck,
  ack,
} = useAlarmView();

const detailVisible = computed(() => detail.value !== null);

const LEVELS: AlarmLevel[] = [1, 2, 3, 4];
const STATUSES: AlarmStatus[] = ['ACTIVE', 'ACKED', 'DISPATCHED', 'CLOSED'];

const STATUS_TEXT: Record<AlarmStatus, string> = {
  ACTIVE: '待处理',
  ACKED: '已确认',
  DISPATCHED: '已派单',
  CLOSED: '已闭环',
};

const LEVEL_TEXT: Record<AlarmLevel, string> = {
  1: '一级',
  2: '二级',
  3: '三级',
  4: '四级',
};

async function onAck(row: AlarmItem): Promise<void> {
  const ok = await ack(row.alarmId);
  if (ok) ElMessage.success(`已确认报警 ${row.alarmId}`);
  else ElMessage.warning('无确认权限或状态不可确认');
}

onMounted(() => {
  void refresh();
});
</script>

<template>
  <PanelCard class="page-panel" title="火灾报警监测" icon="Bell" more="导出">
    <header class="alarm-head">
      <div>
        <h2 class="panel-title">火灾报警监测</h2>
        <p class="alarm-sub">实时报警接入 · 当前待处理 {{ activeCount }} 条</p>
      </div>
      <AppButton variant="primary" size="md" @click="refresh">查看全部</AppButton>
    </header>

    <!-- §13.1 报警等级色块统计：与设计稿图 5-10「重大风险管控」一致 -->
    <section class="level-summary" aria-label="各等级报警数量">
      <AlarmCard
        v-for="l in LEVELS"
        :key="l"
        :level="l"
        :title="LEVEL_TEXT[l]"
        :desc="`待处理 ${pageResult.list.filter((a) => a.level === l).length} 条`"
        time="—"
      />
    </section>

    <div class="alarm-filters">
      <el-select v-model="levelFilter" placeholder="全部等级" clearable style="width: 140px">
        <el-option v-for="l in LEVELS" :key="l" :label="LEVEL_TEXT[l]" :value="l" />
      </el-select>
      <el-select v-model="statusFilter" placeholder="全部状态" clearable style="width: 140px">
        <el-option v-for="s in STATUSES" :key="s" :label="STATUS_TEXT[s]" :value="s" />
      </el-select>
    </div>

    <el-table :data="pageResult.list" class="alarm-table" empty-text="暂无报警">
      <el-table-column prop="alarmId" label="报警编号" width="120" />
      <el-table-column label="等级" width="90">
        <template #default="{ row }">
          <el-tag :type="row.level <= 2 ? 'danger' : 'warning'">{{
            LEVEL_TEXT[row.level as AlarmLevel]
          }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="type" label="类型" width="100" />
      <el-table-column prop="deviceCode" label="设备编码" width="120" />
      <el-table-column prop="location" label="位置" min-width="140" />
      <el-table-column prop="description" label="描述" min-width="160" show-overflow-tooltip />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'ACTIVE' ? 'danger' : 'info'">
            {{ STATUS_TEXT[row.status as AlarmStatus] }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <AppButton
            variant="primary"
            size="sm"
            :disabled="!canAck() || row.status !== 'ACTIVE'"
            @click="onAck(row as AlarmItem)"
            >确认</AppButton
          >
          <AppButton variant="ghost" size="sm" @click="openDetail(row as AlarmItem)"
            >详情</AppButton
          >
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="page"
      class="alarm-pager"
      layout="prev, pager, next, total"
      :total="pageResult.total"
      :page-size="size"
    />

    <el-drawer v-model="detailVisible" title="报警详情" direction="rtl" size="380px">
      <el-descriptions v-if="detail" :column="1" border>
        <el-descriptions-item label="报警编号">{{ detail.alarmId }}</el-descriptions-item>
        <el-descriptions-item label="等级">{{
          LEVEL_TEXT[detail.level as AlarmLevel]
        }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ detail.type }}</el-descriptions-item>
        <el-descriptions-item label="设备编码">{{ detail.deviceCode }}</el-descriptions-item>
        <el-descriptions-item label="位置">{{ detail.location }}</el-descriptions-item>
        <el-descriptions-item label="描述">{{ detail.description }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{
          STATUS_TEXT[detail.status as AlarmStatus]
        }}</el-descriptions-item>
        <el-descriptions-item label="上报时间">{{ detail.ts }}</el-descriptions-item>
      </el-descriptions>
    </el-drawer>
  </PanelCard>
</template>

<style scoped>
.page-panel {
  min-height: 100%;
  padding: var(--space-lg);
}

.alarm-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: var(--space-md);
}

.alarm-sub {
  margin: 4px 0 0;
  color: var(--color-text-muted);
  font-size: 13px;
}

/* §13.1 报警等级色块统计：4 个 AlarmCard 横排，间距 16px */
.level-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.alarm-filters {
  display: flex;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.alarm-table {
  width: 100%;
}

.alarm-pager {
  margin-top: var(--space-md);
  justify-content: flex-end;
}
</style>
