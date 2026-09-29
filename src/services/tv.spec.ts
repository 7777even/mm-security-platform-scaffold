import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fetchTvOverview,
  fetchTvInspections,
  fetchTvMapPoints,
  fetchTvMonitor,
  fetchTvMonitors,
  fetchTvSnapshots,
  fetchTvMonitorSnapshots,
  fetchTvSnapshotsByAlarm,
  fetchProductionAlarmSnapshots,
  fetchTvSnapshotUrl,
  submitTvSnapshot,
  ackTvSnapshot,
  createTvMonitor,
  updateTvMonitor,
  deleteTvMonitor,
  touchTvSnapshotChanged,
  tvSnapshotChanged,
} from './tv';
import type { TvMonitorUpsertRequest, TvSnapshotIngestRequest } from './tv';

vi.mock('@/services/http', () => ({
  request: vi.fn(),
  default: { get: vi.fn() },
}));

vi.mock('@/services/backendFallback', () => ({
  backendUnavailableWarn: vi.fn(),
  REASON_CONTRACT_MISMATCH: '响应结构不符合契约',
}));

import http, { request } from '@/services/http';
import { backendUnavailableWarn } from '@/services/backendFallback';

const requestMock = request as unknown as ReturnType<typeof vi.fn>;
const httpMock = http as unknown as { get: ReturnType<typeof vi.fn> };
const warnMock = backendUnavailableWarn as unknown as ReturnType<typeof vi.fn>;

interface GetCase {
  name: string;
  run: () => Promise<unknown>;
  valid: unknown;
  invalid: unknown;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- 取数降级空态断言需容纳多形态返回（数组/对象），测试辅助不必收窄
  expectEmpty: (r: any) => boolean;
}

const getFetchers: GetCase[] = [
  {
    name: 'fetchTvOverview',
    run: () => fetchTvOverview(),
    valid: {
      overviewItems: [],
      operationStats: {
        total: 0,
        offline: 0,
        fault: 0,
        integrityRate: 0,
        onlineRate: 0,
        eventTotal: 0,
      },
      maintenanceOrders: [],
      eventBreakdown: [],
    },
    invalid: {},
    expectEmpty: (r) =>
      Array.isArray(r.overviewItems) &&
      r.overviewItems.length === 0 &&
      r.operationStats.total === 0,
  },
  {
    name: 'fetchTvInspections',
    run: () => fetchTvInspections(),
    valid: { vehicles: [], persons: [] },
    invalid: {},
    expectEmpty: (r) =>
      Array.isArray(r.vehicles) &&
      r.vehicles.length === 0 &&
      Array.isArray(r.persons) &&
      r.persons.length === 0,
  },
  {
    name: 'fetchTvMapPoints',
    run: () => fetchTvMapPoints(),
    valid: [],
    invalid: null,
    expectEmpty: (r) => Array.isArray(r) && r.length === 0,
  },
  {
    name: 'fetchTvMonitor',
    run: () => fetchTvMonitor('ar-01'),
    valid: { id: 'ar-01', name: '高空AR-01' },
    invalid: {},
    expectEmpty: (r) => r.id === 'ar-01' && r.name === '' && r.online === false,
  },
  {
    name: 'fetchTvMonitors',
    run: () => fetchTvMonitors(),
    valid: [],
    invalid: null,
    expectEmpty: (r) => Array.isArray(r) && r.length === 0,
  },
  {
    name: 'fetchTvSnapshots',
    run: () => fetchTvSnapshots(1, 20, { monitorCode: 'x' }),
    valid: { total: 0, page: 1, size: 20, pages: 0, list: [] },
    invalid: {},
    expectEmpty: (r) => Array.isArray(r.list) && r.list.length === 0 && r.total === 0,
  },
  {
    name: 'fetchTvMonitorSnapshots',
    run: () => fetchTvMonitorSnapshots('ar-01', 1, 20, { startTime: 't' }),
    valid: { total: 0, page: 1, size: 20, pages: 0, list: [] },
    invalid: {},
    expectEmpty: (r) => Array.isArray(r.list) && r.list.length === 0,
  },
  {
    name: 'fetchTvSnapshotsByAlarm',
    run: () => fetchTvSnapshotsByAlarm(1, 'PRODUCTION', 1, 50),
    valid: { total: 0, page: 1, size: 50, pages: 0, list: [] },
    invalid: {},
    expectEmpty: (r) => Array.isArray(r.list) && r.list.length === 0,
  },
  {
    name: 'fetchProductionAlarmSnapshots',
    run: () => fetchProductionAlarmSnapshots(1, 1, 50),
    valid: { total: 0, page: 1, size: 50, pages: 0, list: [] },
    invalid: {},
    expectEmpty: (r) => Array.isArray(r.list) && r.list.length === 0,
  },
];

describe('tv 服务客户端（对齐 tv.openapi.json，暴露式降级）', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('touchTvSnapshotChanged 自增 tvSnapshotChanged 信号', () => {
    const before = tvSnapshotChanged.value;
    touchTvSnapshotChanged();
    expect(tvSnapshotChanged.value).toBe(before + 1);
  });

  it.each(getFetchers)('$name：成功返回真实数据', async (c) => {
    requestMock.mockResolvedValue(c.valid);
    const r = await c.run();
    expect(r).toBe(c.valid);
  });

  it.each(getFetchers)('$name：响应结构不符契约降级空态', async (c) => {
    requestMock.mockResolvedValue(c.invalid);
    const r = await c.run();
    expect(c.expectEmpty(r)).toBe(true);
    expect(warnMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      '响应结构不符合契约',
    );
  });

  it.each(getFetchers)('$name：请求异常降级空态', async (c) => {
    requestMock.mockRejectedValue(new Error('network'));
    const r = await c.run();
    expect(c.expectEmpty(r)).toBe(true);
    expect(warnMock).toHaveBeenCalled();
  });

  it('submitTvSnapshot：POST /tv/snapshots 上报入库', async () => {
    const payload: TvSnapshotIngestRequest = {
      monitorCode: 'ar-01',
      imageBase64: 'data:image/jpeg;base64,AAA',
    };
    requestMock.mockResolvedValue({ id: 1, monitorCode: 'ar-01' });
    const r = await submitTvSnapshot(payload);
    expect(r).toEqual({ id: 1, monitorCode: 'ar-01' });
    expect(requestMock).toHaveBeenCalledWith({
      url: '/tv/snapshots',
      method: 'POST',
      data: payload,
    });
  });

  it('submitTvSnapshot：失败抛出', async () => {
    requestMock.mockRejectedValue(new Error('403'));
    await expect(submitTvSnapshot({ monitorCode: 'ar-01', imageBase64: 'x' })).rejects.toThrow(
      '403',
    );
  });

  it('ackTvSnapshot：POST /tv/snapshots/{id}/ack 确认', async () => {
    requestMock.mockResolvedValue({ id: 2, reviewStatus: 'ACKED' });
    const r = await ackTvSnapshot(2);
    expect(r).toEqual({ id: 2, reviewStatus: 'ACKED' });
    expect(requestMock).toHaveBeenCalledWith({ url: '/tv/snapshots/2/ack', method: 'POST' });
  });

  it('createTvMonitor：POST /tv/monitors 新增点位', async () => {
    const payload: TvMonitorUpsertRequest = {
      monitorCode: 'new-01',
      monitorName: '新点位',
      online: true,
      zoneCode: 'YIXI',
    };
    requestMock.mockResolvedValue({
      code: 'new-01',
      name: '新点位',
      online: true,
      zoneCode: 'YIXI',
    });
    const r = await createTvMonitor(payload);
    expect(r.code).toBe('new-01');
    expect(requestMock).toHaveBeenCalledWith({
      url: '/tv/monitors',
      method: 'POST',
      data: payload,
    });
  });

  it('updateTvMonitor：PUT /tv/monitors/{code} 更新点位', async () => {
    const payload: TvMonitorUpsertRequest = { monitorName: '改名', zoneCode: 'GUANQU' };
    requestMock.mockResolvedValue({ code: 'ar-01', name: '改名', zoneCode: 'GUANQU' });
    const r = await updateTvMonitor('ar-01', payload);
    expect(r.name).toBe('改名');
    expect(requestMock).toHaveBeenCalledWith({
      url: '/tv/monitors/ar-01',
      method: 'PUT',
      data: payload,
    });
  });

  it('deleteTvMonitor：DELETE /tv/monitors/{code} 删除点位', async () => {
    requestMock.mockResolvedValue(undefined);
    await deleteTvMonitor('ar-01');
    expect(requestMock).toHaveBeenCalledWith({ url: '/tv/monitors/ar-01', method: 'DELETE' });
  });

  it('fetchTvSnapshotUrl：无 VITE_API_BASE 直接返回 null', async () => {
    vi.stubEnv('VITE_API_BASE', '');
    const r = await fetchTvSnapshotUrl(5);
    expect(r).toBeNull();
    expect(httpMock.get).not.toHaveBeenCalled();
  });

  it('fetchTvSnapshotUrl：有 base 且取到 blob 返回 objectURL', async () => {
    vi.stubEnv('VITE_API_BASE', 'http://api.example.com');
    vi.stubGlobal('URL', { createObjectURL: vi.fn(() => 'blob:fake') });
    httpMock.get.mockResolvedValue({ data: new Blob() });
    const r = await fetchTvSnapshotUrl(5);
    expect(r).toBe('blob:fake');
    expect(httpMock.get).toHaveBeenCalledWith('/tv/snapshots/5/snapshot', { responseType: 'blob' });
  });

  it('fetchTvSnapshotUrl：取字节失败降级 null', async () => {
    vi.stubEnv('VITE_API_BASE', 'http://api.example.com');
    httpMock.get.mockRejectedValue(new Error('404'));
    const r = await fetchTvSnapshotUrl(5);
    expect(r).toBeNull();
  });
});
