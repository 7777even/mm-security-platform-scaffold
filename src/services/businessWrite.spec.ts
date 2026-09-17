import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/services/http', () => {
  class ApiError extends Error {
    code: number;
    status?: number;
    constructor(
      code: number,
      message: string,
      _data?: unknown,
      _traceId?: string,
      status?: number,
    ) {
      super(message);
      this.name = 'ApiError';
      this.code = code;
      this.status = status;
    }
  }
  return { request: vi.fn(), ApiError };
});

import { ApiError, request } from '@/services/http';
import {
  createDutySignIn,
  createEmergencyCommandRecord,
  createPatrolExecution,
  createTyphoonDispatchOrder,
  fetchDutySignIns,
  fetchEmergencyCommandRecords,
  fetchPatrolExecutions,
  fetchTyphoonDispatchOrders,
  BusinessWriteUnavailableError,
  __resetWriteBreakersForTest,
} from './businessWrite';
import { isHardControl } from './hardControlGuard';
import { resetBackendOfflineNoticesForTest } from './backendFallback';

const mockRequest = request as unknown as ReturnType<typeof vi.fn>;

/** 4 条业务写路径（与后端端点一致），用于红线误伤与转发断言。 */
const WRITE_PATHS = [
  '/emergency/command-records',
  '/emergency/duty-sign-ins',
  '/typhoon/dispatch-orders',
  '/fire/patrol-executions',
] as const;

describe('businessWrite 服务（A2 业务写侧）', () => {
  beforeEach(() => {
    resetBackendOfflineNoticesForTest();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('写路径不命中零下行硬控红线（业务留痕 ≠ 物理下行）', () => {
    for (const p of WRITE_PATHS) {
      expect(isHardControl(p)).toBe(false);
      expect(isHardControl(`/api/v1${p}`)).toBe(false);
    }
  });

  it('未连后端且未开演示 → 写操作显式抛错，绝不伪造提交成功', async () => {
    vi.stubEnv('VITE_API_BASE', '');
    vi.stubEnv('VITE_USE_DEV_MOCK', 'false');
    await expect(
      createEmergencyCommandRecord({ commandCode: 'w1', currStatus: '执行中' }),
    ).rejects.toBeInstanceOf(BusinessWriteUnavailableError);
    await expect(
      createDutySignIn({ dutyDate: '2026-09-13', personName: 'tester', signAction: 'SIGN_IN' }),
    ).rejects.toBeInstanceOf(BusinessWriteUnavailableError);
    await expect(
      createTyphoonDispatchOrder({ resourceCode: 'TEAM-FX-01', dispatchAction: 'ASSIGN' }),
    ).rejects.toBeInstanceOf(BusinessWriteUnavailableError);
    await expect(
      createPatrolExecution({
        patrolDate: '2026-09-13',
        dutyPerson: 'tester',
        execResult: 'NORMAL',
      }),
    ).rejects.toBeInstanceOf(BusinessWriteUnavailableError);
    expect(mockRequest).not.toHaveBeenCalled();
  });

  it('演示模式下同样拒绝写（演示态不产生业务单据）', async () => {
    vi.stubEnv('VITE_API_BASE', '');
    vi.stubEnv('VITE_USE_DEV_MOCK', 'true');
    await expect(
      createEmergencyCommandRecord({ commandCode: 'w1', currStatus: '执行中' }),
    ).rejects.toBeInstanceOf(BusinessWriteUnavailableError);
  });

  it('连后端 → 写操作按契约端点与载荷转发', async () => {
    vi.stubEnv('VITE_API_BASE', 'http://localhost:8787/api/v1');
    mockRequest.mockResolvedValue({ id: 1 });

    await createEmergencyCommandRecord({ commandCode: 'w1', currStatus: '执行中' });
    expect(mockRequest).toHaveBeenLastCalledWith(
      expect.objectContaining({
        url: '/emergency/command-records',
        method: 'POST',
        data: { commandCode: 'w1', currStatus: '执行中' },
      }),
    );

    await createDutySignIn({
      dutyDate: '2026-09-13',
      personName: 'tester',
      signAction: 'SIGN_IN',
    });
    expect(mockRequest).toHaveBeenLastCalledWith(
      expect.objectContaining({ url: '/emergency/duty-sign-ins', method: 'POST' }),
    );

    await createTyphoonDispatchOrder({ resourceCode: 'TEAM-FX-01', dispatchAction: 'ASSIGN' });
    expect(mockRequest).toHaveBeenLastCalledWith(
      expect.objectContaining({ url: '/typhoon/dispatch-orders', method: 'POST' }),
    );

    await createPatrolExecution({
      patrolDate: '2026-09-13',
      dutyPerson: 'tester',
      execResult: 'NORMAL',
    });
    expect(mockRequest).toHaveBeenLastCalledWith(
      expect.objectContaining({ url: '/fire/patrol-executions', method: 'POST' }),
    );
  });

  it('连后端 → 列表端点按契约字段过滤，结构不符降级空集合', async () => {
    vi.stubEnv('VITE_API_BASE', 'http://localhost:8787/api/v1');

    mockRequest.mockResolvedValueOnce([{ commandCode: 'w1', currStatus: '执行中' }, { bad: 1 }]);
    expect(await fetchEmergencyCommandRecords()).toHaveLength(1);

    mockRequest.mockResolvedValueOnce([{ personName: 'tester' }]);
    expect(await fetchDutySignIns()).toHaveLength(1);

    mockRequest.mockResolvedValueOnce([{ resourceCode: 'TEAM-FX-01' }]);
    expect(await fetchTyphoonDispatchOrders()).toHaveLength(1);

    mockRequest.mockResolvedValueOnce([{ patrolDate: '2026-09-13' }]);
    expect(await fetchPatrolExecutions()).toHaveLength(1);

    mockRequest.mockResolvedValueOnce({ notAnArray: true });
    expect(await fetchPatrolExecutions()).toEqual([]);
  });

  it('未连后端 → 列表端点降级空集合（不回灌假数据）', async () => {
    vi.stubEnv('VITE_API_BASE', '');
    vi.stubEnv('VITE_USE_DEV_MOCK', 'true');
    expect(await fetchEmergencyCommandRecords()).toEqual([]);
    expect(await fetchDutySignIns()).toEqual([]);
    expect(await fetchTyphoonDispatchOrders()).toEqual([]);
    expect(await fetchPatrolExecutions()).toEqual([]);
  });
});

describe('写链路熔断降级（高并发兜底）', () => {
  beforeEach(() => {
    __resetWriteBreakersForTest();
  });

  it('连续 5 次基础设施失败 → 熔断，期间写请求快速失败且不再下发', async () => {
    vi.stubEnv('VITE_API_BASE', 'http://localhost:8787/api/v1');
    mockRequest.mockClear();
    mockRequest.mockRejectedValue(new Error('network down')); // 非 ApiError = 基础设施失败
    const payload = { dutyDate: '2026-09-13', personName: 't', signAction: 'SIGN_IN' };
    for (let i = 0; i < 5; i++) {
      await expect(createDutySignIn(payload)).rejects.toBeInstanceOf(Error);
    }
    expect(mockRequest).toHaveBeenCalledTimes(5);
    const beforeShort = mockRequest.mock.calls.length;
    await expect(createDutySignIn(payload)).rejects.toBeInstanceOf(BusinessWriteUnavailableError);
    expect(mockRequest.mock.calls.length).toBe(beforeShort); // 熔断后未再发请求
  });

  it('应用级 4xx（校验/权限）不计入熔断', async () => {
    vi.stubEnv('VITE_API_BASE', 'http://localhost:8787/api/v1');
    mockRequest.mockClear();
    mockRequest.mockRejectedValue(new ApiError(403, 'no permission', undefined, undefined, 403));
    const payload = { dutyDate: '2026-09-13', personName: 't', signAction: 'SIGN_IN' };
    for (let i = 0; i < 5; i++) {
      await expect(createDutySignIn(payload)).rejects.toBeInstanceOf(ApiError);
    }
    await expect(createDutySignIn(payload)).rejects.toBeInstanceOf(ApiError);
    expect(mockRequest).toHaveBeenCalledTimes(6); // 4xx 未触发熔断，仍真实下发
  });

  it('失败未达阈值 + 一次成功 → 计数复位', async () => {
    vi.stubEnv('VITE_API_BASE', 'http://localhost:8787/api/v1');
    mockRequest.mockClear();
    const payload = { dutyDate: '2026-09-13', personName: 't', signAction: 'SIGN_IN' };
    mockRequest.mockRejectedValue(new Error('network down'));
    for (let i = 0; i < 3; i++) await expect(createDutySignIn(payload)).rejects.toBeDefined();
    mockRequest.mockResolvedValue({ id: 1 });
    await expect(createDutySignIn(payload)).resolves.toEqual({ id: 1 });
    mockRequest.mockRejectedValue(new Error('network down'));
    for (let i = 0; i < 3; i++) await expect(createDutySignIn(payload)).rejects.toBeDefined();
    expect(mockRequest).toHaveBeenCalledTimes(7); // 3+1+3，无误熔断
  });
});
