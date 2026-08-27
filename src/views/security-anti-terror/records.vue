<!--
  治安防恐 · 门禁事件记录（二级页面）
  出入/门禁事件完整列表：方向/通道筛选 + 关键字搜索 + 分页 + 详情抽屉
  数据源：services/securityEventStore（in-memory mock）
-->
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import PanelCard from '@/components/common/PanelCard.vue';
import AppButton from '@/components/common/AppButton.vue';
import { fetchSecurityEvents } from '@/services/securityEventStore';
import type { SecurityEvent, AccessDirection, AccessLevel } from '@/services/securityEventStore';

// embedded: 由所属模块主壳内联预览（覆盖层）承载时为真，此时「返回」改为关闭预览而非路由跳转
const props = defineProps<{ embedded?: boolean }>();
const emit = defineEmits<{ close: [] }>();

const router = useRouter();
const events = ref<SecurityEvent[]>([]);
const loading = ref(true);
const keyword = ref('');
const directionFilter = ref<AccessDirection | ''>('');
const viewing = ref<SecurityEvent | null>(null);
const viewingVisible = computed(() => viewing.value !== null);

const DIRECTIONS: Array<{ value: AccessDirection; label: string }> = [
  { value: '进', label: '进厂' },
  { value: '出', label: '出厂' },
];

const LEVEL_TEXT: Record<AccessLevel, string> = { 1: '正常', 2: '关注', 3: '异常' };

const filtered = computed(() => {
  const k = keyword.value.trim().toLowerCase();
  return events.value.filter((e) => {
    if (directionFilter.value && e.direction !== directionFilter.value) return false;
    if (!k) return true;
    return (
      e.person.toLowerCase().includes(k) ||
      e.channel.toLowerCase().includes(k) ||
      e.cardId.toLowerCase().includes(k) ||
      e.vehicle.toLowerCase().includes(k)
    );
  });
});

function formatTs(ts: string): string {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return ts;
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function goBack(): void {
  if (props.embedded) {
    emit('close');
    return;
  }
  router.push('/security-anti-terror');
}

onMounted(async () => {
  try {
    events.value = await fetchSecurityEvents();
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <PanelCard title="门禁事件记录" icon="Key" class="records-page">
    <div class="records-toolbar">
      <el-input
        v-model="keyword"
        placeholder="搜索 人员 / 通道 / 卡号 / 车辆"
        clearable
        style="width: 240px"
      />
      <el-select v-model="directionFilter" placeholder="全部方向" clearable style="width: 140px">
        <el-option v-for="d in DIRECTIONS" :key="d.value" :label="d.label" :value="d.value" />
      </el-select>
      <div class="records-toolbar__spacer" />
      <AppButton variant="ghost" size="sm" @click="goBack">{{
        props.embedded ? '关闭' : '返回'
      }}</AppButton>
    </div>

    <el-table
      v-if="!loading"
      :data="filtered"
      stripe
      class="records-table"
      max-height="calc(100vh - 260px)"
      @row-click="viewing = $event"
    >
      <el-table-column prop="eventId" label="事件编号" width="140" />
      <el-table-column label="时间" width="180">
        <template #default="{ row }">{{ formatTs(row.ts) }}</template>
      </el-table-column>
      <el-table-column label="方向" width="80">
        <template #default="{ row }">{{ row.direction }}</template>
      </el-table-column>
      <el-table-column prop="person" label="人员" width="120" />
      <el-table-column prop="cardId" label="卡号" width="160" />
      <el-table-column prop="channel" label="通道" min-width="140" />
      <el-table-column prop="vehicle" label="车辆" width="140" />
      <el-table-column label="级别" width="90">
        <template #default="{ row }">
          <el-tag
            size="small"
            :type="row.level === 3 ? 'danger' : row.level === 2 ? 'warning' : 'success'"
          >
            {{ LEVEL_TEXT[row.level as AccessLevel] }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
    <p v-else class="records-empty">门禁事件加载中…</p>
    <p v-if="!loading && filtered.length === 0" class="records-empty">暂无符合条件的记录</p>

    <el-drawer
      v-model="viewingVisible"
      title="门禁事件详情"
      direction="rtl"
      size="400px"
      @close="viewing = null"
    >
      <dl v-if="viewing" class="detail-view">
        <div class="detail-view__row">
          <dt>事件编号</dt>
          <dd class="font-number">{{ viewing.eventId }}</dd>
        </div>
        <div class="detail-view__row">
          <dt>时间</dt>
          <dd class="font-number">{{ formatTs(viewing.ts) }}</dd>
        </div>
        <div class="detail-view__row">
          <dt>方向</dt>
          <dd>{{ viewing.direction }}</dd>
        </div>
        <div class="detail-view__row">
          <dt>人员</dt>
          <dd>{{ viewing.person }}</dd>
        </div>
        <div class="detail-view__row">
          <dt>卡号</dt>
          <dd class="font-number">{{ viewing.cardId }}</dd>
        </div>
        <div class="detail-view__row">
          <dt>通道</dt>
          <dd>{{ viewing.channel }}</dd>
        </div>
        <div class="detail-view__row">
          <dt>车辆</dt>
          <dd>{{ viewing.vehicle || '—' }}</dd>
        </div>
        <div class="detail-view__row">
          <dt>级别</dt>
          <dd>{{ LEVEL_TEXT[viewing.level] }}</dd>
        </div>
      </dl>
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

.records-empty {
  text-align: center;
  color: var(--color-text-muted, #94a3b8);
  font-size: 13px;
  padding: 32px 0;
}

/* 详情抽屉：项目自定义深色描述布局（对齐 §5.3 详情抽屉 + dashboard .crud-view 风格） */
.detail-view {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin: 0;
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md, 10px);
  overflow: hidden;
  background: var(--glass-bg);
}

.detail-view__row {
  display: grid;
  grid-template-columns: 96px 1fr;
  align-items: center;
  gap: 12px;
  min-height: 42px;
  padding: 0 14px;
  border-bottom: 1px dashed var(--glass-border);
  font-size: 13px;
}

.detail-view__row:last-child {
  border-bottom: none;
}

.detail-view__row:nth-child(even) {
  background: var(--row-alt-bg);
}

.detail-view dt {
  color: var(--color-text-muted, #94a3b8);
  font-size: 12px;
}

.detail-view dd {
  margin: 0;
  color: var(--color-text);
  text-align: right;
}
</style>
