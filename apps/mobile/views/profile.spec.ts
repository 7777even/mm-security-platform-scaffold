// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';

vi.mock('element-plus', () => ({
  ElMessage: { info: vi.fn() },
}));

import { ElMessage } from 'element-plus';
import { initAccessibilityModes } from '../composables/useAccessibilityModes';
import Profile from './profile.vue';

describe('移动端「我的」页', () => {
  beforeEach(() => {
    delete document.documentElement.dataset.skin;
    delete document.documentElement.dataset.elder;
    localStorage.clear();
    initAccessibilityModes();
    vi.mocked(ElMessage.info).mockClear();
  });
  afterEach(() => {
    delete document.documentElement.dataset.skin;
    delete document.documentElement.dataset.elder;
  });

  const mountProfile = () =>
    mount(Profile, {
      global: { stubs: { TabBar: true, RouterLink: true } },
    });

  it('渲染用户信息（姓名/角色）', () => {
    const w = mountProfile();
    expect(w.text()).toContain('张工');
    expect(w.text()).toContain('消防业务管理员 · 储运部 · MM-2018');
  });

  it('渲染 9 个功能菜单项', () => {
    const w = mountProfile();
    const items = w.findAll('.mb-menu-item');
    expect(items.length).toBe(9);
    const labels = items.map((i) => i.find('.mb-menu-label').text());
    expect(labels).toEqual([
      '通讯录',
      '今日值班',
      '应急预案',
      '化学品知识（MSDS）',
      '应急资源',
      '辅助资料库',
      '演练信息',
      '运维监测看板',
      '系统设置',
    ]);
  });

  it('渲染 2 个设置项', () => {
    const w = mountProfile();
    const items = w.findAll('.mb-setting-item');
    expect(items.length).toBe(2);
    const labels = items.map((i) => i.find('.mb-setting-label').text());
    expect(labels).toEqual(['适老模式', '户外模式']);
  });

  it('点击菜单项触发占位提示', async () => {
    const w = mountProfile();
    await w.findAll('.mb-menu-item')[0].trigger('click');
    expect(ElMessage.info).toHaveBeenCalled();
  });

  it('适老分段：渲染 标准/大/特大 三档', () => {
    const w = mountProfile();
    const seg = w.findAll('.mb-seg__btn');
    expect(seg.map((b) => b.text())).toEqual(['标准', '大', '特大']);
  });

  it('点击「大」设置根节点 data-elder=large', async () => {
    const w = mountProfile();
    const big = w.findAll('.mb-seg__btn').find((b) => b.text() === '大')!;
    await big.trigger('click');
    expect(document.documentElement.dataset.elder).toBe('large');
  });

  it('点击「特大」设置根节点 data-elder=xlarge', async () => {
    const w = mountProfile();
    const xl = w.findAll('.mb-seg__btn').find((b) => b.text() === '特大')!;
    await xl.trigger('click');
    expect(document.documentElement.dataset.elder).toBe('xlarge');
  });

  it('切换户外强光皮肤设置根节点 data-skin', async () => {
    const w = mountProfile();
    const sw = w.find('.mb-switch');
    expect(sw.exists()).toBe(true);
    await sw.trigger('click');
    expect(document.documentElement.dataset.skin).toBe('outdoor');
    await sw.trigger('click');
    expect(document.documentElement.dataset.skin).toBeUndefined();
  });
});
