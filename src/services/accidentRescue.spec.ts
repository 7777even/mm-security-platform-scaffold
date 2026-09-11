import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchAccidentIncident } from './accidentRescue';

vi.mock('@/services/http', () => ({
  request: vi.fn(),
}));

import { request } from '@/services/http';

const mockRequest = request as unknown as ReturnType<typeof vi.fn>;

describe('accidentRescue 服务（暴露式降级：后端缺口不得被假数据掩盖）', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('离线演示（无 VITE_API_BASE + VITE_USE_DEV_MOCK=true）时回落本地 fixture', async () => {
    vi.stubEnv('VITE_API_BASE', '');
    vi.stubEnv('VITE_USE_DEV_MOCK', 'true');
    const inc = await fetchAccidentIncident();
    // 注意：本地 fixture 仅含事件基础字段（title/detailFields/eventId 等），
    // dispatchResources/dynamics 等子数组由真实后端提供；fixture 静态演示下缺省，
    // 与「暴露式降级」语义一致——不可被误判为后端已就绪。
    expect(inc).toBeTruthy();
    expect(typeof inc.eventId).toBe('number');
    expect(inc.eventId).toBeGreaterThan(0);
    expect(inc.title).toBeTruthy();
    expect(Array.isArray(inc.detailFields)).toBe(true);
  });

  it('未连后端且未开演示时显式报错并返回空态（不回落 fixture）', async () => {
    vi.stubEnv('VITE_API_BASE', '');
    vi.stubEnv('VITE_USE_DEV_MOCK', '');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const inc = await fetchAccidentIncident();
    expect(inc.eventId).toBe(0);
    expect(inc.title).toBe('');
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('/accident/rescue-incident'));
    warn.mockRestore();
  });

  it('有 VITE_API_BASE 时走真实端点，eventId 编码进查询参数', async () => {
    vi.stubEnv('VITE_API_BASE', 'http://api.example.com');
    mockRequest.mockResolvedValue(null);

    await fetchAccidentIncident(4);
    await fetchAccidentIncident();

    expect(mockRequest).toHaveBeenCalledWith({
      url: '/accident/rescue-incident',
      method: 'GET',
      params: { eventId: 4 },
    });
    expect(mockRequest).toHaveBeenCalledWith({
      url: '/accident/rescue-incident',
      method: 'GET',
      params: undefined,
    });
  });

  it('响应结构不符契约时返回空态并告警（不静默回落 fixture）', async () => {
    vi.stubEnv('VITE_API_BASE', 'http://api.example.com');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    // 缺少 title → 判定为结构不符契约
    mockRequest.mockResolvedValue({ eventId: 4, title: '' });

    const inc = await fetchAccidentIncident();
    expect(inc.eventId).toBe(0);
    expect(inc.title).toBe('');
    expect(inc.dispatchResources).toHaveLength(0);
    expect(inc.dynamics).toHaveLength(0);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('/accident/rescue-incident'));

    warn.mockRestore();
  });

  it('请求抛错时返回空态并告警', async () => {
    vi.stubEnv('VITE_API_BASE', 'http://api.example.com');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockRequest.mockRejectedValue(new Error('boom'));

    const inc = await fetchAccidentIncident();
    expect(inc.eventId).toBe(0);
    expect(inc.dispatchResources).toHaveLength(0);
    expect(warn).toHaveBeenCalled();

    warn.mockRestore();
  });

  it('合法聚合原样返回，含子数组与动态分类', async () => {
    vi.stubEnv('VITE_API_BASE', 'http://api.example.com');
    const payload = {
      eventId: 4,
      title: '事故救援演练事件',
      location: '某联合装置',
      longitude: 119.1,
      latitude: 30.2,
      mapStatus: '处置中',
      status: 'processing' as const,
      reported: true,
      facilityName: 'XX装置',
      detailFields: [{ label: '发生时间', value: '2026-03-22 11:37' }],
      dispatchResources: [],
      dutyPersons: [],
      auxiliaryStats: [],
      dynamics: [
        { id: 1, category: 'rescue', title: '现场处置' },
        { id: 2, category: 'command', title: '指挥部指令' },
      ],
    };
    mockRequest.mockResolvedValue(payload);

    const inc = await fetchAccidentIncident(4);
    expect(inc).toBe(payload);
    expect(inc.dynamics).toHaveLength(2);
    expect(inc.dynamics[0]!.category).toBe('rescue');
  });
});
