// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import FireFacilityFaultEditDialog from '../FireFacilityFaultEditDialog.vue';

const { createFireFacilityFault, updateFireFacilityFault } = vi.hoisted(() => ({
  createFireFacilityFault: vi.fn(),
  updateFireFacilityFault: vi.fn(),
}));

// 保留真实模块（含下拉选项常量），仅覆盖两个写接口
vi.mock('@/services/fireFacility', async () => {
  const actual =
    await vi.importActual<typeof import('@/services/fireFacility')>('@/services/fireFacility');
  return {
    ...actual,
    createFireFacilityFault: (...args: unknown[]) => createFireFacilityFault(...args),
    updateFireFacilityFault: (...args: unknown[]) => updateFireFacilityFault(...args),
  };
});

beforeEach(() => {
  vi.clearAllMocks();
  createFireFacilityFault.mockResolvedValue({ id: 1, faultCode: 'FLT-1' });
  updateFireFacilityFault.mockResolvedValue({ id: 7, faultCode: 'FLT-7' });
});

function findSave(wrapper: ReturnType<typeof mount>) {
  return wrapper.findAll('button').find((b) => b.text() === '保存')!;
}

describe('FireFacilityFaultEditDialog', () => {
  it('新增模式：必填校验失败时不调用任何写接口', async () => {
    const wrapper = mount(FireFacilityFaultEditDialog, {
      props: { modelValue: true, editRow: null },
    });
    await flushPromises();
    await findSave(wrapper).trigger('click');
    await flushPromises();
    expect(createFireFacilityFault).not.toHaveBeenCalled();
    expect(updateFireFacilityFault).not.toHaveBeenCalled();
  });

  it('新增模式：填必填项后保存调用 createFireFacilityFault', async () => {
    const wrapper = mount(FireFacilityFaultEditDialog, {
      props: { modelValue: true, editRow: null },
    });
    await flushPromises();
    // 直接驱动表单（时间为 el-date-picker，靠 DOM 索引不可靠）
    wrapper.vm.form.faultCode = 'FLT-2026-0001';
    wrapper.vm.form.facilityCode = 'XF-002';
    wrapper.vm.form.discoverTime = '2026-10-01 09:15:00';
    await flushPromises();
    await findSave(wrapper).trigger('click');
    await flushPromises();
    await new Promise((r) => setTimeout(r, 0));
    expect(createFireFacilityFault).toHaveBeenCalledTimes(1);
    const payload = createFireFacilityFault.mock.calls[0]?.[0] as {
      faultCode?: string;
      facilityCode?: string;
    };
    expect(payload?.faultCode).toBe('FLT-2026-0001');
    expect(payload?.facilityCode).toBe('XF-002');
    expect(updateFireFacilityFault).not.toHaveBeenCalled();
  });

  it('编辑模式：editRow 带 id 时保存调用 updateFireFacilityFault，status 映射为 faultStatus', async () => {
    const wrapper = mount(FireFacilityFaultEditDialog, {
      props: {
        modelValue: true,
        editRow: {
          id: 7,
          faultCode: 'FLT-7',
          facilityCode: 'XF-007',
          faultType: '硬件故障',
          faultLevel: '紧急',
          discoverTime: '2026-10-01 09:15:00',
          // 条目字段为 status，写回字段为 faultStatus
          status: '维修中',
        },
      },
    });
    await flushPromises();
    // watch(editRow, immediate) 已把表单预填并完成 status → faultStatus 映射
    expect(wrapper.vm.form.id).toBe(7);
    expect(wrapper.vm.form.faultStatus).toBe('维修中');
    await findSave(wrapper).trigger('click');
    await flushPromises();
    await new Promise((r) => setTimeout(r, 0));
    expect(updateFireFacilityFault).toHaveBeenCalledTimes(1);
    expect(updateFireFacilityFault).toHaveBeenCalledWith(7, expect.any(Object));
    const payload = updateFireFacilityFault.mock.calls[0]?.[1] as { faultStatus?: string };
    expect(payload?.faultStatus).toBe('维修中');
    expect(createFireFacilityFault).not.toHaveBeenCalled();
  });

  it('保存成功后派发 saved 与 update:modelValue(false)', async () => {
    const wrapper = mount(FireFacilityFaultEditDialog, {
      props: { modelValue: true, editRow: null },
    });
    await flushPromises();
    wrapper.vm.form.faultCode = 'FLT-2026-0002';
    wrapper.vm.form.facilityCode = 'XF-003';
    wrapper.vm.form.discoverTime = '2026-10-01 10:00:00';
    await flushPromises();
    await findSave(wrapper).trigger('click');
    await flushPromises();
    await new Promise((r) => setTimeout(r, 0));
    expect(wrapper.emitted('saved')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false]);
  });
});
