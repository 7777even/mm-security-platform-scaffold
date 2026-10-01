// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import VideoLinkageEditDialog from '../VideoLinkageEditDialog.vue';

const { createVideoLinkage, updateVideoLinkage, fetchVideoLinkageOptions, fetchVideoLinkageRules } =
  vi.hoisted(() => ({
    createVideoLinkage: vi.fn(),
    updateVideoLinkage: vi.fn(),
    fetchVideoLinkageOptions: vi.fn(),
    fetchVideoLinkageRules: vi.fn(),
  }));

vi.mock('@/services/video', async () => {
  const actual = await vi.importActual<typeof import('@/services/video')>('@/services/video');
  return {
    ...actual,
    createVideoLinkage: (...args: unknown[]) => createVideoLinkage(...args),
    updateVideoLinkage: (...args: unknown[]) => updateVideoLinkage(...args),
    fetchVideoLinkageOptions: (...args: unknown[]) => fetchVideoLinkageOptions(...args),
    fetchVideoLinkageRules: (...args: unknown[]) => fetchVideoLinkageRules(...args),
  };
});

beforeEach(() => {
  vi.clearAllMocks();
  fetchVideoLinkageOptions.mockResolvedValue({
    monitorNames: ['1#摄像头'],
    presetPoints: ['预置点1'],
    businessObjectCategories: ['装置'],
    businessObjects: ['蜡油加氢装置'],
  });
  fetchVideoLinkageRules.mockResolvedValue([
    { id: 'r1', presetPoint: '预置点1', objectCategory: '装置', objectName: '蜡油加氢装置' },
  ]);
  createVideoLinkage.mockResolvedValue({ id: '1', name: 'x', code: 'LKG-1', category: 'c' });
  updateVideoLinkage.mockResolvedValue({ id: '1', name: 'x', code: 'LKG-1', category: 'c' });
});

function findSave(wrapper: ReturnType<typeof mount>) {
  return wrapper.findAll('button').find((b) => b.text() === '保存')!;
}

describe('VideoLinkageEditDialog', () => {
  it('新增模式：必填校验失败时不调用写接口', async () => {
    const wrapper = mount(VideoLinkageEditDialog, {
      props: { modelValue: true, editRow: null },
    });
    await flushPromises();
    await findSave(wrapper).trigger('click');
    await flushPromises();
    expect(createVideoLinkage).not.toHaveBeenCalled();
    expect(updateVideoLinkage).not.toHaveBeenCalled();
  });

  it('新增模式：填必填项后保存调用 createVideoLinkage', async () => {
    const wrapper = mount(VideoLinkageEditDialog, {
      props: { modelValue: true, editRow: null },
    });
    await flushPromises();
    wrapper.vm.form.name = '装置区火灾联动';
    wrapper.vm.form.code = 'LKG-NEW';
    wrapper.vm.form.category = '火灾报警联动';
    await flushPromises();
    await findSave(wrapper).trigger('click');
    await flushPromises();
    await new Promise((r) => setTimeout(r, 0));
    expect(createVideoLinkage).toHaveBeenCalledTimes(1);
    expect(updateVideoLinkage).not.toHaveBeenCalled();
    expect(wrapper.emitted('saved')).toBeTruthy();
  });

  it('编辑模式：editRow 带 code 时锁定编码并调用 updateVideoLinkage', async () => {
    const wrapper = mount(VideoLinkageEditDialog, {
      props: {
        modelValue: true,
        editRow: { id: '1', name: '原联动', code: 'LKG-1', category: '火灾报警联动' },
      },
    });
    await flushPromises();
    await new Promise((r) => setTimeout(r, 0));
    expect(wrapper.vm.form.codeLocked).toBe(true);
    // 编辑态预填后端返回的联动规则
    expect(fetchVideoLinkageRules).toHaveBeenCalledWith('LKG-1');
    expect(wrapper.vm.form.rules[0]?.presetPoint).toBe('预置点1');

    await findSave(wrapper).trigger('click');
    await flushPromises();
    await new Promise((r) => setTimeout(r, 0));
    expect(updateVideoLinkage).toHaveBeenCalledTimes(1);
    expect(updateVideoLinkage).toHaveBeenCalledWith('LKG-1', expect.any(Object));
    expect(createVideoLinkage).not.toHaveBeenCalled();
  });
});
