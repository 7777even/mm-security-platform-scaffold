import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fetchMajorHazards,
  fetchMajorHazardDetail,
  fetchMonitoringPoints,
  fetchMonitoringAlarms,
  fetchFacilityDetail,
} from './hazard';

vi.mock('@/services/http', () => ({
  request: vi.fn(),
}));

import { request } from '@/services/http';

const fn = request as unknown as ReturnType<typeof vi.fn>;

describe('hazard 域 fetch（dev 降级 / 真实联调）', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('fetchMajorHazards：dev 回退 fixture 数组 / 真实走 /hazards', async () => {
    vi.stubEnv('VITE_API_BASE', '');
    vi.stubEnv('VITE_USE_DEV_MOCK', 'true');
    const res = await fetchMajorHazards();
    expect(Array.isArray(res)).toBe(true);
    expect(res.length).toBeGreaterThan(0);
    vi.stubEnv('VITE_API_BASE', 'http://api.example.com');
    const fake = [] as unknown[];
    fn.mockResolvedValue(fake);
    await fetchMajorHazards();
    expect(fn).toHaveBeenCalledWith({ url: '/hazards', method: 'GET' });
  });

  it('fetchMajorHazardDetail：dev 返回合成详情 / 真实走 /hazards/:id', async () => {
    vi.stubEnv('VITE_API_BASE', '');
    vi.stubEnv('VITE_USE_DEV_MOCK', 'true');
    const res = await fetchMajorHazardDetail(1);
    expect(res).toBeTruthy();
    vi.stubEnv('VITE_API_BASE', 'http://api.example.com');
    const fake = { id: 1 };
    fn.mockResolvedValue(fake);
    await fetchMajorHazardDetail(1);
    expect(fn).toHaveBeenCalledWith({ url: '/hazards/1', method: 'GET' });
  });

  it('fetchMonitoringPoints：dev 回退 fixture / 真实走 /monitoring/points', async () => {
    vi.stubEnv('VITE_API_BASE', '');
    vi.stubEnv('VITE_USE_DEV_MOCK', 'true');
    expect(Array.isArray(await fetchMonitoringPoints())).toBe(true);
    vi.stubEnv('VITE_API_BASE', 'http://api.example.com');
    fn.mockResolvedValue([]);
    await fetchMonitoringPoints();
    expect(fn).toHaveBeenCalledWith({ url: '/monitoring/points', method: 'GET' });
  });

  it('fetchMonitoringAlarms：dev 回退 fixture / 真实走 /monitoring/alarms', async () => {
    vi.stubEnv('VITE_API_BASE', '');
    vi.stubEnv('VITE_USE_DEV_MOCK', 'true');
    expect(Array.isArray(await fetchMonitoringAlarms())).toBe(true);
    vi.stubEnv('VITE_API_BASE', 'http://api.example.com');
    fn.mockResolvedValue([]);
    await fetchMonitoringAlarms();
    expect(fn).toHaveBeenCalledWith({ url: '/monitoring/alarms', method: 'GET' });
  });

  it('fetchFacilityDetail：dev 返回合成详情 / 真实走 /facilities/detail', async () => {
    vi.stubEnv('VITE_API_BASE', '');
    vi.stubEnv('VITE_USE_DEV_MOCK', 'true');
    const res = await fetchFacilityDetail('某装置');
    expect(res).toBeTruthy();
    vi.stubEnv('VITE_API_BASE', 'http://api.example.com');
    const fake = { name: '某装置' };
    fn.mockResolvedValue(fake);
    await fetchFacilityDetail('某装置');
    expect(fn).toHaveBeenCalledWith({ url: '/facilities/detail', method: 'GET' });
  });
});
