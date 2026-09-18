// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import AccidentRescueMarkersOverlay from './AccidentRescueMarkersOverlay.vue';
import type { MonitoringPoint } from '@/services/map-data/monitoringPointsMock';
import type { EvacuationPerson } from '../../lib/data/evacuationPeopleMock';
import type { EmergencyDispatchResource } from '../../lib/data/accidentRescueMock';

// Cesium 相关依赖：本用例只验证标注结构，坐标给稳定值。
vi.mock('../../lib/composables/useCesiumScreenAnchor', () => ({
  useWorldMarkerScreenPositions: () => ({ styleFor: () => ({ left: '1px', top: '2px' }) }),
}));
vi.mock('../../lib/composables/sharedCesiumBridge', () => ({
  getSharedMap: () => null,
}));

const point = (over: Partial<MonitoringPoint> = {}): MonitoringPoint => ({
  id: 'mp-1',
  name: 'A装置区GDS-01',
  category: 'GDS',
  status: 'warning',
  lastTime: '2026-09-18 17:00',
  org: '炼油部',
  longitude: 110.87,
  latitude: 21.68,
  ...over,
});

const person = (over: Partial<EvacuationPerson> = {}): EvacuationPerson => ({
  id: 'p-1',
  name: '张三',
  org: '炼油部',
  job: '外操',
  longitude: 110.87,
  latitude: 21.68,
  ...over,
});

const resource = { name: '消防车 1#', code: 'XFC-01' } as EmergencyDispatchResource;

describe('AccidentRescueMarkersOverlay（走公共 MapPointMarker）', () => {
  it('监测点位：标签条 + 内置图标 + 状态色调，点击抛 focus-monitoring', async () => {
    const w = mount(AccidentRescueMarkersOverlay, {
      props: { monitoringPoints: [point()] },
    });
    expect(w.find('.map-point-marker__status').text()).toBe('预警');
    expect(w.find('.map-point-marker__name').text()).toBe('A装置区GDS-01');
    // GDS → sensor-gds 内置图标
    expect(w.find('.map-point-marker__pin svg').html()).toContain('M9.5 3.5');
    expect(w.find('.map-point-marker').classes()).toContain('map-point-marker--warning');
    await w.find('.map-point-marker').trigger('click');
    expect(w.emitted('focus-monitoring')?.[0]).toEqual([expect.objectContaining({ id: 'mp-1' })]);
  });

  it('告警状态 → danger 色调；正常状态 → normal 色调', () => {
    const alarm = mount(AccidentRescueMarkersOverlay, {
      props: { monitoringPoints: [point({ status: 'alarm' })] },
    });
    expect(alarm.find('.map-point-marker').classes()).toContain('map-point-marker--danger');
    const normal = mount(AccidentRescueMarkersOverlay, {
      props: { monitoringPoints: [point({ status: 'normal' })] },
    });
    expect(normal.find('.map-point-marker').classes()).toContain('map-point-marker--normal');
  });

  it('疏散人员：人形图标 + 名称标签，点击抛 focus-person', async () => {
    const w = mount(AccidentRescueMarkersOverlay, { props: { evacuationPeople: [person()] } });
    expect(w.find('.map-point-marker__name').text()).toBe('张三');
    expect(w.find('.map-point-marker__status').exists()).toBe(false);
    await w.find('.map-point-marker').trigger('click');
    expect(w.emitted('focus-person')?.[0]).toEqual([expect.objectContaining({ id: 'p-1' })]);
  });

  it('派发资源：◆ 文本针 + 「资源」徽标 + 高亮态且不可点击', async () => {
    const w = mount(AccidentRescueMarkersOverlay, { props: { dispatchResource: resource } });
    expect(w.find('.map-point-marker__status').text()).toBe('资源');
    expect(w.find('.map-point-marker__pin').text()).toBe('◆');
    expect(w.find('.map-point-marker').classes()).toContain('is-active');
    await w.find('.map-point-marker').trigger('click');
    expect(w.emitted('focus-monitoring')).toBeUndefined();
  });

  it('高亮态：focusedMonitoringId 命中时加 is-active', () => {
    const w = mount(AccidentRescueMarkersOverlay, {
      props: { monitoringPoints: [point()], focusedMonitoringId: 'mp-1' },
    });
    expect(w.find('.map-point-marker').classes()).toContain('is-active');
  });

  it('无数据时不渲染任何点位', () => {
    const w = mount(AccidentRescueMarkersOverlay, { props: {} });
    expect(w.find('.map-point-marker').exists()).toBe(false);
  });
});
