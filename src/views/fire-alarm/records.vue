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
import { ALARM_LEVEL_TEXT, ALARM_STATUS_TEXT, ALARM_TYPE_LABEL } from '@/composables/useAlarmMeta';
import type { AlarmItem, AlarmLevel, AlarmStatus, AlarmType } from '@/services/alarm';

// embedded: 由所属模块主壳内联预览（覆盖层）承载时为真，此时「返回」改为关闭预览而非路由跳转
const props = defineProps<{ embedded?: boolean }>();
const emit = defineEmits<{ close: [] }>();

const router = useRouter();
const { page, size, levelFilter, statusFilter, detail, pageResult, refresh, openDetail, ack } =
  useAlarmView();

const keyword = ref('');
const detailVisible = computed(() => detail.value !== null);

const LEVELS: AlarmLevel[] = [1, 2, 3, 4];
const STATUSES: AlarmStatus[] = ['ACTIVE', 'ACKED', 'DISPATCHED', 'CLOSED'];
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

async function onAck(row: AlarmItem): Promise<void> {
  const ok = await ack(row.alarmId);
  if (ok) ElMessage.success(`已确认报警 ${row.alarmId}`);
  else ElMessage.warning('无确认权限或状态不可确认');
}

function goBack(): void {
  if (props.embedded) {
    emit('close');
    return;
  }
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
        <el-option v-for="l in LEVELS" :key="l" :label="ALARM_LEVEL_TEXT[l]" :value="l" />
      </el-select>
      <el-select v-model="statusFilter" placeholder="全部状态" clearable style="width: 140px">
        <el-option v-for="s in STATUSES" :key="s" :label="ALARM_STATUS_TEXT[s]" :value="s" />
      </el-select>
      <div class="records-toolbar__spacer" />
      <AppButton variant="ghost" size="sm" @click="goBack">{{
        props.embedded ? '关闭' : '返回'
      }}</AppButton>
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
          <el-tag
            size="small"
            :type="row.level === 1 ? 'success' : row.level === 2 ? 'warning' : 'danger'"
          >
            {{ ALARM_LEVEL_TEXT[row.level as AlarmLevel] }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="类型" width="120">
        <template #default="{ row }">{{ ALARM_TYPE_LABEL[row.type as AlarmType] }}</template>
      </el-table-column>
      <el-table-column label="状态" width="110">
        <template #default="{ row }">
          <span class="records-status" :class="`is-${row.status}`">
            {{ ALARM_STATUS_TEXT[row.status as AlarmStatus] }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="deviceCode" label="设备编码" width="140" />
      <el-table-column prop="location" label="位置" min-width="180" show-overflow-tooltip />
      <el-table-column label="上报时间" width="180">
        <template #default="{ row }">{{ formatAlarmTs(row.ts) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click.stop="openDetail(row as AlarmItem)"
            >详情</el-button
          >
          <el-button
            link
            type="success"
            size="small"
            :disabled="row.status !== 'ACTIVE'"
            @click.stop="onAck(row as AlarmItem)"
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

    <el-dialog v-model="detailVisible" title="报警详情" width="460px" append-to-body>
      <AlarmDetailView v-if="detail" :alarm="detail" @ack="onAck" @close="detailVisible = false" />
    </el-dialog>
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
  font-size: var(--font-size-helper);
}

.records-status.is-ACTIVE {
  color: var(--color-alarm-1);
}

.records-status.is-ACKED {
  color: var(--color-warning);
}

.records-status.is-DISPATCHED {
  color: var(--color-accent);
}

.records-status.is-CLOSED {
  color: var(--color-success);
}

.records-pager {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--space-md);
}
</style>
