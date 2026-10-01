// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import FaultMgmtView from '../fire/FaultMgmtView.vue';

const {
  fetchFireFacilityFaults,
  deleteFireFacilityFault,
  subscribeDomainChange,
  unsub,
  confirmMock,
} = vi.hoisted(() => ({
  fetchFireFacilityFaults: vi.fn(),
  deleteFireFacilityFault: vi.fn(),
  subscribeDomainChange: vi.fn(),
  unsub: vi.fn(),
  confirmMock: vi.fn(),
}));

vi.mock('@/services/fireFacility', () => ({
  fetchFireFacilityFaults: (...args: unknown[]) => fetchFireFacilityFaults(...args),
  deleteFireFacilityFault: (...args: unknown[]) => deleteFireFacilityFault(...args),
}));
// useDomainAutoRefresh 内部走 realtime 中枢，mock 到这一层即可捕获订阅与退订
vi.mock('@/services/realtime', () => ({
  subscribeDomainChange: (...args: unknown[]) => subscribeDomainChange(...args),
}));
vi.mock('element-plus', async (importOriginal) => {
  const mod = await importOriginal<typeof import('element-plus')>();
  return { ...mod, ElMessageBox: { confirm: (...args: unknown[]) => confirmMock(...args) } };
});

beforeEach(() => {
  subscribeDomainChange.mockReturnValue(unsub);
  fetchFireFacilityFaults.mockResolvedValue({ items: [] });
  deleteFireFacilityFault.mockResolvedValue(undefined);
  confirmMock.mockResolvedValue('confirm');
});

describe('FaultMgmtView 实时订阅与删除', () => {
  it('挂载时订阅 fire-facility.fault 域变更', () => {
    mount(FaultMgmtView);
    expect(subscribeDomainChange).toHaveBeenCalledWith('fire-facility.fault', expect.any(Function));
  });

  it('卸载时退订', () => {
    const wrapper = mount(FaultMgmtView);
    wrapper.unmount();
    expect(unsub).toHaveBeenCalledTimes(1);
  });

  it('点击删除并经确认后调用 deleteFireFacilityFault', async () => {
    fetchFireFacilityFaults.mockResolvedValue({
      items: [
        {
          id: 7,
          faultCode: 'FLT-7',
          facilityCode: 'XF-007',
          facilityName: '消火栓系统-2#罐区',
          faultType: '硬件故障',
          faultLevel: '紧急',
          discoverTime: '2026-10-01 09:15:00',
          status: '待确认',
          timeline: [],
        },
      ],
    });
    const wrapper = mount(FaultMgmtView);
    await flushPromises();
    await new Promise((r) => setTimeout(r, 0));
    const delBtn = wrapper.findAll('button').find((b) => b.text() === '删除');
    expect(delBtn).toBeTruthy();
    await delBtn!.trigger('click');
    await flushPromises();
    await new Promise((r) => setTimeout(r, 0));
    expect(confirmMock).toHaveBeenCalled();
    expect(deleteFireFacilityFault).toHaveBeenCalledWith(7);
  });
});
