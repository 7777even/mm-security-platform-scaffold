import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchTyphoonIncident, fetchTyphoonDispatchResources } from './typhoonEmergency';

vi.mock('@/services/http', () => ({
  request: vi.fn(),
}));

import { request } from '@/services/http';
import { resetBackendOfflineNoticesForTest } from './backendFallback';

const mockRequest = request as unknown as ReturnType<typeof vi.fn>;

describe('typhoonEmergency 服务（暴露式降级：后端缺口不得被假数据掩盖）', () => {
  beforeEach(() => {
    resetBackendOfflineNoticesForTest();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('离线演示（无 VITE_API_BASE + VITE_USE_DEV_MOCK=true）时回落本地 fixture', async () => {
    vi.stubEnv('VITE_API_BASE', '');
    vi.stubEnv('VITE_USE_DEV_MOCK', 'true');
    const inc = await fetchTyphoonIncident();
    expect(inc).not.toBeNull();
    expect(inc!.eventId).toBe(100);
    expect(inc!.title).toBe('台风沙迦防台防汛工作');
    expect(inc!.mapRiskPoints).toHaveLength(8);
    expect(inc!.liveVideos.length).toBeGreaterThan(0);
    expect(await fetchTyphoonDispatchResources()).toHaveLength(6);
  });

  it('未连后端且未开演示时显式报错并返回空态（不回落 fixture）', async () => {
    vi.stubEnv('VITE_API_BASE', '');
    vi.stubEnv('VITE_USE_DEV_MOCK', '');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(await fetchTyphoonIncident()).toBeNull();
    expect(await fetchTyphoonDispatchResources()).toHaveLength(0);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('/typhoon/incident'));
    warn.mockRestore();
  });

  it('有 VITE_API_BASE 时走真实端点，eventId 编码进查询串', async () => {
    vi.stubEnv('VITE_API_BASE', 'http://api.example.com');
    mockRequest.mockResolvedValue(null);

    await fetchTyphoonIncident(100);
    await fetchTyphoonIncident();
    await fetchTyphoonDispatchResources();

    expect(mockRequest).toHaveBeenCalledWith({
      url: '/typhoon/incident?eventId=100',
      method: 'GET',
    });
    expect(mockRequest).toHaveBeenCalledWith({ url: '/typhoon/incident', method: 'GET' });
    expect(mockRequest).toHaveBeenCalledWith({
      url: '/typhoon/dispatch-resources',
      method: 'GET',
    });
  });

  it('响应结构不符契约时返回空态并告警（不静默回落 fixture）', async () => {
    vi.stubEnv('VITE_API_BASE', 'http://api.example.com');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    // 缺少 monitoringObjects 数组 → 判定为结构不符
    mockRequest.mockResolvedValue({ title: 'x' });

    expect(await fetchTyphoonIncident()).toBeNull();
    expect(await fetchTyphoonDispatchResources()).toHaveLength(0);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('/typhoon/incident'));

    warn.mockRestore();
  });

  it('请求抛错时返回空态并告警', async () => {
    vi.stubEnv('VITE_API_BASE', 'http://api.example.com');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockRequest.mockRejectedValue(new Error('boom'));

    expect(await fetchTyphoonIncident()).toBeNull();
    expect(await fetchTyphoonDispatchResources()).toHaveLength(0);
    expect(warn).toHaveBeenCalled();

    warn.mockRestore();
  });

  it('合法聚合原样返回，含序列与易涝点位视频关联', async () => {
    vi.stubEnv('VITE_API_BASE', 'http://api.example.com');
    const payload = {
      eventId: 100,
      title: '台风沙迦防台防汛工作',
      monitoringObjects: [],
      precipitationSeries: [2, 4],
      windSpeedSeries: [1.2, 1.8],
      waterLevelSeries: [0.42],
      mapRiskPoints: [{ id: 'r1', name: '雨水池', videoIds: ['r1-east'] }],
      dutyPersons: [],
      liveVideos: [],
    };
    mockRequest.mockResolvedValue(payload);

    const inc = await fetchTyphoonIncident(100);
    expect(inc).toBe(payload);
    expect(inc!.mapRiskPoints[0]!.videoIds).toEqual(['r1-east']);
  });
});
