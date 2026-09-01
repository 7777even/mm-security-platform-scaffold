/*
 * map-adapter.spec.ts — 脚手架地图接口数据 → 源项目覆盖层数据形状适配（TDD）
 * 对应 openspec/changes/screen-map-base-replace：
 * /map/alarms、/map/devices 的 MapPoint 映射为 HTML 覆盖层所需的
 * WorldMarkerAnchor（屏幕锚定）与 MonitoringPoint（监测点状态）形状。
 */
import { describe, expect, it } from 'vitest';
import { toWorldMarkers, toMonitoringPoints, type AdapterPoint } from '@/services/map-adapter';

const alarmPoint: AdapterPoint = {
  id: 'A-FB-1',
  name: '罐区-01 烟感报警',
  lng: 110.921,
  lat: 21.663,
  level: 1,
};

const devicePoint: AdapterPoint = {
  id: 'D-FB-1',
  name: '罐区-01 烟感',
  lng: 110.921,
  lat: 21.663,
  status: 'ONLINE',
};

describe('toWorldMarkers（MapPoint → WorldMarkerAnchor）', () => {
  it('空输入返回空数组', () => {
    expect(toWorldMarkers([], 'alarm')).toEqual([]);
  });

  it('映射 key 前缀与经纬度（lng→longitude, lat→latitude）', () => {
    const markers = toWorldMarkers([alarmPoint], 'alarm');
    expect(markers).toHaveLength(1);
    expect(markers[0]).toEqual({
      key: 'alarm:A-FB-1',
      longitude: 110.921,
      latitude: 21.663,
    });
  });

  it('不同 kind 的同 id 点位 key 不冲突', () => {
    const markers = toWorldMarkers([alarmPoint, devicePoint], 'alarm');
    void markers;
    const mixed = toWorldMarkers([{ ...devicePoint, id: 'A-FB-1' }], 'device');
    expect(mixed[0].key).toBe('device:A-FB-1');
  });

  it('过滤经纬度非法（NaN/Infinity）的点位', () => {
    const markers = toWorldMarkers(
      [
        { id: 'x1', name: 'x', lng: Number.NaN, lat: 21.663 },
        { id: 'x2', name: 'y', lng: 110.921, lat: Number.POSITIVE_INFINITY },
      ],
      'device',
    );
    expect(markers).toEqual([]);
  });

  it('height 字段可选透传', () => {
    const markers = toWorldMarkers([{ ...alarmPoint, height: 72 }], 'alarm');
    expect(markers[0].height).toBe(72);
  });
});

describe('toMonitoringPoints（MapPoint → MonitoringPoint 状态映射）', () => {
  it('空输入返回空数组', () => {
    expect(toMonitoringPoints([], 'device')).toEqual([]);
  });

  it('alarm 点位：level 1/2 → alarm，3/4 → warning，缺省 → alarm', () => {
    expect(toMonitoringPoints([{ ...alarmPoint, level: 1 }], 'alarm')[0].status).toBe('alarm');
    expect(toMonitoringPoints([{ ...alarmPoint, level: 2 }], 'alarm')[0].status).toBe('alarm');
    expect(toMonitoringPoints([{ ...alarmPoint, level: 3 }], 'alarm')[0].status).toBe('warning');
    expect(toMonitoringPoints([{ ...alarmPoint, level: 4 }], 'alarm')[0].status).toBe('warning');
    expect(toMonitoringPoints([{ ...alarmPoint, level: undefined }], 'alarm')[0].status).toBe(
      'alarm',
    );
  });

  it('device 点位：ONLINE → normal，FAULT → alarm，未知 → warning', () => {
    expect(toMonitoringPoints([{ ...devicePoint, status: 'ONLINE' }], 'device')[0].status).toBe(
      'normal',
    );
    expect(toMonitoringPoints([{ ...devicePoint, status: 'FAULT' }], 'device')[0].status).toBe(
      'alarm',
    );
    expect(toMonitoringPoints([{ ...devicePoint, status: 'OFFLINE' }], 'device')[0].status).toBe(
      'warning',
    );
    expect(toMonitoringPoints([{ ...devicePoint, status: undefined }], 'device')[0].status).toBe(
      'warning',
    );
  });

  it('映射基础字段并保留经纬度与名称', () => {
    const [point] = toMonitoringPoints([alarmPoint], 'alarm');
    expect(point.id).toBe('A-FB-1');
    expect(point.name).toBe('罐区-01 烟感报警');
    expect(point.longitude).toBe(110.921);
    expect(point.latitude).toBe(21.663);
    expect(point.category.length).toBeGreaterThan(0);
    expect(point.org.length).toBeGreaterThan(0);
  });

  it('过滤经纬度非法的点位', () => {
    expect(
      toMonitoringPoints([{ id: 'x', name: 'x', lng: Number.NaN, lat: 21 }], 'device'),
    ).toEqual([]);
  });
});
