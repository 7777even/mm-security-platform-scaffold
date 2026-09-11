import type { AlarmStatus } from '@/services/alarm';

// 报警状态映射（docs/UI规范-大屏端.md §6 单一真源）：标签 + 着色，状态/报警等级着色只取此处。
// 说明：此项为 UI 展示元数据（含主题色 token），不属业务字典，故保留在前端；
// 列表筛选项（类型/来源/对象类型/对象/状态）已迁至后端字典，由 GET /system/dicts/{dictCode} 提供。
export const ALARM_STATUS_META: Record<AlarmStatus, { label: string; color: string }> = {
  ACTIVE: { label: '待处理', color: 'var(--color-danger)' },
  ACKED: { label: '已确认', color: 'var(--color-warning)' },
  DISPATCHED: { label: '已派单', color: 'var(--color-accent-2)' },
  CLOSED: { label: '已闭环', color: 'var(--color-success)' },
};
