// 契约 AlarmItem（后端 /alarms）↔ 大屏本地 AlarmItem（AlarmCard 消费）适配器。
// 后端契约字段为 alarmId/level/type/status/deviceCode/location/ts/...，
// 而 AlarmCard 期望 title/titleColor/source/status/location/time/description 等本地形状，
// 二者存在漂移，此处做单向映射，使真实告警可直喂大屏卡片，无需改动 AlarmCard。
import type { AlarmItem as ScreenAlarmItem } from '@/screen/lib/data/mock';
import type { AlarmItem as ApiAlarmItem, AlarmType, AlarmStatus } from '@/services/alarm';

const TYPE_LABEL: Record<AlarmType, string> = {
  FIRE: '火灾告警',
  GAS: 'GDS报警',
  TEMP: '温度告警',
  CCTV: '视频识别',
  SOS: '应急上报',
};

const SOURCE_LABEL: Record<AlarmType, string> = {
  FIRE: '火灾报警',
  GAS: 'DCS/GDS',
  TEMP: '温度监测',
  CCTV: '视频识别',
  SOS: '应急上报',
};

const STATUS_LABEL: Record<AlarmStatus, string> = {
  ACTIVE: '未处置',
  ACKED: '已确认',
  DISPATCHED: '处置中',
  CLOSED: '已处置',
};

function formatTs(ts?: string): string {
  if (!ts) return '';
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return ts;
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(d.getHours())}:${p(
    d.getMinutes(),
  )}:${p(d.getSeconds())}`;
}

function alarmIdAsNumber(alarmId?: string): number {
  const digits = (alarmId ?? '').replace(/\D/g, '');
  return digits ? Number(digits) : 0;
}

/** 将后端 AlarmItem 映射为大屏 AlarmCard 所需的本地形状（index 仅用于兜底生成数字 id）。 */
export function toScreenAlarm(alarm: ApiAlarmItem, index = 0): ScreenAlarmItem {
  const type = alarm.type ?? 'SOS';
  const level = alarm.level ?? 4;
  const titleColor: ScreenAlarmItem['titleColor'] = level <= 2 ? 'danger' : 'warning';
  return {
    id: alarmIdAsNumber(alarm.alarmId) || index + 1,
    title: alarm.title ?? TYPE_LABEL[type],
    titleColor,
    alarmType: TYPE_LABEL[type],
    source: SOURCE_LABEL[type],
    location: alarm.location ?? '',
    time: formatTs(alarm.ts),
    description: alarm.description ?? '',
    status: STATUS_LABEL[alarm.status ?? 'ACTIVE'],
    rescueEventId: 0,
    monitorId: '',
    monitorLabel: '',
    onsiteMonitorId: '',
    onsiteMonitorLabel: '',
  };
}
