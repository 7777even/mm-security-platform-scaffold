import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fetchPatrolCameras,
  fetchGateControls,
  fetchBollards,
  fetchVehicleSearch,
  fetchPersonSearch,
} from './security';
import { fetchSecurityEvents } from './securityEventStore';

vi.mock('@/services/http', () => ({
  request: vi.fn(),
}));

import { request } from '@/services/http';

const fn = request as unknown as ReturnType<typeof vi.fn>;

describe('security 域 fetch（dev 降级 / 真实联调）', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('fetchPatrolCameras：dev 无 VITE_API_BASE 回退 fixture 数组', async () => {
    vi.stubEnv('VITE_API_BASE', '');
    const res = await fetchPatrolCameras();
    expect(Array.isArray(res)).toBe(true);
    expect(res.length).toBe(25);
  });

  it('fetchPatrolCameras：有 VITE_API_BASE 走 request 真实调用', async () => {
    vi.stubEnv('VITE_API_BASE', 'http://api.example.com');
    const fake = [{ id: 1, name: 'c1', zone: 'z', status: '正常', longitude: 0, latitude: 0 }];
    fn.mockResolvedValue(fake);
    const res = await fetchPatrolCameras();
    expect(fn).toHaveBeenCalledWith({ url: '/security/patrol-cameras', method: 'GET' });
    expect(res).toBe(fake);
  });

  it('fetchGateControls：dev 回退 fixture / 真实走 /security/gate-controls', async () => {
    vi.stubEnv('VITE_API_BASE', '');
    expect((await fetchGateControls()).length).toBe(11);
    vi.stubEnv('VITE_API_BASE', 'http://api.example.com');
    const fake = [] as unknown[];
    fn.mockResolvedValue(fake);
    await fetchGateControls();
    expect(fn).toHaveBeenCalledWith({ url: '/security/gate-controls', method: 'GET' });
  });

  it('fetchBollards：dev 回退 fixture / 真实走 /security/bollards', async () => {
    vi.stubEnv('VITE_API_BASE', '');
    expect((await fetchBollards()).length).toBe(11);
    vi.stubEnv('VITE_API_BASE', 'http://api.example.com');
    fn.mockResolvedValue([]);
    await fetchBollards();
    expect(fn).toHaveBeenCalledWith({ url: '/security/bollards', method: 'GET' });
  });

  it('fetchVehicleSearch：dev 回退 fixture / 真实走 /security/search/vehicle', async () => {
    vi.stubEnv('VITE_API_BASE', '');
    expect(Array.isArray(await fetchVehicleSearch())).toBe(true);
    vi.stubEnv('VITE_API_BASE', 'http://api.example.com');
    const fake = [] as unknown[];
    fn.mockResolvedValue(fake);
    await fetchVehicleSearch();
    expect(fn).toHaveBeenCalledWith({ url: '/security/search/vehicle', method: 'GET' });
  });

  it('fetchVehicleSearch：带 keyword 时以 params 透传后端检索', async () => {
    vi.stubEnv('VITE_API_BASE', 'http://api.example.com');
    fn.mockResolvedValue([]);
    await fetchVehicleSearch('粤K');
    expect(fn).toHaveBeenCalledWith({
      url: '/security/search/vehicle',
      method: 'GET',
      params: { keyword: '粤K' },
    });
  });

  it('fetchPersonSearch：dev 回退 fixture / 真实走 /security/search/person', async () => {
    vi.stubEnv('VITE_API_BASE', '');
    expect(Array.isArray(await fetchPersonSearch())).toBe(true);
    vi.stubEnv('VITE_API_BASE', 'http://api.example.com');
    fn.mockResolvedValue([]);
    await fetchPersonSearch();
    expect(fn).toHaveBeenCalledWith({ url: '/security/search/person', method: 'GET' });
  });

  it('fetchSecurityEvents：dev 回退 fixture / 真实走 /security/events', async () => {
    vi.stubEnv('VITE_API_BASE', '');
    const dev = await fetchSecurityEvents();
    expect(Array.isArray(dev)).toBe(true);
    expect(dev.length).toBeGreaterThan(0);
    vi.stubEnv('VITE_API_BASE', 'http://api.example.com');
    fn.mockResolvedValue([]);
    await fetchSecurityEvents();
    expect(fn).toHaveBeenCalledWith({ url: '/security/events', method: 'GET' });
  });
});
