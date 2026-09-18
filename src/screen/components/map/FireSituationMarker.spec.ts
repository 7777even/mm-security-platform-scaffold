// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import FireSituationMarker from './FireSituationMarker.vue';
import type { FireSituationMarkerItem } from '@/services/fireSituation';

// Cesium 屏幕锚点：本用例只验证标注结构与图标映射，直接给稳定坐标。
vi.mock('../../lib/composables/useCesiumScreenAnchor', () => ({
  useCesiumScreenAnchor: () => ({ anchorStyle: { left: '10px', top: '20px' } }),
}));

function makeItem(over: Partial<FireSituationMarkerItem> = {}): FireSituationMarkerItem {
  return {
    id: 'event-1',
    kind: 'event',
    title: '当前应急事件',
    subtitle: 'A装置区火灾处置中',
    longitude: 110.875,
    latitude: 21.6855,
    important: true,
    iconUrl: '/icons/fire-situation/flame.svg',
    level: '处置中',
    targetId: 1,
    ...over,
  };
}

describe('FireSituationMarker（消防态势点位 · 走公共 MapPointMarker）', () => {
  it('important 点位渲染状态标签条（等级 + 名称 + 副标题）', () => {
    const w = mount(FireSituationMarker, { props: { item: makeItem() } });
    expect(w.find('.map-point-marker__status').text()).toBe('处置中');
    expect(w.find('.map-point-marker__name').text()).toBe('当前应急事件');
    expect(w.find('.map-point-marker__sub').text()).toBe('A装置区火灾处置中');
  });

  it('非 important 点位不渲染标签条（避免同点位堆叠遮挡）', () => {
    const w = mount(FireSituationMarker, { props: { item: makeItem({ important: false }) } });
    expect(w.find('.map-point-marker__label').exists()).toBe(false);
    expect(w.find('.map-point-marker__pin').exists()).toBe(true);
  });

  it('色调按点位类型分级：事件/报警=红，作业=黄', () => {
    expect(mount(FireSituationMarker, { props: { item: makeItem() } }).classes()).toContain(
      'map-point-marker--danger',
    );
    expect(
      mount(FireSituationMarker, {
        props: { item: makeItem({ id: 'op-hot', kind: 'operation' }) },
      }).classes(),
    ).toContain('map-point-marker--warning');
  });

  it('图标收编到内置图标族：不再用 <img> 加载第三方 svg', () => {
    const w = mount(FireSituationMarker, { props: { item: makeItem() } });
    expect(w.find('.map-point-marker__pin img').exists()).toBe(false);
    const svg = w.find('.map-point-marker__pin svg.map-marker-icon');
    expect(svg.exists()).toBe(true);
    // flame.svg → fire（火焰）内置图标
    expect(svg.html()).toContain('M12 3.6');
  });

  it('气体类点位映射到既有 sensor-gas 图标（同一语义同一图标）', () => {
    const w = mount(FireSituationMarker, {
      props: {
        item: makeItem({
          id: 'alarm-2',
          kind: 'alarm',
          iconUrl: '/icons/fire-situation/gas.svg',
        }),
      },
    });
    expect(w.find('.map-point-marker__pin svg').html()).toContain('M7 16.5');
  });

  it('文件名未覆盖时按 kind 兜底（operation → helmet）', () => {
    const w = mount(FireSituationMarker, {
      props: {
        item: makeItem({
          id: 'op-x',
          kind: 'operation',
          iconUrl: '/icons/fire-situation/unknown.svg',
        }),
      },
    });
    // helmet 图标特征路径
    expect(w.find('.map-point-marker__pin svg').html()).toContain('M4.4 16.4');
  });

  it('点击点位抛 activate（承接详情面板）', async () => {
    const item = makeItem();
    const w = mount(FireSituationMarker, { props: { item } });
    await w.trigger('click');
    expect(w.emitted('activate')?.[0]).toEqual([item]);
  });
});
