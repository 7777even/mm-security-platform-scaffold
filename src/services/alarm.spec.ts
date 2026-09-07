import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchFireAlarmPage, type FireAlarmItem } from './alarm';

vi.mock('@/services/http', () => ({
  request: vi.fn(),
}));

import { request } from '@/services/http';

const ALARM_STATUSES = ['ACTIVE', 'ACKED', 'DISPATCHED', 'CLOSED'] as const;

describe('fetchFireAlarmPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('dev 无 VITE_API_BASE 时回退内置 fixture（不白屏）', async () => {
    vi.stubEnv('VITE_API_BASE', '');
    const res = await fetchFireAlarmPage(1, 10);
    expect(res.list).toHaveLength(10);
    expect(res.total).toBe(50);
    expect(res.page).toBe(1);
    expect(res.size).toBe(10);
    expect(typeof res.list[0]!.alarmId).toBe('string');
    expect(ALARM_STATUSES).toContain(res.list[0]!.status);
  });

  it('分页跨页返回正确切片（alarmId 连续）', async () => {
    vi.stubEnv('VITE_API_BASE', '');
    const res = await fetchFireAlarmPage(2, 10);
    expect(res.list).toHaveLength(10);
    expect(res.list[0]!.alarmId).toBe('11');
    expect(res.list[9]!.alarmId).toBe('20');
  });

  it('有 VITE_API_BASE 时走 request 真实调用（B3 包络）', async () => {
    vi.stubEnv('VITE_API_BASE', 'http://api.example.com');
    const fake: { list: FireAlarmItem[]; total: number; page: number; size: number } = {
      list: [
        {
          alarmId: '999',
          typeLabel: '火灾报警',
          typeTone: 'fire',
          source: '火灾报警',
          objectType: '装置',
          objectName: '测试装置',
          level: '-',
          description: '测试',
          location: '测试位置',
          time: '2026.5.1 10:00:00',
          falseAlarm: '未核实',
          status: 'ACTIVE',
          title: '测试报警',
        },
      ],
      total: 1,
      page: 1,
      size: 10,
    };
    (request as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(fake);
    const res = await fetchFireAlarmPage(1, 10);
    expect(request).toHaveBeenCalledWith({
      url: '/fire-alarms',
      method: 'GET',
      params: { page: 1, size: 10 },
    });
    expect(res).toBe(fake);
  });
});
