import type { AlarmLevel, AlarmStatus, AlarmType } from '@/services/alarm';

/** 报警类型中文标签（统一映射，禁止直接展示后端枚举原始值） */
export const ALARM_TYPE_LABEL: Record<AlarmType, string> = {
  FIRE: '火灾',
  GAS: '可燃气体',
  TEMP: '温度',
  CCTV: '视频',
  SOS: '紧急呼叫',
};

/** 报警状态中文文案（全局唯一口径，应急指挥与消防报警共用） */
export const ALARM_STATUS_TEXT: Record<AlarmStatus, string> = {
  ACTIVE: '未处置',
  ACKED: '已确认',
  DISPATCHED: '已派单',
  CLOSED: '已闭环',
};

/** 报警等级中文文案 */
export const ALARM_LEVEL_TEXT: Record<AlarmLevel, string> = {
  1: '一级',
  2: '二级',
  3: '三级',
  4: '四级',
};

/** 报警等级对应色阶 token（var(--color-alarm-N)） */
export function alarmLevelColor(level: AlarmLevel): string {
  return `var(--color-alarm-${level})`;
}

/** 统一时间格式化：YYYY-MM-DD HH:mm:ss */
export function formatAlarmTs(ts: string): string {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return ts;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(
    d.getMinutes(),
  )}:${pad(d.getSeconds())}`;
}
