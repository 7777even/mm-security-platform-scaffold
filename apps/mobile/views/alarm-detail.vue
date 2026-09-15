<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import MobileHeader from '../components/MobileHeader.vue';
import type { AlarmLevel, AlarmStatus, AlarmType } from '@/services/alarm';
import { liveAlarms } from '../data/liveCache';

// 告警详情（详情页模板，docs/UI规范-移动端.md §5 / §5.1）
// 数据源：列表页 /alarms 拉取后写入 liveAlarms 缓存（后端无按 id 详情端点），
// 本页按路由 id 从缓存读取；深链 / 刷新无缓存时降级为「未找到」空态。
// - 只读详情用 .mb-detail 分组卡（标签左 / 值右），行高 48 保证可读
// - 主操作「一键确认」唯一（§4 一屏一个主按钮），次操作用白底描边

const route = useRoute();

const alarm = computed(() => liveAlarms.items.find((a) => a.alarmId === String(route.params.id)));

const LEVEL_LABEL: Record<AlarmLevel, string> = { 1: '一级', 2: '二级', 3: '三级', 4: '四级' };
const LEVEL_TAG: Record<AlarmLevel, string> = {
  1: 'tag--danger',
  2: 'tag--warning',
  3: 'tag--warning',
  4: 'tag--info',
};
const TYPE_LABEL: Record<AlarmType, string> = {
  FIRE: '消防报警',
  GAS: '气体报警',
  TEMP: '温度报警',
  CCTV: '视频AI',
  SOS: 'SOS 求助',
};
const STATUS_LABEL: Record<AlarmStatus, string> = {
  ACTIVE: '未确认',
  ACKED: '已确认',
  DISPATCHED: '已派发',
  CLOSED: '已关闭',
};
const STATUS_TAG: Record<AlarmStatus, string> = {
  ACTIVE: 'tag--danger',
  ACKED: 'tag--warning',
  DISPATCHED: 'tag--warning',
  CLOSED: 'tag--success',
};

/** 报警时间：后端 ts 为 ISO 8601，按 mgmt 告警记录同口径格式化为本地 YYYY-MM-DD HH:mm。 */
function formatTs(ts?: string): string {
  if (!ts) return '—';
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return ts;
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

const timeText = computed(() => (alarm.value ? formatTs(alarm.value.ts) : ''));

const levelText = computed(() => (alarm.value ? (LEVEL_LABEL[alarm.value.level] ?? '') : ''));
const levelTag = computed(() => (alarm.value ? (LEVEL_TAG[alarm.value.level] ?? 'tag--info') : ''));
const typeText = computed(() =>
  alarm.value ? (TYPE_LABEL[alarm.value.type] ?? alarm.value.type) : '',
);
const statusText = computed(() =>
  alarm.value ? (STATUS_LABEL[alarm.value.status] ?? alarm.value.status) : '',
);
const statusTag = computed(() =>
  alarm.value ? (STATUS_TAG[alarm.value.status] ?? 'tag--info') : 'tag--info',
);

/** 确认 / 处置反馈：后端暂未提供对应端点，先给出明确提示（不伪造成功）。 */
function onAction(name: string) {
  ElMessage.info(`${name}待后端接口支持`);
}
</script>

<template>
  <div class="mb-page">
    <MobileHeader variant="back" title="告警详情" back-to="/alarms" />

    <div v-if="!alarm" class="mb-empty">
      <div class="mb-empty__art" />
      <p class="mb-empty__text">未找到该告警（请从列表进入）</p>
    </div>

    <div v-else class="mb-stack">
      <div class="mb-card">
        <div class="mb-card__title">
          <span>{{ alarm.title ?? alarm.description ?? alarm.alarmId }}</span>
          <span class="tag" :class="levelTag">{{ levelText }}</span>
        </div>
        <p class="mb-card__desc">{{ alarm.alarmId }} · {{ timeText }} · {{ typeText }}</p>
      </div>

      <div class="mb-detail">
        <div class="mb-detail__row">
          <span class="mb-detail__label">来源 / 设备</span>
          <span class="mb-detail__value">{{ alarm.deviceCode }}</span>
        </div>
        <div class="mb-detail__row">
          <span class="mb-detail__label">所在区域</span>
          <span class="mb-detail__value">{{ alarm.location }}</span>
        </div>
        <div class="mb-detail__row">
          <span class="mb-detail__label">告警简述</span>
          <span class="mb-detail__value">{{ alarm.description }}</span>
        </div>
        <div class="mb-detail__row">
          <span class="mb-detail__label">处置状态</span>
          <span class="mb-detail__value">
            <span class="tag" :class="statusTag">{{ statusText }}</span>
          </span>
        </div>
      </div>

      <button type="button" class="mb-btn-primary mb-btn-block" @click="onAction('一键确认')">
        一键确认
      </button>
      <button type="button" class="mb-btn-ghost mb-btn-block" @click="onAction('处置反馈')">
        处置反馈
      </button>
    </div>
  </div>
</template>
