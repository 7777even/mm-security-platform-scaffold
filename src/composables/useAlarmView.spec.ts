import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAlarmView } from './useAlarmView';
import { useAlarmStore } from '@/stores/alarm';
import { __setAuditSubmit, __resetAudit } from '@/services/audit';

// 用 hoisted 可变标志控制权限 mock，便于切换「有/无 fire-alarm:ack」分支
const h = vi.hoisted(() => ({ permitted: true }));
vi.mock('@/composables/usePermission', () => ({
  usePermission: () => ({ hasPerm: () => h.permitted }),
}));

function ingest(store: ReturnType<typeof useAlarmStore>, n: number): void {
  for (let i = 0; i < n; i++) {
    store.ingestAlarm({
      alarmId: `a${i}`,
      level: i % 2 === 0 ? 1 : 4,
      type: 'FIRE',
      status: i === 0 ? 'ACTIVE' : 'ACKED',
      deviceCode: `D${i}`,
      location: `L${i}`,
      ts: '2026-08-19T10:00:00Z',
      description: `desc ${i}`,
    });
  }
}

describe('useAlarmView', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    __resetAudit();
  });

  it('pageResult 应用分页与等级/状态筛选', () => {
    const v = useAlarmView();
    ingest(useAlarmStore(), 5);
    expect(v.pageResult.value.total).toBe(5);
    v.levelFilter.value = 4;
    expect(v.pageResult.value.list.every((a) => a.level === 4)).toBe(true);
    v.levelFilter.value = undefined;
    v.statusFilter.value = 'ACTIVE';
    expect(v.pageResult.value.list.map((a) => a.alarmId)).toEqual(['a0']);
  });

  it('ack 成功：更新状态并上报审计，返回 true', async () => {
    const captured: unknown[] = [];
    __setAuditSubmit(async (events) => {
      captured.push(...events);
    });
    const v = useAlarmView();
    ingest(useAlarmStore(), 1);
    const ok = await v.ack('a0');
    expect(ok).toBe(true);
    expect(useAlarmStore().alarms[0]!.status).toBe('ACKED');
    expect(captured).toHaveLength(1);
    expect((captured[0] as { action: string; module: string }).action).toBe('alarm-ack');
    expect((captured[0] as { module: string }).module).toBe('fire-alarm');
  });

  it('无 fire-alarm:ack 权限时 ack 返回 false 且不改状态、不上报', async () => {
    h.permitted = false;
    const captured: unknown[] = [];
    __setAuditSubmit(async (events) => {
      captured.push(...events);
    });
    const v = useAlarmView();
    ingest(useAlarmStore(), 1);
    const ok = await v.ack('a0');
    expect(ok).toBe(false);
    expect(useAlarmStore().alarms[0]!.status).toBe('ACTIVE');
    expect(captured).toHaveLength(0);
    h.permitted = true;
  });
});
