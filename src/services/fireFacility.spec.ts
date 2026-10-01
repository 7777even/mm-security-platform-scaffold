import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createFireFacilityFault,
  deleteFireFacilityFault,
  type FireFacilityFaultCreatePayload,
} from './fireFacility';

vi.mock('@/services/http', () => ({
  request: vi.fn(),
}));

import { request } from '@/services/http';

const mockedRequest = vi.mocked(request);

const payload: FireFacilityFaultCreatePayload = {
  faultCode: 'FLT-2026-0001',
  facilityCode: 'XF-002',
  facilityName: '消火栓系统-2#罐区',
  faultType: '硬件故障',
  faultLevel: '紧急',
  discoverTime: '2026-10-01 09:15:00',
};

describe('createFireFacilityFault', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('连后端时走真实 POST /fire-facility/faults 并返回新建条目', async () => {
    vi.stubEnv('VITE_API_BASE', 'http://localhost:8787');
    vi.stubEnv('VITE_USE_DEV_MOCK', '');
    mockedRequest.mockResolvedValue({ id: 1, faultCode: 'FLT-2026-0001', status: '待确认' });

    const res = await createFireFacilityFault(payload);

    expect(mockedRequest).toHaveBeenCalledTimes(1);
    expect(mockedRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: '/fire-facility/faults', method: 'POST', data: payload }),
    );
    expect(res?.faultCode).toBe('FLT-2026-0001');
  });

  it('离线演示态仅本地成功（返回 null，不落库、不发请求）', async () => {
    vi.stubEnv('VITE_API_BASE', '');
    vi.stubEnv('VITE_USE_DEV_MOCK', 'true');

    const res = await createFireFacilityFault(payload);

    expect(res).toBeNull();
    expect(mockedRequest).not.toHaveBeenCalled();
  });

  it('未连后端且未开演示时显式报错，绝不伪造保存成功', async () => {
    vi.stubEnv('VITE_API_BASE', '');
    vi.stubEnv('VITE_USE_DEV_MOCK', '');

    await expect(createFireFacilityFault(payload)).rejects.toThrow(/后端未连接/);
    expect(mockedRequest).not.toHaveBeenCalled();
  });
});

describe('deleteFireFacilityFault', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('连后端时走真实 DELETE /fire-facility/faults/{id}', async () => {
    vi.stubEnv('VITE_API_BASE', 'http://localhost:8787');
    vi.stubEnv('VITE_USE_DEV_MOCK', '');
    mockedRequest.mockResolvedValue(undefined);

    await deleteFireFacilityFault(7);

    expect(mockedRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: '/fire-facility/faults/7', method: 'DELETE' }),
    );
  });

  it('离线演示态仅本地成功，不发请求', async () => {
    vi.stubEnv('VITE_API_BASE', '');
    vi.stubEnv('VITE_USE_DEV_MOCK', 'true');

    await expect(deleteFireFacilityFault(7)).resolves.toBeUndefined();
    expect(mockedRequest).not.toHaveBeenCalled();
  });

  it('未连后端且未开演示时显式报错', async () => {
    vi.stubEnv('VITE_API_BASE', '');
    vi.stubEnv('VITE_USE_DEV_MOCK', '');

    await expect(deleteFireFacilityFault(7)).rejects.toThrow(/后端未连接/);
    expect(mockedRequest).not.toHaveBeenCalled();
  });
});
