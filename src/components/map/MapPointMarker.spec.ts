// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import MapPointMarker from './MapPointMarker.vue';

describe('MapPointMarker（大屏统一点位标注）', () => {
  it('渲染标签条：徽标 + 名称 + 次行', () => {
    const w = mount(MapPointMarker, {
      props: { icon: 'device', status: '在线', name: '罐区A消防探头', sub: '罐区A' },
    });
    expect(w.find('.map-point-marker__status').text()).toBe('在线');
    expect(w.find('.map-point-marker__name').text()).toBe('罐区A消防探头');
    expect(w.find('.map-point-marker__sub').text()).toBe('罐区A');
  });

  it('无 status/name/sub 或 showLabel=false 时不渲染标签条', () => {
    expect(
      mount(MapPointMarker, { props: { icon: 'device' } })
        .find('.map-point-marker__label')
        .exists(),
    ).toBe(false);
    const w = mount(MapPointMarker, {
      props: { icon: 'device', status: '在线', name: 'x', showLabel: false },
    });
    expect(w.find('.map-point-marker__label').exists()).toBe(false);
  });

  it('column 布局：针 + 引线 + 呼吸点；pulse 布局：无引线', () => {
    const col = mount(MapPointMarker, { props: { icon: 'device' } });
    expect(col.classes()).toContain('map-point-marker--column');
    expect(col.find('.map-point-marker__stem').exists()).toBe(true);
    expect(col.find('.map-point-marker__breath').exists()).toBe(true);

    const pulse = mount(MapPointMarker, { props: { icon: 'sensor-gas', layout: 'pulse' } });
    expect(pulse.classes()).toContain('map-point-marker--pulse');
    expect(pulse.find('.map-point-marker__stem').exists()).toBe(false);
    expect(pulse.find('.map-point-marker__breath').exists()).toBe(true);
  });

  it('breath=false 时不渲染呼吸点', () => {
    const w = mount(MapPointMarker, { props: { icon: 'person', breath: false } });
    expect(w.find('.map-point-marker__breath').exists()).toBe(false);
  });

  it('tone 落到类名，默认 normal', () => {
    expect(mount(MapPointMarker, { props: { icon: 'device' } }).classes()).toContain(
      'map-point-marker--normal',
    );
    expect(
      mount(MapPointMarker, { props: { icon: 'device', tone: 'offline' } }).classes(),
    ).toContain('map-point-marker--offline');
  });

  it('interactive=true → <button> 且点击抛 activate', async () => {
    const w = mount(MapPointMarker, {
      props: { icon: 'patrol', interactive: true, ariaLabel: '查看巡检点' },
    });
    expect(w.element.tagName).toBe('BUTTON');
    await w.trigger('click');
    expect(w.emitted('activate')).toHaveLength(1);
  });

  it('interactive=false → <div> 且点击不抛事件', async () => {
    const w = mount(MapPointMarker, { props: { icon: 'device' } });
    expect(w.element.tagName).toBe('DIV');
    await w.trigger('click');
    expect(w.emitted('activate')).toBeUndefined();
  });

  it('非交互但带 title 时保留 tooltip（has-tooltip 类 → pointer-events 可命中）', () => {
    const withTitle = mount(MapPointMarker, { props: { icon: 'device', title: '罐区A探头' } });
    expect(withTitle.classes()).toContain('has-tooltip');
    expect(mount(MapPointMarker, { props: { icon: 'device' } }).classes()).not.toContain(
      'has-tooltip',
    );
  });

  it('针内可用内置图标或文本', () => {
    const withIcon = mount(MapPointMarker, { props: { icon: 'device' } });
    expect(withIcon.find('.map-point-marker__pin svg.map-marker-icon').exists()).toBe(true);

    const withText = mount(MapPointMarker, { props: { pinText: '◆' } });
    expect(withText.find('.map-point-marker__pin svg').exists()).toBe(false);
    expect(withText.find('.map-point-marker__pin').text()).toBe('◆');
  });

  it('active 高亮类生效', () => {
    expect(mount(MapPointMarker, { props: { icon: 'person', active: true } }).classes()).toContain(
      'is-active',
    );
  });
});
