// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import AutoLinkageView from '../emergency/AutoLinkageView.vue';

const { fetchVideoLinkages, deleteVideoLinkage, subscribeDomainChange, unsub, confirmMock } =
  vi.hoisted(() => ({
    fetchVideoLinkages: vi.fn(),
    deleteVideoLinkage: vi.fn(),
    subscribeDomainChange: vi.fn(),
    unsub: vi.fn(),
    confirmMock: vi.fn(),
  }));

vi.mock('@/services/video', async () => {
  const actual = await vi.importActual<typeof import('@/services/video')>('@/services/video');
  return {
    ...actual,
    fetchVideoLinkages: (...args: unknown[]) => fetchVideoLinkages(...args),
    deleteVideoLinkage: (...args: unknown[]) => deleteVideoLinkage(...args),
  };
});
vi.mock('@/services/realtime', () => ({
  subscribeDomainChange: (...args: unknown[]) => subscribeDomainChange(...args),
}));
vi.mock('element-plus', async (importOriginal) => {
  const mod = await importOriginal<typeof import('element-plus')>();
  return { ...mod, ElMessageBox: { confirm: (...args: unknown[]) => confirmMock(...args) } };
});

beforeEach(() => {
  subscribeDomainChange.mockReturnValue(unsub);
  fetchVideoLinkages.mockResolvedValue([]);
  deleteVideoLinkage.mockResolvedValue(true);
  confirmMock.mockResolvedValue('confirm');
});

describe('AutoLinkageView 实时订阅与删除', () => {
  it('挂载时订阅 video.linkage 域变更', () => {
    mount(AutoLinkageView);
    expect(subscribeDomainChange).toHaveBeenCalledWith('video.linkage', expect.any(Function));
  });

  it('卸载时退订', () => {
    const wrapper = mount(AutoLinkageView);
    wrapper.unmount();
    expect(unsub).toHaveBeenCalledTimes(1);
  });

  it('点击删除并经确认后调用 deleteVideoLinkage', async () => {
    fetchVideoLinkages.mockResolvedValue([
      {
        id: '1',
        name: '装置区火灾联动',
        code: 'LKG-1',
        category: '火灾报警联动',
        linkageCount: 2,
        businessObjects: '蜡油加氢装置',
      },
    ]);
    const wrapper = mount(AutoLinkageView);
    await flushPromises();
    await new Promise((r) => setTimeout(r, 0));
    const delBtn = wrapper.findAll('button').find((b) => b.text() === '删除');
    expect(delBtn).toBeTruthy();
    await delBtn!.trigger('click');
    await flushPromises();
    await new Promise((r) => setTimeout(r, 0));
    expect(confirmMock).toHaveBeenCalled();
    expect(deleteVideoLinkage).toHaveBeenCalledWith('LKG-1');
  });
});
