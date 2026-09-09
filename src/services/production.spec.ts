import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fetchProductionOverview,
  fetchProductionAlarms,
  fetchProductionRiskWarnings,
  fetchProductionPersonnel,
  fetchProductionAreaDetail,
  fetchProductionDevices,
} from './production';

vi.mock('@/services/http', () => ({
  request: vi.fn(),
}));

import { request } from '@/services/http';

const mockRequest = request as unknown as ReturnType<typeof vi.fn>;

describe('production 服务（暴露式降级：后端缺口不得被假数据掩盖）', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('无 VITE_API_BASE 时回落 dev fixture（纯静态演示，不误判后端就绪）', async () => {
    vi.stubEnv('VITE_API_BASE', '');
    const overview = await fetchProductionOverview();
    expect(overview.facilities).toHaveLength(5);
    expect(overview.devices).toHaveLength(7);
    expect(overview.stats.length).toBeGreaterThan(0);
    expect(overview.riskSummary).toEqual({ red: 2, orange: 3, yellow: 2 });
  });

  it('有 VITE_API_BASE 时走真实端点', async () => {
    vi.stubEnv('VITE_API_BASE', 'http://api.example.com');
    mockRequest.mockResolvedValue([]);

    await fetchProductionOverview();
    await fetchProductionAlarms();
    await fetchProductionRiskWarnings();
    await fetchProductionPersonnel();
    await fetchProductionAreaDetail(2);
    await fetchProductionDevices();

    expect(mockRequest).toHaveBeenCalledWith({ url: '/production/overview', method: 'GET' });
    expect(mockRequest).toHaveBeenCalledWith({
      url: '/production/alarms',
      method: 'GET',
      params: undefined,
    });
    expect(mockRequest).toHaveBeenCalledWith({ url: '/production/risk-warnings', method: 'GET' });
    expect(mockRequest).toHaveBeenCalledWith({ url: '/production/personnel', method: 'GET' });
    expect(mockRequest).toHaveBeenCalledWith({ url: '/production/areas/2', method: 'GET' });
    expect(mockRequest).toHaveBeenCalledWith({
      url: '/production/devices',
      method: 'GET',
      params: { page: 1, size: 10, category: undefined, status: undefined },
    });
  });

  it('装置区详情带 facilityId 过滤 alarm 时透传查询参数', async () => {
    vi.stubEnv('VITE_API_BASE', 'http://api.example.com');
    mockRequest.mockResolvedValue([]);
    await fetchProductionAlarms(3);
    expect(mockRequest).toHaveBeenCalledWith({
      url: '/production/alarms',
      method: 'GET',
      params: { facilityId: 3 },
    });
  });

  it('设备分页按过滤条件透传 category/status/page/size', async () => {
    vi.stubEnv('VITE_API_BASE', 'http://api.example.com');
    mockRequest.mockResolvedValue({ page: 2, size: 5, total: 12, items: [] });
    const page = await fetchProductionDevices({
      category: '监测点',
      status: '正常',
      page: 2,
      size: 5,
    });
    expect(mockRequest).toHaveBeenCalledWith({
      url: '/production/devices',
      method: 'GET',
      params: { page: 2, size: 5, category: '监测点', status: '正常' },
    });
    expect(page).toEqual({ page: 2, size: 5, total: 12, items: [] });
  });

  it('响应结构不符契约时返回空态并告警（不静默回落 fixture）', async () => {
    vi.stubEnv('VITE_API_BASE', 'http://api.example.com');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockRequest.mockResolvedValue('not-an-object');

    const overview = await fetchProductionOverview();
    const alarms = await fetchProductionAlarms();
    const detail = await fetchProductionAreaDetail(9);

    expect(overview.facilities).toEqual([]);
    expect(alarms).toEqual([]);
    expect(detail.facilityId).toBe(9);
    expect(detail.alarms).toEqual([]);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('请求失败时降级为空态并告警', async () => {
    vi.stubEnv('VITE_API_BASE', 'http://api.example.com');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockRequest.mockRejectedValue(new Error('network down'));

    const personnel = await fetchProductionPersonnel();
    const devices = await fetchProductionDevices();

    expect(personnel).toEqual([]);
    expect(devices).toEqual({ page: 1, size: 10, total: 0, items: [] });
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('总览字段缺失的条目被丢弃并告警', async () => {
    vi.stubEnv('VITE_API_BASE', 'http://api.example.com');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockRequest.mockResolvedValue({
      facilities: [{ id: 1, name: '厂区', count: 596, image: 'a.png' }, { name: '缺 id' }],
      devices: [],
      stats: [],
      riskSummary: { red: 1, orange: 0, yellow: 0 },
    });

    const overview = await fetchProductionOverview();
    expect(overview.facilities).toHaveLength(1);
    expect(overview.riskSummary.red).toBe(1);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
