import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fetchRescueForces,
  fetchSpecialOperations,
  fetchFireEquipmentStatus,
  fetchFirePatrols,
} from './fireMonitoring';

vi.mock('@/services/http', () => ({
  request: vi.fn(),
}));

import { request } from '@/services/http';

const mockRequest = request as unknown as ReturnType<typeof vi.fn>;

describe('fireMonitoring 服务（暴露式降级：后端缺口不得被假数据掩盖）', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('无 VITE_API_BASE 时回落 dev fixture（纯静态演示，不误判后端就绪）', async () => {
    vi.stubEnv('VITE_API_BASE', '');
    const forces = await fetchRescueForces();
    const ops = await fetchSpecialOperations();
    const status = await fetchFireEquipmentStatus();
    expect(forces).toHaveLength(4);
    expect(forces[0]).toEqual({ label: '消防队伍', value: 10, unit: '支', iconType: 'squad' });
    expect(ops).toHaveLength(8);
    expect(status).toEqual({
      total: 1233,
      offline: 23,
      fault: 23,
      integrityRate: 98,
      onlineRate: 98,
    });
  });

  it('有 VITE_API_BASE 时走真实端点', async () => {
    vi.stubEnv('VITE_API_BASE', 'http://api.example.com');
    mockRequest.mockResolvedValue([]);

    await fetchRescueForces();
    await fetchSpecialOperations();
    await fetchFireEquipmentStatus();
    await fetchFirePatrols();

    expect(mockRequest).toHaveBeenCalledWith({ url: '/fire/rescue-forces', method: 'GET' });
    expect(mockRequest).toHaveBeenCalledWith({ url: '/fire/special-operations', method: 'GET' });
    expect(mockRequest).toHaveBeenCalledWith({ url: '/fire/equipment-status', method: 'GET' });
    expect(mockRequest).toHaveBeenCalledWith({ url: '/fire/patrols', method: 'GET' });
  });

  it('响应结构不符契约时返回空态并告警（不静默回落 fixture）', async () => {
    vi.stubEnv('VITE_API_BASE', 'http://api.example.com');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockRequest.mockResolvedValue({ foo: 'bar' });

    expect(await fetchRescueForces()).toHaveLength(0);
    expect(await fetchSpecialOperations()).toHaveLength(0);
    expect(await fetchFireEquipmentStatus()).toBeNull();
    expect(await fetchFirePatrols()).toHaveLength(0);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('/fire/rescue-forces'));

    warn.mockRestore();
  });

  it('字段缺失的条目被丢弃且告警，保留合法条目', async () => {
    vi.stubEnv('VITE_API_BASE', 'http://api.example.com');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockRequest.mockResolvedValue([
      { label: '消防队伍', value: 10, unit: '支', iconType: 'squad' },
      { label: '缺字段' },
    ]);

    const res = await fetchRescueForces();
    expect(res).toHaveLength(1);
    expect(res[0]!.label).toBe('消防队伍');
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('部分条目字段缺失已丢弃'));

    warn.mockRestore();
  });

  it('请求抛错时返回空态并告警', async () => {
    vi.stubEnv('VITE_API_BASE', 'http://api.example.com');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockRequest.mockRejectedValue(new Error('boom'));

    expect(await fetchRescueForces()).toHaveLength(0);
    expect(await fetchFireEquipmentStatus()).toBeNull();
    expect(warn).toHaveBeenCalled();

    warn.mockRestore();
  });

  it('巡查记录为数组时原样返回（含 15 项检查项结构）', async () => {
    vi.stubEnv('VITE_API_BASE', 'http://api.example.com');
    const record = {
      id: 4,
      patrolDate: '2026-08-19',
      shift: '上午',
      dutyPerson: '张三',
      patrolCount: '第1次',
      locations: ['1#联合装置', '中央控制室'],
      completed: true,
      workOrderNo: 'WO-20260819-010',
      checkItems: [
        {
          itemCode: 'C1',
          category: '防火分隔设施',
          content: '常闭防火门是否处于正常关闭状态',
          result: '异常',
          abnormalDesc: '3F 常闭防火门被挡块撑开',
          photoFile: 'patrol-photo-placeholder.png',
        },
      ],
    };
    mockRequest.mockResolvedValue([record]);

    const res = await fetchFirePatrols();
    expect(res).toHaveLength(1);
    expect(res[0]!.checkItems[0]!.result).toBe('异常');
    expect(res[0]!.locations).toEqual(['1#联合装置', '中央控制室']);
  });
});
