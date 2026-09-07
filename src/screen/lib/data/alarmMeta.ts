import type { AlarmStatus } from '@/services/alarm';

// 报警状态映射（docs/UI规范-大屏端.md §6 单一真源）：标签 + 着色，状态/报警等级着色只取此处。
export const ALARM_STATUS_META: Record<AlarmStatus, { label: string; color: string }> = {
  ACTIVE: { label: '待处理', color: 'var(--color-danger)' },
  ACKED: { label: '已确认', color: 'var(--color-warning)' },
  DISPATCHED: { label: '已派单', color: 'var(--color-accent-2)' },
  CLOSED: { label: '已闭环', color: 'var(--color-success)' },
};

// 消防报警列表筛选项（域词汇，非假数据）。旧 SPA 的 src/components/fire/* 仍引用同名导出，此处为唯一真源。
export const FIRE_ALARM_TYPE_OPTIONS = [
  '全部类型',
  '火灾报警',
  '烟雾报警',
  'GDS报警',
  '设备故障',
] as const;

export const FIRE_ALARM_STATUS_OPTIONS = [
  '全部状态',
  'ACTIVE',
  'ACKED',
  'DISPATCHED',
  'CLOSED',
] as const;

export const FIRE_ALARM_SOURCE_OPTIONS = [
  '全部来源',
  '火灾报警',
  'DCS/GDS',
  '视频识别',
  '人工上报',
] as const;

export const FIRE_ALARM_OBJECT_TYPE_OPTIONS = ['全部类型', '装置', '储罐', '仓库', '管网'] as const;

export const FIRE_ALARM_OBJECT_OPTIONS = [
  '全部对象',
  '蜡油加氢装置',
  '催化裂化装置',
  '重整装置',
  '储罐区B-3',
  '仓储区A库',
  '火炬系统',
] as const;
