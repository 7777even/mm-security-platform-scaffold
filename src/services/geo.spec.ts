import { describe, it, expect } from 'vitest';
import * as Cesium from 'cesium';
import { parseWkt, wktToCartesians, wktCenter, renderGeoJson } from './geo';

describe('geo: WKT 解析（复用 one-brain-web wktUtils 能力）', () => {
  it('解析 POINT', () => {
    const g = parseWkt('POINT(114.23 23.45)');
    expect(g.type).toBe('Point');
    expect(g.coordinates[0]).toBeCloseTo(114.23);
    expect(g.coordinates[1]).toBeCloseTo(23.45);
  });

  it('解析 LINESTRING', () => {
    const g = parseWkt('LINESTRING(1 2, 3 4, 5 6)');
    expect(g.type).toBe('LineString');
    expect(g.coordinates).toHaveLength(3);
    expect(g.coordinates[1]).toEqual([3, 4]);
  });

  it('解析 POLYGON（取外环，忽略内环）', () => {
    const g = parseWkt('POLYGON((0 0, 0 1, 1 1, 1 0, 0 0))');
    expect(g.type).toBe('Polygon');
    expect(g.coordinates).toHaveLength(5);
    expect(g.coordinates[0]).toEqual([0, 0]);
  });

  it('解析 MULTIPOINT / MULTILINESTRING', () => {
    expect(parseWkt('MULTIPOINT(1 2, 3 4)').type).toBe('MultiPoint');
    const mls = parseWkt('MULTILINESTRING((1 2, 3 4),(5 6, 7 8))');
    expect(mls.type).toBe('MultiLineString');
    expect(mls.coordinates).toHaveLength(2);
  });

  it('非法 WKT 抛错', () => {
    expect(() => parseWkt('HELLO')).toThrow();
  });
});

describe('geo: WKT → Cartesians / 中心', () => {
  it('wktToCartesians 长度与高程', () => {
    const c = wktToCartesians('LINESTRING(1 2, 3 4)', 10);
    expect(c).toHaveLength(2);
    // 高程为 WGS84 大地高，需经 Cartographic 取回，而非 Cartesian3 的 ECEF z 分量
    const h = Cesium.Cartographic.fromCartesian(c[0]).height;
    expect(h).toBeCloseTo(10, 1);
  });

  it('wktCenter 取坐标均值（与 cesium.ts 区域质心逻辑一致）', () => {
    // 四顶点无重复（避免首尾相同顶点拉偏均值）
    const [x, y, z] = wktCenter('POLYGON((0 0, 0 2, 2 2, 2 0))', 5);
    expect(x).toBeCloseTo(1);
    expect(y).toBeCloseTo(1);
    expect(z).toBe(5);
  });
});

describe('geo: renderGeoJson（替身 viewer，不渲染）', () => {
  it('按几何类型创建实体并支持 remove()', () => {
    const added: Cesium.Entity[] = [];
    const fakeViewer = {
      entities: {
        add: (e: Cesium.Entity) => {
          added.push(e);
          return e;
        },
        remove: () => true,
      },
      scene: { primitives: { add: () => ({}) as Cesium.Primitive, remove: () => true } },
    };
    const features = [
      {
        type: 'Feature',
        properties: { name: 'P' },
        geometry: { type: 'Point', coordinates: [110.95, 21.6] },
      },
      {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: [
            [110.95, 21.6],
            [110.96, 21.61],
          ],
        },
      },
      {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [110.95, 21.6],
              [110.96, 21.6],
              [110.96, 21.61],
              [110.95, 21.6],
            ],
          ],
        },
      },
      {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'MultiLineString',
          coordinates: [
            [
              [110.95, 21.6],
              [110.96, 21.61],
            ],
            [
              [110.95, 21.62],
              [110.96, 21.63],
            ],
          ],
        },
      },
    ] as Parameters<typeof renderGeoJson>[1];
    const res = renderGeoJson(fakeViewer as never, features);
    expect(res.entities.length).toBeGreaterThanOrEqual(4);
    expect(added.length).toBeGreaterThanOrEqual(4);
    // 清理不抛错
    expect(() => res.remove()).not.toThrow();
  });
});
