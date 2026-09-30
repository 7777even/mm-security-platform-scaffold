// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import OverviewGridItem from './OverviewGridItem.vue';
import { OVERVIEW_ITEM_ACTION_META, type OverviewItemAction } from '../../lib/overviewItemAction';

// 生产应急左栏两类卡片交互（跨页跳转 / 就地展开）此前没有任何区分，跨页卡点下去整屏替换
// 很突兀。本用例锁定「角标 ↔ 交互语义」的映射，避免后续再出现漏标或文案漂移。

function mountItem(action?: OverviewItemAction) {
  return mount(OverviewGridItem, {
    props: { name: '重大危险源', count: 588, image: 'image_0012.png', action },
  });
}

describe('OverviewGridItem 交互语义角标', () => {
  it('未传 action 时不渲染角标（纯展示卡）', () => {
    const wrapper = mountItem();
    expect(wrapper.find('.overview-item__action').exists()).toBe(false);
  });

  it('navigate：实心「前往」角标 + 独立页面提示', () => {
    const wrapper = mountItem('navigate');
    const badge = wrapper.find('.overview-item__action');
    expect(badge.exists()).toBe(true);
    expect(badge.classes()).toContain('overview-item__action--navigate');
    expect(badge.find('.overview-item__action-glyph').text()).toBe(
      OVERVIEW_ITEM_ACTION_META.navigate.glyph,
    );
    expect(badge.find('.overview-item__action-label').text()).toBe(
      OVERVIEW_ITEM_ACTION_META.navigate.label,
    );
    expect(badge.attributes('title')).toBe('将打开独立页面');
  });

  it('expand：描边「展开」角标 + 就地展开提示', () => {
    const wrapper = mountItem('expand');
    const badge = wrapper.find('.overview-item__action');
    expect(badge.exists()).toBe(true);
    expect(badge.classes()).toContain('overview-item__action--expand');
    expect(badge.find('.overview-item__action-glyph').text()).toBe(
      OVERVIEW_ITEM_ACTION_META.expand.glyph,
    );
    expect(badge.find('.overview-item__action-label').text()).toBe(
      OVERVIEW_ITEM_ACTION_META.expand.label,
    );
    expect(badge.attributes('title')).toBe('在当前页展开列表');
  });

  it('两类角标的图标与文案互不相同（否则无法区分交互）', () => {
    const { navigate, expand } = OVERVIEW_ITEM_ACTION_META;
    expect(navigate.glyph).not.toBe(expand.glyph);
    expect(navigate.label).not.toBe(expand.label);
    expect(navigate.hint).not.toBe(expand.hint);
  });

  it('名称与计数照常渲染（角标不挤占）', () => {
    const wrapper = mountItem('navigate');
    expect(wrapper.find('.overview-item__name').text()).toBe('重大危险源');
    expect(wrapper.find('.overview-item__count').text()).toBe('588');
  });
});
