import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fetchPatrolCameras,
  fetchGateControls,
  fetchBollards,
  fetchVehicleSearch,
  fetchPersonSearch,
  fetchSecurityTrackTimeline,
  fetchSecurityTrackSummary,
  fetchVehicleSearchDetail,
  fetchPersonSearchDetail,
  fetchLatestPerimeterAlarm,
  fetchPerimeterAlarm,
  fetchPerimeterAlarmSnapshotUrl,
  updatePerimeterAlarm,
  createPerimeterAlarm,
  fetchPerimeterAlarms,
  deletePerimeterAlarm,
  touchPerimeterAlarmChanged,
  countPlayableCameras,
  createPersonSearch,
  updatePersonSearch,
  deletePersonSearch,
  createVehicleSearch,
  updateVehicleSearch,
  deleteVehicleSearch,
  createGateControl,
  updateGateControl,
  deleteGateControl,
  createBollard,
  updateBollard,
  deleteBollard,
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
    vi.stubEnv('VITE_USE_DEV_MOCK', 'true');
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
    vi.stubEnv('VITE_USE_DEV_MOCK', 'true');
    expect((await fetchGateControls()).length).toBe(11);
    vi.stubEnv('VITE_API_BASE', 'http://api.example.com');
    const fake = [] as unknown[];
    fn.mockResolvedValue(fake);
    await fetchGateControls();
    expect(fn).toHaveBeenCalledWith({ url: '/security/gate-controls', method: 'GET' });
  });

  it('fetchBollards：dev 回退 fixture / 真实走 /security/bollards', async () => {
    vi.stubEnv('VITE_API_BASE', '');
    vi.stubEnv('VITE_USE_DEV_MOCK', 'true');
    expect((await fetchBollards()).length).toBe(11);
    vi.stubEnv('VITE_API_BASE', 'http://api.example.com');
    fn.mockResolvedValue([]);
    await fetchBollards();
    expect(fn).toHaveBeenCalledWith({ url: '/security/bollards', method: 'GET' });
  });

  it('fetchVehicleSearch：dev 回退 fixture / 真实走 /security/search/vehicle', async () => {
    vi.stubEnv('VITE_API_BASE', '');
    vi.stubEnv('VITE_USE_DEV_MOCK', 'true');
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
    vi.stubEnv('VITE_USE_DEV_MOCK', 'true');
    expect(Array.isArray(await fetchPersonSearch())).toBe(true);
    vi.stubEnv('VITE_API_BASE', 'http://api.example.com');
    fn.mockResolvedValue([]);
    await fetchPersonSearch();
    expect(fn).toHaveBeenCalledWith({ url: '/security/search/person', method: 'GET' });
  });

  it('fetchSecurityEvents：dev 回退 fixture / 真实走 /security/events', async () => {
    vi.stubEnv('VITE_API_BASE', '');
    vi.stubEnv('VITE_USE_DEV_MOCK', 'true');
    const dev = await fetchSecurityEvents();
    expect(Array.isArray(dev)).toBe(true);
    expect(dev.length).toBeGreaterThan(0);
    vi.stubEnv('VITE_API_BASE', 'http://api.example.com');
    fn.mockResolvedValue([]);
    await fetchSecurityEvents();
    expect(fn).toHaveBeenCalledWith({ url: '/security/events', method: 'GET' });
  });
});

describe('security 其余函数（真实联调路径覆盖，2026-10-05 覆盖率修复）', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('VITE_API_BASE', 'http://api.example.com');
    vi.stubEnv('VITE_USE_DEV_MOCK', 'false');
    fn.mockResolvedValue([]);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  const real = async (_label: string, p: Promise<unknown>): Promise<void> => {
    await p;
    expect(fn).toHaveBeenCalled();
  };

  it('securityTrack 时间线/汇总', async () => {
    await real('timeline', fetchSecurityTrackTimeline({} as never));
    await real('summary', fetchSecurityTrackSummary({} as never));
  });

  it('车辆/人员检索详情与列表', async () => {
    await real('vehicleSearchDetail', fetchVehicleSearchDetail(1));
    await real('personSearchDetail', fetchPersonSearchDetail(1));
    await real('vehicleSearch', fetchVehicleSearch('粤K'));
    await real('personSearch', fetchPersonSearch('张三'));
  });

  it('周界报警 详情/列表/最新/快照', async () => {
    await real('latest', fetchLatestPerimeterAlarm());
    await real('detail', fetchPerimeterAlarm(1));
    await real('snapshot', fetchPerimeterAlarmSnapshotUrl(1));
    await real('list', fetchPerimeterAlarms());
  });

  it('周界报警 写端点（增改删）', async () => {
    await real('create', createPerimeterAlarm({} as never));
    await real('update', updatePerimeterAlarm(1, {} as never));
    await real('delete', deletePerimeterAlarm(1));
  });

  it('touchPerimeterAlarmChanged 与 countPlayableCameras 纯函数', async () => {
    expect(() => touchPerimeterAlarmChanged()).not.toThrow();
    expect(countPlayableCameras([])).toBe(0);
    expect(
      countPlayableCameras([
        { id: 1, name: 'c', zone: 'z', status: '正常', longitude: 1, latitude: 1 },
        { id: 2, name: 'c2', zone: 'z', status: '离线', longitude: 1, latitude: 1 },
      ] as never),
    ).toBe(1);
  });

  it('人/车/门禁/防撞柱 写端点（增改删）', async () => {
    await real('createPerson', createPersonSearch({} as never));
    await real('updatePerson', updatePersonSearch(1, {} as never));
    await real('deletePerson', deletePersonSearch(1));
    await real('createVehicle', createVehicleSearch({} as never));
    await real('updateVehicle', updateVehicleSearch(1, {} as never));
    await real('deleteVehicle', deleteVehicleSearch(1));
    await real('createGate', createGateControl({} as never));
    await real('updateGate', updateGateControl(1, {} as never));
    await real('deleteGate', deleteGateControl(1));
    await real('createBollard', createBollard({} as never));
    await real('updateBollard', updateBollard(1, {} as never));
    await real('deleteBollard', deleteBollard(1));
  });
});
