import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAlarmStore } from './alarm';
import type { AlarmItem, AlarmStatus } from '@/services/alarm';

function makeAlarm(over: Partial<AlarmItem> = {}): AlarmItem {
  return {
    alarmId: 'a1',
    level: 1,
    type: 'FIRE',
    status: 'ACTIVE',
    deviceCode: 'DEV-01',
    location: 'A 栋 3F',
    ts: '2026-08-19T10:00:00Z',
    description: '烟雾浓度超限',
    ...over,
  };
}

describe('useAlarmStore', () => {
  beforeEach(() => setActivePinia(createPinia()));

  it('ingestAlarm 追加并去重（同 alarmId 仅保留最新）', () => {
    const s = useAlarmStore();
    s.ingestAlarm(makeAlarm({ alarmId: 'x', status: 'ACTIVE' }));
    s.ingestAlarm(makeAlarm({ alarmId: 'y', status: 'ACTIVE' }));
    s.ingestAlarm(makeAlarm({ alarmId: 'x', status: 'ACKED' }));
    expect(s.alarms).toHaveLength(2);
    expect(s.alarms.find((a) => a.alarmId === 'x')?.status).toBe('ACKED');
  });

  it('分页切片按 page/size 返回', () => {
    const s = useAlarmStore();
    for (let i = 0; i < 5; i++) s.ingestAlarm(makeAlarm({ alarmId: `id${i}` }));
    const page2 = s.paged({ page: 2, size: 2 });
    expect(page2.list).toHaveLength(2);
    expect(page2.total).toBe(5);
    expect(page2.list.every((a) => a.alarmId === 'id2' || a.alarmId === 'id3')).toBe(true);
  });

  it('等级/状态筛选（undefined 表示不过滤）', () => {
    const s = useAlarmStore();
    s.ingestAlarm(makeAlarm({ alarmId: '1', level: 1, status: 'ACTIVE' }));
    s.ingestAlarm(makeAlarm({ alarmId: '2', level: 4, status: 'ACKED' }));
    s.ingestAlarm(makeAlarm({ alarmId: '3', level: 4, status: 'ACTIVE' }));
    expect(s.paged({ page: 1, size: 10, level: 4 }).list.map((a) => a.alarmId)).toEqual(['2', '3']);
    expect(s.paged({ page: 1, size: 10, status: 'ACTIVE' }).list.map((a) => a.alarmId)).toEqual([
      '1',
      '3',
    ]);
  });

  it('ack 状态机：ACTIVE→ACKED→DISPATCHED→CLOSED，非法/重复跃迁忽略', () => {
    const s = useAlarmStore();
    s.ingestAlarm(makeAlarm({ alarmId: 'k', status: 'ACTIVE' }));
    expect(s.ack('k', 'DISPATCHED')).toBe(false);
    expect(s.ack('k', 'ACKED')).toBe(true);
    expect(s.ack('k', 'ACKED')).toBe(false); // 重复跃迁无效
    expect(s.ack('k', 'DISPATCHED')).toBe(true);
    expect(s.ack('k', 'CLOSED')).toBe(true);
    expect(s.alarms.find((a) => a.alarmId === 'k')?.status as AlarmStatus).toBe('CLOSED');
  });

  it('ack 不存在的 alarmId 返回 false', () => {
    const s = useAlarmStore();
    expect(s.ack('nope', 'ACKED')).toBe(false);
  });
});
