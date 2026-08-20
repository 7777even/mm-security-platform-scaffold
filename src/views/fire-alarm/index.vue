<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useAlarmView } from '@/composables/useAlarmView';
import type { AlarmItem, AlarmLevel, AlarmStatus } from '@/services/alarm';
import ModuleLayout from '@/components/layout/ModuleLayout.vue';
import PanelCard from '@/components/common/PanelCard.vue';
import AlarmCard from '@/components/common/AlarmCard.vue';
import AlarmListItem from '@/components/common/AlarmListItem.vue';
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

function onPageChange(p: number): void {
  page.value = p;
}

onMounted(() => {
  void refresh();
});
</script>

<template>
  <ModuleLayout>
    <!-- 左侧：报警态势（§13.1 报警等级色块统计，与设计稿图 5-10「重大风险管控」一致） -->
    <template #left>
      <PanelCard title="报警态势" icon="DataBoard">
        <p class="active-tip">
          当前待处理 <b>{{ activeCount }}</b> 条
        </p>
        <div class="level-grid">
          <AlarmCard
            v-for="l in LEVELS"
            :key="l"
            :level="l"
            :title="LEVEL_TEXT[l]"
            :desc="`待处理 ${pageResult.list.filter((a) => a.level === l).length} 条`"
            time="—"
          />
        </div>
        <div class="left-actions">
          <AppButton variant="primary" size="sm" @click="refresh">刷新</AppButton>
        </div>
      </PanelCard>
    </template>

    <!-- 右侧：消防报警列表（§12.1 设计稿图 5-10 右上消防告警） -->
    <template #right>
      <PanelCard title="消防报警" icon="Bell" more="导出">
        <div class="alarm-filters">
          <el-select v-model="levelFilter" placeholder="全部等级" clearable style="width: 130px">
            <el-option v-for="l in LEVELS" :key="l" :label="LEVEL_TEXT[l]" :value="l" />
          </el-select>
          <el-select v-model="statusFilter" placeholder="全部状态" clearable style="width: 130px">
            <el-option v-for="s in STATUSES" :key="s" :label="STATUS_TEXT[s]" :value="s" />
          </el-select>
        </div>

        <ul v-if="pageResult.list.length" class="alarm-list">
          <li v-for="row in pageResult.list" :key="row.alarmId">
            <AlarmListItem
              :alarm="row as AlarmItem"
              @open="openDetail(row as AlarmItem)"
              @view="ElMessage.info(`跳转现场监控：${row.alarmId}`)"
              @call="ElMessage.info(`发起音视频通话：${row.alarmId}`)"
              @dispatch="onAck(row as AlarmItem)"
            />
          </li>
        </ul>
        <div v-else class="alarm-empty">暂无报警</div>

        <el-pagination
          v-model:current-page="page"
          class="alarm-pager"
          layout="prev, pager, next, total"
          :total="pageResult.total"
          :page-size="size"
          @current-change="onPageChange"
        />
      </PanelCard>
    </template>

    <el-drawer v-model="detailVisible" title="报警详情" direction="rtl" size="380px">
      <el-descriptions v-if="detail" :column="1" border>
        <el-descriptions-item label="报警编号">{{ detail.alarmId }}</el-descriptions-item>
        <el-descriptions-item label="等级">
          {{ LEVEL_TEXT[detail.level as AlarmLevel] }}
        </el-descriptions-item>
        <el-descriptions-item label="类型">{{ detail.type }}</el-descriptions-item>
        <el-descriptions-item label="设备编码">{{ detail.deviceCode }}</el-descriptions-item>
        <el-descriptions-item label="位置">{{ detail.location }}</el-descriptions-item>
        <el-descriptions-item label="描述">{{ detail.description }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          {{ STATUS_TEXT[detail.status as AlarmStatus] }}
        </el-descriptions-item>
        <el-descriptions-item label="上报时间">{{ detail.ts }}</el-descriptions-item>
      </el-descriptions>
    </el-drawer>
  </ModuleLayout>
</template>

<style scoped>
.active-tip {
  margin: 0 0 var(--space-md);
  color: var(--color-text-muted);
  font-size: 13px;
}

.active-tip b {
  color: var(--color-alarm-1);
  font-family: var(--font-family-num);
  font-size: 16px;
  padding: 0 2px;
}

/* §9.2 AlarmCard 网格：2 列 16px 间距 */
.level-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
}

.left-actions {
  display: flex;
  justify-content: center;
  margin-top: var(--space-md);
}

.alarm-filters {
  display: flex;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

/* 报警列表：卡片网格，超出可滚动但隐藏滚动条（与 dashboard 应急事件一致） */
.alarm-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  max-height: calc(100vh - 420px);
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.alarm-list::-webkit-scrollbar {
  width: 0;
  height: 0;
  background: transparent;
}

.alarm-list :deep(.alarm-list-item) {
  border: 1px solid rgb(148 163 184 / 0.16);
  border-radius: 10px;
  background: linear-gradient(180deg, rgb(15 23 42 / 0.6), rgb(11 17 32 / 0.6));
  transition: border-color 0.15s, background 0.15s;
}

.alarm-list :deep(.alarm-list-item:hover) {
  border-color: rgb(0 212 255 / 0.4);
  background: linear-gradient(180deg, rgb(15 23 42 / 0.7), rgb(11 17 32 / 0.7));
}

.alarm-empty {
  padding: 32px 0;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 14px;
}

.alarm-pager {
  margin-top: var(--space-md);
  justify-content: flex-end;
}
</style>
